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

import { Lightning, Router, Language, Utils } from "@lightningjs/sdk";
import { List } from "@lightningjs/ui";
import { CONFIG, GLOBALS } from "../Config/Config";
import AppCard from "../items/AppCard";
import { getInstalledDACApps, startDACApp, uninstallDACApp } from "../api/DACApi";

export default class AppInfoPage extends Lightning.Component {

    static _template() {
        return {
            rect: true,
            h: 1080,
            w: 1920,
            color: CONFIG.theme.background,
            
            Header: {
                x: 200,
                y: 120,
                Title: {
                    text: {
                        text: Language.translate('Installed Apps'),
                        fontSize: 36,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFFFFFFFF,
                        fontStyle: 'bold'
                    }
                },
                Subtitle: {
                    y: 50,
                    text: {
                        text: Language.translate('Manage your installed applications'),
                        fontSize: 22,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFF888888
                    }
                }
            },

            ListContainer: {
                x: 200,  
                y: 280,
                w: 1680, 
                h: 680,
                clipping: true,
                AppList: {
                    x: 20,  
                    type: List,
                    direction: 'column',
                    w: 1640, 
                    h: 680,
                    scroll: {
                        after: 4
                    },
                    spacing: 15,
                    signals: { onIndexChanged: '_onListIndexChanged' }
                }
            },

            // Scroll Indicator
            ScrollIndicator: {
                x: 1890,
                y: 280,
                w: 6,
                h: 680,
                rect: true,
                color: 0xFF333333,
                shader: {
                    type: Lightning.shaders.RoundedRectangle,
                    radius: 3
                },
                ScrollThumb: {
                    w: 6,
                    h: 150,
                    rect: true,
                    color: CONFIG.theme.hex,
                    shader: {
                        type: Lightning.shaders.RoundedRectangle,
                        radius: 3
                    }
                }
            },

            // Empty State
            EmptyState: {
                x: 960,
                y: 500,
                mount: 0.5,
                alpha: 0,
                flex: { direction: 'column', alignItems: 'center' },
                EmptyIcon: {
                    w: 240,
                    h: 240,
                    flexItem: { marginBottom: 20 },
                    src: Utils.asset('images/apps/Noapps.png'),
                },
                EmptyText: {
                    flexItem: { marginBottom: 30 },
                    text: {
                        text: Language.translate('No Apps Installed'),
                        fontSize: 60,
                        fontFace: CONFIG.language.font,
                        textColor: 0xFFAAAAAA,
                        textAlign: 'center'
                    }
                },
                OkButton: {
                    w: 200,
                    h: 60,
                    rect: true,
                    color: 0xFFFFFFFF,
                    shader: {
                        type: Lightning.shaders.RoundedRectangle,
                        radius: 10
                    },
                    OkLabel: {
                        x: 100,
                        y: 30,
                        mount: 0.5,
                        text: {
                            text: 'OK',
                            fontSize: 32,
                            fontFace: CONFIG.language.font,
                            textColor: 0xFF000000
                        }
                    },
                    FocusBorder: {
                        x: -4,
                        y: -4,
                        w: 208,
                        h: 68,
                        rect: true,
                        color: 0x00000000,
                        shader: {
                            type: Lightning.shaders.RoundedRectangle,
                            radius: 12,
                            stroke: 3,
                            strokeColor: 0xFFFFFFFF
                        }
                    }
                }
            }
        }
    }

    _construct() {
        this._appData = [];
    }

    _init() {
        this._appList = this.tag('AppList');
        this._scrollThumb = this.tag('ScrollIndicator.ScrollThumb');
    }

    /**
     * Fetch installed apps from DAC API
     */
    async _fetchInstalledApps() {
        try {
            const installedApps = await getInstalledDACApps();
            console.log('Installed DAC Apps:', JSON.stringify(installedApps));
            
            // Transform the data to match AppCard expected format
            const appData = installedApps.map(app => ({
                id: app.id,
                name: app.name,
                version: app.version,
                icon: app.icon || '/images/apps/DACApp_455_255.png',
                installed: app.installed,
                hasUpdate: false // Can be updated based on app catalog comparison if needed
            }));
            
            this._loadAppData(appData);
        } catch (error) {
            console.error('Error fetching installed apps:', error);
            this._loadAppData([]);
        }
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Installed Apps'));
    }

    /**
     * Load app data into the list
     * @param {Array} data - Array of app objects
     */
    _loadAppData(data) {
        this._appData = data || [];
        this._appList.clear();

        if (this._appData.length > 0) {
            this.tag('EmptyState').alpha = 0;
            this.tag('ListContainer').alpha = 1;
            this.tag('ScrollIndicator').alpha = 1;
            this._appList.add(this._appData.map((app) => {
                return {
                    type: AppCard,
                    w: AppCard.width,
                    h: AppCard.height,
                    appInfo: app
                };
            }));
            this._appList.setIndex(0);
            this._updateScrollIndicator();
            this._setState('AppList');
        } else {
            this.tag('ListContainer').alpha = 0;
            this.tag('ScrollIndicator').alpha = 0;
            this.tag('EmptyState').alpha = 1;
            this._setState('EmptyState');
        }
    }

    /**
     * Handle app card actions via fireAncestors (Launch, Update, Uninstall)
     */
    $appAction({ action, appInfo }) {
        console.log('AppInfoPage $appAction received:', action, appInfo);
        switch (action) {
            case 'launch':
                console.log("Launch app:", appInfo.name);
                this._launchApp(appInfo);
                break;
            case 'update':
                console.log("Update app:", appInfo.name);
                this._updateApp(appInfo);
                break;
            case 'uninstall':
                console.log("Uninstall app:", appInfo.name);
                this._uninstallApp(appInfo);
                break;
            default:
                console.log("Unknown action:", action);
        }
    }

    /**
     * Launch the selected app
     */
    async _launchApp(appInfo) {
        console.log(`Launching ${appInfo.name}...`);
        try {
            const result = await startDACApp({ id: appInfo.id });
            if (result) {
                console.log(`${appInfo.name} launched successfully`);
            } else {
                console.error(`Failed to launch ${appInfo.name}`);
            }
        } catch (error) {
            console.error(`Error launching ${appInfo.name}:`, error);
        }
    }

    /**
     * Update the selected app
     */
    _updateApp(appInfo) {
        if (!appInfo.hasUpdate) {
            console.log(`${appInfo.name} is already up to date`);
            return;
        }
        console.log(`Updating ${appInfo.name}...`);
    }

    /**
     * Uninstall the selected app
     */
    async _uninstallApp(appInfo) {
        console.log(`Uninstalling ${appInfo.name}...`);
        try {
            const result = await uninstallDACApp({ id: appInfo.id, version: appInfo.version, name: appInfo.name }, this);
            if (result) {
                console.log(`${appInfo.name} uninstalled successfully`);
                // Refresh the list after uninstall
                await this._fetchInstalledApps();
            } else {
                console.error(`Failed to uninstall ${appInfo.name}`);
            }
        } catch (error) {
            console.error(`Error uninstalling ${appInfo.name}:`, error);
        }
    }

    /**
     * Update scroll indicator position
     */
    _onListIndexChanged() {
        this._updateScrollIndicator();
    }

    _updateScrollIndicator() {
        const totalItems = this._appData.length;
        const currentIndex = this._appList.index || 0;
        
        if (totalItems > 0) {
            const trackHeight = 680;
            const thumbHeight = Math.max(50, trackHeight / totalItems);
            const maxY = trackHeight - thumbHeight;
            const thumbY = (currentIndex / Math.max(1, totalItems - 1)) * maxY;

            this._scrollThumb.patch({
                h: thumbHeight,
                smooth: { y: thumbY }
            });
        }
    }

    // Navigation handlers
    _handleLeft() {
        const currentCard = this._appList.currentItem;
        if (currentCard && currentCard._handleLeft && currentCard._handleLeft()) {
            return true;
        }
        Router.focusWidget('Menu');
    }

    _handleRight() {
        const currentCard = this._appList.currentItem;
        if (currentCard && currentCard._handleRight) {
            return currentCard._handleRight();
        }
        return false;
    }

    _handleBack() {
        Router.back();
    }

    _handleUp() {
        if (this._appList.index === 0) {
            this.widgets.menu.notify('TopPanel');
            return true;
        }
        return false;
    }

    pageTransition() {
        return 'up';
    }

    _focus() {
        // Fetch latest installed apps every time page is focused
        this._fetchInstalledApps();
    }

    static _states() {
        return [
            class AppList extends this {
                _getFocused() {
                    return this.tag('AppList');
                }
                
                _handleUp() {
                    if (this.tag('AppList').index === 0) {
                        this.widgets.menu.notify('TopPanel');
                        return true;
                    }
                    return false;
                }
            },
            class EmptyState extends this {
                $enter() {
                    this.tag('EmptyState.OkButton').color = CONFIG.theme.hex;
                    this.tag('EmptyState.OkButton.OkLabel').text.textColor = 0xFFFFFFFF;
                    this.tag('EmptyState.OkButton.FocusBorder').alpha = 1;
                }
                $exit() {
                    this.tag('EmptyState.OkButton').color = 0xFFFFFFFF;
                    this.tag('EmptyState.OkButton.OkLabel').text.textColor = 0xFF000000;
                    this.tag('EmptyState.OkButton.FocusBorder').alpha = 0;
                }
                _getFocused() {
                    return this;
                }
                _focus() {
                    this.tag('EmptyState.OkButton').color = CONFIG.theme.hex;
                    this.tag('EmptyState.OkButton.OkLabel').text.textColor = 0xFFFFFFFF;
                    this.tag('EmptyState.OkButton.FocusBorder').alpha = 1;
                }
                _unfocus() {
                    this.tag('EmptyState.OkButton').color = 0xFFFFFFFF;
                    this.tag('EmptyState.OkButton.OkLabel').text.textColor = 0xFF000000;
                    this.tag('EmptyState.OkButton.FocusBorder').alpha = 0;
                }
                _handleEnter() {
                    Router.back();
                }
                _handleLeft() {
                    Router.focusWidget('Menu');
                }
            }
        ];
    }
}
