/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2025 RDK Management
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
import ThunderJS from 'ThunderJS';
import { CONFIG } from '../Config/Config'

export default class Miracast {
    constructor() {
        this._thunder = ThunderJS(CONFIG.thunderConfig);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    activateService() {
        return new Promise((resolve,reject) => {
        this._thunder.Controller.activate({ callsign: 'org.rdk.MiracastService' }).then((res) => {
        this.LOG("MiracastService: Activated " + JSON.stringify(res))
        resolve(res)
        }).catch(err => {
            reject(err)
            this.ERR('MiracastService: Error Activation ' + JSON.stringify(err));
        })
        })
    }

    activatePlayer() {
        return new Promise((resolve,reject) => {
        this._thunder.Controller.activate({ callsign: 'org.rdk.MiracastPlayer' }).then((res) => {
        this.LOG("MiracastPlayer: Activated " + JSON.stringify(res))
        resolve(res)
        }).catch(err => {
            reject(err)
            this.ERR('MiracastPlayer: Error Activation ' + JSON.stringify(err));
        })
        })
    }

    deactivateService()
    {
    return new Promise((resolve,reject) => {
        this._thunder.Controller.deactivate({ callsign: 'org.rdk.MiracastService' }).then((res) => {
            this.LOG("MiracastService: deactivated org.rdk.MiracastService" + JSON.stringify(res))
            resolve(res)
        }).catch(err => {
            reject(err)
            this.ERR('MiracastService: Error deactivation ' + JSON.stringify(err))
        })
        })
    }

    deactivatePlayer()
    {
    return new Promise((resolve,reject) => {
        this._thunder.Controller.deactivate({ callsign: 'org.rdk.MiracastPlayer' }).then((res) => {
            this.LOG("MiracastPlayer: deactivated org.rdk.MiracastPlayer" + JSON.stringify(res))
            resolve(res)
        }).catch(err => {
            reject(err)
            this.ERR('MiracastPlayer: Error deactivation ' + JSON.stringify(err))
        })
        })
    }
    setEnable(state)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'setEnable',{enabled:state})
                .then(res => {
                    this.LOG("Sucess response from setEnable " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setEnable " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    getEnable()
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'getEnable')
                .then(res => {
                    this.LOG("Sucess response from getEnable " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from getEnable " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    acceptClientConnection(status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'acceptClientConnection',{requestStatus:status})
                .then(res => {
                    this.LOG("Sucess response from acceptClientConnection " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from acceptClientConnection " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    updatePlayerState(mac,state,reason_code,reason)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'updatePlayerState',{mac:mac,state:state,reason_code:reason_code,reason:reason})
                .then(res => {
                    this.LOG("Sucess response from updatePlayerState " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from updatePlayerState " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    stopClientConnection(mac,name)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'stopClientConnection',{mac:mac,name:name})
                .then(res => {
                    this.LOG("Sucess response from stopClientConnection " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from stopClientConnection " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setLoggingService(level,logfilename,status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'setLogging',{level:level,separate_logger:{logfilename:logfilename,status:status}})
                .then(res => {
                    this.LOG("Sucess response from setLogging " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setLogging " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    playRequest(source_dev_ip,source_dev_mac,source_dev_name,sink_dev_ip,X,Y,W,H)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'playRequest',{device_parameters:
                {source_dev_ip:source_dev_ip,source_dev_mac:source_dev_mac,source_dev_name:source_dev_name,sink_dev_ip:sink_dev_ip},
                video_rectangle:{X:X,Y:Y,W:W,H:H}})
                .then(res => {
                    this.LOG("Sucess response from playRequest " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from playRequest " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    stopRequest(mac,name,reason_code)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'stopRequest',{mac:mac,name:name,reason_code:reason_code})
                .then(res => {
                    this.LOG("Sucess response from stopRequest " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from stopRequest " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setPlayerState(state)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setPlayerState',{state:state})
                .then(res => {
                    this.LOG("Sucess response from setPlayerState " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setPlayerState " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setVideoRectangle(X,Y,W,H)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setVideoRectangle',{X:X,Y:Y,W:W,H:H})
                .then(res => {
                    this.LOG("Sucess response from setVideoRectangle " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setVideoRectangle " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setRTSPWaitTimeout(Request,Response)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setRTSPWaitTimeout',{Request:Request,Response:Response})
                .then(res => {
                    this.LOG("Sucess response from setRTSPWaitTimeout " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setRTSPWaitTimeout " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setLoggingPlayer(level,logfilename,status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setLogging',{level:level,separate_logger:{logfilename:logfilename,status:status}})
                .then(res => {
                    this.LOG("Sucess response from setLogging " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setLogging " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setVideoFormats(native,display_mode_supported,profile,level,cea_mask,vesa_mask,hh_mask,latency,min_slice,slice_encode,
        video_frame_skip_support,max_skip_intervals,video_frame_rate_change_support)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setVideoFormats',
            {native:native,display_mode_supported:display_mode_supported,h264_codecs:
                {profile:profile,level:level,cea_mask:cea_mask,vesa_mask:vesa_mask,hh_mask:hh_mask,latency:latency,min_slice:min_slice,slice_encode:slice_encode,
                    video_frame_skip_support:video_frame_skip_support,max_skip_intervals:max_skip_intervals,
                    video_frame_rate_change_support:video_frame_rate_change_support}})
                .then(res => {
                    this.LOG("Sucess response from setVideoFormats " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setVideoFormats " + JSON.stringify(err))
                    reject(err)
                })
        })
    }

    setAudioFormats(audio_format,modes,latency)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setAudioFormats',{audio_format:audio_format,modes:modes,latency:latency})
                .then(res => {
                    this.LOG("Sucess response from setAudioFormats " + JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    this.ERR("Error response from setAudioFormats " + JSON.stringify(err))
                    reject(err)
                })
        })
    }
}
