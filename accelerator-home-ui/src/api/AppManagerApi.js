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

let instance = null
export default class AppManager {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.AppManager.1';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }
  static get() {
    if (instance === null) {
      instance = new AppManager()
    }
    return instance;
  }

   activate() {
          return new Promise((resolve, reject) => {
              this.thunder.Controller.activate({ callsign: callsign })
                  .then(() => {
                      resolve(true)
                      this.INFO("AppManager activated successfully");
                  })
                  .catch(err => {
                      this.ERR("Error Activation AppManager" + JSON.stringify(err))
                      Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} activate ${JSON.stringify(err)}`, false, null)
                      reject(err)
                  })
          })
      }
    deactivate() {
        return new Promise((resolve, reject) => {
            this.thunder.Controller.deactivate({ callsign: callsign })
                .then(() => {
                    resolve(true)
                    this.INFO("AppManager deactivated successfully");
                })
                .catch(err => {
                    this.ERR("Error Deactivation AppManager" + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
      }
    launchApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("launchApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'launchApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("launchApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error launchApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "launchAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    killApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("killApp called with appId: " + appId + " and version: " + version);
            this.thunder.call(this.callsign, 'killApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("killApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error killApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "killAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })  
        })
    }
    getLoadedApps() {
        return new Promise((resolve, reject) => {
        this.thunder.call(this.callsign, 'getLoadedApps', {})   .then(response => {
                    resolve(response)
                    this.INFO("getLoadedApps response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error getLoadedApps: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "getLoadedAppsError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })    
        })  
    }
}
