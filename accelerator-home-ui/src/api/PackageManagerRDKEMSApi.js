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
export default class PackageManagerRDKEMSApi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.PackageManagerRDKEMS';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }
  static get() {
    if (instance === null) {
      instance = new PackageManagerRDKEMSApi()
    }
    return instance;
  }

   activate() {
          return new Promise((resolve, reject) => {
              this.thunder.Controller.activate({ callsign: callsign })
                  .then(() => {
                      resolve(true)
                      this.INFO("PackageManagerRDKEMS activated successfully");
                  })
                  .catch(err => {
                      this.ERR("Error Activation PackageManagerRDKEMS" + JSON.stringify(err))
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
                    this.INFO("PackageManagerRDKEMS deactivated successfully");
                })
                .catch(err => {
                    this.ERR("Error Deactivation PackageManagerRDKEMS" + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }

    listPackages() {
        return new Promise((resolve, reject) => {
          this.thunder.call(this.callsign, 'listPackages', {}).then(result => {
            this.LOG(" listPackages result:", JSON.stringify(result))
            resolve(result.packages)
          }).catch(err => {
            this.ERR(" listPackages error:", JSON.stringify(err))
            reject(err)
          })
    })
    }

    getStorageDetails(packageId,version) {
        return new Promise((resolve, reject) => {
          this.thunder.call(this.callsign, 'getStorageDetails', { "packageId":packageId, "version":version }).then(result => {
            this.LOG(" getStorageDetails result:", JSON.stringify(result))
            resolve(result)
          }).catch(err => {
            this.ERR(" getStorageDetails error:", JSON.stringify(err))
            reject(err)
          })
    })
    }
    
    config(packageId,version) {
        return new Promise((resolve, reject) => {   
            this.thunder.call(this.callsign, 'config', { "packageId":packageId, "version":version }).then(result => {   
            this.LOG(" config result:", JSON.stringify(result))
            resolve(result)
          }).catch(err => {
            this.ERR(" config error:", JSON.stringify(err))
            reject(err)
          })
    })
    }

    uninstall(packageId,version,fileLocator,additionalMetadata) {
        return new Promise((resolve, reject) => {   
            this.thunder.call(this.callsign, 'uninstall', { "packageId":packageId, "version":version, "fileLocator":fileLocator, "additionalMetadata":additionalMetadata }).then(result => {   
            this.LOG(" uninstall result:", JSON.stringify(result))
            resolve(result)
          }).catch(err => {
            this.ERR(" uninstall error:", JSON.stringify(err))
            reject(err)
          })
    })
    }

    install(packageId,version,fileLocator,additionalMetadata) {
        return new Promise((resolve, reject) => {   
            this.thunder.call(this.callsign, 'install', { "packageId":packageId, "version":version, "fileLocator":fileLocator, "additionalMetadata":additionalMetadata }).then(result => {   
            this.LOG(" install result:", JSON.stringify(result))
            resolve(result)
          }).catch(err => {
            this.ERR(" install error:", JSON.stringify(err))
            reject(err)
          })
    })
    }
    packageState(packageId,version) {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, 'packageState', { "packageId":packageId, "version":version }).then(result => {
            this.LOG(" packageState result:", JSON.stringify(result))
            resolve(result)
          } ).catch(err => {  
            this.ERR(" packageState error:", JSON.stringify(err))
            reject(err)
          })
    })
    }
}