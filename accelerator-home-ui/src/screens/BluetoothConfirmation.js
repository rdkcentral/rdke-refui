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
import { Lightning } from '@lightningjs/sdk'
import { CONFIG } from "../Config/Config"
/**
 * Class for pairing screen for the Bluetooth.
 */
export default class BluetoothConfirmation extends Lightning.Component {
  static _template() {
    return {
      w: 1920,
      h: 1080,
      rect: true,
      color: 0xff000000,
      Title: {
        mountX: 0.5,
        text: {
          text: "",
          fontFace: CONFIG.language.font,
          fontSize: 40,
          textColor: CONFIG.theme.hex,
        },
      },
      BorderTop: {
        x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
      },
      Pairing: {
        x: 0,
        y: 125,
        mountX: 0.5,
        text: {
          text: "",
          fontFace: CONFIG.language.font,
          fontSize: 25,
        },
      },
      RectangleDefault: {
        x: 0, y: 200, w: 200, mountX: 0.5, h: 50, rect: true, color: CONFIG.theme.hex,
        Ok: {
          x: 100,
          y: 25,
          mount: 0.5,
          text: {
            text: "OK",
            fontFace: CONFIG.language.font,
            fontSize: 22,
          },
        }
      },
      BorderBottom: {
        x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
      },

    }
  }

  set item(item) {
    this.tag('Title').text = item.name
  }


  _handleEnter() {
    this.fireAncestors('$pressOK')
  }
  _handleBack() {
    this.fireAncestors('$pressOK')
  }

}
