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
 * Class for rendering items in Settings screen.
 */
export default class ConfirmAndCancel extends Lightning.Component {
  static _template() {
    return {
      Item: {
        w: 325, // previous value : ((1920 / 2) - 350) / 2
        h: 85, // previous value: 65
        rect: true,
        color: 0xffffffff,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 0 },
      },
    }
  }

  /**
   * Function to set contents for an item in settings screen.
   */
  set item(item) {
    this._item = item
    this.tag('Item').patch({
      Left: {
        x: this.tag("Item").w / 2, // orginal = 10
        y: this.tag('Item').h / 2,
        mountX: 0.5,
        mountY: 0.5,
        text: { text: item, fontSize: 25, textColor: 0xff000000, fontFace: CONFIG.language.font, },
      },
    })
  }

  /**
   * Set width of the item.
   */
  set width(width) {
    this.tag('Item').w = width
  }

  /**
   * Set height of the item.
   */
  set height(height) {
    this.tag('Item').h = height
  }

  _focus() {
    this.tag('Item').color = CONFIG.theme.hex;
  }

  _unfocus() {
    this.tag('Item').color = 0xffffffff;
  }
}
