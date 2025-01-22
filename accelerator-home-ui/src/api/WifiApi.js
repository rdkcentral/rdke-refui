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
import ThunderJS from 'ThunderJS'
import { CONFIG } from '../Config/Config'
import { Metrics } from '@firebolt-js/sdk'

export const WiFiErrorMessages = {
  0: 'SSID_CHANGED - The SSID of the network changed',
  1: 'CONNECTION_LOST - The connection to the network was lost',
  2: 'CONNECTION_FAILED - The connection failed for an unknown reason',
  3: 'CONNECTION_INTERRUPTED - The connection was interrupted',
  4: 'INVALID_CREDENTIALS - The connection failed due to invalid credentials',
  5: 'NO_SSID - The SSID does not exist',
  6: 'UNKNOWN - Any other error.'
}

export const WiFiStateMessages = {
  0: 'Uninstalled or system error',
  1: 'Interface disabled',
  2: 'Disconnected',
  3: 'Pairing',
  4: 'Connecting',
  5: 'Connected',
  6: 'Failed',
}

export const WiFiState = {
  UNINSTALLED: 0,
  DISABLED: 1,
  DISCONNECTED: 2,
  PAIRING: 3,
  CONNECTING: 4,
  CONNECTED: 5,
  FAILED: 6,
}

export const WiFiError = {
  SSID_CHANGED: 0,
  CONNECTION_LOST: 1,
  CONNECTION_FAILED: 2,
  CONNECTION_INTERRUPTED: 3,
  INVALID_CREDENTIALS: 4,
  NO_SSID: 5,
  UNKNOWN: 6,
}

export const WiFiSecurityModes = {
  "NET_WIFI_SECURITY_NONE": 0,
  "NET_WIFI_SECURITY_WEP_64": 1,
  "NET_WIFI_SECURITY_WEP_128": 2,
  "NET_WIFI_SECURITY_WPA_PSK_TKIP": 3,
  "NET_WIFI_SECURITY_WPA_PSK_AES": 4,
  "NET_WIFI_SECURITY_WPA2_PSK_TKIP": 5,
  "NET_WIFI_SECURITY_WPA2_PSK_AES": 6,
  "NET_WIFI_SECURITY_WPA_ENTERPRISE_TKIP": 7,
  "NET_WIFI_SECURITY_WPA_ENTERPRISE_AES": 8,
  "NET_WIFI_SECURITY_WPA2_ENTERPRISE_TKIP": 9,
  "NET_WIFI_SECURITY_WPA2_ENTERPRISE_AES": 10,
  "NET_WIFI_SECURITY_WPA_WPA2_PSK": 11,
  "NET_WIFI_SECURITY_WPA_WPA2_ENTERPRISE": 12,
  "NET_WIFI_SECURITY_WPA3_PSK_AES": 13,
  "NET_WIFI_SECURITY_WPA3_SAE": 14
}

let instance = null

export default class Wifi {
  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.Wifi';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  static get() {
    if (instance == null) {
      instance = new Wifi();
      // Vital plugins; always keep activated.
      instance.activate();
    }
    return instance
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " activate")
      this.thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " activate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder Controller wifi activate" + JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " deactivate")
      this.thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " deactivate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder Controller wifi deactivate" +JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  cancelWPSPairing() {
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " cancelWPSPairing")
      this.thunder.call(this.callsign, 'cancelWPSPairing').then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + ": cancelWPSPairing error:" + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi cancelWPSPairing"+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  clearSSID() {
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " clearSSID")
      this.thunder.call(this.callsign, 'clearSSID').then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + ": clearSSID error:" + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi clearing SSID"+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  connect(useSaved = false, networkInfo, passphrase = "") {
    let params = {}
    if (!useSaved) { // saveSSID was never called earlier. Need proper params.
      params.ssid = networkInfo.ssid
      if (Object.prototype.hasOwnProperty.call(networkInfo, "security")) params.securityMode = networkInfo.security
      if (passphrase.length) params.passphrase = passphrase
    }
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " connect with params: " + JSON.stringify(params))
      this.thunder.call(this.callsign, 'connect', params).then(result => {
        result.success ? resolve(result.success) : reject(result.success)

      }).catch(err => {
        this.ERR(this.callsign + ": connect error:" + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi connect params "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.LOG(this.callsign + " disconnect")
      this.thunder.call(this.callsign, 'disconnect').then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + ": disconnect error:" + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi disconnect params "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getConnectedSSID() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getConnectedSSID').then(result => {
        this.LOG(this.callsign + " getConnectedSSID result:" + "Error in Thunder wifi connect params"+JSON.stringify(result))
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " getConnectedSSID error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi getConnectedSSID "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getCurrentState() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getCurrentState').then(result => {
        this.LOG(this.callsign + " getCurrentState result:" + result)
        resolve(result.success ? result.state : 0) // 0 is UNINSTALLED
      }).catch(err => {
        this.ERR(this.callsign + " getCurrentState error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi getCurrentState "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getPairedSSID() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getPairedSSID').then(result => {
        this.LOG(this.callsign + " getPairedSSID result:" + result)
        if (result.success) resolve(result.ssid)
        reject(result)
      }).catch(err => {
        this.ERR(this.callsign + " getPairedSSID error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi getPairedSSID "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getPairedSSIDInfo() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getPairedSSIDInfo').then(result => {
        this.LOG(this.callsign + " getPairedSSIDInfo result:" + result)
        if (result.success) resolve(result)
        reject(result)
      }).catch(err => {
        this.ERR(this.callsign + " getPairedSSIDInfo error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi getPairedSSIDInfo "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getSupportedSecurityModes() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'getSupportedSecurityModes').then(result => {
        this.LOG(this.callsign + " getSupportedSecurityModes result:" + result)
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " getSupportedSecurityModes error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi getSupportedSecurityModes "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  initiateWPSPairing(method = "PIN", wps_pin = "") { // SERIALIZED_PIN/PIN/PBC
    return new Promise((resolve, reject) => {
      let params = { method: method }
      if (method == "PIN") {
        params.wps_pin = wps_pin
      }
      this.thunder.call(this.callsign, 'initiateWPSPairing', params).then(result => {
        this.LOG(this.callsign + " initiateWPSPairing result:" + result)
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " initiateWPSPairing error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi initiateWPSPairing "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  isPaired() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'isPaired').then(result => {
        this.LOG(this.callsign + " isPaired result:" + result)
        if (result.success) resolve(result.result)
        reject(result)
      }).catch(err => {
        this.ERR(this.callsign + " isPaired error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi isPaired "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  isSignalThresholdChangeEnabled() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'isSignalThresholdChangeEnabled').then(result => {
        this.LOG(this.callsign + " isSignalThresholdChangeEnabled result:" + result)
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " isSignalThresholdChangeEnabled error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi isSignalThresholdChangeEnabled "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  saveSSID(ssid, passphrase, securityMode) {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'saveSSID', {
        ssid: ssid,
        passphrase: passphrase,
        securityMode: securityMode
      }).then(result => {
        this.LOG(this.callsign + " saveSSID result:" + result)
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " saveSSID error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi saveSSID "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setEnabled(enable = true) {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'setEnabled', { enable: enable }).then(result => {
        this.LOG(this.callsign + " setEnabled result:" + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + " setEnabled error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi setEnabled "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setSignalThresholdChangeEnabled(enabled = true, interval = 2000) {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'setSignalThresholdChangeEnabled', { enabled: enabled, interval: interval }).then(result => {
        this.LOG(this.callsign + " setSignalThresholdChangeEnabled result:" + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + " setSignalThresholdChangeEnabled error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi setSignalThresholdChangeEnabled "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  startScan(incremental = false, ssid = "", frequency = "") { // frequence: 2.5 or 5.0
    return new Promise((resolve, reject) => {
      let params = { incremental: incremental }
      if (ssid.length) params.ssid = ssid
      if (frequency.length) params.frequency = frequency
      this.LOG(this.callsign + " startScan params:" + params)
      this.thunder.call(this.callsign, 'startScan', params).then(result => {
        this.LOG(this.callsign + " startScan result:" + result)
        resolve(result)
      }).catch(err => {
        this.ERR(this.callsign + " startScan error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi startScan "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  stopScan() {
    return new Promise((resolve, reject) => {
      this.thunder.call(this.callsign, 'stopScan').then(result => {
        this.LOG(this.callsign + " stopScan result:" + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + " stopScan error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"WifiApiError", "Error in Thunder wifi stopScan "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }
}
