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

import { Lightning } from "@lightningjs/sdk";
import TvOverlaySettingsItem from "../../items/TvOverlaySettingsItem";
import PictureSettingsApi from "../../api/PictureSettingsApi";

export default class TvOverlaySettingsScreen extends Lightning.Component {
  static _template() {
    return {
      Contents: {
        h: 1080,
        w: 500,
        Background: {
          h: 1080,
          w: 500,
          rect: true,
          colorLeft: 0xff000000,
          colorRight: 0x99000000,
        },
        Settings: {
          w: 500,
          h: 910,
          clipping: true,
          y: 80,
          List: {
            type: Lightning.components.ListComponent,
            w: 500,
            h: 910,
            y: 5,
            itemSize: 90,
            horizontal: false,
            invertDirection: true,
            roll: true,
            rollMax: 900,
            itemScrollOffset: -9,
          },
        },
      },
    };
  }

  _firstEnable() {
    this.customLock = false; //by default its unlocked | will get locked when user switches any preset value
    this.pictureApi = new PictureSettingsApi();
    this.options = this.pictureApi.getOptions(); //#byDefault //not required //fetches the defaults dummy values //following api calls fetches the actual values from api here after
    this.pictureApi
      .getSupportedPictureModes()
      .then((res) => {
        if (res) {
          this.options = this.pictureApi.getOptions();
          this.refreshList();
        }
      })
      .catch((err) => {
        console.log(
          "ERROR from settings overlay screen firstEnable: getSupportedPictureModes: ",
          JSON.stringify(err)
        );
      });
    //the getSupportedColorTemps api call has some issue when working on chrome browser
    this.pictureApi
      .getSupportedColorTemps()
      .then((res) => {
        if (res) {
          this.options = this.pictureApi.getOptions();
          this.refreshList();
        }
      })
      .catch((err) => {
        console.log(
          "ERROR from settings overlay screen firstEnable: getSupportedColorTemps: ",
          JSON.stringify(err)
        );
      });
  }

  refreshList() {
    console.log("this.refreshList got called");
    this.tag("List").items = this.options.map((item) => {
      return {
        w: 500,
        h: 90,
        type: TvOverlaySettingsItem,
        item: item,
      };
    });
  }

  _focus() {
    this.fireAncestors('$focusOverlay');
    console.log("index: ", this.tag("List").index);
    // this.tag("List").setIndex(0);//not necessary
  }

  _unfocus() {
    this.fireAncestors('$unfocusOverlay');
  }

  _getFocused() {
    return this.tag("List").element;
  }

  _handleDown() {
    this.fireAncestors('$resetTimeout');
    if (this.tag("List").index < this.tag("List").length - 1) {
      //to prevent circular scrolling
      if (this.tag("List").index === 1) {
        //to check if user should be moving to third item
        if (!this.customLock) { //customLock value is true means api call is happening wait before moving down
          this.moveDownOnCustom()
        } else {
          console.log("changing the preset value cant moveDown now!!")
        }
      } else {
        this.tag("List").setNext();
      }
    }
  }

  _handleUp() {
    this.fireAncestors('$resetTimeout');
    if (this.tag("List").index > 0) {
      //to prevent circular scrolling
      this.tag("List").setPrevious();
    }
  }

  _handleLeft() {
    // do nothing
  }
  _handleRight() {
    // do nothing
  }

  async moveDownOnCustom() {
    try {
      const pictureMode = await this.pictureApi.getPictureMode();
      const colorTemp = await this.pictureApi.getColorTemperature();
      console.log("picture mode: ", pictureMode, " color temperature: ", colorTemp);
      if (pictureMode === "custom" && colorTemp === "User Defined") {
        this.tag("List").setNext();
      } else {
        this.tag("List").setIndex(1);
      }
    } catch {
      console.log("error occoured in api call");
    }
  }

  $moveDownLock(lock) {
    this.customLock = lock //prevents user from moving down when a preset value change api call is happening
  }

}
