/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
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

const MaintenanceStatus = Object.freeze({
    MAINTENANCE_IDLE: 'MAINTENANCE_IDLE',
    MAINTENANCE_STARTED: 'MAINTENANCE_STARTED',
    MAINTENANCE_ERROR: 'MAINTENANCE_ERROR',
    MAINTENANCE_COMPLETE: 'MAINTENANCE_COMPLETE',
    MAINTENANCE_INCOMPLETE: 'MAINTENANCE_INCOMPLETE'
});

const UpgradeOutOutMode = Object.freeze({
    NONE: 'NONE',
    ENFORCE_OPTPOUT: 'ENFORCE_OPTPOUT',
    BYPASS_OPTOUT: 'BYPASS_OPTOUT',
    IGNORE_UPDATE: 'IGNORE_UPDATE'
});

const MaintenanceMode = Object.freeze({
    FOREGROUND: 'FOREGROUND',
    BACKGROUND: 'BACKGROUND'
});

class MaintenanceMgrApi {
    static _instance = null;
    constructor() {
        if (MaintenanceMgrApi._instance) {
            return MaintenanceMgrApi._instance;
        }
        this.callsign = 'org.rdk.MaintenanceManager';
        this.logtag = 'MaintMgrApi: ';
        this.thunder = ThunderJS(CONFIG.thunderConfig);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
        this.eventListeners = {};
        MaintenanceMgrApi._instance = this;
    }

    static getInstance() {
        if (!MaintenanceMgrApi._instance) {
            MaintenanceMgrApi._instance = new MaintenanceMgrApi();
        }
        return MaintenanceMgrApi._instance;
    }


    /**
     * Internal helper to make Thunder API calls
     * @param {string} method - The method name
     * @param {object} params - The parameters object
     * @returns {Promise}
     */
    _call(method, params = {}) {
        return new Promise((resolve, reject) => {
            this.thunder.call(this.callsign, method, params).then(result => {
                this.INFO(this.logtag + `${method} result: ${JSON.stringify(result)}`);
                if (result) {
                    resolve(result);
                } else {
                    reject(false);
                }
            }).catch(err => {
                this.ERR(this.logtag + `${method} error: ${JSON.stringify(err)}`);
                reject(err);
            });
        });
    }

    /**
     * Register event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }

        const listener = this.thunder.on(this.callsign, event, callback);
        this.eventListeners[event].push({ callback, listener });
        return listener;
    }

    /**
     * Unregister event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
        if (!this.eventListeners[event]) {
            return;
        }

        const index = this.eventListeners[event].findIndex(entry => entry.callback === callback);
        if (index === -1) {
            return;
        }

        const { listener } = this.eventListeners[event][index];
        if (listener && typeof listener.dispose === 'function') {
            listener.dispose();
        }

        this.eventListeners[event].splice(index, 1);
        if (this.eventListeners[event].length === 0) {
            delete this.eventListeners[event];
        }
    }

    /************************** Methods *********************/

    getMaintenanceActivityStatus() {
        return this._call('getMaintenanceActivityStatus');
    }

    getMaintenanceStartTime() {
        return this._call('getMaintenanceStartTime');
    }

    setMaintenanceMode(maintenanceMode = MaintenanceMode.BACKGROUND, optOut = UpgradeOutOutMode.NONE) {
        return this._call('setMaintenanceMode', { maintenanceMode, optOut });
    }

    startMaintenance() {
        return this._call('startMaintenance');
    }

    stopMaintenance() {
        return this._call('stopMaintenance');
    }

    getMaintenanceMode() {
        return this._call('getMaintenanceMode');
    }
}

export default MaintenanceMgrApi.getInstance();
export { MaintenanceStatus, UpgradeOutOutMode, MaintenanceMode };
