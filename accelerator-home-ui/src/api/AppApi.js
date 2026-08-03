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
import { Language, Router, Settings, Storage } from '@lightningjs/sdk';
import HDMIApi from './HDMIApi';
import NetflixIIDs from "../../static/data/NetflixIIDs.json";
import HomeApi from './HomeApi';
import { availableLanguageCodes, CONFIG, GLOBALS } from '../Config/Config.js';
import PowerManagerApi from './PowerManagerApi.js';
import RDKWindowManager from './RDKWindowManagerApi.js';
import AppManager from './AppManagerApi.js';

const thunder = ThunderJS(CONFIG.thunderConfig)

/**
 * Class that contains functions which commuicates with thunder API's
 */
export default class AppApi {
  constructor() {
    this.activatedForeground = false
    this._events = new Map()
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the Bluetooth plugin.
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }

  fetchTimeZone() {
    return new Promise((resolve) => {
      thunder.call('org.rdk.System', 'getTimeZones')
        .then(result => {
          resolve(result.zoneinfo)
        })
        .catch(err => {
          this.ERR('AppAPI Cannot fetch time zone', err)
          resolve({})
        })
    })
  }


  /**
   * Function to launch Html app.
   * @param {String} url url of app.
   */
  /**
  *  Function to get timeZone
  */
  getZone() {
    return new Promise((resolve) => {
      thunder.call('org.rdk.System', 'getTimeZoneDST')
        .then(result => {
          resolve(result.timeZone)
        })
        .catch(err => {
          this.ERR('AppAPI System plugin getTimeZoneDST failed.' + JSON.stringify(err));
          resolve(undefined)
        })
    })
  }

  setZone(zone) {
    this.LOG(zone)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'setTimeZoneDST', { timeZone: zone })
        .then(result => {
          resolve(result.success)
        }).catch(err => {
          this.ERR("AppAPI System plugin setTimeZoneDST failed." + JSON.stringify(err));
          resolve(false)
        })
    }).catch(err => {
      this.ERR("AppAPI activate System failed." + JSON.stringify(err));
    })
  }


  getPluginStatus(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI Controller plugin '" + plugin + "' status check failed.");
          reject(err)
        })
    })
  }


  /**
   * Function to get resolution of the display screen.
   */
  getResolution() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getCurrentResolution', {
          "videoDisplay": "HDMI0"
        })
        .then(result => {
          resolve(result.resolution)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings plugin getCurrentResolution failed." + JSON.stringify(err));
          resolve('NA')
        });
    })

  }

  activateDisplaySettings() {
    return new Promise((resolve) => {
      const systemcCallsign = "org.rdk.DisplaySettings"
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings failed.' + JSON.stringify(err))
        })
    });
  }

  getSupportedResolutions() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSupportedResolutions', { params: 'HDMI0' })
            .then(result => {
              resolve(result.supportedResolutions)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings getSupportedResolutions failed." + JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to set the display resolution.
   */
  setResolution(res) {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'setCurrentResolution', {
              videoDisplay: 'HDMI0',
              resolution: res,
              persist: true,
            })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings setCurrentResolution failed." + JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to get HDCP Status.
   */
  getHDCPStatus() {
    return new Promise((resolve) => {
        thunder.call('org.rdk.HdcpProfile', 'getHDCPStatus').then(result => {
            this.LOG("AppAPI HdcpProfile getHDCPStatus : " + JSON.stringify(result.HDCPStatus));
            resolve(result.HDCPStatus)
        }).catch(err => {
            this.ERR("AppAPI HdcpProfile getHDCPStatus failed." + JSON.stringify(err));
            resolve(false)
        })
    })
  }

  /**
   * Function to get TV HDR Support.
   */
  getTvHDRSupport() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getTvHDRSupport')
            .then(result => {
              this.LOG("AppAPI DisplaySettings getTvHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings getTvHDRSupport failed." + JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to get settop box HDR Support.
   */
  getSettopHDRSupport() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSettopHDRSupport')
            .then(result => {
              this.LOG("AppAPI DisplaySettings getSettopHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR('AppAPI DisplaySettings getSettopHDRSupport failed ', JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err))
        })
    })
  }

  /**
   * Function to get HDR Format in use.
   */
  getHDRSetting() {
    return new Promise((resolve) => {
        thunder.call('DisplayInfo', 'hdrsetting').then(result => {
            this.LOG("AppAPI DisplayInfo hdrsetting : " + JSON.stringify(result));
            resolve(result)
        }).catch(err => {
            this.ERR("AppAPI DisplayInfo hdrsetting failed : " + JSON.stringify(err));
            resolve(false)
        })
    })
  }

  /**
   * Function to get DRMs.
   */
  getDRMS() {
    return new Promise((resolve) => {
        thunder.call('OCDM', 'drms').then(result => {
            this.LOG("AppAPI OCDM supported drms: " + JSON.stringify(result));
            resolve(result)
        }).catch(err => {
            this.ERR("AppAPI OCDM drms failed." + JSON.stringify(err));
            resolve(false)
        })
    })
  }

  /**
   * Function to clear cache.
   */
  clearCache() {
    return new Promise((resolve) => {
      thunder
        .call(GLOBALS.selfClientName, 'delete', { path: ".cache" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI ResidentApp delete cache failed.");
          resolve(err)
        })
    })
  }

  /**
   * Function to launch All types of apps. Accepts 2 params.
   * @param {String} callsign String required callsign of the particular app.
   * @param {Object} args Object optional depending on following properties.
   *  @property {string} url: optional for YouTube & netflix | required for Lightning and WebApps
   *  @property {string} launchLocation: optional | to pass Netflix IIDs or YouTube launch reason | launchLocation value is one among these values ["mainView", "dedicatedButton", "appsMenu", "epgScreen", "dial", "gracenote","alexa"]
   *  @property {boolean} preventInternetCheck: optional | true will prevent bydefault check for internet
   *  @property {boolean} preventCurrentExit: optional |  true will prevent bydefault launch of previous app
   */

  /**
   * Function to launch Exit types of apps.
   * @param {String} callsign callsign of the particular app.
   * @param {boolean} exitInBackground to make the app not bring up residentApp on exit
   * @param {boolean} forceDestroy to force the app to do destroy instead of suspend
   */

  // exit method does not need to launch the previous app.
  async exitApp(callsign, exitInBackground, forceDestroy) { //test the new exit app method
    if ((callsign === "") || (callsign === GLOBALS.selfClientName)) { //previousApp==="" means it's residentApp | change it to residentApp in cache and here
      return Promise.reject("AppAPI Can't exit from " + callsign);
    }

    if (callsign === "HDMI") {
      this.LOG("AppAPI exit method called for hdmi")
      new HDMIApi().stopHDMIInput()
      Storage.set("_currentInputMode", {});
      return Promise.resolve(true);
    }

    let pluginStatus, pluginState;// to check if the plugin is active, resumed, deactivated etc
    if (callsign != "NativeApp" && !callsign.includes('application/dac.native') && (callsign != "FireboltApp")) {
      try {
        pluginStatus = await this.getPluginStatus(callsign);
        if (pluginStatus !== undefined) {
          pluginState = pluginStatus[0].state;
          this.LOG("AppAPI pluginStatus: " + JSON.stringify(pluginStatus) + " pluginState: ", JSON.stringify(pluginState));
        }
        else {
          return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device");
        }
      } catch (err) {
        return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device | Error: " + JSON.stringify(err));
      }
    }
  }

  async getNetflixIIDs() {
    let defaultIIDs = NetflixIIDs;
    let data = new HomeApi().getPartnerAppsInfo();
    if (!data) {
      return defaultIIDs;
    }
    this.LOG("AppAPI homedata: " + JSON.stringify(data));
    try {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "netflix-iid-file-path")) {
        let url = data["netflix-iid-file-path"]
        this.LOG("AppAPI Netflix : requested to fetch iids from " + JSON.stringify(url))
        const fetchResponse = await fetch(url);
        const fetchData = await fetchResponse.json();
        return fetchData;
      } else {
        this.LOG("AppAPI Netflix IID file path not found in conf file, using deffault IIDs" + JSON.stringify(undefined));
        return defaultIIDs;
      }
    } catch (err) {
      this.ERR("AppAPI Error in fetching iid data from specified path, returning defaultIIDs | Error:", err);
      return defaultIIDs;
    }
  }

  launchOverlay(url, client) {
    // FIXME: Implement logic to launch overlay apps here with AppManager.
    // return new Promise((resolve, reject) => {
    //   const childCallsign = client
    //   RDKShellApis.launch({
    //     callsign: childCallsign,
    //     type: GLOBALS.selfClientName,
    //     uri: url,
    //   }).then(res => {
    //     RDKShellApis.moveToFront(childCallsign, childCallsign)
    //     this.LOG(`AppAPI launchOverlay : launched overlay : `, JSON.stringify(res));
    //     resolve(res)
    //   }).catch(err => {
    //     this.ERR("AppAPI launchOverlay : error ", JSON.stringify(err))
    //     reject(err)
    //   })
    // })
  }

  enableInactivityReporting(bool) {
    return RDKWindowManager.get().enableInactivityReporting(bool)
  }

  setInactivityInterval(duration) {
    return RDKWindowManager.get().setInactivityInterval(duration)
  }

  async setDacAppVisibility(value, visible = true, _isFallback = false) {
    return AppManager.get().getLoadedApps().then(async (res) => {
      this.LOG('Currently loaded apps: ' + JSON.stringify(res));
      const targetAppId = value;
      const targetApp = res.find(app => app.appId === targetAppId);
      const appInstanceId = targetApp ? targetApp.appInstanceId : value;

      if (appInstanceId) {
        this.LOG('Using appInstanceId: ' + appInstanceId + ' for targetAppId: ' + targetAppId);

        // Only setFocus when making the app visible
        if (visible) {
          await RDKWindowManager.get().setFocus(appInstanceId).then(() => {
            this.LOG('setFocus successful for ' + targetAppId);
          }).catch(async (err) => {
            this.ERR('setFocus error for ' + targetAppId + ': ' + JSON.stringify(err));
            if (!_isFallback) {
              await this.setDacAppVisibility(GLOBALS.selfClientId, true, true); // fallback to show resident app in case of error
            }
          });
        }

        await RDKWindowManager.get().setVisible(appInstanceId, visible).then(() => {
          this.LOG('setVisible successful for ' + targetAppId);
        }).catch(async (err) => {
          this.ERR('setVisible error for ' + targetAppId + ': ' + JSON.stringify(err));
          if (!_isFallback) {
            await this.setDacAppVisibility(GLOBALS.selfClientId, true, true); // fallback to show resident app in case of error
          }
        });
      } else {
        this.WARN('App not found: ' + targetAppId);
      }
    }).catch((err) => {
      this.ERR('Error getting loaded apps from setDacAppVisibility ' + JSON.stringify(err));
    });
  }

  /**
 * Function to set the configuration of premium apps.
 * @param {appName} Name of the application
 * @param {config_data} config_data configuration data
 */
  configureApplication(appName, config_data) {
    let plugin = 'Controller';
    let method = 'configuration@' + appName;
    return new Promise((resolve, reject) => {
      thunder.call(plugin, method).then((res) => {
        res.querystring = config_data;
        thunder.call(plugin, method, res).then((resp) => {
          this.LOG(`AppAPI ${appName} : updating configuration with object ${res} results in ${resp}`)
          resolve(true);
        }).catch((err) => {
          reject(err); //resolve(true)
        });
      }).catch((err) => {
        reject(err);
      });
    })
  }

  setPowerState(value) {
    return PowerManagerApi.get().setPowerState(value)
  }

  getPowerStateBeforeReboot() {
    return PowerManagerApi.get().getPowerStateBeforeReboot();
  }

  getPowerStateIsManagedByDevice() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getPowerStateIsManagedByDevice').then(result => {
        resolve(result);
      }).catch(err => {
        this.ERR("AppAPI System getPowerStateIsManagedByDevice failed: ", JSON.stringify(err));
        reject(err);
      });
    });
  }

  getPowerState() {
    return PowerManagerApi.get().getPowerState().then(result => {
      this.LOG("AppApi getPowerState result:", JSON.stringify(result))
      return {
        currentState: result?.currentState ?? null,
        previousState: result?.previousState ?? null
      };
    })
  }

  getWakeupReason() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getWakeupReason')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("org.rdk.System: getWakeupReason: Error in getting wake up reason: " + JSON.stringify(err))
          reject(err)
        })
    })
  }

  enableDisplaySettings() {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', 'activate', { callsign: 'org.rdk.DisplaySettings' })
        .then(result => {
          this.LOG('AppAPI activate DisplaySettings success.')
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings error: ', JSON.stringify(err))
          reject(err)
        })
    })
  }

  getSoundMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSoundMode', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSoundMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  setSoundMode(mode) {
    mode = mode.startsWith("AUTO") ? "AUTO" : mode
    this.LOG("mode", mode)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setSoundMode', {
          "audioPort": "HDMI0",
          "soundMode": mode,
          "persist": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setSoundMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getSupportedAudioModes() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioModes', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSupportedAudioModes error:", JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  //Enable or disable the specified audio port based on the input audio port ID.
  setEnableAudioPort(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setEnableAudioPort', {
          "audioPort": port, "enable": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setEnableAudioPort error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getDRCMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getDRCMode', { "audioPort": "HDMI0" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getDRCMode error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  setDRCMode(DRCNum) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setDRCMode', {
          "DRCMode": DRCNum
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setDRCMode error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getZoomSetting() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getZoomSetting')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getZoomSetting error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  setZoomSetting(zoom) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setZoomSetting', { "zoomSetting": zoom })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setZoomSetting error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getEnableAudioPort(audioPort) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getEnableAudioPort', { "audioPort": audioPort })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getEnableAudioPort error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getSupportedAudioPorts() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioPorts')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSupportedAudioPorts error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  //________________________________________________________________________________________________________________________

  //OTHER SETTINGS PAGE API

  //1. UI VOICE

  // 4. Check for Firmware Update

  //Get Firmware Update Info
  getFirmwareUpdateInfo() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getFirmwareUpdateInfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // Get Firmware Update State
  getFirmwareUpdateState() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateState')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR(" AppAPI System getFirmwareUpdateState error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // Get Firmware download info
  getDownloadFirmwareInfo() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getDownloadedFirmwareInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getDownloadedFirmwareInfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getModelName() {
    return new Promise((resolve) => {
      thunder.call('DeviceInfo', 'modelname').then(result => {
        resolve(result.model)
      }).catch(err => {
        this.ERR("AppAPI DeviceInfo modelname failed:" + JSON.stringify(err));
        resolve("RDK-VA")
      })
    })
  }

  getSerialNumber() {
    return new Promise((resolve) => {
      thunder.call('DeviceInfo', 'serialnumber').then(result => {
        resolve(result.serialnumber)
      }).catch(err => {
        this.ERR("AppAPI DeviceInfo serialnumber error:", JSON.stringify(err, 3, null));
        resolve('0123456789')
      })
    })
  }

  //Get system versions
  getSystemVersions() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getSystemVersions')
        .then(result => {
          this.LOG(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getSystemVersions error:" + JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Update firmware
  updateFirmware() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'updateFirmware')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System updateFirmware error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Get download percentage
  getFirmwareDownloadPercent() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareDownloadPercent')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getFirmwareDownloadPercent error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }


  // 5. Device Info
  systeminfo() {
    return new Promise((resolve) => {
      thunder
        .call('DeviceInfo', 'systeminfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI systeminfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  deviceType() {
    return new Promise((resolve) => {
      thunder
        .call('DeviceInfo', 'devicetype')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI devicetype error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // 6. Reboot and add default reason as FIRMWARE_FAILURE
  reboot(reason = "FIRMWARE_FAILURE") {
    return PowerManagerApi.get().reboot(reason)
  }

  getNetflixESN() {
    return new Promise((resolve) => {
      thunder.call('Netflix', 'esn')
        .then(res => {
          resolve(res)
        })
    })
  }

  // get prefered standby mode
  getPreferredStandbyMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getPreferredStandbyMode').then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getPreferredStandbyMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getNetworkStandbyMode() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getNetworkStandbyMode').then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR("AppAPI getNetworkStandbyMode error:", JSON.stringify(err, 3, null))
        reject(err)
      })
    })
  }

  getFriendlyName() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getFriendlyName').then(result => {
        if (result.success) {
          resolve(result)
        } else {
          const error = new Error('getFriendlyName failed: success=false');
          error.result = result;
          reject(error)
        }
      }).catch(err => {
        this.ERR("AppAPI getFriendlyName error:", JSON.stringify(err, 3, null))
        reject(err)
      })
    })
  }

  setFriendlyName(name) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'setFriendlyName', { "friendlyName": name }).then(result => {
        if (result.success) {
          resolve(result)
        } else {
          const error = new Error('setFriendlyName failed: success=false');
          error.result = result;
          reject(error)
        }
      }).catch(err => {
        this.ERR("AppAPI setFriendlyName error:", JSON.stringify(err, 3, null))
        reject(err)
      })
    })
  }

  getRFCConfig(rfcParamsList) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getRFCConfig',{"rfcList":[rfcParamsList]}).then(result => {
        if (result.success) {
          resolve(result)
        } else {
          const error = new Error('getRFCConfig failed: success=false');
          error.result = result;
          reject(error)
        }
      }).catch(err => {
        this.ERR("AppAPI getRFCConfig error:", JSON.stringify(err, 3, null))
        reject(err)
      })
    })
  }

  setWakeupSourceConfig(params) {
    return PowerManagerApi.get().setWakeupSourceConfig(params)
  }

  // Volume Apis
  getConnectedAudioPorts() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getConnectedAudioPorts', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI getConnectedAudioPorts error:', JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  getVolumeLevel(port) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.DisplaySettings', 'getVolumeLevel', { audioPort: port }).then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR('AppAPI getVolumeLevel error:', JSON.stringify(err, 3, null))
        reject(false)
      })
    })
  }

  getMuted(port) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getMuted', {
          audioPort: port,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI getMuted error:', JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  setVolumeLevel(port, volume) {
    return new Promise((resolve) => {
      const parsedVolume = Number.parseInt(volume, 10)
      if (Number.isNaN(parsedVolume)) {
        this.ERR('AppAPI setVolumeLevel invalid volume:', JSON.stringify(volume))
        resolve(false)
        return
      }
      const clampedVolume = Math.min(100, Math.max(0, parsedVolume))

      thunder
        .call('org.rdk.DisplaySettings', 'setVolumeLevel', {
          audioPort: port,
          volumeLevel: clampedVolume,
        })
        .then(result => {
          this.LOG("AppAPI setVolumeLevel :", JSON.stringify(result))
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI setVolumeLevel error:', JSON.stringify(err))
          resolve(false)
        })
    })
  }

  audio_mute(audio_source, value) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setMuted', {
          audioPort: audio_source,
          muted: value,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI audio_mute setMuted error:', JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }
  //created only to get the required params
  getPluginStatusParams(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          this.LOG("pluginstatus", result)
          let pluginParams = [result[0].callsign, result[0].state]
          resolve(pluginParams)
        })
        .catch(err => {
          this.ERR("AppAPI getPluginStatusParams error: ", err)
          reject(err)
        })
    })
  }
  //activate autopairing for stack
  activateAutoPairing() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.RemoteControl', 'startPairing', {
          "netType": '1',
          "timeout": '30'
        })
        .then(result => {
          this.LOG("AppAPI activateAutoPairing: ", result)
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI activateAutoPairing error:', JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }
  resetBassEnhancer(port) {
    this.LOG("portname", port)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetBassEnhancer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetBassEnhancer error: ", err)
          resolve(false)
        });
    })

  }
  resetDialogEnhancement(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetDialogEnhancement', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetDialogEnhancement error:", err)
          resolve(false)
        });
    })
  }
  //resetSurroundVirtualizer
  resetSurroundVirtualizer(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetSurroundVirtualizer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetSoundVitualizer error:", err)
          resolve(false)
        });
    })
  }
  //resetVolumeLeveller
  resetVolumeLeveller(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetVolumeLeveller', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetvolumeLevel error:", err)
          resolve(false)
        });
    })
  }
  //resetInactivityTime
  resetInactivityTime() {
    return RDKWindowManager.get().resetInactivityTime();
  }

  monitorStatus(callsign) {
    return new Promise((resolve) => {
      thunder
        .call('Monitor', 'resetstats', {
          "callsign": callsign
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI monitorStatus error:", err)
          resolve(false)
        });
    })
  }

  //{ path: ".cache" }
  deletecache(systemcCallsign, path) {
    return new Promise((resolve) => {
      thunder.call(systemcCallsign, 'delete', { path: path })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI deletecache error:", err)
          resolve(false)
        });
    })
  }

  // activate controller plugin
  activateController(callsign) {
    return new Promise((resolve) => {
      thunder
        .call('Controller', 'activate', { callsign: callsign })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI activateController error:", err)
          resolve(false)
        });
    })
  }

  checkStatus(plugin) {
    return new Promise((resolve) => {
      thunder.call('Controller', 'status@' + plugin).then(res => {
        //this.LOG("AppAPI checkStatus ", JSON.stringify(res))
        resolve(res)
      }).catch(err => {
        this.ERR("AppAPI checkStatus error:", err)
        resolve(false)
      });
    })
  }

  configStatus() {
    //controller.1.configuration
    return new Promise((resolve) => {
      thunder.call('Controller', 'status').then(res => {
        //this.LOG("AppAPI configStatus ",JSON.stringify(res))
        resolve(res)
      }).catch(err => {
        this.ERR("AppAPI configStatus error:", err)
        resolve(false)
      });
    })
  }

  getAvCodeStatus() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DeviceDiagnostics', 'getAVDecoderStatus')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getAvCodeStatus error:", err)
          resolve(false)
        });
    })
  }
}
