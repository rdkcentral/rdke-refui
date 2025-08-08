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

export default class CECApi {
    constructor() {
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }
    activate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.activate({ callsign: 'org.rdk.HdmiCecSource' })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    this.ERR("CEC Error Activation: " + err)
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error while Thunder Controller HdmiCecSource activate "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }
    deactivate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.deactivate({ callsign: 'org.rdk.HdmiCecSource' })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    this.ERR("CEC Error Deactivation: " + err)
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error while Thunder Controller HdmiCecSource deactivate "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }
    getEnabled() {
        return new Promise((resolve) => {
            thunder.call('org.rdk.HdmiCecSource', 'getEnabled')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("CEC Get Enabled: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource getEnabled "+JSON.stringify(err), false, null)
                    resolve({ enabled: false })
                })
        })
    }

    setEnabled() {
        return new Promise((resolve) => {
            thunder.call('org.rdk.HdmiCecSource', 'setEnabled', { enabled: true })
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("CEC Set Enabled: " + err)
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource setEnabled "+JSON.stringify(err), false, null)
                    resolve({ success: false })
                })
        })
    }
    getOSDName() {
        return new Promise((resolve) => {
            thunder.call('org.rdk.HdmiCecSource', 'getOSDName')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("getOSDName: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource getOSDName "+JSON.stringify(err), false, null)
                    resolve({ enabled: false })
                })
        })
    }
    setOSDName(osdname) {
        return new Promise((resolve) => {
            thunder.call('org.rdk.HdmiCecSource', 'setOSDName', { name: osdname })
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("setOSDName: " + err);
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource setOSDName "+JSON.stringify(err), false, null)
                    resolve({ success: false })
                })
        })
    }

    performOTP() {
        return new Promise((resolve) => {
            thunder.call('org.rdk.HdmiCecSource', 'performOTPAction')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("CEC Otp Error: " + err)
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource performOTPAction "+JSON.stringify(err), false, null)
                    resolve({ success: false })
                })
        })
    }

    getActiveSourceStatus() {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCecSource', 'getActiveSourceStatus')
                .then(result => {
                    resolve(result.status)
                })
                .catch(err => {
                    this.ERR("CECApi HdmiCecSource getActiveSourceStatus failed: " + err);
                    Metrics.error(Metrics.ErrorType.OTHER, "HdmiCecSourceError", "Error in Thunder HdmiCecSource getActiveSourceStatus "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }
}
