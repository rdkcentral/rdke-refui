import { Lightning, Router, Language, } from "@lightningjs/sdk";
import { Grid } from "@lightningjs/ui";
import { CONFIG } from "../Config/Config";
import AppCatalogItem from "../items/AppCatalogItem";
import { getAppCatalogInfo } from "../api/DACApi"

export default class AppStore extends Lightning.Component {

    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Recommended Apps'))
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
                Catalog: {
                    x: 20,
                    y: 50,
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
            },
        }
    }

    async _firstEnable() {
        let Catalog = []
        try {
            Catalog = await getAppCatalogInfo()
        } catch (error) {
            this.ERR("Failed to get App Catalog Info:" + JSON.stringify(error))
        }
        Catalog.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        this.tag('Catalog').add(Catalog.map((element) => {
            return { h: AppCatalogItem.height + 90, w: AppCatalogItem.width, info: element }
        }));
        this._setState('Catalog')
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
        this._setState('Catalog')
    }

    $showInstallError({ name, errorCode }) {
        const appName = name || Language.translate('App')
        const msg = Language.translate('Something went wrong while installing') + ` "${appName}". ` + Language.translate('Error code') + `: ${errorCode}`
        this.widgets.failok.notify({ title: Language.translate('Installation Failed'), msg: msg })
        Router.focusWidget('FailOk')
    }

    $showUninstallError({ name, error }) {
        const appName = name || Language.translate('App')
        let msg = Language.translate('Failed to uninstall') + ` "${appName}". ` + Language.translate('Please try again later.')
        if (error) {
            msg += ' ' + Language.translate('Error') + `: ${error}`
        }
        this.widgets.failok.notify({ title: Language.translate('Uninstall Failed'), msg: msg })
        Router.focusWidget('FailOk')
    }

    $showLaunchError({ name, error }) {
        const appName = name || Language.translate('App')
        let msg = Language.translate('Something went wrong while launching') + ` "${appName}". ` + Language.translate('Please check the internet and remaining setup.')
        if (error) {
            msg += ' ' + Language.translate('Error') + `: ${error}`
        }
        this.widgets.failok.notify({ title: Language.translate('Launch Failed'), msg: msg })
        Router.focusWidget('FailOk')
    }

    static _states() {
        return [
            class Catalog extends this {
                _getFocused() {
                    return this.tag('Catalog')
                }
                _handleUp() {
                    this.widgets.menu.notify('TopPanel')
                }
            }
        ];
    }
}
