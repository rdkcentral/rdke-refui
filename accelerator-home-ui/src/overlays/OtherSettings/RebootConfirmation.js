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
import AppApi from "../../api/AppApi";
import { CONFIG } from "../../Config/Config";

const appApi = new AppApi();
/**
 * Class for Reboot Confirmation Component.
 */
export default class RebootConfirmation extends Lightning.Component {
  static _template() {
    return {
      RebootScreen: {
        x: 950,
        y: 270,
        Title: {
          x: 0,
          y: 0,
          mountX: 0.5,
          text: {
            text: Language.translate("Reboot"),
            fontFace: CONFIG.language.font,
            fontSize: 40,
            textColor: CONFIG.theme.hex,
          },
        },
        BorderTop: {
          x: 0,
          y: 75,
          w: 1558,
          h: 3,
          rect: true,
          mountX: 0.5,
        },
        Info: {
          x: 0,
          y: 125,
          mountX: 0.5,
          text: {
            text: Language.translate("Click Confirm to reboot!"),
            fontFace: CONFIG.language.font,
            fontSize: 25,
          },
        },
        Buttons: {
          x: 100,
          y: 200,
          w: 440,
          mountX: 0.5,
          h: 50,
          Confirm: {
            x: 0,
            w: 200,
            mountX: 0.5,
            h: 50,
            rect: true,
            color: 0xffffffff,
            Title: {
              x: 100,
              y: 25,
              mount: 0.5,
              text: {
                text: Language.translate("Confirm"),
                fontFace: CONFIG.language.font,
                fontSize: 22,
                textColor: 0xff000000,
              },
            },
          },
          Cancel: {
            x: 220,
            w: 200,
            mountX: 0.5,
            h: 50,
            rect: true,
            color: 0xff7d7d7d,
            Title: {
              x: 100,
              y: 25,
              mount: 0.5,
              text: {
                text: Language.translate("Cancel"),
                fontFace: CONFIG.language.font,
                fontSize: 22,
                textColor: 0xff000000,
              },
            },
          },
        },
        BorderBottom: {
          x: 0,
          y: 300,
          w: 1558,
          h: 3,
          rect: true,
          mountX: 0.5,
        },
        Loader: {
          x: 0,
          y: 150,
          mountX: 0.5,
          w: 90,
          h: 90,
          zIndex: 2,
          src: Utils.asset("images/settings/Loading.png"),
          visible: false,
        },
      },
    };
  }

  _focus() {
    this._setState("Confirm");

    this.loadingAnimation = this.tag("Loader").animation({
      duration: 3,
      repeat: -1,
      stopMethod: "immediate",
      stopDelay: 0.2,
      actions: [{ p: "rotation", v: { sm: 0, 0: 0, 1: 2 * Math.PI } }],
    });
  }

  static _states() {
    return [
      class Confirm extends this {
        $enter() {
          this._focus();
        }
        _handleEnter() {
          appApi.reboot("User Trigger").then((result) => {
            console.log("device rebooting" + JSON.stringify(result));
            this._setState("Rebooting");
          });
        }
        _handleRight() {
          this._setState("Cancel");
        }
        _focus() {
          this.tag("Confirm").patch({
            color: CONFIG.theme.hex,
          });
          this.tag("Confirm.Title").patch({
            text: {
              textColor: 0xffffffff,
            },
          });
        }
        _unfocus() {
          this.tag("Confirm").patch({
            color: 0xffffffff,
          });
          this.tag("Confirm.Title").patch({
            text: {
              textColor: 0xff000000,
            },
          });
        }
        $exit() {
          this._unfocus();
        }
      },
      class Cancel extends this {
        //handleEnter is not required, default behaviour from parent is to exit this screen
        $enter() {
          this._focus();
        }
        _handleLeft() {
          this._setState("Confirm");
        }
        _focus() {
          this.tag("Cancel").patch({
            color: CONFIG.theme.hex,
          });
          this.tag("Cancel.Title").patch({
            text: {
              textColor: 0xffffffff,
            },
          });
        }
        _unfocus() {
          this.tag("Cancel").patch({
            color: 0xff7d7d7d,
          });
          this.tag("Cancel.Title").patch({
            text: {
              textColor: 0xff000000,
            },
          });
        }
        $exit() {
          this._unfocus();
        }
      },
      class Rebooting extends this {
        $enter() {
          this.loadingAnimation.start();
          this.tag("Loader").visible = true;
          this.tag("Title").text.text = Language.translate("Rebooting")+"...";
          this.tag("Buttons").visible = false;
          this.tag("Info").visible = false;
        }
        _handleEnter() {
          // do nothing
        }
        _handleLeft() {
          // do nothing
        }
        _handleRight() {
          // do nothing
        }
        _handleBack() {
          // do nothing
        }
        _handleUp() {
          // do nothing
        }
        _handleDown() {
          // do nothing
        }
      },
    ];
  }
}
