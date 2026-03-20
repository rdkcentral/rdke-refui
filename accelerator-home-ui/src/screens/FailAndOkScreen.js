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
import { Language, Lightning, Router } from "@lightningjs/sdk";
import { CONFIG } from '../Config/Config'

const errorTitle = 'Error Title'
const errorMsg = 'Error Message'
export default class FailAndOkScreen extends Lightning.Component {

    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    notify(args) {
        this.LOG("notify args: " + JSON.stringify(args))
        if (args.title && args.msg) {
            this.tag('FailScreen.Title').text.text = args.title
            this.tag('FailScreen.Message').text.text = args.msg
        }
    }

    pageTransition() {
        return 'left'
    }

    _focus() {
        this.LOG("FailAndOkScreen _focus() called, alpha before: " + this.alpha)
        this.alpha = 1
        this.LOG("FailAndOkScreen _focus() alpha set to 1")
        this.tag('FailScreen.OkButton').color = CONFIG.theme.hex
        this.tag('FailScreen.OkButton.OkLabel').text.textColor = 0xFFFFFFFF
    }

    _unfocus() {
        this.alpha = 0
        this.tag('FailScreen.Title').text.text = errorTitle
        this.tag('FailScreen.Message').text.text = errorMsg
        this.tag('FailScreen.OkButton').color = 0xFFFFFFFF
        this.tag('FailScreen.OkButton.OkLabel').text.textColor = 0xFF000000
    }

    static _template() {
        return {
            alpha: 0,
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xcc000000,
            FailScreen: {
                x: 960,
                y: 300,
                Title: {
                    mountX: 0.5,
                    text: {
                        text: errorTitle,
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Message: {
                    x: 0,
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: errorMsg,
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                OkButton: {
                    x: 0, y: 200, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                    OkLabel: {
                        x: 100,
                        y: 25,
                        mount: 0.5,
                        text: {
                            text: Language.translate("OK"),
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                            textColor: 0xFF000000,
                        },
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            },
        };
    }

    _handleEnter() {
        Router.focusPage()
    }

    _handleBack() {
        Router.focusPage()
    }

}
