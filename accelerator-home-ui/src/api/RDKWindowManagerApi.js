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
export default class RDKWindowManager {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.RDKWindowManager';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }
  static get() {
    if (instance === null) {
      instance = new RDKWindowManager()
    }
    return instance;
  }

   activate() {
          return new Promise((resolve, reject) => {
              this.thunder.Controller.activate({ callsign: this.callsign })
                  .then(() => {
                      resolve(true)
                      this.INFO("RDKWindowManager activated successfully");
                  })
                  .catch(err => {
                      this.ERR("Error Activation RDKWindowManager" + JSON.stringify(err))
                      Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while Thunder Controller ${this.callsign} activate ${JSON.stringify(err)}`, false, null)
                      reject(err)
                  })
          })
      }
    deactivate() {
        return new Promise((resolve, reject) => {
            this.thunder.Controller.deactivate({ callsign: this.callsign })
                .then(() => {
                    resolve(true)
                    this.INFO("RDKWindowManager deactivated successfully");
                })
                .catch(err => {
                    this.ERR("Error Deactivation RDKWindowManager" + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while Thunder Controller ${this.callsign} deactivate ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
      }
    setFocus(client)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'setFocus', { "client":client })
                .then(response => {
                    resolve(response)
                    this.INFO("setFocus response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in setFocus: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling setFocus on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    setVisible(client, visible)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'setVisible', { "client":client, "visible":visible })  
                .then(response => {
                    resolve(response)
                    this.INFO("setVisible response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in setVisible: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling setVisible on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    getApps()
    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'getApps', {})     
                .then(response => {
                    resolve(response)
                    this.INFO("getApps response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in getApps: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling getApps on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    setZOrder  (client, zOrder)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'setZOrder', { "client":client, "zOrder":zOrder })
                .then(response => {
                    resolve(response)
                    this.INFO("setZOrder response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in setZOrder: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling setZOrder on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    getZOrder(client)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'getZOrder', { "client":client })
                .then(response => {
                    resolve(response)
                    this.INFO("getZOrder response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in getZOrder: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling getZOrder on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    enableInactivityReporting(enable)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'enableInactivityReporting', { "enable":enable })  
                .then(response => {
                    this.INFO("enableInactivityReporting response: " + JSON.stringify(response));
                    if(response == null){
                        resolve(true)
                    }
                })
                .catch(err => {
                    this.ERR("Error in enableInactivityReporting: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "Runtime", `Error while calling enableInactivityReporting on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })  
        })
    }
    setInactivityInterval(interval)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'setInactivityInterval', { "interval":interval })
                .then(response => {
                    resolve(response)
                    this.INFO("setInactivityInterval response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in setInactivityInterval: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling setInactivityInterval on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    resetInactivityTime()    {  
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'resetInactivityTime', {})
                .then(response => {
                    this.INFO("resetInactivityTimeout response: " + JSON.stringify(response));
                    resolve(response)
                })
                .catch(err => {
                    this.ERR("Error in resetInactivityTimeout: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling resetInactivityTimeout on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    renderReady(client)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'renderReady', { "client":client })
                .then(response => {
                    resolve(response)
                    this.INFO("renderReady response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in renderReady: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling renderReady on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    enableDisplayRender(client, enable)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'enableDisplayRender', { "client":client, "enable":enable })
                .then(response => {
                    resolve(response)
                    this.INFO("enableDisplayRender response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in enableDisplayRender: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling enableDisplayRender on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    generateKey(client,keyCode,modifiers,duration)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'generateKey', { "client":client, "keyCode":keyCode, "modifiers":modifiers, "duration":duration })
                .then(response => {
                    resolve(response)
                    this.INFO("generateKey response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in generateKey: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling generateKey on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    removeKeyIntercept(value,clientid)    {
        return new Promise((resolve, reject) => {
            const params = {
            intercept: `{"keyCode":${value},"modifiers":[],"client":"${clientid}"}`
            };
            this.thunder.call(this.callsign, 'removeKeyIntercept', params)
                .then(response => {
                    this.INFO("removeKeyIntercept response: " + JSON.stringify(response));
                    resolve(response)
                })
                .catch(err => {
                    this.ERR("Error in removeKeyIntercept: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling removeKeyIntercept on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
    addKeyIntercepts (params)    {   
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'addKeyIntercepts', params)
                .then(response => {
                    this.INFO("addKeyIntercepts response: " + JSON.stringify(response));
                    resolve(response)
                })
                .catch(err => {
                    this.ERR("Error in addKeyIntercepts: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling addKeyIntercepts on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    } 
    createDisplay(client,displayName,displayWidth,virtualWidth,virtualHeight,ownerId)    {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'createDisplay', { "client":client, "displayName":displayName, "displayWidth":displayWidth, "virtualWidth":virtualWidth, "virtualHeight":virtualHeight, "ownerId":ownerId })
                .then(response => {
                    resolve(response)
                    this.INFO("createDisplay response: " + JSON.stringify(response));
                })
                .catch(err => {
                    this.ERR("Error in createDisplay: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "RDKWindowManager", `Error while calling createDisplay on ${this.callsign} ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }
}
