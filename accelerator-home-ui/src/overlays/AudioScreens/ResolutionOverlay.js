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
import { Lightning, Utils, Storage } from '@lightningjs/sdk'
import VideoAndAudioItem from '../../items/VideoAndAudioItem'
import AppApi from '../../api/AppApi'
import thunderJS from 'ThunderJS';
import { CONFIG, GLOBALS} from '../../Config/Config'
import FireBoltApi from '../../api/firebolt/FireBoltApi';

const thunder = thunderJS(CONFIG.thunderConfig)

/**
 * Class for Resolution Screen.
 */

export default class ResolutionScreen extends Lightning.Component {
    static _template() {
        return {
            ResolutionScreenContents: {
                x: 200,
                y: 275,
                List: {
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -6,
                },
                Loader: {
                    x: 740,
                    y: 340,
                    w: 90,
                    h: 90,
                    mount: 0.5,
                    zIndex: 4,
                    src: Utils.asset("images/settings/Loading.png")
                },
            },

        }
    }



    _firstEnable() {
        this.appApi = new AppApi();
        this.appApi.activateDisplaySettings();
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        });

        thunder.on('org.rdk.DisplaySettings', 'resolutionPreChange', () => {
            console.log(new Date().toISOString() + " ResolutionOverlay got resolutionPreChange");
            Storage.set("ResolutionChangeInProgress", true);
        })

        thunder.on('org.rdk.DisplaySettings', 'resolutionChanged', notification => {
            console.log(new Date().toISOString() + " ResolutionOverlay got resolutionChanged");
            const items = this.tag('List').items
            items.forEach(element => {
                element.tag('Item.Tick').visible = false
                if (element._item === notification.resolution) {
                    element.tag('Item.Tick').visible = true
                }
            });
            Storage.set("ResolutionChangeInProgress", false);
        })
    }

    _unfocus() {
        if (this.loadingAnimation.isPlaying()) {
            this.loadingAnimation.stop()
        }
    }

    _focus() {
        this.loadingAnimation.start()
        let options = []
        let sIndex = 0;
        this.appApi.getResolution().then(resolution => {
            this.appApi.getSupportedResolutions().then(res => {
                options = [...res]
                this.tag('ResolutionScreenContents').h = options.length * 90
                this.tag('ResolutionScreenContents.List').h = options.length * 90
                this.tag('List').items = options.map((item, index) => {
                    let bool = false;
                    if (resolution === item) {
                        bool = true;
                        sIndex = index;
                    }
                    return {
                        ref: 'Option' + index,
                        w: 1920 - 300,
                        h: 90,
                        type: VideoAndAudioItem,
                        isTicked: bool,
                        item: item,
                        videoElement: true,
                    }
                })
                this.loadingAnimation.stop()
                this.tag('Loader').visible = false
                this.tag('List').setIndex(sIndex)
                this._setState("Options")
            }).catch(err => {
                console.log(`error while fetching the supported resolution ${err}`);
            })
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

            },
        ]
    }
}
