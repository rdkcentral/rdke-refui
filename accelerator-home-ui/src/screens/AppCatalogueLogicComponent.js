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
import { Language, Lightning, Router, Utils } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config';
import { Keyboard } from '../ui-components/index'
import { KEYBOARD_FORMATS } from '../ui-components/components/Keyboard'
import PasswordSwitch from './PasswordSwitch';

export default class AppCatalogueLogicComponent extends Lightning.Component {

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

  _active() {
    this.hidePasswd = true
    this.star = ""
    this.tag("Keyboard").visible = false
  }

  handleDone() {
    this.tag("Keyboard").visible = false
    if (!this.textCollection['EnterUsername']) {
      this._setState("EnterUsername");
    }
    else if (!this.textCollection['EnterPassword']) {
      this._setState("EnterPassword");
    }
    else {
      this.LOG('DAC Store Login - Username: ' + this.textCollection['EnterUsername'])
    }
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
          text: Language.translate("Connect to the Application Catalog"),
          fontFace: CONFIG.language.font,
          fontSize: 35,
          textColor: CONFIG.theme.hex,
        },
      },
      BorderTop: {
        x: 190, y: 130, w: 1488, h: 2, rect: true,
      },
      Username: {
        x: 190,
        y: 176,
        text: {
          text: Language.translate("Username") + ": ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      UsernameBox: {
        x: 400,
        y: 160,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },
      UsernameText: {
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
      Password: {
        x: 190,
        y: 246,
        text: {
          text: Language.translate("Password") + ":",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      PasswordBox: {
        x: 400,
        y: 230,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },
      Pwd: {
        x: 420,
        y: 240,
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
        x: 190, y: 326, w: 1488, h: 2, rect: true,
      },
      ExitButton: {
        x: 960,
        y: 350,
        mountX: 0.5,
        w: 200,
        h: 50,
        rect: true,
        color: 0xff444444,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        ExitLabel: {
          x: 100,
          y: 25,
          mount: 0.5,
          text: {
            text: Language.translate('Exit'),
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xffffffff,
          },
        },
      },
      Keyboard: {
        y: 420,
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
        y: 260,
        zIndex: 2,
        type: PasswordSwitch,
        mount: 0.5,
        visible: true
      },
      ShowPassword: {
        x: 1365,
        y: 242,
        w: 300,
        h: 75,
        zIndex: 2,
        text: { text: Language.translate('Show Password'), fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        visible: true
      }
    }
  }

  _focus() {
    this._setState('EnterUsername');
    this.textCollection = { 'EnterUsername': '', 'EnterPassword': '' }
    this.tag('Pwd').text.text = Language.translate("Press OK to enter Password");
    this.tag("UsernameText").text.text = Language.translate("Press OK to enter Username");
    this.tag('UsernameText').text.textColor = 0xff808080
    this.tag('Pwd').text.textColor = 0xff808080
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

  _handleBack() {
    if (!Router.isNavigating()) {
      Router.back()
    }
  }

  static _states() {
    return [
      class EnterUsername extends this {
        $enter() {
          this.tag('UsernameBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
        }
        _handleDown() {
          this._setState("EnterPassword");
        }
        _handleEnter() {
          this._setState('Keyboard')
          this.tag('UsernameText').text.text = this.textCollection['EnterUsername']
          this.tag('UsernameText').text.textColor = 0xffffffff
          this.tag("Keyboard").visible = true
        }
        $exit() {
          this.tag('UsernameBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
        }
      },
      class EnterPassword extends this {
        $enter() {
          this.tag('PasswordBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
        }
        _handleUp() {
          this._setState("EnterUsername");
        }
        _handleDown() {
          this._setState("ExitButton");
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
      class PasswordSwitchState extends this {
        $enter() {
          this.tag("PasswordBox").texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
          this.tag('ShowPassword').text.textColor = CONFIG.theme.hex
        }
        _handleDown() {
          this._setState("Keyboard");
        }
        _handleUp() {
          this._setState("EnterUsername");
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
      class ExitButton extends this {
        $enter() {
          this.tag('ExitButton').color = CONFIG.theme.hex
        }
        $exit() {
          this.tag('ExitButton').color = 0xff444444
        }
        _handleUp() {
          this._setState('EnterPassword')
        }
        _handleDown() {
          this._setState('EnterUsername')
        }
        _handleEnter() {
          if (!Router.isNavigating()) {
            Router.back()
          }
        }
      },
      class Keyboard extends this {
        $enter(state) {
          this.prevState = state.prevState
          if (this.prevState === 'EnterUsername') {
            this.element = 'UsernameText'
          }
          if (this.prevState === 'EnterPassword') {
            this.element = 'Pwd'
          }
        }
        _getFocused() {
          return this.tag('Keyboard')
        }

        $onSoftKey({ key }) {
          if (this.prevState === 'PasswordSwitchState') {
            this.prevState = "EnterPassword"
          }
          this.LOG("Prev state: " + JSON.stringify(this.prevState))
          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Clear') {
            this.textCollection[this.prevState] = this.textCollection[this.prevState].substring(0, this.textCollection[this.prevState].length - 1);
            this.star = (this.prevState === "EnterPassword") ? this.star.substring(0, this.star.length - 1) : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            this.LOG('no saving')
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

  _init() {
    this.star = ''
    this.textCollection = { 'EnterUsername': '', 'EnterPassword': '' }
    this.tag("Pwd").text.text = this.textCollection['EnterPassword']
    this.tag("UsernameText").text.text = this.textCollection['EnterUsername']
  }
}
