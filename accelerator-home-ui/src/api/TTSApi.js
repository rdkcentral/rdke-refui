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
const callsign = 'org.rdk.TextToSpeech'
const errorName = 'TextToSpeechError'

export default class TTSApi {
    activate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.activate({ callsign: callsign })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    console.log('Error Activation', err)
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
                    console.log('Error Deactivation', err)
                    Metrics.error(Metrics.ErrorType.OTHER, errorName, `Error while Thunder Controller ${callsign} deactivate ${JSON.stringify(err)}`, false, null)
                    reject(err)
                })
        })
    }

    enable(enabletts) {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'enabletts', {
              "enabletts": enabletts
            })
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              console.error("TTSApi TextToSpeech enable error:", JSON.stringify(err, 3, null))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech enable " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
      }

    isEnabled() {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'isttsenabled')
            .then(result => {
              resolve(result.isenabled)
            })
            .catch(err => {
              console.error("TTSApi TextToSpeech isEnabled error:", JSON.stringify(err, 3, null))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech isEnabled " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
    }

      setTTSConfiguration(configuration) {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'setttsconfiguration', configuration)
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              console.error("TTSApi TextToSpeech setTTSConfiguration error:", JSON.stringify(err, 3, null))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech setTTSConfiguration " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
      }

      getTTSConfiguration() {
        return new Promise((resolve) => {
          thunder
            .call(callsign, 'getttsconfiguration')
            .then(result => {
              resolve(result)
            })
            .catch(err => {
              console.error("TTSApi TextToSpeech getTTSConfiguration error:", JSON.stringify(err, 3, null))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech getTTSConfiguration " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
      }

    ttsSpeak() {
      return new Promise((resolve) => {
        thunder
          .call(callsign, 'speak', {
            "text": "speech_1"
          })
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            console.error("TTSAPI TextToSpeech speak error:", JSON.stringify(err, 3, null))
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech Speak " + JSON.stringify(err), false, null)
            resolve(false)
          })
      })
    }

    ttsResume() {
      return new Promise((resolve) => {
        thunder
          .call(callsign, 'resume', {
            "speechid": 1
          })
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            console.error("TTSAPI TextToSpeech resume error:", JSON.stringify(err, 3, null))
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech resume " + JSON.stringify(err), false, null)
            resolve(false)
          })
      })
    }

    ttsPause() {
      return new Promise((resolve) => {
        thunder
          .call(callsign, 'pause', {
            "speechid": 1
          })
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            console.error("TTSApi TextToSpeech pause error:", JSON.stringify(err, 3, null))
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech pause " + JSON.stringify(err), false, null)
            resolve(false)
          })
      })
    }

    ttsGetListVoices() {
      return new Promise((resolve) => {
        thunder
          .call(callsign, 'listvoices', {
            "language": "en-US"
          })
          .then(result => {
            resolve(result)
          })
          .catch(err => {
            console.error("TTSAPI TextToSpeech listvoices error:", JSON.stringify(err, 3, null))
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder TextToSpeech listVoices " + JSON.stringify(err), false, null)
            resolve(false)
          })
      })
    }
}
