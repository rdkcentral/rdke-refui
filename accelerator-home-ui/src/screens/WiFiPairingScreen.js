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
import { Language, Lightning, Registry, Router } from '@lightningjs/sdk'
import { CONFIG, GLOBALS } from '../Config/Config'
import ConfirmAndCancel from '../items/ConfirmAndCancel'
import PasswordSwitch from './PasswordSwitch'
import { Keyboard } from '../ui-components/index'
import { KEYBOARD_FORMATS } from '../ui-components/components/Keyboard'
import PersistentStoreApi from '../api/PersistentStore'
import NetworkManager,{WiFiState} from '../api/NetworkManagerAPI'

let Ssid = null

export default class WifiPairingScreen extends Lightning.Component {

  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  pageTransition() {
    return 'left'
  }

  static _template() {
    return {
      w: 1920,
      h: 1080,
      rect: true,
      color: 0xCC000000,
      PairingScreen: {
        Title: {
          x: 960,
          y: 95,
          mountX: 0.5,
          zIndex: 2,
          text: { text: '', fontSize: 40, textColor: CONFIG.theme.hex },
        },
        RectangleWithColor: {
          x: 180, y: 164, w: 1515, h: 2, rect: true, color: 0xFFFFFFFF, zIndex: 2
        },
        PasswordLabel: {
          x: 180,
          y: 240,
          w: 300,
          h: 75,
          zIndex: 2,
          text: { text: Language.translate('Password') + ": ", fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        },
        Pwd: {
          x: 437,
          y: 240,
          zIndex: 2,
          text: {
            text: '',
            fontSize: 25,
            fontFace: CONFIG.language.font,
            textColor: 0xffffffff,
            wordWrapWidth: 1000,
            wordWrap: false,
            textOverflow: 'ellipsis',
          },
        },
        PasswordBox: {
          x: 417,
          y: 208,
          zIndex: 2,
          texture: Lightning.Tools.getRoundRect(1279, 88, 0, 3, 0xffffffff, false)
        },

        PasswrdSwitch: {
          h: 45,
          w: 66.9,
          x: 1656,
          y: 255,
          zIndex: 2,
          type: PasswordSwitch,
          mount: 0.5,
        },
        ShowPassword: {
          x: 1390,
          y: 240,
          w: 300,
          h: 75,
          zIndex: 2,
          text: { text: Language.translate('Show Password'), fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        },
        List: {
          x: 417,
          y: 331,
          type: Lightning.components.ListComponent,
          w: 1080,
          h: 400,
          itemSize: 28,
          horizontal: true,
          invertDirection: false,
          roll: true,
          zIndex: 2
        },
        RectangleWithColor2: {
          x: 180, y: 451, w: 1515, h: 2, rect: true, color: 0xFFFFFFFF, zIndex: 2
        },
        KeyBoard: {
          y: 501,
          x: 420,
          type: Keyboard,
          visible: true,
          zIndex: 2,
          formats: KEYBOARD_FORMATS.qwerty
        }
      },
    }
  }

  _updateText(txt) {
    this.tag("Pwd").text.text = txt;
  }
  _handleBack() {
    Router.back()
  }

  /**
   * @param {{ item: Wifi Response Object; }} args
   */
  set params(args) {
    if (args.wifiItem) {
      this.item(args.wifiItem)
    } else {
      Registry.setTimeout(() => {
        Router.navigate('settings/network/interface/wifi')
      }, (Router.isNavigating() ? 20 : 0));
    }
  }

  item(item) {
    this.star = "";
    this.passwd = "";
    this.tag("Pwd").text.text = ""
    this.tag('Title').text = item.ssid
    Ssid=item.ssid
    let options = []
    this._item = item
    if (item.connected) {
      options = ['Disconnect', 'Cancel']
    } else {
      options = ['Connect', 'Cancel']
    }

    this.tag('List').items = options.map((item, index) => {
      return {
        ref: item,
        x: index === 0 ? 0 : 325 * index,
        w: 325,
        h: 85,
        type: ConfirmAndCancel,
        item: item,
      }
    })
    this._setState('Pair')
  }

  _focus() {
    this.hidePasswd = true;
    this._setState('Pair')
  }
  _unfocus() {
  }

  _active() {
    this.star = "";
    this.passwd = "";
    this.isOn = false;
  }

  _inactive() {
    if (this.onWIFIStateChangedCB) this.onWIFIStateChangedCB.dispose();
    if (this.waitToConnectTO) Registry.clearTimeout(this.waitToConnectTO);
  }

   async pressEnter(option) {
    if (option === 'Cancel') {
      Router.back()
    } else if (option === 'Connect') {
      GLOBALS.Wificonnectinprogress = true
      const wificurrentstate=await WiFi.get().getCurrentState()
      if(wificurrentstate === WiFiState.CONNECTED){
        setTimeout(() => {
          GLOBALS.Wificonnectinprogress = false
        }, 5000);
      }
      if (this._item) {
        NetworkManager.WiFiConnect(false, this._item, '').then(() => { })
          .catch(err => {
            this.ERR("Not able to connect to wifi" + JSON.stringify(err))
          })
      }
      Router.back()
    } else if (option === 'Disconnect') {
      NetworkManager.WiFiDisconnect().then(() => {
        Registry.setTimeout(() => {
          Router.back()
        }, (Router.isNavigating() ? 20 : 0));
      })
    }
  }

   async startConnect(password = "") {
    GLOBALS.Wificonnectinprogress = true
      const wificurrentstate=await WiFi.get().getCurrentState()
      if(wificurrentstate === WiFiState.CONNECTED){
        setTimeout(() => {
          GLOBALS.Wificonnectinprogress = false
        }, 5000);
      }
    let flag = 0
    this.onWIFIStateChangedCB = NetworkManager.thunder.on(NetworkManager.callsign, 'onWIFIStateChanged', notification => {
      if (notification.state === WiFiState.WIFI_STATE_CONNECTED) {
       NetworkManager.SetPrimaryInterface("wlan0").then(() => {
          console.log("Successfully set WIFI as default interface.")
        }).catch(err => {
          this.ERR("Could not set WIFI as default interface." + JSON.stringify(err))
        });
        this.onWIFIStateChangedCB.dispose()
      }
      else if (notification.state === WiFiState.WIFI_STATE_INVALID_CREDENTIALS|| notification.state === WiFiState.WIFI_STATE_SSID_CHANGED) {
        console.log("INVALID_CREDENTIALS; deleting WiFi Persistence data.")
        NetworkManager.RemoveKnownSSID(Ssid).then(() => {
          PersistentStoreApi.get().deleteNamespace('wifi')
        });
        flag = 1
      }
    })
    NetworkManager.WiFiConnect(false, this._item, password).then(() => {
      NetworkManager.AddToKnownSSIDs(this._item.ssid, password, this._item.security).then((response) => {
        if (response === true && flag === 0) {
          PersistentStoreApi.get().setValue('wifi', 'SSID', this._item.ssid)
        }
        else {
          NetworkManager.RemoveKnownSSID(Ssid)
        }
      }).then(() => {
        // Immediate return causes some clash at plugin implementation level resulting not saving/connecting.
        // https://jira.rdkcentral.com/jira/browse/RDKDEV-924
        // Fix need to be implemented at network manager level and then can remove this.
        this.waitToConnectTO = Registry.setTimeout(() => {
          Router.back()
        }, 5000);
      });
    })
      .catch(err => {
        this.ERR("Not able to connect to wifi" + JSON.stringify(err));
        if (GLOBALS.Setup !== true) {
          Router.navigate('splash/networkList', { wifiError: err });
        }
        else {
          Router.back();
          this.widgets.fail.notify({ title: 'WiFi Status', msg: Language.translate(`Error Code : ${err.code} \t Error Msg : ${err.message}`) })
          Router.focusWidget('Fail')
        }
      })
  }

  static _states() {
    return [
      class Password extends this {
        $enter() {
          this.shifter = false;
          this.capsLock = false;
        }

        _getFocused() {
          return this.tag("KeyBoard")
        }

        $onSoftKey({ key }) {
          if (key === 'Done') {
            this.startConnect(this.passwd)
          } else if (key === 'Clear') {
            this.passwd = this.passwd.substring(0, this.passwd.length - 1);
            this.star = this.star.substring(0, this.star.length - 1);
            this._updateText(this.hidePasswd ? this.star : this.passwd)
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving')
          } else if (key === 'Space') {
            this.star += '\u25CF'
            this.passwd += ' '
            this._updateText(this.hidePasswd ? this.star : this.passwd)
          } else if (key === 'Delete') {
            this.star = ''
            this.passwd = ''
            this._updateText(this.hidePasswd ? this.star : this.passwd)
          } else {
            this.star += '\u25CF';
            this.passwd += key
            this._updateText(this.hidePasswd ? this.star : this.passwd)
          }

        }
        _handleUp() {
          this._setState("Pair")
        }
      },
      class Pair extends this {
        $enter() { }
        _getFocused() {
          return this.tag('List').element
        }
        _handleRight() {
          this.tag('List').setNext()
        }
        _handleLeft() {
          this.tag('List').setPrevious()
        }
        _handleUp() {
          this._setState("PasswordSwitchState");
        }
        _handleDown() {
          this._setState("Password");
        }
        _handleEnter() {
          if (this.tag('List').element.ref == 'Connect' && this._item.security != 0) {
            if (this.star === '') {
              this._setState('Password')
            } else {
              this.startConnect(this.passwd)
            }
          } else {
            this.pressEnter(this.tag('List').element.ref)
          }
        }

      },
      class PasswordSwitchState extends this{
        $enter() {
          this.tag("PasswordBox").texture = Lightning.Tools.getRoundRect(1279, 88, 0, 3, CONFIG.theme.hex, false)
        }
        _handleDown() {
          this._setState("Pair");
        }
        _getFocused() {
          return this.tag('PasswrdSwitch');
        }

        $handleEnter(bool) {
          if (bool) {
            this._updateText(this.passwd)
            this.hidePasswd = false;
          }
          else {
            this._updateText(this.star);
            this.hidePasswd = true;
          }
          this.isOn = bool;
        }

        $exit() {
          this.tag("PasswordBox").texture = Lightning.Tools.getRoundRect(1279, 88, 0, 3, 0xffffffff, false)
        }
      }
    ]
  }
}
