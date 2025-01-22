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

import { Device, Metrics } from '@firebolt-js/sdk'

export default class FBTDeviceInfo {
    
    getaudio(){
            return new Promise((resolve,reject)=>{
            Device.audio()
            .then(supportedAudioProfiles => {
                console.log(supportedAudioProfiles)
                resolve(supportedAudioProfiles)
            })
            .catch(err => {
                console.error('firebolt getaudio error', err)
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get audio error "+err, false, null)
                reject(err)
              })
            })}
    getdistributor(){
            return new Promise((resolve,reject)=>{
            Device.distributor()
                .then(distributorId => {
                    console.log(distributorId)
                    resolve(distributorId)
                })
            .catch(err => {
                console.error('firebolt getdistributor error', err)
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get distributor error "+err, false, null)
                reject(err)
              })
            })}
    gethdcp(){
            return new Promise((resolve,reject)=>{
            Device.hdcp()
            .then(supportedHdcpProfiles => {
                console.log(supportedHdcpProfiles)
                resolve(supportedHdcpProfiles)
            })
            .catch(err => {
                console.error('firebolt gethdcp error', err)
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get hdcp error " + err, false, null)
                reject(err)
              })
            })}
    gethdr(){
            return new Promise((resolve,reject)=>{
            Device.hdr()
            .then(supportedHdrProfiles => {
                console.log(supportedHdrProfiles)
                resolve(supportedHdrProfiles)
            })
            .catch(err => {
                console.error('firebolt gethdr error', err)
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get hdr error "+err, false, null)
                reject(err)
              })
            })}
    getid(){
        return new Promise((resolve,reject)=>{
            Device.id()
            .then(id => {
                console.log(id)
                resolve(id)
            })
        .catch(err => {
            console.error('firebolt getid error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get Id error "+err, false, null)
            reject(err)
            })
        })}
    getmake(){
        return new Promise((resolve,reject)=>{
            Device.make()
            .then(make => {
                console.log(make)
                resolve(make)
            })
        .catch(err => {
            console.error('firebolt getmake error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get make error "+err, false, null)
            reject(err)
            })
        })}
    getmodel(){
        return new Promise((resolve,reject)=>{
        Device.model()
        .then(model => {
            console.log(model)
            resolve(model)
        })
        .catch(err => {
            console.error('firebolt getmodel error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get model error " +err, false, null)
            reject(err)
            })
        })} 
        
    getname(){
        return new Promise((resolve,reject)=>{
            Device.name()
            .then(value => {
                console.log(value)
                resolve(value)
            })
        .catch(err => {
            console.error('firebolt getname error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get name error "+err, false, null)
            reject(err)
            })
        })}
    getnetwork(){
        return new Promise((resolve,reject)=>{
            Device.network()
        .then(networkInfo => {
            console.log(networkInfo)
            resolve(networkInfo)
        })
        .catch(err => {
            console.error('firebolt getnetwork error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get network error "+err, false, null)
            reject(err)
            })
        })}
    getplatform(){
        return new Promise((resolve,reject)=>{
            Device.platform()
            .then(platformId => {
                console.log(platformId)
                resolve(platformId)
            })
        .catch(err => {
            console.error('firebolt getplatform error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get platform error " +err, false, null)
            reject(err)
            })
        })}
    getscreenresolution(){
        return new Promise((resolve,reject)=>{
            Device.screenResolution()
        .then(screenResolution => {
            console.log(screenResolution)
            resolve(screenResolution)
        })
        .catch(err => {
            console.error('firebolt getscreenresolution error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get screen resolution error " +err, false, null)
            reject(err)
            })
        })}
    getsku(){
        return new Promise((resolve,reject)=>{
            Device.sku()
        .then(sku => {
            console.log(sku)
            resolve(sku)
        })
        .catch(err => {
            console.error('firebolt getsku error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get sku error "+err, false, null)
            reject(err)
            })
        })}    
    gettype(){
        return new Promise((resolve,reject)=>{
        Device.type()
        .then(deviceType => {
            console.log(deviceType)
            resolve(deviceType)
        })
        .catch(err => {
            console.error('firebolt gettype error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get type error "+err, false, null)
            reject(err)
            })
        })}

    getuid(){
        return new Promise((resolve,reject)=>{
            Device.uid()
            .then(uniqueId => {
                console.log(uniqueId)
                resolve(uniqueId)
            })
        .catch(err => {
            console.error('firebolt getuid error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get uid error"+err, false, null)
            reject(err)
            })
        })}
    getversion(){
        return new Promise((resolve,reject)=>{
            Device.version()
        .then(versions => {
            console.log(versions)
            resolve(versions)
        })
        .catch(err => {
            console.error('firebolt getversion error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginErrorr", "firebolt get version error "+err, false, null)
            reject(err)
            })
        })}
    getvideoresolution(){
        return new Promise((resolve,reject)=>{
            Device.videoResolution()
        .then(videoResolution => {
            console.log(videoResolution)
            resolve(videoResolution)
        })
        .catch(err => {
            console.error('firebolt getvideoresolution error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get video resolution error "+err, false, null)
            reject(err)
            })
        })}    
    
    listen(event){
    return new Promise((resolve,reject)=>{
        Device.listen(event, value => {
            console.log(value)
            resolve(value)
            })
    .catch(err => {
        console.error('firebolt listen error', err)
        Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt listen error "+err, false, null)
        reject(err)
        })
    })}
    once(event){
        return new Promise((resolve,reject)=>{
            Device.once(event, value => {
                console.log(value)
                resolve(value)
                })
        .catch(err => {
            console.error('firebolt listen error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt once error "+err, false, null)
            reject(err)
            })
        })}  
    
}