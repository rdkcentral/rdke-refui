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

const thunder = ThunderJS(CONFIG.thunderConfig)
const callsign = 'org.rdk.UserSettings'
const errorName = 'UserSettingsError'

export default class UserSettingsApi {
    constructor() {
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    activate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.activate({ callsign: callsign })
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
            thunder.Controller.deactivate({ callsign: callsign })
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

    setVoiceGuidance(enable) {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'setVoiceGuidance', {
              "enabled": enable
            })
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              this.ERR("Error enable " + JSON.stringify(err))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder UserSettings setVoiceGuidance " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
      }

    getVoiceGuidance() {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'getVoiceGuidance')
            .then(result => {
              resolve(result)
            })
            .catch(err => {
              this.ERR("Error enable " + JSON.stringify(err))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder UserSettings getVoiceGuidance " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
    }
}
