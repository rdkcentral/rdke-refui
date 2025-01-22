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

import { Lightning, Registry, Utils, Storage } from "@lightningjs/sdk";
import AppApi from "../../api/AppApi";
import { CONFIG } from "../../Config/Config";

export default class Volume extends Lightning.Component {
    static _template() {
        return {
            rect: true, w: 1920, h: 320, color: 0xFF000000, y: -320, alpha: 0.9,
            transitions: {
                y: { duration: .3, timingFunction: 'cubic-bezier(0.17, 0.9, 0.32, 1.3)' },
                h: { duration: .3, timingFunction: 'cubic-bezier(0.17, 0.9, 0.32, 1.3)' }
            },
            Overlay: {
                Line: {
                    y: 317,
                    h: 3,
                    w: 1920,
                    rect: true,
                    color: 0xffffffff
                }
            },
            VolumeInfo: {
                alpha: 1,
                zIndex: 2,
                y: 160,
                x: 960,
                mountX: 0.5,
                mountY: 0.5,
                h: 100,
                w: 100,
                src: Utils.asset('/images/volume/Volume.png'),
                Text: {
                    x: 100,
                    y: 0,
                    text: {
                        text: 0,
                        fontSize: 80,
                        fontFace: CONFIG.language.font
                    }
                },
            }
        }
    }

    _firstEnable() {
        this.appApi = new AppApi()
        this.volTimeout = null
        this.volume = 0
        this.getMuteStatus();
        console.log("_firstEnable this.mute-", this.mute);
    }

    async onVolumeKeyDown() {
        this.volume = await this.getVolume();
        this.focus();
        console.log("onVolumeKeyDown this.mute-", this.mute);
        this._updateIcon(this.mute)
        this._updateText(this.volume);
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this.unfocus()
        }, 2000)
        if (this.volume > 0) {
            this.volume -= 5;
            if (this.setVolume(this.volume)) {
                this._updateText(this.volume)
            }
        }
    }

    async onVolumeKeyUp() {
        this.volume = await this.getVolume();
        this.focus();
        this._updateIcon(this.mute)
        this._updateText(this.volume);
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this.unfocus()
        }, 2000)
        if (this.volume < 100) {
            this.volume += 5;
            if (this.setVolume(this.volume)) {
                if(this.mute) {
                    this._updateIcon((!this.mute))
                    this.setMute(!this.mute)
                }
                this._updateText(this.volume)
            }
        }
    }

    async onVolumeMute(requestedState = undefined) {
        this.volume = await this.getVolume();
        await this.getMuteStatus(); // to update this.mute
        this.focus();
        this._updateText(this.volume);
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this.unfocus()
        }, 2000)
        if (this.setMute(((requestedState != undefined) ? requestedState : !this.mute))) {
            this._updateIcon(((requestedState != undefined) ? requestedState : !this.mute))
        }
    }

    async onVolumeChanged(v= false) {
        this.volume = await this.getVolume();
        this.getMuteStatus()
        this.focus();
        if(v) {
            this._updateIcon(!v)
            this.setMute(!v)
        }
        this._updateText(this.volume);
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.volTimeout = Registry.setTimeout(() => {
            this.unfocus()
        }, 2000)
        this._updateText(this.volume)
    }

    setVolume = async (val) => {
        let audioport = await this.getAudioPorts()
        for (let i = 0; i < audioport.length; i++) {
            if ((Storage.get("deviceType") == "tv" && audioport[i].startsWith("SPEAKER")) ||
                (Storage.get("deviceType") != "tv" && audioport[i].startsWith("HDMI"))) {
                await this.appApi.setVolumeLevel(audioport[i], val)
            }
        }
        return true;
    }

    setMute = async (val) => {
        let audioport = await this.getAudioPorts()
        for (let i = 0; i < audioport.length; i++) {
            if ((Storage.get("deviceType") == "tv" && audioport[i].startsWith("SPEAKER")) ||
                (Storage.get("deviceType") != "tv" && audioport[i].startsWith("HDMI"))) {
                this.appApi.audio_mute(audioport[i], val)
            }
        }
        return true;
    }

    getMuteStatus = async () => {
        let audioport = await this.getAudioPorts()
        for (let i = 0; i < audioport.length; i++) {
            if ((Storage.get("deviceType") == "tv" && audioport[i].startsWith("SPEAKER")) ||
                (Storage.get("deviceType") != "tv" && audioport[i].startsWith("HDMI"))) {
                this.appApi.getMuted(audioport[i]).then(result => {
                    if (result.success) {
                        this.mute = result.muted;
                    }
                });
            }
        }
        return true;
    }

    _updateText(val) {
        this.tag('Text').text.text = val
    }

    _updateIcon(check) {
        if (check) {
            this.tag('VolumeInfo').src = Utils.asset('images/volume/Volume_Mute.png');
        } else {
            this.tag('VolumeInfo').src = Utils.asset('/images/volume/Volume.png');
        }
    }

    focus() { //the volume widget would never be actually focused
        this.patch({
            smooth: {
                y: -30
            }
        })
    }

    unfocus() { //the volume widget would never be actually focused
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.patch({
            smooth: {
                y: -320
            }
        })
    }

    getAudioPorts() {
        return new Promise((resolve, reject) => {
            this.appApi.getConnectedAudioPorts().then(res => {
                resolve(res.connectedAudioPorts)
            }).catch(err => {
                console.error('Volume getConnectedAudioPorts error:', JSON.stringify(err, 3, null))
                reject(false)
            })
        })
    }

    updateIcon(audioport) {
        return new Promise((resolve, reject) => {
            this.appApi.getMuted(audioport).then(result => {
                this.mute = result.muted;
                this._updateIcon(this.mute);
                resolve(true)
            }).catch(err => {
                console.error('Volume updateIcon error:', JSON.stringify(err, 3, null))
                reject(false)
            });
        })
    }

    getVolume() {
        return new Promise(async (resolve, reject) => {
            let audioport = await this.getAudioPorts()
            /* Returns an array. */
            for (let i = 0; i < audioport.length; i++) {
                if ((Storage.get("deviceType") == "tv" && audioport[i].startsWith("SPEAKER")) ||
                    (Storage.get("deviceType") != "tv" && audioport[i].startsWith("HDMI"))) {
                    this.appApi.getVolumeLevel(audioport[i]).then(async res1 => {
                        await this.updateIcon(audioport[i])
                        if (res1) {
                            resolve(parseInt(res1.volumeLevel));
                        }
                    }).catch(err => {
                        console.error('Volume getVolumeLevel error:', JSON.stringify(err, 3, null))
                        reject(false)
                    })
                }
            }
        })
    }
}
