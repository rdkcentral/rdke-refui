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
    constructor() {
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    getaudio(){
        return new Promise((resolve,reject)=>{
            Device.audio()
            .then(supportedAudioProfiles => {
                this.LOG("supportedAudioProfiles: " + JSON.stringify(supportedAudioProfiles))
                resolve(supportedAudioProfiles)
            })
            .catch(err => {
                this.ERR("firebolt getaudio error: " + JSON.stringify(err))
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get audio error "+err, false, null)
                reject(err)
            })
        })
    }
    getdistributor(){
        return new Promise((resolve,reject)=>{
            Device.distributor()
                .then(distributorId => {
                    this.LOG("distributorId: " + JSON.stringify(distributorId))
                    resolve(distributorId)
                })
            .catch(err => {
                this.ERR("firebolt getdistributor error: " + JSON.stringify(err))
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get distributor error "+err, false, null)
                reject(err)
            })
        })
    }
    gethdcp(){
        return new Promise((resolve,reject)=>{
            Device.hdcp()
            .then(supportedHdcpProfiles => {
                this.LOG("supportedHdcpProfiles: " + JSON.stringify(supportedHdcpProfiles))
                resolve(supportedHdcpProfiles)
            })
            .catch(err => {
                this.ERR("firebolt gethdcp error: " + JSON.stringify(err))
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get hdcp error " + err, false, null)
                reject(err)
            })
        })
    }
    gethdr(){
        return new Promise((resolve,reject)=>{
            Device.hdr()
            .then(supportedHdrProfiles => {
                this.LOG("supportedHdrProfiles: " + JSON.stringify(supportedHdrProfiles))
                resolve(supportedHdrProfiles)
            })
            .catch(err => {
                this.ERR("firebolt gethdr error: " + JSON.stringify(err))
                Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get hdr error "+err, false, null)
                reject(err)
            })
        })
    }
    getid(){
        return new Promise((resolve,reject)=>{
            Device.id()
            .then(id => {
                this.LOG("id: " + JSON.stringify(id))
                resolve(id)
            })
        .catch(err => {
            this.ERR("firebolt getid error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get Id error "+err, false, null)
            reject(err)
        })
        })
    }
    getmake(){
        return new Promise((resolve,reject)=>{
            Device.make()
            .then(make => {
                this.LOG("make: " + JSON.stringify(make))
                resolve(make)
            })
        .catch(err => {
            this.ERR("firebolt getmake error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get make error "+err, false, null)
            reject(err)
        })
        })
    }
    getmodel(){
        return new Promise((resolve,reject)=>{
        Device.model()
        .then(model => {
            this.LOG("model: " + JSON.stringify(model))
            resolve(model)
        })
        .catch(err => {
            this.ERR("firebolt getmodel error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get model error " +err, false, null)
            reject(err)
        })
        }) 
    }
    getname(){
        return new Promise((resolve,reject)=>{
            Device.name()
            .then(value => {
                this.LOG("name: " + JSON.stringify(value))
                resolve(value)
            })
        .catch(err => {
            this.ERR("firebolt getname error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get name error "+err, false, null)
            reject(err)
        })
        })
    }
    getnetwork(){
        return new Promise((resolve,reject)=>{
            Device.network()
        .then(networkInfo => {
            this.LOG("networkInfo: " + JSON.stringify(networkInfo))
            resolve(networkInfo)
        })
        .catch(err => {
            this.ERR("firebolt getnetwork error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get network error "+err, false, null)
            reject(err)
        })
        })
    }
    getplatform(){
        return new Promise((resolve,reject)=>{
            Device.platform()
            .then(platformId => {
                this.LOG("platformId: " + JSON.stringify(platformId))
                resolve(platformId)
            })
        .catch(err => {
            this.ERR("firebolt getplatform error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get platform error " +err, false, null)
            reject(err)
        })
        })
    }
    getscreenresolution(){
        return new Promise((resolve,reject)=>{
            Device.screenResolution()
        .then(screenResolution => {
            this.LOG("screenResolution: " + JSON.stringify(screenResolution))
            resolve(screenResolution)
        })
        .catch(err => {
            this.ERR("firebolt getscreenresolution error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get screen resolution error " +err, false, null)
            reject(err)
        })
        })
    }
    getsku(){
        return new Promise((resolve,reject)=>{
            Device.sku()
        .then(sku => {
            this.LOG("sku: " + JSON.stringify(sku))
            resolve(sku)
        })
        .catch(err => {
            this.ERR("firebolt getsku error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get sku error "+err, false, null)
            reject(err)
        })
        })    
    }
    gettype(){
        return new Promise((resolve,reject)=>{
        Device.type()
        .then(deviceType => {
            this.LOG("deviceType: " + JSON.stringify(deviceType))
            resolve(deviceType)
        })
        .catch(err => {
            this.ERR("firebolt gettype error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get type error "+err, false, null)
            reject(err)
        })
        })
    }

    getuid(){
        return new Promise((resolve,reject)=>{
            Device.uid()
            .then(uniqueId => {
                this.LOG("uniqueId: " + JSON.stringify(uniqueId))
                resolve(uniqueId)
            })
        .catch(err => {
            this.ERR("firebolt getuid error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get uid error"+err, false, null)
            reject(err)
        })
        })
    }
    getversion(){
        return new Promise((resolve,reject)=>{
            Device.version()
        .then(versions => {
            this.LOG("versions: " + JSON.stringify(versions))
            resolve(versions)
        })
        .catch(err => {
            this.ERR("firebolt getversion error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginErrorr", "firebolt get version error "+err, false, null)
            reject(err)
        })
        })
    }
    getvideoresolution(){
        return new Promise((resolve,reject)=>{
            Device.videoResolution()
        .then(videoResolution => {
            this.LOG("videoResolution: " + JSON.stringify(videoResolution))
            resolve(videoResolution)
        })
        .catch(err => {
            this.ERR("firebolt getvideoresolution error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt get video resolution error "+err, false, null)
            reject(err)
        })
        })    
    }
    listen(event){
        return new Promise((resolve,reject)=>{
            Device.listen(event, value => {
                this.LOG("listen value: " + JSON.stringify(value))
                resolve(value)
            })
        .catch(err => {
            this.ERR("firebolt listen error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt listen error "+err, false, null)
            reject(err)
        })
        })
    }
    once(event){
        return new Promise((resolve,reject)=>{
            Device.once(event, value => {
                this.LOG("once value: " + JSON.stringify(value))
                resolve(value)
            })
        .catch(err => {
            this.ERR("firebolt once error: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "FireboltDevicePluginError", "firebolt once error "+err, false, null)
            reject(err)
        })
        })  
    }
}