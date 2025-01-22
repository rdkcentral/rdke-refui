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
 * Class to render items in Arrow Icon Item.
 */
export default class ArrowIconItem extends Lightning.Component {
  /**
   * Function to render Arrow Icon elements in the Main View.
   */
  static _template() {
    return {
      Item: {
        Image: {
          x: 0,
          alpha: 1,
        },
      },
    }
  }

  _init() {
    this.tag('Image').patch({
      src: Utils.asset(this.data.url),
      w: this.w,
      h: this.h,
    })
  }
}
