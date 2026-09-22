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
import { Lightning, Language, Router } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import SysSrvApi, { FWUpdateState, FWUpdateAvailableEnum } from '../../api/SystemServicesApi';
import PowerManagerApi from '../../api/PowerManagerApi';

/**
 * Class for Firmware screen.
 */

export default class FirmwareScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device  Firmware Update'));
    }

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            FirmwareContents: {
                x: 200,
                y: 270,
                State: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Firmware State: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                Version: {
                    Title: {
                        x: 10,
                        y: 90,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Firmware Versions: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                DownloadedVersion: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Downloaded Firmware Version: `),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                DownloadedPercent: {
                    Title: {
                        x: 10,
                        y: 180,
                        mountY: 0.5,
                        text: {
                            text: "",
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                FirmwareUpdate: {
                    alpha:0,
                    RectangleDefault: {
                        x: 210, y: 200, w: 400, mountX: 0.5, h: 50, rect: true, color: CONFIG.theme.hex,
                        Update: {
                            x: 170,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Check for Update"),
                                fontFace: CONFIG.language.font,
                                fontSize: 24,
                            },
                        }
                    },
                },
            },
        }
    }

    _unfocus() {
        if (this.downloadInterval) {
            clearInterval(this.downloadInterval);
            this.downloadInterval = null
        }
    }

    _init() {
        this.FWUpdateRebootImmediately = false;
        this.FWUpdateIsRebootDeferred = false;
        this.FWUpdateRebooting = false;
        this.autoRebootStartedCB = null;
    }

    _active() {
        this.onFirmwareUpdateStateChangeCB = SysSrvApi.on('onFirmwareUpdateStateChange', notification => {
            this.tag('State.Title').text.text = Language.translate("Firmware State: ") + SysSrvApi.getFirmwareUpdateStateString(notification.firmwareUpdateStateChange);
            this.LOG('onFirmwareUpdateStateChange:' + JSON.stringify(notification));
            if (FWUpdateState.FWUpdateStateDownloading === notification.firmwareUpdateStateChange) {
                this.showUpdateButton(notification.firmwareUpdateStateChange)
                this.downloadInterval = setInterval(() => {
                    this.LOG("Downloading...");
                    this.showDownloadPercent();
                }, 1000)
            } else if (notification.firmwareUpdateStateChange > FWUpdateState.FWUpdateStateFailed) {
                this.showUpdateButton(notification.firmwareUpdateStateChange)
                this.showDownloadFirmwareInfo()
                if (FWUpdateState.FWUpdateStatePreparingReboot === notification.firmwareUpdateStateChange) {
                    this.FWUpdateRebooting = true;
                    if (true === this.FWUpdateRebootImmediately === !this.FWUpdateIsRebootDeferred) {
                        this.autoRebootStartedCB = this.startAutoRebootCountdown();
                    } else {
                        this.tag('State.Title').text.text = Language.translate("Firmware State: ") + Language.translate("Reboot to complete the update");
                        setTimeout(() => {
                            if (!Router.isNavigating()) Router.navigate('settings/advanced/device/reboot')
                        }, 1000)
                    }
                }
            } else if (FWUpdateState.FWUpdateStateDownloading !== notification.firmwareUpdateStateChange) {
                this.tag('DownloadedPercent.Title').visible = false;
                this.showUpdateButton(notification.firmwareUpdateStateChange)
                if (this.downloadInterval) {
                    clearInterval(this.downloadInterval);
                    this.downloadInterval = null
                }
            }
        });
        // TODO: This need to be in _init() as it should be system wide.
        this.onFirmwareUpdateInfoReceivedCB = SysSrvApi.on('onFirmwareUpdateInfoReceived', params => {
            this.LOG("onFirmwareUpdateInfoReceived" + JSON.stringify(params))
            if (params.success) {
                if (params.updateAvailable) {
                    switch(params.updateAvailableEnum) {
                        case FWUpdateAvailableEnum.FW_UPDATE_AVAILABLE: // A new firmware version is available.
                            this.FWUpdateRebootImmediately = false;
                            if (params.rebootImmediately) {
                                this.FWUpdateRebootImmediately = true;
                            } else {
                                this.FWUpdateRebootImmediately = false;
                            }
                            this.showUpdateButton(params.updateAvailable)
                            break;
                        case FWUpdateAvailableEnum.FW_MATCH_CURRENT_VER: // The firmware version is at the current version.
                        case FWUpdateAvailableEnum.NO_FW_VERSION: // XCONF did not return a firmware version (timeout or other XCONF error).
                        case FWUpdateAvailableEnum.EMPTY_SW_UPDATE_CONF: // The device is configured not to update the firmware (swupdate.conf exists on the device).
                            this.tag("FirmwareUpdate").alpha = 0
                            this._setState('Idle')
                            break;
                    }
                }
            }
        });
        // TODO: decouple updateFirmware from here.
        //this.getDownloadFirmwareInfo();
        this.showDownloadPercent();
    }

    startAutoRebootCountdown() {
        this.tag("FirmwareUpdate").alpha = 0
        this._setState('Idle')
        this.tag('State.Title').text.text = Language.translate("Firmware State: ") + Language.translate("Rebooting") + ": 5"
        let countdown = 5;
        let countdownInterval = setInterval(() => {
            countdown--;
            if (this.tag('State.Title')) {
                this.tag('State.Title').text.text = Language.translate("Firmware State: ") + Language.translate("Rebooting") + ":" + countdown;
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                PowerManagerApi.reboot("UI-FirmwareUpdate-AutoReboot").then(res => {
                    this.LOG("Rebooting device: " + JSON.stringify(res));
                }).catch(err => {
                    this.ERR("Error: " + JSON.stringify(err));
                });
            }
        }, 1000)
        return countdownInterval;
    }

    startDownloadPercentageTimer() {
        this.downloadInterval = setInterval(() => {
            this.showDownloadPercent();
        }, 1000)
    }

    showUpdateButton(state){
        if(state > FWUpdateState.FWUpdateStateFailed || state === FWUpdateState.FWUpdateStateDownloading) {
            this.tag("FirmwareUpdate").alpha = 0
            this._setState('Idle')
        } else {
            this.tag("FirmwareUpdate").alpha = 1
            this._setState('FirmwareUpdate')
        }
    }

    _disable() {
        if (this.onFirmwareUpdateStateChangeCB) {
            SysSrvApi.off('onFirmwareUpdateStateChange', this.onFirmwareUpdateStateChangeCB);
        }
        if (this.onFirmwareUpdateInfoReceivedCB) {
            SysSrvApi.off('onFirmwareUpdateInfoReceived', this.onFirmwareUpdateInfoReceivedCB);
        }
    }

    async _focus() {
        this.downloadInterval = null;
        await SysSrvApi.getFirmwareUpdateState().then(res => {
            if (res.success) {
                this.LOG("getFirmwareUpdateState from firmware screen " + JSON.stringify(res))
                this.tag('State.Title').text.text = Language.translate("Firmware State: ") + SysSrvApi.getFirmwareUpdateStateString(res.firmwareUpdateState)
                this.showUpdateButton(res.firmwareUpdateState)
                if (FWUpdateState.FWUpdateStateDownloading === res.firmwareUpdateState) {
                    this.startDownloadPercentageTimer();
                }
            }
        });
        await SysSrvApi.getDownloadedFirmwareInfo().then(res => {
            this.LOG("getDownloadedFirmwareInfo : " + JSON.stringify(res));
            this.tag('Version.Title').text.text = Language.translate("Firmware Versions: ") + res.currentFWVersion
            this.tag('DownloadedVersion.Title').text.text = Language.translate('Downloaded Firmware Version: ') + `${res.downloadedFWVersion ? res.downloadedFWVersion : 'NA'}`
        });
    }

    showDownloadPercent() {
        SysSrvApi.getFirmwareDownloadPercent().then(res => {
            if (res.downloadPercent < 0) {
                this.tag('DownloadedPercent.Title').visible = false;
                this.tag('DownloadedPercent.Title').text.text = "";
            }
            else {
                this.tag('DownloadedPercent.Title').visible = true;
                this.tag('DownloadedPercent.Title').text.text = Language.translate("Download Progress: ") + res.downloadPercent + "%";
                if (this.downloadInterval === null) {
                    this.startDownloadPercentageTimer()
                }
            }
        }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
        })
    }

    async showDownloadFirmwareInfo() {
        this.tag('DownloadedVersion.Title').text.text = Language.translate('Check for Firmware Update') + ":" + Language.translate('Please wait');
        await SysSrvApi.updateFirmware().catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
        });
        await SysSrvApi.getDownloadedFirmwareInfo().then(result => {
            this.LOG("getDownloadedFirmwareInfo : " + JSON.stringify(result.downloadedFWVersion));

            this.tag('Version.Title').text.text = Language.translate("Firmware Versions: ") + result.currentFWVersion
            this.tag('DownloadedVersion.Title').text.text = Language.translate('Downloaded Firmware Version: ') + `${result.downloadedFWVersion ? result.downloadedFWVersion : 'NA'}`

            this.FWUpdateIsRebootDeferred = false;
            if (result.isRebootDeferred) {
                this.FWUpdateRebootImmediately = true;
            } else {
                this.FWUpdateRebootImmediately = false;
            }
        }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
        });
    }

    _handleBack() {
        if(!Router.isNavigating() && !this.FWUpdateRebooting) {
           Router.navigate('settings/advanced/device')
        }
    }

    static _states() {
        return [
            class FirmwareUpdate extends this {
                _handleEnter() {
                    this.showDownloadFirmwareInfo()
                    this.showDownloadPercent()
                }
            },
            class Idle extends this {
                //
            }
        ]
    }
}
