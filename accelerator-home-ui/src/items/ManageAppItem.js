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
import StatusProgress from '../overlays/StatusProgress'
import { uninstallDACApp, fetchAppIcon, fetchLocalAppIcon } from '../api/DACApi'

export default class ManageAppItem extends Lightning.Component {
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
                        text: Language.translate("Uninstalling App") + "..",
                        fontFace: CONFIG.language.font,
                        fontSize: 30,
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
        this.tag('Text').text.text = data.installed[0].appName
    }

    static get width() {
        return 300
    }

    static get height() {
        return 168
    }

    async $fireDACOperationFinished(success, msg) {
        if (this._app.isUnInstalling) {
            this._app.isInstalled = !success
            this._app.isUnInstalling = false
            await this.displayLabel().then(() => {
                setTimeout(() => {
                    this.fireAncestors('$refreshManagedApps')
                }, 500)
            });
            if (!success) {
                this.tag('StatusProgress').setProgress(1.0, 'Error: ' + msg)
            }
        }
    }

    displayLabel() {
        return new Promise((resolve) => {
            this.tag("OverlayText").text.text = Language.translate("App Uninstalled")
            this.tag("Overlay").alpha = 0.7
            this.tag("OverlayText").alpha = 1
            this.tag("Overlay").setSmooth('alpha', 0, { duration: 5 })
            resolve();
        });
    }

    async myfireUNINSTALL() {
        this._app.isUnInstalling = await uninstallDACApp(this._app, this.tag('StatusProgress'))
        if (!this._app.isUnInstalling && ("errorCode" in this._app)) {
            this.tag("OverlayText").text.text = Language.translate("Status") + ':' + this._app.errorCode;
            this.tag("Overlay").alpha = 0.7
            this.tag("OverlayText").alpha = 1
            this.tag("Overlay").setSmooth('alpha', 0, { duration: 5 })
        }
    }

    async _init() {
        this._app = {}
        this._app.isRunning = false
        this._app.isInstalled = false
        this._app.isInstalling = false
        this._app.isUnInstalling = false
        this._buttonIndex = 0;
        if (Storage.get("CloudAppStore")) {
            let icon = await fetchAppIcon(this.data.id, this.data.installed[0].version)
            this.tag('Image').patch({
                src: icon,
            });
        }
        else {
            let icon = await fetchLocalAppIcon(this.data.id)
            if (icon !== undefined) {
                this.tag('Image').patch({
                    src: Utils.asset(icon),
                });
            }
        }
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
    _handleEnter() {
        this._app.url = this.data.installed[0].url
        this._app.id = this.data.id
        this._app.name = this.data.installed[0].appName
        this._app.version = this.data.installed[0].version
        this._app.type = this.data.type
        this.myfireUNINSTALL()
    }
}
