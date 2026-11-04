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
import CECApi, { CEC_KEYCODES } from "../../api/CECApi";
import { CONFIG, GLOBALS } from "../../Config/Config";
import Keymap from "../../Config/Keymap";

export default class Volume extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

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

    _init() {
        this.appApi = new AppApi()
        this.cecApi = new CECApi()
        this.volTimeout = null
        this.volume = 0
        // Prime the shared CEC device-list cache (see CECApi.getCachedDeviceList)
        // so it's warm by the time a fallback key needs to be sent.
        this.cecApi.getCachedDeviceList();
        this.getMuteStatus();
        this.LOG("_init this.mute-" + JSON.stringify(this.mute));
    }

    async onVolumeKeyDown() {
        try {
            this.volume = await this.getVolume();
            this.LOG("onVolumeKeyDown this.mute-" + JSON.stringify(this.mute));
            if (this.volume > 0) {
                const newVolume = Math.max(0, this.volume - 5);
                if (!await this.setVolume(newVolume)) {
                    throw new Error('setVolume failed for value:' + newVolume);
                }
                this.volume = newVolume;
            } else if (!await this.setVolume(this.volume)) {
                throw new Error('setVolume failed for value:' + this.volume);
            }
            // Only show the overlay once the IP call has actually succeeded,
            // to avoid a brief flash-in/flash-out when it fails and we fall
            // back to CEC instead.
            this.focus();
            this._updateIcon(this.mute)
            this._updateText(this.volume);
            this.volTimeout && Registry.clearTimeout(this.volTimeout)
            this.volTimeout = Registry.setTimeout(() => {
                this.unfocus()
            }, 2000)
            if (this.mute) {
                this._updateIcon((!this.mute))
                this.setMute(!this.mute)
                this._updateText(this.volume)
            }
        } catch (err) {
            this._onVolumeError(err, CEC_KEYCODES.VOLUME_DOWN, 'onVolumeKeyDown');
        }
    }

    async onVolumeKeyUp() {
        try {
            this.volume = await this.getVolume();
            this.LOG("onVolumeKeyUp this.mute-" + JSON.stringify(this.mute));
            if (this.volume < 100) {
                const newVolume = Math.min(100, this.volume + 5);
                if (!await this.setVolume(newVolume)) {
                    throw new Error('setVolume failed for value:' + newVolume);
                }
                this.volume = newVolume;
            } else if (!await this.setVolume(this.volume)) {
                throw new Error('setVolume failed for value:' + this.volume);
            }
            // Only show the overlay once the IP call has actually succeeded,
            // to avoid a brief flash-in/flash-out when it fails and we fall
            // back to CEC instead.
            this.focus();
            this._updateIcon(this.mute)
            this._updateText(this.volume);
            this.volTimeout && Registry.clearTimeout(this.volTimeout)
            this.volTimeout = Registry.setTimeout(() => {
                this.unfocus()
            }, 2000)
            // Pressing volume up while muted should also unmute. The overlay is
            // already on screen with its auto-hide timeout running, so only the
            // icon needs to flip - and only once setMute has actually applied,
            // so we never show an unmuted icon for a device still muted.
            if (this.mute) {
                if (await this.setMute(false)) {
                    this._updateIcon(false)
                    this._updateText(this.volume)
                } else {
                    this.ERR('Volume onVolumeKeyUp unmute failed; keeping muted icon');
                }
            }
        } catch (err) {
            // Nothing was applied, so do not re-show the overlay here: the mute
            // handling above only runs on the success path. _onVolumeError
            // hides the overlay before handing control to the CEC fallback, and
            // re-focusing would leave a stale overlay (default 0 / last known
            // level) on screen with no auto-hide timeout.
            this._onVolumeError(err, CEC_KEYCODES.VOLUME_UP, 'onVolumeKeyUp');
        }
    }

    async onVolumeMute(requestedState = undefined) {
        try {
            this.volume = await this.getVolume();
            await this.getMuteStatus(); // to update this.mute
            const newMuteState = (requestedState != undefined) ? requestedState : !this.mute;
            if (!await this.setMute(newMuteState)) {
                throw new Error('setMute failed for value:' + newMuteState);
            }
            // Only show the overlay once the IP call has actually succeeded,
            // to avoid a brief flash-in/flash-out when it fails and we fall
            // back to CEC instead.
            this.focus();
            this._updateText(this.volume);
            this._updateIcon(newMuteState)
            this.volTimeout && Registry.clearTimeout(this.volTimeout)
            this.volTimeout = Registry.setTimeout(() => {
                this.unfocus()
            }, 2000)
        } catch (err) {
            this._onVolumeError(err, CEC_KEYCODES.MUTE, 'onVolumeMute');
        }
    }

    async onVolumeChanged(v= false) {
        try {
            this.volume = await this.getVolume();
            this.getMuteStatus()
            this.focus();
            this.LOG("onVolumeChanged v-" + JSON.stringify(v));
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
        } catch (err) {
            this._onVolumeError(err, undefined, 'onVolumeChanged');
        }
    }

    setVolume = async (val) => {
        const safeVolume = Number.parseInt(val, 10);
        if (Number.isNaN(safeVolume)) {
            this.WARN('Volume setVolume called with invalid value:' + JSON.stringify(val));
            return false;
        }

        let audioport;
        try {
            audioport = await this.getAudioPorts();
        } catch (err) {
            this.ERR('Volume setVolume getConnectedAudioPorts error:' + JSON.stringify(err, null, 3))
            return false;
        }

        let allSucceeded = true;
        let handledAnyPort = false;
        for (let i = 0; i < audioport.length; i++) {
            if ((GLOBALS.deviceType == "IpTv" && audioport[i].startsWith("SPEAKER")) ||
                (GLOBALS.deviceType != "IpTv" && audioport[i].startsWith("HDMI"))) {
                handledAnyPort = true;
                try {
                    const result = await this.appApi.setVolumeLevel(audioport[i], safeVolume);
                    if (!result || !result.success) {
                        this.ERR('Volume setVolume setVolumeLevel failed for port ' + audioport[i] + ':' + JSON.stringify(result));
                        allSucceeded = false;
                    }
                } catch (err) {
                    this.ERR('Volume setVolume setVolumeLevel error for port ' + audioport[i] + ':' + JSON.stringify(err, null, 3))
                    allSucceeded = false;
                }
            }
        }
        // An empty port list, or one with no port matching this device type,
        // means no volume command was ever sent. Report failure so the caller
        // does not show a state it never applied and still falls back to CEC.
        if (!handledAnyPort) {
            this.ERR('Volume setVolume found no compatible audio port in:' + JSON.stringify(audioport));
            return false;
        }
        return allSucceeded;
    }

    setMute = async (val) => {
        let audioport;
        try {
            audioport = await this.getAudioPorts();
        } catch (err) {
            this.ERR('Volume setMute getConnectedAudioPorts error:' + JSON.stringify(err, null, 3))
            return false;
        }

        let allSucceeded = true;
        let handledAnyPort = false;
        for (let i = 0; i < audioport.length; i++) {
            if ((GLOBALS.deviceType == "IpTv" && audioport[i].startsWith("SPEAKER")) ||
                (GLOBALS.deviceType != "IpTv" && audioport[i].startsWith("HDMI"))) {
                handledAnyPort = true;
                try {
                    const result = await this.appApi.audio_mute(audioport[i], val)
                    if (!result || !result.success) {
                        this.ERR('Volume setMute audio_mute failed for port ' + audioport[i] + ':' + JSON.stringify(result));
                        allSucceeded = false;
                    }
                } catch (err) {
                    this.ERR('Volume setMute audio_mute error for port ' + audioport[i] + ':' + JSON.stringify(err, null, 3))
                    allSucceeded = false;
                }
            }
        }
        // No matching port means no mute command was sent, so this.mute must not
        // be updated and the caller must treat it as a failure.
        if (!handledAnyPort) {
            this.ERR('Volume setMute found no compatible audio port in:' + JSON.stringify(audioport));
            return false;
        }
        if (allSucceeded) {
            this.mute = val;
        }
        return allSucceeded;
    }

    getMuteStatus = async () => {
        let audioport;
        try {
            audioport = await this.getAudioPorts()
        } catch (err) {
            this.ERR('Volume getMuteStatus getConnectedAudioPorts error:' + JSON.stringify(err, null, 3))
            return false;
        }
        let handledAnyPort = false;
        for (let i = 0; i < audioport.length; i++) {
            if ((GLOBALS.deviceType == "IpTv" && audioport[i].startsWith("SPEAKER")) ||
                (GLOBALS.deviceType != "IpTv" && audioport[i].startsWith("HDMI"))) {
                handledAnyPort = true;
                // Awaited so callers that rely on this.mute being fresh (e.g.
                // onVolumeMute) do not read a stale value from a race.
                try {
                    const result = await this.appApi.getMuted(audioport[i]);
                    if (result && result.success) {
                        this.mute = result.muted;
                    } else {
                        this.ERR('Volume getMuteStatus getMuted unsuccessful for port ' + audioport[i] + ':' + JSON.stringify(result));
                        return false;
                    }
                } catch (err) {
                    this.ERR('Volume getMuteStatus getMuted error for port ' + audioport[i] + ':' + JSON.stringify(err, null, 3))
                    return false;
                }
            }
        }
        if (!handledAnyPort) {
            this.ERR('Volume getMuteStatus found no compatible audio port in:' + JSON.stringify(audioport));
            return false;
        }
        return true;
    }

    _updateText(val) {
        this.tag('Text').text.text = val
    }

    // Shared failure handler for every IP audio control path (volume read,
    // volume write, mute read and mute write), so the message stays neutral and
    // the caller supplies the operation label that identifies what really failed.
    _onVolumeError(err, keyCode, operation = 'IP audio control') {
        this.ERR('Volume ' + operation + ' failed:' + (err && err.message ? err.message : JSON.stringify(err, null, 3)));
        // The IP call failed, so the overlay would be showing a volume/mute
        // state that was never actually applied. Hide it immediately instead of
        // leaving a stale/incorrect overlay on screen while we fall back to CEC.
        this.volTimeout && Registry.clearTimeout(this.volTimeout)
        this.unfocus();
        if (keyCode != undefined) {
            this._sendCecFallbackKey(keyCode);
        }
    }

    // Common method: on IP volume control failure, replay the key press to
    // every known CEC device. Device-list fetching/caching is handled
    // centrally in CECApi so all consumers share the same cache.
    _sendCecFallbackKey = async (keyCode) => {
        await this.cecApi.sendKeyPressEventToAllDevices(keyCode);
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
                this.ERR('Volume getConnectedAudioPorts error:' + JSON.stringify(err, null, 3))
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
                this.ERR('Volume updateIcon error:' + JSON.stringify(err, null, 3))
                reject(false)
            });
        })
    }

    // Rejects on any failure (port lookup, read error, unparsable level or no
    // matching port) instead of returning 0. 0 is a valid volume level, so it
    // must never be used as an error sentinel: callers rely on the rejection to
    // tell a genuine "volume is 0" apart from "we could not read the volume",
    // and to trigger the CEC fallback instead of writing a bogus value.
    getVolume() {
        return new Promise(async (resolve, reject) => {
            let audioport = []
            try {
                audioport = await this.getAudioPorts()
            } catch (err) {
                this.ERR('Volume getAudioPorts error:' + JSON.stringify(err, null, 3))
                reject(new Error('getVolume failed: unable to read connected audio ports'))
                return
            }
            /* Returns an array. */
            for (let i = 0; i < audioport.length; i++) {
                if ((GLOBALS.deviceType == "IpTv" && audioport[i].startsWith("SPEAKER")) ||
                    (GLOBALS.deviceType != "IpTv" && audioport[i].startsWith("HDMI"))) {
                    this.appApi.getVolumeLevel(audioport[i]).then(async res1 => {
                        if (!res1 || !res1.success) {
                            reject(new Error('getVolume failed: getVolumeLevel unsuccessful for port ' + audioport[i]));
                            return;
                        }
                        const level = Number.parseInt(res1.volumeLevel, 10);
                        if (Number.isNaN(level)) {
                            reject(new Error('getVolume failed: invalid volumeLevel for port ' + audioport[i] + ':' + JSON.stringify(res1.volumeLevel)));
                            return;
                        }
                        // Icon refresh is best effort; a failure here must not
                        // invalidate an otherwise valid volume read.
                        try {
                            await this.updateIcon(audioport[i])
                        } catch (err) {
                            this.WARN('Volume getVolume updateIcon failed for port ' + audioport[i] + ':' + JSON.stringify(err, null, 3))
                        }
                        resolve(level);
                    }).catch(err => {
                        this.ERR('Volume getVolumeLevel error:' + JSON.stringify(err, null, 3))
                        reject(new Error('getVolume failed: getVolumeLevel error for port ' + audioport[i]))
                    })
                    return;
                }
            }
            reject(new Error('getVolume failed: no matching audio port found'));
        })
    }
}
