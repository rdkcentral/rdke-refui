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

import { Lightning, Registry, Router, Utils } from "@lightningjs/sdk";
import ThunderJS from "ThunderJS";
import { CONFIG, GLOBALS } from '../Config/Config'

//applauncher screen "will" be responsible for handling all overlays as widget and splash screens for apps(if required) | currently only handles settings overlay widget
export default class AppLauncherScreen extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  static _template() {
    return {
      Overlay: {
        w: 1920,
        h: 1080,
      },
      SplashImage: {
        w: 1920,
        h: 1080,
        x: 960,
        y: 540,
        mount: 0.5,
        src: "",
        visible: false
      },
    };
  }

  _firstEnable() {
    this.LOG("AppLauncherScreen is enabled for firstTime");
    this.splashImages = {
      "Netflix": 'images/apps/App_Netflix_Splash.png'
    };
    this._thunder = ThunderJS(CONFIG.thunderConfig);
  }

  _focus() {
    this.LOG("AppLauncherScreen is focused");
  }

  _handleKey() {
    this.LOG("AppLauncherScreen is in focus, returning focus to corresponding app")
    if (GLOBALS.topmostApp === GLOBALS.selfClientName) { //if appLauncher screen is in focus while on residentApp
        // FIXME: use new AppManager APIs.
        this.WARN("App : Are we missing any logic here when using AppManager APIs?");
        Router.navigate(GLOBALS.LastvisitedRoute);
    } else {
        // FIXME: use new AppManager APIs.
        this.WARN("App : Are we missing any logic here when using AppManager APIs?");
    }
  }
}
