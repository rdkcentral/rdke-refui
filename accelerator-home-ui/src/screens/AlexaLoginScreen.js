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
import { Language, Lightning, Router, Storage, Utils } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config'
import VoiceApi from '../api/VoiceApi'

const voiceApi = new VoiceApi();

export default class AlexaLoginScreen extends Lightning.Component {
    static _template() {
        return {
            Wrapper:{
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            BackButton: {
                x: 180, y: 60, w: 150, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                Title: {
                    x: 75,
                    y: 30,
                    mount: 0.5,
                    text: {
                        text: Language.translate('Back'),
                        fontFace: CONFIG.language.font,
                        fontSize: 22,
                        textColor: 0xFF000000,
                        fontStyle: 'bold'
                    },
                },
                visible: true,
            },
            Alexa:{
                x: 1050,
                y: 250,
                Logo: {
                    h: 255,
                    w: 454,
                    x: 135,
                    mountX: 1,
                    y: 200,
                    mountY: 0.5,
                    src: Utils.asset('/images/apps/App_YouTube_454x255.png'),
                },
                Description: {
                    x: -70,
                    y: 380,
                    mount: 0.5,
                    text: {
                        text: Language.translate('YouTube Voice Consent'),
                        fontFace: CONFIG.language.font,
                        fontSize: 30,
                        textColor: 0xFFF9F9F9,
                        fontStyle: 'normal',
                        wordWrap: true,
                        wordWrapWidth: 800,
                    },
                },
                SignInButton:{
                    x: -100,
                    y: 500, mountX: 0.5, h: 60, w: 500, rect: true, color: 0xFFFFFFFF,
                    Title: {
                        x: 250,
                        y: 30,
                        mount: 0.5,
                        text: {
                            text: Language.translate('I Agree'),
                            fontFace: CONFIG.language.font,
                            fontSize: 26,
                            textColor: 0xFF000000,
                            fontStyle: 'normal'
                        },
                    },
                    visible: true,
                }
            }
        }

        }

    }

    _init(){
    }
    _focus() {
        this._setState('SignInButton')
    }
    _active(){
        this._setState('SignInButton')
    }

    static _states() {
        return[
            class SignInButton extends this{
                $enter() {
                    this.tag("SignInButton").visible = true;
                    this.tag('SignInButton.Title').text.textColor = 0xFFFFFFFF
                    this._focus()
                }
                _focus() {
                    this.tag('SignInButton').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('SignInButton.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('SignInButton').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('SignInButton.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                async _handleEnter() {
                    console.log("Consent accepted on AlexaLoginScreen. Enabling YT AOWS endpoint.")
                    Storage.set("ytAudioSharingConsent", true)
					voiceApi.configureCobatlAOWSEndPoint().catch(err => {
						console.error("Error enabling YouTube Audio Sharing endpoint: " + JSON.stringify(err));
					}).then(() => {
						voiceApi.configureVoice({ "enable": true })
					}).then(() => {
						Router.navigate("menu")
					})
                 }
                _handleUp(){
                    this._setState("BackButton")
                }
                $exit() {
                    this._unfocus()
                }
            },

          class BackButton extends this {
            $enter() {
              this.tag("BackButton")
              this.tag('BackButton.Title').text.textColor = 0xFFFFFFFF
              this._focus()
            }
            _handleEnter(){
                if(!Router.isNavigating()){
                    Router.navigate('AlexaConfirmationScreen')
                }
            }
            _focus() {
                this.tag('BackButton').patch({
                    color: CONFIG.theme.hex
                })
                this.tag('BackButton.Title').patch({
                    text: {
                        textColor: 0xFFFFFFFF
                    }
                })
            }
            _unfocus() {
                this.tag('BackButton').patch({
                    color: 0xFFFFFFFF
                })
                this.tag('BackButton.Title').patch({
                    text: {
                        textColor: 0xFF000000
                    }
                })
            }
            _handleDown(){
                this._setState("SignInButton")
            }
            $exit() {
                this._unfocus()
            }
          },
        ]
    }
}
