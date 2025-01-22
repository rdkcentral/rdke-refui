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
 import { COLORS } from '../../colors/Colors'
 import SettingsMainItem from '../../items/SettingsMainItem'
 import { CONFIG } from '../../Config/Config'
 import DvbSScan from './DvbSScan'

 /**
  * Class for Live TV Scan screen.
  */
 export default class LiveTVScan extends Lightning.Component {
    static _template() {
        return {
            LiveTVScanScreenContents: {
                x: 200,
                y: 275,
                TScan: {
                    alpha:0.3,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                        text: Language.translate('DVB-T Scan'),
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
                CScan: {
                    alpha:0.3,
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                        text: Language.translate('DVB-C Scan'),
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
                SScan: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                        text: Language.translate('DVB-S Scan'),
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
            DvbSScan:{
                type: DvbSScan,
                visible: false
            }
        }
    }

   _init() {
     this._setState('SScan')
   }
   _focus() {
     this._setState('SScan')
   }

    hide() {
        this.tag("LiveTVScanScreenContents").visible = false;
    }

    show() {
        this.tag("LiveTVScanScreenContents").visible = true;
    }



   static _states() {
    return [
        class TScan extends this{
            $enter() {
                this.tag('TScan')._focus()
            }
            $exit() {
                this.tag('TScan')._unfocus()
            }
            _handleDown() {
                this._setState('CScan')
            }
        },
        class CScan extends this{
            $enter() {
                this.tag('CScan')._focus()
            }
            $exit() {
                this.tag('CScan')._unfocus()
            }
            _handleUp() {
                this._setState('TScan')
            }
            _handleDown() {
                this._setState('SScan')
            }
        },
        class SScan extends this {
            $enter() {
                this.tag('SScan')._focus()
            }
            $exit() {
                this.tag('SScan')._unfocus()
            }
            _handleUp() {
                // this._setState('CScan')
            }
            _handleEnter() {
                this._setState("DvbSScan")
            }
        },
        class DvbSScan extends this {
            $enter() {
                this.hide()
                this.tag('DvbSScan').visible = true
                this.fireAncestors('$updatePageTitle', Language.translate('Settings / Live TV / Scan / DVB-S Scan'))
            }
            $exit() {
                this.show()
                this.tag('DvbSScan').visible = false
                this.fireAncestors('$updatePageTitle', Language.translate('Settings / Live TV / Scan'))
            }
            _getFocused() {
                return this.tag('DvbSScan')
            }
            _handleBack() {
                this._setState('SScan')
            }
        },
    ]
   }
 }
