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
import { Router, Storage } from '@lightningjs/sdk';
import AppApi from '../api/AppApi.js';
import RDKShellApis from '../api/RDKShellApis.js';
import { GLOBALS } from '../Config/Config.js';
import { PowerState } from '../api/PowerManagerApi.js';

var appApi = new AppApi();

export default class InactivityHelper {
  constructor(...args) {
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  getInactivityConfig() {
    return {
      energySaver: parseInt(Storage.get("EnergySaverInterval"), 10),
      screenSaver: parseInt(Storage.get("ScreenSaverTimeoutInterval"), 10),
      sleepTimer: parseInt(Storage.get("TimeoutInterval"), 10)
    };
  }
  
  isValidTimeout(value) {
    return value !== null && value !== undefined && !isNaN(value) && value > 0 && value !== false;
  }

  $resetInactivity(stage) {
    switch (stage) {
      case 'EnergySaver':
        Storage.set("EnergySaverInterval", false);
        break;

      case 'ScreenSaver':
        Storage.set("ScreenSaverTimeoutInterval", false);
        break;

      case 'SleepTimer':
        Storage.set("TimeoutInterval", false);
        break;

      default:
        this.LOG(`Unknown stage: ${stage}. No storage update performed.`);

    }
    const { energySaver, screenSaver, sleepTimer } = this.getInactivityConfig();
    const activeStages = [];
    if (this.isValidTimeout(energySaver) && stage !== 'EnergySaver') activeStages.push('EnergySaver');
    if (this.isValidTimeout(screenSaver) && stage !== 'ScreenSaver') activeStages.push('ScreenSaver');
    if (this.isValidTimeout(sleepTimer) && stage !== 'SleepTimer') activeStages.push('SleepTimer');

    if (activeStages.length === 0) {
      this.LOG('No active timers left. Disabling inactivity reporting.');
      RDKShellApis.enableInactivityReporting(false)
        .catch(err => this.ERR('Error disabling inactivity: ' + JSON.stringify(err)));
    } else {
      this.LOG(`Stage ${stage} cleared, but ${activeStages.join(', ')} still active.`);
    }
  }

  $setEnergySaver(time) {
    this.LOG("Energy Saver input = " + JSON.stringify(time));
    if (!time || time.toLowerCase() === "off") {
      Storage.set("EnergySaverInterval", false);
      this.LOG("Energy Saver disabled");
      return;
    }
    let arr = time.split(" ");
    let value = parseFloat(arr[0]);
        let unit = arr[1].substring(0, 1); // "M" or "H"

    let storedTimeout = Storage.get("TimeoutInterval");
    if (storedTimeout && storedTimeout !== "Off") {
        this.LOG("Using stored timeout instead: " + storedTimeout);
        value = parseFloat(storedTimeout);
        unit = "M"; // already in minutes
    }
    // Convert to minutes
    let timeoutInMinutes = (unit === "H") ? value * 60 : value;
    return timeoutInMinutes;
  }

  standby(value) {
    this.LOG("standby call");
    if (value == 'Back') {
      // TODO: Identify what to do here.
    } else {
      if (GLOBALS.powerState == PowerState.POWER_STATE_ON) {
        this.LOG("Power state was on trying to set it to standby");
        appApi.setPowerState(value).then(res => {
          if (res) {
            this.LOG("successfully set to standby");
            GLOBALS.powerState = PowerState.POWER_STATE_STANDBY
            if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
              appApi.exitApp(GLOBALS.topmostApp);
            } else {
              if (!Router.isNavigating()) {
                Router.navigate('menu')
              }
            }
          }
        })
        return true
      }
    }
  }

  _enterSleepMode() {
    this.LOG("Attempting Deep Sleep");
    appApi.setPowerState(PowerState.POWER_STATE_DEEP_SLEEP).then(res => {
      if (res) {
        this.LOG("Sleep request success");
      } else {
        this.LOG("DEEP_SLEEP failed, falling back to LIGHT_SLEEP");
        this._enterLightSleep();
      }
    })
    .catch(err => {
      this.ERR("Error entering DEEP_SLEEP: " + JSON.stringify(err));
      this._enterLightSleep();
    });
  }
  
  _enterLightSleep() {
    appApi.setPowerState(PowerState.POWER_STATE_LIGHT_SLEEP).then(res => {
      if (res) {
          this.LOG("Successfully entered LIGHT_SLEEP");
      } else {
          this.ERR("Failed to enter LIGHT_SLEEP");
      }
    })
    .catch(err => {
      this.ERR("Error entering LIGHT_SLEEP: " + JSON.stringify(err));
    });
  }

  _convertToMinutes(value) {
    if (typeof value !== "string") {
        return value;
    }
    if (value === "Off") return null;
    if (value.includes("Minutes")) return parseInt(value);
    if (value.includes("Hour")) return parseFloat(value) * 60;
    return null;
  }

}
