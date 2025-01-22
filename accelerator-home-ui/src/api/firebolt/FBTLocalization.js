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

    listen(event){
        return new Promise((resolve,reject)=>{
            Localization.listen(event, value => {
                console.log("Firebolt listening to ",JSON.stringify(value))
                resolve(value)
                })
        .catch(err => {
            console.error('firebolt listen error', err)
            Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
            reject(err)
            })
        })
    }

    additionalInfo() {
        return new Promise((resolve, reject) => {
            Localization.additionalInfo()
                .then(info => {
                    console.log(info)
                    resolve(info)
                })
                .catch(err => {
                    console.error('firebolt Localization.additionalInfo error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    countryCode() {
        return new Promise((resolve, reject) => {
            Localization.countryCode()
                .then(code => {
                    console.log(code)
                    resolve(code)
                })
                .catch(err => {
                    console.error('firebolt Localization.countryCode error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    locality() {
        return new Promise((resolve, reject) => {
            Localization.locality()
                .then(locality => {
                    console.log(locality)
                })
                .catch(err => {
                    console.error('firebolt Localization.locality error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }
    latlon() {
        return new Promise((resolve, reject) => {
            Localization.latlon()
                .then(latlong => {
                    console.log(latlong)
                    resolve(latlong)
                })
                .catch(err => {
                    console.error('firebolt Localization.latlon error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject(err)
                })
        })
    }

    language() {
        return new Promise((resolve,reject)=>{
            Localization.language()
                .then(lang => {
                    console.log('Localization.language :'+ lang)
                    resolve(lang)
                })
                .catch(err => {
                    console.error('firebolt Localization.language error :', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }

    setlanguage(lang){
        return new Promise((resolve,reject)=>{
            Localization.language(lang)
                .then(lang => {
                    console.log('Localization.language :'+ lang)
                    resolve(lang)
                })
                .catch(err => {
                    console.error('firebolt Localization.language error :', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })

    }

    setTimeZone(zone){
        return new Promise((resolve,reject)=>{
            Localization.timeZone(zone)
                .then(zone => {
                    console.log('set Localization.timeZone :'+ zone)
                    resolve(zone)
                })
                .catch(err => {
                    console.error('firebolt set Localization.timeZone error :', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }

    getTimeZone(){
        return new Promise((resolve,reject)=>{
            Localization.timeZone()
                .then(zone => {
                    console.log('get Localization.timeZone :'+ zone)
                    resolve(zone)
                })
                .catch(err => {
                    console.error('firebolt get Localization.timeZone error :', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LocalizationError", err, false, null)
                    reject (err)
                })
        })
    }
}
