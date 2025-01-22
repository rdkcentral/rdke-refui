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
import { Lightning, Utils } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import { COLORS } from "../colors/Colors";
/**
 * Class to render items with tick Icon.
 */
export default class TickMarkItem extends Lightning.Component {
  /**
   * Function to render Tick mark Icon elements in the settings.
   */

  _construct() {
    this.Tick = Utils.asset("/images/settings/Tick.png");
  }
  static _template() {
    return {
      zIndex: 1,
      TopLine: {
        y: 0,
        mountY: 0.5,
        w: 1600,
        h: 3,
        rect: true,
        color: 0xffffffff,
      },
      Item: {
        w: 1600,
        h: 90,
      },
      BottomLine: {
        y: 90,
        mountY: 0.5,
        w: 1600,
        h: 3,
        rect: true,
        color: 0xffffffff,
      },
    };
  }

  set isTicked(isTicked) {
    this.tag("Item").patch({
      Tick: {
        x: 10,
        y: 45,
        mountY: 0.5,
        h: 32.5,
        w: 32.5,
        src: this.Tick,
        color: 0xffffffff,
        visible: isTicked,
      },
    });
  }

  _init() {
    this.tag("Item").patch({
      Left: {
        x: 40,
        y: 45,
        mountY: 0.5,
        text: {
          text: this.itemName,
          fontSize: 25,
          textColor: COLORS.textColor,
          fontFace: CONFIG.language.font,
        },
      },
    });
    this.tag("Item.Tick").on("txError", () => {
      const url =
        "http://127.0.0.1:50050/lxresui/static/images/settings/Tick.png";
      this.tag("Item.Tick").src = url;
    });
  }

  _handleEnter() {
    this.onHandleEnter(this.uniqID); //expecting a function that gets executed on handleEnter
  }
  _focus() {
    this.tag("Item").color = COLORS.hightlightColor;
    this.tag("TopLine").color = CONFIG.theme.hex;
    this.tag("BottomLine").color = CONFIG.theme.hex;
    this.patch({
      zIndex: 2,
    });
    this.tag("TopLine").h = 6;
    this.tag("BottomLine").h = 6;
  }

  _unfocus() {
    this.tag("TopLine").color = 0xffffffff;
    this.tag("BottomLine").color = 0xffffffff;
    this.patch({
      zIndex: 1,
    });
    this.tag("TopLine").h = 3;
    this.tag("BottomLine").h = 3;
  }
}
