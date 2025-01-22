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
import { CONFIG } from '../../Config/Config'
import { Lightning, Utils } from '@lightningjs/sdk'
import { Keyboard } from '../../ui-components/index'
import { KEYBOARD_FORMATS } from '../../ui-components/components/Keyboard'

export default class ConfigureManuallyScreen extends Lightning.Component {
  static _template() {
    return {
      Text: {
        x: 700,
        y: -140,
        text: {
          text: "Configure Manually",
          fontFace: CONFIG.language.font,
          fontSize: 35,
          textColor: CONFIG.theme.hex,
        },
      },
      BorderTop: {
        x: 122, y: -60, w: 1530, h: 2, rect: true,
      },
      IPv4: {
        x: 120,
        y: -10,
        text: {
          text: "IPv4 Address: ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      IPv4Box: {
        BorderLeft: { x: 330, y: -20, w: 3, h: 58, rect: true, },
        BorderTop: { x: 330, y: -20, w: 1320, h: 3, rect: true, },
        BorderRight: { x: 1650, y: -20, w: 3, h: 59, rect: true, },
        BorderBottom: { x: 330, y: 10 + 28, w: 1320, h: 3, rect: true, }
      },
      IPv4Text: {
        x: 380,
        y: -10,
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
      Subnet: {
        x: 120,
        y: 80,
        text: {
          text: "Subnet Mask: ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      SubnetBox: {
        BorderLeft: { x: 330, y: 60, w: 3, h: 58, rect: true, },
        BorderTop: { x: 330, y: 60, w: 1320, h: 3, rect: true, },
        BorderRight: { x: 1650, y: 60, w: 3, h: 59, rect: true, },
        BorderBottom: { x: 330, y: 88 + 28, w: 1320, h: 3, rect: true, }
      },
      SubnetText: {
        x: 380,
        y: 70,
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
      Gateway: {
        x: 120,
        y: 160,
        text: {
          text: "Gateway: ",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      GatewayBox: {
        BorderLeft: { x: 330, y: 140, w: 3, h: 58, rect: true, },
        BorderTop: { x: 330, y: 140, w: 1320, h: 3, rect: true, },
        BorderRight: { x: 1650, y: 140, w: 3, h: 59, rect: true, },
        BorderBottom: { x: 330, y: 168 + 28, w: 1320, h: 3, rect: true, }
      },
      GatewayText: {
        x: 380,
        y: 150,
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
        x: 122, y: 240, w: 1530, h: 2, rect: true,
      },
      Keyboard: {
        y: 270,
        x: 335,
        type: Keyboard,
        visible: true,
        zIndex: 2,
        formats: KEYBOARD_FORMATS.qwerty
      }

    }
  }

  _focus() {
    this._setState('EnterIPv4');
    this.textCollection = { 'EnterIPv4': '', 'EnterSubnet': '', 'EnterGateway': '' }
    this.tag('IPv4Text').text.text = "";
    this.tag("SubnetText").text.text = "";
    this.tag("GatewayText").text.text = "";
    this.fireAncestors("$hideSideAndTopPanels");

  }

  _unfocus() {
    this.fireAncestors("$showSideAndTopPanels");
  }

  static _states() {
    return [
      class EnterIPv4 extends this{
        $enter() {
          this.tag('IPv4Box.BorderLeft').color = CONFIG.theme.hex;
          this.tag("IPv4Box.BorderBottom").color = CONFIG.theme.hex;
          this.tag("IPv4Box.BorderRight").color = CONFIG.theme.hex;
          this.tag("IPv4Box.BorderTop").color = CONFIG.theme.hex;
        }
        _handleDown() {
          this._setState("EnterSubnet");
        }
        _handleEnter() {
          this._setState('Keyboard')
        }
        $exit() {
          this.tag('IPv4Box.BorderLeft').color = 0xffffffff;
          this.tag("IPv4Box.BorderBottom").color = 0xffffffff;
          this.tag("IPv4Box.BorderRight").color = 0xffffffff;
          this.tag("IPv4Box.BorderTop").color = 0xffffffff;
        }
      },
      class EnterSubnet extends this{
        $enter() {
          this.tag("SubnetBox.BorderBottom").color = CONFIG.theme.hex;
          this.tag("SubnetBox.BorderLeft").color = CONFIG.theme.hex;
          this.tag("SubnetBox.BorderRight").color = CONFIG.theme.hex;
          this.tag("SubnetBox.BorderTop").color = CONFIG.theme.hex;
        }
        _handleUp() {
          this._setState("EnterIPv4");
        }
        _handleEnter() {
          this._setState('Keyboard')
        }
        _handleDown() {
          this._setState("EnterGateway");
        }
        $exit() {
          this.tag("SubnetBox.BorderBottom").color = 0xffffffff;
          this.tag("SubnetBox.BorderLeft").color = 0xffffffff;
          this.tag("SubnetBox.BorderRight").color = 0xffffffff;
          this.tag("SubnetBox.BorderTop").color = 0xffffffff;
        }
      },
      class EnterGateway extends this{
        $enter() {
          this.tag('GatewayBox.BorderBottom').color = CONFIG.theme.hex;
          this.tag('GatewayBox.BorderLeft').color = CONFIG.theme.hex;
          this.tag('GatewayBox.BorderRight').color = CONFIG.theme.hex;
          this.tag('GatewayBox.BorderTop').color = CONFIG.theme.hex;
        }
        _handleUp() {
          this._setState("EnterSubnet");
        }
        _handleDown() {
          this._setState("EnterIPv4");
        }
        _handleEnter() {
          this._setState('Keyboard')
        }
        $exit() {
          this.tag('GatewayBox.BorderBottom').color = 0xffffffff;
          this.tag('GatewayBox.BorderLeft').color = 0xffffffff;
          this.tag('GatewayBox.BorderRight').color = 0xffffffff;
          this.tag('GatewayBox.BorderTop').color = 0xffffffff;
        }
      },
      class Keyboard extends this{
        $enter(state) {
          this.prevState = state.prevState
          if (this.prevState === 'EnterIPv4') {
            this.element = 'IPv4Text'

          }
          if (this.prevState === 'EnterSubnet') {
            this.element = 'SubnetText'
          }
          if (this.prevState === 'EnterGateway') {
            this.element = 'GatewayText'
          }
        }
        _getFocused() {
          return this.tag('Keyboard')
        }

        $onSoftKey({ key }) {
          if (key === 'Done') {
            this.handleDone();
          } else if (key === 'Clear') {
            this.textCollection[this.prevState] = this.textCollection[this.prevState].substring(0, this.textCollection[this.prevState].length - 1);
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
            console.log('no saving')
          } else if (key === 'Space') {
            this.textCollection[this.prevState] += ' '
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else if (key === 'Delete') {
            this.textCollection[this.prevState] = ''
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          } else {
            this.textCollection[this.prevState] += key
            this.tag(this.element).text.text = this.textCollection[this.prevState];
          }
        }

        _handleBack() {
          this._setState(this.prevState)
        }
      }
    ]
  }
}
