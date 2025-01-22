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
 import { COLORS } from "../../colors/Colors";
 import SettingsMainItem from "../../items/SettingsMainItem";
 import { CONFIG } from "../../Config/Config";
 import DTVApi from "../../api/DTVApi";
 import LiveTvScanOverlay from './LiveTvScanOverlay'

 let active = true; //expecting dtv plugin is active by default

 /**
  * Class for Live TV settings screen.
  */
 export default class LiveTVSettings extends Lightning.Component {
   static _template() {
     return {
       LiveTVSettingsScreenContents: {
         x: 200,
         y: 275,
         Activate: {
           type: SettingsMainItem,
           Title: {
             x: 10,
             y: 45,
             mountY: 0.5,
             text: {
               text: Language.translate("Activate / Deactivate"),
               textColor: COLORS.titleColor,
               fontFace: CONFIG.language.font,
               fontSize: 25,
             },
           },
           Button: {
             h: 45,
             w: 67,
             x: 1600,
             mountX: 1,
             y: 45,
             mountY: 0.5,
             src: Utils.asset("images/settings/ToggleOnOrange.png"),
           },
         },
         Scan: {
           y: 90,
           type: SettingsMainItem,
           Title: {
             x: 10,
             y: 45,
             mountY: 0.5,
             text: {
               text: Language.translate("Scan"),
               textColor: COLORS.titleColor,
               fontFace: CONFIG.language.font,
               fontSize: 25,
             },
           },
           Button: {
             h: 45,
             w: 45,
             x: 1600,
             mountX: 1,
             y: 45,
             mountY: 0.5,
             src: Utils.asset("images/settings/Arrow.png"),
           },
         },
       },
       LiveTvScanOverlay:{
        type: LiveTvScanOverlay,
        visible: false
       }
     };
   }

   _init() {
     this._setState("Activate");
   }
   _firstActive(){
     this.dtvApi = new DTVApi();
   }
   _focus() {
    this._setState("Activate");
     if (active) {
       this.tag("Activate.Button").src = Utils.asset(
         "images/settings/ToggleOnOrange.png"
       );
     } else {
       this.tag("Activate.Button").src = Utils.asset(
         "images/settings/ToggleOffWhite.png"
       );
     }
   }

  hide() {
    this.tag("LiveTVSettingsScreenContents").visible = false;
  }

  show() {
    this.tag("LiveTVSettingsScreenContents").visible = true;
  }

   static _states() {
      return [
        class Activate extends this {
          $enter() {
            this.tag("Activate")._focus();
          }
          $exit() {
            this.tag("Activate")._unfocus();
          }
          _handleDown() {
            this._setState("Scan");
          }
          _handleEnter() {
            if (Storage.get("deviceType") != "IpStb") {
              if (active) {
                this.dtvApi.deactivate().then((res) => {
                  console.log(res);
                  active = false;
                  this.tag("Activate.Button").src = Utils.asset(
                    "images/settings/ToggleOffWhite.png"
                  );
                });
              } else {
                this.dtvApi.activate().then((res) => {
                  console.log(res);
                  active = true;
                  this.tag("Activate.Button").src = Utils.asset(
                    "images/settings/ToggleOnOrange.png"
                  );
                });
              }
            }
          }
        },
        class Scan extends this {
          $enter() {
            this.tag("Scan")._focus();
          }
          $exit() {
            this.tag("Scan")._unfocus();
          }
          _handleUp() {
            this._setState("Activate");
          }
          _handleEnter() {
              this._setState("LiveTvScanOverlay")
          }
        },
        class LiveTvScanOverlay extends this {
          $enter() {
              this.hide()
              this.tag('LiveTvScanOverlay').visible = true
              this.fireAncestors('$updatePageTitle', Language.translate('Settings / Live TV / Scan'))
          }
          $exit() {
              this.show()
              this.tag('LiveTvScanOverlay').visible = false
              this.fireAncestors('$updatePageTitle', Language.translate('Settings / Live TV'))
          }
          _getFocused() {
              return this.tag('LiveTvScanOverlay')
          }
          _handleBack() {
              this._setState('Scan')
          }
        },
      ];
    }
 }
