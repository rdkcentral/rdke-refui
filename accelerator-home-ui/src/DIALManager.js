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

import XcastApi from '../src/api/XcastApi';
import AppApi from '../src/api/AppApi.js';
import { GLOBALS } from './Config/Config.js';
import AppController from './AppController.js';
import { ThunderError } from './api/ThunderError.js';

const appApi = new AppApi();
let instance = null;

const DIAL_APPS = {
  "YouTube": {
    id: "com.rdkcentral.youtube-exp",
    url: "https://www.youtube.com/tv",
    cors: ".youtube.com",
  }
};

export default class DIALManager {
  /**
   * @returns {DIALManager}
   */
  static get() {
    if (instance === null) {
      instance = new DIALManager();
    }

    return instance;
  }

  /** @private */
  appController = AppController.get();
  /** @private */
  xcastApi = new XcastApi();
  /** @private */
  started = false;

  /** @private */
  constructor() {
    const DEBUG = false;

    const PREFIX = "DIALManager: ";
    const debug = (fnc, ...args) => {
      fnc(PREFIX + args.join(" - "));
    };

    this.ERR = debug.bind(null, console.error);
    this.WARN = debug.bind(null, console.warn);

    if (DEBUG) {
      this.INFO = debug.bind(null, console.info);
      this.LOG = debug.bind(null, console.log);
    } else {
      this.INFO = this.LOG = () => { };
    }
  }

  /**
   * @param {string} applicationName
   * @param {import('./AppController.js').AppState} appControllerState
   */
  async setApplicationState(applicationName, appControllerState) {
    let state = 'stopped';

    switch (appControllerState) {
      case 'APP_STATE_INITIALIZING':
        break;
      case 'APP_STATE_ACTIVE':
        state = 'running';
        break;
      case 'APP_STATE_PAUSED':
      case 'APP_STATE_SUSPENDED':
      case 'APP_STATE_HIBERNATED':
        state = 'suspended';
        break;
      case 'APP_STATE_TERMINATING':
        break;
      default:
        this.ERR(`Received invalid state: ${appControllerState} for ${applicationName}`);
        break;
    }

    const appState = {
      applicationName,
      state,
    };

    this.LOG(`Set ${applicationName} state to ${state}`);

    try {
      const status = await this.xcastApi.setApplicationState(appState);
      if (status == false) {
        throw new Error("Got false");
      }
    } catch (err) {
      this.ERR(`setApplicationState() failed ${err}`);
    }
  }

  /**
   * @returns {Promise<any>}
   */
  async start() {
    if (this.started) {
      throw new Error("DIALManager already started!");
    }

    this.started = true;

    if (!await this.xcastApi.activate()) {
      throw new Error("XcastApi activatation failed");
    }

    this.registerXcastListeners();

    const serialNumber = await appApi.getSerialNumber().catch(() => "") || "DefaultSLNO";
    const model = await this.xcastApi.getModelName().catch(() => "") || ("RDK" + GLOBALS.deviceType);
    const friendlyName = model + (serialNumber.length < 6 ? serialNumber : serialNumber.slice(-6));

    this.LOG(`Set friendly name to: ${friendlyName}`);

    await appApi.setFriendlyName(friendlyName).catch(err => {
      const terr = new ThunderError(`appApi.setFriendlyName(${friendlyName})`, err);
      this.ERR(`DIALManager.start() ${terr}`);
    });

    await this.xcastApi.setEnabled(true).then(() => {
      GLOBALS.LocalDeviceDiscoveryStatus = true;
    }).catch(err => {
      GLOBALS.LocalDeviceDiscoveryStatus = false;
      const terr = new ThunderError(`xcastApi.setStandbyBehavior("active")`, err);
      this.ERR(`DIALManager.start() ${terr}`);
    });

    await this.xcastApi.setStandbyBehavior("active").catch(err => {
      const terr = new ThunderError(`xcastApi.setStandbyBehavior("active")`, err);
      this.ERR(`DIALManager.start() ${terr}`);
    });

    let params = {
      "applications": []
    };

    for (const appName in DIAL_APPS) {
      try {
        if (await this.appController.isPackageInstalled(DIAL_APPS[appName].id)) {
          params.applications.push({
            name: appName,
            cors: DIAL_APPS[appName].cors,
          });
        }
      } catch (err) {
        this.ERR(`DIALManager.start() ${err}`);
      }
    }

    this.INFO(`Register DIAL apps: ${JSON.stringify(params)}`);

    await this.xcastApi.registerApplications(params).catch(err => {
      const terr = new ThunderError(`xcastApi.registerApplications())`, err);
      this.ERR(`DIALManager.start(): ${terr}`);
    });

    this.appController.addAppLifecycleStateListener((id, state) => {
      for (const appName in DIAL_APPS) {
        const app = DIAL_APPS[appName];
        this.INFO(`${appName} -> ${JSON.stringify(app)}`);
        if (id === app.id) {
          this.setApplicationState(appName, state);
        }
      }
    });

    this.INFO("DIALManager.start() completed");
  }

  /**
   * @private
   * @param {string} event
   * @param {any} notification
   * @returns {Promise<any>}
   */
  async handleXcastEvent(event, notification) {
    this.INFO(`${event}: ${JSON.stringify(notification)}`);

    const desc = DIAL_APPS[notification.applicationName];
    if (!desc) {
      this.INFO(`${event}: ${JSON.stringify(notification.applicationName)} is not supported.`);
      return;
    }

    try {
      switch (event) {
        case 'onApplicationLaunchRequest': {
          const pairingCode = notification.strPayLoad;
          const additionalDataUrl = notification.strAddDataUrl;
          const params = `&inApp=${this.appController.isLaunched(desc.id)}&launch=dial`;
          const url = `${desc.url}?${pairingCode}&additionalDataUrl=${additionalDataUrl}${params}`;

          if (this.appController.getAppLifecycleState(desc.id) !== 'APP_STATE_ACTIVE') {
            await this.appController.launch(desc.id, url);
          } else {
            await this.appController.sendIntent(desc.id, url);
          }
          break;
        }
        case 'onApplicationHideRequest':
          await this.appController.close(desc.id);
          break;
        case 'onApplicationResumeRequest': {
          const url = notification.parameters?.url;

          if (this.appController.getAppLifecycleState(desc.id) !== 'APP_STATE_ACTIVE') {
            await this.appController.launch(desc.id, url);
          } else {
            await this.appController.sendIntent(desc.id, url);
          }
          break;
        }
        case 'onApplicationStopRequest':
          await this.appController.terminate(desc.id);
          break;
        case 'onApplicationStateRequest':
          await this.setApplicationState(notification.applicationName, this.appController.getAppLifecycleState(desc.id));
          break;
      }
    } catch (err) {
      this.ERR(`${event}: ${err}`);
    }
  }

  /** @private */
  registerXcastListeners() {
    this.xcastApi.registerEvent('onApplicationLaunchRequest', async notification => {
      await this.handleXcastEvent('onApplicationLaunchRequest', notification);
    });

    this.xcastApi.registerEvent('onApplicationHideRequest', async notification => {
      await this.handleXcastEvent('onApplicationHideRequest', notification);
    });

    this.xcastApi.registerEvent('onApplicationResumeRequest', async notification => {
      await this.handleXcastEvent('onApplicationResumeRequest', notification);
    });

    this.xcastApi.registerEvent('onApplicationStopRequest', async notification => {
      await this.handleXcastEvent('onApplicationStopRequest', notification);
    });

    this.xcastApi.registerEvent('onApplicationStateRequest', async notification => {
      await this.handleXcastEvent('onApplicationStateRequest', notification);
    });
  }
}
