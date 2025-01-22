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

import { Language, Lightning, Storage } from "@lightningjs/sdk";
import { CONFIG } from "../../Config/Config";
import TvOverlayInputItem from "../../items/TvOverlayInputItem";
import HDMIApi from "../../api/HDMIApi";

export default class TvOverlayInputScreen extends Lightning.Component {
  static _template() {
    return {
      Contents: {
        h: 630,
        w: 1920,
        x: 960,
        mountX: 0.5,
        Background: {
          h: 630,
          w: 1920,
          rect: true,
          colorTop: 0xff000000,
          colorBottom: 0x99000000,
        },
        Title: {
          y: 70,
          x: 100,
          text: {
            text: Language.translate("Video Input"),
            fontFace: CONFIG.language.font,
            textColor: CONFIG.theme.hex,
            fontSize: 40,
            wordWrap: false,
            wordWrapWidth: 370,
            fontStyle: "bold",
            textOverflow: "ellipsis",
          },
        },
        Inputs: {
          w: 1720,
          h: 370,
          clipping: true,
          y: 166,
          x: 960,
          mountX: 0.5,
          // rect: true, //
          // color: 0xffff0000, //
          List: {
            type: Lightning.components.ListComponent,
            w: 1720,
            h: 370,
            y: 5,
            itemSize: 90,
            horizontal: false,
            invertDirection: true,
            roll: true,
            rollMax: 900,
            itemScrollOffset: -3,
          },
        },
        BorderLine: {
          y: 630,
          mountY: 1,
          w: 1920,
          h: 3,
          rect: true,
          color: 0xffffffff,
        },
      },
    };
  }

  refreshItems(selected) {
    console.log("refreshItems called: rendering the items");
    this.tag("List").items = this.inputItems.map((item, index) => {
      return {
        ref: "Inputs" + index,
        w: 1720,
        h: 90,
        type: TvOverlayInputItem,
        isTicked: selected.id === item.id && selected.locator === item.locator,
        itemName: this.options[index], //item.toUpperCase(), //pass the formated item name if required
        uniqID: item, //pass a uniq id that is to be returned when handle enter is pressed
        onHandleEnter: this.refreshItems.bind(this), //pass this function to refresh the tickmarks
      };
    });
  }

  _firstEnable() {
    this.options = ["HDMI1", "HDMI2", "HDMI3", "HDMI4"];
    this.inputItems = [
      {
        id: 0,
        locator: "hdmiin://localhost/deviceid/0",
        connected: true,
      },
      {
        id: 1,
        locator: "hdmiin://localhost/deviceid/1",
        connected: false,
      },
      {
        id: 2,
        locator: "hdmiin://localhost/deviceid/2",
        connected: true,
      },
    ];
    this.hdmiApi = new HDMIApi();
    this.$getInputs();
  }

  $getInputs() {
    console.log("fetching hdmi input options"); //call get inputs and refresh items after an event

    this.hdmiApi
      .getHDMIDevices()
      .then((res) => {
        this.inputItems = res;
        this.refreshItems(Storage.get("_currentInputMode"));
      })
      .catch((err) => {
        console.log("inputScreen: getHDMIDevices Error: ", JSON.stringify(err));
      });
  }

  _focus() {
    this.fireAncestors('$focusOverlay');
    this.$getInputs(); //fetch the input modes and refresh the list, in case input status changes
  }

  _unfocus() {
    this.fireAncestors('$unfocusOverlay');
  }

  _getFocused() {
    return this.tag("List").element;
  }

  _handleDown() {
    this.fireAncestors('$resetTimeout');
    this.tag("List").setNext();
  }

  _handleUp() {
    this.fireAncestors('$resetTimeout');
    this.tag("List").setPrevious();
  }
  _handleLeft() {
    this.fireAncestors('$resetTimeout');
    // do nothing
  }
  _handleRight() {
    this.fireAncestors('$resetTimeout');
    // do nothing
  }
}
