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

import { Localization, Metrics } from '@firebolt-js/manage-sdk'

export default class FBTLocalization {

    constructor() {
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    listen(event){
        return new Promise((resolve,reject)=>{
            Localization.listen(event, value => {
                this.LOG("Firebolt listening to " + JSON.stringify(value))
                resolve(value)
                })
        .catch(err => {
            this.ERR('firebolt listen error: ' + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
            reject(err)
            })
        })
    }

    additionalInfo() {
        return new Promise((resolve, reject) => {
            Localization.additionalInfo()
                .then(info => {
                    this.LOG("AdditionalInfo: " + JSON.stringify(info))
                    resolve(info)
                })
                .catch(err => {
                    this.ERR('firebolt Localization.additionalInfo error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    countryCode() {
        return new Promise((resolve, reject) => {
            Localization.countryCode()
                .then(code => {
                    this.LOG("CountryCode: " + JSON.stringify(code))
                    resolve(code)
                })
                .catch(err => {
                    this.ERR('firebolt Localization.countryCode error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    locality() {
        return new Promise((resolve, reject) => {
            Localization.locality()
                .then(locality => {
                    this.LOG("Locality: " + JSON.stringify(locality))
                })
                .catch(err => {
                    this.ERR('firebolt Localization.locality error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    latlon() {
        return new Promise((resolve, reject) => {
            Localization.latlon()
                .then(latlong => {
                    this.LOG("LatLon: " + JSON.stringify(latlong))
                    resolve(latlong)
                })
                .catch(err => {
                    this.ERR('firebolt Localization.latlon error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }

    language() {
        return new Promise((resolve,reject)=>{
            Localization.language()
                .then(lang => {
                    this.LOG("Localization.language : " + JSON.stringify(lang))
                    resolve(lang)
                })
                .catch(err => {
                    this.ERR('firebolt Localization.language error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }

    setlanguage(lang){
        return new Promise((resolve,reject)=>{
            Localization.language(lang)
                .then(lang => {
                    this.LOG("Localization.language : " + JSON.stringify(lang))
                    resolve(lang)
                })
                .catch(err => {
                    this.ERR('firebolt Localization.language error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })

    }

    setTimeZone(zone){
        return new Promise((resolve,reject)=>{
            Localization.timeZone(zone)
                .then(zone => {
                    this.LOG("set Localization.timeZone : " + JSON.stringify(zone))
                    resolve(zone)
                })
                .catch(err => {
                    this.ERR('firebolt set Localization.timeZone error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }

    getTimeZone(){
        return new Promise((resolve,reject)=>{
            Localization.timeZone()
                .then(zone => {
                    this.LOG("get Localization.timeZone : " + JSON.stringify(zone))
                    resolve(zone)
                })
                .catch(err => {
                    this.ERR('firebolt get Localization.timeZone error: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }
}
