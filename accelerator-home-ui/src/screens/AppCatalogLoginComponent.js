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
import { login, getCatalogServerURL } from '../api/AppCatalog';

export default class AppCatalogLoginComponent extends Lightning.Component {

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
    this.catalogURL = null
    this.tag("Keyboard").visible = false
    getCatalogServerURL()
      .then(url => {
        this.catalogURL = url || null
        this.tag('CatalogURLValue').text.text = url || Language.translate('Unknown')
      })
      .catch(() => {
        this.catalogURL = null
        this.tag('CatalogURLValue').text.text = Language.translate('Unavailable')
      })
  }

  _firstEnable() {
    this.spinnerAnimation = this.tag('LoadingOverlay.Spinner').animation({
      duration: 3,
      repeat: -1,
      stopMethod: 'immediate',
      stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
    })
  }

  _updateConnectButtonColor() {
    if (this.textCollection && this.textCollection['EnterUsername']) {
      this.tag('ConnectButton').color = 0xff00aa00
    } else {
      this.tag('ConnectButton').color = 0xff444444
    }
  }

  handleDone() {
    this.tag("Keyboard").visible = false
    if (!this.textCollection['EnterUsername']) {
      this._setState("EnterUsername");
    } else if (!this.textCollection['EnterPassword']) {
      this._setState("EnterPassword");
    } else {
      this._setState("ConnectButton");
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
      CatalogURLLabel: {
        x: 190,
        y: 148,
        text: {
          text: Language.translate("App Catalog URL") + ": ",
          fontFace: CONFIG.language.font,
          fontSize: 22,
          textColor: 0xff808080,
        },
      },
      CatalogURLValue: {
        x: 450,
        y: 148,
        text: {
          text: Language.translate("Loading..."),
          fontFace: CONFIG.language.font,
          fontSize: 22,
          textColor: 0xff808080,
          wordWrapWidth: 1200,
          wordWrap: false,
          textOverflow: 'ellipsis',
        },
      },
      Username: {
        x: 190,
        y: 236,
        text: {
          text: Language.translate("Username") + ": ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      UsernameBox: {
        x: 400,
        y: 220,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },
      UsernameText: {
        x: 420,
        y: 230,
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
        y: 306,
        text: {
          text: Language.translate("Password") + ":",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      PasswordBox: {
        x: 400,
        y: 290,
        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
      },
      Pwd: {
        x: 420,
        y: 300,
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
        x: 190, y: 386, w: 1488, h: 2, rect: true,
      },
      ExitButton: {
        x: 740,
        y: 410,
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
      ConnectButton: {
        x: 1180,
        y: 410,
        mountX: 0.5,
        w: 200,
        h: 50,
        rect: true,
        color: 0xff444444,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        ConnectLabel: {
          x: 100,
          y: 25,
          mount: 0.5,
          text: {
            text: Language.translate('Connect'),
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xffffffff,
          },
        },
      },
      ErrorText: {
        x: 960,
        y: 475,
        mountX: 0.5,
        visible: false,
        text: {
          text: Language.translate('Login failed. Please try again.'),
          fontFace: CONFIG.language.font,
          fontSize: 22,
          textColor: 0xffff4444,
          textAlign: 'center',
        },
      },
      Keyboard: {
        y: 480,
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
        y: 320,
        zIndex: 2,
        type: PasswordSwitch,
        mount: 0.5,
        visible: true
      },
      ShowPassword: {
        x: 1365,
        y: 302,
        w: 300,
        h: 75,
        zIndex: 2,
        text: { text: Language.translate('Show Password'), fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        visible: true
      },
      AuthFailedPopup: {
        x: 960,
        y: 540,
        mount: 0.5,
        w: 560,
        h: 200,
        rect: true,
        color: 0xff222222,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 12 },
        visible: false,
        zIndex: 11,
        PopupText: {
          x: 280,
          y: 60,
          mountX: 0.5,
          text: {
            text: Language.translate('Authentication failed. Please try again.'),
            fontFace: CONFIG.language.font,
            fontSize: 26,
            textColor: 0xffffffff,
            textAlign: 'center',
            wordWrapWidth: 500,
            wordWrap: true,
          },
        },
        OkButton: {
          x: 280,
          y: 145,
          mountX: 0.5,
          mountY: 0.5,
          w: 150,
          h: 46,
          rect: true,
          color: 0xff444444,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
          OkLabel: {
            x: 75,
            y: 23,
            mount: 0.5,
            text: {
              text: Language.translate('OK'),
              fontFace: CONFIG.language.font,
              fontSize: 22,
              textColor: 0xffffffff,
            },
          },
        },
      },
      URLNotSetPopup: {
        x: 960,
        y: 540,
        mount: 0.5,
        w: 560,
        h: 200,
        rect: true,
        color: 0xff222222,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 12 },
        visible: false,
        zIndex: 11,
        PopupText: {
          x: 280,
          y: 60,
          mountX: 0.5,
          text: {
            text: Language.translate('App Catalog URL is not set'),
            fontFace: CONFIG.language.font,
            fontSize: 26,
            textColor: 0xffffffff,
            textAlign: 'center',
            wordWrapWidth: 500,
            wordWrap: true,
          },
        },
        OkButton: {
          x: 280,
          y: 145,
          mountX: 0.5,
          mountY: 0.5,
          w: 150,
          h: 46,
          rect: true,
          color: 0xff444444,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
          OkLabel: {
            x: 75,
            y: 23,
            mount: 0.5,
            text: {
              text: Language.translate('OK'),
              fontFace: CONFIG.language.font,
              fontSize: 22,
              textColor: 0xffffffff,
            },
          },
        },
      },
      LoadingOverlay: {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xCC000000,
        visible: false,
        zIndex: 10,
        Spinner: {
          x: 920,
          y: 490,
          w: 80,
          h: 80,
          mount: 0.5,
          src: Utils.asset('images/settings/Loading.png'),
        },
        AuthText: {
          x: 960,
          y: 550,
          mountX: 0.5,
          text: {
            text: Language.translate('Authenticating...'),
            fontFace: CONFIG.language.font,
            fontSize: 28,
            textColor: 0xffffffff,
          },
        },
      },
    }
  }

  _focus() {
    this._setState('EnterUsername');
    this.textCollection = { 'EnterUsername': '', 'EnterPassword': '' }
    this.tag('Pwd').text.text = Language.translate("Press OK to enter Password");
    this.tag("UsernameText").text.text = Language.translate("Press OK to enter Username");
    this.tag('UsernameText').text.textColor = 0xff808080
    this.tag('Pwd').text.textColor = 0xff808080
    this.tag('ErrorText').visible = false
    this._updateConnectButtonColor()
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
          this._setState("ExitButton");
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
        _handleRight() {
          this._setState('ConnectButton')
        }
        _handleEnter() {
          if (!Router.isNavigating()) {
            Router.back()
          }
        }
      },
      class ConnectButton extends this {
        $enter() {
          this.tag('ConnectButton').color = this.textCollection['EnterUsername']
            ? 0xff00cc00
            : 0xff444444
        }
        $exit() {
          this._updateConnectButtonColor()
        }
        _handleUp() {
          this._setState('EnterPassword')
        }
        _handleDown() {
          this._setState('EnterUsername')
        }
        _handleLeft() {
          this._setState('ExitButton')
        }
        _handleEnter() {
          this.tag('Keyboard').visible = false
          if (!this.catalogURL) {
            this._setState('URLNotSetPopup')
            return
          }
          if (!this.textCollection['EnterUsername']) {
            this._setState('EnterUsername')
            return
          }
          this._setState('Authenticating')
          login(this.textCollection['EnterUsername'], this.textCollection['EnterPassword'])
            .then(result => {
              if (result) {
                this.LOG('Login successful - navigating to menu')
                if (!Router.isNavigating()) {
                  Router.navigate('menu')
                }
              } else {
                this.ERR('Login failed')
                setTimeout(() => this._setState('AuthFailedPopup'), 0)
              }
            })
            .catch(err => {
              this.ERR('Login error: ' + err)
              setTimeout(() => this._setState('AuthFailedPopup'), 0)
            })
        }
      },
      class AuthFailedPopup extends this {
        $enter() {
          this.tag('AuthFailedPopup').visible = true
          this.tag('AuthFailedPopup.OkButton').color = CONFIG.theme.hex
        }
        $exit() {
          this.tag('AuthFailedPopup').visible = false
          this.tag('AuthFailedPopup.OkButton').color = 0xff444444
        }
        _handleEnter() {
          this._setState('ConnectButton')
        }
        _handleBack() {
          this._setState('ConnectButton')
        }
        _handleUp() {}
        _handleDown() {}
        _handleLeft() {}
        _handleRight() {}
      },
      class URLNotSetPopup extends this {
        $enter() {
          this.tag('URLNotSetPopup').visible = true
          this.tag('URLNotSetPopup.OkButton').color = CONFIG.theme.hex
        }
        $exit() {
          this.tag('URLNotSetPopup').visible = false
          this.tag('URLNotSetPopup.OkButton').color = 0xff444444
        }
        _handleEnter() {
          this._setState('ConnectButton')
        }
        _handleBack() {
          this._setState('ConnectButton')
        }
        _handleUp() {}
        _handleDown() {}
        _handleLeft() {}
        _handleRight() {}
      },
      class Authenticating extends this {
        $enter() {
          this.tag('LoadingOverlay').visible = true
          this.spinnerAnimation.start()
        }
        $exit() {
          this.spinnerAnimation.stop()
          this.tag('LoadingOverlay').visible = false
        }
        _handleEnter() {}
        _handleBack() {}
        _handleUp() {}
        _handleDown() {}
        _handleLeft() {}
        _handleRight() {}
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
            this.star += (this.prevState === "EnterPassword") ? '\u25CF' : ''
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else if (key === 'Delete') {
            this.textCollection[this.prevState] = ''
            this.star = (this.prevState === "EnterPassword") ? '' : this.star
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          } else {
            this.textCollection[this.prevState] += key
            this.star += (this.prevState === "EnterPassword") ? '\u25CF' : ''
            this.tag(this.element).text.text = this.encrypt() ? this.star : this.textCollection[this.prevState];
          }
          this._updateConnectButtonColor()
          this.tag('ErrorText').visible = false
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
    this.tag('ConnectButton').color = 0xff444444
    this.tag('ErrorText').visible = false
  }
}
