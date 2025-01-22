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
import {
  Lightning,
  Utils
} from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config'
/**
 * Class to render items in main view.
 */
export default class AppListItem extends Lightning.Component {
  /**
   * Function to render various elements in the main view item.
   */
  static _template() {
    return {
      Item: {
        Shadow: {
          alpha: 0,
          color: CONFIG.theme.hex,
        },
        x: 0,
        Image: {},
        Title: {
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xffffffff,
            cutEx: 300,
          },
          mount: 0.5,
          alpha: 0,
        },
      },

    }
  }

  _init() {
    if (this.data.url.startsWith('/images')) {
      this.tag('Image').patch({
        w: this.w,
        h: this.h,
        src: Utils.asset(this.data.url),
        scale: this.unfocus,
      })
    } else {
      this.tag('Image').patch({
        src: this.data.url,
        w: this.w,
        h: this.h
      })
    }
  }

  /**
   * Function to change properties of item during focus.
   */
  _focus() {
    this.tag('Image').patch({
      x: this.x,
      w: this.w,
      h: this.h,
      zIndex: 1,
      scale: this.focus,
    })
    this.tag('Item').patch({
      zIndex: 2
    })
    this.tag('Shadow').patch({
      scale: this.focus,
      alpha: 1,
      y: -12,
      texture: lng.Tools.getShadowRect(this.w, this.h + 24, 0, 0, 0),
    });
  }

  /**
   * Function to change properties of item during unfocus.
   */
  _unfocus() {
    this.tag('Image').patch({
      x: 0,
      y: 0,
      w: this.w,
      h: this.h,
      scale: this.unfocus,
    })
    this.tag('Item').patch({
      zIndex: 0
    })
    this.tag('Shadow').patch({
      alpha: 0
    });
  }
}
