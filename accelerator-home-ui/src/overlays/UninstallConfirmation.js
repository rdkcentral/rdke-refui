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
import { CONFIG } from "../Config/Config";

/**
 * Class for Uninstall Confirmation Overlay Component.
 */
export default class UninstallConfirmation extends Lightning.Component {
  static _template() {
    return {
      rect: true,
      w: 1920,
      h: 1080,
      color: 0xCC000000, // Semi-transparent black background
      zIndex: 10,
      UninstallDialog: {
        x: 960,
        y: 540,
        mount: 0.5,
        rect: true,
        w: 620,
        h: 320,
        color: 0xFF1A1A1A,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 16,
        },
        DialogBorder: {
          x: -2,
          y: -2,
          w: 624,
          h: 324,
          rect: true,
          color: 0x00000000,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 18,
            stroke: 2,
            strokeColor: 0xFF3D3D3D,
          },
        },
        Title: {
          x: 310,
          y: 40,
          mountX: 0.5,
          text: {
            text: Language.translate("Uninstall"),
            fontFace: CONFIG.language.font,
            fontSize: 36,
            textColor: CONFIG.theme.hex,
            fontStyle: "bold",
          },
        },
        BorderTop: {
          x: 30,
          y: 90,
          w: 560,
          h: 2,
          rect: true,
          color: 0xFF3D3D3D,
        },
        Info: {
          x: 310,
          y: 130,
          mountX: 0.5,
          text: {
            text: Language.translate("Are you sure you want to uninstall this app?"),
            fontFace: CONFIG.language.font,
            fontSize: 24,
            textColor: 0xFFCCCCCC,
            textAlign: "center",
            wordWrapWidth: 520,
          },
        },
        AppName: {
          x: 310,
          y: 170,
          mountX: 0.5,
          text: {
            text: "",
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xFFAAAAAA,
            textAlign: "center",
            wordWrapWidth: 520,
          },
        },
        Buttons: {
          x: 310,
          y: 230,
          mountX: 0.5,
          w: 440,
          h: 50,
          Confirm: {
            x: 0,
            w: 200,
            h: 50,
            rect: true,
            color: 0xFFFFFFFF,
            shader: {
              type: Lightning.shaders.RoundedRectangle,
              radius: 8,
            },
            Title: {
              x: 100,
              y: 25,
              mount: 0.5,
              text: {
                text: Language.translate("Confirm"),
                fontFace: CONFIG.language.font,
                fontSize: 22,
                textColor: 0xFF000000,
              },
            },
          },
          Cancel: {
            x: 220,
            w: 200,
            h: 50,
            rect: true,
            color: 0xFF7D7D7D,
            shader: {
              type: Lightning.shaders.RoundedRectangle,
              radius: 8,
            },
            Title: {
              x: 100,
              y: 25,
              mount: 0.5,
              text: {
                text: Language.translate("Cancel"),
                fontFace: CONFIG.language.font,
                fontSize: 22,
                textColor: 0xFF000000,
              },
            },
          },
        },
        Loader: {
          x: 310,
          y: 160,
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

  /**
   * Set the app info for the uninstall confirmation
   * @param {Object} appInfo - App data (id, name, version, etc.)
   */
  set appInfo(data) {
    this._appInfo = data;
    const appName = data.name || data.appName || "Unknown App";
    this.tag("UninstallDialog.AppName").text.text = `"${appName}"`;
  }

  get appInfo() {
    return this._appInfo;
  }

  _focus() {
    this._setState("Confirm");

    this.loadingAnimation = this.tag("UninstallDialog.Loader").animation({
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
          this.fireAncestors("$confirmUninstall", this._appInfo);
        }
        _handleRight() {
          this._setState("Cancel");
        }
        _handleBack() {
          this.fireAncestors("$cancelUninstall");
        }
        _focus() {
          this.tag("Buttons.Confirm").patch({
            color: CONFIG.theme.hex,
          });
          this.tag("Buttons.Confirm.Title").patch({
            text: { textColor: 0xFFFFFFFF },
          });
        }
        _unfocus() {
          this.tag("Buttons.Confirm").patch({
            color: 0xFFFFFFFF,
          });
          this.tag("Buttons.Confirm.Title").patch({
            text: { textColor: 0xFF000000 },
          });
        }
        $exit() {
          this._unfocus();
        }
      },
      class Cancel extends this {
        $enter() {
          this._focus();
        }
        _handleEnter() {
          this.fireAncestors("$cancelUninstall");
        }
        _handleLeft() {
          this._setState("Confirm");
        }
        _handleBack() {
          this.fireAncestors("$cancelUninstall");
        }
        _focus() {
          this.tag("Buttons.Cancel").patch({
            color: CONFIG.theme.hex,
          });
          this.tag("Buttons.Cancel.Title").patch({
            text: { textColor: 0xFFFFFFFF },
          });
        }
        _unfocus() {
          this.tag("Buttons.Cancel").patch({
            color: 0xFF7D7D7D,
          });
          this.tag("Buttons.Cancel.Title").patch({
            text: { textColor: 0xFF000000 },
          });
        }
        $exit() {
          this._unfocus();
        }
      },
      class Uninstalling extends this {
        $enter() {
          this.loadingAnimation.start();
          this.tag("UninstallDialog.Loader").visible = true;
          this.tag("UninstallDialog.Title").text.text = Language.translate("Uninstalling") + "...";
          this.tag("UninstallDialog.Buttons").visible = false;
          this.tag("UninstallDialog.Info").visible = false;
          this.tag("UninstallDialog.AppName").visible = false;
        }
        $exit() {
          this.loadingAnimation.stop();
          this.tag("UninstallDialog.Loader").visible = false;
          this.tag("UninstallDialog.Title").text.text = Language.translate("Uninstall");
          this.tag("UninstallDialog.Buttons").visible = true;
          this.tag("UninstallDialog.Info").visible = true;
          this.tag("UninstallDialog.AppName").visible = true;
        }
        _handleEnter() { /* do nothing */ }
        _handleLeft() { /* do nothing */ }
        _handleRight() { /* do nothing */ }
        _handleBack() { /* do nothing */ }
        _handleUp() { /* do nothing */ }
        _handleDown() { /* do nothing */ }
      },
    ];
  }

  /**
   * Show the uninstalling state with loader
   */
  showUninstalling() {
    this._setState("Uninstalling");
  }
}
