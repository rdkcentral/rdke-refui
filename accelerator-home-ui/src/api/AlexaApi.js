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
import { Storage } from '@lightningjs/sdk';
import { AlexaLauncherKeyMap, errorPayload, PlaybackStateReport, VolumePayload, ApplicationStateReporter } from '../Config/AlexaConfig';
import VoiceApi from './VoiceApi';
import AppApi from './AppApi';
import RDKShellApis from './RDKShellApis';
import { CONFIG } from '../Config/Config';
import { Metrics } from '@firebolt-js/sdk';

const thunder = ThunderJS(CONFIG.thunderConfig)
let instance = null

export default class AlexaApi extends VoiceApi {
  static get() {
    if (instance == null) {
      instance = new AlexaApi()
    }
    return instance
  }

  constructor() {
    super();
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  /* Can be used to reduce enableSmartScreen() call */
  isSmartScreenActiavated() {
    let appApi = new AppApi();
    appApi.checkStatus('SmartScreen').then(result => {
      this.LOG("AlexaAPI: isSmartScreenActiavated result-" + JSON.stringify(result[0].state.toLowerCase()));
      switch (result[0].state.toLowerCase()) {
        case "resumed":
        case "activated": break;
        default:
          return (false);
      }
      return true;
    }).catch(err => {
      this.ERR("AlexaAPI: isSmartScreenActiavated error-" + JSON.stringify(err));
      return (false);
    });
  }

  enableSmartScreen() {
    thunder.Controller.activate({ callsign: 'SmartScreen' }).then(res => {
      this.LOG("AlexaAPI: Activate SmartScreen result: " + JSON.stringify(res));
    }).catch(err => {
      this.ERR("AlexaAPI: Activate SmartScreen ERROR!: " + JSON.stringify(err))
      Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", `Thunder Controller AlexaAPI: Activate SmartScreen error with ${err}`, false, null)
    })
  }

  disableSmartScreen() {
    thunder.Controller.deactivate({ callsign: 'SmartScreen' }).then(res => {
      this.LOG("AlexaAPI: Deactivate SmartScreen result: " + JSON.stringify(res));
    }).catch(err => {
      this.ERR("AlexaAPI: Deactivate SmartScreen ERROR!: " + JSON.stringify(err))
      Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", "Thunder Controller AlexaAPI: Deactivate SmartScreen error with " + JSON.stringify(err), false, null)
    })
  }

  displaySmartScreenOverlay(focused = false, opacity = 100, visible = true) {
    RDKShellApis.moveToFront("SmartScreen");
    RDKShellApis.setOpacity("SmartScreen", opacity);
    RDKShellApis.setVisibility("SmartScreen", visible);
    if (focused) { RDKShellApis.setFocus("SmartScreen") }
  }

  reportApplicationState(app = "menu", isRoute = false) {
    if ((this.checkAlexaAuthStatus() != "AlexaUserDenied") && (this.checkAlexaAuthStatus() != "AlexaAuthPending")) {
      /* retrieve 'app' matching from AlexaLauncherKeyMap. */
      let appStateReportPayload = ApplicationStateReporter;
      let isListedApp = false;
      for (let [key, value] of Object.entries(AlexaLauncherKeyMap)) {
        if (isRoute && Object.prototype.hasOwnProperty.call(value, "route") && (value.route === app.toLowerCase())) {
          appStateReportPayload.msgPayload.event.header.value.foregroundApplication.id = key;
          if (app.toLowerCase() === "menu")
            appStateReportPayload.msgPayload.event.header.value.foregroundApplication.metadata.isHome = true;
          isListedApp = true;
          break;
        } else if (!isRoute && (value.callsign === app || value.url === app)) {
          appStateReportPayload.msgPayload.event.header.value.foregroundApplication.id = key;
          appStateReportPayload.msgPayload.event.header.value.foregroundApplication.metadata.isHome = false;
          isListedApp = true;
          break;
        }
      }
      /* Send the new app state object if its a known app. */
      if (isListedApp) {
        this.WARN("Sending app statereport to Alexa:" + JSON.stringify(appStateReportPayload));
        this.sendVoiceMessage(appStateReportPayload);
      } else {
        this.ERR("Alexa reportApplicationState; no match found, won't send state report.");
        Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", "Alexa reportApplicationState; no match found, wont send state report.", false, null)
      }
    } else {
      this.LOG("Alexa reportApplicationState: AlexaUserDenied/AlexaAuthPending, skip state reporting.");
    }
  }

  reportVolumeState(volumeLevel = undefined, muteStatus = undefined, messageId = undefined) {
    if (volumeLevel != undefined)
      VolumePayload.msgPayload.event.payload.volume = volumeLevel
    if (muteStatus != undefined)
      VolumePayload.msgPayload.event.payload.muted = muteStatus
    if (messageId != undefined)
      VolumePayload.msgPayload.event.header.messageId = messageId
    this.LOG("Sending volume statereport to Alexa:" + JSON.stringify(VolumePayload));
    this.sendVoiceMessage(VolumePayload);
  }

  updateDeviceLanguageInAlexa(updatedLanguage) {
    let updatedLan = []
    updatedLan.push(updatedLanguage)
    let payload = { "msgPayload": { "DeviceSettings": "Set Device Settings", "values": { "locale": updatedLan } } }
    this.LOG("Sending language statereport to Alexa:" + JSON.stringify(updatedLan));
    this.sendVoiceMessage(payload);
  }

  //reportDeviceTimeZone(updatedTimeZone) {
  updateDeviceTimeZoneInAlexa(updatedTimeZone) {
    this.LOG("updateDeviceTimeZoneInAlexa sending :" + JSON.stringify(updatedTimeZone))
    let payload = { "msgPayload": { "DeviceSettings": "Set Device Settings", "values": { "timezone": updatedTimeZone } } }
    this.sendVoiceMessage(payload);
  }

  reportErrorState(directive, type = "ENDPOINT_UNREACHABLE", message = "ENDPOINT_UNREACHABLE") {
    errorPayload.msgPayload.event.payload.type = type
    errorPayload.msgPayload.event.payload.message = message
    errorPayload.msgPayload.event.header.correlationToken = directive.header.correlationToken
    errorPayload.msgPayload.event.header.payloadVersion = directive.header.payloadVersion
    errorPayload.msgPayload.event.endpoint.endpointId = directive.endpoint.endpointId
    errorPayload.msgPayload.event.header.messageId = directive.header.messageId
    this.LOG("AlexaAPI: reportErrorState payload:" + JSON.stringify(errorPayload))
    this.sendVoiceMessage(errorPayload);
  }

  reportPlaybackState(state = "STOPPED") {
    PlaybackStateReport.msgPayload.event.header.value = state;
    this.LOG("AlexaAPI: reportPlaybackState payload:" + JSON.stringify(PlaybackStateReport))
    this.sendVoiceMessage(PlaybackStateReport);
  }

  getAlexaDeviceSettings() {
    this.sendVoiceMessage({ "msgPayload": { "DeviceSettings": "Get Device Settings" } });
  }

  pingAlexaSDK() {
    /* Temporary fix to wake AVS SDK socket connectivity; this logic will be moved to middleware */
    this.sendVoiceMessage({ "msgPayload": { "KeepAlive": "ping to awake AVS SDK" } });
  }
  /**
   * Function to send voice message.
   */
  resetAVSCredentials() {
    return new Promise((resolve) => {
      Storage.set("AlexaVoiceAssitantState", "AlexaAuthPending");
      thunder.Controller.activate({ callsign: 'SmartScreen' }).then(() => {
        this.LOG("AlexaAPI: resetAVSCredentials activating SmartScreen instance.")
      }).catch(err => {
        this.ERR("AlexaAPI: resetAVSCredentials activate SmartScreen ERROR!: " + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", "Thunder Controller AlexaAPI: resetAVSCredentials activating SmartScreen error with " + JSON.stringify(err), false, null)
      })
      this.sendVoiceMessage({ "msgPayload": { "event": "ResetAVS" } }).then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR("AlexaAPI: resetAVSCredentials ERROR!: " + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", "Thunder Controller AlexaAPI: resetAVSCredentials Activate ERROR!: " + JSON.stringify(err), false, null)
        resolve(false)
      })
    });
  }

  /**
   * User can opt out Alexa; could be in Auth state or Some generic Alexa Error after Auth completed.
   * Return respective map so that logic can be drawn based on that.
   */
  checkAlexaAuthStatus() {
    if (Storage.get("AlexaVoiceAssitantState") === undefined || Storage.get("AlexaVoiceAssitantState") === null || Storage.get("AlexaVoiceAssitantState") === "AlexaAuthPending")
      return "AlexaAuthPending"; // Do not handle Alexa Related Errors; only Handle its Auth status.
    else
      return Storage.get("AlexaVoiceAssitantState"); // Return the stored value of AlexaVoiceAssitantState
  }

  setAlexaAuthStatus(newState = false) {
    Storage.set("AlexaVoiceAssitantState", newState)
    if (newState === "AlexaUserDenied") {
      this.configureVoice({ "enable": false });
      /* Free up Smartscreen resources */
      thunder.Controller.deactivate({ callsign: 'SmartScreen' }).then(() => {
        this.LOG("AlexaAPI: deactivated SmartScreen instance.")
      }).catch(err => {
        this.ERR("AlexaAPI: deactivate SmartScreen ERROR!: " + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER, "AlexaAPIError", "Thunder Controller AlexaAPI: deactivate SmartScreen ERROR: " + JSON.stringify(err), true, null)
      })
    } else {
      this.configureVoice({ "enable": true });
    }
    this.WARN("setAlexaAuthStatus with " + JSON.stringify(newState))
  }

  /**
   * To track playback state of Alexa Smartscreen App(AmazonMusic or anything else)
   */
  checkAlexaSmartscreenAudioPlaybackState() {
    if (Storage.get("AlexaSmartscreenAudioPlaybackState") === null || Storage.get("AlexaSmartscreenAudioPlaybackState") === "null")
      return "stopped"; // Assume default state.
    else
      return Storage.get("AlexaSmartscreenAudioPlaybackState");
  }
  setAlexaSmartscreenAudioPlaybackState(newState = false) {
    Storage.set("AlexaSmartscreenAudioPlaybackState", newState)
    this.LOG("setAlexaSmartscreenAudioPlaybackState with " + JSON.stringify(newState))
  }
}
