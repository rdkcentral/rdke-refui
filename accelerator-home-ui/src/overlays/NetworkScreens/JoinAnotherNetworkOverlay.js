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
import { CONFIG } from '../../Config/Config';
import { Keyboard } from '../../ui-components/index'
import { KEYBOARD_FORMATS } from '../../ui-components/components/Keyboard'
import PasswordSwitch from '../../screens/PasswordSwitch';
import WiFi from '../../api/WifiApi';
import PersistentStoreApi from '../../api/PersistentStore';

export default class JoinAnotherNetworkComponent extends Lightning.Component {
  handleDone() {
    this.tag("Keyboard").visible = false
    let securityCode = this.securityCodes[this.securityCodeIndex].value;
    if (!this.textCollection['EnterSSID']) {
      this._setState("EnterSSID");
    }
    else if (securityCode < 0 || securityCode > 14 || (securityCode === 0 && !this.scode)) {
      this.scode = true
      this._setState("EnterSecurity");
    }
    else if (securityCode !== 0 && !this.textCollection['EnterPassword']) {
      this._setState("EnterPassword");
    }
    else {
      if (this.textCollection['EnterSecurity'] === "0") {
        this.textCollection['EnterPassword'] = "";
        this.tag("Pwd").text.text = "";
      }

      let self = this;
      this.startConnectForAnotherNetwork({ ssid: self.textCollection['EnterSSID'], security: securityCode }, self.textCollection['EnterPassword']);
    }
  }

  startConnectForAnotherNetwork(device, passphrase) {
    WiFi.get().connect(false, device, passphrase).then(() => {
      WiFi.get().saveSSID(device.ssid, passphrase, device.security).then((response) => {
        if (response.result === 0 && response.success === true) {
          PersistentStoreApi.get().setValue('wifi', 'SSID', this._item.ssid)
        } else if (response.result !== 0) {
          WiFi.get().clearSSID()
          PersistentStoreApi.get().deleteNamespace('wifi')
        }
      })
    })
    this.fireAncestors("$navigateBack");
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xCC000000,
      },
      Text: {
        x: 758,
        y: 70,
        text: {
          text: Language.translate("Find and join a WiFi network"),
          fontFace: CONFIG.language.font,
          fontSize: 35,
          textColor: CONFIG.theme.hex,
        },
      },
      BorderTop: {
        x: 190, y: 130, w: 1488, h: 2, rect: true,
      },
      Network: {
        x: 190,
        y: 176,
        text: {
          text: Language.translate("Network Name") + ": ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      NetworkBox: {
        x: 400,
        y: 160,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },
      NetworkText: {
        x: 420,
        y: 170,
        zIndex: 2,
        text: {
          text: '',
          fontSize: 25,
          fontFace: CONFIG.language.font,
          textColor: 0xffffffff,
          wordWrapWidth: 1300,
          wordWrap: false,
          textOverflow: 'ellipsis',
        },
      },
      NetworkType: {
        x: 190,
        y: 246,
        text: {
          text: Language.translate("Security") + ": ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      TypeBox: {
        x: 400,
        y: 230,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false),
        ArrowForward: {
          h: 30,
          w: 45,
          y: 15,
          x: 1220,
          src: Utils.asset('images/settings/Arrow.png'),
        },
        ArrowBackward: {
          h: 30,
          w: 45,
          x: 10,
          scaleX: -1,
          y: 15,
          src: Utils.asset('images/settings/Arrow.png'),
        },
      },
      TypeText: {
        x: 470,
        y: 263,
        mountY: 0.5,
        zIndex: 2,
        text: {
          text: '',
          fontSize: 25,
          fontFace: CONFIG.language.font,
          textColor: 0xffffffff,
          wordWrapWidth: 1300,
          wordWrap: false,
          textOverflow: 'ellipsis',
        },
      },
      Password: {
        x: 190,
        y: 316,
        text: {
          text: Language.translate("Password") + ":",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      PasswordBox: {
        x: 400,
        y: 300,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },

      Pwd: {
        x: 420,
        y: 310,
        zIndex: 2,
        text: {
          text: '',
          fontSize: 25,
          fontFace: CONFIG.language.font,
          textColor: 0xffffffff,
          wordWrapWidth: 1300,
          wordWrap: false,
          textOverflow: 'ellipsis',
        },
      },
      BorderBottom: {
        x: 190, y: 396, w: 1488, h: 2, rect: true,
      },
      Keyboard: {
        y: 437,
        x: 400,
        type: Keyboard,
        visible: false,
        zIndex: 2,
        formats: KEYBOARD_FORMATS.qwerty
      },
      PasswrdSwitch: {
        h: 45,
        w: 66.9,
        x: 1642,
        y: 330,
        zIndex: 2,
        type: PasswordSwitch,
        mount: 0.5,
        visible: true
      },
      ShowPassword: {
        x: 1405,
        y: 312,
        w: 300,
        h: 75,
        zIndex: 2,
        text: { text: Language.translate('Show Password'), fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        visible: true
      }
    }
  }
  _focus() {
    this.scode = false
    this._setState('EnterSSID');
    this.textCollection = { 'EnterSSID': '', 'EnterPassword': '', 'EnterSecurity': '' }
    this.tag('Pwd').text.text = Language.translate("Press OK to enter Password");
    this.tag("NetworkText").text.text = Language.translate("Press OK to enter SSID");
    this.tag('NetworkText').text.textColor = 0xff808080
    this.tag('Pwd').text.textColor = 0xff808080
    this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;

    if (this.securityCodes[this.securityCodeIndex].value === 0) {
      this.pwdUnReachable = true;
      this.tag("PasswordBox").alpha = 0.5;
      this.tag("Password").alpha = 0.5;
    }
    else {
      this.pwdUnReachable = false;
      this.tag("PasswordBox").alpha = 1;
      this.tag("Password").alpha = 1;
    }
  }

  encrypt() {
    if (this.prevState === "EnterPassword" && this.hidePasswd)
      return true
    else
      return false
  }

  _updateText(txt) {
    this.tag("Pwd").text.text = txt;
  }
  static _states() {
    return [
      class EnterSSID extends this{
        $enter() {
          this.tag('NetworkBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
        }
        _handleDown() {
          this._setState("EnterSecurity");
        }
        _handleEnter() {
          this._setState('Keyboard')
          this.tag('NetworkText').text.text = this.textCollection['EnterSSID']
          this.tag('NetworkText').text.textColor = 0xffffffff
          this.tag("Keyboard").visible = true
        }
        $exit() {
          this.tag('NetworkBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
        }
      },
      class EnterSecurity extends this{
        $enter() {
          this.tag("TypeBox").texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
        }
        _handleUp() {
          this._setState("EnterSSID");
        }
        isPasswordUnReachable(secCode) {
          if (secCode === 0) {
            this.tag("PasswordBox").alpha = 0.5;
            this.tag("Password").alpha = 0.5;
            return true;
          }
          else {
            this.tag("PasswordBox").alpha = 1;
            this.tag("Password").alpha = 1;
            return false;
          }
        }
        _handleLeft() {
          this.securityCodeIndex = (15 + (--this.securityCodeIndex)) % 15;
          this.pwdUnReachable = this.isPasswordUnReachable(this.securityCodeIndex);
          this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;
        }
        _handleEnter() {
          this.handleDone()
        }
        _handleRight() {
          this.securityCodeIndex = (15 + (++this.securityCodeIndex)) % 15;
          this.pwdUnReachable = this.isPasswordUnReachable(this.securityCodeIndex);
          this.tag("TypeText").text.text = this.securityCodes[this.securityCodeIndex].name;
        }
        _handleDown() {
          if (!this.pwdUnReachable) {
            this._setState("EnterPassword");
          }
        }
        $exit() {
          this.tag("TypeBox").texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
        }
      },
      class EnterPassword extends this{
        $enter() {
          if (this.pwdUnReachable) {
            this._setState("EnterSecurity");
          }
          this.tag('PasswordBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
        }
        _handleUp() {
          this._setState("EnterSecurity");
        }
        _handleDown() {
          this._setState("EnterSSID");
        }
        _handleRight() {
          this._setState("PasswordSwitchState")
        }
        _handleEnter() {
          this.tag("Keyboard").visible = true
          this._setState('Keyboard')
          this.tag('Pwd').text.text = this.hidePasswd ? this.star : this.textCollection['EnterPassword']
          this.tag('Pwd').text.textColor = 0xffffffff
        }
        $exit() {
          this.tag('PasswordBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false);
        }
      },
      class PasswordSwitchState extends this{
        $enter() {
          this.tag("PasswordBox").texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
          this.tag('ShowPassword').text.textColor = CONFIG.theme.hex
        }
        _handleDown() {
          this._setState("Keyboard");
        }
        _handleUp() {
          this._setState("EnterSecurity");
        }
        _handleLeft() {
          this._setState("EnterPassword");
        }
        _getFocused() {
          return this.tag('PasswrdSwitch');
        }

        $handleEnter(bool) {
          if (bool) {
            this._updateText(this.textCollection['EnterPassword'])
            this.hidePasswd = false;
          }
          else {
            this._updateText(this.star);
            this.hidePasswd = true;
          }
          this.isOn = bool;
        }

        $exit() {
          this.tag("PasswordBox").texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
          this.tag('ShowPassword').text.textColor = 0xffffffff
        }
      },
      class Keyboard extends this{
        $enter(state) {
          this.prevState = state.prevState
          if (this.prevState === 'EnterSSID') {
            this.element = 'NetworkText'

          }
          if (this.prevState === 'EnterPassword') {
            this.element = 'Pwd'
          }
          if (this.prevState === 'EnterSecurity') {
            this.element = 'TypeText'
          }
        }
        _getFocused() {
          return this.tag('Keyboard')
        }

        $onSoftKey({ key }) {
          if (this.prevState === 'PasswordSwitchState') {
            this.prevState = "EnterPassword"
          }
          console.log("Prev state:", this.prevState)
          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Clear') {
            this.textCollection[this.prevState] = this.textCollection[this.prevState].substring(0, this.textCollection[this.prevState].length - 1);
            this.star = (this.prevState === "EnterPassword") ? this.star.substring(0, this.star.length - 1) : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving')
          } else if (key === 'Space') {
            this.textCollection[this.prevState] += ' '
            this.star += (this.prevState === "EnterPassword") ? '\u25CF' : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else if (key === 'Delete') {
            this.textCollection[this.prevState] = ''
            this.star = (this.prevState === "EnterPassword") ? '' : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else {
            this.textCollection[this.prevState] += key
            this.star += (this.prevState === "EnterPassword") ? '\u25CF' : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          }
        }
        _handleUp() {
          this._setState(this.prevState)
        }

        _handleBack() {
          this._setState(this.prevState)
        }
      }
    ]
  }

  _active() {
    this.securityCodeIndex = 0;
    this.pwdUnReachable = true;
    this.star = ""
    this.textCollection = { 'EnterSSID': '', 'EnterPassword': '', 'EnterSecurity': '0' }
    this.securityCodes = [{ name: "Open/None (Unsecure)", value: 0 }, { name: "WEP - Deprecated, not needed", value: 1 }, { name: "WEP", value: 2 }, { name: "WPA Personal TKIP", value: 3 }, { name: "WPA Personal AES", value: 4 }, { name: "WPA2 Personal TKIP", value: 5 }, { name: "WPA2 Personal AES", value: 6 }, { name: "WPA Enterprise TKIP", value: 7 }, { name: "WPA Enterprise AES", value: 8 }, { name: "WPA2 Enterprise TKIP", value: 9 }, { name: "WPA2 Enterprise AES", value: 10 }, { name: "Mixed Personal", value: 11 }, { name: "Mixed Enterprise", value: 12 }, { name: "WPA3 Personal AES", value: 13 }, { name: "WPA3 Personal SAE", value: 14 }]
    this.tag("Pwd").text.text = this.textCollection['EnterPassword']
    this.tag("NetworkText").text.text = this.textCollection['EnterSSID']
    this.hidePasswd = true
    this.tag("Keyboard").visible = false
  }
}
