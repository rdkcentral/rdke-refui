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

export default class RCInformationScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
        this.pairingAttemptTimeout = null;
        this.loadingAnimation = null;
        this.pairingWatchdogSeconds = 35;
        this.queryStatusTimeout = null;
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

    showNoDeviceFoundStatus() {
        this.showPairingStatus(
            Language.translate('Please put the remote in pairing mode') + ': ' + Language.translate('No device found'),
            false
        )
    }

    clearPairingAttemptTimeout() {
        if (this.pairingAttemptTimeout) {
            Registry.clearTimeout(this.pairingAttemptTimeout)
            this.pairingAttemptTimeout = null
        }
    }

    // Schedules a pairing attempt after a delay; use a longer delay when acting as a watchdog for a startPairing() call.
    startPairingAttemptTimeout(timeOutSeconds = this.pairingWatchdogSeconds, showNoDeviceFoundStatus = false) {
        this.clearPairingAttemptTimeout()
        this.pairingAttemptTimeout = Registry.setTimeout(() => {
            this.pairingAttemptTimeout = null
            if (showNoDeviceFoundStatus) {
                this.showNoDeviceFoundStatus()
            }
            RCApi.get().startPairing(30).then(success => {
                if (success === false) this.startPairingAttemptTimeout(3, true)
                else {
                    // Fail-safe: we cannot rely on event if No RCU is found.
                    this.LOG("RCInformationScreen startPairingAttemptTimeout: RCApi.get().startPairing() success, scheduling queryStatusTimeout in 33 seconds.");
                    if (this.queryStatusTimeout) {
                        Registry.clearTimeout(this.queryStatusTimeout)
                        this.queryStatusTimeout = null
                    }
                    this.queryStatusTimeout = Registry.setTimeout(() => {
                        this.queryStatusTimeout = null
                        RCApi.get().getNetStatus().then(result => {
                            this.onStatusCB(result);
                        }).catch(err => this.ERR("RCInformationScreen error: " + JSON.stringify(err)));
                    }, 33000);
                }
            }).catch(err => {
                this.ERR('RCInformationScreen startPairing error: ' + JSON.stringify(err));
                this.startPairingAttemptTimeout(3, true)
            })
        }, timeOutSeconds * 1000)
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
                        text: Language.translate('Please put the remote in pairing mode') + ': ' + Language.translate('Scanning') + '...',
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
        this.setStatusValues('N/A')
        this.tag('DeviceInfoContents').visible = false
        this.tag('PairingStatus').visible = false
        this.clearPairingAttemptTimeout()
        this.onStatusCBhandle = _thunder.on('org.rdk.RemoteControl', 'onStatus', data => { this.onStatusCB(data) });
        await RCApi.get().getNetStatus().then(result => {
            this.onStatusCB(result);
        }).catch(err => this.ERR("RCInformationScreen error: " + JSON.stringify(err)));
    }

    async _inactive() {
        this.WARN("RCInformationScreen _inactive.");
        if(this.onStatusCBhandle != null) {
            this.onStatusCBhandle.dispose();
            this.onStatusCBhandle = null;
        }
        if (this.queryStatusTimeout) {
            Registry.clearTimeout(this.queryStatusTimeout)
            this.queryStatusTimeout = null
        }
        const [stopPairingResult] = await Promise.allSettled([
            RCApi.get().stopPairing()
        ]);
        if (stopPairingResult.status === 'fulfilled' && stopPairingResult.value === true) {
            this.INFO("RCInformationScreen stopPairing success");
        } else if (stopPairingResult.status === 'fulfilled') {
            this.WARN("RCInformationScreen stopPairing returned false");
        } else {
            this.ERR("RCInformationScreen stopPairing error: " + JSON.stringify(stopPairingResult.reason));
        }
        this.setStatusValues('N/A')
        this.clearPairingAttemptTimeout()
        if (this.loadingAnimation) {
            this.loadingAnimation.stop();
            this.tag('PairingStatus.LoadingIcon').rotation = 0
        }
        this.tag('PairingStatus.LoadingIcon').alpha = 0
        this.tag('DeviceInfoContents').visible = false
        this.tag('PairingStatus').visible = false
    }

    onStatusCB(cbData) {
        // getStatus response has 'success' property; notification payload does not have that.
        //this.WARN("RCInformationScreen onStatusCB cbData:" + JSON.stringify(cbData));
        if (cbData !== undefined) {
            let cbDatastatus = {}
            if ("success" in cbData ? cbData.success : true) {
                cbDatastatus = Array.isArray(cbData.status) ? cbData.status[0] || {} : (cbData.status && typeof cbData.status === 'object' ? cbData.status : {});
            }
            const pairingTriggerableStates = ["IDLE", "FAILED"];
            const doNotDisturbStates = ["SEARCHING", "PAIRING", "COMPLETE"];
            if (cbDatastatus.pairingState && doNotDisturbStates.includes(cbDatastatus.pairingState)) {
                if ("COMPLETE" === cbDatastatus.pairingState && cbDatastatus.remoteData && Array.isArray(cbDatastatus.remoteData)) {
                    if (cbDatastatus.remoteData.length > 0) {
                        // Show the details and finish the process. Let user interact and navigate away from this screen.
                        const item = cbDatastatus.remoteData[0]
                        this.tag("Status.Value").text.text = item.connected ? Language.translate('Connected') : Language.translate('Disconnected')
                        this.tag("MacAddress.Value").text.text = item.macAddress
                        this.tag("SwVersion.Value").text.text = item.swVersion
                        this.tag("BatteryPercent.Value").text.text = item.batteryPercent
                        this.tag("RCUName.Value").text.text = item.name
                        this.showDeviceInfo(true)
                    }
                    this.clearPairingAttemptTimeout()
                    if (this.queryStatusTimeout) {
                        Registry.clearTimeout(this.queryStatusTimeout)
                        this.queryStatusTimeout = null
                    }
                } else if ("PAIRING" === cbDatastatus.pairingState || "SEARCHING" === cbDatastatus.pairingState) {
                    // if PAIRING or SEARCHING - backend is actively scanning and trying to establish a connection and pair automatically. No need to trigger backend startPairing API.
                    if ("SEARCHING" === cbDatastatus.pairingState) {
                        this.showPairingStatus(
                            Language.translate('Please put the remote in pairing mode') + ': ' + Language.translate('Scanning') + '...',
                            true
                        )
                    } else if ("PAIRING" === cbDatastatus.pairingState) {
                        this.showPairingStatus(Language.translate('Pairing') + '...', true);
                    }
                }
            } else if (cbDatastatus.pairingState && pairingTriggerableStates.includes(cbDatastatus.pairingState)) {
                this.showDeviceInfo(false)
                // trigger pairing call with a delay to avoid choking.
                this.startPairingAttemptTimeout(3)
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
