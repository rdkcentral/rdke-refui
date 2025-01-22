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
import { Lightning, Utils, Router, Language } from '@lightningjs/sdk'
import VideoAndAudioItem from '../../items/VideoAndAudioItem'
import AppApi from '../../api/AppApi.js';

/**
 * Class for HDMI Output Screen.
 */
var appApi = new AppApi();
export default class HdmiOutputScreen extends Lightning.Component {

    pageTransition() {
        return 'left'
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Audio  Output Mode'));
    }

    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xCC000000,
            HdmiOutputScreenContents: {
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
                Loader: {
                    x: 740,
                    y: 340,
                    w: 90,
                    h: 90,
                    mount: 0.5,
                    zIndex: 4,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: true,
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

    _unfocus() {
        if (this.loadingAnimation.isPlaying()) {
            this.loadingAnimation.stop()
        }
    }
    _init() {
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        })
    }



    _focus() {
        this.loadingAnimation.start()
        let options = []
        appApi.getSoundMode()
            .then(result => {
                appApi.getSupportedAudioModes()
                    .then(res => {
                        options = [...res.supportedAudioModes]
                        this.tag('HdmiOutputScreenContents').h = options.length * 90
                        this.tag('HdmiOutputScreenContents.List').h = options.length * 90
                        this.tag('HdmiOutputScreenContents.List').items = options.map((item, index) => {
                            return {
                                ref: 'Option' + index,
                                w: 1920 - 300,
                                h: 90,
                                type: VideoAndAudioItem,
                                isTicked: (result.soundMode === item) ? true : false,
                                item: item,
                                videoElement: false
                            }
                        })
                        this.loadingAnimation.stop()
                        this.tag('Loader').visible = false
                        this._setState("Options")
                    })
                    .catch(err => {
                        console.log('error', err)
                    })
            })
            .catch(err => {
                console.log('error', JSON.stringify(err))
            })
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings/audio')
        }
    }


    static _states() {
        return [
            class Options extends this{
                _getFocused() {
                    return this.tag('HdmiOutputScreenContents.List').element
                }
                _handleDown() {
                    this.tag('HdmiOutputScreenContents.List').setNext()
                }
                _handleUp() {
                    this.tag('HdmiOutputScreenContents.List').setPrevious()
                }
            },
        ]
    }
}
