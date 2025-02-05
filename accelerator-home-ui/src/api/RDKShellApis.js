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
import { Metrics } from "@firebolt-js/sdk"

class RDKShellApis {
  constructor() {
    this._events = new Map();
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.RDKShell';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  registerEvent = (eventId, callback) => {
    this._events.set(eventId, callback)
  }

  thunderCall = (infoMessage, method, params = {}, property) => {
    return new Promise((resolve, reject) => {
      this.INFO('info', `RDKShellApi: ${infoMessage}.`);
      this.thunder.call(this.callsign, method, params)
        .then(result => {
          this.LOG('info', `RDKShellApi: ${infoMessage}: ${JSON.stringify(params)} result: ${JSON.stringify(result)}`);
          if (result.success) {
            if (property === 'result') {
              resolve(result);
            } else {
              resolve(property ? result[property] : result.success);
            }
          } else {
            this.ERR('error', `RDKShellApi: Error ${infoMessage} ${JSON.stringify(params)} result: ${JSON.stringify(result)}`);
            Metrics.error(Metrics.ErrorType.OTHER, "RDKShellApiError", `Error ${infoMessage} ${JSON.stringify(params)} result: ${JSON.stringify(result)}`, false, null)
            reject(result.success);
          }
        })
        .catch(err => {
          this.ERR('error', `RDKShellApi: Error ${infoMessage} ${err}`);
          reject(err);
        });
    });
  }

  getKeyRepeatsEnabled = () => this.thunderCall('getKeyRepeatsEnabled', 'getKeyRepeatsEnabled', {}, 'keyRepeat');
  getLastWakeupKey = () => this.thunderCall('getLastWakeupKey', 'getLastWakeupKey', {}, 'result');
  getLogLevel = () => this.thunderCall('getLogLevel', 'getLogLevel', {}, 'logLevel');
  getLogsFlushingEnabled = () => this.thunderCall('getLogsFlushingEnabled', 'getLogsFlushingEnabled', {}, 'enabled');
  getOpacity = (client) => this.thunderCall('getOpacity', 'getOpacity', { client }, 'opacity');
  getScale = (client) => this.thunderCall('getScale', 'getScale', { client }, 'result');
  getVirtualDisplayEnabled = (client, callsign = client) => this.thunderCall('getVirtualDisplayEnabled', 'getVirtualDisplayEnabled', { client, callsign }, 'enabled');
  getVirtualResolution = (client, callsign = client) => this.thunderCall('getVirtualResolution', 'getVirtualResolution', { client, callsign }, 'result');
  getVisibility = (client, callsign = client) => this.thunderCall('getVisibility', 'getVisibility', { client, callsign }, 'visible');
  getZOrder = () => this.thunderCall('getZOrder', 'getZOrder', {}, 'clients');
  getGraphicsFrameRate = () => this.thunderCall('getGraphicsFrameRate', 'getGraphicsFrameRate', {}, 'frameRate');
  launch = (params) => this.thunderCall('launch', 'launch', params, 'result');
  getBlockedAVApplications = () => this.thunderCall('getBlockedAVApplications', 'getBlockedAVApplications');
  activate = () => this.thunderCall('activate', 'Controller.activate', {});
  deactivate = () => this.thunderCall('deactivate', 'Controller.deactivate', {});
  addAnimation = (params) => this.thunderCall('addAnimation', 'addAnimation', params);
  addKeyIntercept = (params) => this.thunderCall('addKeyIntercept', 'addKeyIntercept', params);
  addKeyIntercepts = (params) => this.thunderCall('addKeyIntercepts', 'addKeyIntercepts', params);
  addKeyListener = (params) => this.thunderCall('addKeyListener', 'addKeyListener', params);
  addKeyMetadataListener = (client, callsign = client) => this.thunderCall('addKeyMetadataListener', 'addKeyMetadataListener', { client, callsign });
  createDisplay = (params) => this.thunderCall('createDisplay', 'createDisplay', params);
  destroy = (callsign) => this.thunderCall('destroy', 'destroy', { callsign });
  enableInactivityReporting = (enable = true) => this.thunderCall('enableInactivityReporting', 'enableInactivityReporting', { enable });
  enableKeyRepeats = (enable = true) => this.thunderCall('enableKeyRepeats', 'enableKeyRepeats', { enable });
  enableLogsFlushing = (enable = true) => this.thunderCall('enableLogsFlushing', 'enableLogsFlushing', { enable });
  enableVirtualDisplay = (client, callsign = client, enable = true) => this.thunderCall('enableVirtualDisplay', 'enableVirtualDisplay', { client, callsign, enable });
  generateKey = (params) => this.thunderCall('generateKey', 'generateKey', params);
  getAvailableTypes = () => this.thunderCall('getAvailableTypes', 'getAvailableTypes', {}, "types");
  getBounds = (client, callsign = client) => this.thunderCall('getBounds', 'getBounds', { client, callsign }, 'bounds');
  getClients = () => this.thunderCall('getClients', 'getClients', {}, 'clients');
  getCursorSize = () => this.thunderCall('getCursorSize', 'getCursorSize', {}, 'result');
  getHolePunch = (client, callsign = client) => this.thunderCall('getHolePunch', 'getHolePunch', { client, callsign }, 'holePunch');
  hideAllClients = (hide = true) => this.thunderCall('hideAllClients', 'hideAllClients', { hide });
  hideCursor = () => this.thunderCall('hideCursor', 'hideCursor', {});
  hideFullScreenImage = () => this.thunderCall('hideFullScreenImage', 'hideFullScreenImage', {});
  hideSplashLogo = () => this.thunderCall('hideSplashLogo', 'hideSplashLogo', {});
  ignoreKeyInputs = (ignore = true) => this.thunderCall('ignoreKeyInputs', 'ignoreKeyInputs', { ignore });
  injectKey = (params) => this.thunderCall('injectKey', 'injectKey', params);
  kill = (client, callsign = client) => this.thunderCall('kill', 'kill', { client, callsign });
  launchApplication = (params) => this.thunderCall('launchApplication', 'launchApplication', params);
  launchResidentApp = () => this.thunderCall('launchResidentApp', 'launchResidentApp', {});
  moveBehind = (client, target) => this.thunderCall('moveBehind', 'moveBehind', { client, target });
  moveToBack = (client, callsign = client) => this.thunderCall('moveToBack', 'moveToBack', { client, callsign });
  moveToFront = (client, callsign = client) => this.thunderCall('moveToFront', 'moveToFront', { client, callsign });
  removeAllKeyIntercepts = () => this.thunderCall('removeAllKeyIntercepts', 'removeAllKeyIntercepts', {});
  removeAllKeyListeners = () => this.thunderCall('removeAllKeyListeners', 'removeAllKeyListeners', {});
  removeAnimation = (client, callsign = client) => this.thunderCall('removeAnimation', 'removeAnimation', { client, callsign });
  removeKeyIntercept = (params) => this.thunderCall('removeKeyIntercept', 'removeKeyIntercept', params);
  removeKeyListener = (params) => this.thunderCall('removeKeyListener', 'removeKeyListener', params);
  removeKeyMetadataListener = (client, callsign = client) => this.thunderCall('removeKeyMetadataListener', 'removeKeyMetadataListener', { client, callsign });
  resetInactivityTime = () => this.thunderCall('resetInactivityTime', 'resetInactivityTime', {});
  resumeApplication = (client) => this.thunderCall('resumeApplication', 'resumeApplication', { client });
  scaleToFit = (params) => this.thunderCall('scaleToFit', 'scaleToFit', params);
  setBounds = (params) => this.thunderCall('setBounds', 'setBounds', params);
  setCursorSize = (width, height) => this.thunderCall('setCursorSize', 'setCursorSize', { width, height });
  setFocus = (client, callsign = client) => this.thunderCall('setFocus', 'setFocus', { client, callsign });
  setHolePunch = (client, callsign = client, holePunch = true) => this.thunderCall('setHolePunch', 'setHolePunch', { client, callsign, holePunch });
  setInactivityInterval = (interval) => this.thunderCall('setInactivityInterval', 'setInactivityInterval', { interval });
  setLogLevel = (logLevel = "INFO") => this.thunderCall('setLogLevel', 'setLogLevel', { logLevel });
  setOpacity = (client, opacity) => this.thunderCall('setOpacity', 'setOpacity', { client, opacity });
  setScale = (client, callsign = client, xScale, yScale) => this.thunderCall('setScale', 'setScale', { client, callsign, xScale, yScale });
  setScreenResolution = (w, h) => this.thunderCall('setScreenResolution', 'setScreenResolution', { w, h });
  setTopmost = (client, topmost = true, focus = true) => this.thunderCall('setTopmost', 'setTopmost', { client, topmost, focus });
  setVisibility = (client, callsign = client, visible = true) => this.thunderCall('setVisibility', 'setVisibility', { client, callsign, visible });
  setGraphicsFrameRate = (frameRate) => this.thunderCall('setGraphicsFrameRate', 'setGraphicsFrameRate', { frameRate });
  showCursor = () => this.thunderCall('showCursor', 'showCursor', {});
  showFullScreenImage = (path) => this.thunderCall('showFullScreenImage', 'showFullScreenImage', { path });
  showSplashLogo = (displayTime) => this.thunderCall('showSplashLogo', 'showSplashLogo', { displayTime });
  showWatermark = (show = true) => this.thunderCall('showWatermark', 'showWatermark', { show });
  suspend = (callsign) => this.thunderCall('suspend', 'suspend', { callsign });
  suspendApplication = (client) => this.thunderCall('suspendApplication', 'suspendApplication', { client });
  keyRepeatConfig = (params) => this.thunderCall('keyRepeatConfig', 'keyRepeatConfig', params);
  setAVBlocked = (callsign, blocked = true) => this.thunderCall('setAVBlocked', 'setAVBlocked', { callsign, blocked });
  restore = (callsign) => this.thunderCall('restore', 'restore', { callsign });
  hibernate = (callsign, timeout = 1000, procsequence = []) => this.thunderCall('hibernate', 'hibernate', { callsign, timeout, procsequence });
}

const rdkShellApisInstance = new RDKShellApis();
export default rdkShellApisInstance;
