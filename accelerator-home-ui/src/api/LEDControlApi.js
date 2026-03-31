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
import { CONFIG } from '../Config/Config';
import { Metrics } from '@firebolt-js/sdk';
import { GLOBALS } from '../Config/Config';

export const LEDControlState = {
  NONE: 'NONE',
  ACTIVE: 'ACTIVE',
  STANDBY: 'STANDBY',
  WPS_CONNECTING: 'WPS_CONNECTING',
  WPS_CONNECTED: 'WPS_CONNECTED',
  WPS_ERROR: 'WPS_ERROR',
  FACTORY_RESET: 'FACTORY_RESET',
  USB_UPGRADE: 'USB_UPGRADE',
  DOWNLOAD_ERROR: 'DOWNLOAD_ERROR',
};

class LEDControlApi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.LEDControl';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this._isSupportedPromise = this._fetchIsSupported();
    this._supportedLEDStatesPromise = null;
  }

  _fetchIsSupported() {
    return this.thunder.call('Controller', `status@${this.callsign}`).then(result => {
      const supported = Array.isArray(result) ? result.length > 0 : !!result;
      this.LOG(this.callsign + ' isSupported result: ' + supported);
      return supported;
    }).catch(err => {
      this.ERR(this.callsign + ' isSupported error: ' + JSON.stringify(err));
      return false;
    });
  }

  isSupported() {
    return this._isSupportedPromise;
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + ' activate result: ' + JSON.stringify(result));
        resolve(true);
      }).catch(err => {
        this.ERR(this.callsign + ' activate error: ' + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, 'LEDControlApiError', 'Error while Thunder Controller LEDControl activate ' + JSON.stringify(err), false, null);
        reject(err);
      });
    });
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + ' deactivate result: ' + JSON.stringify(result));
        this._supportedLEDStatesPromise = null;
        resolve(true);
      }).catch(err => {
        this.ERR(this.callsign + ' deactivate error: ' + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, 'LEDControlApiError', 'Error while Thunder Controller LEDControl deactivate ' + JSON.stringify(err), false, null);
        reject(err);
      });
    });
  }

  getLEDState() {
    return new Promise((resolve, reject) => {
      this.isSupported().then(isSupported => {
        if (!isSupported) {
          this.LOG(this.callsign + ' getLEDState skipped: plugin not supported on this platform');
          resolve(null);
          return;
        }

        this.thunder.call(this.callsign, 'getLEDState').then(result => {
          this.LOG(this.callsign + ' getLEDState result: ' + JSON.stringify(result));
          resolve(result);
        }).catch(err => {
          this.ERR(this.callsign + ' getLEDState error: ' + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, 'LEDControlApiError', 'Error while Thunder LEDControl getLEDState ' + JSON.stringify(err), false, null);
          reject(err);
        });
      }).catch(err => {
        this.ERR(this.callsign + ' getLEDState support check failed: ' + JSON.stringify(err));
        resolve(null);
      });
    });
  }

  getSupportedLEDStates(forceRefresh = false) {
    if (!forceRefresh) {
      return this.isSupported().then(isSupported => {
        if (!isSupported) {
          this.LOG(this.callsign + ' getSupportedLEDStates skipped: plugin not supported on this platform');
          return [];
        }

        if (this._supportedLEDStatesPromise) {
          return this._supportedLEDStatesPromise;
        }

        this._supportedLEDStatesPromise = this.thunder.call(this.callsign, 'getSupportedLEDStates').then(result => {
          this.LOG(this.callsign + ' getSupportedLEDStates result: ' + JSON.stringify(result));
          if (result.success) {
            return result.supportedLEDStates || [];
          }
          throw result;
        }).catch(err => {
          this._supportedLEDStatesPromise = null;
          this.ERR(this.callsign + ' getSupportedLEDStates error: ' + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, 'LEDControlApiError', 'Error while Thunder LEDControl getSupportedLEDStates ' + JSON.stringify(err), false, null);
          throw err;
        });

        return this._supportedLEDStatesPromise;
      }).catch(() => {
        this.LOG(this.callsign + ' getSupportedLEDStates skipped: support check failed');
        return [];
      });
    }

    if (forceRefresh) {
      this._supportedLEDStatesPromise = null;
    }

    return this.getSupportedLEDStates(false);
  }

  setLEDState(state) {
    return new Promise((resolve) => {
      this.isSupported().then(isSupported => {
        if (!isSupported) {
          this.LOG(this.callsign + ' setLEDState skipped: plugin not supported on this platform');
          resolve(false);
          return;
        }

        this.getSupportedLEDStates().then(supportedLEDStates => {
          if (!Array.isArray(supportedLEDStates) || !supportedLEDStates.includes(state)) {
            this.LOG(this.callsign + ' setLEDState skipped: unsupported state requested: ' + state + ', supported: ' + JSON.stringify(supportedLEDStates));
            resolve(false);
            return;
          }

          this.thunder.call(this.callsign, 'setLEDState', { state }).then(result => {
            this.LOG(this.callsign + ' setLEDState result: ' + JSON.stringify(result));
            resolve(result.success === true);
          }).catch(err => {
            this.ERR(this.callsign + ' setLEDState error: ' + JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER, 'LEDControlApiError', 'Error while Thunder LEDControl setLEDState ' + JSON.stringify(err), false, null);
            resolve(false);
          });
        }).catch(err => {
          this.ERR(this.callsign + ' setLEDState failed to fetch supported states: ' + JSON.stringify(err));
          resolve(false);
        });
      }).catch(err => {
        this.ERR(this.callsign + ' setLEDState support check failed: ' + JSON.stringify(err));
        resolve(false);
      });
    });
  }

  matchLEDStateToPowerState() {
    return this.setLEDState(GLOBALS.powerState !== 'ON' ? LEDControlState.STANDBY : LEDControlState.ACTIVE);
  }
}

const ledControlApi = new LEDControlApi();
export default ledControlApi;
