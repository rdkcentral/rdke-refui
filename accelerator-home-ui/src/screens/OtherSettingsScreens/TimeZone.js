import { Lightning, Language, Router, Utils } from "@lightningjs/sdk";
import AppApi from "../../api/AppApi";
import AlexaApi from "../../api/AlexaApi";
import { CONFIG, GLOBALS } from "../../Config/Config";
import TimeZoneItem from "../../items/TimeZoneItem";
import FireBoltApi from "../../api/firebolt/FireBoltApi";

export default class TimeZone extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device  Time'));
    }

    /**
     * @param {object} args
     */
    set params(args) {
        if (args.refresh) {
            this._firstEnable()
        }
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            h: 1080,
            w: 1920,
            color: CONFIG.theme.background,
            TimeZone: {
                x: 200,
                y: 275,
                List: {
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -1,
                },
                Error: {
                    alpha: 0,
                    x: 560,
                    y: 340,
                    mountX: 0.5,
                    MSG: {
                        text: {
                            text: Language.translate('Not supported'),
                            fontFace: CONFIG.language.font,
                            fontSize: 40,
                            textColor: 0xffffffff
                        },
                    },
                },
                Loader: {
                    x: 740,
                    y: 340,
                    w: 90,
                    h: 90,
                    mount: 0.5,
                    zIndex: 4,
                    src: Utils.asset("images/settings/Loading.png")
                },
            },
        }
    }

    async _firstEnable() {
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        })
        this.loadingAnimation.start()
        this.tag('Loader').visible = true
        this.appApi = new AppApi()
        this.resp = await this.appApi.fetchTimeZone()
        let data = []
        if ("ResidentApp" === GLOBALS.selfClientName) {
            this.zone = await this.appApi.getZone()
        }else {
            this.zone = await FireBoltApi.get().localization.getTimeZone()
        }
        try {
            console.log(this.resp, this.zone)
            delete this.resp.Etc
            for (const i in this.resp) {
                if (typeof this.resp[i] === 'object') {
                    data.push([i, this.resp[i], this.zone !== undefined ? this.zone.split('/')[0] === i : false])
                }
            }
            if (AlexaApi.get().checkAlexaAuthStatus() === "AlexaHandleError" && this.zone.length) {
                AlexaApi.get().updateDeviceTimeZoneInAlexa(this.zone)
            }
        } catch (error) {
            console.log('no api present', error)
        }

        console.log(data)
        if (data.length > 1) {
            this.tag('List').h = data.length * 90
            this.tag('List').items = data.map((item, idx) => {
                return {
                    ref: 'Time' + idx,
                    w: 1620,
                    h: 90,
                    type: TimeZoneItem,
                    item: item,
                    zone: this.zone !== undefined ? this.zone.split('/')[1] : ''
                }
            })
        } else {
            this.tag('Error').alpha = 1
        }
        this.loadingAnimation.stop()
        this.tag('Loader').visible = false
    }

    _getFocused() {
        return this.tag('List').element
    }

    _unfocus() {
        if (this.loadingAnimation.isPlaying()) {
            this.loadingAnimation.stop()
            this.tag('Loader').visible = false
        }
    }

    _handleDown() {
        this.tag('List').setNext()
    }

    _handleUp() {
        this.tag('List').setPrevious()
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings/advanced/device')
        }
    }

    static _states() {
        return [];
    }
}