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
import { Lightning } from '@lightningjs/sdk'
import AppApi from '../../api/AppApi.js';
import AudioOutputItem from "../../items/AudioOutputItem"
/**
 * Class for Resolution Screen.
 */

export default class AudioOutputScreen extends Lightning.Component {
    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            AudioOutputScreenContents: {
                x: 200,
                y: 275,
                List: {
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                },
            }
        }
    }

    $resetPrevTickObject(prevTicObject) {
        if (!this.prevTicOb) {
            this.prevTicOb = prevTicObject;

        }
        else {
            this.prevTicOb.tag("Item.Tick").visible = false;

            this.prevTicOb = prevTicObject;

        }
    }

    _init() {
        this.appApi = new AppApi();
    }


    _focus() {
        this.appApi.getConnectedAudioPorts().then(res => {
            let options = [...res.connectedAudioPorts];
            this.tag('AudioOutputScreenContents').h = options.length * 90
            this.tag('AudioOutputScreenContents.List').h = options.length * 90
            this.tag('AudioOutputScreenContents.List').items = options.map((item, index) => {
                return {
                    ref: 'Option' + index,
                    w: 1920 - 300,
                    h: 90,
                    type: AudioOutputItem,
                    item: item
                }
            })
            this._setState("Options");
        }).catch(err => {
            console.log(`Error while getting Connected AudioPorts :${err}`);
        })
    }


    static _states() {
        return [
            class Options extends this{
                _getFocused() {
                    return this.tag('List').element
                }
                _handleDown() {
                    this.tag('List').setNext()
                }
                _handleUp() {
                    this.tag('List').setPrevious()
                }
                _handleEnter() {
                    // enable the tick mark in VideoAudioItem.js
                    // this.fireAncestors('$updateResolution', "current resolution") //to update the resolution value on Video Screen
                }
            }
        ]
    }
}
