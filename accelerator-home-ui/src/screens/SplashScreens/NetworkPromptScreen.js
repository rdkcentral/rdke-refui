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
import { Lightning, Utils, Router, Language, Registry } from '@lightningjs/sdk'
import { CONFIG } from '../../Config/Config'

/**
 * Class for Reboot Confirmation Screen.
 */
export default class NetworkPromptScreen extends Lightning.Component {
    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            PromptScreen: {
                x: 950,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Note"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 120,
                    InfoTitle: {
                        x: 0,
                        y: 0,
                        mountX: 0.5,
                        text: {
                            text: Language.translate("Ethernet cable is not connected"),
                            fontFace: CONFIG.language.font,
                            fontSize: 30,
                        },
                    },
                },
                Buttons: {
                    x: 200, y: 200, w: 440, mountX: 0.5, h: 50,
                    TryAgain: {
                        x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Try Again"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Loader: {
                    x: 0,
                    y: 150,
                    mountX: 0.5,
                    w: 90,
                    h: 90,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: false
                },
            }
        }
    }

    _focus() {
        this._setState('TryAgain')
    }

    _handleBack() {
        Registry.setTimeout(() => {
            Router.navigate('splash/networkPrompt')
        }, Router.isNavigating() ? 20 : 0);
    }

    static _states() {
        return [
            class TryAgain extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    Registry.setTimeout(() => {
                        Router.navigate('splash/network')
                    }, Router.isNavigating() ? 20 : 0);
                }
                _focus() {
                    this.tag('TryAgain').patch({ color: CONFIG.theme.hex })
                    this.tag('TryAgain.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('TryAgain').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('TryAgain.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
        ]
    }
}
