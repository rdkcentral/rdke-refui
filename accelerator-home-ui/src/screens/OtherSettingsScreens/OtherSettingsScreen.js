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
import { Lightning, Utils, Language, Router, Storage } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi'

/**
 * Class for Other Settings Screen.
 */

export default class OtherSettingsScreen extends Lightning.Component {

    pageTransition() {
        return 'left'
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings'));
    }

    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            OtherSettingsScreenContents: {
                x: 200,
                y: 275,
                SleepTimer: {
                    y: 0,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Sleep Timer: Off'),
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
                RemoteControl: {
                    alpha: 0.3, // disabled
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Remote Control'),
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
                ScreenSaver: {
                  //  alpha: 0.3, // disabled
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Screen-Saver: '),
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
                EnergySaver: {
                    y: 270,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Energy Saver: '),
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
                Language: {
                    //alpha: 0.3, // disabled
                    y: 450 - 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Language'),
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
                Privacy: {
                    //alpha: 0.3, // disabled
                    y: 540 - 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Privacy'),
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
                AdvancedSettings: {
                    y: 630 - 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Advanced Settings'),
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
        this._setState('SleepTimer')
    }
    $updateStandbyMode(standbyMode) {
        this.tag("EnergySaver.Title").text.text = Language.translate("Energy Saver: ") + Language.translate(standbyMode)
    }

    $sleepTimerText(text) {
        this.tag('SleepTimer.Title').text.text = Language.translate('Sleep Timer: ') + text
    }
    $screenSaverTime(text){
        this.tag('ScreenSaver.Title').text.text = Language.translate('Screen-Saver: ') + text
    }

    _focus() {
        this._setState(this.state)

        if (Storage.get('TimeoutInterval')) {
            this.tag('SleepTimer.Title').text.text = Language.translate('Sleep Timer: ') + Storage.get('TimeoutInterval')
        }
        else {
            this.tag('SleepTimer.Title').text.text = Language.translate('Sleep Timer: ') + 'Off'
        }

        this._appApi.getPreferredStandbyMode().then(result => {
            let currentStandbyMode = ""
            if (result.preferredStandbyMode == "LIGHT_SLEEP") {
                currentStandbyMode = "Light Sleep"
            } else if (result.preferredStandbyMode == "DEEP_SLEEP") {
                currentStandbyMode = "Deep Sleep"
            }
            this.tag("EnergySaver.Title").text.text = Language.translate("Energy Saver: ") + Language.translate(currentStandbyMode)
        })

        if (Storage.get('ScreenSaverTimeoutInterval')) {
            this.tag('ScreenSaver.Title').text.text = Language.translate('Screen-Saver: ') + Storage.get('ScreenSaverTimeoutInterval') + ' min'
        } else {
            this.tag('ScreenSaver.Title').text.text = Language.translate('Screen-Saver: ') + 'Off'
        }
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings')
        }
    }

    static _states() {
        return [

            class SleepTimer extends this {
                $enter() {
                    this.tag('SleepTimer')._focus()
                }
                $exit() {
                    this.tag('SleepTimer')._unfocus()
                }
                _handleUp() {
                    // this._setState('AdvancedSettings')
                }
                _handleDown() {
                    // this._setState('RemoteControl')
                    this._setState('ScreenSaver')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/other/timer')
                    }
                }
            },

            class RemoteControl extends this {
                $enter() {
                    this.tag('RemoteControl')._focus()
                }
                $exit() {
                    this.tag('RemoteControl')._unfocus()
                }
                _handleUp() {
                    this._setState('SleepTimer')
                }
                _handleDown() {
                    this._setState('ScreenSaver')
                }
                _handleEnter() {

                }
            },
            class ScreenSaver extends this {
                $enter() {
                    this.tag('ScreenSaver')._focus()
                }
                $exit() {
                    this.tag('ScreenSaver')._unfocus()
                }
                _handleUp() {
                    this._setState('SleepTimer')
                }
                _handleDown() {
                    this._setState('EnergySaver')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/other/ScreenSaver')
                    }
                }
            },
            class EnergySaver extends this {
                $enter() {
                    this.tag('EnergySaver')._focus()
                }
                $exit() {
                    this.tag('EnergySaver')._unfocus()
                }
                _handleUp() {
                    this._setState('ScreenSaver')
                }
                _handleDown() {
                    // this._setState('Theme')
                    this._setState('Language')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/other/energy')
                    }
                }
            },

            class Language extends this {
                $enter() {
                    this.tag('Language')._focus()
                }
                $exit() {
                    this.tag('Language')._unfocus()
                }
                _handleUp() {
                    this._setState('EnergySaver')
                }
                _handleDown() {
                    this._setState('Privacy')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/other/language')
                    }
                }
            },
            class Privacy extends this {
                $enter() {
                    this.tag('Privacy')._focus()
                }
                $exit() {
                    this.tag('Privacy')._unfocus()
                }
                _handleUp() {
                    this._setState('Language')
                }
                _handleDown() {
                    this._setState('AdvancedSettings')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/other/privacy')
                    }
                }
            },
            class AdvancedSettings extends this {
                $enter() {
                    this.tag('AdvancedSettings')._focus()
                }
                $exit() {
                    this.tag('AdvancedSettings')._unfocus()
                }
                _handleUp() {
                    this._setState('Privacy')
                }
                _handleDown() {
                    // this._setState('SleepTimer')
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.navigate('settings/advanced')
                    }
                }
            },
        ]
    }
}