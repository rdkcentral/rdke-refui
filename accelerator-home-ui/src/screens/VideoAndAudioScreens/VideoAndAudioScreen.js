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
import VideoScreen from './VideoScreen'

import AudioScreen from './AudioScreen'
 /**
  * Class for Video and Audio screen.
  */

 export default class VideoAndAudioScreen extends Lightning.Component {
    static _template(){
        return {
            x:0,
            y:0,
            VideoAndAudioScreenContents:{    //contents in the VideoAndAudioScreen are placed inside the main screen, child screens are outside VideoAndAudioScreenContents
                ClosedCaptioning: {
                    // y: 0 + 200,
                    type: SettingsMainItem,
                    Title: {
                    x: 10,
                    y: 45,
                    mountY: 0.5,
                    text: {
                        text: 'Closed Captioning',
                    textColor: COLORS.titleColor,
                    fontFace: CONFIG.language.font,
                    fontSize: 25,
                    }
                    },
                    Button: {
                    h: 30 *1.5,
                    w: 44.6 *1.5,
                    x: 1600,
                    mountX:1,
                    y: 45,
                    mountY:0.5,
                    src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                CCOptions: {
                    y: 0 + 90,
                    type: SettingsMainItem,
                    Title: {
                    x: 10,
                    y: 45,
                    mountY: 0.5,
                    text: {
                        text: 'Closed Captioning Options',
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
                Video: {
                    y: 0 + 90 + 90,
                    type: SettingsMainItem,
                    Title: {
                    x: 10,
                    y: 45,
                    mountY: 0.5,
                    text: {
                        text: Language.translate('Video Display'),
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
                Audio: {
                    y: 0 + 90 + 90 +90 ,
                    type: SettingsMainItem,
                    Title: {
                    x: 10,
                    y: 45,
                    mountY: 0.5,
                    text: {
                        text: Language.translate('Audio'),
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

            VideoScreen:{
                type: VideoScreen,
                visible:false,
            },
            AudioScreen:{
                type: AudioScreen,
                visible:false,
            },

        }
    }

    _focus(){
        this._setState('ClosedCaptioning') //can be used on init as well
    }

    hide(){
        this.tag('VideoAndAudioScreenContents').visible = false
    }

    show(){
        this.tag('VideoAndAudioScreenContents').visible = true
    }


    static _states(){
        return [
            class ClosedCaptioning extends this {
                $enter(){
                    this.tag('ClosedCaptioning')._focus()
                }
                $exit(){
                    this.tag('ClosedCaptioning')._unfocus()
                }
                _handleDown(){
                    this._setState('CCOptions')
                }
                _handleEnter(){
                    //
                }
            },
            class CCOptions extends this {
                $enter(){
                    this.tag('CCOptions')._focus()
                }
                $exit(){
                    this.tag('CCOptions')._unfocus()
                }
                _handleUp(){
                    this._setState('ClosedCaptioning')
                }
                _handleDown(){
                    this._setState('Video')
                }
                _handleEnter(){
                    //
                }
            },
            class Video extends this {
                $enter(){
                    this.tag('Video')._focus()
                }
                $exit(){
                    this.tag('Video')._unfocus()
                }
                _handleUp(){
                    this._setState('CCOptions')
                }
                _handleDown(){
                    this._setState('Audio')
                }
                _handleEnter(){
                    this._setState('VideoScreen')
                }
            },
            class Audio extends this {
                $enter(){
                    this.tag('Audio')._focus()
                }
                $exit(){
                    this.tag('Audio')._unfocus()
                }
                _handleUp(){
                    this._setState('Video')
                }
                _handleDown(){
                    // this._setState('')
                }
                _handleEnter(){
                    this._setState('AudioScreen')
                }
            },
            class VideoScreen extends this {
                $enter(){
                    this.hide()
                    this.tag('VideoScreen').visible = true
                    this.fireAncestors('$changeHomeText', 'Settings / Video and Audio / Video Display')
                }
                $exit(){
                    this.show()
                    this.tag('VideoScreen').visible = false
                    this.fireAncestors('$changeHomeText', 'Settings / Video and Audio')
                }
                _getFocused() {
                    return this.tag('VideoScreen')
                  }
                _handleBack() {
                    this._setState('Video')
                }
            },
            class AudioScreen extends this {
                $enter(){
                    this.hide()
                    this.tag('AudioScreen').visible = true
                    this.fireAncestors('$changeHomeText', 'Settings / Video and Audio / Audio Display')
                }
                $exit(){
                    this.show()
                    this.tag('AudioScreen').visible = false
                    this.fireAncestors('$changeHomeText', 'Settings / Video and Audio')
                }
                _getFocused() {
                    return this.tag('AudioScreen')
                  }
                _handleBack() {
                    this._setState('Audio')
                }
            }
        ]
    }
 }