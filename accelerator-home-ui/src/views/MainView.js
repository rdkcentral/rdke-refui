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
import { Lightning, Storage, Language, Router } from '@lightningjs/sdk'
import ListItem from '../items/ListItem.js'
import ThunderJS from 'ThunderJS'
import AppApi from '../api/AppApi.js'
import RDKShellApis from '../api/RDKShellApis.js'
import UsbApi from '../api/UsbApi.js'
import { CONFIG, GLOBALS } from '../Config/Config.js'
import XcastApi from '../api/XcastApi'
import HomeApi from '../api/HomeApi.js'
import GracenoteItem from '../items/GracenoteItem.js'
import { List } from '@lightningjs/ui'
import HDMIApi from '../api/HDMIApi.js'
import Network from '../api/NetworkApi.js'
import FireBoltApi from '../api/firebolt/FireBoltApi.js'

/** Class for main view component in home UI */
export default class MainView extends Lightning.Component {
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
            text: Language.translate('Featured Content'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
          zIndex: 0
        },
        AppList: {
          y: 37,
          x: 0,
          type: List,
          h: 400,
          scroll: {
            after: 2
          },
          spacing: 20,
        },
        Text2: {
          // x: 10 + 25,
          y: 395,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Lightning Apps'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
        },
        MetroApps: {
          x: -20,
          y: 435,
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
        },
        Text3: {
          // x: 10 + 25,
          y: 673,
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
          y: 710,
          w: 1745,
          h: 400,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          roll: true,
          itemSize: 277,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -4,
          clipping: false,
        },
        Text4: {
          // x: 10 + 25,
          y: 938,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Lightning Showcase'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
        },
        ShowcaseApps: {
          x: -20,
          y: 978,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          w: 1745,
          h: 400,
          itemSize: 277,
          roll: true,
          rollMax: 1745,
          horizontal: true,
          itemScrollOffset: -4,
          clipping: false,
        },
        Text5: {
          alpha: 0,
          // x: 10 + 25,
          y: 1203,
          h: 30,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 25,
            text: Language.translate('Partner Apps'),
            fontStyle: 'normal',
            textColor: 0xFFFFFFFF,
          },
        },
        UsbApps: {
          x: -20,
          y: 1243,
          type: Lightning.components.ListComponent,
          flex: { direction: 'row', paddingLeft: 20, wrap: false },
          w: 1745,
          h: 400,
          itemSize: 277,
          roll: true,
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
    this.tag('Text0').alpha = 1
    this.tag("Inputs").y = 440
    this.tag('Text1').y = 440 + inputSelectOffset
    this.tag('AppList').y = 477 + inputSelectOffset
    this.tag("Text2").y = 705 + inputSelectOffset
    this.tag("MetroApps").y = 745 + inputSelectOffset
    this.tag("Text3").y = 980 + inputSelectOffset
    this.tag("TVShows").y = 1020 + inputSelectOffset
    this.tag("Text4").y = 1248 + inputSelectOffset
    this.tag("ShowcaseApps").y = 1288 + inputSelectOffset
    this.tag("Text5").y = 1516 + inputSelectOffset
    this.tag("UsbApps").y = 1556 + inputSelectOffset
  }

  showInputSelect() {
    this.tag("Inputs").visible = true
    let gracenoteOffset = 0
    if (!this.gracenote) {
      gracenoteOffset = 440
    }
    this.tag("Inputs").y = this.gracenote ? 440 : 0
    this.tag('Text1').y = 440 + 275 - gracenoteOffset
    this.tag('AppList').y = 477 + 275 - gracenoteOffset
    this.tag("Text2").y = 705 + 275 - gracenoteOffset
    this.tag("MetroApps").y = 745 + 275 - gracenoteOffset
    this.tag("Text3").y = 980 + 275 - gracenoteOffset
    this.tag("TVShows").y = 1020 + 275 - gracenoteOffset
    this.tag("Text4").y = 1248 + 275 - gracenoteOffset
    this.tag("ShowcaseApps").y = 1288 + 275 - gracenoteOffset
    this.tag("Text5").y = 1516 + 275 - gracenoteOffset
    this.tag("UsbApps").y = 1556 + 275 - gracenoteOffset
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

  async _init() {
    this.gracenote = false
    this.inputSelect = false //false by default
    this.settingsScreen = false
    this.indexVal = 0
    this.usbApi = new UsbApi();
    this.homeApi = new HomeApi();
    this.xcastApi = new XcastApi();
    this.hdmiApi = new HDMIApi()
    this.appApi = new AppApi()
    let thunder = ThunderJS(CONFIG.thunderConfig);

    // for initially showing/hiding usb icon

    let appItems = this.homeApi.getAppListInfo()
    let data = this.homeApi.getPartnerAppsInfo()
    let metroApps = this.homeApi.getOnlineMetroApps()
    let showcaseApps = this.homeApi.getShowCaseApps()

    await this.homeApi.checkAppCompatability(appItems).then(res => {
      appItems = res
    })


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
      console.log('Query data is not proper: ' + e)
    }
    this.firstRowItems = appdetails_format
    this.tempRow = JSON.parse(JSON.stringify(this.firstRowItems));
    if (this.firstRowItems[0].uri === 'USB') {
      this.tempRow.shift()
    }
    this.appItems = this.tempRow
    this.usbApps = usbAppsArr

    this.hdmiApi.activate()
      .then(() => {
        this.hdmiApi.registerEvent('onDevicesChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          console.log('onDevicesChanged ', JSON.stringify(notification))
        })
        this.hdmiApi.registerEvent('onInputStatusChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          console.log('onInputStatusChanged ', JSON.stringify(notification))
        })
        this.hdmiApi.registerEvent('onSignalChanged', notification => {
          this.fireAncestors("$hideImage", 0);
          console.log('onSignalChanged ', JSON.stringify(notification))
          if (notification.signalStatus !== 'stableSignal') {
            RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
            this.widgets.fail.notify({ title: this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data.displayName, msg: Language.translate("Input disconnected") })
            Router.focusWidget('Fail')
          }
        })
        this.hdmiApi.registerEvent('videoStreamInfoUpdate', notification => {
          this.fireAncestors("$hideImage", 0);
          console.log('videoStreamInfoUpdate ', JSON.stringify(notification))
        })
        this.inputSelect = true //set the inputSelect to true if the device is tv, here considering hdmiApi is only available on tv
        this.appItems = this.tempRow
        this.hdmiApi.getHDMIDevices()
          .then(res => {
            if (res.length > 0)
              this.inputItems = res
          })
      })
      .catch(err => {
        console.log('HDMIInput Plugin not activated', err)
      })
    //get the available input methods from the api


    // for USB event
    const registerListener = () => {
      let listener;

      listener = thunder.on('org.rdk.UsbAccess', 'onUSBMountChanged', (notification) => {
        console.log('onUsbMountChanged notification: ', JSON.stringify(notification))
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
          console.log(`app items = ${this.appItems} ; `);

          if (currentPage === 'menu') { //refresh page to hide or show usb icon
            console.log('page refreshed on unplug/plug')

          }

          if (!notification.mounted) { //if mounted is false
            if (currentPage === 'usb' || currentPage === 'usb/image' || currentPage === 'usb/player') { // hot exit if we are on usb screen or sub screens
              // this.$changeHomeText('Home')
              Router.navigate('menu');
            }
          }
        }
        console.log(`usb event successfully registered`);
      })

      return listener;
    }
    Network.get()._thunder.on('org.rdk.Network.1', 'onInternetStatusChange', notification => {
      console.log('on InternetStatus Change', JSON.stringify(notification))
      this.refreshSecondRow()
    })

    await this.homeApi.checkAppCompatability(metroApps).then(res => {
      this.metroApps = res
    })

    await this.homeApi.checkAppCompatability(showcaseApps).then(res => {
      this.showcaseApps = res
    })

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
        console.log(`disabled the Usb Plugin`);
      }).catch(err => {
        console.error(`error while disabling the usb plugin = ${err}`)
      })
    }

    if (this.gracenote) {
      this._setState("Gracenote")
    } else if (this.inputSelect) {
      this._setState("Inputs")
    } else {
      this._setState("AppList.0")
    }
  }


  _focus() {
    this._setState(this.state);
  }

  _firstEnable() {
    console.timeEnd('PerformanceTest')
    console.log('Mainview Screen timer end - ', new Date().toUTCString())
    this.internetConnectivity = false;
  }

  scroll(val) {
    this.tag('MainView').patch({
      smooth: {
        y: [val, { timingFunction: 'ease', duration: 0.7 }]
      }
    })
  }
  refreshSecondRow() {
    this.metroApps = this.homeApi.getOnlineMetroApps()
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

  set showcaseApps(items) {
    this.tag('ShowcaseApps').items = items.map((info, idx) => {
      return {
        w: 268,
        h: 151,
        type: ListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    })
  }

  /**
   * Function to set details of items in app list.
   */
  set appItems(items) {
    this.currentItems = items
    this.tag('AppList').clear()
    this.tag('AppList').add(items.map((info, idx) => {
      return {
        w: this.gracenote || this.inputSelect ? 268 : 454,
        h: this.gracenote || this.inputSelect ? 151 : 255,
        type: ListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    }))
  }

  set metroApps(items) {
    this.tag('MetroApps').items = items.map((info, index) => {
      return {
        w: 268,
        h: 151,
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
        w: 257,
        h: 145,
        type: ListItem,
        data: info,
        focus: 1.15,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    })
  }

  set usbApps(items) {
    if (items.length > 0) {
      this.tag('Text5').alpha = 1;
    }
    this.tag('UsbApps').items = items.map((info, index) => {
      return {
        w: 257,
        h: 145,
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
   * Function to set the state in main view.
   */
  index(index) {
    if (index == 0) {
      this._setState('AppList')
    } else if (index == 1) {
      this._setState('MetroApps')
    } else if (index == 2) {
      this._setState('TVShows')
    } else if (index == 3) {
      if (this.tag('UsbApps').length) {
        this._setState('UsbApps')
      } else {
        this._setState('TVShows')
      }
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
          console.log(this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data)
          this.hdmiApi.setHDMIInput(this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data)
            .then(() => {
              console.log('completed')
              GLOBALS.topmostApp = 'HDMI';
              const currentInput = this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data
              Storage.set("_currentInputMode", { id: currentInput.id, locator: currentInput.locator });
              RDKShellApis.setVisibility(GLOBALS.selfClientName, false)
            })
            .catch(err => {
              console.log('failed', err)
              this.widgets.fail.notify({ title: this.tag('Inputs.Slider').items[this.tag('Inputs.Slider').index].data.displayName, msg: 'Select a different input.' })
              Router.focusWidget('Fail')
            })
        }

      },
      class AppList extends this {
        $enter() {
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
            return this.tag('AppList')
          }
        }
        _handleDown() {
          this._setState('MetroApps')
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
        _handleLeft() {
          this.tag('Text1').text.fontStyle = 'normal'
          Router.focusWidget('Menu')
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
            this.appApi.launchApp(applicationType, params).catch(err => {
              console.log("ApplaunchError: ", err)
            });
          }
        }
      },
      class MetroApps extends this {
        $enter() {
          if (this.inputSelect && this.gracenote) {
            this.scroll(-200)
          } else {
            this.scroll(-100)
          }
          this.indexVal = 1
        }
        $exit() {
          this.tag('Text2').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text2').text.fontStyle = 'bold'
          if (this.tag('MetroApps').length) {
            return this.tag('MetroApps').element
          }
        }
        _handleUp() {
          this._setState('AppList')
        }
        _handleDown() {
          this._setState('TVShows')
        }
        _handleRight() {
          if (this.tag('MetroApps').length - 1 != this.tag('MetroApps').index) {
            this.tag('MetroApps').setNext()
            return this.tag('MetroApps').element
          }
        }
        _handleLeft() {
          this.tag('Text2').text.fontStyle = 'normal'
          if (0 != this.tag('MetroApps').index) {
            this.tag('MetroApps').setPrevious()
            return this.tag('MetroApps').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        async _handleEnter() {
          if (Router.isNavigating()) return;
          let applicationType = this.tag('MetroApps').items[this.tag('MetroApps').index].data.applicationType;
          let appIdentifier = this.tag('MetroApps').items[this.tag('MetroApps').index].data.appIdentifier;
          let params = {
            url: this.tag('MetroApps').items[this.tag('MetroApps').index].data.uri,
            launchLocation: "mainView",
            appIdentifier: appIdentifier
          }
          await Network.get().isConnectedToInternet()
            .then(result => {
              if (result) {
                this.appApi.launchApp(applicationType, params).catch(err => {
                  console.log("ApplaunchError: ", JSON.stringify(err), err)
                });
              }
              else {
                this.widgets.fail.notify({ title: 'Network State', msg: 'Offline'})
                Router.focusWidget('Fail')
              }
            })
            .catch(err => {
              console.log(err)
            })
        }
      },
      class TVShows extends this {
        $enter() {
          this.indexVal = 2
          if (this.inputSelect && this.gracenote) {
            this.scroll(-600)
          } else {
            this.scroll(-400)
          }
        }
        _handleUp() {
          this.scroll(270)
          this._setState('MetroApps')
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
        _handleDown() {
          // if (this.tag('UsbApps').length) {
          this._setState("ShowcaseApps");
          //}
        }
        async _handleEnter() {
          if (Router.isNavigating()) return;
          try {
            this.internetConnectivity = await Network.get().isConnectedToInternet();
          } catch {
            this.internetConnectivity = false
          }
          console.log("MainView: internetConnectivity ", JSON.stringify(this.internetConnectivity));
          let displayName = this.tag('TVShows').items[this.tag('TVShows').index].data.displayName
          if (this.internetConnectivity) {
            if (displayName === "FOG HLS") {
              let params = {
                url: "http://127.0.0.1:9080/tsb?clientId=FOG_AAMP&recordedUrl=https%3A%2F%2Fcph-p2p-msl.akamaized.net%2Fhls%2Flive%2F2000341%2Ftest%2Fmaster.m3u8",
              }
              Router.navigate("player", params)
            }
            else if (displayName === "FOG DASH") {
              let params = {
                url: "http://127.0.0.1:9080/tsb?clientId=FOG_AAMP&recordedUrl=https%3A%2F%2Flin001-gb-s8-tst-ll.cdn01.skycdp.com%2FSKYNEHD_HD_SUD_SKYUKD_4050_18_0000000000000018163.mpd",
              }
              Router.navigate("player", params)
            }
            else {
              //this.fireAncestors('$goToPlayer')
              Router.navigate('player')
            }
          }
        }
        $exit() {
          this.tag('Text3').text.fontStyle = 'normal'
        }
      },

      class ShowcaseApps extends this {
        $enter() {
          if (this.inputSelect && this.gracenote) {
            this.scroll(-750)
          } else {
            this.scroll(-550)
          }
        }
        $exit() {
          this.tag('Text4').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text4').text.fontStyle = 'bold'
          if (this.tag('ShowcaseApps').length) {
            return this.tag('ShowcaseApps').element
          }
        }
        _handleUp() {
          this._setState('TVShows')
        }

        _handleRight() {
          if (this.tag('ShowcaseApps').length - 1 != this.tag('ShowcaseApps').index) {
            this.tag('ShowcaseApps').setNext()
            return this.tag('ShowcaseApps').element
          }
        }
        _handleDown() {
          if (this.tag('UsbApps').length) {
            this._setState("UsbApps");
          }
        }
        _handleLeft() {
          this.tag('Text4').text.fontStyle = 'normal'
          if (0 != this.tag('ShowcaseApps').index) {
            this.tag('ShowcaseApps').setPrevious()
            return this.tag('ShowcaseApps').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        async _handleEnter() {
          if (Router.isNavigating()) return;
          let applicationType = this.tag('ShowcaseApps').items[this.tag('ShowcaseApps').index].data.applicationType;
          let appIdentifier = this.tag('ShowcaseApps').items[this.tag('ShowcaseApps').index].data.appIdentifier;
          let appId = this.tag('ShowcaseApps').items[this.tag('ShowcaseApps').index].data.appId;
          let intent = this.tag('ShowcaseApps').items[this.tag('ShowcaseApps').index].data.intent;
          let params = {
            url: this.tag('ShowcaseApps').items[this.tag('ShowcaseApps').index].data.uri,
            launchLocation: "mainView",
            appIdentifier: appIdentifier
          }
          if (applicationType == "FireboltApp") {
            FireBoltApi.get().discovery.launch(appId, intent).then(res => {
              console.log(res)
              GLOBALS.topmostApp = "FireboltApp";
            })
          }
          else {
            this.appApi.launchApp(applicationType, params).catch(err => {
              console.log("ApplaunchError: ", JSON.stringify(err), err)
            });
          }
        }
      },

      class UsbApps extends this {
        $enter() {
          if (this.inputSelect && this.gracenote) {
            this.scroll(-1000)
          } else {
            this.scroll(-750)
          }
        }
        $exit() {
          this.tag('Text5').text.fontStyle = 'normal'
        }
        _getFocused() {
          this.tag('Text5').text.fontStyle = 'bold'
          if (this.tag('UsbApps').length) {
            return this.tag('UsbApps').element
          }
        }
        _handleUp() {
          this._setState('ShowcaseApps')
        }

        _handleRight() {
          if (this.tag('UsbApps').length - 1 != this.tag('MetroApps').index) {
            this.tag('UsbApps').setNext()
            return this.tag('UsbApps').element
          }
        }
        _handleLeft() {
          this.tag('Text5').text.fontStyle = 'normal'
          if (0 != this.tag('UsbApps').index) {
            this.tag('UsbApps').setPrevious()
            return this.tag('UsbApps').element
          } else {
            Router.focusWidget('Menu')
          }
        }
        async _handleEnter() {
          if (Router.isNavigating()) return;
          let applicationType = this.tag('UsbApps').items[this.tag('UsbApps').index].data.applicationType;
          let params = {
            url: this.tag('UsbApps').items[this.tag('UsbApps').index].data.uri,
            launchLocation: "mainView"
          }
          if (applicationType === "CameraApp") {
            let cameraParams = {
              cameraUrl: this.tag('UsbApps').items[this.tag('UsbApps').index].data.uri
            }
            Router.navigate("camera/player", cameraParams)
          } else {
            this.appApi.launchApp(applicationType, params).catch(err => {
              console.log("ApplaunchError: ", JSON.stringify(err), err)
            });
          }
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
