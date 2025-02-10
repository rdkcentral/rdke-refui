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
import { Metrics } from "@firebolt-js/sdk";
export default class Miracast {
    constructor() {
        this._thunder = ThunderJS(CONFIG.thunderConfig);
    }

    activateService() {
        return new Promise((resolve,reject) => {
        this._thunder.Controller.activate({ callsign: 'org.rdk.MiracastService' }).then((res) => {
        console.log(res)
        resolve(res)
        }).catch(err => {
            reject(err)
            console.error('MiracastService: Error Activation ', err);
            Metrics.error(Metrics.ErrorType.OTHER,"MiracastServiceError", "Error while Thunder Controller MiracastService activate "+JSON.stringify(err), false, null)
        })
        })
    }

    activatePlayer() {
        return new Promise((resolve,reject) => {
        this._thunder.Controller.activate({ callsign: 'org.rdk.MiracastPlayer' }).then((res) => {
        console.log(res)
        resolve(res)
        }).catch(err => {
            reject(err)
            console.error('MiracastPlayer: Error Activation ', err);
            Metrics.error(Metrics.ErrorType.OTHER,"MiracastPlayerError", "Error while Thunder Controller MiracastPlayer activate "+JSON.stringify(err), false, null)
        })
        })
    }

    deactivateService()
    {
    return new Promise((resolve,reject) => {
        this._thunder.Controller.deactivate({ callsign: 'org.rdk.MiracastService' }).then((res) => {
            console.log("MiracastService: deactivated org.rdk.MiracastService" +res)
            resolve(res)
        }).catch(err => {
            reject(err)
            console.error('MiracastService: Error deactivation ', err)
            Metrics.error(Metrics.ErrorType.OTHER,"MiracastServiceError", "Error while Thunder Controller MiracastService deactivate "+JSON.stringify(err), false, null)
        })
        })
    }

    deactivatePlayer()
    {
    return new Promise((resolve,reject) => {
        this._thunder.Controller.deactivate({ callsign: 'org.rdk.MiracastPlayer' }).then((res) => {
            console.log("MiracastPlayer: deactivated org.rdk.MiracastPlayer")
            resolve(res)
        }).catch(err => {
            reject(err)
            console.error('MiracastPlayer: Error deactivation ', err)
            Metrics.error(Metrics.ErrorType.OTHER,"MiracastPlayerError", "Error while Thunder Controller MiracastPlayer deactivate "+JSON.stringify(err), false, null)
        })
        })
    }
    setEnable(state)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'setEnable',{enabled:state})
                .then(res => {
                    console.log("Sucess response from setEnable "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setEnable "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setEnable", "Error while Thunder  setEnable status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    getEnable()
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'getEnable')
                .then(res => {
                    console.log("Sucess response from getEnable "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from getEnable "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"getEnable", "Error while Thunder  getEnable status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    acceptClientConnection(status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'acceptClientConnection',{requestStatus:status})
                .then(res => {
                    console.log("Sucess response from acceptClientConnection "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from acceptClientConnection "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"acceptClientConnection", "Error while Thunder  acceptClientConnection status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    updatePlayerState(mac,state,reason_code,reason)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'updatePlayerState',{mac:mac,state:state,reason_code:reason_code,reason:reason})
                .then(res => {
                    console.log("Sucess response from updatePlayerState "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from updatePlayerState "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"updatePlayerState", "Error while Thunder  updatePlayerState status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    stopClientConnection(mac,name)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'stopClientConnection',{mac:mac,name:name})
                .then(res => {
                    console.log("Sucess response from stopClientConnection "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from stopClientConnection "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"stopClientConnection", "Error while Thunder  stopClientConnection status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setLoggingService(level,logfilename,status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastService', 'setLogging',{level:level,separate_logger:{logfilename:logfilename,status:status}})
                .then(res => {
                    console.log("Sucess response from setLogging "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setLogging "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setLogging", "Error while Thunder  setLogging status "+JSON.stringify(err), false, null)
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
                    console.log("Sucess response from playRequest "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from playRequest "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"playRequest", "Error while Thunder  playRequest status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    stopRequest(mac,name,reason_code)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'stopRequest',{mac:mac,name:name,reason_code:reason_code})
                .then(res => {
                    console.log("Sucess response from stopRequest "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from stopRequest "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"stopRequest", "Error while Thunder  stopRequest status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setPlayerState(state)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setPlayerState',{state:state})
                .then(res => {
                    console.log("Sucess response from setPlayerState "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setPlayerState "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setPlayerState", "Error while Thunder  setPlayerState status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setVideoRectangle(X,Y,W,H)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setVideoRectangle',{X:X,Y:Y,W:W,H:H})
                .then(res => {
                    console.log("Sucess response from setVideoRectangle "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setVideoRectangle "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setVideoRectangle", "Error while Thunder  setVideoRectangle status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setRTSPWaitTimeout(Request,Response)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setRTSPWaitTimeout',{Request:Request,Response:Response})
                .then(res => {
                    console.log("Sucess response from setRTSPWaitTimeout "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setRTSPWaitTimeout "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setRTSPWaitTimeout", "Error while Thunder  setRTSPWaitTimeout status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setLoggingPlayer(level,logfilename,status)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setLogging',{level:level,separate_logger:{logfilename:logfilename,status:status}})
                .then(res => {
                    console.log("Sucess response from setLogging "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setLogging "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setLogging", "Error while Thunder  setLogging status "+JSON.stringify(err), false, null)
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
                    console.log("Sucess response from setVideoFormats "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setVideoFormats "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setVideoFormats", "Error while Thunder  playResetVideoFormatsquest status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    setAudioFormats(audio_format,modes,latency)
    {
        return new Promise((resolve, reject) => {
            this._thunder.call('org.rdk.MiracastPlayer', 'setAudioFormats',{audio_format:audio_format,modes:modes,latency:latency})
                .then(res => {
                    console.log("Sucess response from setAudioFormats "+JSON.stringify(res))
                    resolve(res)
                })
                .catch(err => {
                    console.error("Error response from setAudioFormats "+JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"setAudioFormats", "Error while Thunder  setAudioFormats status "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }
}
