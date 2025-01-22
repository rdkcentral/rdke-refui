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
import { Lightning, Router, Utils, Language, Storage } from '@lightningjs/sdk'
import { CONFIG, GLOBALS } from '../Config/Config'
import ThunderJS from 'ThunderJS'
import AlexaApi from '../api/AlexaApi'
import { Metrics } from '@firebolt-js/sdk'

var thunder = ThunderJS(CONFIG.thunderConfig);

export default class CodeScreen extends Lightning.Component {
    static _template() {
        return {
            Wrapper: {
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
                            text: Language.translate("Back"),
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                            textColor: 0xFF000000,
                            fontStyle: 'bold'
                        },
                    },
                    visible: true,
                },
                Alexa: {
                    x: 1050,
                    y: 250,
                    Logo: {
                        h: 220,
                        w: 442,
                        x: 135,
                        mountX: 1,
                        y: 200,
                        mountY: 0.5,
                        src: Utils.asset('/images/apps/AlexaBadge.png'),
                    },
                    Description: {
                        x: -70,
                        y: 380,
                        mount: 0.5,
                        text: {
                            text: ``,
                            fontFace: CONFIG.language.font,
                            fontSize: 32,
                            textColor: 0xFFF9F9F9,
                            fontStyle: 'normal',
                            wordWrap: true,
                            wordWrapWidth: 800,
                        },
                    },
                    Description2: {
                        x: -100,
                        y: 500,
                        mount: 0.5,
                        text: {
                            text: Language.translate("Loading Code") + "...",
                            fontFace: CONFIG.language.font,
                            fontSize: 32,
                            textColor: 0xFF00CAFF,
                            fontStyle: 'normal',
                            wordWrap: true,
                            wordWrapWidth: 800,
                        },
                        visible: true
                    },
                },
            }
        }
    }

    _init() {
        this._setState('Description')
    }
    _focus() {
        if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
            thunder.Controller.activate({ callsign: "org.rdk.VoiceControl" }).then(res => {
                if (Storage.get("alexaOTPReset")) {
                    if(GLOBALS.AlexaAvsstatus){AlexaApi.get().resetAVSCredentials();}
                    Storage.remove("alexaOTPReset");
                }
                thunder.on("org.rdk.VoiceControl", 'onServerMessage', notification => {
                    console.log("VoiceControl.onServerMessage Notification: ", notification)
                    this.VoiceControlData = notification
                    if (notification.xr_speech_avs.url != undefined) {
                        this.tag('Description').text.text = Language.translate('Enter the code at') + ` ${notification.xr_speech_avs.url}`
                    } else {
                        this.tag('Description').text.text = Language.translate('Fetching authorization code')
                    }
                    this.tag("Description2").visible = true
                    if (notification.xr_speech_avs.code != undefined) {
                        this.tag("Description2").text.text = `${notification.xr_speech_avs.code}`
                    } else {
                        this.tag("Description2").text.text = Language.translate('Please wait')
                    }
                    if (notification.xr_speech_avs.state === "refreshed") {
                        // DAB Demo Work Around - show Alexa Error screens only after Auth is succeeded.
                        AlexaApi.get().setAlexaAuthStatus("AlexaHandleError");
                        AlexaApi.get().enableSmartScreen();
                        Router.navigate("SuccessScreen");
                    }
                    else if ((notification.xr_speech_avs.state === "uninitialized") || (notification.xr_speech_avs.state === "authorizing")) {
                        console.log("notification state is uninitialised")
                        AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending")
                    } else if (notification.xr_speech_avs.state === "unrecoverable error") {
                        console.log("notification state is unrecoverable error")
                        // Could be AUTH token Timeout; refresh it.
                        Router.navigate("FailureScreen")
                    }
                })
            }).catch(err => {
                console.log("VoiceControl Plugin Activation ERROR!: ", err)
                Metrics.error(Metrics.ErrorType.OTHER, 'PluginError', "Thunder Controller.activate Voice Error"+JSON.stringify(err), false, null)
            })
            this._setState('Description')
        }
    }

    _active() {
        this._setState('Description')
    }

    static _states() {
        return [
            class Description extends this{
                $enter() {
                    this._setState("Description")
                }
                _handleUp() {
                    this._setState("BackButton")
                }
                $exit() {
                    this.tag('Description')
                }
            },
            class BackButton extends this{
                $enter() {
                    this.tag("BackButton")
                    this._focus()
                }
                _handleEnter() {
                    if (!Router.isNavigating()) {
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
                $exit() {
                    this._unfocus()
                }
            }
        ]
    }
}
