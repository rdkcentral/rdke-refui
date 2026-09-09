import { Lightning, Router, Language, } from "@lightningjs/sdk";
import { Grid } from "@lightningjs/ui";
import { CONFIG } from "../Config/Config";
import AppCatalogItem from "../items/AppCatalogItem";
import { getAppCatalogInfo } from "../api/DACApi"
import { eventTarget, RefreshNeeded } from '../api/AppCatalog'

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
                    spacing: 20,
                    signals: { onIndexChanged: '_onGridIndexChanged' }
                },
            },
            // Scroll Indicator
            ScrollIndicator: {
                x: 1890,
                y: 270,
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
        }
    }

    _firstEnable() {
        this._loadingCatalog = false
        this._loadGeneration = 0
        this._fullCatalog = []
        this._catalogOffset = 0
        this._columns = 5
        this._pageSize = 10
        this._visibleItemsCount = 0
        this._gridInitialized = false
        this._onRefreshNeeded = () => {
            this.LOG('RefreshNeeded event received - reloading catalog')
            this._loadCatalog()
        }
        eventTarget.addEventListener(RefreshNeeded.eventName, this._onRefreshNeeded)
    }

    async _loadCatalog() {
        if (this._loadingCatalog) {
            this.LOG('Catalog load already in progress, skipping')
            return
        }
        this._loadingCatalog = true
        const generation = ++this._loadGeneration
        try {
            let Catalog = []
            try {
                Catalog = await getAppCatalogInfo()
            } catch (error) {
                this.ERR("Failed to get App Catalog Info:" + JSON.stringify(error))
                return
            }
            if (generation !== this._loadGeneration) {
                this.LOG('Stale catalog response ignored')
                return
            }
            if (!Array.isArray(Catalog) || Catalog.length === 0) {
                this.LOG('No apps available in catalog')
                return
            }
            Catalog.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            this.LOG(`Catalog loaded: ${Catalog.length} apps`)
            this._fullCatalog = Catalog
            this._catalogOffset = 0
            this._ensureGridPool()
            this._renderCatalogPage(0, 0)
            this._setState('Catalog')
        } finally {
            this._loadingCatalog = false
        }
    }

    _ensureGridPool() {
        if (this._gridInitialized) {
            return
        }

        const grid = this.tag('Catalog')
        const placeholders = []
        for (let i = 0; i < this._pageSize; i++) {
            placeholders.push({ h: AppCatalogItem.height + 90, w: AppCatalogItem.width, info: { name: '', icon: '/images/apps/DACApp_455_255.png' } })
        }
        grid.add(placeholders)
        grid.index = 0
        this._gridInitialized = true
    }

    _releaseGridTextures() {
        // Drop only this view's references to its icon textures. Do NOT call
        // texture.source.free(): Lightning shares texture sources by src URL, so
        // freeing here would blank the same icons in other views (e.g. the
        // MainView "My Apps"/"Recommended" rows). Lightning's texture manager
        // reclaims GPU memory for sources no longer referenced by any element.
        const grid = this.tag('Catalog')
        if (grid && grid.items) {
            grid.items.forEach((item) => {
                try {
                    const img = item.tag ? item.tag('Image') : null
                    if (img) {
                        img.texture = null
                        img.src = undefined
                    }
                } catch (e) {
                    // ignore cleanup errors
                }
            })
        }
    }

    _forceGC() {
        try {
            if (this.stage && typeof this.stage.gc === 'function') {
                this.stage.gc()
            }
            if (this.stage && this.stage.textureManager && typeof this.stage.textureManager.gc === 'function') {
                this.stage.textureManager.gc()
            }
        } catch (e) {
            // ignore
        }
    }

    _renderCatalogPage(focusColumn = 0, focusRow = 0) {
        this._ensureGridPool()
        const grid = this.tag('Catalog')
        const page = this._fullCatalog.slice(this._catalogOffset, this._catalogOffset + this._pageSize)
        this._visibleItemsCount = page.length

        for (let i = 0; i < this._pageSize; i++) {
            const item = grid.items && grid.items[i]
            if (!item) {
                continue
            }

            if (i < page.length) {
                item.visible = true
                item.alpha = 1
                item.info = page[i]
            } else {
                item.visible = false
                item.alpha = 0
                item.info = { name: '', icon: '/images/apps/DACApp_455_255.png' }
            }
        }

        const maxIndex = page.length - 1
        if (maxIndex >= 0) {
            const safeColumn = Math.max(0, Math.min(focusColumn, this._columns - 1))
            const targetIndex = Math.min((focusRow * this._columns) + safeColumn, maxIndex)
            grid.index = targetIndex
        }

        this.LOG(`Rendered catalog items ${this._catalogOffset} to ${this._catalogOffset + page.length} of ${this._fullCatalog.length}`)
        this._updateScrollIndicator()
    }

    _loadMoreItems(focusColumn = 0) {
        if (this._catalogOffset + this._pageSize < this._fullCatalog.length) {
            this._catalogOffset += this._pageSize
            this._renderCatalogPage(focusColumn, 0)
        }
    }

    _loadPreviousItems(focusColumn = 0) {
        if (this._catalogOffset - this._pageSize >= 0) {
            this._catalogOffset -= this._pageSize
            const page = this._fullCatalog.slice(this._catalogOffset, this._catalogOffset + this._pageSize)
            const lastRow = Math.max(0, Math.ceil(page.length / this._columns) - 1)
            this._renderCatalogPage(focusColumn, lastRow)
        }
    }

    _detach() {
        if (this._onRefreshNeeded) {
            eventTarget.removeEventListener(RefreshNeeded.eventName, this._onRefreshNeeded)
        }
        this._releaseGridTextures()
        this._fullCatalog = []
        this._visibleItemsCount = 0
        this._gridInitialized = false
        this.tag('Catalog').clear()
    }

    _onGridIndexChanged() {
        this._updateScrollIndicator()
    }

    _updateScrollIndicator() {
        const totalItems = this._fullCatalog.length
        const totalRows = Math.ceil(totalItems / this._columns)
        const grid = this.tag('Catalog')
        const currentIndex = grid.index || 0
        // Calculate the absolute row position across all pages
        const absoluteIndex = this._catalogOffset + currentIndex
        const currentRow = Math.floor(absoluteIndex / this._columns)

        if (totalRows > 0) {
            const trackHeight = 680
            const thumbHeight = Math.max(50, trackHeight / totalRows)
            const maxY = trackHeight - thumbHeight
            const thumbY = (currentRow / Math.max(1, totalRows - 1)) * maxY

            this.tag('ScrollIndicator.ScrollThumb').patch({
                h: thumbHeight,
                smooth: { y: thumbY }
            })
        }
    }



    _handleLeft() {
        Router.focusWidget('Menu')
    }
    _handleBack() {
        Router.back();
    }

    pageTransition() {
        return 'up'
    }

    _handleUp() {
        this.widgets.menu.notify('TopPanel')
    }

    _focus() {
        this._loadCatalog()
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
                    const grid = this.tag('Catalog')
                    const currentIndex = grid.index || 0
                    const currentColumn = currentIndex % this._columns

                    if (currentIndex < this._columns) {
                        if (this._catalogOffset > 0) {
                            this._loadPreviousItems(currentColumn)
                        } else {
                            this.widgets.menu.notify('TopPanel')
                        }
                        return true
                    }

                    return false
                }
                _handleDown() {
                    const grid = this.tag('Catalog')
                    const currentIndex = grid.index || 0
                    const totalItems = this._visibleItemsCount
                    const currentColumn = currentIndex % this._columns

                    if (currentIndex >= totalItems - this._columns) {
                        if (this._catalogOffset + this._pageSize < this._fullCatalog.length) {
                            this._loadMoreItems(currentColumn)
                            return true
                        }
                    }

                    return false
                }
            }
        ];
    }
}
