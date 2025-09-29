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

import { Lightning, Router, Storage, Language, Registry } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG, GLOBALS } from '../../Config/Config'
import SettingsMainItem from '../../items/SettingsMainItem'
import AlexaApi from '../../api/AlexaApi'
import AppApi from '../../api/AppApi'
import NetworkManager from '../../api/NetworkManagerAPI'

export default class NetworkScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }
    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            Network: {
                x: 960,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Network Configuration"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1600, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Select a network interface"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                NetworkInterfaceList: {
                    x: 200 - 1000,
                    y: 270,
                    WiFi: {
                        y: 0,
                        type: SettingsMainItem,
                        Title: {
                            x: 10,
                            y: 45,
                            mountY: 0.5,
                            text: {
                                text: Language.translate('WiFi'),
                                textColor: COLORS.titleColor,
                                fontFace: CONFIG.language.font,
                                fontSize: 25,
                            }
                        },
                    },
                    Ethernet: {
                        y: 90,
                        type: SettingsMainItem,
                        Title: {
                            x: 10,
                            y: 45,
                            mountY: 0.5,
                            text: {
                                text: Language.translate('Ethernet'),
                                textColor: COLORS.titleColor,
                                fontFace: CONFIG.language.font,
                                fontSize: 25,
                            }
                        },
                    },
                    Skip: {
                        x: 820, y: 250, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Skip"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: true
                    },
                },
            }
        }
    }

    async _init() {
        this.appApi = new AppApi();
        await this.appApi.checkStatus(NetworkManager.callsign).then(nwPluginStatus => {
            if (nwPluginStatus[0].state.toLowerCase() !== "activated") {
                console.log("Iniate the activate call")
                NetworkManager.activate();
            }
        });
    }

    pageTransition() {
        return 'left'
    }

    _focus() {
        this._setState('WiFi')
    }

    static _states() {
        return [
            class WiFi extends this {
                $enter() {
                    this.tag('WiFi')._focus()
                }
                $exit() {
                    this.tag('WiFi')._unfocus()
                }
                _handleDown() {
                    this._setState('Ethernet')
                }
                _handleEnter() {
                    // this._setState('WiFiScreen')
                    NetworkManager.SetInterfaceState('wlan0').then(res => {
                        if (res) {
                                Registry.setTimeout(() => {
                                    Router.navigate('splash/networkList')
                                }, (Router.isNavigating() ? 20 : 0));
                        }
                    })
                    this.LOG("Wifi")
                }
            },
            class Ethernet extends this {
                $enter() {
                    this.tag('Ethernet')._focus()
                }
                $exit() {
                    this.tag('Ethernet')._unfocus()
                }
                async _handleEnter() {
                    await NetworkManager.GetInterfaceState("eth0").then(async enabled => {
                        if (enabled) {
                            await NetworkManager.GetAvailableInterfaces().then(res => {
                                    console.log(JSON.stringify(res))
                                    let eth = res.filter((item) => item.type == 'ETHERNET')
                                    if (eth[0].type == 'ETHERNET' && eth[0].enabled == true && eth[0].connected == true) {
                                        Registry.setTimeout(() => {
                                            Router.navigate('menu')
                                        }, (Router.isNavigating() ? 20 : 0));
                                    }
                                    else if (eth[0].type == 'ETHERNET' && eth[0].connected == false) {
                                        Registry.setTimeout(() => {
                                            Router.navigate('splash/networkPrompt')
                                        }, (Router.isNavigating() ? 20 : 0));
                                    }
                                })
                        } else {
                            await NetworkManager.SetInterfaceState('eth0').then(async res => {
                                if (res) {
                                        await NetworkManager.GetAvailableInterfaces().then(res => {
                                            console.log(JSON.stringify(res))
                                            let eth = res.filter((item) => item.type == 'ETHERNET')
                                            if (eth[0].type == 'ETHERNET' && eth[0].enabled == true && eth[0].connected == true) {
                                                Registry.setTimeout(() => {
                                                    Router.navigate('menu')
                                                }, (Router.isNavigating() ? 20 : 0));
                                            }
                                            else if (eth[0].type == 'ETHERNET' && eth[0].connected == false) {
                                                Registry.setTimeout(() => {
                                                    Router.navigate('splash/networkPrompt')
                                                }, (Router.isNavigating() ? 20 : 0));
                                            }
                                        })
                                }
                            })
                        }
                    });                      
                }
                _handleDown() {
                    this._setState('Skip')
                }
                _handleUp() {
                    this._setState('WiFi')
                }
            },
            class Skip extends this{
                $enter() {
                    this._focus()
                }
                _focus() {
                    this.tag('Skip').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Skip.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Skip').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('Skip.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                _handleEnter() {
                    if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied" && GLOBALS.AlexaAvsstatus) {
                        NetworkManager.IsConnectedToInternet().then(result => {
                            if (result.connected)
                                Registry.setTimeout(() => { 
                                Router.navigate('AlexaLoginScreen') 
                            }, (Router.isNavigating() ? 20 : 0));
                            else
                                Registry.setTimeout(() => { Router.navigate('menu') }, (Router.isNavigating() ? 20 : 0));
                        })
                    } else {
                        Registry.setTimeout(() => { Router.navigate('menu') }, (Router.isNavigating() ? 20 : 0));
                    }
                }
                _handleUp() {
                    this._setState('Ethernet')
                }
                $exit() {
                    this._unfocus()
                }
            }
        ]
    }
}
