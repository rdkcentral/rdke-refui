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

import { Lightning, Utils, Router, Registry, Language, Storage } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG,GLOBALS } from '../../Config/Config'
import SettingsMainItem from '../../items/SettingsMainItem'
import Network from '../../api/NetworkApi'
import WiFi, { WiFiError, WiFiErrorMessages } from '../../api/WifiApi'
import WiFiItem from '../../items/WiFiItem'
import NetworkManager,{WiFiState}from '../../api/NetworkManagerAPI'

export default class NetworkList extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  static _template() {
    return {
      w: 1920,
      h: 1080,
      rect: true,
      color: 0xff000000,
      NetworkList: {
        x: 950,
        y: 270,
        Title: {
          x: 0,
          y: 0,
          mountX: 0.5,
          text: {
            text: Language.translate("Network Configuration"),
            fontFace: CONFIG.language.font,
            fontSize: 40,
            textColor: CONFIG.theme.hex,
          },
        },
        BorderTop: {
          x: 0, y: 75, w: 1600, h: 3, rect: true, mountX: 0.5,
        },
        Info: {
          x: 0,
          y: 125,
          mountX: 0.5,
          text: {
            text: Language.translate("Select a wifi network"),
            fontFace: CONFIG.language.font,
            fontSize: 25,
          },
        },
        Loader: {
          visible: false,
          h: 45,
          w: 45,
          x: 0,
          // x: 320,
          mountX: 1,
          y: 200,
          mountY: 0.5,
          src: Utils.asset('images/settings/Loading.png'),
        },
        Networks: {
          x: -800,
          y: 340,
          flex: { direction: 'column' },
          PairedNetworks: {
            flexItem: { margin: 0 },
            List: {
              type: Lightning.components.ListComponent,
              w: 1920 - 300,
              itemSize: 90,
              horizontal: false,
              invertDirection: true,
              roll: true,
              rollMax: 900,
              itemScrollOffset: -4,
            },
          },
          AvailableNetworks: {
            flexItem: { margin: 0 },
            List: {
              w: 1920 - 300,
              type: Lightning.components.ListComponent,
              itemSize: 90,
              horizontal: false,
              invertDirection: true,
              roll: true,
              rollMax: 900,
              itemScrollOffset: -4,
            },
          },
          visible: false,
        },
        JoinAnotherNetwork: {
          x: -800,
          y: 250,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Join Another Network'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          visible: false,
        },
      }
    }
  }

  pageTransition() {
    return 'left'
  }
  set params(args) {
    if (args.wifiError) {
      this.tag('Info').text.text = Language.translate(`Error Code : ${args.wifiError.code} \t Error Msg : ${args.wifiError.message}`);
    }
  }
  _firstEnable() {
    this.wifiLoading = this.tag('Loader').animation({
      duration: 3,
      repeat: -1,
      stopMethod: 'immediate',
      stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
    })

    this.wifiStatus = true
    this._wifiIcon = true
    this.showConnectMessage = true
    this._activateWiFi()
    if (this.wiFiStatus) {
      this.tag('Networks').visible = true
      this.tag('JoinAnotherNetwork').visible = true
    }
    this._setState('JoinAnotherNetwork')
    NetworkManager.activate().then(result => {
      if (result) {
        NetworkManager.thunder.on(NetworkManager.callsign, 'onAddressChange', notification => {
          this.LOG(JSON.stringify(notification))
          if (notification.status == 'ACQUIRED') {
            // Nothing to do here.
          } else if (notification.status == 'LOST') {
            if (notification.interface === 'wlan0') {
              NetworkManager.SetInterfaceState('eth0').then(res => {
                if (res) {
                  NetworkManager.SetPrimaryInterface('eth0')
                }
              })
            }
          }
        })
        NetworkManager.thunder.on(NetworkManager.callsign, 'onActiveInterfaceChange', notification => {
          this.LOG(JSON.stringify(notification))
          if (notification.newInterfaceName === 'eth0') {
            NetworkManager.SetInterfaceState('eth0').then(result => {
              if (result) {
                NetworkManager.SetPrimaryInterface('eth0')
              }
            })
          } else if (
            notification.newInterfaceName == 'eth0' ||
            notification.oldInterfaceName == 'wlan0'
          ) {
            //WiFi.get().disconnect()
            this.wifiStatus = false
            this.tag('Networks').visible = false
            this.tag('JoinAnotherNetwork').visible = false
            this.tag('Switch.Loader').visible = false
            this.wifiLoading.stop()
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
            this._setState('Switch')
            NetworkManager.SetInterfaceState('eth0').then(result => {
              if (result) {
                NetworkManager.SetPrimaryInterface('eth0')
              }
            })
          }
          else if (
            notification.newInterfaceName === "" &&
            notification.oldInterfaceName === "wlan0"
          ) {
            this.LOG('emplty new old wifi')
            NetworkManager.SetPrimaryInterface('eth0')
          }
        })
        NetworkManager.thunder.on(NetworkManager.callsign, 'onInterfaceStateChange', notification => {
          if (notification.interface === 'eth0' && notification.status === 'INTERFACE_ADDED') {
            NetworkManager.SetInterfaceState('eth0').then(res => {
              if (res) {
                NetworkManager.SetPrimaryInterface('eth0')
              }
            })
          }
        })
      }
    })
  }
  _handleBack(){
    Router.navigate('splash/network')
  }
  /**
* Function to be executed when the Wi-Fi screen is enabled.
*/
  _focus() {
    this.ssids = []
    if (this.wifiStatus) {
      if (this.showConnectMessage) {
        this.tag('Info').text.text = Language.translate("Searching, please wait");
      }
      NetworkManager.StartWiFiScan()
    }
  }

  /**
   * Function to be executed when the Wi-Fi screen is disabled.
   */
  _unfocus() {
    NetworkManager.StopWiFiScan()
  }

  /**
   * Function to render list of Wi-Fi networks.
   */
  renderDeviceList(ssids) {
    console.log("WIFI renderDeviceList ssids.length:", ssids.length)
    NetworkManager.GetConnectedSSID().then(result => {
      if (result.ssid != '') {
        this._pairedList = [result]
      } else {
        this._pairedList = []
      }
      this.tag('Networks.AvailableNetworks').tag('List').rollMax = ssids.length * 90
      this.tag('Networks.PairedNetworks').h = this._pairedList.length * 90
      this.tag('Networks.PairedNetworks').tag('List').h = this._pairedList.length * 90
      this.tag('Networks.PairedNetworks').tag('List').items = this._pairedList.map((item, index) => {
        item.connected = true
        return {
          ref: 'Paired' + index,
          w: 1920 - 300,
          h: 90,
          type: WiFiItem,
          item: item,
        }
      })

      const seenSSIDs = new Set();
      this._otherList = ssids.filter(device => {
        const result = this._pairedList.map(a => a.ssid)
        const uniqueKey = `${device.ssid}_${device.frequency}`;
        if (result.includes(device.ssid)||seenSSIDs.has(uniqueKey)) {
          return false
        }
        seenSSIDs.add(uniqueKey)
        return device
      })
      this.tag('Networks.AvailableNetworks').h = this._otherList.length * 90
      this.tag('Networks.AvailableNetworks').tag('List').h = this._otherList.length * 90
      this.tag('Networks.AvailableNetworks').tag('List').items = this._otherList.map((item, index) => {
        item.connected = false
        return {
          ref: 'Other' + index,
          index: index,
          w: 1620,
          h: 90,
          type: WiFiItem,
          item: item,
        }
    })
    this.ssids = []
  }

  static _states() {
    return [
      class PairedDevices extends this {
        $enter() {
        }
        _getFocused() {
          return this.tag('Networks.PairedNetworks').tag('List').element
        }
        _handleDown() {
          this._navigate('MyDevices', 'down')
        }
        _handleUp() {
          this._navigate('MyDevices', 'up')
        }
      },
      class AvailableDevices extends this {
        $enter() {
          if (this.wifiStatus === true) {
            this.tag('Loader').visible = false
            this.wifiLoading.stop()
          }
        }
        _getFocused() {
          return this.tag('Networks.AvailableNetworks').tag('List').element
        }
        _handleDown() {
          this._navigate('AvailableDevices', 'down')
        }
        _handleUp() {
          this._navigate('AvailableDevices', 'up')
        }
        _handleEnter() {
          console.log(this.tag('Networks.AvailableNetworks').tag('List').element._item)
          GLOBALS.NetworkListStatus = true
          Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
        }
      },

      class JoinAnotherNetwork extends this {
        $enter() {
          this.tag('JoinAnotherNetwork')._focus()
        }
        _handleUp() {
          // this._setState('AvailableDevices')
        }
        _handleEnter() {
          if (this.wifiStatus) {
            Router.navigate('settings/network/interface/wifi/another')
          }
        }
        _handleDown() {
          this._setState('AvailableDevices')
        }
        $exit() {
          this.tag('JoinAnotherNetwork')._unfocus()
        }
      },
    ]
  }

  /**
 * Function to navigate through the lists in the screen.
 * @param {string} listname
 * @param {string} dir
 */
  _navigate(listname, dir) {
    let list
    if (listname === 'MyDevices') list = this.tag('Networks.PairedNetworks').tag('List')
    else if (listname === 'AvailableDevices') list = this.tag('Networks.AvailableNetworks').tag('List')
    if (dir === 'down') {
      if (list.index < list.length - 1) list.setNext()
      else if (list.index == list.length - 1) {
        NetworkManager.StartWiFiScan()
        this._setState('JoinAnotherNetwork')
        if (listname === 'MyDevices' && this.tag('Networks.AvailableNetworks').tag('List').length > 0) {
          this._setState('AvailableDevices')
        }
      }
    } else if (dir === 'up') {
      if (list.index > 0) list.setPrevious()
      else if (list.index == 0) {
        if (listname === 'AvailableDevices' && this.tag('Networks.PairedNetworks').tag('List').length > 0) {
          this._setState('PairedDevices')
        } else {
          this._setState('JoinAnotherNetwork')
        }
      }
    }
  }

  /**
 * Function to turn on and off Wi-Fi.
 */
  switch() {
    if (!this.wifiStatus) {
      NetworkManager.WiFiDisconnect()
      this.LOG('turning off wifi')
      NetworkManager.SetInterfaceState('eth0').then(result => {
        if (result) {
          NetworkManager.SetPrimaryInterface('eth0').then(result => {
            if (result) {
              NetworkManager.WiFiDisconnect()
              this.wifiStatus = false
              this.tag('Networks').visible = false
              this.tag('JoinAnotherNetwork').visible = false
              this.tag('Loader').visible = false
              this.wifiLoading.stop()
            }
          })
        }
      })
    } else {
      this.LOG('turning on wifi')
      //this.wifiStatus = true
      this.tag('Networks').visible = true
      this.tag('JoinAnotherNetwork').visible = true
      this.wifiLoading.play()
      this.tag('Loader').visible = true
      NetworkManager.StartWiFiScan()
    }
  }


  /**
 * Function to activate Wi-Fi plugin.
 */
  _activateWiFi() {
    // WiFi.get().activate().then(() => {
      this.switch()
    // })
    NetworkManager.thunder.on(NetworkManager.callsign, 'onWiFiStateChange', notification => {
      this.LOG(JSON.stringify(notification))
      if (notification.state === WiFiState.WIFI_STATE_CONNECTED && ! GLOBALS.Setup) {
        this.tag('Info').text.text = Language.translate("Connection successful");
        Registry.setTimeout(() => {
          Router.navigate('menu')
        }, 2000)
      } else if (notification.state === WiFiState.WIFI_STATE_CONNECTING || notification.state === WiFiState.WIFI_STATE_PAIRING) {
        this.tag('Info').text.text = Language.translate("Connecting, please wait");
      }
    })
    WiFi.get().thunder.on(WiFi.get().callsign, 'onError', error => {
      WiFi.get().startScan()
      NetworkManager.GetPrimaryInterface().then(defIface => {
        if (defIface != "ETHERNET") {
          NetworkManager.SetInterfaceState('eth0').then(res => {
            if (res) {
              NetworkManager.SetPrimaryInterface('eth0')
            }
          })
        }
      });
      if (error.code === WiFiError.INVALID_CREDENTIALS
        || error.code === WiFiError.SSID_CHANGED
        || error.code === WiFiError.CONNECTION_FAILED
        || error.code === WiFiError.CONNECTION_INTERRUPTED) {
        // Show error message.
        this.tag('Info').text.text = Language.translate(WiFiErrorMessages[error.code]);
      }
    })
    NetworkManager.thunder.on(NetworkManager.callsign, 'onAvailableSSIDs', notification => {
      this.ssids = [...this.ssids, ...notification.ssids]
      // if (!notification.moreData) {
        if (this.showConnectMessage) {
          this.showConnectMessage = false
          this.tag('Info').text.text = Language.translate("Select a network to connect");
        }
        this.renderDeviceList(this.ssids)
        setTimeout(() => {
          this.tag('Loader').visible = false
          this.wifiLoading.stop()
        }, 1000)
      // }
    })
  }
}
