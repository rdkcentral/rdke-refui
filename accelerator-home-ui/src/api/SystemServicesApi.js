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

const SystemMode = Object.freeze({
    MODE_NORMAL: "NORMAL",
    MODE_EAS: "EAS",
    MODE_WAREHOUSE: "WAREHOUSE"
});

const FWUpdateAvailableEnum = Object.freeze({
    FW_UPDATE_AVAILABLE: 0,
    FW_MATCH_CURRENT_VER: 1,
    NO_FW_VERSION: 2,
    EMPTY_SW_UPDATE_CONF: 3
});

const FWUpdateState = Object.freeze({
    FWUpdateStateUninitialized: 0,
    FWUpdateStateRequesting: 1,
    FWUpdateStateDownloading: 2,
    FWUpdateStateFailed: 3,
    FWUpdateStateDownloadComplete: 4,
    FWUpdateStateValidationComplete: 5,
    FWUpdateStatePreparingReboot: 6,
    FWUpdateStateNoUpgradeNeeded: 7,
});

// 2. Map the enum values to human-readable strings
const FirmwareUpdateStateStr = Object.freeze({
    [FWUpdateState.FWUpdateStateUninitialized]: 'Uninitialized',
    [FWUpdateState.FWUpdateStateRequesting]: 'Requesting',
    [FWUpdateState.FWUpdateStateDownloading]: 'Downloading',
    [FWUpdateState.FWUpdateStateFailed]: 'Failed',
    [FWUpdateState.FWUpdateStateDownloadComplete]: 'Download Complete',
    [FWUpdateState.FWUpdateStateValidationComplete]: 'Validation Complete',
    [FWUpdateState.FWUpdateStatePreparingReboot]: 'Preparing to Reboot',
    [FWUpdateState.FWUpdateStateNoUpgradeNeeded]: 'No Upgrade Needed',
});

function getFirmwareUpdateStateString(state) {
    return FirmwareUpdateStateStr[state] ?? 'Unknown State';
}

class SystemServices {
    static _instance = null;
    constructor() {
        if (SystemServices._instance) {
            return SystemServices._instance;
        }
        this.callsign = 'org.rdk.System';
        this.logtag = 'SysSrv: ';
        this.thunder = ThunderJS(CONFIG.thunderConfig);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
        this.eventListeners = {};
        SystemServices._instance = this;
    }

    static getInstance() {
        if (!SystemServices._instance) {
            SystemServices._instance = new SystemServices();
        }
        return SystemServices._instance;
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
        this.eventListeners[event].push(callback);

        // Subscribe to the event via Thunder
        this.thunder.subscribe({
            event: `${this.callsign}.${event}`
        }, callback);
    }

    /**
     * Unregister event listener
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }

        // Unsubscribe from the event via Thunder
        this.thunder.unsubscribe({
            event: `${this.callsign}.${event}`
        }, callback);
    }

    /************************** Methods *********************/
    /**
     * Get network standby mode status
     * @returns {Promise}
     */
    getNetworkStandbyMode() {
        return this._call('getNetworkStandbyMode');
    }

    /**
     * Enable/disable network during standby
     * @param {boolean} nwStandby - Network standby enabled
     * @returns {Promise}
     */
    setNetworkStandbyMode(nwStandby = true) {
        return this._call('setNetworkStandbyMode', { nwStandby });
    }

    /**
     * Get reason for last wakeup
     * @returns {Promise}
     */
    getWakeupReason() {
        return this._call('getWakeupReason');
    }

    /**
     * Get key code that triggered wakeup
     * @returns {Promise}
     */
    getLastWakeupKeyCode() {
        return this._call('getLastWakeupKeyCode');
    }

    /**
     * Configure wake sources per power state
     * @param {string} powerState - Target power state
     * @param {array} wakeupSources - Wakeup sources to enable
     * @returns {Promise}
     */
    setWakeupSrcConfiguration(powerState, wakeupSources = []) {
        return this._call('setWakeupSrcConfiguration', { powerState, wakeupSources });
    }

    /**
     * Schedule wake from deep sleep
     * @param {number} seconds - Seconds until wakeup
     * @returns {Promise}
     */
    setDeepSleepTimer(seconds) {
        return this._call('setDeepSleepTimer', { seconds });
    }

    /**
     * Get power state before last reboot
     * @returns {Promise}
     */
    getPowerStateBeforeReboot() {
        return this._call('getPowerStateBeforeReboot');
    }

    /**
     * Initiate firmware update process
     * @param {string} url - Firmware download URL
     * @returns {Promise}
     */
    updateFirmware() {
        return this._call('updateFirmware');
    }

    /**
     * Get firmware update availability
     * @param {string} GUID - Request GUID (async operation)
     * @returns {Promise}
     */
    getFirmwareUpdateInfo(GUID = '') {
        return this._call('getFirmwareUpdateInfo', { GUID });
    }

    /**
     * Get current firmware update state
     * @returns {Promise}
     */
    getFirmwareUpdateState() {
        return this._call('getFirmwareUpdateState');
    }

    /**
     * Get info about downloaded firmware
     * @returns {Promise}
     */
    getDownloadedFirmwareInfo() {
        return this._call('getDownloadedFirmwareInfo');
    }

    /**
     * Get download progress percentage
     * @returns {Promise}
     */
    getFirmwareDownloadPercent() {
        return this._call('getFirmwareDownloadPercent');
    }

    /**
     * Get reason for last update failure
     * @returns {Promise}
     */
    getLastFirmwareFailureReason() {
        return this._call('getLastFirmwareFailureReason');
    }

    /**
     * Enable/disable automatic reboot after update
     * @param {boolean} enable - Auto reboot enabled
     * @returns {Promise}
     */
    setFirmwareAutoReboot(enable = true) {
        return this._call('setFirmwareAutoReboot', { enable });
    }

    /**
     * Set system timezone with DST awareness
     * @param {string} timeZone - Timezone identifier
     * @param {number} accuracy - Timezone accuracy
     * @returns {Promise}
     */
    setTimeZoneDST(timeZone, accuracy = 0) {
        return this._call('setTimeZoneDST', { timeZone, accuracy });
    }

    /**
     * Get current timezone configuration
     * @returns {Promise}
     */
    getTimeZoneDST() {
        return this._call('getTimeZoneDST');
    }

    /**
     * Get list of available timezones
     * @returns {Promise}
     */
    getTimeZones() {
        return this._call('getTimeZones');
    }

    /**
     * Set device territory/region
     * @param {string} territory - Territory code (ISO 3166-1)
     * @param {string} region - Region code (ISO 3166-2)
     * @returns {Promise}
     */
    setTerritory(territory, region = '') {
        return this._call('setTerritory', { territory, region });
    }

    /**
     * Get current territory configuration
     * @returns {Promise}
     */
    getTerritory() {
        return this._call('getTerritory');
    }

    /**
     * Set user-friendly device name
     * @param {string} friendlyName - Device friendly name
     * @returns {Promise}
     */
    setFriendlyName(friendlyName) {
        return this._call('setFriendlyName', { friendlyName });
    }

    /**
     * Get current friendly name
     * @returns {Promise}
     */
    getFriendlyName() {
        return this._call('getFriendlyName');
    }

    /**
     * Set operating mode
     * @param {object} modeInfo - Mode info with mode and optional duration
     * @returns {Promise}
     */
    setMode(mode, duration = 0) {
        return this._call('setMode', { mode, duration });
    }

    /**
     * Get device serial number
     * @returns {Promise}
     */
    getSerialNumber() {
        return this._call('getSerialNumber');
    }

    /**
     * Get manufacturing serial number
     * @returns {Promise}
     */
    getMfgSerialNumber() {
        return this._call('getMfgSerialNumber');
    }

    /**
     * Get software version information
     * @returns {Promise}
     */
    getSystemVersions() {
        return this._call('getSystemVersions');
    }

    /**
     * Get network interface MAC addresses (async)
     * @param {string} GUID - Request GUID
     * @returns {Promise}
     */
    getMacAddresses(GUID = '') {
        return this._call('getMacAddresses', { GUID });
    }

    /**
     * Get system uptime in seconds
     * @returns {Promise}
     */
    requestSystemUptime() {
        return this._call('requestSystemUptime');
    }

    /**
     * Get boot type and reason
     * @returns {Promise}
     */
    getBootTypeInfo() {
        return this._call('getBootTypeInfo');
    }

    /**
     * Get software build type (debug/release)
     * @returns {Promise}
     */
    getBuildType() {
        return this._call('getBuildType');
    }

    /**
     * Get device migration status
     * @returns {Promise}
     */
    getMigrationStatus() {
        return this._call('getMigrationStatus');
    }

    /**
     * Set device migration status
     * @param {string} status - Migration status
     * @returns {Promise}
     */
    setMigrationStatus(status) {
        return this._call('setMigrationStatus', { status });
    }

    /**
     * Query platform capabilities
     * @param {string} query - Capability query
     * @returns {Promise}
     */
    getPlatformConfiguration(query) {
        return this._call('getPlatformConfiguration', { query });
    }

    /**
     * Check telemetry opt-out status
     * @returns {Promise}
     */
    isOptOutTelemetry() {
        return this._call('isOptOutTelemetry');
    }

    /**
     * Enable/disable telemetry collection
     * @param {boolean} optOut - Opt out enabled
     * @returns {Promise}
     */
    setOptOutTelemetry(optOut = true) {
        return this._call('setOptOutTelemetry', { 'Opt-Out': optOut });
    }

    /**
     * Get current blocklist status
     * @returns {Promise}
     */
    getBlocklistFlag() {
        return this._call('getBlocklistFlag');
    }

    /**
     * Set blocklist flag
     * @param {string} blocklist - Blocklist content
     * @returns {Promise}
     */
    setBlocklistFlag(blocklist = true) {
        return this._call('setBlocklistFlag', { blocklist });
    }

    /**
     * Get Factory Shipped Reset flag
     * @returns {Promise}
     */
    getFSRFlag() {
        return this._call('getFSRFlag');
    }

    /**
     * Set FSR flag
     * @param {string} fsrFlag - FSR flag value
     * @returns {Promise}
     */
    setFSRFlag(fsrFlag = true) {
        return this._call('setFSRFlag', { fsrFlag });
    }

    /**
     * Asynchronous log upload with status events
     * @returns {Promise}
     */
    uploadLogsAsync() {
        return this._call('uploadLogsAsync');
    }

    /**
     * Cancel in-progress log upload
     * @returns {Promise}
     */
    abortLogUpload() {
        return this._call('abortLogUpload');
    }

    /**
     * Get human-readable firmware update state string
     * @param {number} state - Firmware update state enum value
     * @returns {string} - Human-readable state string
     */
    getFirmwareUpdateStateString(state) {
        return getFirmwareUpdateStateString(state);
    }
}

export default SystemServices.getInstance();
export { FWUpdateState, FWUpdateAvailableEnum, SystemMode };
