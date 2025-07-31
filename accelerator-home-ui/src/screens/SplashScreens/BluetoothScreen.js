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

import { Lightning, Registry, Router, Utils, Language, Settings } from '@lightningjs/sdk'
import { CONFIG ,GLOBALS} from '../../Config/Config'
import AppApi from '../../api/AppApi';
import BluetoothApi from '../../api/BluetoothApi';
import ThunderJS from 'ThunderJS'
import RCApi from '../../api/RemoteControl';

var appApi = new AppApi();
var bluetoothApi = new BluetoothApi();
const _thunder = ThunderJS(CONFIG.thunderConfig)

export default class BluetoothScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            Bluetooth: {
                x: 960,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Pair your remote control"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                        fontStyle: 'bold'
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 135,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Put the remote control in pairing mode; scan will start in one moment"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                    visible: true
                },
                Timer: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    text: {
                        text: "0:30",
                        fontFace: CONFIG.language.font,
                        fontSize: 80,
                    },
                    visible: true
                },
                Loader: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    w: 110,
                    h: 110,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: false
                },
                Buttons: {
                    Continue: {
                        x: 0, y: 210, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Continue Setup"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: false
                    },
                    StartPairing: {
                        x: 0, y: 410, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: Language.translate("SKIP"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: true,
                        alpha: 0.5
                    },
                },
                BorderBottom: {
                    x: 0, y: 350, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            }
        }
    }

    _active() {
        this.timeout = 30;
    }

    _PairingApis() {
        //bluetoothApi.btactivate().then(enableResult =>{
        //  console.log('1')
        bluetoothApi.enable().then(res => {
            this.LOG("SplashBluetoothScreen enable result: " + JSON.stringify(res))
            bluetoothApi.startScanBluetooth().then(startScanresult => {
                this.LOG('SplashBluetoothScreen startScanresult ' + JSON.stringify(startScanresult))
                var SubscribeEvent = _thunder.on('org.rdk.Bluetooth', 'onDiscoveredDevice', notification => {
                    bluetoothApi.getDiscoveredDevices().then((getdocoveredInfo) => {
                        this.LOG('SplashBluetoothScreen onDiscoveredDevice ' + JSON.stringify(getdocoveredInfo[0].name))
                        this.tag('Info').text.text = `pairing this device ${getdocoveredInfo[0].name}`
                        //bluetoothApi.connect(getdocoveredInfo[0].deviceID, getdocoveredInfo[0].deviceType).then(connectresult=>{
                        //  console.log("connectresult",connectresult)
                        bluetoothApi.pair(getdocoveredInfo[0].deviceID).then(Pairresult => {
                            this.LOG("SplashBluetoothScreen Pairresult" + JSON.stringify(Pairresult))
                            bluetoothApi.getConnectedDevices().then(getCdresult => {
                                this.LOG("SplashBluetoothScreen getConnectedDevices" + JSON.stringify(getCdresult))
                                bluetoothApi.getPairedDevices().then(getpairedDevices => {
                                    this.LOG("SplashBluetoothScreen getpairedDevices" + JSON.stringify(getpairedDevices))
                                    bluetoothApi.stopScan().then(stopScan => {
                                        this.LOG("SplashBluetoothScreen stopscan" + JSON.stringify(stopScan))
                                        SubscribeEvent.dispose();
                                        //bluetoothApi.disable().then(disable =>{
                                        //console.log("disable")
                                        bluetoothApi.deactivateBluetooth().then(deactivateBluetooth => {
                                            this.LOG("SplashBluetoothScreen DeactivatedBluetooth" + JSON.stringify(deactivateBluetooth))
                                            if (Router.getActiveHash() === "splash/bluetooth") {
                                                Router.navigate('splash/language')
                                            }
                                        })

                                    })
                                        .catch(err => {
                                            this.ERR(`SplashBluetoothScreen cant stopscan device : ${JSON.stringify(err)}`)
                                        })
                                })
                                    .catch(err => {
                                        this.ERR("SplashBluetoothScreen cant stopscan device : " + JSON.stringify(err))
                                    })
                                })
                                .catch(err => {
                                    this.ERR("SplashBluetoothScreen cant getpaired device : " + JSON.stringify(err))
                                })
                            })
                            .catch(err => {
                                this.ERR(`SplashBluetoothScreen Can't pair device : ${JSON.stringify(err)}`)
                            })
                    })
                })
            })
            .catch(err => {
                this.ERR("Can't scan enable : " + JSON.stringify(err))
            })
        })
    }

    onStatusCB(cbData) {
        //console.log("BluetoothScreen cbData:", JSON.stringify(cbData));
        // getStatus response has 'success' property; notification payload does not have that.
        if ((cbData !== undefined) && (cbData.hasOwnProperty("success") ? cbData.success : true)) {
            let cbDatastatus
            if (Array.isArray(cbData.status)) {
                cbDatastatus = cbData.status[0] || {};
              } 
            else if (cbData.status && typeof cbData.status === 'object') {
                cbDatastatus = cbData.status;
              }
            if (cbDatastatus.remoteData.length) {
                //console.log("BluetoothScreen rcPairingApis RemoteData Length ", cbData.status.remoteData.length)
                cbDatastatus.remoteData.map(item => {
                    this.tag('Info').text.text = `paired with device ${item.name}`
                    // Do not clear this.RCTimeout if need to run this in background to reconnect on loss.
                    // if (this.RCTimeout) {
                    //     console.log("SplashBluetoothScreen clearTimeout(this.RCTimeout)");
                    //     Registry.clearTimeout(this.RCTimeout)
                    // }
                    // To stop the display counter.
                    if (Router.getActiveHash() === "splash/bluetooth") {
                        if (this.timeInterval) {
                            Registry.clearInterval(this.timeInterval)
                        }
                        Registry.setTimeout(() => {
                            Router.navigate('splash/language')
                        }, 2000)
                    }
                })
            } else {
                if(cbDatastatus.pairingState != "SEARCHING" && cbDatastatus.pairingState != "PAIRING" ) {
                    for(let i=0;i<cbDatastatus.netTypesSupported.length;i++)
                    {
                        this.LOG("Netypesupported" + JSON.stringify(cbDatastatus.netTypesSupported[i]))
                        RCApi.get().startPairing(30,cbDatastatus.netTypesSupported[i]).catch(err => {
                            this.ERR("RCInformationScreen startPairing error: " + JSON.stringify(err));
                        });
                    }
                }
            }
        }
    }

    async rcPairingFlow(activatePlugin = false) {
        if (activatePlugin) {
            await RCApi.get().activate().catch(err => {
                this.ERR("SplashBluetoothScreen org.rdk.RemoteControl activate error: " + JSON.stringify(err))
                return;
            });
        }
        _thunder.on('org.rdk.RemoteControl', 'onStatus', data => { this.onStatusCB(data) });
        this.RCTimeout = Registry.setTimeout(() => {
            RCApi.get().getNetStatus().then(result => { this.onStatusCB(result); });
        }, 5, true);
    }

    _init() {
        appApi.getPluginStatus('org.rdk.RemoteControl').then(result => {
            if (result[0].state != "activated") {
                this.LOG("SplashBluetoothScreen init RemoteControl activate.")
                this.rcPairingFlow(true);
            } else {
                this.LOG("SplashBluetoothScreen init RemoteControl already activated.")
                this.rcPairingFlow();
            }
        }).catch(err => {
            this.ERR('SplashBluetoothScreen getPluginStatus org.rdk.RemoteControl error: ' + JSON.stringify(err))
            appApi.getPluginStatusParams('org.rdk.Bluetooth').then(pluginresult => {
                this.LOG("SplashBluetoothScreen getPluginStatusParams org.rdk.Bluetooth: " + JSON.stringify(pluginresult[1]))
                if (pluginresult[1] === 'deactivated') {
                    bluetoothApi.btactivate().then(result => {
                        this.LOG("SplashBluetoothScreen init pairing bluetooth" + JSON.stringify(result))
                        this._PairingApis()
                    })
                } else {
                    this.LOG("SplashBluetoothScreen init status not deactivated")
                    this._PairingApis()
                }
            })
        })
    }

    _active() {
        this.initTimer()
    }

    pageTransition() {
        return 'left'
    }

    initTimer() {
        this.timeInterval = Registry.setInterval(() => {
            if (this.timeout > 0) { --this.timeout }
            else { this.timeout = 30; }
            this.tag('Timer').text.text = this.timeout >= 10 ? `0:${this.timeout}` : `0:0${this.timeout}`
            if (this.timeout === 0) this._setState('StartPairing')
        }, 1000)
    }

    _inactive() {
        if (this.timeInterval) {
            Registry.clearInterval(this.timeInterval)
        }
        if (this.RCTimeout) {
            Registry.clearTimeout(this.RCTimeout)
        }
    }

    static _states() {
        return [
            class RemotePair extends this{
                $enter() {
                    this.tag('Timer').visible = true
                    this.tag('Info').text.text = Language.translate('Put the remote control in pairing mode; scan will start in one moment')
                }
                _handleRight() {
                    this._setState('Scanning')
                }
                $exit() {
                    this.tag('Timer').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class Scanning extends this{
                $enter() {
                    this.tag('Loader').visible = true
                    this.tag('Info').text.text = Language.translate('Scanning')
                }
                _handleRight() {
                    this._setState('PairComplete')
                }
                _handleLeft() {
                    this._setState('RemotePair')
                }
                $exit() {
                    this.tag('Loader').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class PairComplete extends this{
                $enter() {
                    this.tag('Buttons.Continue').visible = true
                    this.tag('Info').text.text = Language.translate('Pairing Successful')
                }
                _handleLeft() {
                    this._setState('Scanning')
                }
                _handleRight() {
                    Router.navigate('splash/language')
                }
                $exit() {
                    this.tag('Buttons.Continue').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class StartPairing extends this{
                $enter() {
                    this.tag('Buttons.StartPairing').alpha = 1
                    this._focus()
                }
                _focus() {
                    this.tag('Buttons.StartPairing').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Buttons.StartPairing.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _handleLeft() {

                }
                _handleRight() {

                }
                _handleEnter() {
                    console.log('SplashBluetoothScreen states Start Pairing')
                    GLOBALS.RCSkipStatus=true;
                    Router.navigate('splash/language')
                }
                $exit() {
                    this.tag('Buttons.StartPairing').alpha = 0.5
                }
            }
        ]
    }
}
