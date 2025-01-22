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
import { Lifecycle, Metrics } from '@firebolt-js/sdk'


export default class FBTLifecycle {
    constructor() {
        this._events = new Map();
        Lifecycle.listen('background', value => {
            console.log('Fireboltapi background ' + JSON.stringify(value));
            if (this._events.has('background')) {
                this._events.get('background')(value)
            }
        })
        Lifecycle.listen('foreground', value => {
            console.log('Fireboltapi foreground ' + JSON.stringify(value));
            if (this._events.has('foreground')) {
                this._events.get('foreground')(value)
            }
        })
        Lifecycle.listen('inactive', value => {
            console.log('Fireboltapi inactive ' + JSON.stringify(value));
            if (this._events.has('inactive')) {
                this._events.get('inactive')(value)
            }
        })
        Lifecycle.listen('suspended', value => {
            console.log('Fireboltapi suspended ' + JSON.stringify(value));
            if (this._events.has('suspended')) {
                this._events.get('suspended')(value)
            }
        })
        Lifecycle.listen('unloading', value => {
            console.log('Fireboltapi unloading ' + JSON.stringify(value));
            if (this._events.has('unloading')) {
                this._events.get('unloading')(value)
            }
        })
    }

    registerEvent(eventId, callback) {
        this._events.set(eventId, callback)
    }

    close() {
        return new Promise((resolve, reject) => {
            Lifecycle.close("remoteButton")
                .then(success => {
                    console.log(success)
                    resolve(success)
                })
                .catch(err => {
                    console.error('firebolt Lifecycle.close error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    finished() {
        return new Promise((resolve, reject) => {
            Lifecycle.finished()
                .then(results => {
                    console.log(results)
                    resolve(results)
                })
                .catch(err => {
                    console.error('firebolt Lifecycle.finished error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    ready() {
        return new Promise((resolve, reject) => {
            Lifecycle.ready()
                .then(result => {
                    console.log("getting result")
                    console.log(result)
                    resolve(result)

                })
                .catch(err => {
                    console.error('firebolt Lifecycle.ready error', err)
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    state() {
        return new Promise((resolve) => {
            const state = Lifecycle.state()
            console.log(state)
            resolve(state)
        })
    }
}
