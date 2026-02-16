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
import ThunderJS from 'ThunderJS'
import AppApi from '../api/AppApi.js'
import RDKShellApis from '../api/RDKShellApis.js'
import UsbApi from '../api/UsbApi.js'
import { CONFIG, GLOBALS } from '../Config/Config.js'
import XcastApi from '../api/XcastApi'
import HomeApi from '../api/HomeApi.js'
import GracenoteItem from '../items/GracenoteItem.js'
import HDMIApi from '../api/HDMIApi.js'
import NetworkManager from '../api/NetworkManagerAPI.js'
import AppManager from '../api/AppManagerApi.js'
import { getAppCatalogInfo, getInstalledDACApps } from '../api/DACApi.js'

/** Class for main view component in home UI */
export default class MainView extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
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
    let inputSelectOffset = 0
    if (this.inputSelect) {
      inputSelectOffset = 275
    }
    let myAppsOffset = this.myAppsEmpty ? -305 : 0
    this.tag('Text0').alpha = 1
    this.tag("Inputs").y = 440
    this.tag('Text1').y = 440 + inputSelectOffset
    this.tag('AppList').y = 477 + inputSelectOffset
    this.tag("Text2").y = 705 + inputSelectOffset + myAppsOffset
    this.tag("DacApps").y = 745 + inputSelectOffset + myAppsOffset
    this.tag("Text3").y = 980 + inputSelectOffset + myAppsOffset
    this.tag("TVShows").y = 1020 + inputSelectOffset + myAppsOffset
  }

  showInputSelect() {
    this.tag("Inputs").visible = true
    let gracenoteOffset = 0
    if (!this.gracenote) {
      gracenoteOffset = 440
    }
    let myAppsOffset = this.myAppsEmpty ? -305 : 0
    this.tag("Inputs").y = this.gracenote ? 440 : 0
    this.tag('Text1').y = 440 + 275 - gracenoteOffset
    this.tag('AppList').y = 477 + 275 - gracenoteOffset
    this.tag("Text2").y = 705 + 275 - gracenoteOffset + myAppsOffset
    this.tag("DacApps").y = 745 + 275 - gracenoteOffset + myAppsOffset
    this.tag("Text3").y = 980 + 275 - gracenoteOffset + myAppsOffset
    this.tag("TVShows").y = 1020 + 275 - gracenoteOffset + myAppsOffset
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
    let installedApps = await getInstalledDACApps()
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
        url: app.icon || '/images/apps/App_Store.png',
        appIdentifier: app.id,
        version: app.version
      }))
    // Add "More Apps" item at the end
    apps.push({
      displayName: 'More Apps',
      applicationType: 'MoreApps',
      uri: 'apps',
      url: '/images/sidePanel/moreapps.png',
      appIdentifier: 'moreApps'
    })
    return apps
  }

  async _init() {
    this.gracenote = false
    this.inputSelect = false //false by default
    this.settingsScreen = false
    this.myAppsEmpty = true // Will be updated when appItems is set
    this.indexVal = 0
    this.usbApi = new UsbApi();
    this.homeApi = new HomeApi();
    this.xcastApi = new XcastApi();
    this.hdmiApi = new HDMIApi()
    this.appApi = new AppApi()
    let thunder = ThunderJS(CONFIG.thunderConfig);

    // Setup loading animation for DacApps
    this.dacAppsLoadingAnimation = this.tag('DacAppsLoader').animation({
      duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
    });
    // Start loading animation
    this._showDacAppsLoader()

    // for initially showing/hiding usb icon

    let appItems = []
    try {
      appItems = await this._buildInstalledAppsList()
      this.LOG('Installed apps: ' + JSON.stringify(appItems))
    } catch (err) {
      this.ERR('Failed to fetch installed apps: ' + JSON.stringify(err))
      appItems = []
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


    let prop_apps = 'applications'
    let prop_displayname = 'displayName'
    let prop_uri = 'uri'
    let prop_apptype = 'applicationType'
    let appdetails = []
    let appdetails_format = []
    let usbAppsArr = [];
    try {
      if (data != null && Object.prototype.hasOwnProperty.call(JSON.parse(data), prop_apps)) {
        appdetails = JSON.parse(data).applications
        for (let i = 0; i < appdetails.length; i++) {
          if (
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_displayname) &&
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_uri) &&
            Object.prototype.hasOwnProperty.call(appdetails[i], prop_apptype)
          ) {
            usbAppsArr.push(appdetails[i])
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
    this.firstRowItems = appdetails_format
    this.tempRow = JSON.parse(JSON.stringify(this.firstRowItems));
    if (this.firstRowItems.length > 0 && this.firstRowItems[0].uri === 'USB') {
      this.tempRow.shift()
    }
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
            RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
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


    // for USB event
    const registerListener = () => {
      let listener;

      listener = thunder.on('org.rdk.UsbAccess', 'onUSBMountChanged', (notification) => {
        this.LOG('onUsbMountChanged notification: ' + JSON.stringify(notification))
        Storage.set('UsbMountedStatus', notification.mounted ? 'mounted' : 'unmounted')
        const currentPage = window.location.href.split('#').slice(-1)[0]
        if (Storage.get('UsbMedia') === 'ON') {

          if (notification.mounted) {
            this.appItems = this.firstRowItems
            this._setState('AppList.0')
          } else if (!notification.mounted) {
            this.appItems = this.tempRow
            this._setState('AppList.0')
          }
          this.LOG('app items = ' + JSON.stringify(this.appItems));

          if (currentPage === 'menu') { //refresh page to hide or show usb icon
            this.LOG('page refreshed on unplug/plug')

          }

          if (!notification.mounted) { //if mounted is false
            if (currentPage === 'usb' || currentPage === 'usb/image' || currentPage === 'usb/player') { // hot exit if we are on usb screen or sub screens
              // this.$changeHomeText('Home')
              Router.navigate('menu');
            }
          }
        }
        this.LOG('usb event successfully registered');
      })

      return listener;
    }
    NetworkManager.thunder.on('org.rdk.NetworkManager', 'onInternetStatusChange', notification => {
      this.LOG('on InternetStatus Change' + JSON.stringify(notification))
      this.refreshSecondRow()
    })

    this.dacApps = dacCatalog

    this.fireAncestors("$mountEventConstructor", registerListener.bind(this))

    this.refreshFirstRow()
    // this._setState('AppList.0')
  }

  _firstActive() {
    if (!Storage.get('UsbMedia')) {
      this.usbApi.activate().then(() => {
        Storage.set('UsbMedia', 'ON')
        this.fireAncestors('$registerUsbMount')
      })
    } else if (Storage.get('UsbMedia') === 'ON') {
      this.usbApi.activate().then(() => {
        this.fireAncestors('$registerUsbMount')
      })
    } else if (Storage.get('UsbMedia') === 'OFF') {
      // deactivate usb Plugin here
      this.usbApi.deactivate().then(() => {
        this.LOG(`disabled the Usb Plugin`);
      }).catch(err => {
        this.ERR(`error while disabling the usb plugin = ${err}`)
      })
    }

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
    this._setState(this.state);


  }

  _firstEnable() {
    console.timeEnd('PerformanceTest')
    this.LOG('Mainview Screen timer end - ' + JSON.stringify(new Date().toUTCString()))
    this.internetConnectivity = false;
  }

  scroll(val) {
    this.tag('MainView').patch({
      smooth: {
        y: [val, { timingFunction: 'ease', duration: 0.7 }]
      }
    })
  }
  async refreshSecondRow() {
    try {
      // Show loader while fetching
      this._showDacAppsLoader()
      this.dacApps = await this._buildDacAppsList()
    } catch (err) {
      this.ERR('Failed to refresh DAC catalog: ' + JSON.stringify(err))
      this._hideDacAppsLoader()
    }
  }
  refreshFirstRow() {
    if (Storage.get('UsbMedia') === 'ON') {
      this.usbApi.activate().then(() => {
        this.usbApi.getMountedDevices().then(result => {
          if (result.mounted.length === 1) {
            this.appItems = this.firstRowItems
          } else {
            this.appItems = this.tempRow
          }
        })
      })
    } else if (Storage.get('UsbMedia') === 'OFF') {
      this.appItems = this.tempRow
    } else {
      Storage.set('UsbMedia', 'ON')
      this.usbApi.activate().then(() => {
        this.usbApi.getMountedDevices().then(result => {
          if (result.mounted.length === 1) {
            this.appItems = this.firstRowItems
          } else {
            this.appItems = this.tempRow
          }
        })
      })
    }
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
    this.currentItems = items
    this.myAppsEmpty = !items || items.length === 0
    
    // Hide My Apps row if empty
    this.tag('Text1').visible = !this.myAppsEmpty
    this.tag('AppList').visible = !this.myAppsEmpty
    
    // Update row positions based on My Apps visibility
    this._updateRowPositions()
    
    this.tag('AppList').items = items.map((info, idx) => {
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
   * Update row positions based on My Apps visibility
   */
  _updateRowPositions() {
    // My Apps row takes approximately 305px (Text1 at 0 + AppList at 37 with height ~268)
    const myAppsOffset = this.myAppsEmpty ? -305 : 0
    
    // Update positions for rows below My Apps
    this.tag('Text2').y = 305 + myAppsOffset
    this.tag('DacAppsLoader').y = 437 + myAppsOffset  // Centered in DacApps row (345 + 183/2 ≈ 437)
    this.tag('DacApps').y = 345 + myAppsOffset
    this.tag('Text3').y = 613 + myAppsOffset
    this.tag('TVShows').y = 650 + myAppsOffset
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
        type: ListItem,
        data: info,
        focus: 1.15,
        unfocus: 1,
        idx: index,
        bar: 12
      }
    })
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
              RDKShellApis.setVisibility(GLOBALS.selfClientName, false)
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
          let applicationType = this.tag('AppList').items[this.tag('AppList').index].data.applicationType;
          let uri = this.tag('AppList').items[this.tag('AppList').index].data.uri;
          let appIdentifier = this.tag('AppList').items[this.tag('AppList').index].data.appIdentifier;
          if (uri === 'USB') {
            this.usbApi.getMountedDevices().then(result => {
              if (result.mounted.length === 1) {
                Router.navigate('usb');
              }
            })
          } else {
            let params = {
              url: uri,
              launchLocation: "mainView",
              appIdentifier: appIdentifier
            }
            // this.appApi.launchApp(applicationType, params).catch(err => {
            //   this.ERR("ApplaunchError: "+ JSON.stringify(err))
            // });
            //since we have only one bundle which is com.rdk.app.cobalt2025 for youtube app, directly hardcoding the app launch for youtube
            if(applicationType === "YouTube"){
            AppManager.get().launchApp("com.rdk.app.cobalt2025")}
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
        async _handleEnter() {
          if (Router.isNavigating()) return;
          let applicationType = this.tag('DacApps').items[this.tag('DacApps').index].data.applicationType;
          let appIdentifier = this.tag('DacApps').items[this.tag('DacApps').index].data.appIdentifier;
          
          // Handle "More Apps" item - navigate to apps route
          if (applicationType === 'MoreApps') {
            Router.navigate('apps');
            return;
          }
          
          let params = {
            url: this.tag('DacApps').items[this.tag('DacApps').index].data.uri,
            launchLocation: "mainView",
            appIdentifier: appIdentifier
          }
          
          if (GLOBALS.IsConnectedToInternet) {
            this.appApi.launchApp(applicationType, params).catch(err => {
              this.ERR("ApplaunchError: " + JSON.stringify(err))
            });
          }
          else {
            this.widgets.fail.notify({ title: 'Network State', msg: 'Offline'})
            Router.focusWidget('Fail')
          }
        }
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
        async _handleEnter() {
          if (Router.isNavigating()) return;
          this.LOG("MainView: internetConnectivity " + JSON.stringify(GLOBALS.IsConnectedToInternet));
          let params ={url: this.tag('TVShows').items[this.tag('TVShows').index].data.uri,
          }
          if (GLOBALS.IsConnectedToInternet) {
            Router.navigate("player",params)
          }
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
