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
import { Language, Lightning, Utils } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
/**
 * Class for Remote Control Screen.
 */

export default class RemoteControlScreen extends Lightning.Component {
    static _template() {
        return {
            x: 0,
            y: 0,
            RemoteControlScreenContents: {
                PairingStatus: {
                    y: 0,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Pairing Status')+": ",
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
                FirmwareVersion: {
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Firmware version')+": ",
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
                TestMicrophone: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Test Microphone'),
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
                Info: {
                    y: 270,
                    BatteryHealth: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Battery percent')+': ',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    SignalStrength: {
                        x: 10,
                        y: 45 + 35,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Signal Strength: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    VoiceCapable: {
                        x: 10,
                        y: 45 + 35 + 35,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Voice Capable')+': ',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },

                },
            },
            PairingStatusScreen: {
                //
            },
        }
    }


    _focus() {
        this._setState('PairingStatus') //can be used on init as well
    }

    hide() {
        this.tag('RemoteControlScreenContents').visible = false
    }

    show() {
        this.tag('RemoteControlScreenContents').visible = true
    }

    static _states() {
        return [
            class PairingStatus extends this {
                $enter() {
                    this.tag('PairingStatus')._focus()
                }
                $exit() {
                    this.tag('PairingStatus')._unfocus()
                }
                _handleDown() {
                    this._setState('FirmwareVersion')
                }
                _handleEnter() {
                    //
                }
            },
            class FirmwareVersion extends this {
                $enter() {
                    this.tag('FirmwareVersion')._focus()
                }
                $exit() {
                    this.tag('FirmwareVersion')._unfocus()
                }
                _handleUp() {
                    this._setState('PairingStatus')
                }
                _handleDown() {
                    this._setState('TestMicrophone')
                }
                _handleEnter() {
                    //
                }
            },
            class TestMicrophone extends this {
                $enter() {
                    this.tag('TestMicrophone')._focus()
                }
                $exit() {
                    this.tag('TestMicrophone')._unfocus()
                }
                _handleUp() {
                    this._setState('FirmwareVersion')
                }
                _handleEnter() {
                    //
                }
            },
        ]
    }
}