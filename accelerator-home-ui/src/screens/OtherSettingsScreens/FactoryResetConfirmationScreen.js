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
import NetworkManager from '../../api/NetworkManagerAPI.js'
import AlexaApi from '../../api/AlexaApi.js';
import RCApi from '../../api/RemoteControl'
import Warehouse from '../../api/WarehouseApis.js'

const appApi = new AppApi()
const _btApi = new BluetoothApi()

/**
 * Class for Reboot Confirmation Screen.
 */
export default class RebootConfirmationScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

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
            this.LOG("FactoryReset: warehouse plugin status : " + JSON.stringify(resp[0].status));
            if (resp[0].status != 'activated') {
                Warehouse.get().activate().catch(err => {
                    this.ERR("FactoryReset: warehouse plugin activation failed; feature may not work." + JSON.stringify(err));
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
                let rsbass = await appApi.resetBassEnhancer(getsuportedmode.supportedAudioPorts[i]).catch((err) =>{ this.ERR("resetBassEnhancer" + JSON.stringify(err)) });
                if (rsbass.success != true) { this.LOG("resetBassEnhancer" + JSON.stringify(rsbass)) }
                let rsDialog = await appApi.resetDialogEnhancement(getsuportedmode.supportedAudioPorts[i]).catch((err) =>{ this.ERR("resetDialogEnhancement" + JSON.stringify(err)) })
                if (rsDialog.success != true) { this.LOG("resetDialogEnhancement" + JSON.stringify(rsDialog)) }
                let rsVirtualizer = await appApi.resetSurroundVirtualizer(getsuportedmode.supportedAudioPorts[i]).catch(err =>{ this.ERR("resetSurroundVirtualizer" + JSON.stringify(err)) });
                if (rsVirtualizer.success != true) { this.LOG("resetSurroundVirtualizer" + JSON.stringify(rsVirtualizer)) }
                let rsvolumelvel = await appApi.resetVolumeLeveller(getsuportedmode.supportedAudioPorts[i]).catch(err =>{ this.ERR("resetVolumeLeveller" + JSON.stringify(err)) });
                if (rsvolumelvel.success != true) { this.LOG("resetVolumeLeveller" + JSON.stringify(rsvolumelvel)) }
            }
        }
        let btActivate = await _btApi.btactivate().then(result => this.LOG("Btactivate" + JSON.stringify(result))).catch(err=> this.ERR("error while activating bluetooth"))
        let getPairedDevices = await _btApi.getPairedDevices().then(res=>res).catch(err => 0)
        this.LOG("getpairedDevices" + JSON.stringify(getPairedDevices))
        for(let i=0 ; i<getPairedDevices.length; i++){
            if(getPairedDevices.length > 0){
                let btunpair =  await _btApi.unpair(getPairedDevices[i].deviceId).catch(err => { this.ERR("btunpair" + JSON.stringify(err)) });
                if(btunpair.success != true){ this.LOG("btunpair" + JSON.stringify(btunpair)) }
            }
        }
        await RCApi.get().activate().then(()=>{ RCApi.get().factoryReset(); }).catch(err => this.ERR("error while resetting remote control" + JSON.stringify(err)));
        let contollerStat = await appApi.checkStatus("Monitor")
        for(let i=0; i< contollerStat[0].configuration.observables.length; i++){
            let monitorstat = await appApi.monitorStatus(contollerStat[0].configuration.observables[i].callsign).catch(err =>{ this.ERR("monitorStatus" + JSON.stringify(err)) });
            if(monitorstat.length < 0){ this.LOG("monitorStatus" + JSON.stringify(monitorstat)) }
        }
        await Warehouse.get().internalReset().catch(err => { this.ERR("internalReset" + JSON.stringify(err)) });
        await Warehouse.get().isClean().catch(err => { this.ERR("isClean" + JSON.stringify(err)) });
        await Warehouse.get().lightReset().catch(err => { this.ERR("lightReset" + JSON.stringify(err))});
        await Warehouse.get().resetDevice().catch(err => { this.ERR("resetDevice" + JSON.stringify(err)) });

        let rsactivitytime = await appApi.resetInactivityTime().catch(err => { this.ERR("resetInactivityTime" + JSON.stringify(err)) });
        if (rsactivitytime.success != true) { this.LOG("rsactivitytime" + JSON.stringify(rsactivitytime)) }
        let clearLastDeepSleepReason = await appApi.clearLastDeepSleepReason().catch(err => { this.ERR("clearLastDeepSleepReason" + JSON.stringify(err)) });
        if (clearLastDeepSleepReason.success != true) { this.LOG("clearLastDeepSleepReason" + JSON.stringify(clearLastDeepSleepReason)) }
        let GetKnownSSIDs = await NetworkManager.GetKnownSSIDs().then((ssids)=>{ssids}).catch(err =>  { console.error("GetKnownssids",err) });
        let clearSSID =false
        if(GetKnownSSIDs && GetKnownSSIDs.length>0)
        {
            for(let i=0;i<GetKnownSSIDs.length;i++)
            {
                {clearSSID= await NetworkManager.RemoveKnownSSID(ssids[i]).catch(err =>  { this.ERR("clearSSID" + JSON.stringify(err)) });}
            }
        }
        if (clearSSID != true)  { this.LOG("clearSSID" + JSON.stringify(clearSSID)) }
        let wifidisconnect = await NetworkManager.WiFiDisconnect().catch(err =>{ this.ERR("wifidisconnect" + JSON.stringify(err)) });
        if (wifidisconnect.success != true) { this.LOG("wifidisconnect" + JSON.stringify(wifidisconnect)) }
        await appApi.clearCache().catch(err => { this.ERR("clearCache error: " + JSON.stringify(err)) })
        await appApi.reboot("User Trigger").then(result => { this.LOG('device rebooting' + JSON.stringify(result))})
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
