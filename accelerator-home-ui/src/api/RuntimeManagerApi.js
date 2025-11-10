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
export default class RuntimeManager {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.RuntimeManager';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }
  static get() {
    if (instance === null) {
      instance = new RuntimeManager()
    }
    return instance;
  }

   activate() {
          return new Promise((resolve, reject) => {
              this.thunder.Controller.activate({ callsign: callsign })
                  .then(() => {
                      resolve(true)
                      this.INFO("RuntimeManager activated successfully");
                  })
                  .catch(err => {
                      this.ERR("Error Activation RuntimeManager" + JSON.stringify(err))
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
                    this.INFO("RuntimeManager deactivated successfully");
                })
                .catch(err => {
                    this.ERR("Error Deactivation RuntimeManager" + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
      }
}
