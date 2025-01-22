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
import { CONSTANTS } from './constant';
import { PinChallenge } from '@firebolt-js/manage-sdk'
export default class SecurityPinScreen extends Lightning.Component {
  set params(args) {
    console.log("args:", args)
    if (args.message !== "") {
      this.tag('Description').text.text = Language.translate(args.message)
    }
    this.responder = args.responder
    this.challenge = args.challenge
    this.numFailures = 0
    this.lockedTime = 0
  }
  pageTransition() {
    return 'left'
  }

  handleDone() {
    console.log("Inside handle done")
    this.onPinEntered(this.textCollection['TextBox'])
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
      KeypadBg: {
        x: 730,
        y: 200,
        w: 380,
        h: 600,
        rect: true,
        color: 0xCC000000,
        alpha: 1
      },
      Title: {
        x: 730,
        y: 70,
        text: {
          text: Language.translate('Security PIN input'),
          fontFace: CONFIG.language.font,
          fontSize: 40,
          textColor: CONFIG.theme.hex,
        },
      },
      Description: {
        x: 730,
        y: 130,
        text: {
          text: Language.translate('Default description'),
          fontFace: CONFIG.language.font,
          fontSize: 25,
          textColor: 0xffffffff,
        },
      },
      BorderTop: {
        x: 570, y: 125, w: 700, h: 2, rect: true,
      },
      TextBox: {
        x: 750,
        y: 220,
        texture: Lightning.Tools.getRoundRect(340, 65, 0, 3, 0xffffffff, false)
      },
      PinText: {
        x: 770,
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
      Keyboard: {
        y: 300,
        x: 750,
        type: Keyboard,
        visible: true,
        zIndex: 2,
        formats: KEYBOARD_FORMATS.numbers
      }
    }
  }
  onPinEntered(pin) {
    if (pin === CONSTANTS.PINS[this.challenge.pinSpace]) {
      console.log("Correct pin")
      this.responder({
        granted: true,
        reason: PinChallenge.ResultReason.CORRECT_PIN
      })
      Router.back()
    } else {
      console.log("Wrong pin")
      this.numFailures++
      if (this.numFailures >= CONSTANTS.MAX_FAILURES) {
        this.lockedTime = Date.now()
        this.responder({
          granted: false,
          reason: PinChallenge.ResultReason.EXCEEDED_PIN_FAILURES
        })
        Router.back()
      }
    }
  }

  _focus() {
    this.tag("PinText").text.text = "";
    this.textCollection = { 'TextBox': '', 'encrypted': '' }
  }
  _handleDown() {
    this._setState('TextBox');
  }

  _handleBack() {
    if (!Router.isNavigating()) {
      Router.back()
    }
  }

  static _states() {
    return [
      class TextBox extends this{
        $enter() {
          this.tag('TextBox').texture = Lightning.Tools.getRoundRect(340, 65, 0, 3, CONFIG.theme.hex, false)
        }
        _handleEnter() {
          this._setState('Keyboard')
        }
        $exit() {
          this.tag('TextBox').texture = Lightning.Tools.getRoundRect(340, 65, 0, 3, 0xffffffff, false)
        }
      },
      class Keyboard extends this{
        $enter(state) {
          this.prevState = state.prevState
          if (this.prevState === 'TextBox') {
            this.element = 'PinText'
          }
        }
        _getFocused() {
          return this.tag('Keyboard')
        }

        $onSoftKey({ key }) {
          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Clear') {
            this.textCollection['TextBox'] = ''
            this.textCollection['encrypted'] = ''
            this.tag('PinText').text.text = this.textCollection['encrypted'];
          } else if (key === 'Space') {
            this.textCollection['encrypted'] += '\u25CF'
            this.textCollection['TextBox'] += ' '
            this.tag('PinText').text.text = this.textCollection['encrypted'];
          } else if (key === 'Delete') {
            this.textCollection['encrypted'] = this.textCollection['encrypted'].substring(0, this.textCollection['encrypted'].length - 1);
            this.textCollection['TextBox'] = this.textCollection['TextBox'].substring(0, this.textCollection['TextBox'].length - 1);
            this.tag('PinText').text.text = this.textCollection['encrypted'];
          } else {
            this.textCollection['TextBox'] += key
            this.textCollection['encrypted'] += '\u25CF'
            this.tag('PinText').text.text = this.textCollection['encrypted'];
          }
        }
      }
    ]
  }
}
