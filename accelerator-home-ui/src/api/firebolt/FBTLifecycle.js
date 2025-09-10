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
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
        Lifecycle.listen('background', value => {
            this.LOG("Fireboltapi background " + JSON.stringify(value));
            if (this._events.has('background')) {
                this._events.get('background')(value)
            }
        })
        Lifecycle.listen('foreground', value => {
            this.LOG("Fireboltapi foreground " + JSON.stringify(value));
            if (this._events.has('foreground')) {
                this._events.get('foreground')(value)
            }
        })
        Lifecycle.listen('inactive', value => {
            this.LOG("Fireboltapi inactive " + JSON.stringify(value));
            if (this._events.has('inactive')) {
                this._events.get('inactive')(value)
            }
        })
        Lifecycle.listen('suspended', value => {
            this.LOG("Fireboltapi suspended " + JSON.stringify(value));
            if (this._events.has('suspended')) {
                this._events.get('suspended')(value)
            }
        })
        Lifecycle.listen('unloading', value => {
            this.LOG("Fireboltapi unloading " + JSON.stringify(value));
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
                    this.LOG("Fireboltapi close success: " + JSON.stringify(success))
                    resolve(success)
                })
                .catch(err => {
                    this.ERR("firebolt Lifecycle.close error: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    finished() {
        return new Promise((resolve, reject) => {
            Lifecycle.finished()
                .then(results => {
                    this.LOG("Fireboltapi finished results: " + JSON.stringify(results))
                    resolve(results)
                })
                .catch(err => {
                    this.ERR("firebolt Lifecycle.finished error: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    ready() {
        return new Promise((resolve, reject) => {
            Lifecycle.ready()
                .then(result => {
                    this.LOG("Fireboltapi ready result: " + JSON.stringify(result))
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("firebolt Lifecycle.ready error: " + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, "LifecycleError", err, false, null)
                    reject(err)
                })
        })
    }
    state() {
        return new Promise((resolve) => {
            const state = Lifecycle.state()
            this.LOG("Fireboltapi state: " + JSON.stringify(state))
            resolve(state)
        })
    }
}
