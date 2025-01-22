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
import { Language, Lightning, Utils } from '@lightningjs/sdk'
import Network from '../../api/NetworkApi'
import WiFiItem from '../../items/WiFiItem'
import SettingsMainItem from '../../items/SettingsMainItem'
import WiFi, { WiFiState, WiFiError, WiFiErrorMessages } from '../../api/WifiApi'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import JoinAnotherNetworkOverlay from './JoinAnotherNetworkOverlay'
import WifiPairingScreen from './WifiPairingOverlayScreen'
import FailComponent from './FailComponent'
import PersistentStoreApi from '../../api/PersistentStore'

/**
* Class for WiFi screen.
*/
export default class WiFiScreen extends Lightning.Component {
  static _template() {
    return {
      WifiContents: {
        x: 200,
        y: 275,
        Switch: {
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('WiFi On/Off'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Loader: {
            visible: false,
            h: 45,
            w: 45,
            x: 1500,
            // x: 320,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Loading.png'),
          },
          Button: {
            h: 45,
            w: 67,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/ToggleOffWhite.png'),
          },
        },
        Networks: {
          y: 180,
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
          y: 90,
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
      },
      JoinAnotherNetworkOverlay: {
        type: JoinAnotherNetworkOverlay,
        visible: false
      },
      WifiPairingScreen: {
        type: WifiPairingScreen,
        visible: false
      },
      FailScreen: {
        type: FailComponent,
        visible: false
      }
    }

  }

  _init() {
    Network.get().activate()
    WiFi.get().activate()
  }

  async _active() {
    this.ssids = this.renderSSIDS = []
    this.onAvailableSSIDsCB = WiFi.get().thunder.on(WiFi.get().callsign, 'onAvailableSSIDs', params => {
      console.log("WiFiOverlay onAvailableSSIDs length: ", params.ssids.length);
      this.ssids = [...this.ssids, ...params.ssids]
      if (!params.moreData) {
        this.renderSSIDS = this.ssids
        this.ssids = []
        this.tag('Switch.Loader').visible = false
        this.wifiLoading.stop()
        this.renderDeviceList(this.renderSSIDS);
      }
      if (!params.ssids.length) {
        console.log("onAvailableSSIDs length is ZERO; scanning again.")
        if (this.wifiStatus) {
          WiFi.get().startScan()
          this.wifiLoading.play()
          this.tag('Switch.Loader').visible = true
        }
      }
    });

    this.onWIFIStateChangedHandler = WiFi.get().thunder.on(WiFi.get().callsign, 'onWIFIStateChanged', notification => {
      if ((notification.state > WiFiState.DISABLED) && (notification.state !== WiFiState.FAILED)) {
        if (this.wifiStatus) {
          console.log("onWIFIStateChanged: startScan()")
          WiFi.get().startScan()
        }
      }
      if (notification.state === WiFiState.CONNECTED) {
        Network.get().setDefaultInterface("WIFI").then(() => {
          console.log("Successfully set WIFI as default interface.")
        }).catch(err => {
          console.error("Could not set WIFI as default interface." + JSON.stringify(err))
        });
        WiFi.get().getConnectedSSID().then(result => {
          PersistentStoreApi.get().setValue('wifi', 'SSID', result.ssid).then((response) => { console.log(response) })
        })
        if (this.renderSSIDS.length) this.renderDeviceList(this.renderSSIDS);
      }
    })

    this.onErrorHandler = WiFi.get().thunder.on(WiFi.get().callsign, 'onError', notification => {
      if ((notification.code === WiFiError.INVALID_CREDENTIALS) || (notification.code === WiFiError.SSID_CHANGED)) {
        WiFi.get().clearSSID().then(() => {
          console.log("INVALID_CREDENTIALS; deleting WiFi Persistence data.")
          PersistentStoreApi.get().deleteNamespace('wifi')
        });
      }
      this.tag("FailScreen").notify({ title: 'WiFi Error', msg: Language.translate(WiFiErrorMessages[notification.code]) })
      this._setState('FailScreen');
    })
  }

  async _focus() {
    await Network.get().isInterfaceEnabled("WIFI").then(enabled => {
      this.wifiStatus = enabled
      this._setState('Switch')
      if (this.wifiStatus) {
        this.wifiLoading.play()
        this.tag('Switch.Loader').visible = true
        this.tag('Networks').visible = true
        this.tag('JoinAnotherNetwork').visible = true
        WiFi.get().startScan()
      } else {
        this.wifiLoading.stop()
        this.tag('Switch.Loader').visible = false
        this.tag('Networks').visible = false
        this.tag('JoinAnotherNetwork').visible = false
      }
    });
  }

  changeStateBack(state) {
    this._setState(state)
  }

  _firstEnable() {
    this.wifiLoading = this.tag('Switch.Loader').animation({
      duration: 3,
      repeat: -1,
      stopMethod: 'immediate',
      stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
    })
    this.ssids = []
    this.renderSSIDS = []
  }

  _inactive() {
    if (this.wifiStatus) {
      WiFi.get().stopScan()
    } else {
      console.log("check - not calling stopScan since this.wifiStatus is FALSE.")
    }
    if (this.onWIFIStateChangedHandler) this.onWIFIStateChangedHandler.dispose();
    if (this.onErrorHandler) this.onErrorHandler.dispose();
    if (this.onAvailableSSIDsCB) this.onAvailableSSIDsCB.dispose();
  }

  renderDeviceList(ssids) {
    console.log("WIFI Overlay renderDeviceList ssids.length:", ssids.length)
    this._pairedList = [];
    this.tag('Networks.PairedNetworks').h = 0;
    this.tag('Networks.AvailableNetworks').tag('List').rollMax = ssids.length * 90
    this.tag('Networks.PairedNetworks').tag('List').items = []
    this.tag('Networks.PairedNetworks').tag('List').h = 0

    WiFi.get().getConnectedSSID().then(result => {
      if (result.ssid != '') {
        this._pairedList = [result]
        this.tag('Networks').visible = true
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
      }

      this._otherList = ssids.filter(device => {
        //console.log("SSID filter", device)
        result = this._pairedList.map(a => a.ssid)
        if (result.includes(device.ssid)) {
          return false
        } else {
          return device
        }
      })

      this.tag('Networks.AvailableNetworks').h = this._otherList.length * 90
      this.tag('Networks.AvailableNetworks').tag('List').h = this._otherList.length * 90
      this.tag('Networks.AvailableNetworks').tag('List').items = this._otherList.map((item, index) => {
        item.connected = false
        return {
          ref: 'Other' + index,
          w: 1620,
          h: 90,
          type: WiFiItem,
          item: item,
        }
      })
    })
  }

  hide() {
    this.tag('WifiContents').visible = false
  }

  show() {
    this.tag('WifiContents').visible = true
  }

  $PairingnetworkParams() {
    return (this.ListItem)
  }

  $navigateBack() {
    this._setState('Switch')
  }

  static _states() {
    return [
      class Switch extends this {
        $enter() {
          if (this.wifiStatus) {
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
          } else {
            this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
          }
          this.tag('Switch')._focus()
        }
        $exit() {
          this.tag('Switch')._unfocus()
        }
        _handleDown() {
          if (this.wifiStatus === true) {
            this._setState('JoinAnotherNetwork')
          }
        }
        _handleEnter() {
          this.switch()
        }
      },
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
        _handleEnter() {
          this.ListItem = this.tag('Networks.PairedNetworks').tag('List').element._item
          this._setState("WifiPairingScreen")
        }
      },
      class AvailableDevices extends this {
        $enter() {
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
        async _handleEnter() {
          console.log("SSID check" + JSON.stringify(this.tag('Networks.AvailableNetworks').tag('List').element._item))
          this.ListItem = this.tag('Networks.AvailableNetworks').tag('List').element._item
          await WiFi.get().isPaired().then(ispaired => {
            if (!ispaired) { // ispaired.result == 0 means saved SSID.
              WiFi.get().getPairedSSID().then(pairedssid => {
                if (pairedssid === this.ListItem.ssid) {
                  console.log("WiFiScreen getPairedSSID matched with current selection; try auto connect.");
                  WiFi.get().connect(true).then(() => {
                    WiFi.get().thunder.on('onError', notification => {
                      if (notification.code === WiFiError.SSID_CHANGED || notification.code === WiFiError.INVALID_CREDENTIALS) {
                        WiFi.get().clearSSID().then(() => {
                          this._setState("WifiPairingScreen")
                        })
                      }
                    })
                    WiFi.get().thunder.on('onWIFIStateChanged', notification => {
                      if (notification.state === WiFiState.CONNECTED) {
                        Network.get().setDefaultInterface("WIFI").then(() => {
                          console.log("Successfully set WIFI as default interface.")
                        }).catch(err => {
                          console.error("Could not set WIFI as default interface." + JSON.stringify(err))
                        });
                      }
                    })
                  }).catch(err => {
                    console.error("WiFiScreen auto-connect error:", JSON.stringify(err));
                    PersistentStoreApi.get().deleteKey('wifi', 'SSID').then(() => {
                      this._setState("WifiPairingScreen")
                    })
                  })
                } else {
                  console.log("WiFiScreen getPairedSSID differs with current selection.");
                  this._setState("WifiPairingScreen")
                }
              }).catch(err => {
                console.error("WiFi.getPairedSSID() error: ", JSON.stringify(err));
                this._setState("WifiPairingScreen")
              });
            } else {
              console.log("WiFi.isPaired() is false; attempting regular connect.");
              this._setState("WifiPairingScreen")
            }
          }).catch(err => {
            console.error("WiFi.isPaired() error: ", JSON.stringify(err));
            PersistentStoreApi.get().deleteKey('wifi', 'SSID').then(() => {
              this._setState("WifiPairingScreen")
            })
          });
        }
      },
      class JoinAnotherNetwork extends this {
        $enter() {
          this.tag('JoinAnotherNetwork')._focus()
        }
        _handleUp() {
          this._setState('Switch')
        }
        _handleEnter() {
          this._setState("JoinAnotherNetworkOverlay")
        }
        _handleDown() {
          if (this.wifiStatus) {
            if (this.tag('Networks.PairedNetworks').tag('List').length > 0) {
              this._setState('PairedDevices')
            } else if (this.tag('Networks.AvailableNetworks').tag('List').length > 0) {
              this._setState('AvailableDevices')
            }
          }
        }
        $exit() {
          this.tag('JoinAnotherNetwork')._unfocus()
        }
      },
      class JoinAnotherNetworkOverlay extends this {
        $enter() {
          console.log("wifiscreen JoinAnotherNetworkOverlay")
          this.hide()
          this.fireAncestors('$hideBreadCrum')
          this.tag('JoinAnotherNetworkOverlay').visible = true
        }
        $exit() {
          this.show()
          this.fireAncestors('$showBreadCrum')
          this.tag('JoinAnotherNetworkOverlay').visible = false
        }
        _getFocused() {
          return this.tag('JoinAnotherNetworkOverlay')
        }
        _handleBack() {
          this._setState('Switch')
        }
      },

      class WifiPairingScreen extends this {
        $enter() {
          console.log("wifiscreen WifiPairingScreen")
          this.hide()
          this.fireAncestors('$hideBreadCrum')
          this.tag('WifiPairingScreen').visible = true
        }
        $exit() {
          this.show()
          this.fireAncestors('$showBreadCrum')
          this.tag('WifiPairingScreen').visible = false
        }
        _getFocused() {
          return this.tag('WifiPairingScreen')
        }
        _handleBack() {
          this._setState('Switch')
        }
      },

      class FailScreen extends this {
        $enter() {
          console.log("wifiscreen FailScreen")
          this.hide()
          this.fireAncestors('$hideBreadCrum')
          this.tag('FailScreen').visible = true
        }
        $exit() {
          this.show()
          this.fireAncestors('$showBreadCrum')
          this.tag('FailScreen').visible = false
        }
        _getFocused() {
          return this.tag('FailScreen')
        }
        _handleBack() {
          this._setState('Switch')
        }
        _handleEnter() {
          this._setState('Switch')
        }
      }
    ]
  }

  _navigate(listname, dir) {
    let list
    if (listname === 'MyDevices') list = this.tag('Networks.PairedNetworks').tag('List')
    else if (listname === 'AvailableDevices') list = this.tag('Networks.AvailableNetworks').tag('List')
    if (!list) return;
    if (dir === 'down') {
      if (list.length === 0) {
        this._setState('JoinAnotherNetwork')
        return;
      }
      if (list.index < list.length - 1) list.setNext()
      else if (list.index == list.length - 1) {
        //WiFi.get().startScan()
        if (listname === 'MyDevices' && this.tag('Networks.AvailableNetworks').tag('List').length > 0) {
          this._setState('AvailableDevices')
        }
      }
    } else if (dir === 'up') {
      if (list.length === 0) {
        this._setState('JoinAnotherNetwork')
        return;
      }
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

  async switch() {
    if (this.wifiStatus) {
      console.log("Disabling WIFI interface and plugin.")
      this.wifiLoading.start();
      this.tag('Switch.Loader').visible = true
      await Network.get().setInterfaceEnabled("WIFI", false).then(() => {
        this.wifiStatus = false
        this.tag('Networks').visible = false
        this.tag('JoinAnotherNetwork').visible = false
        this.tag('Switch.Loader').visible = false
        this.wifiLoading.stop()
        this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
      });
    } else {
      console.log("Enabling WIFI interface and plugin.")
      this.tag('JoinAnotherNetwork').visible = true
      this.tag('Networks.PairedNetworks').tag('List').items = []
      this.tag('Networks.AvailableNetworks').tag('List').items = []
      this.tag('Switch.Loader').visible = true
      this.wifiLoading.start()
      await Network.get().setInterfaceEnabled("WIFI", true).then(resp => {
        console.log("setInterfaceEnabled WIFI return: ", resp)
        WiFi.get().setEnabled().then(() => {
          this.wifiStatus = true
          this.tag('Networks').visible = true
          this.tag('JoinAnotherNetwork').visible = true
          this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
          WiFi.get().isPaired().then(ispaired => {
            if (!ispaired.result) {
              WiFi.get().connect(true)
            } else {
              WiFi.get().startScan()
              this.tag('Networks.PairedNetworks').tag('List').items = []
              this.tag('Networks.AvailableNetworks').tag('List').items = []
            }
          })
        })
      })
    }
  }
}
