
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

import { Lightning,Language } from "@lightningjs/sdk";
import { CONFIG } from "../../Config/Config";
export default class Cell extends Lightning.Component {

  static _template() {
    return {
      zIndex: 2,
    };
  }

  set txt(ins) {/* the text on the Cell */
    this.patch({
      AiringOverlay: {
        zIndex: 4,
        Title: {
          x: 10, y: 45, mountY: 0.5,
          text: {
            text: ins ? ins : Language.translate("No Shows are being aired at the moment"),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...'
          }
        }
      },

    })
    this.insText = ins ? ins : Language.translate("No Shows are being aired at the moment");
  }

  get txt() {
    return this.insText
  }

  set color(val) {
    let title = this.tag("Title")
    if (title) title.text.textColor = val
  }




  setBoldText() {
    let title = this.tag("Title")
    if (title) title.text.fontStyle = "bold"
  }

  unsetBoldText() {
    let title = this.tag("Title")
    if (title) title.text.fontStyle = "normal"
  }

  set width(w) {/* the horizontal width of the Cell */
    this.patch({
      Item: {
        // clipping: true,
        w: w-3,
        h: 78,
        color: 0xff272727,
        rect:true,
        // texture: Lightning.Tools.getRoundRect(w, 81, 0, 1, 0xff000000, true, 0xff272727),
      }
    })
    this.tag('Title').text.wordWrapWidth = w - 20;
  }

  getwidth() {
    return this.width;
  }


  _init() {
    this.tag('AiringOverlay').w = this.tag('Item').w
  }
}