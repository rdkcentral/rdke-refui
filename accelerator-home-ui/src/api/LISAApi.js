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

export default class LISA {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'LISA';
    this.INFO = function () { };
    this.LOG = console.log;
    this.ERR = console.error;
    this.metadata = null;
  }

  static get() {
    if (instance === null) {
      instance = new LISA()
    }
    return instance;
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this.INFO("LISA: activate result:", result)
        resolve(true)
      }).catch(err => {
        this.ERR("LISA: activate error: ", err)
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error while Thunder Controller LisaApi activate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        this.INFO("LISA: deactivate result:", result)
        resolve(true)
      }).catch(err => {
        this.ERR("LISA: deactivate error: ", err)
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error while Thunder Controller LisaApi deactivate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  getMetadata() {
    return new Promise((resolve, reject) => {
      if ((this.metadata != null) &&
        Object.prototype.hasOwnProperty.call(this.metadata, "dacBundlePlatformNameOverride") &&
        Object.prototype.hasOwnProperty.call(this.metadata, "dacBundleFirmwareCompatibilityKey") &&
        Object.prototype.hasOwnProperty.call(this.metadata, "configUrl")) {
        this.INFO("LISA: getMetadata using cached value.");
        resolve(this.metadata)
      } else {
        // "version" is reserved by ThunderJS; use "versionAsParameter" to avoid "unsupported version error".
        let params = { "id": "lisa.dac.config", "type": "application/LISA", "versionAsParameter": "0" };
        this.thunder.call(this.callsign, 'getMetadata', params).then(result => {
          this.INFO("LISA: getMetadata result: ", result)
          if (Object.prototype.hasOwnProperty.call(result, "auxMetadata")) {
            let metadata = {}
            result.auxMetadata.forEach(item => {
              metadata[item.key] = item.value;
            });
            this.metadata = metadata;
            resolve(this.metadata)
          }
          reject(false)
        }).catch(err => {
          this.ERR("LISA: getMetadata error: ", err)
          Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi getMetaData "+JSON.stringify(err), false, null)
          this.metadata = null;
          reject(err)
        })
      }
    })
  }

  install(params) {
    return new Promise((resolve, reject) => {
      this.LOG("LISA: install params:", params);
      this.thunder.call(this.callsign, 'install', params).then(result => {
        this.INFO("LISA: install result: ", result)
        resolve(result)
      }).catch(err => {
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi install "+JSON.stringify(err), false, null)
        this.ERR("LISA: install error: ", err)
        reject(err)
      })
    })
  }

  uninstall(params) {
    return new Promise((resolve, reject) => {
      this.LOG("LISA: uninstall params:", params);
      this.thunder.call(this.callsign, 'uninstall', params).then(result => {
        this.INFO("LISA: uninstall result: ", result)
        resolve(result)
      }).catch(err => {
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi uninstall "+JSON.stringify(err), false, null)
        this.ERR("LISA: uninstall error: ", err)
        reject(err)
      })
    })
  }

  getStorageDetails(params) {
    return new Promise((resolve, reject) => {
      this.LOG("LISA: getStorageDetails params:", params);
      this.thunder.call(this.callsign, 'getStorageDetails', params).then(result => {
        this.INFO("LISA: getStorageDetails result: ", result)
        resolve(result)
      }).catch(err => {
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi getStaorageDetails "+JSON.stringify(err), false, null)
        this.ERR("LISA: getStorageDetails error: ", err)
        reject(err)
      })
    })
  }

  getList() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getList').then(result => {
        this.INFO("LISA: getList result: ", result)
        resolve(result)
      }).catch(err => {
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi getList "+JSON.stringify(err), false, null)
        this.ERR("LISA: getList error: ", err)
        reject(err)
      })
    })
  }

  getProgress(handle) {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getProgress', { handle: handle }).then(result => {
        this.LOG("LISA: getProgress result: ", result)
        resolve(result)
      }).catch(err => {
        Metrics.error(Metrics.ErrorType.OTHER,"LisaApiError", "Error in Thunder LisaApi getProgress "+JSON.stringify(err), false, null)
        this.ERR("LISA: getProgress error: ", err)
        reject(err)
      })
    })
  }
}
