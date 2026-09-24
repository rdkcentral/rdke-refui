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
import { Lightning, Storage, Language, Router, Utils } from '@lightningjs/sdk'
import ListItem from '../items/ListItem.js'
import DacAppItem from '../items/DacAppItem.js'
import ThunderJS from 'ThunderJS'
import AppApi from '../api/AppApi.js'
import { CONFIG, GLOBALS } from '../Config/Config.js'
import XcastApi from '../api/XcastApi'
import HomeApi from '../api/HomeApi.js'
import GracenoteItem from '../items/GracenoteItem.js'
import HDMIApi from '../api/HDMIApi.js'
import NetworkManager from '../api/NetworkManagerAPI.js'
import { getAppCatalogInfo, getInstalledDACApps, startDACApp } from '../api/DACApi.js'
import { filterExcludedApps } from '../helpers/DACAppPresentation.js'
import AppController from '../AppController.js'
import { eventTarget, RefreshNeeded } from '../api/AppCatalog.js'

/** Class for main view component in home UI */
export default class MainView extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
    // Initialized here (constructor runs before any lifecycle hook, including
    // the first _attach()) so _attach()'s resume-check always sees explicit
    // false values rather than undefined. If _init() reset these instead,
    // _attach() firing first (Lightning's normal order) would read them as
    // undefined, treat init as not-yet-started, and call
    // _initializeMainView() itself; _init() would then unconditionally reset
    // both flags and start a second, racing initializer with duplicate
    // fetches and duplicate event-handler registration.
    this._initCompleted = false
    this._initInProgress = false
    // Shared promise for the current _initializeMainView() run. Both _init()
    // and _attach() await this so _init cannot return before the initializer
    // (potentially started by an earlier _attach()) has actually finished.
    this._initPromise = null
  }
  /**
   * Function to render various elements in main view.
   */
  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('home'))
  }
  static _template() {
    return {
      rect: true,
      color: CONFIG.theme.background,
      w: 1920,
      h: 1080,
      clipping: true,
      MainView: {
        w: 1720,
        h: 1200,
        xIndex: 2,
        y: 270,
        x: 200,
        clipping: false,
        Text0: {
          alpha: 0,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Popular Movies'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
          zIndex: 0
        },
        Gracenote: {
          y: 50,
          x: -20,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          type: Lightning.components.ListComponent,
          w: 1745,
          h: 400,
          itemSize: 500,
          roll: true,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -1,
          clipping: false,
        },
        Inputs: {
          y: 0,
          visible: false,//false by default
          Title: {
            y: 0,
            h: 30,
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 25,
              text: Language.translate('Input Select'),
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF,
            },
            zIndex: 0
          },
          Slider: {
            x: -20,
            y: 37,
            type: Lightning.components.ListComponent,
            flex: { direction: 'row', paddingLeft: 20, wrap: false },
            w: 1745,
            h: 300,
            itemSize: 288,
            roll: true,
            rollMax: 1745,
            horizontal: true,
            itemScrollOffset: -4,
            clipping: false,
          }
        },
        Text1: {
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('My Apps'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
          zIndex: 0
        },
        AppList: {
          x: -20,
          y: 37,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          w: 1745,
          h: 300,
          itemSize: 345,
          roll: true,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -4,
          clipping: false,
        },
        Text2: {
          // x: 10 + 25,
          y: 305,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Recommended Apps'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
        },
        DacAppsLoader: {
          x: 150,
          y: 437,
          h: 60,
          w: 60,
          mountY: 0.5,
          src: Utils.asset('images/settings/Loading.png'),
          visible: true,
        },
        DacApps: {
          x: -20,
          y: 345,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          w: 1745,
          h: 300,
          itemSize: 345,
          roll: true,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -4,
          clipping: false,
        },
        Text3: {
          // x: 10 + 25,
          y: 613,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Featured Video on Demand'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
        },
        TVShows: {
          x: -20,
          y: 650,
          w: 1745,
          h: 400,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          roll: true,
          itemSize: 345,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -4,
          clipping: false,
        },
      }
    }
  }

  pageTransition() {
    return 'up'
  }

  moveDownContent() {
    this.tag('Text0').alpha = 1
    this._updateRowPositions()
  }

  showInputSelect() {
    this.tag("Inputs").visible = true
    this._updateRowPositions()
  }


  /**
   * @param {any} data
   */
  setGracenoteData(data) {
    if (!this.gracenote) {
      this.gracenote = true
      this.key = data.key
      this.graceNoteItems = data.data
      this.appItems = this.currentItems
    }
  }

  _handleBack() { }

  async _buildInstalledAppsList() {
    let installedApps = filterExcludedApps(await getInstalledDACApps())
    return installedApps
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(app => ({
        displayName: app.name,
        applicationType: 'DAC',
        uri: app.id,
        url: app.icon || '/images/apps/App_Store.png',
        appIdentifier: app.id,
        version: app.version
      }))
  }

  async _buildDacAppsList() {
    let dacCatalog = await getAppCatalogInfo()
    let apps = dacCatalog
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .slice(0, 4)
      .map(app => ({
        displayName: app.name,
        applicationType: 'DAC',
        uri: app.id,
        url: app.icon || '/images/apps/DACApp_455_255.png',
        appIdentifier: app.id,
        version: app.version
      }))
    // Add "More Apps" item at the end
    apps.push({
      displayName: Language.translate('More Apps'),
      applicationType: 'MoreApps',
      uri: 'apps',
      url: '/images/sidePanel/moreapps.png',
      appIdentifier: 'moreApps'
    })
    return apps
  }

  async _init() {
    // Both _init() and _attach() route through _initializeMainView() which
    // stores a single in-flight promise. Awaiting it here guarantees _init
    // does not return before initialization actually completes -- even if an
    // earlier _attach() started the run.
    await this._initializeMainView()
  }

  /**
   * Idempotent initializer for MainView. Safe to call from _init() and from
   * _attach(): while an initializer is in flight both callers await the same
   * promise; once complete, further calls are a cheap no-op. Bails cleanly if
   * the view is detached mid-await (a later _attach() will re-invoke it to
   * finish setup).
   */
  _initializeMainView() {
    if (this._initCompleted) {
      return Promise.resolve()
    }
    // Reuse the in-flight promise so _init() and _attach() cannot start two
    // concurrent runs, and so _init() waits on the same completion as the
    // _attach()-started run rather than returning immediately.
    if (this._initPromise) {
      return this._initPromise
    }
    this._initInProgress = true
    this._initPromise = this._runMainViewInitializer()
      .finally(() => {
        this._initInProgress = false
        this._initPromise = null
      })
    return this._initPromise
  }

  async _runMainViewInitializer() {
    this.gracenote = false
    this.inputSelect = false //false by default
    this.settingsScreen = false
    this.myAppsEmpty = true // Will be updated when appItems is set
    this.indexVal = 0
    this.homeApi = new HomeApi();
    this.xcastApi = new XcastApi();
    this.hdmiApi = new HDMIApi()
    this.appApi = new AppApi()
    this._isRefreshingMyApps = false
    this._pendingMyAppsRefresh = false
    this._refreshMyAppsTimer = null
    this._myAppsActive = true
    this._mainViewSubscribed = false
    // Bumped in _detach() so awaits that resolve after detach can be rejected
    // even if the view is later re-attached (which flips _myAppsActive back).
    this._launchGeneration = 0
    let thunder = ThunderJS(CONFIG.thunderConfig);

    // Setup loading animation for DacApps
    this.dacAppsLoadingAnimation = this.tag('DacAppsLoader').animation({
      duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
    });
    // Start loading animation
    this._showDacAppsLoader()

    let appItems = []
    try {
      appItems = await this._buildInstalledAppsList()
      this.LOG('Installed apps: ' + JSON.stringify(appItems))
    } catch (err) {
      this.ERR('Failed to fetch installed apps: ' + JSON.stringify(err))
      appItems = []
    }
    // Bail out of the rest of _init if the view was detached while awaiting.
    // Assigning appItems/dacApps below would patch tags and move focus on a
    // detached MainView. A later _attach() will re-run _initializeMainView()
    // so the home rows and event handlers still get set up on re-entry.
    if (!this._myAppsActive) {
      this.LOG('MainView detached during _init (after installed-apps fetch); will resume on next attach')
      return
    }
    let data = this.homeApi.getPartnerAppsInfo()

    // Fetch DAC catalog, sort alphabetically, and take first 4 apps + More Apps item
    let dacCatalog = []
    try {
      dacCatalog = await this._buildDacAppsList()
      this.LOG('DAC catalog apps: ' + JSON.stringify(dacCatalog))
    } catch (err) {
      this.ERR('Failed to fetch DAC catalog: ' + JSON.stringify(err))
      dacCatalog = []
    }
    if (!this._myAppsActive) {
      this.LOG('MainView detached during _init (after DAC catalog fetch); will resume on next attach')
      return
    }


    let prop_apps = 'applications'
    let prop_displayname = 'displayName'
    let prop_uri = 'uri'
    let prop_apptype = 'applicationType'
    let appdetails = []
    let appdetails_format = []
    try {
      if (data != null && Object.prototype.hasOwnProperty.call(JSON.parse(data), prop_apps)) {
        appdetails = JSON.parse(data).applications
        for (let i = 0; i < appdetails.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_displayname) &&
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_uri) &&
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_apptype)
          ) {
            appdetails_format.push(appdetails[i])
          }
        }
        for (let i = 0; i < appItems.length; i++) {
          appdetails_format.push(appItems[i])
        }

      } else {
        appdetails_format = appItems
      }
    } catch (e) {
      appdetails_format = appItems
      this.LOG('Query data is not proper: ' + JSON.stringify(e))
    }
    this.firstRowItems = appdetails_format.filter(item => item.uri !== 'USB')
    this.tempRow = JSON.parse(JSON.stringify(this.firstRowItems));
    this.appItems = this.tempRow

    this.hdmiApi.activate()
      .then(() => {
        this.hdmiApi.registerEvent('onDevicesChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          this.LOG('onDevicesChanged ' + JSON.stringify(notification))
        })
        this.hdmiApi.registerEvent('onInputStatusChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          this.LOG('onInputStatusChanged ' + JSON.stringify(notification))
        })
        this.hdmiApi.registerEvent('onSignalChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          this.LOG('onSignalChanged ' + JSON.stringify(notification))
          if (notification.signalStatus !== 'stableSignal') {
            // FIXME: make the visibility change when graphics overlay is implemented for input select.
            this.widgets.fail.notify({ title: this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data.displayName, msg: Language.translate("Input disconnected") })
            Router.focusWidget('Fail')
          }
        })
        this.hdmiApi.registerEvent('videoStreamInfoUpdate', notification => {
          this.fireAncestors("$hideImage", 0);
          this.LOG('videoStreamInfoUpdate ' + JSON.stringify(notification))
        })
        if(GLOBALS.deviceType == "IpTv")
        {
          this.inputSelect = true //set the inputSelect to true if the device is tv, here considering hdmiApi is only available on tv
        }
        this.appItems = this.tempRow
        this.hdmiApi.getHDMIDevices()
          .then(res => {
            if (res.length > 0)
              this.inputItems = res
          })
      })
      .catch(err => {
        this.ERR('HDMIInput Plugin not activated' + JSON.stringify(err))
      })
    //get the available input methods from the api

    // Define the internet-status handler once so it can be (re)subscribed on
    // every attach without recreating the function identity.
    this._onInternetStatusChange = notification => {
      this.LOG('on InternetStatus Change' + JSON.stringify(notification))
      if (notification.status === "FULLY_CONNECTED") {
        // Immediately restore icons so they aren't stuck on the offline placeholder
        // even if the row refresh is slow or fails.
        this._updateMyAppsNetworkState(true)
        this.$refreshMyAppsRow()
        this.refreshSecondRow()
      } else {
        this._hideDacAppsLoader()
        // Clear stale cached apps (broken/default icons) and show only "More Apps"
        this.dacApps = [{
          displayName: Language.translate('More Apps'),
          applicationType: 'MoreApps',
          uri: 'apps',
          url: '/images/sidePanel/moreapps.png',
          appIdentifier: 'moreApps'
        }]
        // Show offline placeholder for all My Apps icons
        this._updateMyAppsNetworkState(false)
      }
    }
    // Refresh My Apps row when apps are installed/uninstalled (including sideloaded via curl)
    this._onPackageChanged = (action, data) => {
      this.LOG('onPackageChanged: ' + action + ' ' + JSON.stringify(data))
      this._scheduleMyAppsRefresh()
    }
    // Refresh DAC apps row when app catalog authentication changes
    this._onCatalogRefreshNeeded = () => {
      this.LOG('RefreshNeeded event received - refreshing DAC apps row')
      this.refreshSecondRow()
    }
    this._subscribeMainViewEvents()

    this.dacApps = dacCatalog

    this.refreshFirstRow()
    // this._setState('AppList.0')
    this._initCompleted = true
  }

  /**
   * Subscribe to external events (internet status, package changes, catalog
   * refresh). Idempotent: safe to call from both _init and _attach. Since
   * _init runs only once, _attach must re-subscribe after _detach tore the
   * subscriptions down, otherwise returning to home leaves rows stale.
   */
  _subscribeMainViewEvents() {
    // Handlers are created in _init(). The first _attach() fires before _init(),
    // so bail until they exist; _init() calls this again once they are ready.
    if (!this._onPackageChanged && !this._onCatalogRefreshNeeded && !this._onInternetStatusChange) {
      return
    }
    // Do not subscribe on a detached view; _attach() will call again on re-entry.
    if (this._myAppsActive === false) {
      return
    }
    if (this._mainViewSubscribed) {
      return
    }
    if (this._onInternetStatusChange && !this._onInternetStatusChangeCB) {
      this._onInternetStatusChangeCB = NetworkManager.thunder.on(
        'org.rdk.NetworkManager', 'onInternetStatusChange', this._onInternetStatusChange)
    }
    if (this._onPackageChanged) {
      AppController.get().addPackageChangedListener(this._onPackageChanged)
    }
    if (this._onCatalogRefreshNeeded) {
      eventTarget.addEventListener(RefreshNeeded.eventName, this._onCatalogRefreshNeeded)
    }
    this._mainViewSubscribed = true
  }

  /**
   * Unsubscribe from all external events. Mirrors _subscribeMainViewEvents().
   */
  _unsubscribeMainViewEvents() {
    if (this._onInternetStatusChangeCB) {
      this._onInternetStatusChangeCB.dispose()
      this._onInternetStatusChangeCB = null
    }
    if (this._onPackageChanged) {
      AppController.get().removePackageChangedListener(this._onPackageChanged)
    }
    if (this._onCatalogRefreshNeeded) {
      eventTarget.removeEventListener(RefreshNeeded.eventName, this._onCatalogRefreshNeeded)
    }
    this._mainViewSubscribed = false
  }

  _detach() {
    // Unsubscribe to avoid stale references to this MainView instance
    this._unsubscribeMainViewEvents()
    // Invalidate any in-flight My Apps refresh: a pending timer callback may
    // already be awaiting _buildInstalledAppsList(); this flag makes it discard
    // its result (and skip rescheduling) instead of patching a detached view.
    this._myAppsActive = false
    // Bump the launch generation so any DAC launch awaiting startDACApp() at
    // the time of detach is treated as stale even if the view is re-attached
    // (which flips _myAppsActive back to true) before it resolves.
    this._launchGeneration = (this._launchGeneration || 0) + 1
    this._pendingMyAppsRefresh = false
    if (this._refreshMyAppsTimer) {
      clearTimeout(this._refreshMyAppsTimer)
      this._refreshMyAppsTimer = null
    }
  }

  _scheduleMyAppsRefresh(force = false) {
    if (!this._myAppsActive) {
      return
    }
    const isMainViewActive = Router.getActiveHash() === 'menu'
    if (!isMainViewActive && !force) {
      this._pendingMyAppsRefresh = true
      return
    }

    this._pendingMyAppsRefresh = true
    if (this._refreshMyAppsTimer) {
      return
    }

    this._refreshMyAppsTimer = setTimeout(async () => {
      this._refreshMyAppsTimer = null
      if (this._isRefreshingMyApps || !this._pendingMyAppsRefresh) {
        return
      }

      this._isRefreshingMyApps = true
      this._pendingMyAppsRefresh = false
      try {
        await this.$refreshMyAppsRow()
      } finally {
        this._isRefreshingMyApps = false
        // Do not reschedule if the view was detached while awaiting.
        if (this._myAppsActive && this._pendingMyAppsRefresh) {
          this._scheduleMyAppsRefresh(true)
        }
      }
    }, 300)
  }

  _firstActive() {
    if (this.gracenote) {
      this._setState("Gracenote")
    } else if (this.inputSelect) {
      this._setState("Inputs")
    } else if (this.myAppsEmpty) {
      this._setState("DacApps")
    } else {
      this._setState("AppList.0")
    }
  }


  _focus() {
    // If a My Apps refresh was deferred while this view was inactive,
    // trigger it now that we're focused again.
    if (this._pendingMyAppsRefresh) {
      this._scheduleMyAppsRefresh(true)
    }
    // After returning from another page (e.g. app info after uninstall),
    // validate that the current state still has focusable content.
    const baseState = this.state ? this.state.split('.')[0] : ''
    if (baseState === 'AppList' && this.myAppsEmpty) {
      this._setState('DacApps')
    } else if (baseState === 'AppList' && this.tag('AppList').length === 0) {
      this._setState('DacApps')
    } else if (this.state) {
      this._setState(this.state)
    } else {
      // Fallback: determine correct initial state
      if (this.gracenote) {
        this._setState('Gracenote')
      } else if (this.inputSelect) {
        this._setState('Inputs')
      } else if (!this.myAppsEmpty && this.tag('AppList').length > 0) {
        this._setState('AppList')
      } else {
        this._setState('DacApps')
      }
    }
  }

  _firstEnable() {
    console.timeEnd('PerformanceTest')
    this.LOG('Mainview Screen timer end - ' + JSON.stringify(new Date().toUTCString()))
    this.internetConnectivity = false;
  }

  _attach() {
    // Re-activate the My Apps refresh guard when the view is re-attached
    // (it is set false in _detach). _init only runs once, so reset here.
    this._myAppsActive = true
    // Re-subscribe to external events torn down in _detach(); without this,
    // returning to home leaves My Apps/catalog/network updates stale.
    this._subscribeMainViewEvents()
    // Resume initialization if it hasn't completed. _initializeMainView() is
    // idempotent: it returns the in-flight promise when one is running (so a
    // pending _init()/earlier _attach() await is shared) and no-ops once
    // complete. Not awaited here since _attach() itself is synchronous.
    this._initializeMainView()
  }

  scroll(val) {
    this.tag('MainView').patch({
      smooth: {
        y: [val, { timingFunction: 'ease', duration: 0.7 }]
      }
    })
  }
  async refreshSecondRow() {
    let timeoutId
    try {
      // Show loader while fetching
      this._showDacAppsLoader()
      // Add a timeout to prevent the loader from spinning indefinitely on slow/flaky connections
      const FETCH_TIMEOUT = 15000 // 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('DAC catalog fetch timed out')), FETCH_TIMEOUT)
      })
      const dacApps = await Promise.race([this._buildDacAppsList(), timeoutPromise])
      // The view may have been detached while awaiting; discard the result so
      // the dacApps setter does not patch DacApps / refocus a detached view.
      if (!this._myAppsActive) {
        return
      }
      this.dacApps = dacApps
    } catch (err) {
      this.ERR('Failed to refresh DAC catalog: ' + (err instanceof Error ? err.message : JSON.stringify(err)))
      if (this._myAppsActive) {
        this._hideDacAppsLoader()
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }
  refreshFirstRow() {
    this.appItems = this.tempRow
  }

  /**
   * Function to set details of items in gracenote list.
   */
  set graceNoteItems(items) {
    this.moveDownContent()
    this.tag('Gracenote').items = items.map((info, idx) => {
      return {
        w: 480,
        h: 270,
        type: GracenoteItem,
        data: info,
        key: this.key,
        focus: 1.11,
        unfocus: 1,
        idx: idx,
        bar: 10
      }
    })
    this._setState('Gracenote')
  }

  set inputItems(items) {
    this.showInputSelect();
    this.tag("Inputs.Slider").items = items.map((info, idx) => {
      return {
        w: 268,
        h: 151,
        type: ListItem,
        data: { ...info, displayName: `Port ${info.id}`, url: "/images/inputs/HDMI.jpg" },
        focus: 1.11,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    })
    this._setState("Inputs.0")
  }

  /**
   * Function to set details of items in app list.
   */
  set appItems(items) {
    const safeItems = Array.isArray(items) ? items : []
    this.currentItems = safeItems
    this.myAppsEmpty = safeItems.length === 0

    // Hide My Apps row if empty
    this.tag('Text1').visible = !this.myAppsEmpty
    this.tag('AppList').visible = !this.myAppsEmpty

    // Update row positions based on My Apps visibility
    this._updateRowPositions()

    this.tag('AppList').items = safeItems.map((info, idx) => {
      return {
        w: 325,
        h: 183,
        type: ListItem,
        data: info,
        focus: 1.15,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    })

    // Clamp AppList index if it's now beyond bounds (e.g. after uninstall)
    if (this.tag('AppList').length && this.tag('AppList').index >= this.tag('AppList').length) {
      this.tag('AppList').setIndex(this.tag('AppList').length - 1)
    }

    // Re-apply focus if the AppList row is currently focused
    const baseState = this.state ? this.state.split('.')[0] : ''
    if (baseState === 'AppList' && this.tag('AppList').length) {
      this._refocus()
    }

    // If My Apps became empty while focused, move focus to DacApps
    if (this.myAppsEmpty && baseState === 'AppList') {
      this._setState('DacApps')
    }

    // If My Apps just became available but focus is on DacApps (wrong initial focus), correct it
    if (!this.myAppsEmpty && baseState === 'DacApps' && !this.gracenote && !this.inputSelect) {
      this._setState('AppList')
    }
  }

  /**
   * Update row positions based on gracenote, inputSelect, and My Apps visibility.
   * This is the single source of truth for vertical layout offsets.
   */
  _updateRowPositions() {
    // Base y-values assume the default layout (no Gracenote, no Inputs)
    const baseText1 = 0
    const baseAppList = 37
    const baseText2 = 305
    const baseDacAppsLoader = 437
    const baseDacApps = 345
    const baseText3 = 613
    const baseTVShows = 650

    // Gracenote row pushes everything down by 440px
    const gracenoteOffset = this.gracenote ? 440 : 0

    // Input-select row adds 275px, but only contributes above
    // the rows below Gracenote; its own position depends on Gracenote
    const inputSelectOffset = this.inputSelect ? 275 : 0
    this.tag('Inputs').y = this.gracenote ? 440 : 0

    // My Apps row takes ~305px; collapse when empty
    const myAppsOffset = this.myAppsEmpty ? -305 : 0

    const topOffset = gracenoteOffset + inputSelectOffset

    this.tag('Text1').y = baseText1 + topOffset
    this.tag('AppList').y = baseAppList + topOffset
    this.tag('Text2').y = baseText2 + topOffset + myAppsOffset
    this.tag('DacAppsLoader').y = baseDacAppsLoader + topOffset + myAppsOffset
    this.tag('DacApps').y = baseDacApps + topOffset + myAppsOffset
    this.tag('Text3').y = baseText3 + topOffset + myAppsOffset
    this.tag('TVShows').y = baseTVShows + topOffset + myAppsOffset
  }

  /**
   * Show loading spinner for DacApps row
   */
  _showDacAppsLoader() {
    this.tag('DacAppsLoader').visible = true
    this.tag('DacApps').visible = false
    if (this.dacAppsLoadingAnimation) {
      this.dacAppsLoadingAnimation.start()
    }
  }

  /**
   * Update My Apps row items to show/hide offline placeholder for all app icons.
   * When offline, every app icon is replaced with the offline.png placeholder.
   * When back online, the original icon src is restored.
   * @param {boolean} isOnline - true to restore images, false to show offline placeholder
   */
  _updateMyAppsNetworkState(isOnline) {
    const appList = this.tag('AppList')
    if (!appList || !appList.items || !appList.items.length) return
    for (let i = 0; i < appList.items.length; i++) {
      const item = appList.items[i]
      if (!item || !item.data || !item.data.url) continue
      const img = item.tag('Image')
      if (!isOnline) {
        img.patch({ src: Utils.asset('/images/metroApps/offline.png') })
        img.alpha = 1
      } else {
        // Restore original icon URL
        const src = item.data.url.startsWith('/images')
          ? Utils.asset(item.data.url)
          : item.data.url
        img.patch({ src })
        img.alpha = 1
      }
    }
  }

  /**
   * Hide loading spinner for DacApps row
   */
  _hideDacAppsLoader() {
    this.tag('DacAppsLoader').visible = false
    this.tag('DacApps').visible = true
    if (this.dacAppsLoadingAnimation) {
      this.dacAppsLoadingAnimation.stop()
    }
  }

  set dacApps(items) {
    // Hide loader and show content
    this._hideDacAppsLoader()

    this.tag('DacApps').items = items.map((info, index) => {
      return {
        w: 325,
        h: 183,
        type: DacAppItem,
        data: info,
        focus: 1.15,
        unfocus: 1,
        idx: index,
        bar: 12
      }
    })

    // Re-apply focus if the DacApps row is currently focused
    const baseState = this.state ? this.state.split('.')[0] : ''
    if (baseState === 'DacApps' && this.tag('DacApps').length) {
      this._refocus()
    }
  }
  async $refreshMyAppsRow() {
    console.log('Refreshing My Apps row...')
    try {
      let appItems = await this._buildInstalledAppsList()
      // The view may have been detached while awaiting; discard the result so
      // we don't patch AppList / move focus on a detached MainView.
      if (!this._myAppsActive) {
        return
      }
      this.tempRow = JSON.parse(JSON.stringify(appItems));
      this.firstRowItems = appItems
      this.appItems = this.tempRow
    } catch (err) {
      this.ERR('Failed to refresh My Apps row: ' + JSON.stringify(err))
    }
  }
  $showNetworkError() {
    this.widgets.failok.notify({ title: Language.translate('No Internet'), msg: Language.translate('No internet connection. Please check your network and try again.') })
    Router.focusWidget('FailOk')
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

  /**
   * Function to set details of items in tv shows list.
   */
  set tvShowItems(items) {
    this.tag('TVShows').items = items.map((info, idx) => {
      return {
        w: 325,
        h: 183,
        type: ListItem,
        data: info,
        focus: 1.15,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    })
  }

  /**
   * Function to set the state in main view.
   */
  index(index) {
    if (index == 0) {
      this._setState('AppList')
    } else if (index == 1) {
      this._setState('DacApps')
    } else if (index == 2) {
      this._setState('TVShows')
    }
  }
  /**
   * Function to define various states needed for main view.
   */
  static _states() {
    return [
      class Gracenote extends this {
        $enter() {
          this.indexVal = 0
          this.scroll(270)
        }
        $exit() {
          this.tag('Text0').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text0').text.fontStyle = 'bold'
          if (this.tag('Gracenote').length) {
            return this.tag('Gracenote').element
          }
        }
        _handleDown() {
          if (this.inputSelect) {
            this._setState('Inputs')
          } else {
            this._setState('AppList')
          }
        }
        _handleRight() {
          if (this.tag('Gracenote').length - 1 != this.tag('Gracenote').index) {
            this.tag('Gracenote').setNext()
            return this.tag('Gracenote').element
          }
        }
        _handleUp() {
          this.widgets.menu.notify('TopPanel')
        }
        _handleLeft() {
          this.tag('Text0').text.fontStyle = 'normal'
          if (0 != this.tag('Gracenote').index) {
            this.tag('Gracenote').setPrevious()
            return this.tag('Gracenote').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        _handleEnter() {
          Router.navigate('menu/details', { gracenoteItem: this.tag('Gracenote').element.data, key: this.key })
        }
      },
      class Inputs extends this {
        $enter() {
          this.tag('Inputs.Title').text.fontStyle = 'bold'
          this.indexVal = 0
          this.scroll(270)
        }
        $exit() {
          this.tag('Inputs.Title').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Inputs.Title').text.fontStyle = 'bold'
          if (this.tag("Inputs.Slider").length) {
            return this.tag("Inputs.Slider").element
          }
        }
        _handleDown() {
          this._setState('AppList')
        }
        _handleUp() {
          if (this.gracenote) {
            this._setState('Gracenote')
          } else {
            this.widgets.menu.notify('TopPanel')
          }
        }
        _handleLeft() {
          if (0 != this.tag('Inputs.Slider').index) {
            this.tag('Inputs.Slider').setPrevious()
            return this.tag('Inputs.Slider').element
          } else {
            this.tag('Inputs.Title').text.fontStyle = 'normal'
            Router.focusWidget('Menu')
          }
        }
        _handleRight() {
          if (this.tag('Inputs.Slider').length - 1 != this.tag('Inputs.Slider').index) {
            this.tag('Inputs.Slider').setNext()
            return this.tag('Inputs.Slider').element
          }
        }

        _handleEnter() {
          this.LOG(JSON.stringify(this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data))
          this.hdmiApi.setHDMIInput(this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data)
            .then(() => {
              this.LOG('completed')
              GLOBALS.topmostApp = 'HDMI';
              const currentInput = this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data
              Storage.set("_currentInputMode", { id: currentInput.id, locator: currentInput.locator });
              // FIXME: make the visibility change when graphics overlay is implemented for input select.
            })
            .catch(err => {
              this.ERR('failed' + JSON.stringify(err))
              this.widgets.fail.notify({ title: this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data.displayName, msg: 'Select a different input.' })
              Router.focusWidget('Fail')
            })
        }

      },
      class AppList extends this {
        $enter() {
          // Skip to DacApps if My Apps is empty
          if (this.myAppsEmpty) {
            this._setState('DacApps')
            return
          }
          this.indexVal = 0
          if (this.inputSelect && this.gracenote) {
            this.scroll(-100)
          } else {
            this.scroll(270)
          }
        }
        $exit() {
          this.tag('Text1').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text1').text.fontStyle = 'bold'
          if (this.tag('AppList').length) {
            return this.tag('AppList').element
          }
        }
        _handleDown() {
          this._setState('DacApps')
        }
        _handleUp() {
          if (this.inputSelect) {
            this._setState('Inputs')
          }
          else if (this.gracenote) {
            this._setState('Gracenote')
          } else {
            this.widgets.menu.notify('TopPanel')
          }

        }
        _handleRight() {
          if (this.tag('AppList').length - 1 != this.tag('AppList').index) {
            this.tag('AppList').setNext()
            return this.tag('AppList').element
          }
        }
        _handleLeft() {
          this.tag('Text1').text.fontStyle = 'normal'
          if (0 != this.tag('AppList').index) {
            this.tag('AppList').setPrevious()
            return this.tag('AppList').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        async _handleEnter() {
          if (Router.isNavigating()) return;
          let appData = this.tag('AppList').items[this.tag('AppList').index].data;
          let applicationType = appData.applicationType;
          let uri = appData.uri;
          let appIdentifier = appData.appIdentifier;
          if (applicationType === 'DAC') {
            // Launch DAC app using startDACApp
            if (!GLOBALS.IsConnectedToInternet) {
              console.log('No internet connection. Cannot launch DAC app.')
              this.$showNetworkError()
              return
            }
            let dacApp = {
              id: appIdentifier || uri,
              name: appData.displayName,
              version: appData.version,
              type: 'application/dac.native',
              url: uri
            }
            this.LOG('Launching DAC app from My Apps: ' + JSON.stringify(dacApp))
            // Snapshot the launch generation and app name before awaiting;
            // startDACApp() can resolve after _detach() (which bumps
            // _launchGeneration) and even after a subsequent _attach() (which
            // sets _myAppsActive back to true). Checking both fields ensures
            // a stale completion cannot bubble $showLaunchError on the wrong
            // route or against a repopulated My Apps row.
            const launchAppName = appData.displayName
            const launchGeneration = this._launchGeneration
            try {
              const launched = await startDACApp(dacApp)
              if (!this._myAppsActive || this._launchGeneration !== launchGeneration) {
                return
              }
              if (!launched) {
                this.$showLaunchError({ name: launchAppName })
              }
            } catch (err) {
              if (!this._myAppsActive || this._launchGeneration !== launchGeneration) {
                return
              }
              this.$showLaunchError({ name: launchAppName, error: err.message || err })
            }
          }
        }
      },
      class DacApps extends this {
        $enter() {
          // Adjust scroll position based on My Apps visibility
          let scrollOffset = this.myAppsEmpty ? 270 : 0
          if (this.inputSelect && this.gracenote) {
            this.scroll(-200 + scrollOffset)
          } else {
            this.scroll(0 + scrollOffset)
          }
          this.indexVal = 1
        }
        $exit() {
          this.tag('Text2').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text2').text.fontStyle = 'bold'
          if (this.tag('DacApps').length) {
            return this.tag('DacApps').element
          }
        }
        _handleUp() {
          if (this.myAppsEmpty) {
            if (this.inputSelect) {
              this._setState('Inputs')
            } else if (this.gracenote) {
              this._setState('Gracenote')
            } else {
              this.widgets.menu.notify('TopPanel')
            }
          } else {
            this._setState('AppList')
          }
        }
        _handleDown() {
          this._setState('TVShows')
        }
        _handleRight() {
          if (this.tag('DacApps').length - 1 != this.tag('DacApps').index) {
            this.tag('DacApps').setNext()
            return this.tag('DacApps').element
          }
        }
        _handleLeft() {
          this.tag('Text2').text.fontStyle = 'normal'
          if (0 != this.tag('DacApps').index) {
            this.tag('DacApps').setPrevious()
            return this.tag('DacApps').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        // Note: _handleEnter is handled by DacAppItem component for download/install functionality
      },
      class TVShows extends this {
        $enter() {
          this.indexVal = 2
          // Adjust scroll position based on My Apps visibility
          let scrollOffset = this.myAppsEmpty ? 270 : 0
          if (this.inputSelect && this.gracenote) {
            this.scroll(-600 + scrollOffset)
          } else {
            this.scroll(-300 + scrollOffset)
          }
        }
        _handleUp() {
          let scrollOffset = this.myAppsEmpty ? 270 : 0
          this.scroll(270 + scrollOffset)
          this._setState('DacApps')
        }
        _getFocused() {
          this.tag('Text3').text.fontStyle = 'bold'
          if (this.tag('TVShows').length) {
            return this.tag('TVShows').element
          }
        }
        _handleRight() {
          if (this.tag('TVShows').length - 1 != this.tag('TVShows').index) {
            this.tag('TVShows').setNext()
            return this.tag('TVShows').element
          }
        }
        _handleLeft() {
          this.tag('Text3').text.fontStyle = 'normal'
          if (0 != this.tag('TVShows').index) {
            this.tag('TVShows').setPrevious()
            return this.tag('TVShows').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        _handleEnter() {
          if (Router.isNavigating()) return;
          if (!GLOBALS.IsConnectedToInternet) {
            this.$showNetworkError()
            return
          }
          const currentIndex = this.tag('TVShows').index
          const currentItem = this.tag('TVShows').items[currentIndex] && this.tag('TVShows').items[currentIndex].data
          if (!currentItem || !currentItem.uri) {
            return
          }
            Router.navigate('player', {
              url: currentItem.uri,
              displayName: currentItem.displayName,
              attribution: currentItem.attribution || null,
              drmConfig: currentItem.drmConfig || null,
            })
        }
        $exit() {
          this.tag('Text3').text.fontStyle = 'normal'
        }
      },
      class RightArrow extends this {
        //TODO
      },
      class LeftArrow extends this {
        //TODO
      },
    ]
  }
}
