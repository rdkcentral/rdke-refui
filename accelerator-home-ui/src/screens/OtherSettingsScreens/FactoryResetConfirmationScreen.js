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
import { Lightning, Utils, Router, Language } from '@lightningjs/sdk'
import AppApi from '../../api/AppApi'
import BluetoothApi from '../../api/BluetoothApi'
import { CONFIG,GLOBALS } from '../../Config/Config'
import WiFi from '../../api/WifiApi'
import AlexaApi from '../../api/AlexaApi.js';
import RCApi from '../../api/RemoteControl'
import Warehouse from '../../api/WarehouseApis.js'

const appApi = new AppApi()
const _btApi = new BluetoothApi()

/**
 * Class for Reboot Confirmation Screen.
 */
export default class RebootConfirmationScreen extends Lightning.Component {
    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            w: 1920,
            h: 2000,
            rect: true,
            color: 0xCC000000,
            RebootScreen: {
                x: 950,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Factory Reset"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Click Confirm to FactoryReset!"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                Buttons: {
                    x: 100, y: 200, w: 440, mountX: 0.5, h: 50,
                    Confirm: {
                        x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Confirm"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                    Cancel: {
                        x: 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFF7D7D7D,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Cancel"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Loader: {
                    x: 0,
                    y: 150,
                    mountX: 0.5,
                    w: 90,
                    h: 90,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: false
                },
            }
        }
    }

    _init() {
        this.AppApi = new AppApi()
    }

    _focus() {
        this._setState('Confirm')
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        });
    }


    _firstEnable() {
        this.AppApi.checkStatus(Warehouse.get().callsign).then(resp => {
            console.log("FactoryReset: warehouse plugin status : ", resp[0].status);
            if (resp[0].status != 'activated') {
                Warehouse.get().activate().catch(err => {
                    console.error("FactoryReset: warehouse plugin activation failed; feature may not work.");
                });
            }
        });
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/advanced/device')
        }
    }

    async _performFactoryReset() {
        // Deactivate SmartScreen instance to prevent overlay when Auth is revoked.
        AlexaApi.get().disableSmartScreen();
        if(GLOBALS.AlexaAvsstatus){AlexaApi.get().resetAVSCredentials();}
        AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending");
        let getsuportedmode = await appApi.getSupportedAudioPorts();
        for (let i = 0; i < getsuportedmode.supportedAudioPorts.length; i++) {
            if(getsuportedmode.supportedAudioPorts[i] != 'SPDIF0'){
            let rsbass = await appApi.resetBassEnhancer(getsuportedmode.supportedAudioPorts[i]).catch((err) =>{ console.log("resetBassEnhancer",err)});
            if (rsbass.success != true) { console.log("resetBassEnhancer",rsbass)}//throw new Error(rsbass); }//{Promise.reject(false); return}
            let rsDialog = await appApi.resetDialogEnhancement(getsuportedmode.supportedAudioPorts[i]).catch((err) =>{ console.log("resetDialogEnhancement",err)})//{Promise.reject(JSON.stringify(err))});
            if (rsDialog.success != true) { console.log("resetDialogEnhancement",rsDialog) }
            let rsVirtualizer = await appApi.resetSurroundVirtualizer(getsuportedmode.supportedAudioPorts[i]).catch(err =>{ console.log("resetSurroundVirtualizer",err)});
            if (rsVirtualizer.success != true) { console.log("resetSurroundVirtualizer",rsVirtualizer) }
            let rsvolumelvel = await appApi.resetVolumeLeveller(getsuportedmode.supportedAudioPorts[i]).catch(err =>{ console.log("resetVolumeLeveller",err)});
            if (rsvolumelvel.success != true) { console.log("resetVolumeLeveller",rsvolumelvel) }
            }
        }
        let btActivate = await _btApi.btactivate().then(result => console.log("Btactivate",result)).catch(err=> console.log(`error while activating bluetooth`))
        let getPairedDevices = await _btApi.getPairedDevices().then(res=>res).catch(err => 0)
        console.log("getpairedDevices", getPairedDevices)
        for(let i=0 ; i<getPairedDevices.length; i++){
            if(getPairedDevices.length > 0){
                let btunpair =  await _btApi.unpair(getPairedDevices[i].deviceId).catch(err => { console.log("btunpair",err) });
                if(btunpair.success != true){ console.log("btunpair",btunpair) }
            }
        }
        await RCApi.get().activate().then(()=>{ RCApi.get().factoryReset(); }).catch(err => console.log(`error while resetting remote control`));
        let contollerStat = await appApi.checkStatus("Monitor")
        for(let i=0; i< contollerStat[0].configuration.observables.length; i++){
            let monitorstat = await appApi.monitorStatus(contollerStat[0].configuration.observables[i].callsign).catch(err =>{ console.log("monitorStatus",err) });
            if(monitorstat.length < 0){ console.log("monitorStatus",monitorstat) }
        }
        // warehouse apis
        await Warehouse.get().internalReset().catch(err => { console.error("internalReset",err) });
        await Warehouse.get().isClean().catch(err => { console.error("isClean",err) });
        await Warehouse.get().lightReset().catch(err => { console.error("lightReset",err)});
        await Warehouse.get().resetDevice().catch(err => { console.error("resetDevice",err) });

        let rsactivitytime = await appApi.resetInactivityTime().catch(err => { console.error("resetInactivityTime",err) });
        if (rsactivitytime.success != true) { console.log("rsactivitytime",rsactivitytime) }
        let clearLastDeepSleepReason = await appApi.clearLastDeepSleepReason().catch(err => { console.error("clearLastDeepSleepReason",err) });
        if (clearLastDeepSleepReason.success != true) { console.log("clearLastDeepSleepReason",clearLastDeepSleepReason) }
        let clearSSID = await WiFi.get().clearSSID().catch(err =>  { console.error("clearSSID",err) });
        if (clearSSID.success != true)  { console.log("clearSSID",clearSSID) }
        let wifidisconnect = await WiFi.get().disconnect().catch(err =>{ console.error("wifidisconnect",err) });
        if (wifidisconnect.success != true) { console.log("wifidisconnect",wifidisconnect) }
        await appApi.clearCache().catch(err => { console.error("clearCache error: ", err)})
        await appApi.reboot("User Trigger").then(result => { console.log('device rebooting' + JSON.stringify(result))})
    }

    static _states() {
        return [
            class Confirm extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    this._setState('Rebooting')
                    /* Do any clean-up before _performFactoryReset() as it ends with a reboot. */
                    this._performFactoryReset()
                }
                _handleRight() {
                    this._setState('Cancel')
                }
                _focus() {
                    this.tag('Confirm').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Confirm').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class Cancel extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                if(!Router.isNavigating()){
                    Router.back()
                }
                }
                _handleLeft() {
                    this._setState('Confirm')
                }
                _focus() {
                    this.tag('Cancel').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Cancel').patch({
                        color: 0xFF7D7D7D
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class Rebooting extends this {
                $enter() {
                    this.loadingAnimation.start()
                    this.tag("Loader").visible = true
                    this.tag("Title").text.text = Language.translate("Rebooting")+"..."
                    this.tag('Buttons').visible = false
                    this.tag('Info').visible = false
                }

                $exit(){
                    this.loadingAnimation.stop();
                    this.tag("Loader").visible = false
                    this.tag('Buttons').visible = true
                    this.tag('Info').visible = true
                }
                _handleEnter() {
                    // do nothing
                }
                _handleLeft() {
                    // do nothing
                }
                _handleRight() {
                    // do nothing
                }
                _handleBack() {
                    // do nothing
                }
                _handleUp() {
                    // do nothing
                }
                _handleDown() {
                    // do nothing
                }
            }
        ]
    }
}
