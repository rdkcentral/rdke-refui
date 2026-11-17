/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
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
import { CONFIG } from '../../Config/Config'
import { Keyboard } from '../../ui-components/index'
import { KEYBOARD_FORMATS } from '../../ui-components/components/Keyboard'
import AppApi from '../../api/AppApi';
import CECApi from '../../api/CECApi';

export default class FriendlyNameScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.LOG = console.log;
        this.ERR = console.error;
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device  Device Name'));
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
            FriendlyNameScreenContents: {
                x: 200,
                y: 275,
                Name: {
                    NameLabel: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate("Device Name") + ": ",
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        },
                    },
                    NameBox: {
                        x: 320,
                        texture: Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
                    },
                    NameText: {
                        x: 340,
                        y: 20,
                        zIndex: 2,
                        text: {
                            text: '',
                            fontSize: 25,
                            fontFace: CONFIG.language.font,
                            textColor: 0xffffffff,
                            wordWrapWidth: 1240,
                            wordWrap: false,
                            textOverflow: 'ellipsis',
                        },
                    },
                },
                Status: {
                    x: 330,
                    y: 90,
                    text: {
                        text: '',
                        fontSize: 22,
                        fontFace: CONFIG.language.font,
                        textColor: 0xffffffff,
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

    _init() {
        this.appApi = new AppApi();
        this.cecApi = new CECApi();
        this.currentName = '';
        this.textCollection = '';
        this.saving = false;
        this.loading = false;
        this.readId = 0;
        this._setState('Name');
    }

    _focus() {
        this.tag('Status').text.text = '';
        this.refreshName();
        this._setState(this.state);
    }

    refreshName() {
        if (this.saving || this.state === 'Keyboard') {
            return;
        }
        const readId = ++this.readId;
        this.loading = true;
        this.appApi.getFriendlyName().then(result => {
            if (readId === this.readId) {
                this.currentName = result.friendlyName || '';
            }
        }).catch(err => {
            this.ERR("FriendlyNameScreen getFriendlyName error: " + JSON.stringify(err));
        }).finally(() => {
            if (readId === this.readId) {
                this.loading = false;
                this.tag('NameText').text.text = this.currentName;
            }
        });
    }

    showText() {
        this.tag('NameText').text.text = this.textCollection;
    }

    closeKeyboard() {
        this.tag('Keyboard').visible = false;
        this.tag('NameText').text.text = this.currentName;
        this._setState('Name');
    }

    handleDone() {
        const name = this.textCollection.trim();
        if (!name) {
            this.tag('Status').text.text = Language.translate('Device name cannot be empty');
            return;
        }

        this.saving = true;
        this.readId++;
        this.loading = false;
        this.tag('Keyboard').visible = false;
        this.tag('NameText').text.text = name;
        this._setState('Name');

        this.appApi.setUserFriendlyName(name).then(() => {
            this.currentName = name;
            this.tag('Status').text.text = Language.translate('Device name saved');
            this.LOG("FriendlyNameScreen: friendly name set to " + JSON.stringify(name));
            this.cecApi.setOSDName(name);
        }).catch(err => {
            this.tag('Status').text.text = Language.translate('Failed to save device name');
            this.ERR("FriendlyNameScreen setFriendlyName error: " + JSON.stringify(err));
        }).finally(() => {
            this.saving = false;
            this.tag('NameText').text.text = this.currentName;
        });
    }

    _handleBack() {
        if (!Router.isNavigating()) {
            Router.navigate('settings/advanced/device')
        }
    }

    static _states() {
        return [
            class Name extends this {
                $enter() {
                    this.tag('NameBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, CONFIG.theme.hex, false)
                }
                $exit() {
                    this.tag('NameBox').texture = Lightning.Tools.getRoundRect(1273, 58, 0, 3, 0xffffffff, false)
                }
                _handleEnter() {
                    if (this.saving || this.loading) {
                        return;
                    }
                    this.textCollection = this.currentName;
                    this.tag('Status').text.text = '';
                    this.showText();
                    this.tag('Keyboard').visible = true;
                    this._setState('Keyboard');
                }
            },
            class Keyboard extends this {
                _getFocused() {
                    return this.tag('Keyboard')
                }
                $onSoftKey({ key }) {
                    if (key === 'Done') {
                        this.handleDone();
                    } else if (key === 'Clear') {
                        this.textCollection = this.textCollection.substring(0, this.textCollection.length - 1);
                        this.showText();
                    } else if (key === '#@!' || key === 'abc' || key === 'áöû' || key === 'shift') {
                        return;
                    } else if (key === 'Space') {
                        this.textCollection += ' ';
                        this.showText();
                    } else if (key === 'Delete') {
                        this.textCollection = '';
                        this.showText();
                    } else {
                        this.textCollection += key;
                        this.showText();
                    }
                }
                _handleUp() {
                    this.closeKeyboard();
                }
                _handleBack() {
                    this.closeKeyboard();
                }
            }
        ]
    }
}
