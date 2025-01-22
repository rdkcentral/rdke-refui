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

import { Lightning, Router } from "@lightningjs/sdk";

const defaultImage = 'static/images/usb/USB_Photo_Placeholder.jpg'
export default class ImageViewer extends Lightning.Component {

    set params(args) {
        this.currentIndex = args.currentIndex
        this.data = args.list
        this.cwd = args.cwd
        if (this.data != undefined && this.data.length > 1) {
            this.tag('Controls').alpha = 1
        } else {
            this.tag('Controls').alpha = 0
        }
        if (args.src) {
            this.tag('Image').texture.src = args.src
        }
    }

    _handleRight() {
        if (this.data[this.currentIndex + 1]) {
            this.currentIndex += 1
            this.tag('Image').texture.src = this.data[this.currentIndex].data.uri
        }
    }

    _handleLeft() {
        if (this.data[this.currentIndex - 1]) {
            this.currentIndex -= 1
            this.tag('Image').texture.src = this.data[this.currentIndex].data.uri
        }
    }

    _handleBack() {
        if (this.cwd) {
            Router.navigate('usb', {
                currentIndex: this.currentIndex,
                cwd: this.cwd
            })
        } else {
            Router.back()
        }
    }

    _unfocus() {
        this.tag('Image').texture.src = defaultImage
    }

    static _template() {
        return {
            h: 1080,
            w: 1920,
            rect: true,
            color: 0xff000000,
            zIndex: 2,
            visible: false,
            Image: {
                x: 960,
                y: 540,
                mount: 0.5,
                texture: {
                    type: Lightning.textures.ImageTexture,
                    src: defaultImage,
                    resizeMode: { type: 'contain', w: 1920, h: 1080 },
                },
            },
            Controls: {
                x: 960,
                y: 930,
                h: 75,
                w: 100,
                Previous: {
                    x: -50,
                    w: 75,
                    h: 75,
                    mount: 0.5,
                    texture: {
                        type: Lightning.textures.ImageTexture,
                        src: 'static/images/Media Player/Icon_Back_White_16k.png'
                    }
                },
                Next: {
                    x: 50,
                    w: 75,
                    h: 75,
                    mount: 0.5,
                    texture: {
                        type: Lightning.textures.ImageTexture,
                        src: 'static/images/Media Player/Icon_Next_White_16k.png'
                    }
                },
            }
        }
    }
}