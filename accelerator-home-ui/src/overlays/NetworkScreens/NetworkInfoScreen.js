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

import { Lightning, Language } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG ,GLOBALS } from '../../Config/Config'
import NetworkManager from '../../api/NetworkManagerAPI';

var currentInterface = [];

export default class NetworkInfo extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }
    static _template() {
        return {
            NetworkInfoScreenContents: {
                x: 200,
                y: 275,
                Status: {
                    y: 0,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Status: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                ConnectionType: {
                    alpha: 0,
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Connection Type: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                IPAddress: {
                    alpha: 0,
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('IP Address: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Gateway: {
                    alpha: 0,
                    y: 270,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Gateway: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                MACAddress: {
                    alpha: 0,
                    y: 360,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('MAC Address: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                InternetProtocol: {
                    alpha: 0,
                    y: 450,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Internet Protocol: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                SSID: {
                    alpha: 0,
                    y: 540,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('SSID: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                SignalStrength: {
                    alpha: 0,
                    y: 630,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Signal Strength: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 500,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: '',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
            },
        }
    }

    _active() {
        this.onInterfaceStateChangeCB = NetworkManager.thunder.on(NetworkManager.callsign,'onInterfaceStateChange', data => {
            this.refreshDetails();
        })
        this.onAddressChangeCB = NetworkManager.thunder.on(NetworkManager.callsign,'onAddressChange', data => {
            this.refreshDetails();
        })
        this.onActiveInterfaceChangeCB = NetworkManager.thunder.on(NetworkManager.callsign,'onActiveInterfaceChange', data => {
            this.refreshDetails();
        })
    }

    _inactive() {
        this.onInterfaceStateChangeCB.dispose()
        this.onAddressChangeCB.dispose()
        this.onActiveInterfaceChangeCB.dispose()
    }

    _disable() {
        if (this.NetworkManagerActivated) {NetworkManager.deactivate()}
    }

    setConnectedRowsVisibility(isConnected) {
        const connectedAlpha = isConnected ? 1 : 0
        this.tag("ConnectionType").alpha = connectedAlpha
        this.tag("IPAddress").alpha = connectedAlpha
        this.tag("Gateway").alpha = connectedAlpha
        this.tag("MACAddress").alpha = connectedAlpha
        this.tag("InternetProtocol").alpha = connectedAlpha
        if (!isConnected) {
            this.tag("SSID").alpha = 0
            this.tag("SignalStrength").alpha = 0
        }
    }

    async refreshDetails() {
        this.tag("ConnectionType.Value").text.text = `NA`
        this.tag("Status.Value").text.text = Language.translate('Loading...')
        this.tag("IPAddress.Value").text.text = `NA`
        this.tag("Gateway.Value").text.text = `NA`
        this.tag("MACAddress.Value").text.text = `NA`
        this.tag('InternetProtocol.Value').text.text = 'NA'
        this.tag('SSID.Value').text.text = 'NA'
        this.tag('SignalStrength.Value').text.text = 'NA'
        this.setConnectedRowsVisibility(false)

        try {
            const defaultInterface = await NetworkManager.GetPrimaryInterface()
            console.log("defaultinterface" + defaultInterface)

            const interfaces = await NetworkManager.GetAvailableInterfaces()
            const matchedInterface = interfaces.find((data) => data.name === defaultInterface)
            if (!matchedInterface || !matchedInterface.connected) {
                this.tag('Status.Value').text.text = Language.translate('Disconnected')
                return
            }

            this.tag("Status.Value").text.text = Language.translate('Connected')
            this.tag('MACAddress.Value').text.text = matchedInterface.mac
            this.setConnectedRowsVisibility(true)

            const result = await NetworkManager.GetIPSettings(defaultInterface)
            if (result.interface === "wlan0") {
                this.tag("ConnectionType.Value").text.text = Language.translate("Wireless")
                this.tag("SSID").alpha = 1
                this.tag("SignalStrength").alpha = 1
                try {
                    const connectedSsidResult = await NetworkManager.GetConnectedSSID()
                    if (parseInt(connectedSsidResult.strength) >= -50) {
                        this.tag("SignalStrength.Value").text.text = `Excellent`
                    }
                    else if (parseInt(connectedSsidResult.strength) >= -60) {
                        this.tag("SignalStrength.Value").text.text = `Good`
                    }
                    else if (parseInt(connectedSsidResult.strength) >= -67) {
                        this.tag("SignalStrength.Value").text.text = `Fair`
                    }
                    else {
                        this.tag("SignalStrength.Value").text.text = `Poor`
                    }
                    this.tag("SSID.Value").text.text = `${connectedSsidResult.ssid}`
                } catch (error) {
                    this.ERR("GetConnectedSSID error: " + JSON.stringify(error))
                }
            } else if (result.interface === "eth0") {
                this.tag("ConnectionType.Value").text.text = 'Ethernet'
                this.tag("SSID").alpha = 0
                this.tag("SignalStrength").alpha = 0
            }

            this.tag('InternetProtocol.Value').text.text = result.ipversion
            this.tag('IPAddress.Value').text.text = result.ipaddress
            this.tag("Gateway.Value").text.text = result.gateway
        } catch (error) {
            this.ERR("GetPrimaryInterface error: " + JSON.stringify(error))
            this.tag('Status.Value').text.text = Language.translate('Disconnected')
        }
    }

    _focus() {
        this.refreshDetails()
    }

    _unfocus() {
        this.setConnectedRowsVisibility(false)
    }
}
