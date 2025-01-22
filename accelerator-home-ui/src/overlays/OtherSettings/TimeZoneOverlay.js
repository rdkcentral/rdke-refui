import { Language, Lightning, Utils } from "@lightningjs/sdk";
import AppApi from "../../api/AppApi";
import { CONFIG, GLOBALS } from "../../Config/Config";
import TimeOverlayItems from "../../items/TimeOverlayItems";
import TimeZoneOverlayItem from "../../items/TimeZoneOverlayItem";
import FireBoltApi from "../../api/firebolt/FireBoltApi";

export default class TimeZone extends Lightning.Component {
    /**
     * @param {object} args
     */
    set params(args) {
        if (args.refresh) {
            this._firstEnable()
        }
    }
    static _template() {
        return {
            TimeZoneOverlayScreenContents: {
                x: 200,
                y: 275,
                w: 1720,
                h: 810,
                clipping: true,
                List: {
                    y:3,
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -6,
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
            TimeOverlayItems: {
                x: 200,
                y: 275,
                w: 1720,
                h: 810,
                clipping: true,
                type: TimeOverlayItems,
                visible: false
            }
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
                    type: TimeZoneOverlayItem,
                    item: item,
                    zone: this.zone !== undefined ? this.zone.split('/')[1] : ''
                }
            })
        } else {
            this.tag('Error').alpha = 1
        }
        this.loadingAnimation.stop()
        this.tag('Loader').visible = false
        this._setState('List')
    }

    _unfocus() {
        if (this.loadingAnimation.isPlaying()) {
            this.loadingAnimation.stop()
            this.tag('Loader').visible = false
        }

    }

    hide() {
        this.tag('TimeZoneOverlayScreenContents').visible = false;
    }

    show() {
        this.tag('TimeZoneOverlayScreenContents').visible = true;
    }

    $navigateAndRefreshItems(params) {
        this.tag("TimeOverlayItems").refreshList(params);
        this._setState('TimeOverlayItems');
    }

    static _states() {
        return [
            class TimeOverlayItems extends this{
                $enter() {
                    this.hide()
                    this.tag('TimeOverlayItems').visible = true;
                }
                $exit() {
                    this.show()
                    this.tag('TimeOverlayItems').visible = false;
                    this._firstEnable();// so that the list will be refreshed when exiting from child screen.
                }
                _getFocused() {
                    return this.tag('TimeOverlayItems')
                }
                _handleEnter() {
                    this._setState('List')
                }
                _handleBack() {
                    this._setState('List');
                }
            },
            class List extends this{
                $enter() {
                    this.show()
                }
                _getFocused() {
                    return this.tag('List').element
                }
                _handleDown() {
                    this.tag('List').setNext()
                }
                _handleUp() {
                    this.tag('List').setPrevious()
                }
            }
        ];
    }
}