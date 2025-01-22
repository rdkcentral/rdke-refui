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
import { Language, Lightning, Registry, Router, Utils } from '@lightningjs/sdk'
import Network from './../api/NetworkApi'
import WiFiItem from '../items/WiFiItem'
import SettingsMainItem from '../items/SettingsMainItem'
import WiFi, { WiFiErrorMessages, WiFiState, WiFiError } from './../api/WifiApi'
import { COLORS } from './../colors/Colors'
import { CONFIG } from '../Config/Config'
import AppApi from './../api/AppApi'
import PersistentStoreApi from '../api/PersistentStore.js'

let appApi = new AppApi()
var previousFocusedItemSSid

export default class WiFiScreen extends Lightning.Component {
  pageTransition() {
    return 'left'
  }

  static _template() {
    return {
      rect: true,
      color: 0xCC000000,
      w: 1920,
      h: 1080,
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
    }
  }

  async _init() {
    await appApi.checkStatus(WiFi.get().callsign).then(result => {
      if (result[0].state !== "activated") {
        WiFi.get().activate()
      }
    })
  }

  async _active() {
    this.renderSSIDS = this.ssids = []
    await Network.get().isInterfaceEnabled("WIFI").then(enabled => {
      this.wifiStatus = enabled
    });
    this.onInterfaceStatusChangedCB = null
    this.wifiEventHandlers();
  }

  _focus() {
    if (this.wifiStatus) {
      WiFi.get().startScan()
      this.tag('Networks').visible = true
      this.tag('JoinAnotherNetwork').visible = true
      this.tag('Switch.Loader').visible = true
      this.wifiLoading.start()
      this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
    } else {
      this.tag('Networks').visible = false
      this.tag('JoinAnotherNetwork').visible = false
      this.tag('Switch.Loader').visible = false
      this.wifiLoading.stop()
      this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
    }
    this._setState('Switch')
  }

  _firstEnable() {
    this.wifiLoading = this.tag('Switch.Loader').animation({
      duration: 3,
      repeat: -1,
      stopMethod: 'immediate',
      stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
    })
  }

  /**
   * Function to be executed when the Wi-Fi screen is disabled.
   */
  _disable() {
    Network.get().isInterfaceEnabled("WIFI").then(enabled => {
      if (enabled) {
        WiFi.get().stopScan()
        this.wifiLoading.stop()
        this.tag('Switch.Loader').visible = false
      }
    });
    if (this.onInterfaceStatusChangedCB) {
      this.onInterfaceStatusChangedCB.dispose()
    }
  }

  pairedDevices() {
    this.tag('Networks.PairedNetworks').tag('List').items = []
    this.tag('Networks.AvailableNetworks').tag('List').items = []
  }

  /**
   * Function to render list of Wi-Fi networks.
   */
  renderDeviceList(ssids) {
    console.log("WIFI renderDeviceList ssids.length:" + JSON.stringify(ssids.length))
    ssids.sort((a, b) => { if (a.signalStrength >= b.signalStrength) return -1; else return 1 })
    this._pairedList = [];
    this.tag('Networks.PairedNetworks').h = 0;
    this.tag('Networks.AvailableNetworks').tag('List').rollMax = ssids.length * 90
    this.tag('Networks.PairedNetworks').tag('List').items = []
    this.tag('Networks.PairedNetworks').tag('List').h = 0
    WiFi.get().getConnectedSSID().then(result => {
      if (result.ssid != '') {
        console.log("Connected network detected " + JSON.stringify(result.ssid))
        this._pairedList = [result]
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

      const seenSSIDs = new Set();
      this._otherList = ssids.filter(device => {
        result = this._pairedList.map(a => a.ssid)
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
    })
    let IndexVal = 0
    console.log("previousFocusedItemSSid:::", previousFocusedItemSSid)
    this.tag('Networks.AvailableNetworks').tag('List').items.forEach(element => {
      if (element._item.ssid == previousFocusedItemSSid) {
        IndexVal = element.index
      }
    });
    this.tag('Networks.AvailableNetworks').tag('List').setIndex(IndexVal)
  }

  _handleBack() {
    Registry.setTimeout(() => {
      Router.navigate('settings/network/interface')
    }, (Router.isNavigating() ? 20 : 0));
  }

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings  Network Configuration  Network Interface  WiFi'))
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
          Registry.setTimeout(() => {
            Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.PairedNetworks').tag('List').element._item })
          }, (Router.isNavigating() ? 20 : 0));
        }
      },
      class AvailableDevices extends this {
        $enter() {
        }
        _getFocused() {
          previousFocusedItemSSid = this.tag('Networks.AvailableNetworks').tag('List').element._item.ssid
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
          let item = this.tag('Networks.AvailableNetworks').tag('List').element._item
          await WiFi.get().isPaired().then(ispaired => {
            if (!ispaired) { // ispaired.result == 0 means saved SSID.
              WiFi.get().getPairedSSID().then(pairedssid => {
                if (pairedssid === item.ssid) {
                  console.log("WiFiScreen getPairedSSID matched with current selection; try auto connect.");
                  WiFi.get().connect(true).then(() => {
                    WiFi.get().thunder.on('onError', notification => {
                      if (notification.code === WiFiError.SSID_CHANGED || notification.code === WiFiError.INVALID_CREDENTIALS) {
                        WiFi.get().clearSSID().then(() => {
                          Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
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
                      Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
                    })
                  })
                } else {
                  console.log("WiFiScreen getPairedSSID differs with current selection.");
                  Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
                }
              }).catch(err => {
                console.error("WiFi.getPairedSSID() error: ", JSON.stringify(err));
                Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
              });
            } else {
              console.log("WiFi.isPaired() is false; attempting regular connect.");
              Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
            }
          }).catch(err => {
            console.error("WiFi.isPaired() error: ", JSON.stringify(err));
            PersistentStoreApi.get().deleteKey('wifi', 'SSID').then(() => {
              Router.navigate('settings/network/interface/wifi/connect', { wifiItem: this.tag('Networks.AvailableNetworks').tag('List').element._item })
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
          if (this.wifiStatus) {
            Router.navigate('settings/network/interface/wifi/another')
          }
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
    if (!list) return;
    if (dir === 'down') {
      if (list.length === 0) {
        this._setState('JoinAnotherNetwork')
        return;
      }
      if (list.index < list.length - 1) list.setNext()
      else if (list.index == list.length - 1) {
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

  /**
   * Function to turn on and off Wi-Fi.
   */
  async switch() {
    if (this.wifiStatus) {
      console.log('Disabling Wi-Fi.')
      await Network.get().setInterfaceEnabled('WIFI', false).then(result => {
        if (result) {
          this.wifiStatus = false
          this.tag('Networks').visible = false
          this.tag('JoinAnotherNetwork').visible = false
          this.tag('Switch.Loader').visible = false
          this.wifiLoading.stop()
          this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
        } else {
          console.error("setInterfaceEnabled WIFI false returned error: " + JSON.stringify(result));
        }
      })
    } else {
      console.log('Enabling Wi-Fi.')
      await Network.get().isInterfaceEnabled("WIFI").then(ifaceStatus => {
        if (!ifaceStatus) {
          this.onInterfaceStatusChangedCB = Network.get()._thunder.on(Network.get().callsign, 'onInterfaceStatusChanged', ifaceStatus => {
            if ((ifaceStatus.interface === "WIFI") && ifaceStatus.enabled) {
              this.onInterfaceStatusChangedCB.dispose();
              this.wifiStatus = true
              this.tag('Networks').visible = true
              this.tag('JoinAnotherNetwork').visible = true
              this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
              WiFi.get().startScan()
              this.wifiLoading.play()
              this.tag('Switch.Loader').visible = true
            }
          });
          Network.get().setInterfaceEnabled("WIFI")
        } else {
          this.wifiStatus = true
          this.tag('Networks').visible = true
          this.tag('JoinAnotherNetwork').visible = true
          this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
          WiFi.get().startScan()
          this.wifiLoading.play()
          this.tag('Switch.Loader').visible = true
        }
        this.pairedDevices()
      })
    }
  }

  wifiEventHandlers() {
    this.onWIFIStateChangedCB = WiFi.get().thunder.on(WiFi.get().callsign, 'onWIFIStateChanged', notification => {
      if (this.renderSSIDS.length) {
        this.renderDeviceList(this.renderSSIDS)
      }
      if (notification.state === WiFiState.CONNECTED) {
        WiFi.get().getConnectedSSID().then(result => {
          PersistentStoreApi.get().setValue('wifi', 'SSID', result.ssid).then((response) => { console.log(response) })
        })
      }
    });

    this.onErrorCB = WiFi.get().thunder.on(WiFi.get().callsign, 'onError', notification => {
      if (notification.code === WiFiError.INVALID_CREDENTIALS) {
        WiFi.get().clearSSID()
      }
      if (this.renderSSIDS.length) {
        this.renderDeviceList(this.renderSSIDS)
      }
      if (this.widgets) {
        this.widgets.fail.notify({ title: 'WiFi Error', msg: WiFiErrorMessages[notification.code] })
        Router.focusWidget('Fail')
      }
    });

    this.onAvailableSSIDsCB = WiFi.get().thunder.on(WiFi.get().callsign, 'onAvailableSSIDs', notification => {
      console.log("Notification[onAvailableSSIDs]: found " + JSON.stringify(notification.ssids.length))
      this.ssids = [...this.ssids, ...notification.ssids]
      if (!notification.moreData) {
        this.renderSSIDS = this.ssids
        this.ssids = []
        this.renderDeviceList(this.renderSSIDS)
        setTimeout(() => {
          this.tag('Switch.Loader').visible = false
          this.wifiLoading.stop()
        }, 1000)
      }
      if (!notification.ssids.length) {
        console.log("onAvailableSSIDs length is ZERO; scanning again.")
        Network.get().isInterfaceEnabled("WIFI").then(enabled => {
          if (enabled) {
            WiFi.get().startScan()
            this.wifiLoading.play()
            this.tag('Switch.Loader').visible = true
          }
        })
      }
    });
  }

  _inactive() {
    previousFocusedItemSSid = undefined
    this.onWIFIStateChangedCB.dispose();
    this.onErrorCB.dispose();
    this.onAvailableSSIDsCB.dispose();
  }
}
