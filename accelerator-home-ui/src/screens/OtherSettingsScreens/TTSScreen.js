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
import AppApi from '../../api/TTSApi';
import TTSApi from '../../api/TTSApi';

export default class TTSScreen extends Lightning.Component {
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
                Enable: {
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
            },
        }

    }

    refreshEnableButton() {
        this.ttsApi.isEnabled()
            .then(res => {
                if (res) {
                    this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
                }
                else {
                    this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
                }
        });
    }

    _init() {
        this._setState('Enable')

        this.ttsApi = new TTSApi();
        this.ttsApi.activate();

        this.refreshEnableButton();
    }

    _focus() {
        this._setState(this.state)
        this.refreshEnableButton();
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/advanced')
        }
    }

    toggleTTS() {
        this.ttsApi.isEnabled()
            .then(res => {
                console.log(res)
                if (res) {
                    this.ttsApi.enable(false)
                        .then(() => {
                            this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOffWhite.png')
                        })
                }
                else {
                    this.ttsApi.enable(true)
                        .then(() => {
                            this.tag('Enable.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
                        })
                }
            })
    }

    static _states() {
        return [
            class Enable extends this{
                $enter() {
                    this.tag('Enable')._focus()
                }
                $exit() {
                    this.tag('Enable')._unfocus()
                }
                _handleUp() {
                }
                _handleDown() {
                }
                _handleEnter() {
                    this.toggleTTS();
                }
            },
        ]
    }
}