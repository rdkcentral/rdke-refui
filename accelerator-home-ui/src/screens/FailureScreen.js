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
import AlexaApi from '../api/AlexaApi'
import AppApi from '../api/AppApi';
import RDKShellApis from '../api/RDKShellApis';
import ThunderJS from "ThunderJS";
import { Metrics } from '@firebolt-js/sdk';

var thunder = ThunderJS(CONFIG.thunderConfig);

export default class FailureScreen extends Lightning.Component {
    static _template() {
        return {
            Wrapper: {
                w: 1920,
                h: 1080,
                rect: true,
                color: 0xff000000,
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
                            text: Language.translate('Alexa something went wrong message'),
                            fontFace: CONFIG.language.font,
                            fontSize: 32,
                            textColor: 0xFFF9F9F9,
                            fontStyle: 'normal',
                            wordWrap: true,
                            wordWrapWidth: 800,
                        },
                    }
                },
                RetryButton: {
                    x: 1700, y: 60, w: 150, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                    Title: {
                        x: 75,
                        y: 30,
                        mount: 0.5,
                        text: {
                            text: Language.translate('Retry'),
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                            textColor: 0xFF000000,
                            fontStyle: 'bold'
                        },
                    },
                    visible: true,
                    alpha: 1
                },
            }
        }
    }

    _init() {
    }
    _focus() {
        this.appApi = new AppApi();
        if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
            this.tag('RetryButton.Title').patch({
                text: {
                    text: Language.translate("Dismiss")
                }
            })
        }
        this._setState('RetryButton')
    }
    _active() {
        this._setState('RetryButton')
    }
    static _states() {
        return [
            class RetryButton extends this{
                $enter() {
                    console.log("setState DoneButton CodeScreen")
                    this.tag("RetryButton")
                    this._focus()
                    this.tag('RetryButton.Title').text.textColor = CONFIG.theme.hex
                }
                _handleEnter() {
                    if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
                        if(GLOBALS.AlexaAvsstatus){
                        AlexaApi.get().resetAVSCredentials().then(() => {
                            console.log("avs credentials reseted")
                        })}
                        console.log("Current app: " + GLOBALS.topmostApp + ", moving the app to front")
                        RDKShellApis.moveToFront(GLOBALS.topmostApp)
                        RDKShellApis.setFocus(GLOBALS.topmostApp).catch((err) => {
                            Metrics.error(Metrics.ErrorType.OTHER, 'PluginError', "Thunder RDKshell set focus error" + JSON.stringify(err), false, null)
                        });
                    }
                    else {
                        if(GLOBALS.AlexaAvsstatus){
                        AlexaApi.get().resetAVSCredentials().then(async () => {
                            await Router.navigate('AlexaLoginScreen');
                        })
                    }
                    }
                }
                _focus() {
                    this.tag('RetryButton').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('RetryButton.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('RetryButton').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('RetryButton.Title').patch({
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
