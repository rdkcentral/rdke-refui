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

import AppManager from './api/AppManagerApi.js';
import RDKWindowManager from './api/RDKWindowManagerApi.js';
import { ThunderError } from './api/ThunderError.js';
import { GLOBALS } from './Config/Config.js';
import Keymap from './Config/Keymap.js';
import { keyIntercept } from './keyIntercept/keyIntercept.js';

const INVALID_APP_ID = "";
const APP_ID_YOUTUBE = "com.rdkcentral.youtube-exp";

let instance = null;

/**
 * @typedef {'APP_STATE_INITIALIZING'
 * | 'APP_STATE_ACTIVE'
 * | 'APP_STATE_PAUSED'
 * | 'APP_STATE_SUSPENDED'
 * | 'APP_STATE_HIBERNATED'
 * | 'APP_STATE_TERMINATING'} AppState;
 *
 * @typedef {(id: string, state: AppState) => void} AppLifecycleStateListener
 */

export default class AppController {
  /**
   * @returns {AppController}
   */
  static get() {
    if (instance === null) {
      instance = new AppController();
    }
    return instance;
  }

  /**
   * @private
   * @type {Map<string, AppState>}
   */
  appLifecycleStates = new Map();
  /**
   * @private
   * @type {Set<AppLifecycleStateListener>}
   */
  appLifecycleStateListeners = new Set();

  /**
   * @private
   */
  constructor() {
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;

    this.launchedAppId = INVALID_APP_ID;
    this._packageChangedListeners = new Set();
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async isPackageInstalled(id) {
    let result = false;

    try {
      result = await AppManager.get().isInstalled(id);
    } catch (err) {
      this.WARN(`isPackageInstalled(${id}): ${err}`);
    }

    return result;
  }

  /**
   * Register a listener for package install/uninstall events.
   * @param {Function} listener - callback(action, data)
   */
  addPackageChangedListener(listener) {
    if (typeof listener === 'function') {
      this._packageChangedListeners.add(listener);
    }
  }

  /**
   * Unregister a previously registered package-changed listener.
   * @param {Function} listener
   */
  removePackageChangedListener(listener) {
    this._packageChangedListeners.delete(listener);
  }

  /**
   * @param {string} id
   * @returns {AppState}
   */
  getAppLifecycleState(id) {
    return this.appLifecycleStates.get(id);
  }

  /**
   * @param {AppLifecycleStateListener} listener
   */
  addAppLifecycleStateListener(listener) {
    if (typeof listener === 'function') {
      this.appLifecycleStateListeners.add(listener);
    }
  }

  /**
   * @param {AppLifecycleStateListener} listener
   */
  removeAppLifecycleStateListener(listener) {
    this.appLifecycleStateListeners.delete(listener);
  }

  /**
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async init() {
    const mainAppId = GLOBALS.selfclientAppName;
    let mainClientId;

    try {
      const appManagerApps = await AppManager.get().getLoadedApps();
      mainClientId = appManagerApps.find(app => app.appId === mainAppId)?.appInstanceId;
    } catch (err) {
      this.WARN(`AppManager.getLoadedApps(): ${err}`);
    }

    if (!mainClientId) {
      // find client id if the app was started using "bolt run"
      try {
        const windowManagerApps = await RDKWindowManager.get().getApps();
        mainClientId = windowManagerApps.find(app => app.startsWith(mainAppId + "+"));
      } catch (err) {
        this.WARN(new ThunderError("RDKWindowManager.getApps()", err).toString());
      }
    }

    if (mainClientId) {
      GLOBALS.selfClientId = this.focusedClientId = this.mainClientId = mainClientId;
      GLOBALS.topmostApp = mainAppId;
      this.LOG('selfClientName:', GLOBALS.selfClientName);
      this.LOG('selfClientId:', GLOBALS.selfClientId);

      try {
        await keyIntercept(this.mainClientId);
      } catch (err) {
        this.WARN(new ThunderError("RDKWindowManager.addKeyIntercepts()", err).toString());
      }
    } else {
      this.WARN('Main app not found:', mainAppId);
    }
  }

  /**
   * @param {string} clientId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async setVisibleAndFocused(clientId) {
    try {
      await Promise.all([
        RDKWindowManager.get().setVisible(clientId, true),
        RDKWindowManager.get().setFocus(clientId)
      ]);
    } catch (err) {
      throw new ThunderError(`setVisibleAndFocused(${clientId})`, err);
    }
  }

  /**
   * @param {string} clientId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async setInvisible(clientId) {
    try {
      await RDKWindowManager.get().setVisible(clientId, false);
    } catch (err) {
      throw new ThunderError(`setInvisible(${clientId})`, err);
    }
  }

  /**
   * @param {{ on: function(string, string, function): void }} thunder
   * @returns {Promise<any>}
   */
  async subscribe(thunder) {
    thunder.on('org.rdk.AppManager', 'onAppInstalled', data => {
      this.LOG('onAppInstallStatus ' + JSON.stringify(data));
      this._packageChangedListeners.forEach(listener => {
        try {
          listener('installed', data);
        } catch (err) {
          this.ERR('packageChangedListener error (installed): ' + err);
        }
      });
    });

    thunder.on('org.rdk.AppManager', 'onAppUninstalled', data => {
      this.LOG('onAppUninstallStatus ' + JSON.stringify(data));
      this._packageChangedListeners.forEach(listener => {
        try {
          listener('uninstalled', data);
        } catch (err) {
          this.ERR('packageChangedListener error (uninstalled): ' + err);
        }
      });
    });

    thunder.on('org.rdk.AppManager', 'onAppLifecycleStateChanged', async data => {
      this.LOG('onAppLifecycleStateChanged ' + JSON.stringify(data));

      if (data.oldState === data.newState) return;

      try {
        if (data.appId === this.launchedAppId && data.newState === "APP_STATE_ACTIVE") {
          GLOBALS.topmostApp = data.appId;
          this.focusedClientId = data.appInstanceId;
          await this.setVisibleAndFocused(data.appInstanceId);
          await this.setInvisible(this.mainClientId);
          await this.addKeyIntercepts(data.appId, data.appInstanceId);
        } else if (data.appInstanceId === this.focusedClientId && data.oldState === "APP_STATE_ACTIVE") {
          this.launchedAppId = INVALID_APP_ID;
          GLOBALS.topmostApp = GLOBALS.selfclientAppName;
          this.focusedClientId = this.mainClientId;
          await this.setVisibleAndFocused(this.mainClientId);
        }
      } catch (err) {
        this.ERR(`onAppLifecycleStateChanged: ${err}`);
      }

      this.appLifecycleStates.set(data.appId, data.newState);

      for (const listener of this.appLifecycleStateListeners) {
        try {
          listener(data.appId, data.newState);
        } catch (err) {
          this.ERR(`${err} in onAppLifecycleStateChanged listener`);
        }
      }
    });

    thunder.on('org.rdk.AppManager', 'onAppLaunchRequest', data => {
      this.LOG('onAppLaunchRequested ' + JSON.stringify(data));
    });

    thunder.on('org.rdk.AppManager', 'onAppUnloaded', async data => {
      this.LOG('onAppUnloaded ' + JSON.stringify(data));
    });
  }

  /**
   * @param {string} id
   * @param {string} clientId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async addKeyIntercepts(id, clientId) {
    if (id === APP_ID_YOUTUBE) {
      try {
        const intercepts = [
          { "keyCode": Keymap.AudioVolumeMute, "modifiers": [] },
          { "keyCode": Keymap.AudioVolumeDown, "modifiers": [] },
          { "keyCode": Keymap.AudioVolumeUp, "modifiers": [] },
          { "keyCode": Keymap.Youtube, "modifiers": [] }
        ];
        await RDKWindowManager.get().addKeyIntercepts({
          clientId,
          intercepts: JSON.stringify(intercepts)
        });
      } catch (err) {
        throw new ThunderError("RDKWindowManager.addKeyIntercepts()", err);
      }
    }
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isLaunched(id) {
    return id === this.launchedAppId;
  }

  /**
   * @param {string} id
   * @param {string} intent
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async launch(id, intent) {
    this.launchedAppId = id;
    await AppManager.get().launchApp(id, intent);
  }

  /**
   * @param {string} id
   * @param {string} intent
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async sendIntent(id, intent) {
    await AppManager.get().sendIntent(id, intent);
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async close(id) {
    await AppManager.get().closeApp(id);
  }

  /**
   * @param {string} id
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async terminate(id) {
    await AppManager.get().terminateApp(id);
  }
}
