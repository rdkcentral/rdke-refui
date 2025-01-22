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

import { Lightning, Utils, Storage, Language } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import HDMIApi from "../api/HDMIApi";

export default class TvOverlayInputItem extends Lightning.Component {
  _construct() {
    this.Tick = Utils.asset("/images/settings/Tick.png");
  }
  static _template() {
    return {
      zIndex: 1,
      TopLine: {
        y: 0,
        mountY: 0.5,
        w: 1720,
        h: 3,
        rect: true,
        color: 0xffffffff,
      },
      Item: {
        w: 1720,
        h: 90,
        Loader: {
          zIndex: 10,
          h: 45,
          w: 45,
          x: 1720,
          y: 45,
          mountY: 0.5,
          mountX: 1,
          src: Utils.asset("images/settings/Loading.png"),
          color: 0xffffffff,
          visible: false,
        },
        InputError: {
          x: 1500,
          y: 45,
          mountY: 0.5,
          text: {
            text: Language.translate("Input not available"),
            fontSize: 25,
            textColor: 0xffffffff,
            fontFace: CONFIG.language.font,
          },
          visible: false,
        },
      },
      BottomLine: {
        y: 90,
        mountY: 0.5,
        w: 1720,
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
    this.tag("Item.InputError").visible = false; //to remove the error text, when the list is refreshed.
  }

  _init() {
    console.log("_init from inputItem: list is getting rendered");
    this.hdmiApi = new HDMIApi();
    this.loadingAnimation = this.tag("Item.Loader").animation({
      duration: 3,
      repeat: -1,
      stopMethod: "immediate",
      actions: [{ p: "rotation", v: { sm: 0, 0: 0, 1: 2 * Math.PI } }],
    });

    this.tag("Item").patch({
      Left: {
        x: 40,
        y: 45,
        mountY: 0.5,
        text: {
          text: this.itemName,
          fontSize: 25,
          textColor: 0xffffffff,
          fontFace: CONFIG.language.font,
        },
      },
    });
    this.tag("Item.Tick").on("txError", () => {
      const url =
        "http://127.0.0.1:50050/lxresui/static/images/settings/Tick.png";
      this.tag("Item.Tick").src = url;
    });
    this.tag("Item.Loader").on("txError", () => {
      const url =
        "http://127.0.0.1:50050/lxresui/static/images/settings/Loading.png";
      this.tag("Item.Loader").src = url;
    });
  }

  _handleEnter() {
    this.fireAncestors('$resetTimeout');
    if (!this.tag("Item.Tick").visible) {
      //to start the loader
      this.loadingAnimation.start();
      this.tag("Item.Loader").visible = true;
      this.tag("Item.InputError").visible = false;
      const minLoaderDuration = 1000; //1 sec min duration to show the loader before the tick mark appears in the ui
      /////////////////
      this.hdmiApi
        .getHDMIDevices() //api does not throw error, just consider error condition when result is empty
        .then((res) => {
          console.log("getHDMIDevices from input Item: ", JSON.stringify(res));
          if (res.length > 0) {
            res.map((item) => {
              if (item.id === this.uniqID.id) {
                if (item.connected === "true") {
                  //to check if the current item is connected
                  this.hdmiApi
                    .setHDMIInput(item)
                    .then(() => {
                      console.log("input set to: ", JSON.stringify(item));
                      //to stop the loader and show tickmark
                      setTimeout(() => {
                        this.loadingAnimation.stop();
                        this.tag("Item.Loader").visible = false;
                        Storage.set("_currentInputMode", { id: item.id, locator: item.locator });
                        this.fireAncestors("$getInputs"); //getInputs will fetch the inputs from api,
                      }, minLoaderDuration);
                    })
                    .catch((err) => {
                      console.log(
                        "Failed to setHDMIInput",
                        JSON.stringify(err)
                      );
                      //to stop the loader
                      setTimeout(() => {
                        this.loadingAnimation.stop();
                        this.tag("Item.Loader").visible = false;
                      }, minLoaderDuration);
                      ///////////////////////
                      //display the error in the notification
                    });
                } else {
                  console.log(
                    "device not connected! item: ",
                    JSON.stringify(item)
                  );
                  setTimeout(() => {
                    this.loadingAnimation.stop();
                    this.tag("Item.Loader").visible = false;
                    this.tag("Item.InputError").visible = true;
                  }, minLoaderDuration);
                }
              } else {
                console.log(
                  "ID not match! uniqID: ",
                  JSON.stringify(this.uniqID),
                  " item: ",
                  JSON.stringify(item)
                );
              }
            });
          } else {
            console.log("getHDMIDevices returned empty array"); //in case of error, getHDMIDevices api return empty array
            setTimeout(() => {
              this.loadingAnimation.stop();
              this.tag("Item.Loader").visible = false;
            }, minLoaderDuration);
          }
        })
        .catch((err) => {
          console.log("Failed to getHDMIDevices", JSON.stringify(err));
          //to stop the loader
          setTimeout(() => {
            this.loadingAnimation.stop();
            this.tag("Item.Loader").visible = false;
          }, minLoaderDuration);
        });
    } else {
      console.log(Storage.get("_currentInputMode"));
    }
  }

  _focus() {
    //  this.tag("Item").color = COLORS.hightlightColor;
    this.refresh = false; //to check if the list needs a refresh // if connection status is false and user presses enter twice, hdmi input list gets refreshed
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
