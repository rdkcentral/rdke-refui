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
import { Lightning, Utils, Language, Router } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import { Keyboard } from '../../ui-components/index'
import { KEYBOARD_FORMATS } from '../../ui-components/components/Keyboard'
import TTSApi from '../../api/TTSApi';
import UserSettingsApi from '../../api/UserSettingsApi';

export default class TTSScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  TTS'));
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
            TTSScreenContents: {
                x: 200,
                y: 275,
                Endpoint: {
                    EndpointName: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate("TTS Endpoint") + ": ",
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        },
                    },
                    EndpointBox: {
                        x: 320,
                        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
                    },
                    EndpointText: {
                        x: 340,
                        y: 20,
                        zIndex: 2,
                        text: {
                            text: '',
                            fontSize: 25,
                            fontFace: CONFIG.language.font,
                            textColor: 0xffffffff,
                            wordWrapWidth: 1300,
                            wordWrap: false,
                            textOverflow: 'ellipsis',
                        },
                    },
                },
                Enable: {
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Enable'),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 67,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/ToggleOffWhite.png'),
                    },
                },
                Keyboard: {
                    y: 300,
                    x: 200,
                    type: Keyboard,
                    visible: false,
                    zIndex: 2,
                    formats: KEYBOARD_FORMATS.qwerty
                },
            },
        }

    }

    refreshEnableButtonState() {
        this.ttsApi.isttsenabled()
            .then(ttsApiIsEnabled => {
                this.userSettingsApi.getVoiceGuidance()
                    .then(userSettingsApiIsEnabled => {
                        this.ttsSupport = ttsApiIsEnabled && userSettingsApiIsEnabled;
                        this.LOG("TTS API: " + JSON.stringify(ttsApiIsEnabled) + " US: " + JSON.stringify(userSettingsApiIsEnabled))
                        if (this.ttsSupport === true) {
                            this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
                        }
                        else {
                            this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
                        }
                });
        });
    }
    refreshEnableButtonOpacity() {
        this.ttsApi.getttsconfiguration()
            .then(result => {
                if((result.ttsendpoint && result.ttsendpoint !== " ") ||  (result.ttsendpointsecured && result.ttsendpointsecured !== " ") ){
                    this.ttsEnableButtonActive = true;
                    this.tag('Enable').alpha = 1;
                }
                else {
                    this.ttsEnableButtonActive = false;
                    this.tag('Enable').alpha = 0.3;
                }
        });
    }

    handleDone() {
        this.ttsApi.setttsconfiguration({
            "ttsendpoint": this.textCollection,
            "ttsendpointsecured": this.textCollection
        });
        this.tag("Keyboard").visible = false
        this._setState("Endpoint");
        this.refreshEnableButtonOpacity();
    }

    _init() {
        this._setState('Endpoint')

        this.ttsApi = new TTSApi();
        this.userSettingsApi = new UserSettingsApi();

        this.ttsApi.activate();
        this.userSettingsApi.activate();

        this.textCollection = '';
    }

    _focus() {
        this.tag("EndpointText").text.text = Language.translate("Press OK to enter TTS endpoint");
        this._setState(this.state)
        this.refreshEnableButtonState();
        this.refreshEnableButtonOpacity();
    }

    _enable() {
        this.refreshEnableButtonState();
        this.refreshEnableButtonOpacity();
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/advanced')
        }
    }

    toggleTTS() {
        if(this.ttsSupport) {
            this.ttsApi.enabletts(false);
            this.userSettingsApi.setVoiceGuidance(false);
        }
        else {
            this.ttsApi.enabletts(true);
            this.userSettingsApi.setVoiceGuidance(true);
        }
    }

    static _states() {
        return [
            class Endpoint extends this{
                $enter() {
                    this.tag('EndpointBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
                }
                $exit() {
                    this.tag('EndpointBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
                }
                _handleUp() {
                    if(this.ttsEnableButtonActive){
                        this._setState("Enable");
                    }
                }
                _handleDown() {
                    if(this.ttsEnableButtonActive){
                        this._setState("Enable");
                    }
                }
                _handleEnter() {
                    this._setState('Keyboard')
                    this.tag('EndpointText').text.text = this.textCollection
                    this.tag('EndpointText').text.textColor = 0xffffffff
                    this.tag("Keyboard").visible = true
                }
            },
            class Enable extends this{
                $enter() {
                    this.tag('Enable')._focus()
                }
                $exit() {
                    this.tag('Enable')._unfocus()
                }
                _handleUp() {
                    this._setState("Endpoint");
                }
                _handleDown() {
                    this._setState("Endpoint");
                }
                _handleEnter() {
                    this.toggleTTS();
                    this.refreshEnableButtonState();
                }
            },
            class Keyboard extends this{
                $enter() {
                }
                _getFocused() {
                  return this.tag('Keyboard')
                }
                $onSoftKey({ key }) {
                  if (key === 'Done') {
                    this.handleDone();
                  } else if (key === 'Clear') {
                    this.textCollection = this.textCollection.substring(0, this.textCollection.length - 1);
                    this.tag('EndpointText').text.text = this.textCollection;
                  } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
                    this.LOG("no saving")
                  } else if (key === 'Space') {
                    this.textCollection += ' '
                    this.tag('EndpointText').text.text = this.textCollection;
                  } else if (key === 'Delete') {
                    this.textCollection = ''
                    this.tag('EndpointText').text.text = this.textCollection;
                  } else {
                    this.textCollection += key
                    this.tag('EndpointText').text.text = this.textCollection;
                  }
                }
                _handleUp() {
                  this._setState("Endpoint");
                }
                _handleBack() {
                  this.textCollection = '';
                  this.tag('EndpointText').text.text = '';
                  this.tag("Keyboard").visible = false
                  this._setState("Endpoint");
                }
            }
        ]
    }
}
