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
 import { Lightning, Utils } from '@lightningjs/sdk'
 import SettingsMainItem from '../../items/SettingsMainItem'
 import { COLORS } from '../../colors/Colors'
 import { CONFIG } from '../../Config/Config'
 import ConfigureManuallyScreen from './ConfigureManuallyScreen'
 /**
   * Class for Other Settings Screen.
   */

 export default class ConfigureScreen extends Lightning.Component {
     static _template() {
         return {
             x: 0,
             y: 0,
             ConfigureScreenContents: {
                 DHCP: {
                     y: 0,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: 'DHCP',
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
                 DHCPManual: {
                     //alpha: 0.3, // disabled
                     y: 90,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: 'DHCP with Manual Address ',
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
                 BootP: {
                     //alpha: 0.3, // disabled
                     y: 180,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: 'BootP ',
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
                 Manually: {
                     y: 270,
                     type: SettingsMainItem,
                     Title: {
                         x: 10,
                         y: 45,
                         mountY: 0.5,
                         text: {
                             text: 'Manually',
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
             ConfigureManuallyScreen: {
                 x: -100,
                 y: -100,
                 type: ConfigureManuallyScreen,
                 visible: false
             }
         }
     }

     _init() {

     }

    _active() {
        console.warn(new Date().toISOString() +" from: ConfigureScreen.js")
    }

     _focus() {
         this._setState('DHCP');
     }

     hide() {
        this.tag('ConfigureScreenContents').visible = false
    }

    show() {
        this.tag('ConfigureScreenContents').visible = true
    }


     static _states(){
         return[
             class DHCP extends this{
                $enter() {
                    this.tag('DHCP')._focus()
                }
                $exit() {
                    this.tag('DHCP')._unfocus()
                }
                _handleDown() {
                    this._setState('DHCPManual')
                }
                _handleEnter() {
                }
             },
             class DHCPManual extends this{
                $enter() {
                    this.tag('DHCPManual')._focus()
                }
                $exit() {
                    this.tag('DHCPManual')._unfocus()
                }
                _handleUp(){
                    this._setState('DHCP');
                }
                _handleDown() {
                    this._setState('BootP')
                }
                _handleEnter() {
                }
             },
             class BootP extends this {
                $enter() {
                    this.tag('BootP')._focus()
                }
                $exit() {
                    this.tag('BootP')._unfocus()
                }
                _handleUp(){
                    this._setState('DHCPManual');
                }
                _handleDown() {
                    this._setState('Manually')
                }
                _handleEnter() {
                }
             },
             class Manually extends this {
                $enter() {
                    this.tag('Manually')._focus()
                }
                $exit() {
                    this.tag('Manually')._unfocus()
                }
                _handleUp(){
                    this._setState('BootP');
                }
                _handleDown() {
                    this._setState('DHCP')
                }
                _handleEnter() {
                    this._setState('ConfigureManuallyScreen');
                }
             },
             class ConfigureManuallyScreen extends this {
                $enter() {
                    this.hide()
                    this.tag('ConfigureManuallyScreen').visible = true
                    this.fireAncestors('$changeHomeText', '')
                }
                $exit() {
                    this.show()
                    this.tag('ConfigureManuallyScreen').visible = false
                    this.fireAncestors('$changeHomeText', 'Settings / Network Configuration / Configure')
                }
                _getFocused() {
                    return this.tag('ConfigureManuallyScreen')
                }
                _handleBack() {
                    this._setState('Manually');
                }
            },

         ]
     }


 }