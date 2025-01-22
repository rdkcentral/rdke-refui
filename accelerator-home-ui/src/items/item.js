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
import { Lightning, Utils } from '@lightningjs/sdk'

/**
 * Class for rendering items in UI list.
 */
export default class Item extends Lightning.Component {
  static _template() {
    return {
      Item: {
        w: 300,
        h: 150,
        rect: true,
        color: 0xFFDBEBFF,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 10
        },
      },
      OperatorLogo: {},
      Shadow: {
        alpha: 0,
        zIndex: 2,
        x: -25,
        y: -25,
        color: 0x66000000,
        texture: lng.Tools.getShadowRect(350, 180, 10, 10, 20),
      }
    }
  }

  /**
   * Function to set contents for an item in UI list.
   */
  set item(item) {
    this._item = item
    this.tag('OperatorLogo').patch({
      Logo: {
        w: 300,
        h: 150,
        zIndex: 3,
        src: Utils.asset(this._item.url),
      }
    })
  }

  _focus() {
    this.tag('Item').zIndex = 3
    this.tag('Item').scale = 1.2
    this.tag('Item').color = 0xFFFFFFFF
    this.tag('Shadow').patch({
      smooth: {
        alpha: 1
      }
    });
  }

  _unfocus() {
    this.tag('Item').zIndex = 1
    this.tag('Item').scale = 1
    this.tag('Item').color = 0xFFDBEBFF
    this.tag('Shadow').patch({
      smooth: {
        alpha: 0
      }
    });
  }
}
