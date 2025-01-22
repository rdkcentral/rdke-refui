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
 import { Lightning, Utils, Language, Storage } from '@lightningjs/sdk'
 import SettingsMainItem from '../../items/SettingsMainItem'
 import { COLORS } from '../../colors/Colors'
 import { CONFIG } from '../../Config/Config'
 import AppApi from '../../api/AppApi'
 import SleepTimerScreen from './SleepTimerOverlay'
 import EnergySavingsScreen from './EnergySaverOverlay'
 import LanguageScreen from './LanguageScreenOverlay'
 import PrivacyScreen from './PrivacyScreenOverlay'
 import AdvanceSettingsScreen from './AdvancedSettingsScreenOverlay'
 /**
  * Class for Other Settings Screen.
  */

 export default class OtherSettingsScreen extends Lightning.Component {
     static _template() {
         return {
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
                     alpha: 0.3, // disabled
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
                     alpha: 0.3, // disabled
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
             SleepTimerScreen:{
                type: SleepTimerScreen,
                visible: false
             },
             EnergySavingsScreen:{
                type: EnergySavingsScreen,
                visible: false
             },
             LanguageScreen: {
                type: LanguageScreen,
                visible: false
             },
             PrivacyScreen:{
                type: PrivacyScreen,
                visible: false
             },
             AdvanceSettingsScreen:{
                type: AdvanceSettingsScreen,
                visible: false
             },

         }
     }
     _init() {
         this._appApi = new AppApi();
         this._setState('SleepTimer')
     }
     $updateStandbyMode(standbyMode) {
         this.tag("EnergySaver.Title").text.text = Language.translate("Energy Saver: ") + standbyMode
     }

     $sleepTimerText(text) {
         this.tag('SleepTimer.Title').text.text = Language.translate('Sleep Timer: ') + text
     }

     _focus() {
        this._setState('SleepTimer')

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
             this.tag("EnergySaver.Title").text.text = Language.translate("Energy Saver: ") + currentStandbyMode
         })

         if (Storage.get('ScreenSaverTimeoutInterval')) {
            this.tag('ScreenSaver.Title').text.text = Language.translate('Screen-Saver: ') + Storage.get('ScreenSaverTimeoutInterval') + ' min'
         } else {
            this.tag('ScreenSaver.Title').text.text = Language.translate('Screen-Saver: ') + 'Off'
         }
     }

    hide() {
        this.tag('OtherSettingsScreenContents').visible = false
    }

    show() {
        this.tag('OtherSettingsScreenContents').visible = true
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
                    //  this._setState('AdvancedSettings')
                 }
                 _handleDown() {
                     // this._setState('RemoteControl')
                     this._setState('EnergySaver')
                 }
                 _handleEnter() {
                    this._setState("SleepTimerScreen")
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
                     this._setState('RemoteControl')
                 }
                 _handleDown() {
                     this._setState('EnergySaver')
                 }
                 _handleEnter() {
                     //
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
                     this._setState('SleepTimer')
                 }
                 _handleDown() {
                     this._setState('Privacy')
                 }
                 _handleEnter() {
                    this._setState("EnergySavingsScreen")
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
                    // this._setState("LanguageScreen")
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
                     this._setState('EnergySaver')
                 }
                 _handleDown() {
                     this._setState('AdvancedSettings')
                 }
                 _handleEnter() {
                    this._setState("PrivacyScreen")
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
                    //  this._setState('SleepTimer')
                 }
                 _handleEnter() {
                    this._setState("AdvanceSettingsScreen")
                 }
             },
             class SleepTimerScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('SleepTimerScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Sleep Timer')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('SleepTimerScreen')
                }
                $exit() {
                  this.show()
                  this.tag('SleepTimerScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings')
                }
                _handleBack() {
                  this._setState('SleepTimer')
                }
              },
              class EnergySavingsScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('EnergySavingsScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Energy Saver')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('EnergySavingsScreen')
                }
                $exit() {
                  this.show()
                  this.tag('EnergySavingsScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings')
                }
                _handleBack() {
                  this._setState('EnergySaver')
                }
              },
              //LanguageScreen
              class LanguageScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('LanguageScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Language')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('LanguageScreen')
                }
                $exit() {
                  this.show()
                  this.tag('LanguageScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings')
                }
                _handleBack() {
                  this._setState('Language')
                }
              },
              //PrivacyScreen
              class PrivacyScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('PrivacyScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Privacy')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('PrivacyScreen')
                }
                $exit() {
                  this.show()
                  this.tag('PrivacyScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings')
                }
                _handleBack() {
                  this._setState('Privacy')
                }
              },
              class AdvanceSettingsScreen extends this {
                $enter() {
                  ////console.log("bpscreen")
                  this.hide()
                  this.tag('AdvanceSettingsScreen').visible = true
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings  Advanced Settings')
                }
                _getFocused() {
                  //console.log("getfocusedbp")
                  return this.tag('AdvanceSettingsScreen')
                }
                $exit() {
                  this.show()
                  this.tag('AdvanceSettingsScreen').visible = false
                  this.fireAncestors("$updatePageTitle",'Settings  Other Settings')
                }
                _handleBack() {
                  this._setState('AdvancedSettings')
                }
              },
         ]
     }
 }