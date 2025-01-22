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
import { Lightning, Router, Language } from '@lightningjs/sdk'
import { CONFIG } from '../../../Config/Config';
import { Keyboard } from '../../../ui-components/index'
import { KEYBOARD_FORMATS } from '../../../ui-components/components/Keyboard'
import PasswordSwitch from '../../../screens/PasswordSwitch';
export default class KeyboardScreen extends Lightning.Component {
  set params(args) {
    if (args.message !== "") {
      this.tag('Description').text.text = Language.translate(args.message)
    }
    this.tag('InputType').text.text = args.type
    this.hidePasswd = false;
    this.password = false
    if (args.type === 'password') {
      this.password = true
      this.hidePasswd = true;
      console.log("Making the password switch visible")
      this.tag('PasswrdSwitch').patch({
        visible: true
      });
      this.tag('ShowPassword').patch({
        visible: true
      });
    }
    this.responder = args.responder
  }
  pageTransition() {
    return 'left'
  }

  handleDone() {
    this.responder({ text: this.textCollection['TextBox'], canceled: false })
    Router.back();
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        rect: true,
        alpha: 1,
        color: 0xCC000000,
      },
      Title: {
        x: 200,
        y: 70,
        text: {
          text: "Keyboard challenge",
          fontFace: CONFIG.language.font,
          fontSize: 35,
          textColor: CONFIG.theme.hex,
        },
      },
      Description: {
        x: 200,
        y: 130,
        text: {
          text: Language.translate('Default description'),
          fontFace: CONFIG.language.font,
          fontSize: 25,
          textColor: 0xffffffff,
        },
      },
      BorderTop: {
        x: 190, y: 125, w: 1488, h: 2, rect: true,
      },

      InputType: {
        x: 190,
        y: 316,
        text: {
          text: "Password: ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      InputBox: {
        x: 400,
        y: 300,
        texture: Lightning.Tools.getRoundRect(1279, 70, 0, 3, 0xffffffff, false)
      },
      InputText: {
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
      PasswrdSwitch: {
        h: 45,
        w: 66.9,
        x: 1642,
        y: 340,
        zIndex: 2,
        type: PasswordSwitch,
        mount: 0.5,
        visible: false
      },
      ShowPassword: {
        x: 1420,
        y: 322,
        w: 300,
        h: 75,
        zIndex: 2,
        text: { text: 'Show Password', fontSize: 25, fontFace: CONFIG.language.font, textColor: 0xffffffff, textAlign: 'left' },
        visible: false
      },

      Keyboard: {
        y: 437,
        x: 400,
        type: Keyboard,
        visible: true,
        zIndex: 2,
        formats: KEYBOARD_FORMATS.qwerty
      },
      Cancel: {
        x: 1580, y: 60, w: 150, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
        Title: {
          x: 75,
          y: 30,
          mount: 0.5,
          text: {
            text: "Cancel",
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xFF000000,
            fontStyle: 'bold'
          },
        },
        visible: true,
      }
    }
  }

  _focus() {
    this._setState("InputBox")
    this.tag("InputText").text.text = "";
    this.textCollection = { 'TextBox': '', 'encrypted': '' }
  }

  get session() {
    return this._session
  }

  set session(session) {
    this.donePending = false
    this._session = session
    this.onDone = session.onDone
    this.onCancel = session.onCancel
  }


  _getFocused() {
    return this
  }

  _handleBack() {
    this.responder({ text: '', canceled: true })
    if (!Router.isNavigating()) {
      Router.back()
    }
  }
  _updateText(txt) {
    this.tag("InputText").text.text = txt;
  }

  static _states() {
    return [
      class InputBox extends this{
        $enter() {
          this.tag('InputBox').texture = Lightning.Tools.getRoundRect(1279, 70, 0, 3, CONFIG.theme.hex, false)
        }
        _handleDown() {
          this._setState("Keyboard");
        }
        _handleUp() {
          this._setState("Cancel");
        }
        _handleEnter() {
          this._setState('Keyboard')
        }
        $exit() {
          this.tag('InputBox').texture = Lightning.Tools.getRoundRect(1279, 70, 0, 3, 0xffffffff, false)
        }
      },
      class Keyboard extends this{
        $enter(state) {
          this.prevState = state.prevState
          if (this.prevState === 'InputBox') {
            this.element = 'InputText'
          }
        }
        _getFocused() {
          return this.tag('Keyboard')
        }
        _handleUp() {
          if (this.password)
            this._setState("PasswordSwitchState");
          else
            this._setState("Cancel")
        }

        $onSoftKey({ key }) {
          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Delete') {
            this.textCollection['encrypted'] = this.textCollection['encrypted'].substring(0, this.textCollection['encrypted'].length - 1);
            this.textCollection['TextBox'] = this.textCollection['TextBox'].substring(0, this.textCollection['TextBox'].length - 1);
            this.tag("InputText").text.text = this.hidePasswd ? this.textCollection['encrypted'] : this.textCollection['TextBox'];
          } else if (key === 'Space') {
            this.textCollection['TextBox'] += ' '
            this.textCollection['encrypted'] += '\u25CF'
            this.tag(this.element).text.text = this.hidePasswd ? this.textCollection['encrypted'] : this.textCollection['TextBox'];
          } else if (key === 'Clear') {
            this.textCollection['encrypted'] = ''
            this.textCollection['TextBox'] = ''
            this.tag("InputText").text.text = this.hidePasswd ? this.textCollection['encrypted'] : this.textCollection['TextBox'];
          }
          else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving')
          }
          else {
            this.textCollection['TextBox'] += key
            this.textCollection['encrypted'] += '\u25CF';
            this.tag("InputText").text.text = this.hidePasswd ? this.textCollection['encrypted'] : this.textCollection['TextBox'];
          }
        }

        _handleBack() {
          this._setState(this.prevState)
        }
      },

      class PasswordSwitchState extends this{
        $enter() {
          this.tag("InputBox").texture = Lightning.Tools.getRoundRect(1279, 70, 0, 3, CONFIG.theme.hex, false)
        }
        _handleDown() {
          this._setState("Keyboard");
        }
        _handleUp() {
          this._setState("Cancel");
        }
        _getFocused() {
          return this.tag('PasswrdSwitch');
        }

        $handleEnter(bool) {
          if (bool) {
            this._updateText(this.textCollection['TextBox'])
            this.hidePasswd = false;
          }
          else {
            this._updateText(this.textCollection['encrypted']);
            this.hidePasswd = true;
          }
          this.isOn = bool;
        }

        $exit() {
          this.tag("InputBox").texture = Lightning.Tools.getRoundRect(1279, 70, 0, 3, 0xffffffff, false)
        }
      },
      class Cancel extends this{
        $enter() {
          this.tag("Cancel")
          this._focus()
        }
        _handleEnter() {
          this.responder({ text: '', canceled: true })
          Router.back();
        }
        _handleDown() {
          if (this.hidePasswd)
            this._setState("PasswordSwitchState");
          else
            this._setState("InputBox");
        }

        _focus() {
          this.tag('Cancel').patch({
            color: CONFIG.theme.hex
          })
          this.tag('Cancel.Title').patch({
            text: {
              textColor: 0xFFFFFFFF
            }
          })
        }
        _unfocus() {
          this.tag('Cancel').patch({
            color: 0xFFFFFFFF
          })
          this.tag('Cancel.Title').patch({
            text: {
              textColor: 0xFF000000
            }
          })
        }
        $exit() {
          this._unfocus()
        }
      }
    ]
  }
}
