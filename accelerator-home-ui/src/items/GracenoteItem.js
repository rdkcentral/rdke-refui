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
import { Lightning, Utils } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config';

/**
 * Class to render items in main view.
 */
export default class GracenoteItem extends Lightning.Component {
    /**
     * Function to render various elements in the main view item.
     */
    static _template() {
        return {
            Item: {
                Shadow: {
                    alpha: 0,
                },
                y: 20,
                Image: {
                },
                Info: {},
            },
        }
    }

    _init() {
        let imgUrl = ((this.data.program.preferredImage.uri).replace("w=1280&","w=480&")).replace("&h=720","&h=270")
        this.tag('Shadow').patch({
            color: CONFIG.theme.hex,
            rect: true,
            h: this.h + this.bar * 2,
            w: this.w,
            x: this.x,
            y: this.y - this.bar
        })
        this.tag('Image').patch({
            rtt: true,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            src: Utils.proxyUrl('http://developer.tmsimg.com/' + imgUrl + '&api_key=' + this.key),
            scale: this.unfocus,
        });

        /* Used static data for develpment purpose ,
        it wil replaced with Dynamic data once implimetation is completed.*/
        this.tag('Info').patch({
            x: this.x - 20,
            y: this.y + this.h + 20,
            w: this.w,
            h: 140,
            alpha: 0,
            PlayIcon: {
                Label: {
                    x: this.idx === 0 ? this.x + 20 : this.x,
                    y: this.y + 10,
                    text: {
                        fontFace: CONFIG.language.font,
                        text: this.data.program.title,
                        fontSize: 35,
                        maxLines: 1,
                        wordWrapWidth: this.w
                    },
                }
            },
        })

    }

    /**
     * Function to change properties of item during focus.
     */
    _focus() {
        this.tag('Image').patch({
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            zIndex: 1,
            scale: this.focus,
        })
        this.tag('Info').alpha = 1
        this.tag('Item').patch({
            zIndex: 2,
        })
        this.tag('Shadow').patch({
            smooth: {
                scale: [this.focus, { timingFunction: 'ease', duration: 0.7 }],
                alpha: 1,
            }
        });
    }

    /**
     * Function to change properties of item during unfocus.
     */
    _unfocus() {
        this.tag('Image').patch({
            w: this.w,
            h: this.h,
            scale: this.unfocus,
        })
        this.tag('Item').patch({
            zIndex: 0,
        })
        this.tag('Info').alpha = 0
        this.tag('Shadow').patch({
            smooth: {
                alpha: 0,
                scale: [this.unfocus, { timingFunction: 'ease', duration: 0.7 }]
            }
        });
    }
}
