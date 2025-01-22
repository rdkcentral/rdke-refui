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

import { Lightning, Storage, Router, Registry } from "@lightningjs/sdk";
import AppApi from "../api/AppApi";
import RDKShellApis from "../api/RDKShellApis";
import ThunderJS from "ThunderJS";
import TvOverlaySettingsScreen from "./components/TvOverlaySettingsScreen";
import TvOverlayInputScreen from "./components/TvOverlayInputScreen";
import { CONFIG, GLOBALS } from '../Config/Config';
import { Metrics } from "@firebolt-js/sdk";

var thunder = ThunderJS(CONFIG.thunderConfig);

export default class TvOverlayScreen extends Lightning.Component {
  set params(args) {
    this._type = args.type;
    console.log("setting to idlestate");
    setTimeout(() => {
      if (this._type === "inputs") {
        this._setState("OverlayInputScreen");
      } else if (this._type === "settings") {
        this._setState("OverlaySettingsScreen");
      }
    }, 300);
  }

  static _template() {
    return {
      w: 1920,
      h: 1080,
      OverlaySettingsScreen: {
        x: -500, //set the x value to -500+ and add animation from left
        y: 0,
        type: TvOverlaySettingsScreen,
      },
      OverlayInputScreen: {
        x: 0,
        y: -630,
        type: TvOverlayInputScreen,
      },
    };
  }

  _firstEnable() {
    this.appApi = new AppApi();
    this.overlayTimeout = null;
    this.timeoutDuration = 30000;
    this._sidePanelAnimation = this.tag("OverlaySettingsScreen").animation({
      delay: 0.3,
      duration: 0.3,
      stopMethod: "reverse", //so that .stop will play the transition towards left
      actions: [{ p: "x", v: { 0: -500, 1: 0 } }],
    });
    this._topPanelAnimation = this.tag("OverlayInputScreen").animation({
      delay: 0.3,
      duration: 0.3,
      stopMethod: "reverse", //so that .stop will play the transition towards left
      actions: [{ p: "y", v: { 0: -630, 1: 0 } }],
    });
  }

  _focus() { }

  $focusOverlay() {
    this.overlayTimeout = Registry.setTimeout(() => {
      this._handleBack();
    }, this.timeoutDuration)
  }

  $unfocusOverlay() {
    this.overlayTimeout && Registry.clearTimeout(this.overlayTimeout);
  }

  $resetTimeout() {
    this.overlayTimeout && Registry.clearTimeout(this.overlayTimeout);
    this.overlayTimeout = Registry.setTimeout(() => {
      this._handleBack();
    }, this.timeoutDuration)
  }

  $closeOverlay() {
    this._handleBack();
  }

  _handleBack() {
    this._setState("IdleState");
    console.log("currentApp: ", GLOBALS.topmostApp);
    setTimeout(() => {
      if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
        RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
        RDKShellApis.moveToFront(GLOBALS.topmostApp).then(() => {
          RDKShellApis.setFocus(GLOBALS.topmostApp).catch((err) => {
            console.log("Error", err);
            Metrics.error(Metrics.ErrorType.OTHER, 'pluginError', `Thunder RDKShell setfocus error ${JSON.stringify(err)}`, false, null)
          });
        });
      } else {
        if (Router.getActiveHash() === "dtvplayer") { //don't navigate to menu if route is dtvplayer
          Router.focusPage();
        } else {
          console.log("else block navigating to menu");
          Router.navigate("menu"); //if user is currently on resident app, might not be needed as user should not be able to get on this screen while on resident app
        }
      }
    }, 500);
  }

  static _states() {
    return [
      class IdleState extends this {
        $enter() {
          console.log("entering overlay IdleState");
        }
        $exit() {
          console.log("exiting overlay IdleState");
        }
      },
      class OverlaySettingsScreen extends this {
        $enter() {
          this._topPanelAnimation.finish();
          this._sidePanelAnimation.start();
          console.log("$enter from OverlaySettingsScreen");
        }
        $exit() {
          this._sidePanelAnimation.stop();
        }
        _getFocused() {
          return this.tag("OverlaySettingsScreen");
        }
      },
      class OverlayInputScreen extends this {
        $enter() {
          this._sidePanelAnimation.finish();
          this._topPanelAnimation.start();
          console.log("$enter from OverlayInputScreen");
        }
        $exit() {
          this._topPanelAnimation.stop();
        }
        _getFocused() {
          return this.tag("OverlayInputScreen");
        }
      },
    ];
  }
}
