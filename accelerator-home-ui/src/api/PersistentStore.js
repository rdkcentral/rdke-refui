/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2024 RDK Management
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

export default class PersistentStoreApi {
  constructor() {
    if (PersistentStoreApi.instance) {
      return PersistentStoreApi.instance;
    }

    this._events = new Map();
    this.callsign = "org.rdk.PersistentStore";
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.INFO = function () { };
    this.LOG = function () { };
    this.ERR = console.error;

    PersistentStoreApi.instance = this;
  }
  static get() {
    if (!PersistentStoreApi.instance) {
      PersistentStoreApi.instance = new PersistentStoreApi();
    }
    return PersistentStoreApi.instance;
  }

  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }
  activate() {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: activate.");
      this.thunder.Controller.activate({ callsign: this.callsign }).then(() => {
        this.thunder.on(this.callsign, 'onStorageExceeded', notification => {
          if (this._events.has('onStorageExceeded')) {
            this._events.get('onStorageExceeded')(notification);
          } else {
            this.INFO('PersistentStoreApi: onStorageExceeded ' + JSON.stringify(notification));
          }
        });
        this.thunder.on(this.callsign, 'onValueChanged', notification => {
          if (this._events.has('onValueChanged')) {
            this._events.get('onValueChanged')(notification);
          } else {
            this.INFO('PersistentStoreApi: onValueChanged ' + JSON.stringify(notification));
          }
        });
        resolve(true);
      }).catch(err => {
        this.ERR('PersistentStoreApi: Error Activation ', err);
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error while Thunder Controller PersistentStore activate "+JSON.stringify(err), false, null)
        reject(err);
      })
    })
  }
  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.Controller.deactivate({ callsign: this.callsign }).then(() => {
        this.INFO("PersistentStoreApi: deactivated successfully.")
        resolve(true)
      }).catch(err => {
        this.ERR('PersistentStoreApi: Error deactivation ' + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error while Thunder Controller PersistentStore deactivate "+JSON.stringify(err), false, null)
        reject(err);
      })
    })
  }
  deleteKey(namespace, key) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: deleteKey:" + namespace + " & " + key);
      this.thunder.call(this.callsign, 'deleteKey', {
        namespace: namespace,
        key: key
      }).then(result => {
        this.LOG("PersistentStoreApi: deleteKey result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: deleteKey error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore deleteKey "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  deleteNamespace(namespace) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: deleteNamespace params:", namespace);
      this.thunder.call(this.callsign, 'deleteNamespace', { namespace: namespace }).then(result => {
        this.LOG("PersistentStoreApi: deleteNamespace result:" + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: deleteNamespace error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore deleteNamespace "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  flushCache() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'flushCache').then(result => {
        this.LOG("PersistentStoreApi: flushCache result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: flushCache error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore flushCache "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  getKeys(namespace) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: getKeys params:", namespace);
      this.thunder.call(this.callsign, 'getKeys', { namespace: namespace }).then(result => {
        this.LOG("PersistentStoreApi: getKeys result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getKeys error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore getKeys "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  getNamespaces() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getNamespaces').then(result => {
        this.LOG("PersistentStoreApi: getNamespaces result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getNamespaces error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore getNamespaces "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  getStorageSize() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getStorageSize').then(result => {
        this.LOG("PersistentStoreApi: getStorageSize result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getStorageSize error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore getStorageSize "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  getValue(namespace, key) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: getValue " + namespace + " & " + key);
      this.thunder.call(this.callsign, 'getValue', { namespace: namespace, key: key }).then(result => {
        this.LOG("PersistentStoreApi: getValue result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getValue error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore getValue "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
  setValue(namespace, key, value) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: setValue:" + namespace + " & " + key + " & " + value);
      this.thunder.call(this.callsign, 'setValue', { namespace: namespace, key: key, value: value }).then(result => {
        this.LOG("PersistentStoreApi: setValue result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: setValue error:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER,"PersistentStoreApiError", "Error in Thunder PersistentStore setValue "+JSON.stringify(err), false, null)
        reject(err);
      });
    })
  }
}
