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
import { Lightning, Utils, Language, Router } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi';

export default class DeviceScreen extends Lightning.Component {
    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device'));
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
            DeviceScreenContents: {
                x: 200,
                y: 275,
                Info: {
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Info'),
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
                TimeZone: {
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Time Zone'),
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
                Firmware: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Check for Firmware Update'),
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
                Reboot: {
                    y: 270,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Reboot'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Reset: {
                    y: 360,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Factory Reset'),
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

    _init() {
        this._appApi = new AppApi();
        this._setState('Info')
    }

    _focus() {
        this._setState(this.state)
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/advanced')
        }
    }

    static _states() {
        return [
            class Info extends this{
                $enter() {
                    this.tag('Info')._focus()
                }
                $exit() {
                    this.tag('Info')._unfocus()
                }
                _handleUp() {
                    // this._setState('Reboot');
                }
                _handleDown() {
                    this._setState('TimeZone')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/advanced/device/info')
                    }
                }
            },
            class TimeZone extends this{
                $enter() {
                    this.tag('TimeZone')._focus()
                }
                $exit() {
                    this.tag('TimeZone')._unfocus()
                }
                _handleUp() {
                    this._setState('Info');
                }
                _handleDown() {
                    this._setState('Firmware')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/advanced/device/timezone')
                    }
                }
            },
            class Firmware extends this{
                $enter() {
                    this.tag('Firmware')._focus()
                }
                $exit() {
                    this.tag('Firmware')._unfocus()
                }
                _handleUp() {
                    this._setState('TimeZone');
                }
                _handleDown() {
                    this._setState('Reboot')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/advanced/device/firmware')
                    }
                }
            },
            class Reboot extends this{
                $enter() {
                    this.tag('Reboot')._focus()
                }
                $exit() {
                    this.tag('Reboot')._unfocus()
                }
                _handleUp() {
                    this._setState('Firmware');
                }
                _handleDown() {
                    this._setState('Reset')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/advanced/device/reboot')
                    }
                }
            },
            class Reset extends this{
                $enter() {
                    this.tag('Reset')._focus()
                }
                $exit() {
                    this.tag('Reset')._unfocus()
                }
                _handleUp() {
                    this._setState('Reboot');
                }
                _handleDown() {
                    //this._setState('Info')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                        Router.navigate('settings/advanced/device/factoryReset')
                    }
                }
            },
        ]
    }
}