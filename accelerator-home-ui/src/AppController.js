/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
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

import AppManager from './api/AppManagerApi.js';
import RDKWindowManager from './api/RDKWindowManagerApi.js';
import { ThunderError } from './api/ThunderError.js';
import { GLOBALS } from './Config/Config.js';
import Keymap from './Config/Keymap.js';
import { keyIntercept } from './keyIntercept/keyIntercept.js';

const INVALID_APP_ID = "";

let instance = null;

export default class AppController {
  static get() {
    if (instance === null) {
      instance = new AppController();
    }
    return instance;
  }

  constructor() {
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;

    this.launchedAppId = INVALID_APP_ID;
    this.onPackageChanged = null; // callback for package install/uninstall events
  }

  async init() {
    const mainAppId = GLOBALS.selfclientAppName;
    let mainClientId;

    try {
      const appManagerApps = await AppManager.get().getLoadedApps();
      mainClientId = appManagerApps.find(app => app.appId === mainAppId)?.appInstanceId;
    } catch (err) {
      this.WARN(new ThunderError("AppManager.getLoadedApps()", err).toString());
    }

    if (!mainClientId) {
      // find client id if the app was started using "bolt run"
      try {
        const windowManagerApps = await RDKWindowManager.get().getApps();
        mainClientId = windowManagerApps.find(app => app.startsWith(mainAppId + "+"));
      } catch (err) {
        this.WARN(new ThunderError("RDKWindowManager.getApps()", err).toString());
      }
    }

    if (mainClientId) {
      GLOBALS.selfClientId = this.focusedClientId = this.mainClientId = mainClientId;
      GLOBALS.topmostApp = mainAppId;
      this.LOG('selfClientName:', GLOBALS.selfClientName);
      this.LOG('selfClientId:', GLOBALS.selfClientId);

      try {
        await keyIntercept(this.mainClientId);
      } catch (err) {
        this.WARN(new ThunderError("RDKWindowManager.addKeyIntercepts()", err).toString());
      }
    } else {
      this.WARN('Main app not found:', mainAppId);
    }
  }

  async setVisibleAndFocused(clientId) {
    try {
      await Promise.all([
        RDKWindowManager.get().setVisible(clientId, true),
        RDKWindowManager.get().setFocus(clientId)
      ]);
    } catch (err) {
      throw new ThunderError(`setVisibleAndFocused(${clientId})`, err);
    }
  }

  async setInvisible(clientId) {
    try {
      await RDKWindowManager.get().setVisible(clientId, false);
    } catch (err) {
      throw new ThunderError(`setInvisible(${clientId})`, err);
    }
  }

  async subscribe(thunder) {
    thunder.on('org.rdk.AppManager', 'onAppInstalled', data => {
      this.LOG('onAppInstallStatus ' + JSON.stringify(data));
      if (typeof this.onPackageChanged === 'function') {
        this.onPackageChanged('installed', data);
      }
    });

    thunder.on('org.rdk.AppManager', 'onAppUninstalled', data => {
      this.LOG('onAppUninstallStatus ' + JSON.stringify(data));
      if (typeof this.onPackageChanged === 'function') {
        this.onPackageChanged('uninstalled', data);
      }
    });

    thunder.on('org.rdk.AppManager', 'onAppLifecycleStateChanged', async data => {
      this.LOG('onAppLifecycleStateChanged ' + JSON.stringify(data));
      try {
        if (data.appId === this.launchedAppId && data.newState === "APP_STATE_ACTIVE") {
          GLOBALS.topmostApp = data.appId;
          this.focusedClientId = data.appInstanceId;
          await this.setVisibleAndFocused(data.appInstanceId);
          await this.addKeyIntercepts(data.appId, data.appInstanceId);
          await this.setInvisible(this.mainClientId);
        } else if (data.appInstanceId === this.focusedClientId && data.oldState === "APP_STATE_ACTIVE") {
          this.launchedAppId = INVALID_APP_ID;
          GLOBALS.topmostApp = GLOBALS.selfclientAppName;
          this.focusedClientId = this.mainClientId;
          await this.setVisibleAndFocused(this.mainClientId);
        }
      } catch (err) {
        this.ERR(`onAppLifecycleStateChanged: ${err}`);
      }
    });

    thunder.on('org.rdk.AppManager', 'onAppLaunchRequest', data => {
      this.LOG('onAppLaunchRequested ' + JSON.stringify(data));
    });

    thunder.on('org.rdk.AppManager', 'onAppUnloaded', async data => {
      this.LOG('onAppUnloaded ' + JSON.stringify(data));
    });
  }

  async addKeyIntercepts(appId, clientId) {
    if (appId === "com.rdkcentral.youtube") {
      try {
        await RDKWindowManager.get().addKeyIntercepts({
          "intercepts": {
            "intercepts": [{
              "keys": [{
                "keyCode": Keymap.AudioVolumeMute,
                "modifiers": []
              }, {
                "keyCode": Keymap.AudioVolumeDown,
                "modifiers": []
              }, {
                "keyCode": Keymap.AudioVolumeUp,
                "modifiers": []
              }, {
                "keyCode": Keymap.Youtube,
                "modifiers": []
              }],
              "client": clientId
            }]
          }
        });
      } catch (err) {
        throw new ThunderError("RDKWindowManager.addKeyIntercepts()", err);
      }
    }
  }

  async launch(id) {
    this.launchedAppId = id;
    await AppManager.get().launchApp(id);
  }
}
