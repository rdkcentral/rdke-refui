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
import { GLOBALS, CONFIG } from '../../Config/Config'
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

    isFirmwareUpdateIncomplete(state) {
        if (state === undefined || state === null) {
            return false;
        }

        return [
            FWUpdateState.FWUpdateStateRequesting,
            FWUpdateState.FWUpdateStateDownloading,
            FWUpdateState.FWUpdateStateDownloadComplete,
            FWUpdateState.FWUpdateStateValidationComplete,
            FWUpdateState.FWUpdateStatePreparingReboot,
        ].includes(state);
    }

    setUpdateInProgressState(state) {
        this.updateInProgress = this.isFirmwareUpdateIncomplete(state);
        GLOBALS.lastFirmwareUpdateState = state;
        if (this.updateInProgress) {
            this.LOG('Firmware update is in progress; navigation is blocked. state=' + state);
        }
    }

    updateFirmwareStateUI(state) {
        if (state === undefined || state === null) {
            return;
        }

        GLOBALS.lastFirmwareUpdateState = state;

        if (GLOBALS.skipFirmwareUpdateRetry && state === FWUpdateState.FWUpdateStatePreparingReboot) {
            this.LOG('Skipping firmware update retry because the user canceled the reboot confirmation flow.');
            this.tag('State.Title').text.text = Language.translate('Firmware State: ') + Language.translate('Reboot to complete the update');
            return;
        }

        const stateText = SysSrvApi.getFirmwareUpdateStateString(state, CONFIG.language);
        this.tag('State.Title').text.text = Language.translate('Firmware State: ') + stateText;
        this.setUpdateInProgressState(state);

        // No event for 'Updating', set State text to 'Updating' after 250ms.
        if (state === FWUpdateState.FWUpdateStateValidationComplete) {
            setTimeout(() => {
                this.tag('State.Title').text.text = Language.translate('Firmware State: ') + Language.translate('Updating') + '...';
            }, 250);
        }

        if (this.downloadInterval && state !== FWUpdateState.FWUpdateStateDownloading) {
            this.tag('DownloadedPercent.Title').visible = false;
            this.tag('DownloadedPercent.Title').text.text = '';
            clearInterval(this.downloadInterval);
            this.downloadInterval = null;
        }

        if (state === FWUpdateState.FWUpdateStateDownloading) {
            this.showUpdateButton(state);
            this.tag('DownloadedPercent.Title').visible = true;
            if (!this.downloadInterval) {
                this.downloadInterval = setInterval(() => this.showDownloadPercent(), 1000);
            }
            return;
        }

        if (state > FWUpdateState.FWUpdateStateFailed) {
            this.showUpdateButton(state);
            this.showDownloadFirmwareInfo();

            if (state === FWUpdateState.FWUpdateStatePreparingReboot) {
                this.FWUpdateRebooting = true;
                if (this.FWUpdateRebootImmediately === true && !this.FWUpdateIsRebootDeferred) {
                    this.LOG('Starting auto reboot countdown');
                    this.autoRebootStartedCB = this.startAutoRebootCountdown();
                    return;
                }
                this.tag('State.Title').text.text = Language.translate('Firmware State: ') + Language.translate('Reboot to complete the update');
                setTimeout(() => {
                    if (!Router.isNavigating()) Router.navigate('settings/advanced/device/reboot');
                }, 1000);
            }
            return;
        }

        this.tag('DownloadedPercent.Title').visible = false;
        this.showUpdateButton(state);
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

    clearFirmwareUpdateCallbacks() {
        if (this.autoRebootStartedCB) {
            clearInterval(this.autoRebootStartedCB);
            this.autoRebootStartedCB = null;
        }
        if (this.onFirmwareUpdateStateChangeCB) {
            SysSrvApi.off('onFirmwareUpdateStateChange', this.onFirmwareUpdateStateChangeCB);
            this.onFirmwareUpdateStateChangeCB = null;
        }
        if (this.onFirmwareUpdateInfoReceivedCB) {
            SysSrvApi.off('onFirmwareUpdateInfoReceived', this.onFirmwareUpdateInfoReceivedCB);
            this.onFirmwareUpdateInfoReceivedCB = null;
        }
    }

    _unfocus() {
        this.clearFirmwareUpdateCallbacks();
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
        this.onFirmwareUpdateStateChangeCB = null;
        this.onFirmwareUpdateInfoReceivedCB = null;
        this.updateInProgress = false;
        GLOBALS.skipFirmwareUpdateRetry = false;
    }

    _active() {
        this.clearFirmwareUpdateCallbacks();
        // If Maintenance update is in progress, then do not allow user to check for firmware update.
        if (GLOBALS.maintenanceIsCriticalMaintenance === true && GLOBALS.maintenanceIsRebootPending === true) {
            this.LOG("Maintenance update is in progress; ignoring firmware update check.");
            this.tag("FirmwareUpdate").alpha = 0
            this._setState('Idle')
            this.tag('State.Title').text.text = Language.translate("Firmware State: ") + Language.translate("Maintenance update in progress")
            return;
        }
        this.onFirmwareUpdateStateChangeCB = SysSrvApi.on('onFirmwareUpdateStateChange', notification => {
            const nextState = notification && notification.firmwareUpdateStateChange;
            if (nextState === undefined || nextState === null) {
                return;
            }
            this.updateFirmwareStateUI(nextState);
        });
        this.onFirmwareUpdateInfoReceivedCB = SysSrvApi.on('onFirmwareUpdateInfoReceived', params => {
            this.LOG("onFirmwareUpdateInfoReceived" + JSON.stringify(params))
            if (params.success) {
                if (params.updateAvailable) {
                    switch(params.updateAvailableEnum) {
                        case FWUpdateAvailableEnum.FW_UPDATE_AVAILABLE:
                            this.FWUpdateRebootImmediately = !!params.rebootImmediately;
                            this.showUpdateButton(params.updateAvailable)
                            break;
                        case FWUpdateAvailableEnum.FW_MATCH_CURRENT_VER:
                        case FWUpdateAvailableEnum.NO_FW_VERSION:
                        case FWUpdateAvailableEnum.EMPTY_SW_UPDATE_CONF:
                            this.tag("FirmwareUpdate").alpha = 0
                            this._setState('Idle')
                            break;
                    }
                    this.LOG("FWUpdateRebootImmediately: " + this.FWUpdateRebootImmediately + " FWUpdateIsRebootDeferred: " + this.FWUpdateIsRebootDeferred)
                }
            }
        });
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
                PowerManagerApi.get().reboot("UI-FirmwareUpdate-AutoReboot").then(res => {
                    this.LOG("Rebooting device: " + JSON.stringify(res));
                }).catch(err => {
                    this.ERR("Error: " + JSON.stringify(err));
                });
            }
        }, 1000)
        return countdownInterval;
    }

    startDownloadPercentageTimer() {
        if (this.downloadInterval) {
            clearInterval(this.downloadInterval);
            this.downloadInterval = null
        }
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
        this.clearFirmwareUpdateCallbacks();
        if (this.downloadInterval) {
            clearInterval(this.downloadInterval);
            this.downloadInterval = null
        }
    }

    async _focus() {
        this.downloadInterval = null;
        await SysSrvApi.getFirmwareUpdateState().then(async res => {
            if (res.success) {
                this.LOG("getFirmwareUpdateState from firmware screen " + JSON.stringify(res))
                const firmwareState = res.firmwareUpdateState;
                this.updateFirmwareStateUI(firmwareState);
                if (FWUpdateState.FWUpdateStatePreparingReboot < firmwareState) {
                    await SysSrvApi.getSystemVersions().then(res => {
                        if (res.success && res?.stbVersion === res?.downloadedFWVersion) {
                            this.tag('State.Title').text.text = Language.translate("Firmware State: ") + Language.translate("System is up to date");
                            GLOBALS.lastFirmwareUpdateState = FWUpdateState.FWUpdateStateNoUpgradeNeeded;
                        }
                    });
                }
                if (FWUpdateState.FWUpdateStateDownloading === firmwareState) {
                    this.startDownloadPercentageTimer();
                }
            } else {
                this.updateInProgress = false;
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
            if (res.success && res?.downloadPercent < 0) {
                this.tag('DownloadedPercent.Title').visible = false;
                this.tag('DownloadedPercent.Title').text.text = "";
            }
            else if (res.success && res?.downloadPercent > 0) {
                this.tag('DownloadedPercent.Title').visible = true;
                this.tag('DownloadedPercent.Title').text.text = Language.translate("Download Progress: ") + res.downloadPercent + "%";
                if (this.downloadInterval === null) {
                    this.startDownloadPercentageTimer();
                }
            }
        }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
            this.updateInProgress = false;
        })
    }

    async showDownloadFirmwareInfo() {
        this.tag('DownloadedVersion.Title').text.text = Language.translate('Check for Firmware Update') + ":" + Language.translate('Please wait');
        this.setUpdateInProgressState(FWUpdateState.FWUpdateStateRequesting);
        await SysSrvApi.updateFirmware().catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
            this.updateInProgress = false;
        });
        await SysSrvApi.getDownloadedFirmwareInfo().then(result => {
            this.LOG("getDownloadedFirmwareInfo : " + JSON.stringify(result.downloadedFWVersion));
            this.tag('Version.Title').text.text = Language.translate("Firmware Versions: ") + result.currentFWVersion
            this.tag('DownloadedVersion.Title').text.text = Language.translate('Downloaded Firmware Version: ') + `${result.downloadedFWVersion ? result.downloadedFWVersion : 'NA'}`

            this.FWUpdateIsRebootDeferred = false;
            if (result.isRebootDeferred) {
                this.FWUpdateIsRebootDeferred = true;
            } else {
                this.FWUpdateIsRebootDeferred = false;
            }
            this.LOG("FWUpdateRebootImmediately: " + this.FWUpdateRebootImmediately + " FWUpdateIsRebootDeferred: " + this.FWUpdateIsRebootDeferred)
            this.updateInProgress = false;
        }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err));
            this.updateInProgress = false;
        });
    }

    _handleBack() {
        if (this.updateInProgress || this.FWUpdateRebooting) {
            this.LOG("Firmware update in progress; ignoring back navigation" + JSON.stringify(GLOBALS.lastFirmwareUpdateState));
            this.tag('DownloadedPercent.Title').visible = true;
            this.tag('DownloadedPercent.Title').text.text = Language.translate("Updating the system, please wait") + "...";
            return;
        }
        this.clearFirmwareUpdateCallbacks();
        if (this.downloadInterval) {
            clearInterval(this.downloadInterval);
            this.downloadInterval = null;
        }
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
                // No specific behavior for Idle state; just a placeholder.
            }
        ]
    }
}
