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
 * Class to render items in Folder ListItem.
 */
export default class FolderListItem extends Lightning.Component {
  /**
   * Function to render various elements in the main view item.
   */
  static _template() {
    return {
      Item: {
        Shadow: {
          alpha: 0,
          x: -25,
          y: 0,
          color: 0x66000000,
          texture: lng.Tools.getShadowRect(270, 170, 10, 10, 20),
        },
        x: 30,
        y: 18,
        Title: {
          text: {
            fontFace: 'MS-Regular',
            fontSize: 32,
            textColor: 0xffffffff,
          },
          mountX: 0.5,
          alpha: 1,
        },
        Image: {},
      },
    }
  }

  _init() {
    if (this.data.show) {
      this.tag('Title').patch({
        x: this.x_text,
        y: this.y_text,
        alpha: 1,
        text: { text: this.data.title },
      })
    }
    this.tag('Title').patch({
      x: this.x_text,
      y: this.y_text,
      text: { text: this.data.displayName },
    })

    if (this.data.url.startsWith('/images')) {
      this.tag('Image').patch({
        src: Utils.asset(this.data.url),
        w: this.w,
        h: this.h,
        scale: this.unfocus,
      })
    } else {
      this.tag('Image').patch({ src: this.data.url, w: this.w, h: this.h })
    }
  }

  /**
   * Function to change properties of item during focus.
   */
  _focus() {
    this.tag('Image').patch({ w: this.w, h: this.h, scale: this.focus })
    this.tag('Title').patch({
      x: this.x_text,
      y: this.y_text,
      text: { text: this.data.displayName },
    })
    this.tag('Item').patch({ zIndex: 1 })
    this.tag('Shadow').patch({
      smooth: {
        alpha: 1
      }
    });
  }

  /**
   * Function to change properties of item during unfocus.
   */
  _unfocus() {
    this.tag('Image').patch({ x: 0, y: 0, w: this.w, h: this.h, scale: this.unfocus })
    this.tag('Item').patch({ zIndex: 0 })
    this.tag('Shadow').patch({
      smooth: {
        alpha: 0
      }
    });
  }
}
