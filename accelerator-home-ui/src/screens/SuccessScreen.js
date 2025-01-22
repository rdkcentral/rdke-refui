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
import { Language, Lightning, Registry, Router, Utils } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config'
import AlexaApi from '../api/AlexaApi.js';

export default class SuccessScreen extends Lightning.Component {
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
                            text: Language.translate("You are ready to use alexa. Here are some things to try"),
                            fontFace: CONFIG.language.font,
                            fontSize: 32,
                            textColor: 0xFFF9F9F9,
                            fontStyle: 'normal',
                            wordWrap: true,
                            wordWrapWidth: 800,
                        },
                    },
                    Box1: {
                        x: -600, y: 500, mountX: 0.5, h: 60, w: 420, rect: true, color: 0xFF00CAFF,
                        Title: {
                            x: 200,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Play some jazz music"),
                                fontFace: CONFIG.language.font,
                                fontSize: 28,
                                textColor: 0xFF232F3E,
                                fontStyle: 'italic',
                                borderRadius: 100
                            },
                        },
                        visible: true,
                    },
                    Box2: {
                        x: -100, y: 500, mountX: 0.5, h: 60, w: 420, rect: true, color: 0xFF00CAFF,
                        Title: {
                            x: 200,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Play my Flash Briefing"),
                                fontFace: CONFIG.language.font,
                                fontSize: 28,
                                textColor: 0xFF232F3E,
                                fontStyle: 'italic',
                                borderRadius: 100
                            },
                        },
                        visible: true,
                    },
                    Box3: {
                        x: 440, y: 500, mountX: 0.5, h: 60, w: 500, rect: true, color: 0xFF00CAFF,
                        Title: {
                            x: 250,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("What's your favourite movie?"),
                                fontFace: CONFIG.language.font,
                                fontSize: 28,
                                textColor: 0xFF232F3E,
                                fontStyle: 'italic',
                                borderRadius: 100
                            },
                        },
                        visible: true,
                    },
                },
                DoneButton: {
                    x: 1700, y: 60, w: 150, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                    Title: {
                        x: 75,
                        y: 30,
                        mount: 0.5,
                        text: {
                            text: Language.translate("Finished"),
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

    _focus() {
        Registry.clear();
        this._setState('DoneButton')
    }
    _active() {
        this._setState('DoneButton')
    }

    static _states() {
        return [
            class DoneButton extends this{
                $enter() {
                    this.tag("DoneButton")
                }
                _handleEnter() {
                    AlexaApi.get().enableSmartScreen()
                    Registry.setTimeout(() => {
                        Router.navigate('menu')
                    }, (Router.isNavigating() ? 20 : 0));
                }
                _focus() {
                    this.tag('DoneButton').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('DoneButton.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('DoneButton').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('DoneButton.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }

                $exit() {
                    //this.show()
                    this.tag('DoneButton')
                }
            }
        ]
    }
}
