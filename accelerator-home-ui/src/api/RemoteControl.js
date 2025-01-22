/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2023 RDK Management
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

export default class RCApi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    // this.INFO = console.info;
    // this.LOG = console.log;
    this.INFO = function () { };
    this.LOG = function () { };
    this.ERR = console.error;
  }

  static get() {
    if (instance == null) {
      instance = new RCApi()
    }
    return instance
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: activate.");
      this.thunder.Controller.activate({ callsign: 'org.rdk.RemoteControl' }).then(() => {
        resolve(true);
      }).catch(err => {
        this.ERR('RCApi: Error Activation ', err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error while Thunder Controller RemoteControl activate "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.Controller.deactivate({ callsign: 'org.rdk.RemoteControl' }).then(() => {
        this.INFO("RCApi: deactivated org.rdk.RemoteControl")
        resolve(true)
      }).catch(err => {
        this.ERR('RCApi: Error deactivation ', err)
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error while Thunder Controller RemoteControl deactivate "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getApiVersionNumber() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: getApiVersionNumber");
      this.thunder.call('org.rdk.RemoteControl', 'getApiVersionNumber').then(result => {
        this.INFO("RCApi: getApiVersionNumber result: ", JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("RCApi: getApiVersionNumber error:", err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error in Thunder RemoteControl getApiVersionNumber "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }

  getNetStatus(netType = 1) {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: getNetStatus of netType:", netType);
      this.thunder.call('org.rdk.RemoteControl', 'getNetStatus', { netType: netType }).then(result => {
        this.INFO("RCApi: getNetStatus result: ", JSON.stringify(result))
        if (result.success) resolve(result);
        reject(false);
      }).catch(err => {
        this.ERR("RCApi: getNetStatus error:", err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error in Thunder RemoteControl getNetStatus "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }

  startPairing(timeout = 30, netType = 1) {
    return new Promise((resolve, reject) => {
      //this.INFO("RCApi: startPairing netType " + netType + " timeout " + timeout);
      this.thunder.call('org.rdk.RemoteControl', 'startPairing', { netType: netType, timeout: timeout }).then(result => {
        //this.INFO("RCApi: startPairing result: ", JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: startPairing error:", err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error in Thunder RemoteControl startPairing "+JSON.stringify(err), false, null)
        reject(err);
      });
      resolve(true);
    })
  }

  initializeIRDB() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  clearIRCodes() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  setIRCode() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  getIRCodesByAutoLookup() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  getIRCodesByNames() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  getIRDBManufacturers() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  getIRDBModels() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  getLastKeypressSource() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "NotImplemented", false, null)
      reject("NotImplemented")
    });
  }

  configureWakeupKeys(netType = 1, wakeupConfig = "custom", customKeys = "3,1") {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: configureWakeupKeys netType:" + netType + " wakeupConfig:" + wakeupConfig + " customKeys:" + customKeys);
      this.thunder.call('org.rdk.RemoteControl', 'configureWakeupKeys',
        { netType: netType, wakeupConfig: wakeupConfig, customKeys: customKeys }).then(result => {
          this.INFO("RCApi: configureWakeupKeys result: ", JSON.stringify(result))
          resolve(result.success);
        }).catch(err => {
          this.ERR("RCApi: configureWakeupKeys error:", err);
          Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error in Thunder RemoteControl configureWakeupKeys "+JSON.stringify(err), false, null)
          reject(err);
        });
    })
  }

  findMyRemote(netType = 1, level = "mid") {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: findMyRemote netType:" + netType + " level:" + level);
      this.thunder.call('org.rdk.RemoteControl', 'findMyRemote', { netType: netType, level: level }).then(result => {
        this.INFO("RCApi: findMyRemote result: ", JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: findMyRemote error:", err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError", "Error in Thunder RemoteControl findMyRemote "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }

  factoryReset() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: factoryReset");
      this.thunder.call('org.rdk.RemoteControl', 'factoryReset').then(result => {
        this.INFO("RCApi: factoryReset result: ", JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: factoryReset error:", err);
        Metrics.error(Metrics.ErrorType.OTHER,"RemoteControlApiError",  "Error in Thunder RemoteControl factoryReset "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
}
