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

import { Lightning, Utils, Language } from "@lightningjs/sdk";
import PictureSettingsApi from "../api/PictureSettingsApi";
import { CONFIG } from "../Config/Config";

export default class TvOverlaySettingsItem extends Lightning.Component {
  _construct() {
    this.pictureApi = new PictureSettingsApi();
  }
  static _template() {
    return {
      zIndex: 1,
      TopLine: {
        y: 0,
        mountY: 0.5,
        w: 500,
        h: 3,
        rect: true,
        color: 0xffffffff,
      },
      Item: {
        w: 500,
        h: 90,
        Title: {
          y: 45,
          x: 250,
          mount: 0.5,
          text: {
            text: "Setting: Sample Value",
            fontFace: CONFIG.language.font,
            fontSize: 25,
            wordWrap: false,
            wordWrapWidth: 400,
            fontStyle: "normal",
            textOverflow: "ellipsis",
          },
        },
        LeftArrow: {
          h: 45,
          w: 45,
          x: 0,
          scaleX: -1,
          y: 45,
          mountY: 0.5,
          src: Utils.asset("images/settings/Arrow.png"),
          color: 0xffffffff,
        },
        RightArrow: {
          h: 45,
          w: 45,
          y: 45,
          x: 500,
          mountY: 0.5,
          mountX: 1,
          src: Utils.asset("images/settings/Arrow.png"),
          color: 0xffffffff,
        },
      },
      BottomLine: {
        y: 90,
        mountY: 0.5,
        w: 500,
        h: 3,
        rect: true,
        color: 0xffffffff,
      },
    };
  }

  _init() {}

  set item(item) {
    this._item = item;
    this.fetchAndUpdateValues();
  }

  fetchAndUpdateValues() {
    console.log("fetchAndUpdateValues got called!!!")
    if (Array.isArray(this._item.value)) {
      this.valueIdx = 0;
      this.valueLength = this._item.value.length;

      this.pictureApi
        .getSettingsValue(this._item.id)
        .then((res) => {
          console.log("getSettingsValue Result from fetchAndUpdateValues(array): ",JSON.stringify(res));
          let tIdx = this._item.value.indexOf(res);
          if (tIdx >= 0) {
            this.valueIdx = tIdx;
          }
          this.updateValue(
            this.formatItemName(this._item.value[this.valueIdx])
          );
        })
        .catch((err) => {
          console.log(
            "error from getSettingsValue(value is array) in set(item) in settings Item: ",
            JSON.stringify(err)
          );
        });
    } else {
      this.pictureApi
        .getSettingsValue(this._item.id)
        .then((res) => {
          console.log("getSettingsValue Result from fetchAndUpdateValues(number): ", JSON.stringify(res));
          this._item.value = +res;
          this.currentVal = +res; //to change to int
          this.updateValue(this._item.value);
        })
        .catch((err) => {
          console.log(
            "error from getSettingsValue(value is number) in set(item) in settings Item: ",
            JSON.stringify(err)
          );
        });
    }
  }

  updateValue(value) {
    this.tag("Title").text.text = `${Language.translate(this._item.name)}: ${value}`;
  }

  formatItemName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  changeValueBy(val) {
    try {
      clearTimeout(this.changeValueTimer);
    } catch {
      console.log("CLEANUP ERROR");
    }
    if (this.currentVal + val <= 100 && this.currentVal + val >= 0) {
      this.currentVal += val;
      this.updateValue(this.currentVal);
    }

    this.changeValueTimer = setTimeout(() => {
      console.log(`SENDING VALUE:${this.currentVal} TO API: ${this._item.id}`);
      ///////////////// call set method and update the value in _item
      this.pictureApi
        .setSettingsValue(this._item.id, this.currentVal)
        .then((res) => {
          console.log(JSON.stringify(res));
          this._item.value = this.currentVal;
          this.updateValue(this.currentVal);
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
          console.log("this._item: ", JSON.stringify(this._item));
        });
    }, 600);
  }

  changePresetValueBy(direction) {
    this.fireAncestors("$moveDownLock",true); //user switching values prevent moving down
    try {
      clearTimeout(this.changePresetTimer);
    } catch {
      console.log("CLEANUP ERROR");
    }

    if (direction === "left") {
      this.valueIdx -= 1;
      if (this.valueIdx < 0) {
        this.valueIdx = this.valueLength - 1;
      }
    } else if (direction === "right") {
      this.valueIdx += 1;
      if (this.valueIdx >= this.valueLength) {
        this.valueIdx = 0;
      }
    }
    this.updateValue(this.formatItemName(this._item.value[this.valueIdx]));

    this.changePresetTimer = setTimeout(() => {
      console.log(
        `SENDING VALUE:${this._item.value[this.valueIdx]} TO API: ${
          this._item.id
        }`
      );
      ///////// call set method and update the value in _item
      this.pictureApi
        .setSettingsValue(this._item.id, this._item.value[this.valueIdx])
        .then((res) => {
          console.log(JSON.stringify(res));
          console.log(this._item.value[this.valueIdx]);
          this.updateValue(
            this.formatItemName(this._item.value[this.valueIdx])
          );
          this.fireAncestors("$moveDownLock",false); //api call success  user can move down
        })
        .catch((err) => {
          console.log(JSON.stringify(err));
        });
    }, 600);
  }

  _handleLeft() {
    this.fireAncestors('$resetTimeout');
    if (this.valueLength > 0) {
      //value is an array
      this.changePresetValueBy("left");
    } else {
      if (this._item.id !== "_pictureMode" || this._item.id !== "_colorTemp") {
        this.changeValueBy(-1);
      }
    }
  }
  _handleRight() {
    this.fireAncestors('$resetTimeout');
    if (this.valueLength > 0) {
      //value is an array
      this.changePresetValueBy("right");
    } else {
      if (this._item.id !== "_pictureMode" || this._item.id !== "_colorTemp") {
        //except for preset, this condition check can be omitted by considering the value is not an array in this case
        this.changeValueBy(1);
      }
    }
  }

  _handleEnter() {
    this.fireAncestors('$resetTimeout');
  }

  _focus() {
    this.tag("TopLine").color = CONFIG.theme.hex;
    this.tag("BottomLine").color = CONFIG.theme.hex;
    this.patch({
      zIndex: 2,
    });
    this.tag("TopLine").h = 6;
    this.tag("BottomLine").h = 6;

    this.fetchAndUpdateValues(); //fetches the value from the api and updates on ui
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
