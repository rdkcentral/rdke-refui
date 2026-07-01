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
import { CONFIG, GLOBALS } from '../Config/Config'
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
                },
                Legend: {
                    x: -100,
                    y: 620,
                    mountX: 0.5,
                    Title: {
                        x: -165,
                        y: 0,
                        text: {
                            text: Language.translate('Voice Activity Legend'),
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                            textColor: 0xFFE0E0E0,
                            fontStyle: 'normal'
                        },
                    },
                    SessionState: {
                        y: 42,
                        Icon: {
                            x: -148,
                            y: 14,
                            Ring: {
                                w: 30,
                                h: 30,
                                mount: 0.5,
                                rect: true,
                                color: CONFIG.theme.hex,
                                shader: { type: Lightning.shaders.RoundedRectangle, radius: 15 },
                            },
                            Mic: {
                                w: 17,
                                h: 17,
                                mount: 0.5,
                                src: Utils.asset('images/topPanel/microphone.png'),
                            },
                        },
                        Label: {
                            x: -130,
                            text: {
                                text: Language.translate('In a voice session'),
                                fontFace: CONFIG.language.font,
                                fontSize: 20,
                                textColor: 0xFFF9F9F9,
                                fontStyle: 'normal'
                            },
                        }
                    },
                    StreamState: {
                        y: 78,
                        Icon: {
                            x: -148,
                            y: 14,
                            Ring: {
                                w: 30,
                                h: 30,
                                mount: 0.5,
                                rect: true,
                                color: 0xFF1E90FF,
                                shader: { type: Lightning.shaders.RoundedRectangle, radius: 15 },
                            },
                            Mic: {
                                w: 17,
                                h: 17,
                                mount: 0.5,
                                src: Utils.asset('images/topPanel/microphone.png'),
                            },
                        },
                        Label: {
                            x: -130,
                            text: {
                                text: Language.translate('Voice streaming'),
                                fontFace: CONFIG.language.font,
                                fontSize: 20,
                                textColor: 0xFFF9F9F9,
                                fontStyle: 'normal'
                            },
                        }
                    }
                }
            }
        }

        }

    }

    _init(){
        this._sessionLegendAnim = this.tag('Legend.SessionState.Icon.Ring').animation({
            duration: 1.2,
            repeat: -1,
            stopMethod: 'immediate',
            actions: [
                { p: 'scale', v: { 0: 1, 0.5: 1.14, 1: 1 } },
                { p: 'alpha', v: { 0: 1, 0.5: 0.72, 1: 1 } },
            ],
        })

        this._streamLegendAnim = this.tag('Legend.StreamState.Icon.Ring').animation({
            duration: 0.55,
            repeat: -1,
            stopMethod: 'immediate',
            actions: [
                { p: 'scale', v: { 0: 1, 0.45: 1.28, 1: 1 } },
                { p: 'alpha', v: { 0: 1, 0.45: 0.45, 1: 1 } },
            ],
        })

        this._sessionLegendAnim.start()
        this._streamLegendAnim.start()
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
                    GLOBALS._voiceEnabled = true
                    const endpointResult = await voiceApi.configureCobaltAOWSEndPoint()
                    if (endpointResult === false) {
                        console.error("Error enabling YouTube Audio Sharing endpoint: configuration failed.")
                    }
                    await voiceApi.configureVoice({ "enable": true })
                    Router.navigate("menu")
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
