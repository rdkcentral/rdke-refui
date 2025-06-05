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
import { Metrics } from "@firebolt-js/sdk";
export default class OCIContainer {
    constructor() {
        this._thunder = ThunderJS(CONFIG.thunderConfig);
    }
//callsign
    activate() {
        return new Promise((resolve,reject) => {
        this._thunder.Controller.activate({ callsign: 'org.rdk.OCIContainer' }).then((res) => {
        console.log(res)
        resolve(res)
        }).catch(err => {
            reject(err)
            console.error('OCIContainer: Error Activation ', err);
            Metrics.error(Metrics.ErrorType.OTHER,"OCIContainerError", "Error while Thunder Controller OCIContainer activate "+JSON.stringify(err), false, null)
        })
        })
    }
    deactivate()
    {
    return new Promise((resolve,reject) => {
        this._thunder.Controller.deactivate({ callsign: 'org.rdk.OCIContainer' }).then((res) => {
            console.log("OCIContainer: deactivated org.rdk.OCIContainer" +res)
            resolve(res)
        }).catch(err => {
            reject(err)
            console.error('OCIContainer: Error deactivation ', err)
            Metrics.error(Metrics.ErrorType.OTHER,"OCIContainerError", "Error while Thunder Controller OCIContainer deactivate "+JSON.stringify(err), false, null)
        })
        })
    }
}