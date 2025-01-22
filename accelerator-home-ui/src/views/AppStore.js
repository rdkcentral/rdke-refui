import { Lightning, Router, Language, } from "@lightningjs/sdk";
import { Grid, List } from "@lightningjs/ui";
import { CONFIG } from "../Config/Config";
import AppStoreItem from "../items/AppStoreItem";
import OptionsItem from "../items/OptionsItems";
import AppCatalogItem from "../items/AppCatalogItem";
import ManageAppItem from "../items/ManageAppItem"
import { getInstalledDACApps, getAppCatalogInfo } from "../api/DACApi"

export default class AppStore extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Apps'))
    }

    static _template() {
        return {
            rect: true,
            h: 1080,
            w: 1920,
            color: CONFIG.theme.background,
            Container: {
                x: 200,
                y: 270,
                Options: {
                    // x: 10,
                    type: List,
                    direction: 'row',
                    spacing: 30,
                },
                Apps: {
                    x: 20,
                    y: 120,
                    type: Grid,
                    columns: 5,
                    itemType: AppStoreItem,
                    w: 1920,
                    h: (AppStore.height + 90) * 2 + 2 * 20 - 10,
                    scroll: {
                        after: 2
                    },
                    spacing: 20
                },
                Catalog: {
                    x: 20,
                    y: 120,
                    type: Grid,
                    columns: 5,
                    itemType: AppCatalogItem,
                    w: 1920,
                    h: (AppStore.height + 90) * 2 + 2 * 20 - 10,
                    scroll: {
                        after: 2
                    },
                    spacing: 20
                },
                ManagedApps: {
                    x: 20,
                    y: 120,
                    type: Grid,
                    columns: 5,
                    itemType: ManageAppItem,
                    w: 1920,
                    h: (AppStore.height + 90) * 2 + 2 * 20 - 10,
                    scroll: {
                        after: 2
                    },
                    spacing: 20
                },
            },
        }
    }

    async _firstEnable() {
        const Catalog = await getAppCatalogInfo()
        const options = ['My Apps', 'App Catalog', 'Manage Apps']
        this.tag('Options').add(options.map((element, idx) => {
            return {
                type: OptionsItem,
                element: element,
                w: OptionsItem.width,
                idx
            }
        }));
        this.options = {
            0: async () => {
                const installedApplications = await getInstalledDACApps()
                this.tag('Apps').add(installedApplications.map((element) => {
                    return { h: AppStoreItem.height + 90, w: AppStoreItem.width, info: element }
                }));
            },
            1: async () => {
                this.tag('Catalog').add(Catalog.map((element) => {
                    return { h: AppCatalogItem.height + 90, w: AppCatalogItem.width, info: element }
                }));
            },
            2: async () => {
                const installedApplications = await getInstalledDACApps()
                this.tag('ManagedApps').add(installedApplications.map((element) => {
                    return { h: ManageAppItem.height + 90, w: ManageAppItem.width, info: element }
                }));
            },
        }
        const installedApps = await getInstalledDACApps()
        if (Object.keys(installedApps).length === 0) {
            this.tag('Options').setIndex(1)
            this.options[1]()
            this._setState('Catalog')
        }
        else {
            this.options[0]()
            this._setState('Apps')
        }
    }

    $selectOption(option, obj) {
        this.tag('Apps').clear()
        this.tag('Catalog').clear()
        this.tag('ManagedApps').clear()
        obj._focus()
        this.options[option]()
        switch (option) {
            case 0: this._setState('Apps'); break;
            case 1: this._setState('Catalog'); break;
            case 2: this._setState('ManagedApps'); break;
        }
    }

    $refreshManagedApps() {
        this.tag('ManagedApps').clear()
        this.options[2]()
        this._setState('ManagedApps')
    }

    _handleLeft() {
        Router.focusWidget('Menu')
    }
    _handleBack() {
        Router.focusWidget('Menu');
    }

    pageTransition() {
        return 'up'
    }

    _handleUp() {
        this.widgets.menu.notify('TopPanel')
    }

    _focus() {
        this._setState('Options')
    }

    static _states() {
        return [
            class Options extends this{
                _getFocused() {
                    return this.tag('Options')
                }
                _handleDown() {
                    this._setState('Apps')
                }
            },
            class Apps extends this{
                _getFocused() {
                    return this.tag('Apps')
                }
                _handleUp() {
                    this._setState('Options')
                }
            },
            class Catalog extends this{
                _getFocused() {
                    return this.tag('Catalog')
                }
                _handleUp() {
                    this._setState('Options')
                }
            },
            class ManagedApps extends this
            {
                _getFocused() {
                    return this.tag('ManagedApps')
                }
                _handleUp() {
                    this._setState('Options')
                }
            }
        ];
    }
}
