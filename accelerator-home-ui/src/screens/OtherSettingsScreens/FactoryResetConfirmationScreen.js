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
import { Lightning, Utils, Router, Language } from '@lightningjs/sdk'
import AppApi from '../../api/AppApi'
import { CONFIG,GLOBALS } from '../../Config/Config'
import AlexaApi from '../../api/AlexaApi.js';
import RCApi from '../../api/RemoteControl'
import Warehouse from '../../api/WarehouseApis.js'

const appApi = new AppApi()

/**
 * Class for Reboot Confirmation Screen.
 */
export default class RebootConfirmationScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            w: 1920,
            h: 2000,
            rect: true,
            color: 0xCC000000,
            RebootScreen: {
                x: 950,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Factory Reset"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Click Confirm to FactoryReset!"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                Buttons: {
                    x: 100, y: 200, w: 440, mountX: 0.5, h: 50,
                    Confirm: {
                        x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Confirm"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                    Cancel: {
                        x: 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFF7D7D7D,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Cancel"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Loader: {
                    x: 0,
                    y: 150,
                    mountX: 0.5,
                    w: 90,
                    h: 90,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: false
                },
            }
        }
    }

    _focus() {
        this._setState('Confirm')
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        });
    }


    _firstEnable() {
        appApi.checkStatus(Warehouse.get().callsign).then(resp => {
            if (resp && resp[0] && resp[0].state) {
                this.LOG("FactoryReset: warehouse plugin state: " + JSON.stringify(resp[0].state));
                if (resp[0].state !== 'activated') {
                    Warehouse.get().activate().catch(err => {
                        this.ERR("FactoryReset: warehouse plugin activation failed; feature may not work." + JSON.stringify(err));
                    });
                }
            } else {
                this.WARN("FactoryReset: unexpected checkStatus response: " + JSON.stringify(resp));
            }
        }).catch(err => {
            this.ERR("FactoryReset: checkStatus failed: " + JSON.stringify(err));
        });
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/advanced/device')
        }
    }

    async _performFactoryReset() {
        // Deactivate SmartScreen instance to prevent overlay when Auth is revoked.
        AlexaApi.get().disableSmartScreen();
        if(GLOBALS.AlexaAvsstatus){AlexaApi.get().resetAVSCredentials();}
        AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending");
        await RCApi.get().activate().then(()=> RCApi.get().factoryReset()).catch(err => this.ERR("error while resetting remote control" + JSON.stringify(err)));
        let rsactivitytime = await appApi.resetInactivityTime().catch(err => { this.ERR("resetInactivityTime" + JSON.stringify(err)) });
        if (rsactivitytime != null) { this.LOG("rsactivitytime" + JSON.stringify(rsactivitytime)) }
        try {
            localStorage.clear();
            this.LOG("localStorage cleared successfully");
        }
        catch (err) {
            this.ERR("Error clearing localStorage: " + JSON.stringify(err));
        }
        await appApi.clearCache().catch(err => { this.ERR("clearCache error: " + JSON.stringify(err)) })
        // Ensure Warehouse plugin is activated before calling resetDevice to avoid race with _firstEnable().
        let warehouseStatus = await appApi.checkStatus(Warehouse.get().callsign).catch(err => { this.ERR("FactoryReset: checkStatus error: " + JSON.stringify(err)); return null; });
        if (warehouseStatus && warehouseStatus[0] && warehouseStatus[0].state) {
            if (warehouseStatus[0].state !== 'activated') {
                await Warehouse.get().activate().catch(err => { this.ERR("FactoryReset: warehouse activation failed before resetDevice: " + JSON.stringify(err)); });
            }
        } else {
            this.WARN("FactoryReset: unexpected checkStatus response before resetDevice: " + JSON.stringify(warehouseStatus));
        }
        await Warehouse.get().resetDevice().catch(err => {
            this.ERR("resetDevice" + JSON.stringify(err));
            this.tag("Title").text.text = Language.translate("Factory Reset");
            this.tag("Info").text.text = Language.translate("Factory Reset failed. Please try again.");
            this._setState('Confirm');
        });
    }

    static _states() {
        return [
            class Confirm extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    this._setState('Rebooting')
                    /* Do any clean-up before _performFactoryReset() as it ends with a reboot. */
                    this._performFactoryReset()
                }
                _handleRight() {
                    this._setState('Cancel')
                }
                _focus() {
                    this.tag('Confirm').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Confirm').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class Cancel extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                if(!Router.isNavigating()){
                    Router.back()
                }
                }
                _handleLeft() {
                    this._setState('Confirm')
                }
                _focus() {
                    this.tag('Cancel').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Cancel').patch({
                        color: 0xFF7D7D7D
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class Rebooting extends this {
                $enter() {
                    this.loadingAnimation.start()
                    this.tag("Loader").visible = true
                    this.tag("Title").text.text = Language.translate("Rebooting")+"..."
                    this.tag('Buttons').visible = false
                    this.tag('Info').visible = false
                }

                $exit(){
                    this.loadingAnimation.stop();
                    this.tag("Loader").visible = false
                    this.tag('Buttons').visible = true
                    this.tag('Info').visible = true
                }
                _handleEnter() {
                    // do nothing
                }
                _handleLeft() {
                    // do nothing
                }
                _handleRight() {
                    // do nothing
                }
                _handleBack() {
                    // do nothing
                }
                _handleUp() {
                    // do nothing
                }
                _handleDown() {
                    // do nothing
                }
            }
        ]
    }
}
