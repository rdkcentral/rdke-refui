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
                      Metrics.error(Metrics.ErrorType.OTHER, "AppManager", `Error while Thunder Controller ${callsign} activate ${JSON.stringify(err)}`, false, null)
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
                    Metrics.error(Metrics.ErrorType.OTHER, "AppManager", `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
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
    Isinstalled(appId){
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'isInstalled', {appId:appId})
                .then(response => {
                    resolve(response)
                    this.INFO("isInstalled response: " + JSON.stringify(response));
                })  
                .catch(err => {
                    this.ERR("Error in isInstalled: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "AppManager", `Error while calling isInstalled on ${callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })  
    }
    closeApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("closeApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'closeApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("closeApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error closeApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "closeAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    terminateApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("terminateApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'terminateApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("terminateApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error terminateApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "terminateAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    killApp(appId) {    
        return new Promise((resolve, reject) => {
        this.INFO("killApp called with appId: " + appId );
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
    clearAppData(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("clearAppData called with appId: " + appId );
            this.thunder.call(this.callsign, 'clearAppData', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("clearAppData response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error clearAppData: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "clearAppDataError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    getInstalledApps() {
        return new Promise((resolve, reject) => {
        this.thunder.call(this.callsign, 'getInstalledApps', {})
                .then(response => {
                    resolve(response)
                    this.INFO("getInstalledApps response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error getInstalledApps: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "getInstalledAppsError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })  
    }
    preloadApp(appId) { 
        return new Promise((resolve, reject) => {
        this.INFO("preloadApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'preloadApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("preloadApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error preloadApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "preloadAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    startSystemApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("startSystemApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'startSystemApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("startSystemApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error startSystemApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "startSystemAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    stopSystemApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("stopSystemApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'stopSystemApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("stopSystemApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error stopSystemApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "stopSystemAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    activateSystemApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("activateSystemApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'activateSystemApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("activateSystemApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error activateSystemApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "activateSystemAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    deactivateSystemApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("deactivateSystemApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'deactivateSystemApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("deactivateSystemApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error deactivateSystemApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "deactivateSystemAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    hibernateSystemApp(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("hibernateSystemApp called with appId: " + appId );
            this.thunder.call(this.callsign, 'hibernateSystemApp', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("hibernateSystemApp response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error hibernateSystemApp: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "hibernateSystemAppError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    sendIntent(appId,intent) {
        return new Promise((resolve, reject) => {
        this.INFO("sendIntent called with appId: " + appId + " and intent: " + intent );
            this.thunder.call(this.callsign, 'sendIntent', { "appId":appId, "intent":intent })
                .then(response => {
                    resolve(response)
                    this.INFO("sendIntent response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error sendIntent: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "sendIntentError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    clearAppData(appId) {
        return new Promise((resolve, reject) => {
        this.INFO("clearAppData called with appId: " + appId );
            this.thunder.call(this.callsign, 'clearAppData', { "appId":appId })
                .then(response => {
                    resolve(response)
                    this.INFO("clearAppData response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error clearAppData: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "clearAppDataError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    getAppProperty(appId,key) {
        return new Promise((resolve, reject) => {
        this.INFO("getAppProperty called with appId: " + appId + " and key: " + key );
            this.thunder.call(this.callsign, 'getAppProperty', { "appId":appId, "key":key })
                .then(response => {
                    resolve(response)
                    this.INFO("getAppProperty response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error getAppProperty: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "getAppPropertyError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    setAppProperty(appId,key,value) {
        return new Promise((resolve, reject) => {
        this.INFO("setAppProperty called with appId: " + appId + " key: " + key + " and value: " + value ); 
            this.thunder.call(this.callsign, 'setAppProperty', { "appId":appId, "key":key, "value":value })
                .then(response => {
                    resolve(response)
                    this.INFO("setAppProperty response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error setAppProperty: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "setAppPropertyError", `Error while Thunder call ${this.callsign} ListPackages ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
}
