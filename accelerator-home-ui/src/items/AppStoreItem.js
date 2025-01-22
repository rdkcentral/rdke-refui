import { Lightning, Utils, Language, Storage } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import { ProgressBar } from '@lightningjs/ui-components'
import { startDACApp, fetchAppIcon, fetchLocalAppIcon } from '../api/DACApi'

export default class AppStoreItem extends Lightning.Component {
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
                color: 0xAA000000,
                h: this.height,
                w: this.width,
                OverlayText: {
                    alpha: 0,
                    mount: 0.5,
                    x: this.width / 2,
                    y: this.height / 2,
                    text: {
                        text: Language.translate('Installing'),
                        fontFace: CONFIG.language.font,
                        fontSize: 20,
                    },
                    ProgressBar: {
                        y: 30,
                        x: -50,
                        type: ProgressBar,
                        w: 200,
                        progress: 1,
                        barColor: 4284637804,
                        progressColor: 4127195135,
                        animationDuration: 5
                    }
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
    async _handleEnter() {
        this._app.url = this.data.installed[0].url
        this._app.id = this.data.id
        this._app.name = this.data.installed[0].appName
        this._app.version = this.data.installed[0].version
        this._app.type = this.data.type
        this._app.isRunning = await startDACApp(this._app);
    }
}
