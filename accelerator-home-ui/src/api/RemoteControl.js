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

let instance = null

export default class RCApi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
    this.callsign = 'org.rdk.RemoteControl';
  }

  static get() {
    if (instance == null) {
      instance = new RCApi()
    }
    return instance
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', `status@${this.callsign}`).then(result => {
        if (Array.isArray(result) && result[0] && result[0].state === "activated") {
          resolve(true);
          return;
        }
        this.INFO("RCApi: activate.");
        this.thunder.Controller.activate({ callsign: this.callsign }).then(() => {
          resolve(true);
        }).catch(err => {
          this.ERR("RCApi: Error Activation " + JSON.stringify(err));
          reject(err)
        })
      }).catch(err => {
        this.ERR("RCApi: Error checking activation status " + JSON.stringify(err));
        reject(err);
      })
    })
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.Controller.deactivate({ callsign: this.callsign }).then(() => {
        this.INFO("RCApi: deactivated " + this.callsign)
        resolve(true)
      }).catch(err => {
        this.ERR("RCApi: Error deactivation " + JSON.stringify(err))
        reject(err)
      })
    })
  }

  getApiVersionNumber() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: getApiVersionNumber");
      this.thunder.call(this.callsign, 'getApiVersionNumber').then(result => {
        this.INFO("RCApi: getApiVersionNumber result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("RCApi: getApiVersionNumber error: " + JSON.stringify(err));
        reject(err);
      });
    })
  }

  getNetStatus() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getNetStatus').then(result => {
        this.INFO("RCApi: getNetStatus result: " + JSON.stringify(result))
        if (result.success) {
          resolve(result);
        } else {
          reject(false);
        }
      }).catch(err => {
        this.ERR("RCApi: getNetStatus error: " + JSON.stringify(err));
        reject(err);
      });
    })
  }

  startPairing(timeout = 30) {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'startPairing', { timeout: timeout, screenBindEnable: false }).then(result => {
        this.INFO("RCApi: startPairing result: " + JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: startPairing error: " + JSON.stringify(err));
        reject(err);
      });
    })
  }

  stopPairing() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: stopPairing");
      this.thunder.call(this.callsign, 'stopPairing', {scanDisable: true}).then(result => {
        this.INFO("RCApi: stopPairing result: " + JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: stopPairing error: " + JSON.stringify(err));
        reject(err);
      });
    });
  }

  initializeIRDB() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  clearIRCodes() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  setIRCode() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  getIRCodesByAutoLookup() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  getIRCodesByNames() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  getIRDBManufacturers() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  getIRDBModels() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  getLastKeypressSource() {
    return new Promise((resolve, reject) => {
      /*TODO: implement when requirement comes.*/
      reject("NotImplemented")
    });
  }

  configureWakeupKeys(netType = 1, wakeupConfig = "custom", customKeys = "3,1") {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: configureWakeupKeys netType:" + JSON.stringify(netType) + " wakeupConfig:" + JSON.stringify(wakeupConfig) + " customKeys:" + JSON.stringify(customKeys));
      this.thunder.call(this.callsign, 'configureWakeupKeys',
        { netType: netType, wakeupConfig: wakeupConfig, customKeys: customKeys }).then(result => {
          this.INFO("RCApi: configureWakeupKeys result: " + JSON.stringify(result))
          resolve(result.success);
        }).catch(err => {
          this.ERR("RCApi: configureWakeupKeys error: " + JSON.stringify(err));
          reject(err);
        });
    })
  }

  findMyRemote(level = "mid") {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: findMyRemote level:" + JSON.stringify(level));
      this.thunder.call(this.callsign, 'findMyRemote', { level: level }).then(result => {
        this.INFO("RCApi: findMyRemote result: " + JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: findMyRemote error: " + JSON.stringify(err));
        reject(err);
      });
    })
  }

  // This is to reset the remote control firmware; not to be confused with factory reset of the device.
  // This will not erase user data or settings on the device.
  factoryReset() {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: factoryReset");
      this.thunder.call(this.callsign, 'factoryReset').then(result => {
        this.INFO("RCApi: factoryReset result: " + JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: factoryReset error: " + JSON.stringify(err));
        reject(err);
      });
    })
  }

  unpair(macAddressList) {
    return new Promise((resolve, reject) => {
      this.INFO("RCApi: unpair macAddressList:" + JSON.stringify(macAddressList));
      this.thunder.call(this.callsign, 'unpair', { macAddressList: macAddressList }).then(result => {
        this.INFO("RCApi: unpair result: " + JSON.stringify(result))
        resolve(result.success);
      }).catch(err => {
        this.ERR("RCApi: unpair error: " + JSON.stringify(err));
        reject(err);
      });
    });
  }
}
