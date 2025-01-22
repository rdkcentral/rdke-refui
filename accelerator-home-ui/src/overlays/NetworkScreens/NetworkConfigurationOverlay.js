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
import { Lightning, Utils, Language } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import Network from '../../api/NetworkApi'
import NetworkInfoScreen from './NetworkInfoScreen'
import NetworkInterfaceOverlay from './NetworkInterfaceOverlay'

export default class NetworkConfigurationScreen extends Lightning.Component {
    static _template() {
        return {
            rect: true,
            color: 0x00000000,
            w: 1920,
            h: 1080,
            NetworkConfigurationScreenContents: {
                x: 200,
                y: 275,
                NetworkInfo: {
                    y: 0,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Network Info'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
                NetworkInterface: {
                    //alpha: 0.3, // disabled
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Network Interface: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
                TestInternetAccess: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Test Internet Access: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Loader: {
                        h: 45,
                        w: 45,
                        x: 420,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Loading.png'),
                        visible: false,
                    },
                },
                StaticMode: {
                    alpha: 0, // disabled
                    y: 270,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Static Mode'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
            },
            NetworkInfoScreen: {
                type: NetworkInfoScreen,
                visible: false
            },
            NetworkInterfaceOverlay: {
                type: NetworkInterfaceOverlay,
                visible: false
            }
        }
    }

    _active() {
        this._setState('NetworkInfo')
        let _currentIPSettings = {}
        let _newIPSettings = {}

        Network.get().getDefaultInterface().then(interfaceName => {
            this.$NetworkInterfaceText(interfaceName)
        })

        this.onDefaultIfaceChangedCB = Network.get()._thunder.on(Network.get().callsign, 'onDefaultInterfaceChanged', data => {
            this.$NetworkInterfaceText(data.newInterfaceName)
            this.tag('TestInternetAccess.Title').text.text = Language.translate('Test Internet Access: ')
        });

        _newIPSettings = _currentIPSettings
        _newIPSettings.ipversion = "IPV6"

        // loader animation for testing internet
        this.loadingAnimation = this.tag('TestInternetAccess.Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        });
    }

    _inactive() {
        this.onDefaultIfaceChangedCB.dispose();
    }

    _focus() {
        this._setState('NetworkInfo')
    }

    _unfocus() {
        this.tag('TestInternetAccess.Title').text.text = Language.translate('Test Internet Access: ')
    }

    $NetworkInterfaceText(text) {
        this.tag('NetworkInterface.Title').text.text = Language.translate('Network Interface: ') + text
    }

    hide() {
        this.tag('NetworkConfigurationScreenContents').visible = false
    }

    show() {
        this.tag('NetworkConfigurationScreenContents').visible = true
    }

    static _states() {
        return [
            class NetworkInfo extends this {
                $enter() {
                    this.tag('NetworkInfo')._focus()
                }
                $exit() {
                    this.tag('NetworkInfo')._unfocus()
                }
                _handleDown() {
                    this._setState('NetworkInterface')
                }
                _handleEnter() {
                    this._setState("NetworkInfoScreen")
                }

            },
            class NetworkInterface extends this {
                $enter() {
                    this.tag('NetworkInterface')._focus()
                }
                $exit() {
                    this.tag('NetworkInterface')._unfocus()
                }
                _handleUp() {
                    this._setState('NetworkInfo')
                }
                _handleDown() {
                    this._setState('TestInternetAccess')

                }
                _handleEnter() {
                    this._setState("NetworkInterfaceOverlay")
                }
            },
            class TestInternetAccess extends this {
                $enter() {
                    this.tag('TestInternetAccess')._focus()
                }
                $exit() {
                    this.tag('TestInternetAccess')._unfocus()
                }
                _handleUp() {
                    this._setState('NetworkInterface')
                }
                _handleDown() {
                    //  this._setState('NetworkInfo')
                }
                _handleEnter() {
                    this.loadingAnimation.start()
                    this.tag('TestInternetAccess.Loader').visible = true
                    Network.get().isConnectedToInternet().then(result => {
                        let connectionStatus = Language.translate("Internet Access: ")
                        if (result) {
                            connectionStatus += Language.translate("Connected")
                        } else {
                            connectionStatus += Language.translate("Not Connected")
                        }

                        setTimeout(() => {
                            this.tag('TestInternetAccess.Loader').visible = false
                            this.tag('TestInternetAccess.Title').text.text = connectionStatus
                            this.loadingAnimation.stop()
                        }, 2000)
                    })
                }
            },
            class StaticMode extends this {
                $enter() {
                    this.tag('StaticMode')._focus()
                }
                $exit() {
                    this.tag('StaticMode')._unfocus()
                }
                _handleUp() {
                    this._setState('TestInternetAccess')
                }
                _handleDown() {
                    this._setState('NetworkInfo')
                }
                _handleEnter() {

                }
            },
            class NetworkInfoScreen extends this {
                $enter() {
                    this.hide()
                    this.tag('NetworkInfoScreen').visible = true
                    this.fireAncestors('$updatePageTitle', 'Settings  Network Configuration  Network Info')
                }
                $exit() {
                    this.show()
                    this.tag('NetworkInfoScreen').visible = false
                    this.fireAncestors('$updatePageTitle', 'Settings / Network Configuration')
                }
                _getFocused() {
                    return this.tag('NetworkInfoScreen')
                }
                _handleBack() {
                    this._setState('NetworkInfo')
                }
            },
            class NetworkInterfaceOverlay extends this {
                $enter() {
                    this.hide()
                    this.tag('NetworkInterfaceOverlay').visible = true
                    this.fireAncestors('$updatePageTitle', 'Settings  Network Configuration  Network Interface')
                }
                $exit() {
                    this.show()
                    this.tag('NetworkInterfaceOverlay').visible = false
                    this.fireAncestors('$updatePageTitle', 'Settings  Network Configuration')
                }
                _getFocused() {
                    return this.tag('NetworkInterfaceOverlay')
                }
                _handleBack() {
                    this._setState('NetworkInterface')
                }
            },
        ]
    }
}
