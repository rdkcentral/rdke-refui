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
import { CONFIG } from '../Config/Config';

export default class PersistentStoreApi {
  constructor() {
    if (PersistentStoreApi.instance) {
      return PersistentStoreApi.instance;
    }

    this._events = new Map();
    this.callsign = "org.rdk.PersistentStore";
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;

    PersistentStoreApi.instance = this;
  }
  static get() {
    if (!PersistentStoreApi.instance) {
      PersistentStoreApi.instance = new PersistentStoreApi();
    }
    return PersistentStoreApi.instance;
  }

  deleteKey(namespace, key) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: deleteKey:" + JSON.stringify(namespace) + " & " + JSON.stringify(key));
      this.thunder.call(this.callsign, 'deleteKey', {
        namespace: namespace,
        key: key
      }).then(result => {
        this.LOG("PersistentStoreApi: deleteKey result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: deleteKey error:" + JSON.stringify(err));
        reject(err);
      });
    })
  }
  deleteNamespace(namespace) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: deleteNamespace params:" + JSON.stringify(namespace));
      this.thunder.call(this.callsign, 'deleteNamespace', { namespace: namespace }).then(result => {
        this.LOG("PersistentStoreApi: deleteNamespace result:" + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: deleteNamespace error:" + JSON.stringify(err));
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
        reject(err);
      });
    })
  }
  getKeys(namespace) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: getKeys params:" + JSON.stringify(namespace));
      this.thunder.call(this.callsign, 'getKeys', { namespace: namespace }).then(result => {
        this.LOG("PersistentStoreApi: getKeys result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getKeys error:" + JSON.stringify(err));
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
        reject(err);
      });
    })
  }
  getValue(namespace, key) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: getValue " + JSON.stringify(namespace) + " & " + JSON.stringify(key));
      this.thunder.call(this.callsign, 'getValue', { namespace: namespace, key: key }).then(result => {
        this.LOG("PersistentStoreApi: getValue result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: getValue error:" + JSON.stringify(err));
        reject(err);
      });
    })
  }
  setValue(namespace, key, value) {
    return new Promise((resolve, reject) => {
      this.INFO("PersistentStoreApi: setValue:" + JSON.stringify(namespace) + " & " + JSON.stringify(key) + " & " + JSON.stringify(value));
      this.thunder.call(this.callsign, 'setValue', { namespace: namespace, key: key, value: value }).then(result => {
        this.LOG("PersistentStoreApi: setValue result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR("PersistentStoreApi: setValue error:" + JSON.stringify(err));
        reject(err);
      });
    })
  }
}
