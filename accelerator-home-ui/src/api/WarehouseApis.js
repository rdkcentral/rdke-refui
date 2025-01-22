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

export default class Warehouse {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.Warehouse';
    this.INFO = function(){};
    this.LOG = function(){};
    this.ERR = console.error;
  }

  static get() {
    if (instance === null) {
      instance = new Warehouse()
    }
    return instance;
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " activate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " activate error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error in Thunder controller warehouseApi activate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " deactivate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " deactivate error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error in Thunder controller warehouseApi deactivate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  executeHardwareTest() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'executeHardwareTest').then(result => {
        this.INFO(this.callsign + " executeHardwareTest result: " + result)
        if (result.success) resolve(result.success)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " executeHardwareTest error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi executeHardwareTest "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  internalReset(passPhrase = "FOR TEST PURPOSES ONLY") {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'internalReset', {passPhrase: passPhrase}).then(result => {
        this.INFO(this.callsign + " internalReset result: " + result)
        if (result.success) resolve(result.success)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " internalReset error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi internalReset "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  isClean() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'isClean').then(result => {
        this.INFO(this.callsign + " isClean result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " isClean error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi isClean "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  lightReset() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'lightReset').then(result => {
        this.INFO(this.callsign + " lightReset result: " + result)
        if (result.success)resolve(result.success)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " lightReset error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi lightReset "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  resetDevice(resetType = "USERFACTORY", suppressReboot = "false") {
    return new Promise((resolve, reject) => {
      let params = { resetType: resetType, suppressReboot: suppressReboot}
      this.INFO(this.callsign + " resetDevice params: " + JSON.stringify(params));
      this.thunder.call(this.callsign, 'resetDevice', params).then(result => {
        this.INFO(this.callsign + " resetDevice result: " + result)
        if (result.success)resolve(result.success)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " resetDevice error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi resetDevice "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setFrontPanelState(state = -1) { // -1 (NONE), 1 (DOWNLOAD IN PROGRESS), 3 (DOWNLOAD FAILED)
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'setFrontPanelState', {state: state}).then(result => {
        this.INFO(this.callsign + " setFrontPanelState result: " + result)
        if (result.success)resolve(result.success)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " setFrontPanelState error: " + err)
        Metrics.error(Metrics.ErrorType.OTHER,"WarehouseApiError", "Error while Thunder warehouseApi setFrontPanelState "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }
}
