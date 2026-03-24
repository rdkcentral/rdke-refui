/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2025 RDK Management
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
import { CONFIG } from '../Config/Config'
import { Metrics } from "@firebolt-js/sdk"
import { ThunderError } from './ThunderError';

let instance = null;

export default class AppManager {
  /**
   * @returns {AppManager}
   */
  static get() {
    if (instance === null) {
      instance = new AppManager()
    }

    return instance;
  }

  /**
   * @private
   */
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.AppManager.1';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  /**
   * @private
   * @param {string} thunderCall
   * @param {Error} thunderErr
   * @throws {ThunderError}
   */
  handleThunderError(thunderCall, thunderErr) {
    const err = new ThunderError(thunderCall, thunderErr);
    const errString = err.toString();
    this.ERR(errString);
    Metrics.error(Metrics.ErrorType.OTHER, "AppManager", errString, false, null)

    throw err;
  }

  /**
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async activate() {
    return this.thunder.Controller.activate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("AppManager activated");
      return true;
    }).catch(err => {
      this.handleThunderError(`activate(${this.callsign})`, err);
    });
  }

  /**
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async deactivate() {
    return this.thunder.Controller.deactivate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("AppManager deactivated");
      return true;
    }).catch(err => {
      this.handleThunderError(`deactivate(${this.callsign})`, err);
    });
  }

  /**
   * @param {string} appId
   * @param {string} intent
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async launchApp(appId, intent) {
    const thunderCall = "launchApp";
    const params = { appId };

    if (typeof intent === "string") {
      params.intent = intent;
    }

    return this.thunder.call(
      this.callsign, thunderCall, params,
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async getLoadedApps() {
    const thunderCall = "getLoadedApps";

    return this.thunder.call(
      this.callsign, thunderCall
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async isInstalled(appId) {
    const thunderCall = "isInstalled";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async closeApp(appId) {
    const thunderCall = "closeApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async terminateApp(appId) {
    const thunderCall = "terminateApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async killApp(appId) {
    const thunderCall = "killApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async getInstalledApps() {
    const thunderCall = "getInstalledApps";

    return this.thunder.call(
      this.callsign, thunderCall
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async preloadApp(appId) {
    const thunderCall = "preloadApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async startSystemApp(appId) {
    const thunderCall = "startSystemApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async stopSystemApp(appId) {
    const thunderCall = "stopSystemApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async activateSystemApp(appId) {
    const thunderCall = "activateSystemApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async deactivateSystemApp(appId) {
    const thunderCall = "deactivateSystemApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async hibernateSystemApp(appId) {
    const thunderCall = "hibernateSystemApp";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @param {string} intent
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async sendIntent(appId, intent) {
    const thunderCall = "sendIntent";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId, intent }
    ).then(result => {
      this.LOG(thunderCall, "(", intent, ") result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(`${thunderCall}(${intent})`, err);
    });
  }

  /**
   * @param {string} appId
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async clearAppData(appId) {
    const thunderCall = "clearAppData";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @param {string} key
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async getAppProperty(appId, key) {
    const thunderCall = "getAppProperty";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId, key }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  /**
   * @param {string} appId
   * @param {string} key
   * @param {string} value
   * @returns {Promise<any>}
   * @throws {ThunderError}
   */
  async setAppProperty(appId, key, value) {
    const thunderCall = "setAppProperty";

    return this.thunder.call(
      this.callsign, thunderCall,
      { appId, key, value }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }
}
