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
import { CONFIG } from "../../Config/Config"
export default class ChannelItem extends Lightning.Component {
  static _template() {
    return {
      w: 236,
      Title: {
        x: 10,
        y: 45,
        mountY: 0.5,
        zIndex: 2,
        text: {
          text: 'xxxxxx',
          fontFace: CONFIG.language.font,
          fontStyle: 'normal',
          fontSize: 21,
          textColor: 0xffffffff,
          maxLines: 1,
          maxLinexSuffix: '...',
          wordWrapWidth: 232,
        },
      },
      Item: {
        w: 236-3,
        h: 78,
        color: 0xff272727,
        rect:true,
        // texture: Lightning.Tools.getRoundRect(236, 81, 0, 1, 0xff000000, true, 0xff1d1c1c),
      },
    }
  }

  setBoldText() {
    let title = this.tag("Title")
    if (title) title.text.fontStyle = "bold"
  }

  unsetBoldText() {
    let title = this.tag("Title")
    if (title) title.text.fontStyle = "normal"
  }

  set fontStyle(v) {
    this.tag('Title').text.fontStyle = v
  }

  set title(val) {
    this.tag('Title').text = val
  }
  get title() {
    return this.tag("Title").text
  }
}
