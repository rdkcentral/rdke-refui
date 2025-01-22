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
import { Lightning, Router, Language } from '@lightningjs/sdk'
import AppApi from '../api/AppApi'
import { CONFIG } from '../Config/Config'
import AlexaApi from '../api/AlexaApi'

/**
 * Class for Reboot Confirmation Screen.
 */
export default class AlexaConfirmationScreen extends Lightning.Component {

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            w: 1920,
            h: 2000,
            rect: true,
            color: 0xCC000000,
            RebootScreen: {
                x: 950,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Exit Alexa"),
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
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Alexa will be disabled, are you sure to exit?"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                Buttons: {
                    x: 100, y: 200, w: 440, mountX: 0.5, h: 50,
                    YesButton: {
                        x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Yes"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                    NoButton: {
                        x: 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("No"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                }
            }
        }
    }

    _focus() {
        this._setState('NoButton')
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.back()
        }
    }

    static _states() {
        return [
            class YesButton extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    AlexaApi.get().setAlexaAuthStatus("AlexaUserDenied")
                    Router.navigate("menu")
                }
                _handleRight() {
                    this._setState('NoButton')
                }
                _focus() {
                    this.tag('YesButton').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('YesButton.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('YesButton').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('YesButton.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class NoButton extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.back()
                    }
                }
                _handleLeft() {
                    this._setState('YesButton')
                }
                _focus() {
                    this.tag('NoButton').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('NoButton.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('NoButton').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('NoButton.Title').patch({
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
