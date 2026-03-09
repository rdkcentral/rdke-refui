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

import { Lightning, Utils, Language, Storage } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import StatusProgress from '../overlays/StatusProgress'
import { installDACApp, isDACAppInstalled, startDACApp } from '../api/DACApi'

/**
 * Mixin providing common DAC app functionality (install, status updates, etc.)
 * Can be used by both AppCatalogItem and DacAppItem to avoid code duplication.
 */
export const DACAppMixin = (Base) => class extends Base {
    initDACApp() {
        this._app = {}
        this._app.isRunning = false
        this._app.isInstalled = false
        this._app.isInstalling = false
        this._app.isUnInstalling = false
    }

    initLogging() {
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    async fireDACOperationFinished(success, msg, statusProgressTag, overlayTag) {
        if (this._app.isInstalling) {
            this._app.isInstalled = success
            this._app.isInstalling = false
            if (Object.prototype.hasOwnProperty.call(this._app, "errorCode")) delete this._app.errorCode;
            this.updateDACStatus(statusProgressTag, overlayTag)
            if (!success) {
                this.tag(statusProgressTag).setProgress(1.0, 'Error: ' + msg)
            }
            return true; // Installation operation completed
        } else if (this._app.isUnInstalling) {
            this._app.isInstalled = !success
            this._app.isUnInstalling = false
            this.updateDACStatus(statusProgressTag, overlayTag)
            if (!success) {
                this.tag(statusProgressTag).setProgress(1.0, 'Error: ' + msg)
            }
            return true; // Uninstall operation completed
        }
        return false;
    }

    updateDACStatus(statusProgressTag, overlayTag) {
        if (this._app.isRunning) {
            this.tag(statusProgressTag).setProgress(1.0, Language.translate('Running') + "!");
        } else {
            if (this._app.isInstalled) {
                this.LOG("App is installed")
                this.tag(statusProgressTag).setProgress(1.0, Language.translate('Installed') + '!')
            } else {
                this.tag(statusProgressTag).reset()
            }
        }
        if (Object.prototype.hasOwnProperty.call(this._app, "errorCode")) {
            this.tag(statusProgressTag).alpha = 0
            this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Error') + ':' + this._app.errorCode;
            this.tag(overlayTag).alpha = 0.7
            this.tag(overlayTag + '.OverlayText').alpha = 1
        }
    }

    async performDACInstall(statusProgressTag, overlayTag) {
        if (this._app.isInstalled) {
            this.LOG("App is already installed, launching: " + this._app.name)
            this.tag(overlayTag).alpha = 0.7
            this.tag(overlayTag + '.OverlayText').alpha = 1
            this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Launching') + "...";
            try {
                const launched = await startDACApp({ id: this._app.id })
                if (launched) {
                    this.LOG("App launched successfully: " + this._app.name)
                    this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Running') + "!";
                } else {
                    this.ERR("Failed to launch app: " + this._app.name)
                    this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Launch failed');
                }
            } catch (err) {
                this.ERR("Error launching app: " + JSON.stringify(err))
                this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Launch failed');
            }
            this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 })
            return true; // Already installed
        } else if (this._app.isInstalling) {
            this.LOG(`App installation is in progress`);
            return false; // In progress
        }

        this.tag(overlayTag + '.OverlayText').text.text = Language.translate("Please wait");
        this.tag(overlayTag).alpha = 0.7;
        this.tag(overlayTag + '.OverlayText').alpha = 1;
        this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 });

        this._app.isInstalling = true;
        if (!await installDACApp(this._app, this.tag(statusProgressTag))) {
            this._app.isInstalling = false;
            this.tag(overlayTag + '.OverlayText').text.text = Language.translate("Status") + ':' + (this._app.errorCode ?? -1);
            this.tag(overlayTag).alpha = 0.7
            this.tag(overlayTag + '.OverlayText').alpha = 1
            this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 })
            return false;
        }
        return true;
    }
};

export default class AppCatalogItem extends DACAppMixin(Lightning.Component) {
    constructor(...args) {
        super(...args);
        this.initLogging();
    }
    static _template() {
        return {
            Shadow: {
                y: -10,
                alpha: 0,
                rect: true,
                color: CONFIG.theme.hex,
                h: this.height + 20,
                w: this.width,
            },
            Image: {
                h: this.height,
                w: this.width
            },
            Overlay: {
                alpha: 0,
                rect: true,
                color: 0xFF000000,
                h: this.height,
                w: this.width,
                OverlayText: {
                    alpha: 0,
                    mount: 0.5,
                    x: this.width / 2,
                    y: this.height / 2,
                    text: {
                        text: Language.translate('Already installed') + "!",
                        fontFace: CONFIG.language.font,
                        fontSize: 20,
                    },
                },
            },
            Text: {
                alpha: 0,
                y: this.height + 10,
                text: {
                    text: '',
                    fontFace: CONFIG.language.font,
                    fontSize: 25,
                },
            },
            StatusProgress: {
                type: StatusProgress, x: 50, y: 80, w: 200,
                alpha: 1,
            },
        }
    }

    set info(data) {
        this.data = data
        if (!Object.prototype.hasOwnProperty.call(data, 'icon'))
            data.icon = "/images/apps/DACApp_455_255.png";
        if (data.icon.startsWith('/images')) {
            this.tag('Image').patch({
                src: Utils.asset(data.icon),
            });
        } else {
            this.tag('Image').patch({
                src: data.icon,
            });
        }
        this.tag('Text').text.text = data.name
    }

    static get width() {
        return 300
    }

    static get height() {
        return 168
    }

    async $fireDACOperationFinished(success, msg) {
        this.fireDACOperationFinished(success, msg, 'StatusProgress', 'Overlay');
    }

    updateStatus() {
        this.updateDACStatus('StatusProgress', 'Overlay');
    }
    async myfireINSTALL() {
        await this.performDACInstall('StatusProgress', 'Overlay');
    }

    _init() {
        this.initDACApp();
        this._buttonIndex = 0;
    }

    _focus() {
        this.scale = 1.15
        this.zIndex = 2
        this.tag("Shadow").alpha = 1
        this.tag("Text").alpha = 1
    }
    _unfocus() {
        this.scale = 1
        this.zIndex = 1
        this.tag("Shadow").alpha = 0
        this.tag("Text").alpha = 0
    }
    async _handleEnter() {
        this._app.id = this.data.id
        this._app.name = this.data.name
        this._app.version = this.data.version
        this._app.type = this.data.type
        this._app.description = this.data.description;
        this._app.size = this.data.size;
        this._app.category = this.data.category;
        this._app.isInstalled = await isDACAppInstalled(this._app);
        this.myfireINSTALL();
    }
}
