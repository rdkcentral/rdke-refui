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
import { CONFIG } from '../Config/Config'

/**
 * Class to render items in side panel.
 */
export default class SidePanelItem extends Lightning.Component {
  /**
   * Function to render various elements in the side panel item.
   */
  static _template() {
    return {
      Item: {
        rect: true,
        Image: {
          w: 70,
          H: 70,
        },
        Title: {
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 40,
            textColor: 0xffffffff,
          },
        }
      },
    }
  }

  _init() {
    this.tag('Image').patch({
      src: Utils.asset(this.data.url),
      w: this.w,
      h: this.h,
      scale: this.unfocus,
    })
  }

  /**
   * Function to change properties of item during focus.
   */
  _focus() {
    this.tag('Image').patch({ w: this.w, h: this.h, scale: this.focus, color: CONFIG.theme.hex })
  }

  /**
   * Function to change properties of item during unfocus.
   */
  _unfocus() {
    this.tag('Image').patch({ w: this.w, h: this.h, scale: this.unfocus, color: 0xffffffff })
  }

  setColor(){
    this.tag('Image').patch({ w: this.w, h: this.h, scale: this.focus, color: CONFIG.theme.hex })
  }
  clearColor(){
    this.tag('Image').patch({ w: this.w, h: this.h, scale: this.unfocus, color: 0xffffffff })
  }
}
