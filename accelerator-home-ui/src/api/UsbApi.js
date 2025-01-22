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
import ThunderJS from 'ThunderJS'
import { imageListInfo } from '../../static/data/ImageListInfo'
import { musicListInfo } from '../../static/data/MusicListInfo'
import { videoListInfo } from '../../static/data/VideoListInfo'
import { UsbInnerFolderListInfo } from '../../static/data/UsbInnerFolderListInfo'
import { CONFIG } from '../Config/Config'
import { Metrics } from '@firebolt-js/sdk'

let thunder = ThunderJS(CONFIG.thunderConfig)

/**
 * Class that contains functions which commuicates with thunder API's
 */
export default class UsbApi {

    /**
    *  Function to activate USB Access Plugin
    */
    activate() {
        return new Promise((resolve, reject) => {
            const systemcCallsign = 'org.rdk.UsbAccess'
            thunder.Controller.activate({ callsign: systemcCallsign })
                .then(res => {
                    resolve(res)
                }).catch(err => {
                    console.log('UsbAccess Plugin Activation Failed: ' + err)
                    Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError", "Error while Thunder Controller usbAccess activate "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    /**
    *  Function to deactivate USB Access Plugin
    */
    deactivate() {
        return new Promise((resolve, reject) => {
            const systemcCallsign = 'org.rdk.UsbAccess'
            thunder.Controller.deactivate({ callsign: systemcCallsign })
                .then(res => {
                    resolve(res)
                }).catch(err => {
                    console.log('UsbAccess Plugin Deactivation Failed: ' + err)
                    Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError",  "Error while Thunder Controller usbAccess deactivate "+JSON.stringify(err), false, null)
                    reject(err)
                })
        })
    }

    /**
    *  Function to create link for USB content
    */
    clearLink() {
        return new Promise((resolve) => {
            const systemcCallsign = 'org.rdk.UsbAccess'
            thunder
                .call(systemcCallsign, 'clearLink')
                .then(result => {
                    resolve(result)
                }).catch(err => {
                    console.error('UsbAccess Plugin ClearLink Failed: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError",  "Error in Thunder usbAccess clearLink "+JSON.stringify(err), false, null)
                    resolve(false)
                })
        })
    }

    /**
    *  Function to create link for USB content
    */
    createLink() {
        return new Promise((resolve) => {
            const systemcCallsign = 'org.rdk.UsbAccess'
            thunder
                .call(systemcCallsign, 'createLink')
                .then(result => {
                    resolve(result)
                }).catch(err => {
                    console.error('UsbAccess Plugin CreateLink Failed: ' + JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError", "Error in Thunder usbAccess createLink "+JSON.stringify(err), false, null)
                    resolve(false)
                })
        })
    }

    /**
    *  Function to get getUsbList
    */
    getUsbFileList() {
        if (arguments.length === 0) {
            return new Promise((resolve) => {
                const systemcCallsign = 'org.rdk.UsbAccess'
                thunder
                    .call(systemcCallsign, 'getFileList')
                    .then(result => {
                        resolve(result.contents)
                    }).catch(err => {
                        console.error('UsbAccess Plugin getFileList Failed: ' + JSON.stringify(err))
                        Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError", "Error in Thunder usbAccess getFileList "+JSON.stringify(err), false, null)
                        resolve(false)
                    })
            })
        } else {

            return new Promise((resolve) => {
                const systemcCallsign = 'org.rdk.UsbAccess'
                thunder
                    .call(systemcCallsign, 'getFileList', { "path": arguments[0] })
                    .then(result => {
                        resolve(result.contents)
                    }).catch(err => {
                        console.error('UsbAccess Plugin getFileList Failed: ' + JSON.stringify(err))
                        Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError", "Error in Thunder usbAccess getFileList "+JSON.stringify(err), false, null)
                        resolve(false)
                    })
            })

        }

    }

    retrieUsb() {
        this.usbLink = ""
        let self = this;
        return new Promise((resolve, reject) => {
            self.clearLink().then(
                () => {
                    self.createLink().then(
                        res => {
                            if (res.success) {
                                self.usbLink = res.baseURL
                                self.getUsbFileList().then(
                                    result1 => {
                                        self.getUsbContentList(result1)
                                        resolve(true)
                                    }
                                ).catch(err => { reject(err) })
                            }
                        }
                    ).catch(err => { reject(err) })
                }
            ).catch(err => { reject(err) })
        })

    }

    destroy() {
        imageListInfo.length = 0;
        videoListInfo.length = 0;
        musicListInfo.length = 0;
        UsbInnerFolderListInfo.length = 0;
    }

    cd(dname) {
        return new Promise((resolve, reject) => {
            this.getUsbFileList(dname).then(
                result1 => {
                    this.getUsbContentList(result1, dname)
                    resolve(true)
                }
            ).catch(err => {
                reject(err)
            })
        })
    }

    getMountedDevices() {
        return new Promise((resolve, reject) => {
            const systemcCallsign = "org.rdk.UsbAccess"
            thunder
                .call(systemcCallsign, 'getMounted')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                    console.error(`Error while getting the mounted device ${JSON.stringify(err)}`);
                    Metrics.error(Metrics.ErrorType.OTHER,"UsbApiError", "Error in Thunder usbAccess getMounted "+JSON.stringify(err), false, null)
                });
        });
    }

    getUsbContentList(result) {
        this.destroy()
        let cwd = this.usbLink;
        if (arguments[1]) {
            cwd = cwd + '/' + arguments[1];
        }
        // to add support for more formats, extension can be added same as below
        let extensionForImage = ['.png', '.jpg', '.PNG', '.jpeg', '.JPEG', '.jpg', '.JPG'];
        let extensionForVideo = ['.mp4', '.MP4', '.mov', '.MOV', '.avi', '.AVI', '.m3u8', '.M3U8', '.mpeg2', '.MPEG2'];
        let extensionForAudio = ['.mp3', '.mpeg', '.MP3', '.MPEG'];

        this._discoveredC = result;
        //   console.log("Discovered result :: " + JSON.stringify(result));

        this._discoveredC.filter(device => {
            for (let i in extensionForImage) {
                if (device.name.indexOf(extensionForImage[i]) !== -1) {
                    let obj1 = {
                        displayName: device.name,
                        uri: cwd + '/' + device.name,
                        url: cwd + '/' + device.name,
                        // url: '/images/usb/picture-default-tile.jpg',
                        // url: '/images/usb/USB_Photo_Placeholder.jpg',
                        // uri: this.usbLink + '/' + device.name,
                    };
                    imageListInfo.push(obj1);
                    return device
                }
            }
        });

        this._discoveredC.filter(device => {
            for (let i in extensionForVideo) {
                if (device.name.indexOf(extensionForVideo[i]) !== -1) {
                    let obj2 = {
                        displayName: device.name,
                        //  url: '/images/usb/video-default-tile.jpg',
                        url: '/images/usb/USB_Video_Placeholder.jpg',
                        uri: cwd + '/' + device.name,
                    };
                    videoListInfo.push(obj2);
                    return device
                }
            }
        });

        this._discoveredC.filter(device => {
            for (let i in extensionForAudio) {
                if (device.name.indexOf(extensionForAudio[i]) !== -1) {
                    let obj3 = {
                        displayName: device.name,
                        //  url: '/images/usb/music-default-tile.jpg',
                        url: '/images/usb/USB_Audio_Placeholder.jpg',
                        uri: cwd + '/' + device.name,
                    };
                    musicListInfo.push(obj3);
                    return device
                }
            }
        });


        this._discoveredC.filter(device => {
            if (device.t === 'd') {
                if (!(device.name === '.' || device.name === "..")) {
                    let obj4 = {
                        displayName: device.name,
                        url: "/images/usb/USB_Folder.jpg",
                        uri: cwd + "/" + device.name
                    }
                    UsbInnerFolderListInfo.push(obj4);
                    return device
                }
            }
        })
    }
}
