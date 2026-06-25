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
import { Lightning, Language, Registry, Router, Utils } from '@lightningjs/sdk'
import { COLORS } from './../colors/Colors'
import { CONFIG } from '../Config/Config'
import ThunderJS from 'ThunderJS'
import RCApi from '../api/RemoteControl';

const _thunder = ThunderJS(CONFIG.thunderConfig)
let onStatusCBhandle = null;

export default class RCInformationScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
        this.scanTrigger = null;
        this.pairingMessageTimeout = null;
        this.pairingAttemptTimeout = null;
        this.loadingAnimation = null;
        this.hasStartedPairingAttempt = false;
        this.pairingTimeoutSeconds = 30;
        this.retryDelayMilliseconds = 2000;
    }

    setStatusValues(value) {
        this.tag("Status.Value").text.text = value
        this.tag("MacAddress.Value").text.text = value
        this.tag("SwVersion.Value").text.text = value
        this.tag("BatteryPercent.Value").text.text = value
        this.tag("RCUName.Value").text.text = value
    }

    showDeviceInfo(show) {
        this.tag('DeviceInfoContents').visible = show
        this.tag('PairingStatus').visible = !show
    }

    showPairingStatus(description, showLoader = true) {
        this.showDeviceInfo(false)
        this.tag('PairingStatus.Description').text.text = description
        this.tag('PairingStatus.LoadingIcon').alpha = showLoader ? 1 : 0

        if (showLoader) {
            if (!this.loadingAnimation) {
                this.loadingAnimation = this.tag('PairingStatus.LoadingIcon').animation({
                    duration: 1,
                    repeat: -1,
                    stopMethod: 'immediate',
                    stopDelay: 0.2,
                    actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
                })
            }
            this.loadingAnimation.start()
        } else if (this.loadingAnimation) {
            this.loadingAnimation.stop()
            this.tag('PairingStatus.LoadingIcon').rotation = 0
        }
    }

    showScanningStatus() {
        this.showPairingStatus(
            Language.translate('Please put the remote in pairing mode') + ', ' + Language.translate('Scanning') + '...',
            true
        )
    }

    showNoDeviceFoundStatus() {
        this.showPairingStatus(
            Language.translate('Please put the remote in pairing mode') + ', ' + Language.translate('No device found'),
            false
        )
    }

    clearPairingAttemptTimeout() {
        console.log("RCInformationScreen clearPairingAttemptTimeout")
        if (this.pairingAttemptTimeout) {
            Registry.clearTimeout(this.pairingAttemptTimeout)
            this.pairingAttemptTimeout = null
        }
    }

    startPairingAttemptTimeout() {
        console.log("RCInformationScreen startPairingAttemptTimeout")
        this.clearPairingAttemptTimeout()
        this.pairingAttemptTimeout = Registry.setTimeout(() => {
            this.pairingAttemptTimeout = null
            this.showNoDeviceFoundStatus()
            this.schedulePairingRetry(this.retryDelayMilliseconds)
        }, this.pairingTimeoutSeconds * 1000)
    }

    schedulePairingRetry(delay = 2000) {
        console.log("RCInformationScreen schedulePairingRetry delay: " + delay)
        if (this.scanTrigger) {
            console.log("RCInformationScreen schedulePairingRetry scanTrigger already set, returning")
            return
        }

        this.scanTrigger = Registry.setTimeout(() => {
            this.scanTrigger = null
            this.showScanningStatus()
            this.hasStartedPairingAttempt = true
            this.startPairingAttemptTimeout()
            RCApi.get().startPairing(this.pairingTimeoutSeconds).catch(err => {
                this.ERR('RCInformationScreen startPairing error: ' + JSON.stringify(err));
                this.clearPairingAttemptTimeout()
                this.showNoDeviceFoundStatus()
                this.schedulePairingRetry()
            })
        }, delay)
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Bluetooth Voice Remote Control'));
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
            PairingStatus: {
                x: 960,
                y: 320,
                mountX: 0.5,
                visible: false,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate('Pair your remote control'),
                        textColor: COLORS.titleColor,
                        fontFace: CONFIG.language.font,
                        fontSize: 38,
                        textAlign: 'center',
                    }
                },
                Description: {
                    x: 0,
                    y: 85,
                    mountX: 0.5,
                    w: 1200,
                    text: {
                        text: Language.translate('Please put the remote in pairing mode') + ', ' + Language.translate('Scanning') + '...',
                        textColor: COLORS.titleColor,
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                        textAlign: 'center',
                        maxLines: 2,
                        wordWrap: true,
                        wordWrapWidth: 1200,
                    }
                },
                LoadingIcon: {
                    x: 0,
                    y: 155,
                    mountX: 0.5,
                    w: 45,
                    h: 45,
                    alpha: 0,
                    src: Utils.asset('images/settings/Loading.png'),
                },
            },
            DeviceInfoContents: {
                x: 200,
                y: 275,
                visible: false,
                Line1: {
                    y: 0,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                MacAddress: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`MacAddress`),
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
                RCUName: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`RCU Name`),
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
                Status: {
                    Title: {
                        x: 10,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Connection Status`),
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
                            text: `N/A`,
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
                BatteryPercent: {
                    Title: {
                        x: 10,
                        y: 315,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Battery percent'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1600,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 315,
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
                    y: 360,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SwVersion: {
                    Title: {
                        x: 10,
                        y: 405,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Software Version`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 405,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line6: {
                    y: 450,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
            },
        }
    }

    async _active() {
        this.scanTrigger = null;
        this.hasStartedPairingAttempt = false;
        this.findRemoteTrigger = true;
        await RCApi.get().activate().catch(err => { this.ERR("RCInformationScreen error: " + JSON.stringify(err)) });
        await RCApi.get().getNetStatus().then(result => {
            this.INFO("RCInformationScreen getNetStatus: " + JSON.stringify(result))
            onStatusCBhandle = _thunder.on('org.rdk.RemoteControl', 'onStatus', data => { this.onStatusCB(data) });
            this.onStatusCB(result);
        }).catch(err => this.ERR("RCInformationScreen error: " + JSON.stringify(err)));
    }

    _inactive() {
        this.WARN("RCInformationScreen _inactive.");
        if(onStatusCBhandle != null) {
            onStatusCBhandle.dispose();
            onStatusCBhandle = null;
        }
        this.setStatusValues('N/A')
        if (this.scanTrigger) {
            Registry.clearTimeout(this.scanTrigger);
            this.scanTrigger = null;
        }
        if (this.pairingMessageTimeout) {
            Registry.clearTimeout(this.pairingMessageTimeout);
            this.pairingMessageTimeout = null;
        }
        this.clearPairingAttemptTimeout()
        if (this.loadingAnimation) {
            this.loadingAnimation.stop();
            this.tag('PairingStatus.LoadingIcon').rotation = 0
        }
        this.tag('PairingStatus.LoadingIcon').alpha = 0
        this.showDeviceInfo(false)
        this.findRemoteTrigger = false;
        RCApi.get().stopPairing().catch(err => { this.ERR("RCInformationScreen error: " + JSON.stringify(err)) });
    }

    onStatusCB(cbData) {
        // getStatus response has 'success' property; notification payload does not have that.
        this.LOG("RCInformationScreen onStatusCB cbData:" + JSON.stringify(cbData));
        if ((cbData !== undefined) && ("success" in cbData ? cbData.success : true)) {
            let cbDatastatus = {}
            if (Array.isArray(cbData.status)) {
                cbDatastatus = cbData.status[0] || {};
            }
            else if (cbData.status && typeof cbData.status === 'object') {
                cbDatastatus = cbData.status;
            }
            const remoteData = Array.isArray(cbDatastatus.remoteData) ? cbDatastatus.remoteData : [];
            if (remoteData.length) {
                this.LOG("RCInformationScreen rcPairingApis RemoteData Length " + JSON.stringify(remoteData.length))
                let RemoteName = []; let connectedStatus = []; let MacAddress = [];
                let swVersion = []; let BatteryPercent = [];

                if (this.scanTrigger) {
                    Registry.clearTimeout(this.scanTrigger);
                    this.scanTrigger = null;
                }
                this.clearPairingAttemptTimeout()
                if (this.pairingMessageTimeout) {
                    Registry.clearTimeout(this.pairingMessageTimeout)
                    this.pairingMessageTimeout = null
                }

                remoteData.map(item => {
                    RemoteName.push(item.name)
                })
                remoteData.map(item => {
                    MacAddress.push(item.macAddress)
                })
                remoteData.map(item => {
                    swVersion.push(item.swVersion)
                })
                remoteData.map(item => {
                    BatteryPercent.push(item.batteryPercent)
                })
                remoteData.map(item => {
                    connectedStatus.push(item.connected)
                })
                this.tag("Status.Value").text.text = connectedStatus
                this.tag("MacAddress.Value").text.text = MacAddress
                this.tag("SwVersion.Value").text.text = swVersion
                this.tag("BatteryPercent.Value").text.text = BatteryPercent
                this.tag("RCUName.Value").text.text = RemoteName
                const pairedDeviceLabel = remoteData[0].deviceType || remoteData[0].name || Language.translate('Remote')
                this.showPairingStatus(pairedDeviceLabel + Language.translate('remote is paired'), false)
                this.pairingMessageTimeout = Registry.setTimeout(() => {
                    this.pairingMessageTimeout = null
                    this.showDeviceInfo(true)
                }, 1500)
                if (this.findRemoteTrigger) {
                    this.findRemoteTrigger = false;
                    RCApi.get().findMyRemote().catch(err => {
                        this.ERR("RCInformationScreen findMyRemote error: " + JSON.stringify(err))
                    });
                }
            } else {
                if (cbDatastatus.pairingState === "PAIRING" || cbDatastatus.pairingState === "SEARCHING") {
                    this.showScanningStatus()
                    this.hasStartedPairingAttempt = true
                    if (!this.pairingAttemptTimeout) {
                        this.startPairingAttemptTimeout()
                    }
                } else if (cbDatastatus.pairingState === "IDLE" || cbDatastatus.pairingState === "FAILED") {
                    if (cbDatastatus.pairingState === 'FAILED') {
                        this.clearPairingAttemptTimeout()
                        this.showNoDeviceFoundStatus()
                        this.schedulePairingRetry(this.retryDelayMilliseconds)
                    } else {
                        this.showScanningStatus()
                        if (!this.hasStartedPairingAttempt) {
                            this.schedulePairingRetry(0)
                        }
                    }
                } else {
                    // Unknown pairingState with no remoteData — keep scanning, do not disrupt retry loop
                    this.showScanningStatus()
                    if (!this.hasStartedPairingAttempt) {
                        this.schedulePairingRetry(0)
                    }
                }
            }
        }
    }

    _focus() {
        this._setState("RCInformationScreen")
    }

    _handleBack() {
        if (!Router.isNavigating()) {
            Router.navigate('settings')
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
