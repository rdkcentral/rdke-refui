/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

import ThunderJS from 'ThunderJS';
import { CONFIG } from '../Config/Config';

class XcastApi {
  static _instance = null;

  constructor() {
    if (XcastApi._instance) return XcastApi._instance;

    this._thunder = ThunderJS(CONFIG.thunderConfig);
    this.logtag = "XcastApi:";
    this.LOG = console.log;
    this.ERR = console.error;
    this.INFO = console.info;
    this.callsign = "org.rdk.Xcast";
    this._events = new Map();
    this._registeredApps = [];

    XcastApi._instance = this;
  }

  static getInstance() {
    if (!XcastApi._instance) {
      XcastApi._instance = new XcastApi();
    }
    return XcastApi._instance;
  }

  /**
   * Universal optimized call wrapper.
   * Leverages ThunderJS native Promise chains.
   */
  async _call(method, params = {}) {
    try {
      const result = await this._thunder.call(this.callsign, method, params);
      this.INFO(`${this.logtag} ${method} result: ${JSON.stringify(result)}`);
      if (result !== undefined && result !== null) {
        return result;
      }
      throw new Error("Empty or invalid payload received");
    } catch (err) {
      this.ERR(`${this.logtag} ${method} error: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  // --- XCast Registered App List ---
  getRegisteredApps() {
    return Promise.resolve(this._registeredApps);
  }

  resetRegisteredApps() {
    this._registeredApps = [];
  }

  updateRegisteredApps(payload) {
    if (payload && payload.applications.length > 0) {
      for (const app of payload.applications) {
        let updated = false;
        // app = {"name":"YouTube","appid":"com.rdkcentral.youtube-exp","prefix":"myYouTube","cors":".youtube.com","allowStop":true,"query":"source_type=12"}
        // replace this._registeredApps if it has the same name & appid
        this._registeredApps.forEach(element => {
          this.LOG(this.logtag + " updateRegisteredApps: comparing " + JSON.stringify(element) + " with " + JSON.stringify(app));
          if (element.name === app.name && element.appid === app.appid) {
            element = app;
            updated = true;
          }
        });
        if (!updated) {
          this._registeredApps.push(app);
        }
      }
    }
    this.LOG(this.logtag + " updateRegisteredApps: _registeredApps is " + JSON.stringify(this._registeredApps));
  }

  removeRegisteredApps(appNames = []) {
    if (appNames && appNames.length > 0) {
      this._registeredApps.forEach((element, index) => {
        this.LOG(this.logtag + " removeRegisteredApps: comparing " + JSON.stringify(element) + " with " + JSON.stringify(appNames));
        if (appNames.includes(element.name)) {
          this._registeredApps.splice(index, 1);
        }
      });
    }
    this.LOG(this.logtag + " removeRegisteredApps: _registeredApps is " + JSON.stringify(this._registeredApps));
  }

  // --- Core API Abstractions ---

  getEnabled() {
    return this._call('getEnabled');
  }

  async getFriendlyName() {
    const res = await this._call('getFriendlyName').catch(() => null);
    return res?.friendlyname || null;
  }

  async getManufacturerName() {
    const res = await this._call('getManufacturerName').catch(() => null);
    return res?.manufacturer || null;
  }

  async getModelName() {
    const res = await this._call('getModelName').catch(() => null);
    return res?.model || null;
  }

  async getProtocolVersion() {
    const res = await this._call('getProtocolVersion').catch(() => null);
    return res?.version || null;
  }

  async getStandbyBehavior() {
    const res = await this._call('getStandbyBehavior').catch(() => null);
    return res?.standbybehavior || null;
  }

  /**
   * @param {"applications":[{"name":"YouTube","appid":"com.rdkcentral.youtube-exp","prefix":"myYouTube","cors":".youtube.com","allowStop":true,"query":"source_type=12"}]}
   */
  registerApplications(params) {
    return this._call('registerApplications', params)
      .then((result) => {
        this.updateRegisteredApps(params);
        return result;
      })
      .catch(() => false);
  }

  setApplicationState(params) {
    return this._call('setApplicationState', params).catch(() => false);
  }

  setEnabled(enable) {
    return this._call('setEnabled', { enabled: !!enable });
  }

  setFriendlyName(friendlyname) {
    return this._call('setFriendlyName', { friendlyname }).catch(() => false);
  }

  setManufacturerName(manufacturer) {
    return this._call('setManufacturerName', { manufacturer }).catch(() => false);
  }

  setModelName(model) {
    return this._call('setModelName', { model }).catch(() => false);
  }

  setStandbyBehavior(standbybehavior) {
    return this._call('setStandbyBehavior', { standbybehavior }).catch(() => false);
  }

  /**
   * @param {string[]} appNames
   * @returns
   */
  unregisterApplications(appNames = []) {
    return this._call('unregisterApplications', { appNames })
      .then((result) => {
        this.removeRegisteredApps(appNames);
        return result;
      })
      .catch(() => false);
  }

  static supportedApps() {
    return { AmazonInstantVideo: 'Amazon', YouTube: 'YouTube', Netflix: 'Netflix', YouTubeTV: "YouTubeTV" };
  }
}

// Instantiate Singleton Base Instance
const instance = XcastApi.getInstance();

/**
 * Proxy Wrapper over the instance default export.
 * Dynamically resolves class level static method calls without boilerplate mapping code.
 */
const proxyHandler = {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return target[prop].bind(target);
    }
    if (target.constructor && typeof target.constructor[prop] === 'function') {
      return target.constructor[prop].bind(target.constructor);
    }
    return target[prop];
  }
};

export default new Proxy(instance, proxyHandler);
