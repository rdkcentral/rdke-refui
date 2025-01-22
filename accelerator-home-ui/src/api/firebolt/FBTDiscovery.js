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
import { Discovery, Metrics } from '@firebolt-js/sdk'
export default class FBTDiscovery {
    
    launch(appId,intent){
        return new Promise((resolve,reject)=>{
            Discovery.launch(appId, intent).then(success => {
                console.log( "Discovery.launch result:"+success)
                resolve(success);
            })
        .catch(err => {
            console.error('firebolt Discovery.launch error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "fireboltDiscoveryError", "Discovery.launch error"+ err, false, null)
            reject(err)
          })
        })}
}