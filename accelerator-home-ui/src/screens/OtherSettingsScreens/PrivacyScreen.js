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
import AppApi from '../../api/AppApi'
import AlexaApi from '../../api/AlexaApi'
import { Lightning, Utils, Storage, Language, Router } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG,GLOBALS } from '../../Config/Config'
import XcastApi from '../../api/XcastApi'
import UsbApi from '../../api/UsbApi'

/**
 * Class for Privacy Screen.
 */

const xcastApi = new XcastApi()
let cookieToggle = false

export default class PrivacyScreen extends Lightning.Component {
    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Privacy'));
    }

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            PrivacyScreenContents: {
                x: 200,
                y: 275,
                LocalDeviceDiscovery: {
                    y: 0,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Local Device Discovery'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                UsbMediaDevices: {
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('USB Media Devices'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                AudioInput: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Audio Input'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                ClearCookies: {
                    y: 270,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Clear Cookies and App Data'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                PrivacyPolicy: {
                    y: 360,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Privacy Policy and License'),
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
        }
    }

    _firstEnable() {
        this._setState('LocalDeviceDiscovery')
        this.checkLocalDeviceStatus()
        this.USBApi = new UsbApi()
        this.AppApi = new AppApi()
    }

    _focus() {
        this._setState(this.state)
        this.checkLocalDeviceStatus()
        this.checkUSBDeviceStatus()
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/other')
        }
    }

    checkUSBDeviceStatus() {
        if (!Storage.get('UsbMedia')) {
            this.tag('UsbMediaDevices.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
            Storage.set('UsbMedia', 'ON')
        } else if (Storage.get('UsbMedia') === 'ON') {
            this.tag('UsbMediaDevices.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
        } else if (Storage.get('UsbMedia') === 'OFF') {
            this.tag('UsbMediaDevices.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
        }
    }

    checkLocalDeviceStatus() {
        xcastApi.getEnabled().then(res => {
            if (res.enabled) {
                this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
            } else {
                this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
            }
        }).catch(err => {
            this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
        })
    }

    toggleLocalDeviceDiscovery() {
        xcastApi.getEnabled().then(res => {
            if (!res.enabled) {
                xcastApi.activate().then(res => {
                    if (res) {
                        this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                    }
                })
            }
            else {
                xcastApi.deactivate().then(res => {
                    if (res) {
                        this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                    }
                })
            }
        }).catch(err => {
            console.log('Service not active')
            this.tag('LocalDeviceDiscovery.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
        })
    }

    static _states() {
        return [
            class LocalDeviceDiscovery extends this {
                $enter() {
                    this.tag('LocalDeviceDiscovery')._focus()
                }
                $exit() {
                    this.tag('LocalDeviceDiscovery')._unfocus()
                }
                _handleUp() {
                    // this._setState('PrivacyPolicy')
                }
                _handleDown() {
                    this._setState('UsbMediaDevices')
                }
                _handleEnter() {
                    this.toggleLocalDeviceDiscovery()
                }
            },
            class UsbMediaDevices extends this {
                $enter() {
                    this.tag('UsbMediaDevices')._focus()
                }
                $exit() {
                    this.tag('UsbMediaDevices')._unfocus()
                }
                _handleUp() {
                    this._setState('LocalDeviceDiscovery')
                }
                _handleDown() {
                    this._setState('AudioInput')
                }
                _handleEnter() {
                    let _UsbMedia = Storage.get('UsbMedia')
                    if (_UsbMedia === 'ON') {
                        this.fireAncestors('$deRegisterUsbMount')
                        this.USBApi.deactivate().then((res) => {
                            Storage.set('UsbMedia', 'OFF')
                            this.tag('UsbMediaDevices.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                            this.widgets.menu.refreshMainView()
                        }).catch(err => {
                            console.error(`error while disabling the usb plugin = ${err}`)
                            this.fireAncestors('$registerUsbMount')
                        })
                    } else if (_UsbMedia === 'OFF') {
                        this.USBApi.activate().then(res => {
                            Storage.set('UsbMedia', 'ON')
                            this.tag('UsbMediaDevices.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                            this.fireAncestors('$registerUsbMount')
                            this.widgets.menu.refreshMainView()
                        })
                    }
                }
            },
            class AudioInput extends this {
                $enter() {
                    this.tag('AudioInput')._focus()
                }
                $exit() {
                    this.tag('AudioInput')._unfocus()
                }
                _handleUp() {
                    this._setState('UsbMediaDevices')
                }
                _handleDown() {
                    this._setState('ClearCookies')
                }
                _handleEnter() {
                    //
                }
            },
            class ClearCookies extends this {
                $enter() {
                    this.tag('ClearCookies')._focus()
                }
                $exit() {
                    this.tag('ClearCookies')._unfocus()
                }
                _handleUp() {
                    this._setState('AudioInput')
                }
                _handleDown() {
                    this._setState('PrivacyPolicy')
                }
                _handleEnter() {
                    cookieToggle = !cookieToggle

                    //TOGGLE BUTTON
                    if(cookieToggle){
                        this.tag('ClearCookies.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                        this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data') + " - " + Language.translate('In Progress')
                    }
                    else{
                        this.tag('ClearCookies.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                        this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data')
                    }
                    this.AppApi.clearCache()
                        .then(() => {
                            //location.reload(true)
                    })

                    setTimeout(() => {
                        if(GLOBALS.AlexaAvsstatus){
                        AlexaApi.get().resetAVSCredentials().then((result) => {
                            console.log("Triggering AVS credential reset." ,result)
                            if (result.success) {
                                AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending");
                                this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data') + " - " + Language.translate('Finished')
                                setTimeout(() => {
                                    this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data')
                                    this.tag('ClearCookies.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                                    cookieToggle = !cookieToggle
                                }, 2000)
                            } else {
                                //UNSUCCESSFULL API CALL
                                this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data')+ " - " + Language.translate("Error!")
                                setTimeout(() => {
                                    this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data')
                                    this.tag('ClearCookies.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                                    cookieToggle = !cookieToggle
                                }, 2000)
                            }
                        })}
                        else{
                            this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data') + " - " + Language.translate('Finished')
                            setTimeout(() => {
                                this.tag('ClearCookies.Title').text = Language.translate('Clear Cookies and App Data')
                                this.tag('ClearCookies.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                                cookieToggle = !cookieToggle
                            }, 2000)
                        }
                    }, 2000)
                }
            },
            class PrivacyPolicy extends this {
                $enter() {
                    this.tag('PrivacyPolicy')._focus()
                }
                $exit() {
                    this.tag('PrivacyPolicy')._unfocus()
                }
                _handleUp() {
                    this._setState('ClearCookies')
                }
                _handleDown() {
                    // this._setState('LocalDeviceDiscovery')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/other/privacyPolicy')
                    }
                }
            },
        ]
    }
}
