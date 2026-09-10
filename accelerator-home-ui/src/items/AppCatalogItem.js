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
import { installDACApp, isDACAppInstalled, isDACOperationInProgress, startDACApp } from '../api/DACApi'

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
            const errorCode = this._app.errorCode ?? -1;
            if (Object.prototype.hasOwnProperty.call(this._app, "errorCode")) delete this._app.errorCode;
            this.updateDACStatus(statusProgressTag, overlayTag)
            if (success) {
                this._showGreenTick(statusProgressTag)
            } else {
                this.tag(statusProgressTag).setProgress(1.0, 'Error: ' + msg)
                this.fireAncestors('$showInstallError', { name: this._app.name, errorCode: errorCode })
            }
            return true; // Installation operation completed
        } else if (this._app.isUnInstalling) {
            this._app.isInstalled = !success
            this._app.isUnInstalling = false
            this.updateDACStatus(statusProgressTag, overlayTag)
            if (!success) {
                this.tag(statusProgressTag).setProgress(1.0, 'Error: ' + msg)
                this.fireAncestors('$showUninstallError', { name: this._app.name, error: msg })
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

    _showGreenTick(statusProgressTag) {
        const tickMarkTag = statusProgressTag.replace('StatusProgress', 'TickMark')
        const tickOverlayTag = statusProgressTag.replace('StatusProgress', 'TickOverlay')
        const tickMark = this.tag(tickMarkTag)
        const tickOverlay = this.tag(tickOverlayTag)
        if (tickMark) {
            if (tickOverlay) tickOverlay.alpha = 0.7
            tickMark.alpha = 1
            setTimeout(() => {
                tickMark.setSmooth('alpha', 0, { duration: 0.5 })
                if (tickOverlay) tickOverlay.setSmooth('alpha', 0, { duration: 0.5 })
            }, 2000)
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
                    this.fireAncestors('$showLaunchError', { name: this._app.name });
                }
            } catch (err) {
                this.ERR("Error launching app: " + JSON.stringify(err))
                this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Launch failed');
                this.fireAncestors('$showLaunchError', { name: this._app.name, error: err.message || err });
            }
            this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 })
            return true; // Already installed
        } else if (this._app.isInstalling) {
            this.LOG(`App installation is in progress`);
            return false; // In progress
        }

        if (isDACOperationInProgress()) {
            this.tag(overlayTag + '.OverlayText').text.text = Language.translate('Another install is in progress');
            this.tag(overlayTag).alpha = 0.7;
            this.tag(overlayTag + '.OverlayText').alpha = 1;
            this.tag(overlayTag).setSmooth('alpha', 0, { duration: 3 });
            return false;
        }

        this.tag(overlayTag + '.OverlayText').text.text = Language.translate("Please wait");
        this.tag(overlayTag).alpha = 0.7;
        this.tag(overlayTag + '.OverlayText').alpha = 1;
        this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 });

        // Reset progress bar to clear any stale state from a previous install cycle
        this.tag(statusProgressTag).reset();

        this._app.isInstalling = true;
        if (!await installDACApp(this._app, this.tag(statusProgressTag))) {
            this._app.isInstalling = false;
            const errorCode = this._app.errorCode ?? -1;
            this.tag(overlayTag + '.OverlayText').text.text = Language.translate("Status") + ':' + errorCode;
            this.tag(overlayTag).alpha = 0.7
            this.tag(overlayTag + '.OverlayText').alpha = 1
            this.tag(overlayTag).setSmooth('alpha', 0, { duration: 5 })
            this.fireAncestors('$showInstallError', { name: this._app.name, errorCode: errorCode });
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
            Placeholder: {
                alpha: 0,
                zIndex: 5,
                rect: true,
                color: 0xFF1A1A1A,
                h: this.height,
                w: this.width,
                Loader: {
                    mount: 0.5,
                    x: this.width / 2,
                    y: this.height / 2,
                    w: 60,
                    h: 60,
                    src: Utils.asset('images/loading.png'),
                },
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
                alpha: 1,
                y: this.height + 10,
                text: {
                    text: '',
                    fontFace: CONFIG.language.font,
                    fontSize: 25,
                    wordWrapWidth: this.width,
                    maxLines: 1,
                    textOverflow: '...',
                },
            },
            StatusProgress: {
                type: StatusProgress, x: 50, y: 80, w: 200,
                alpha: 1,
            },
            TickOverlay: {
                alpha: 0,
                zIndex: 11,
                rect: true,
                color: 0xFF000000,
                x: 0,
                y: 0,
                w: this.width,
                h: this.height,
            },
            TickMark: {
                alpha: 0,
                zIndex: 12,
                mount: 0.5,
                x: this.width / 2,
                y: this.height / 2,
                w: 100,
                h: 100,
                src: Utils.asset('/images/tick.png'),
            },
        }
    }

    set info(data) {
        this.data = data
        if (!Object.prototype.hasOwnProperty.call(data, 'icon'))
            data.icon = "/images/apps/DACApp_455_255.png";
        const imgSrc = data.icon.startsWith('/images') ? Utils.asset(data.icon) : data.icon;
        const imageTag = this.tag('Image')
        // Only re-assign the src when it actually changes to avoid redundant
        // texture re-decodes. Do NOT call texture.source.free() here: Lightning
        // shares texture sources by src URL, so freeing would blank the same
        // icon wherever else it is displayed (e.g. the MainView rows).
        if (this._currentIconSrc !== imgSrc) {
            // Hide the stale icon and show a loader while the new texture
            // decodes/uploads. The loader is hidden again on txLoaded/txError.
            this._showIconLoader()
            imageTag.patch({
                src: imgSrc,
            });
            this._currentIconSrc = imgSrc
            // If the texture is already loaded (cached/shared source), txLoaded
            // will not fire, so hide the loader right away.
            if (imageTag.texture && imageTag.texture.source && imageTag.texture.source.loaded) {
                this._hideIconLoader()
            }
        }
        this.tag('Text').text.text = data.name
    }

    _detach() {
        // Tear down any active loader so its timeout/animation can't fire after
        // detach or leak into a pooled/reused instance.
        this._hideIconLoader()
        // Drop only this element's reference to its texture. Do not free the
        // shared texture source, since the same icon may be in use by other
        // views (MainView rows). Lightning's texture manager will reclaim the
        // GPU memory for sources that are no longer referenced by any element.
        try {
            const img = this.tag('Image')
            if (img) {
                img.texture = null
                img.src = undefined
                this._currentIconSrc = null
            }
        } catch (e) {
            // ignore
        }
    }

    _inactive() {
        // Pause the spinner animation while off-stage; _active() will resume it
        // if the loader is still pending when the element re-attaches.
        if (this._loaderAnimation) {
            this._loaderAnimation.stop()
        }
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
        this._currentIconSrc = null
        this._loaderVisible = false
        const imageTag = this.tag('Image')
        imageTag.on('txLoaded', () => this._hideIconLoader())
        imageTag.on('txError', () => this._hideIconLoader())
    }

    _active() {
        // Animations can only run once the element is attached to the stage.
        if (this._loaderVisible) {
            this._startLoaderSpin()
        }
    }

    _startLoaderSpin() {
        if (!this.attached) {
            return
        }
        if (!this._loaderAnimation) {
            this._loaderAnimation = this.tag('Placeholder.Loader').animation({
                duration: 1,
                repeat: -1,
                actions: [{ property: 'rotation', v: { 0: 0, 1: Math.PI * 2 } }],
            })
        }
        this._loaderAnimation.start()
    }

    _showIconLoader() {
        this._loaderVisible = true
        this.tag('Image').alpha = 0
        this.tag('Placeholder').alpha = 1
        this._startLoaderSpin()
        // Safety fallback: never leave the loader spinning forever if the
        // txLoaded/txError event is missed (e.g. set before attach).
        if (this._loaderTimeout) {
            clearTimeout(this._loaderTimeout)
        }
        this._loaderTimeout = setTimeout(() => this._hideIconLoader(), 5000)
    }

    _hideIconLoader() {
        this._loaderVisible = false
        this.tag('Image').alpha = 1
        this.tag('Placeholder').alpha = 0
        if (this._loaderAnimation) {
            this._loaderAnimation.stop()
        }
        if (this._loaderTimeout) {
            clearTimeout(this._loaderTimeout)
            this._loaderTimeout = null
        }
    }

    _focus() {
        this.scale = 1.15
        this.zIndex = 2
        this.tag("Shadow").alpha = 1
    }
    _unfocus() {
        this.scale = 1
        this.zIndex = 1
        this.tag("Shadow").alpha = 0
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
