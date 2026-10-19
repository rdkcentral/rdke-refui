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

const thunder = ThunderJS(CONFIG.thunderConfig)

// Standard HDMI-CEC user control codes, shared by any component that needs
// to send a CEC key press (e.g. as a fallback when IP based control fails).
export const CEC_KEYCODES = {
    VOLUME_UP: 65,
    VOLUME_DOWN: 66,
    MUTE: 67
}

// Shared (module-level) cache of the CEC device list so that any component
// using CECApi benefits from the same caching/staleness-avoidance logic,
// instead of each component re-implementing and tracking its own copy.
let cachedDeviceList = [];
let cachedDeviceListLastFetch = 0;
const DEVICE_LIST_CACHE_WINDOW_MS = 30000;

// Tracks whether we've already subscribed to onDeviceAdded/onDeviceRemoved
// on the shared ThunderJS instance, so repeated CECApi instantiations don't
// register duplicate listeners.
let deviceEventsSubscribed = false;

export default class CECApi {
    constructor() {
        this.INFO = console.info.bind(console);
        this.LOG = console.log.bind(console);
        this.ERR = console.error.bind(console);
        this.WARN = console.warn.bind(console);
        this._events = new Map();
        this._subscribeToDeviceEvents();
    }

    /**
     * Register an event listener.
     * @param {string} eventId - e.g. 'onDeviceAdded' or 'onDeviceRemoved'
     * @param {function} callback
     */
    registerEvent(eventId, callback) {
        this._events.set(eventId, callback)
    }

    // Subscribes once (shared across all CECApi instances) to CEC device
    // connect/disconnect notifications, keeping the cached device list fresh
    // and forwarding the notification to any registered listener.
    _subscribeToDeviceEvents() {
        if (deviceEventsSubscribed) {
            return;
        }
        deviceEventsSubscribed = true;

        thunder.on('org.rdk.HdmiCecSource', 'onDeviceAdded', notification => {
            console.log('CECApi onDeviceAdded: ' + JSON.stringify(notification));
            this.LOG('CECApi onDeviceAdded: ' + JSON.stringify(notification));
            // Force a refresh since the device list has just changed.
            this.getCachedDeviceList(true);
            if (this._events.has('onDeviceAdded')) {
                this._events.get('onDeviceAdded')(notification)
            }
        });

        thunder.on('org.rdk.HdmiCecSource', 'onDeviceRemoved', notification => {
            console.log('CECApi onDeviceRemoved: ' + JSON.stringify(notification));
            this.LOG('CECApi onDeviceRemoved: ' + JSON.stringify(notification));
            // Force a refresh since the device list has just changed.
            this.getCachedDeviceList(true);
            if (this._events.has('onDeviceRemoved')) {
                this._events.get('onDeviceRemoved')(notification)
            }
        });

        thunder.on('org.rdk.HdmiCecSource', 'standbyMessageReceived', notification => {
            console.log('CECApi standbyMessageReceived: ' + JSON.stringify(notification));
            this.LOG('CECApi standbyMessageReceived: ' + JSON.stringify(notification));
        });

        thunder.on('org.rdk.HdmiCecSource', 'onKeyReleaseEvent', notification => {
            console.log('CECApi onKeyReleaseEvent: ' + JSON.stringify(notification));
            this.LOG('CECApi onKeyReleaseEvent: ' + JSON.stringify(notification));
        });

        thunder.on('org.rdk.HdmiCecSource', 'onKeyPressEvent', notification => {
            console.log('CECApi onKeyPressEvent: ' + JSON.stringify(notification));
            this.LOG('CECApi onKeyPressEvent: ' + JSON.stringify(notification));
        });

        thunder.on('org.rdk.HdmiCecSource', 'onDeviceInfoUpdated', notification => {
            console.log('CECApi onDeviceInfoUpdated: ' + JSON.stringify(notification));
            this.LOG('CECApi onDeviceInfoUpdated: ' + JSON.stringify(notification));
        });
    }

    activate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.activate({ callsign: 'org.rdk.HdmiCecSource' })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    this.ERR("CEC Error Activation: " + err)
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
                    reject(err)
                })
        })
    }
    getDeviceList() {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCecSource', 'getDeviceList')
                .then(result => {
                    resolve(result.deviceList)
                })
                .catch(err => {
                    this.ERR("CECApi HdmiCecSource getDeviceList failed: " + err);
                    reject(err)
                })
        })
    }
    sendKeyPressEvent(logicalAddress, keyCode) {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCecSource', 'sendKeyPressEvent', { logicalAddress: logicalAddress, keyCode: keyCode })
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    this.ERR("CECApi HdmiCecSource sendKeyPressEvent failed: " + err);
                    reject(err)
                })
        })
    }

    // Returns the cached CEC device list, refreshing it from the backend only
    // when the cache is empty/stale (or force=true), to avoid spamming
    // getDeviceList on every call while still recovering from CEC discovery
    // not being complete yet at app startup, or the connected device changing.
    async getCachedDeviceList(force = false) {
        const now = Date.now();
        if (!force && cachedDeviceList.length && (now - cachedDeviceListLastFetch) < DEVICE_LIST_CACHE_WINDOW_MS) {
            return cachedDeviceList;
        }
        try {
            const deviceList = await this.getDeviceList();
            cachedDeviceList = Array.isArray(deviceList) ? deviceList : [];
            cachedDeviceListLastFetch = now;
        } catch (err) {
            this.ERR('CECApi getCachedDeviceList failed:' + JSON.stringify(err, null, 3));
            cachedDeviceList = [];
        }
        return cachedDeviceList;
    }

    // Common helper: replay a key press to every known/cached CEC device
    // (logicalAddress). Used as a fallback when IP-based control fails.
    async sendKeyPressEventToAllDevices(keyCode) {
        const deviceList = await this.getCachedDeviceList();
        if (!deviceList || !deviceList.length) {
            this.WARN('CECApi sendKeyPressEventToAllDevices: no CEC devices available to fallback to');
            return;
        }
        deviceList.forEach(device => {
            this.sendKeyPressEvent(device.logicalAddress, keyCode)
                .catch(err => {
                    this.ERR('CECApi sendKeyPressEventToAllDevices failed for device ' + JSON.stringify(device) + ':' + JSON.stringify(err, null, 3));
                })
        })
    }
}
