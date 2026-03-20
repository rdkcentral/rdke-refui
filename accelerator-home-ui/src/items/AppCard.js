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

import { Lightning, Utils, Language } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";

class ActionButton extends Lightning.Component {
    static _template() {
        return {
            rect: true,
            w: 160,
            h: 40,
            color: 0xFF3D3D3D,
            shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 6
            },
            FocusIndicator: {
                alpha: 0,
                x: -4,
                y: -4,
                rect: true,
                w: 168,
                h: 48,
                color: 0x00000000,
                shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 10,
                    stroke: 3,
                    strokeColor: 0xFFFFFFFF
                }
            },
            Label: {
                mount: 0.5,
                x: 80,
                y: 20,
                text: {
                    text: '',
                    fontSize: 18,
                    fontFace: CONFIG.language.font,
                    textColor: 0xFFFFFFFF
                }
            }
        }
    }

    set label(text) {
        this.tag('Label').text.text = text;
    }

    set action(actionType) {
        this._action = actionType;
    }

    get action() {
        return this._action;
    }

    _focus() {
        this.tag('FocusIndicator').alpha = 1;
        this.patch({
            color: CONFIG.theme.hex,
            smooth: { scale: 1.1 }
        });
        this.tag('Label').patch({
            text: { textColor: 0xFFFFFFFF }
        });
    }

    _unfocus() {
        this.tag('FocusIndicator').alpha = 0;
        this.patch({
            color: 0xFF3D3D3D,
            smooth: { scale: 1 }
        });
    }
}

export default class AppCard extends Lightning.Component {
    static _template() {
        return {
            rect: true,
            w: AppCard.width,
            h: AppCard.height,
            color: 0xFF1A1A1A,
            shader: {
                type: Lightning.shaders.RoundedRectangle,
                radius: 10
            },
            Border: {
                rect: true,
                w: AppCard.width,
                h: AppCard.height,
                color: 0x00000000,
                shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 10,
                    stroke: 2,
                    strokeColor: 0xFF3D3D3D
                }
            },
            
            // Left: App Icon (40px from left edge)
            AppIcon: {
                x: 40,
                y: 15, // Vertically centered: (150 - 120) / 2 = 15
                rect: true,
                w: 160,
                h: 120,
                color: 0xFF2D2D2D,
                shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 8
                },
                IconImage: {
                    w: 160,
                    h: 120,
                    shader: {
                        type: Lightning.shaders.RoundedRectangle,
                        radius: 8
                    }
                }
            },

            // Middle: App Details (40px gap after icon)
            AppDetails: {
                x: 240, // 40 + 160 + 40 = 240
                y: 25,
                w: 450,
                AppName: {
                    text: {
                        text: '',
                        fontSize: 26,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFFFFFFFF,
                        fontStyle: 'bold',
                        wordWrapWidth: 440
                    }
                },
                Version: {
                    y: 35,
                    text: {
                        text: '',
                        fontSize: 18,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFFAAAAAA
                    }
                },
                BasePackageVersion: {
                    y: 60,
                    text: {
                        text: '',
                        fontSize: 18,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFFAAAAAA
                    }
                }
            },

            // Right: Action Buttons (520px total, 40px from right edge)
            // Position: 1640 - 40 - 520 = 1080
            ActionButtons: {
                x: 1080,
                y: 55, // Vertically centered: (150 - 40) / 2 = 55
                LaunchButton: {
                    x: 0,
                    type: ActionButton,
                    label: Language.translate('Launch'),
                    action: 'launch'
                },
                UpdateButton: {
                    x: 180, // 160 + 20 spacing
                    type: ActionButton,
                    label: Language.translate('Update'),
                    action: 'update'
                },
                UninstallButton: {
                    x: 360, // 160 + 20 + 160 + 20
                    type: ActionButton,
                    label: Language.translate('Uninstall'),
                    action: 'uninstall'
                }
            },

            FocusBorder: {
                alpha: 0,
                rect: true,
                w: AppCard.width,
                h: AppCard.height,
                color: 0x00000000,
                shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 10,
                    stroke: 3,
                    strokeColor: CONFIG.theme.hex
                }
            }
        }
    }

    static get width() {
        return 1640; // 1920 - 200 - 60 (scrollbar) - 20 padding
    }

    static get height() {
        return 150;
    }

    _init() {
        this._buttonIndex = 0;
        this._buttons = ['LaunchButton', 'UpdateButton', 'UninstallButton'];
    }

    set appInfo(data) {
        this._appInfo = data;
        
        // Set app name
        const appName = data.name || data.appName || (data.installed && data.installed[0] && data.installed[0].appName) || 'Unknown App';
        this.tag('AppDetails.AppName').text.text = appName;
        
        // Set version
        const version = data.version || (data.installed && data.installed[0] && data.installed[0].version) || '';
        this.tag('AppDetails.Version').text.text = version ? `${Language.translate('Version')}: ${version}` : '';
        
        // Set base package version
        const baseVersion = data.basePackageVersion || (data.installed && data.installed[0] && data.installed[0].basePackageVersion) || '';
        this.tag('AppDetails.BasePackageVersion').text.text = baseVersion ? `${Language.translate('Base Package')}: ${baseVersion}` : '';
        
        // Set icon
        if (data.icon) {
            if (data.icon.startsWith('/images')) {
                this.tag('AppIcon.IconImage').patch({ src: Utils.asset(data.icon) });
            } else {
                this.tag('AppIcon.IconImage').patch({ src: data.icon });
            }
        }

        // Show/hide update button based on update availability
        if (!data.hasUpdate) {
            this.tag('ActionButtons.UpdateButton').alpha = 0.5;
        }
    }

    get appInfo() {
        return this._appInfo;
    }

    _focus() {
        this.tag('FocusBorder').alpha = 1;
        this.patch({ smooth: { scale: 1.02 } });
        this._focusButton();
    }

    _unfocus() {
        this.tag('FocusBorder').alpha = 0;
        this.patch({ smooth: { scale: 1 } });
        this._unfocusAllButtons();
    }

    _focusButton() {
        this._unfocusAllButtons();
        const button = this.tag(`ActionButtons.${this._buttons[this._buttonIndex]}`);
        if (button) {
            button._focus();
        }
    }

    _unfocusAllButtons() {
        this._buttons.forEach(btn => {
            const button = this.tag(`ActionButtons.${btn}`);
            if (button) {
                button._unfocus();
            }
        });
    }

    _handleLeft() {
        if (this._buttonIndex > 0) {
            this._buttonIndex--;
            this._focusButton();
            return true;
        }
        return false;
    }

    _handleRight() {
        if (this._buttonIndex < this._buttons.length - 1) {
            this._buttonIndex++;
            this._focusButton();
            return true;
        }
        return false;
    }

    _handleUp() {
        // Return false to let parent handle navigation between AppCards
        return false;
    }

    _handleDown() {
        // Return false to let parent handle navigation between AppCards
        return false;
    }

    _handleEnter() {
        const button = this.tag(`ActionButtons.${this._buttons[this._buttonIndex]}`);
        if (button) {
            // Directly call the action handler instead of relying on signal
            const action = button.action;
            this._onButtonPressed(action);
        }
    }

    _onButtonPressed(action) {
        console.log('AppCard _onButtonPressed:', action, this._appInfo);
        // Use fireAncestors to bubble up the event to AppInfoPage
        this.fireAncestors('$appAction', { action, appInfo: this._appInfo });
    }

    // Reset button focus to first button when card regains focus
    _resetButtonFocus() {
        this._buttonIndex = 0;
    }
}
