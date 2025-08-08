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

/**
 * Class for Bluetooth thunder plugin apis.
 */

export default class BluetoothApi {
  constructor() {
    this._events = new Map()
    this._devices = []
    this._pairedDevices = []
    this._connectedDevices = []
    this.btStatus = false
    this._thunder = ThunderJS(CONFIG.thunderConfig)
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  /**
   * Function to activate the Bluetooth plugin
   */

  btactivate() {
    return new Promise((resolve, reject) => {
      this.callsign = 'org.rdk.Bluetooth'
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(() => {
          resolve(true)
        }).catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Controller Bluetooth activate "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  deactivateBluetooth() {
    return new Promise((resolve, reject) => {
      this.callsign = 'org.rdk.Bluetooth'
      this._thunder
        .call('Controller', 'deactivate', { callsign: this.callsign })
        .then(() => {
          resolve(true)
        }).catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Controller Bluetooth deactivate "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  activate() {
    return new Promise((resolve, reject) => {
      this.callsign = 'org.rdk.Bluetooth'
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(() => {
          this.btStatus = true
          this._thunder.on(this.callsign, 'onDiscoveredDevice', notification => {
            // this.getDiscoveredDevices().then(() => {
            this._events.get('onDiscoveredDevice')(notification)
            // })
          })
          this._thunder.on(this.callsign, 'onStatusChanged', notification => {
            if (notification.newStatus === 'PAIRING_CHANGE') {
              this.getPairedDevices()
            } else if (notification.newStatus === 'CONNECTION_CHANGE') {
              this.getConnectedDevices().then(() => {
                this._events.get('onConnectionChange')(notification)
              })
            } else if (notification.newStatus === 'DISCOVERY_STARTED') {
              this.getConnectedDevices().then(() => {
                this._events.get('onDiscoveryStarted')()
              })
            } else if (notification.newStatus === 'DISCOVERY_COMPLETED') {
              this.getConnectedDevices().then(() => {
                this._events.get('onDiscoveryCompleted')()
              })
            }
          })
          this._thunder.on(this.callsign, 'onPairingRequest', notification => {
            this._events.get('onPairingRequest')(notification)
          })
          this._thunder.on(this.callsign, 'onRequestFailed', notification => {
            this._events.get('onRequestFailed')(notification)
          })
          this._thunder.on(this.callsign, 'onConnectionRequest', notification => {
            this._events.get('onConnectionRequest')(notification)
          })
          resolve('Blutooth activated')
        })
        .catch(err => {
          this.ERR('Activation failure', err)
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Controller Bluetooth activate "+JSON.stringify(err), false, null)
          reject('Bluetooth activation failed', err)
        })
    })
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

  /**
   * Function to deactivate the Bluetooth plugin.
   */
  deactivate() {
    this._events = new Map()
  }

  /**
   * Function to disable the Bluetooth stack.
   */
  disable() {
    return new Promise((resolve) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'disable')
        .then(result => {
          this.btStatus = false
          resolve(result)
        })
        .catch(err => {
          this.ERR("Can't disable : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth disable "+JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to enable the Bluetooth stack.
   */
  enable() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'enable')
        .then(result => {
          resolve(result)
          this.btStatus = true
        })
        .catch(err => {
          this.ERR("Can't enable : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth enable "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function to start scanning for the Bluetooth devices.
   */
  startScan() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'startScan', {
          timeout: 10,
          profile: `KEYBOARD,
                    MOUSE,
                    JOYSTICK,
                    HUMAN INTERFACE DEVICE`,
        })
        .then(result => {
          if (result.success) resolve()
          else reject()
        })
        .catch(err => {
          this.ERR("Error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth startScan "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  startScanBluetooth() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'startScan', {
          timeout: 1000,
          profile: `KEYBOARD,
          MOUSE,
          JOYSTICK,
          HUMAN INTERFACE DEVICE`,
        })
        .then(result => {
          if (result.success) resolve(result)
          else reject(result)
        })
        .catch(err => {
          this.ERR("Error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth startScan "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  /**
   * Function to stop scanning for the Bluetooth devices.
   */
  stopScan() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'stopScan', {})
        .then(result => {
          if (result.success) resolve()
          else reject()
        })
        .catch(err => {
          this.ERR("Error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth stopScan "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function returns the discovered Bluetooth devices.
   */
  getDiscoveredDevices() {
    return new Promise((resolve) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'getDiscoveredDevices')
        .then(result => {
          this._devices = result.discoveredDevices
          resolve(result.discoveredDevices)
        })
        .catch(err => {
          this.ERR("Can't get discovered devices : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth getDiscoveredDevices "+JSON.stringify(err), false, null)
        })
    })
  }
  get discoveredDevices() {
    return this._devices
  }

  /**
   * Function returns the paired Bluetooth devices.
   */
  getPairedDevices() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'getPairedDevices')
        .then(result => {
          this._pairedDevices = result.pairedDevices
          resolve(result.pairedDevices)
        })
        .catch(err => {
          this.ERR("Can't get paired devices : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth getPairedDevices "+JSON.stringify(err), false, null)
          reject(false)
        })
    })
  }
  get pairedDevices() {
    return this._pairedDevices
  }

  /**
   * Function returns the connected Bluetooth devices.
   */
  getConnectedDevices() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'getConnectedDevices')
        .then(result => {
          this._connectedDevices = result.connectedDevices
          resolve(result.connectedDevices)
        })
        .catch(err => {
          this.ERR("Can't get connected devices : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth getConnectedDevices "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  get connectedDevices() {
    return this._connectedDevices
  }

  /**
   *
   * Function to connect a Bluetooth device.
   * @param {number} deviceID Device ID of the Bluetoth client.
   * @param {string} deviceType Device type of the Bluetooth client.
   */
  connect(deviceID, deviceType) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'connect', {
          deviceID: deviceID,
          deviceType: deviceType,
          connectedProfile: deviceType,
        })
        .then(result => {
          resolve(result.success)
        })
        .catch(err => {
          this.ERR("Connection failed: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth connect "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function to disconnect a Bluetooth device.
   *@param {number} deviceID Device ID of the Bluetoth client.
   *@param {string} deviceType Device type of the Bluetooth client.
   */
  disconnect(deviceID, deviceType) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'disconnect', {
          deviceID: deviceID,
          deviceType: deviceType,
        })
        .then(result => {
          if (result.success) resolve(true)
          else reject()
        })
        .catch(err => {
          this.ERR("disconnect failed: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth disconnect "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function to unpair a Bluetooth device.
   * @param {number} deviceId
   */
  unpair(deviceId) {
    return new Promise((resolve) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'unpair', { deviceID: deviceId })
        .then(result => {
          if (result.success) resolve(result.success)
          else resolve(false)
        })
        .catch(err => {
          this.ERR("unpair failed: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth unpair "+JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  /**
   * Function to pair a Bluetooth device.
   * @param {number} deviceId
   */
  pair(deviceId) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'pair', { deviceID: deviceId })
        .then(result => {
          if (result.success) resolve(result)
          else reject(result)
        })
        .catch(err => {
          this.ERR("Error on pairing: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth pair "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function to respond to client the Bluetooth event.
   * @param {number} deviceID Device ID of the Bluetooth client.
   * @param {string} eventType Name of the event.
   * @param {string} responseValue Response sent to the Bluetooth client.
   */
  respondToEvent(deviceID, eventType, responseValue) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'respondToEvent', {
          deviceID: deviceID,
          eventType: eventType,
          responseValue: responseValue,
        })
        .then(result => {
          if (result.success) resolve()
          else reject()
        })
        .catch(err => {
          this.ERR("Error on respondToEvent: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth respondToEvent "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }

  /**
   * Function to get the discoverable name of the Bluetooth plugin.
   */
  getName() {
    return new Promise((resolve) => {
      this._thunder.call('org.rdk.Bluetooth', 'getName').then(result => {
        resolve(result.name)
      })
    })
  }

  setAudioStream(deviceID) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Bluetooth', 'setAudioStream', { "deviceID": deviceID, "audioStreamName": "AUXILIARY" })
        .then(result => {
          // this.LOG(JSON.stringify(result))
          this._connectedDevices = result.connectedDevices
          resolve(result.connectedDevices)
        })
        .catch(err => {
          this.ERR("Can't get connected devices : " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "BluetoothError", "Error while Thunder Bluetooth setAudioStream "+JSON.stringify(err), false, null)
          reject()
        })
    })
  }
}
