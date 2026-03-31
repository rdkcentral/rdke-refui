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

import DownloadManager from './DownloadManagerApi';
import PackageManager from './PackageManagerApi';
import AppManager from './AppManagerApi';
import AppController from '../AppController';
import { ThunderError } from './ThunderError';
import { Metrics } from '@firebolt-js/sdk'
import { SIDELOADED_APP_DEFAULT_ICON, deriveNameFromPackageId } from '../helpers/DACAppPresentation'
import { getApps, getAppDetails, makeDownloadURL } from './AppCatalog';

// the size that is assumed if it is not possible to retrieve package size
// from the server, according to server API this should never happen
const DEFAULT_SIZE = 1000000;

// how many applications to request in one call
const APPS_REQUEST_LIMIT = 200;
// the maximum number of requests to retrieve apps
const APPS_REQUESTS_MAX = 5;

const APP_DETAILS_KEY = "refui.details";

function makeLogMessage(call, err) {
  return err.toString() + " <=> " + call;
}

function logWarning(call, err) {
  console.warn(makeLogMessage(call, err));
}

function logError(call, err) {
  let errMessage = makeLogMessage(call, err);
  console.error(errMessage);
  Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", errMessage, false, null);
}

class OperationLock {
  constructor() {
    this.prev = Promise.resolve();
  }

  lock() {
    let unlock;
    const next = new Promise(resolve => {
      unlock = resolve;
    });
    const result = this.prev.then(() => unlock);
    this.prev = next;
    return result;
  }
};

let packageLock = new OperationLock();

export async function getAppCatalogInfo() {
  let result = [];
  let offset = 0;

  for (let i = 0; i < APPS_REQUESTS_MAX; ++i) {
    try {
      const appsResponse = await getApps(offset, APPS_REQUEST_LIMIT);
      if (!Array.isArray(appsResponse?.applications)) {
        break;
      }
      result = result.concat(appsResponse.applications);
      if (result.length >= (appsResponse?.meta?.resultSet?.total ?? 0)) {
        break;
      }
      offset = result.length;
    } catch (err) {
      Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", err.toString(), false, null);
      break;
    }
  }

  return result;
}

function retrieveURLAndSize(details) {
  if (typeof details?.header?.url === "string") {
    const url = details.header.url;
    let size = DEFAULT_SIZE;

    if (typeof details.header.size === "number") {
      size = details.header.size;
    }

    return { url, size };
  }

  throw new Error(`No URL in details: ${JSON.stringify(details)}`);
}

async function isPackageInstalled(id, version) {
  let result = false;

  try {
    const packageState = await PackageManager.get().packageState(id, version);
    result = (packageState === "INSTALLED");
  } catch (err) {
    logWarning(`isPackageInstalled()`, err);
  }

  return result;
}

async function downloadAndInstall(pkg, downloadedSize, totalSize, progress) {
  console.log(`downloadAndInstall(${pkg.url}, ${pkg.size})`);

  const downloadId = await new Promise(async (resolve, reject) => {
    try {
      const downloadURL = await makeDownloadURL(pkg.url);
      await DownloadManager.get().download(downloadURL, (downloadId, percent, failReason) => {
        if (!failReason) {
          if (percent !== 100) {
            progress((downloadedSize + pkg.size * percent / 100) / totalSize, "Downloading");
          } else {
            resolve(downloadId);
          }
        } else {
          reject(failReason);
        }
      });
    } catch (err) {
      reject(err);
    }
  });

  let errResult = null;

  const fileLocator = DownloadManager.get().getFileLocator(downloadId);
  if (!fileLocator) {
    throw new Error(`Missing file locator for downloadId ${downloadId}`);
  }

  try {
    let installResult = await PackageManager.get().install(
      pkg.id, pkg.version, fileLocator,
    );

    if (installResult !== "NONE") {
      errResult = new Error(installResult);
    }
  } catch (err) {
    logError(`install(${pkg.id}, ${pkg.version})`, err);
    errResult = err;
  }

  try {
    await DownloadManager.get().delete(downloadId);
  } catch (err) {
    logWarning(`delete(${downloadId})`, err);
  }

  try {
    await AppManager.get().setAppProperty(pkg.id, APP_DETAILS_KEY, JSON.stringify(pkg.details));
  } catch (err) {
    logWarning(`downloadAndInstall(${pkg.id})`, new ThunderError("setAppProperty()", err));
  }

  if (errResult) {
    throw errResult;
  }

  return true;
}

export async function installDACApp(app, progressElement) {
  let result = false;

  console.log(`installDACApp ${JSON.stringify(app)}`);

  const unlock = await packageLock.lock();

  function progress(percent, state) {
    progressElement.setProgress(percent, state);
  }

  function success() {
    if (progressElement && typeof progressElement.fireAncestors === 'function') {
      progressElement.fireAncestors('$fireDACOperationFinished', true);
    }
  }

  try {
    const appDetails = await getAppDetails(app.id, app.version);
    const packages = [];
    let totalSize = 0;

    if (typeof appDetails?.dependencies === "object") {
      for (const id in appDetails.dependencies) {
        const version = appDetails.dependencies[id];
        if (!await isPackageInstalled(id, version)) {
          const depDetails = await getAppDetails(id, version);
          packages.push(Object.assign(
            retrieveURLAndSize(depDetails),
            { id, version, details: depDetails }
          ));
          totalSize += packages.at(-1).size;
        } else {
          console.log(`Package ${id}+${version} is already installed`);
        }
      }
    }

    packages.push(Object.assign(
      retrieveURLAndSize(appDetails),
      { id: app.id, version: app.version, details: appDetails }
    ));
    totalSize += packages.at(-1).size;

    let downloadedSize = 0;
    for (let pkg of packages) {
      await downloadAndInstall(pkg, downloadedSize, totalSize, progress);
      downloadedSize += pkg.size;
    }
    success();
    result = true;
  } catch (err) {
    app.errorCode = err?.cause?.code ?? -2;
    logError(`installDACApp(${app.id})`, err);
  } finally {
    unlock();
  }

  return result;
}

export async function isDACAppInstalled(app) {
  let result = false;
  try {
    result = await AppManager.get().isInstalled(app.id);
  } catch (err) {
    logWarning(`isDACAppInstalled(${app.id})`, new ThunderError("isInstalled()", err));
  }
  return result;
}

export async function uninstallDACApp(app, progressElement) {
  let result = false;

  console.log(`uninstallDACApp ${JSON.stringify(app)}`);

  const unlock = await packageLock.lock();

  function success() {
    if (progressElement && typeof progressElement.fireAncestors === 'function') {
      progressElement.fireAncestors('$fireDACOperationFinished', true);
    }
  }

  try {
    await AppManager.get().terminateApp(app.id);
  } catch (err) {
    logWarning(`uninstallDACApp(${app.id})`, new ThunderError("terminateApp()", err));
  }

  try {
    await PackageManager.get().uninstall(app.id);
    // Clear from in-memory cache
    if (app.version) {
      const key = app.id + ":" + app.version;
      storedAppInfoCache.delete(key);
    } else {
      // If version is not provided, remove all cached entries for this app id
      const prefix = app.id + ":";
      for (const cacheKey of storedAppInfoCache.keys()) {
        if (cacheKey.startsWith(prefix)) {
          storedAppInfoCache.delete(cacheKey);
        }
      }
    }
    success();
    result = true;
  } catch (err) {
    app.errorCode = err?.cause?.code ?? -2;
    logError(`uninstall(${app.id})`, err);
  } finally {
    unlock();
  }

  return result;
}

const storedAppInfoCache = new Map();

export async function getInstalledDACApps() {
  const result = [];
  console.log("getInstalledDACApps()");

  try {
    const packages = await PackageManager.get().listPackages();

    for (const pkg of packages) {
      // Skip packages that are not installed
      if (pkg.state !== "INSTALLED") {
        continue;
      }

      const key = pkg.packageId + ":" + pkg.version;
      let storedAppInfo = storedAppInfoCache.get(key);

      if (!storedAppInfo) {
        try {
          let cachedAppDetails = null;
          try {
            cachedAppDetails = JSON.parse(await AppManager.get().getAppProperty(pkg.packageId, APP_DETAILS_KEY));
          } catch (err) {
            logWarning("getInstalledDACApps()", new ThunderError(`getAppProperty(${pkg.packageId})`, err));
          }

          let appDetails = null;
          try {
            appDetails = await getAppDetails(pkg.packageId, pkg.version);
          } catch (err) {
            logWarning("getInstalledDACApps()", err);
          }

          // Use server name, then cached name, then derive from packageId for sideloaded apps
          const resolvedName = appDetails?.header?.name
            ?? cachedAppDetails?.header?.name
            ?? deriveNameFromPackageId(pkg.packageId);

          storedAppInfo = {
            name: resolvedName,
            icon: appDetails?.header?.icon ?? cachedAppDetails?.header?.icon ?? SIDELOADED_APP_DEFAULT_ICON,
          }
          storedAppInfoCache.set(key, storedAppInfo);
        } catch (err) {
          logError(`getAppDetails(${pkg.packageId}, ${pkg.version})`, err);
        }
      }

      if (storedAppInfo?.name) {
        result.push({
          id: pkg.packageId,
          version: pkg.version,
          name: storedAppInfo.name,
          installed: [{
            appName: storedAppInfo.name,
            version: pkg.version,
          }],
        });
        if (storedAppInfo.icon) {
          result.at(-1).icon = storedAppInfo.icon;
        }
      }
    }
  } catch (err) {
    logError("getInstalledDACApps()", err);
  }

  return result;
}

export async function startDACApp(app) {
  let result = false;
  console.log(`startDACApp ${JSON.stringify(app)}`);

  try {
    await AppController.get().launch(app.id);
    result = true;
  } catch (err) {
    logError(`startDACApp(${app.id})`, new ThunderError("launchApplication()", err));
  }

  return result;
}
