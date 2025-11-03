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
import { CONFIG } from '../Config/Config'
import { Metrics } from '@firebolt-js/sdk';

let instance = null
/**
 * Class for Xcast thunder plugin apis.
 */
export default class PowerManagerApi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
    this.callsign = "org.rdk.PowerManager";
  }
  

  static get() {
    if (instance === null) {
      instance = new PowerManagerApi()
    }
    return instance;
  }

  activate() {
      return new Promise((resolve, reject) => {
          this.thunder.Controller.activate({ callsign: this.callsign })
              .then(() => {
                  resolve(true)
              })
              .catch(err => {
                  this.ERR("Error Activation " + JSON.stringify(err))
                  Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} activate ${JSON.stringify(err)}`, false, null)
                  reject(err)
              })
      })
  }

  deactivate() {
      return new Promise((resolve, reject) => {
          this.thunder.Controller.deactivate({ callsign: this.callsign })
              .then(() => {
                  resolve(true)
              })
              .catch(err => {
                  this.ERR("Error Deactivation " + JSON.stringify(err))
                  Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
                  reject(err)
              })
      })
  }

  setWakeupSrcConfig(params) {
      this.LOG("setWakeupSrcConfiguration params:", JSON.stringify(params));
      return new Promise((resolve, reject) => {
        this.thunder.call(this.callsign, 'setWakeupSrcConfig', params).then(result => {
          this.LOG(" setWakeupSrcConfiguration result:", JSON.stringify(result))
          resolve(result)
        }).catch(err => {
          this.ERR(" setWakeupSrcConfiguration error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system setWakeupSrcConfiguration " + JSON.stringify(err), false, null)
          reject(err)
        })
      })
  }

  setPowerState(value) {
    return new Promise((resolve) => {
      this.thunder.call(this.callsign, 'setPowerState', { "powerState": value, "standbyReason": "ResidentApp User Requested" })
        .then(result => {
          this.LOG("PowerManager setPowerState result:", JSON.stringify(result))
          if(result === null){
            resolve(true)
          } else {
            resolve(false)
          }
        })
        .catch(err => {
          this.ERR("PowerManager setPowerState failed: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "PowerStateFailure", "Error in Thunder PowerManager setPowerState " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getPowerStateBeforeReboot() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getPowerStateBeforeReboot').then(result => {
        this.LOG("PowerManager getPowerStateBeforeReboot result:", JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PowerManager getPowerStateBeforeReboot failed: ", JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, "PowerStateFailure", "Error in Thunder PowerManager getPowerStateBeforeReboot " + JSON.stringify(err), false, null);
        reject(err);
      });
    });
  }

  getPowerState() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getPowerState')
        .then(result => {
          this.LOG("PowerManager getPowerState result:", JSON.stringify(result))
          resolve(result)
        })
        .catch(err => {
          this.ERR("PowerManager getPowerState failed: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "PowerStateFailure", "Error in Thunder PowerManager getPowerState " + JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  reboot(reason = "FIRMWARE_FAILURE") {
    return new Promise((resolve) => {
      this.thunder.call(this.callsign, 'reboot', {
          "rebootReasonCustom": reason
        })
        .then(result => {
          this.LOG("PowerManager reboot result:", JSON.stringify(result))
          resolve(result)
        })
        .catch(err => {
          this.ERR("PowerManager reboot error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder PowerManager reboot " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }
}
