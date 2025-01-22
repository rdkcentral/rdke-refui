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
import { Language, Registry, Router, Lightning } from "@lightningjs/sdk";
import { CONFIG } from "../../Config/Config";

const errorTitle = 'Error Title'
const errorMsg = 'Error Message'
export default class FailComponent extends Lightning.Component {

    notify(args) {
        console.log(args)
        if (args.title && args.msg) {
            this.tag('FailComponent.Title').text.text = args.title
            this.tag('FailComponent.Message').text.text = Language.translate(args.msg)
        }
        if(args.count) {
            this.timeout = args.count;
        }
        else{
            this.timeout = 5
        }
    }

    _unfocus() {
        this.tag('FailComponent.Title').text.text = errorTitle
        this.tag('FailComponent.Message').text.text = errorMsg
    }

    _active() {
        this.tag('Timer').text.text =""
        this.initTimer()
    }
    initTimer() {
        this.timeInterval = Registry.setInterval(() => {
            this.tag('Timer').text.text = this.timeout >= 10 ? `0:${this.timeout}` : `0:0${this.timeout}`
            if (this.timeout > 0) {
                --this.timeout
            }
            else {
                Router.focusPage();
            }
        }, 1000)
    }
    _inactive() {
        if (this.timeInterval) {
            Registry.clearInterval(this.timeInterval)
        }
    }
    static _template() {
        return {
            FailComponent: {
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
                RectangleDefault: {
                    x: 0, y: 200, w: 200, mountX: 0.5, h: 50, rect: true,color: 0x000000,
                    Timer: {
                        x: 100,
                        y: 25,
                        mount: 0.5,
                        text: {
                            text: "",
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        },
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            },

        };
    }

}