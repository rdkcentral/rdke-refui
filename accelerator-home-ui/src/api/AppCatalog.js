/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import PackageManager from './PackageManagerApi';
import AppApi from './AppApi';

const APP_DEFAULT_ARCH = "arm";
const APP_STORE_RFC_KEY = "Device.DeviceInfo.X_RDKCENTRAL-COM_RFC.DAC.ConfigURL";

const debug = false;

let appCatalogHandler = null;

export const eventTarget = new EventTarget();

export class AuthNeeded extends Event {
  static eventName = 'authNeeded';

  constructor() {
    super(AuthNeeded.eventName);
  }
}

export class RefreshNeeded extends Event {
  static eventName = 'refreshNeeded';

  constructor() {
    super(RefreshNeeded.eventName);
  }
}

class AuthExpiredError extends Error {
  constructor(url) {
    super(`Authentication expired (${url})`);
    this.name = 'AuthExpiredError';
  }
}

class PromiseQueue {
  constructor() {
    this.next = Promise.resolve();
  }

  enqueue(fn) {
    let unlock;
    const next = new Promise(resolve => { unlock = resolve; });
    const result = this.next.then(fn);
    result.then(unlock, unlock);
    this.next = next;
    return result;
  }
}

async function getConfigUrlFromRFC() {
  try {
    const appApi = new AppApi();
    console.log("Resolving config URL from RFC ");
    const result = await appApi.getRFCConfig(APP_STORE_RFC_KEY);
    const rfcUrl = result?.RFCConfig?.[APP_STORE_RFC_KEY];
    if (typeof rfcUrl === "string" && rfcUrl.trim().length > 0) {
      const resolvedConfigUrl = rfcUrl.trim();
      console.log("Resolved config URL from RFC ");
      return resolvedConfigUrl;
    }
    console.warn("Config RFC URL empty or invalid");
    return null;
  } catch (err) {
    console.error("Failed to get config URL from RFC", err);
    return null;
  }
}

async function getConfigUrlFromPackageManager() {
  try {
    console.log("Resolving config URL from PackageManager...");
    const config = await PackageManager.get().configuration();
    console.log("Resolved server config URL from PackageManager: ");
    if (typeof config?.configUrl !== "string" || config.configUrl.trim().length === 0) {
      throw new Error("Invalid config: " + JSON.stringify(config));
    }

    return config.configUrl.trim();
  } catch (err) {
    console.error("Failed to resolve config URL from PackageManager", err);
    throw err;
  }
}

let serverURL = null;
let serverURLPromise = null;

async function getServerURL() {
  if (!serverURL) {
    if (!serverURLPromise) {
      async function resolve() {
        let url = await getConfigUrlFromRFC();

        if (!url) {
          url = await getConfigUrlFromPackageManager();
        }
        console.log(`Server URL: ${url}`);
        return url;
      }

      serverURLPromise = resolve();
    }

    try {
      serverURL = await serverURLPromise;
    } catch (err) {
      serverURLPromise = null;
      throw err;
    }
  }

  return serverURL;
}

class StubAppCatalogHandler {
  getApps(offset, limit) {
    return { applications: [] };
  }

  getAppDetails(id, version) {
    throw new Error('getAppDetails() is not supported');
  }

  makeDownloadURL(url) {
    throw new Error('makeDownloadURL() is not supported');
  }
}

class LegacyAppCatalogHandler {
  constructor(configURL) {
    this.configURL = configURL;
    this.storeConfig = null;
  }

  async getStoreConfig() {
    if (!this.storeConfig) {
      let resolvedConfigUrl = this.configURL;

      const fetchResponse = await fetch(resolvedConfigUrl);
      if (!fetchResponse.ok) {
        throw new Error(`Unexpected response: ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }
      const responseObject = await fetchResponse.json();

      if (typeof responseObject?.["appstore-catalog"]?.url !== "string") {
        throw new Error("Invalid response object: " + JSON.stringify(responseObject));
      }
      const catalog = responseObject["appstore-catalog"];
      this.storeConfig = { url: catalog.url };

      if (typeof catalog?.authentication?.user === "string" &&
        typeof catalog?.authentication?.password === "string") {
        this.storeConfig.authHeader =
          "Basic " + btoa(catalog.authentication.user + ':' + catalog.authentication.password);
      }
    }

    return this.storeConfig;
  }

  async fetchStoreObject(request) {
    let config = await this.getStoreConfig();
    let headers = new Headers();

    if (config.authHeader) {
      headers.append("Authorization", config.authHeader);
    }

    let requestOptions = {
      method: 'GET',
      headers,
      redirect: 'follow',
    };

    const fetchResponse = await fetch(config.url + request, requestOptions);
    if (!fetchResponse.ok) {
      throw new Error(`Unexpected response: ${fetchResponse.status}: ${fetchResponse.statusText}`);
    }

    return fetchResponse.json();
  }

  getAppDetails(id, version) {
    return this.fetchStoreObject("/apps/" + id + ":" + version + "?arch=" + APP_DEFAULT_ARCH);
  }

  async getApps(offset, limit) {
    const request = "/apps?arch=" + APP_DEFAULT_ARCH + "&offset=" + offset + "&limit=" + limit;

    try {
      return await this.fetchStoreObject(request);
    } catch (err) {
      console.error(`fetchStoreObject(${request}) ${err}`);
      throw err;
    }
  }

  makeDownloadURL(url) {
    return url;
  }
}

class AppCatalogHandler {
  constructor(serverURL) {
    this.serverURL = serverURL;
    this.authURL = this.serverURL + '/auth';
    this.appCatalogURL = this.serverURL + '/appcatalog';
    this.timerId = null;
    this.queue = new PromiseQueue();
  }

  async fetch(url, options) {
    const response = await this.queue.enqueue(() => fetch(url, { credentials: 'include', ...options }));
    if (response.status === 401 || response.status === 403) {
      this.cancelRefresh();
      throw new AuthExpiredError(url);
    }
    if (!response.ok) {
      throw new Error(`Unexpected response: ${response.status}: ${response.statusText} (${url})`);
    }
    return response;
  }

  async postAuthObject(request, obj) {
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(obj),
    };

    const url = this.authURL + request;
    const response = await this.fetch(url, options);
    const responseObj = await response.json();
    if (debug) {
      console.log(`Auth response: ${JSON.stringify(responseObj, null, 2)}`);
    }
    return responseObj;
  }

  calculateTimeout(expiresIn) {
    const MIN = 60;
    const MAX = 4 * 60 * 60; // 4 hours

    let timeout = Math.min(Math.max(expiresIn / 2, MIN), MAX);

    if (debug) {
      console.log(`Calculated timeout: ${timeout}`);
    }

    return timeout * 1000;
  }

  scheduleRefresh(response, onAuthExpired) {
    if (typeof response.expiresIn !== "number") {
      return;
    }
    const expiresIn = response.expiresIn;

    this.cancelRefresh();

    this.timerId = setTimeout(async () => {
      this.timerId = null;
      try {
        const refreshResponse = await this.refresh();
        this.scheduleRefresh(refreshResponse, onAuthExpired);
      } catch (err) {
        console.warn(`Refresh failed: ${err}`);
        onAuthExpired();
      }
    }, this.calculateTimeout(expiresIn));
  }

  cancelRefresh() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  async refresh() {
    return this.postAuthObject('/refresh', {});
  }

  async login(user, pass) {
    this.cancelRefresh();
    return this.postAuthObject('/login', { username: user, password: pass });
  }

  async fetchAppCatalogObject(request) {
    const url = this.appCatalogURL + request;
    const fetchResponse = await this.fetch(url, { method: 'GET', redirect: 'follow' });
    const result = await fetchResponse.json();
    if (debug) {
      console.log(`${url} : ${JSON.stringify(result, null, 2)}`);
    }
    return result;
  }

  async getAppDetails(id, version) {
    return this.fetchAppCatalogObject("/apps/" + id + ":" + version + "?arch=" + APP_DEFAULT_ARCH);
  }

  async getApps(offset, limit) {
    const request = "/apps?arch=" + APP_DEFAULT_ARCH + "&offset=" + offset + "&limit=" + limit;

    try {
      return await this.fetchAppCatalogObject(request);
    } catch (err) {
      console.error(`fetchAppCatalogObject(${request}) ${err}`);
      throw err;
    }
  }

  async getServiceToken(token) {
    const url = this.authURL + "/servicetokens/" + token;
    const response = await this.fetch(url, { method: 'GET', redirect: 'follow' });
    const result = await response.json();
    if (debug) {
      console.log(`${url}: ${JSON.stringify(result, null, 2)}`);
    }
    return result;
  }

  async makeDownloadURL(url) {
    const token = await this.getServiceToken('download-manager');
    const downloadURL = new URL(url);
    downloadURL.searchParams.set('token', token.token);
    return downloadURL.toString();
  }
}

let initPromise = null;

function handleAuthExpired(handler) {
  if (appCatalogHandler === handler) {
    appCatalogHandler = new StubAppCatalogHandler();
    eventTarget.dispatchEvent(new AuthNeeded());
  }
}

async function callAndHandleAuthExpired(handler, fn) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthExpiredError) {
      handleAuthExpired(handler);
    }
    throw err;
  }
}

async function initAppCatalogHandler() {
  if (!initPromise) {
    async function init() {
      appCatalogHandler = new StubAppCatalogHandler();

      try {
        const url = await getServerURL();

        if (url.endsWith('/cpe.json')) {
          appCatalogHandler = new LegacyAppCatalogHandler(url);
          return;
        }

        const handler = new AppCatalogHandler(url);
        const refreshResponse = await handler.refresh();
        handler.scheduleRefresh(refreshResponse, () => handleAuthExpired(handler));
        appCatalogHandler = handler;
      } catch (err) {
        console.log(`initAppCatalogHandler() ${err}`);
        if (err instanceof AuthExpiredError) {
          eventTarget.dispatchEvent(new AuthNeeded());
        } else {
          throw err;
        }
      }
    }

    initPromise = init().catch(() => {
      initPromise = null;
    });
  }
  return initPromise;
}

export async function isLoggedIn() {
  await initAppCatalogHandler();
  return appCatalogHandler instanceof AppCatalogHandler;
}

export async function login(user, pass) {
  await initAppCatalogHandler();

  const handler = appCatalogHandler instanceof AppCatalogHandler
    ? appCatalogHandler
    : new AppCatalogHandler(await getServerURL());

  try {
    const loginResponse = await handler.login(user, pass);
    if (!loginResponse || typeof loginResponse.expiresIn !== 'number') {
      console.warn('Login failed: invalid response from server', loginResponse);
      return false;
    }
    appCatalogHandler = handler;
    handler.scheduleRefresh(loginResponse, () => handleAuthExpired(handler));
    eventTarget.dispatchEvent(new RefreshNeeded());
    return true;
  } catch (err) {
    console.warn(`Login failed: ${err}`);
    return false;
  }
}

export async function getApps(offset, limit) {
  await initAppCatalogHandler();
  const handler = appCatalogHandler;
  return callAndHandleAuthExpired(handler, () => handler.getApps(offset, limit));
}

export async function getAppDetails(id, version) {
  await initAppCatalogHandler();
  const handler = appCatalogHandler;
  return callAndHandleAuthExpired(handler, () => handler.getAppDetails(id, version));
}

export async function makeDownloadURL(url) {
  await initAppCatalogHandler();
  const handler = appCatalogHandler;
  return callAndHandleAuthExpired(handler, () => handler.makeDownloadURL(url));
}

export async function getCatalogServerURL() {
  return getServerURL();
}
