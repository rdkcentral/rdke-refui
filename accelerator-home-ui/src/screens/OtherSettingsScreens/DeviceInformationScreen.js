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
import { Lightning, Language, Router, Settings, Storage } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG, GLOBALS } from '../../Config/Config'
import AppApi from '../../api/AppApi.js';
import NetworkApi from '../../api/NetworkApi'
import FireBoltApi from '../../api/firebolt/FireBoltApi';

/**
 * Class for Video and Audio screen.
 */

export default class DeviceInformationScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device  Info'));
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            h: 1080,
            w: 1920,
            color: 0xCC000000,
            DeviceInfoContents: {
                x: 200,
                y: 275,
                Line1: {
                    y: 0,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                ChipSet: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Chipset`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    }
                },
                Line2: {
                    y: 90,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SerialNumber: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Serial Number`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line3: {
                    y: 180,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                Location: {
                    Title: {
                        x: 10,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Location`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: `CountryCode:`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line4: {
                    y: 270,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SupportedDRM: {
                    Title: {
                        x: 10,
                        y: 360,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Supported DRM & Key-System`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1600,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 360,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1200,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                },
                Line5: {
                    y: 450,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                FirmwareVersions: {
                    Title: {
                        x: 10,
                        y: 540,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Firmware version`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 540,
                        mountY: 0.5,
                        text: {
                            text: `UI Version: ${Settings.get('platform', 'version')}, Build Version: , Firebolt API Version: `,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line6: {
                    y: 630,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                AppVersions: {
                    Title: {
                        x: 10,
                        y: 720,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`App Info`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 720,
                        mountY: 0.5,
                        text: {
                            text: "Youtube:\nAmazon Prime:\nNetflix ESN:",
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line7: {
                    y: 810,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
            },
        }
    }

    _init() {
        this._network = new NetworkApi();
        this.appApi = new AppApi();
    }

    _focus() {

        this._setState('DeviceInformationScreen')
        this.appApi.getSerialNumber().then(result => {
            this.tag("SerialNumber.Value").text.text = `${result}`;
        })

        if ("ResidentApp" === GLOBALS.selfClientName) {
            this.appApi.getSystemVersions().then(res => {
                this.tag('FirmwareVersions.Value').text.text = `UI Version - ${Settings.get('platform', 'version')} \nBuild Version - ${res.stbVersion} \nTime Stamp - ${res.stbTimestamp} `
            }).catch(err => {
                console.error(`error while getting the system versions`)
            })
            this._network.isConnectedToInternet().then((result) => {
                if (result === true) {
                    this.appApi.getLocation().then(result => {
                        console.log("getLocation from device info " + JSON.stringify(result))
                        let locationInfo = ""
                        if (result.city.length !== 0) {
                            locationInfo = "City: " + result.city
                        }
                        else {
                            locationInfo = "City: N/A "
                        }
                        if (result.country.length !== 0) {
                            locationInfo += ", Country: " + result.country;
                        }
                        else {
                            locationInfo += ", Country: N/A "
                        }
                        this.tag('Location.Value').text.text = `${locationInfo}`
                    })
                }
                else {
                    this.tag('Location.Value').text.text = `City: N/A, Country: N/A`
                }
            })
        } else {
            // Firebolt mode
            FireBoltApi.get().deviceinfo.getversion().then(res => {
                console.log(`build verion${res.firmware.readable} Firebolt API Version - ${res.api.readable}`)
                this.tag('FirmwareVersions.Value').text.text = `UI Version - ${Settings.get('platform', 'version')} \nBuild Version - ${res.firmware.readable} \nFirebolt API Version - ${res.api.readable} `
            }).catch(err => {
                console.error(`error while getting the system versions from Firebolt.getversion API`)
            })
            FireBoltApi.get().localization.countryCode().then(res => {
                this.tag('Location.Value').text.text = `CountryCode: ${res}`;
            })
        }

        this.appApi.getDRMS().then(result => {
            console.log('from device info supported drms ' + JSON.stringify(result))
            let drms = ""
            result.forEach(element => {
                drms += `${element.name} :`
                if (element.keysystems) {
                    drms += "\t"
                    element.keysystems.forEach(keySystem => {
                        drms += `${keySystem}, `
                    })
                    drms += "\n"
                } else {
                    drms += "\n"
                }
            });
            this.tag('SupportedDRM.Value').text.text = `${drms.substring(0, drms.length - 1)}`
        })

        this.appApi.getDeviceIdentification().then(result => {
            console.log('from device Information screen getDeviceIdentification: ' + JSON.stringify(result))
            this.tag('ChipSet.Value').text.text = `${result.chipset}`
            // this.tag('FirmwareVersions.Value').text.text = `${result.firmwareversion}`
        })

        let self = this;
        if (Storage.get('Netflix_ESN')) {
            self.tag('AppVersions.Value').text.text = `Youtube: NA\nAmazon Prime: NA\nNetflix ESN: ${Storage.get('Netflix_ESN')}`
        }
        else {
            self.appApi.getPluginStatus('Netflix')
                .then(result => {
                    let sel = self;
                    console.log(`Netflix : plugin status : `, JSON.stringify(result));
                    if (result[0].state === 'deactivated' || result[0].state === 'deactivation') {
                        sel.appApi.launchPremiumAppInSuspendMode("Netflix").then(res => {
                            console.log("Netflix : netflix launch for esn value in suspend mode returns : ", JSON.stringify(res));
                            let se = sel;
                            se.appApi.getNetflixESN()
                                .then(res => {
                                    Storage.set('Netflix_ESN', res)
                                    console.log(`Netflix : netflix esn call returns : `, JSON.stringify(res));
                                    se.netflixESN = `Youtube: NA \nAmazon Prime: NA \nNetflix ESN: ${res}`
                                })
                                .catch(err => {
                                    console.error(`Netflix : error while getting netflix esn : `, JSON.stringify(err))
                                })
                        }).catch(err => {
                            console.error(`Netflix : error while launching netflix in suspendMode : `, JSON.stringify(err))
                        })
                    }
                    else {
                        self.appApi.getNetflixESN()
                            .then(res => {
                                Storage.set('Netflix_ESN', res)
                                console.log(`Netflix : netflix esn call returns : `, JSON.stringify(res));
                                self.netflixESN = `Youtube: NA \nAmazon Prime: NA \nNetflix ESN: ${res}`;
                            })
                            .catch(err => {
                                console.error(`Netflix : error while getting netflix esn : `, JSON.stringify(err))
                            })
                    }
                }).catch(err => {
                    console.error(`Netflix : error while getting netflix plugin status ie. `, JSON.stringify(err))
                    self.netflixESN = `Youtube: NA \nAmazon Prime: NA \nNetflix ESN: "Not Detected"`;
                })
        }


        this.appApi.registerChangeLocation()
    }

    set netflixESN(v) {
        console.log(`setting netflix ESN value to ${v}`);
        this.tag('AppVersions.Value').text.text = v;
    }

    _handleBack() {
        if (!Router.isNavigating()) {
            Router.navigate('settings/advanced/device')
        }
    }

    _handleDown() {
        if (this.tag("DeviceInfoContents").y > 215) {
            this.tag("DeviceInfoContents").y -= 20;
        }
    }
    _handleUp() {
        if (this.tag("DeviceInfoContents").y < 275) {
            this.tag("DeviceInfoContents").y += 20;
        }
    }

}
