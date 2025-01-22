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
import { Lightning, Utils, Router, Storage, Language } from '@lightningjs/sdk'
import BluetoothApi from './../api/BluetoothApi'
import HomeApi from '../api/HomeApi'
import AppApi from '../api/AppApi'
import Item from './../items/item'
import { CONFIG, GLOBALS } from '../Config/Config'
import Keymap from '../Config/Keymap'

/**
 * Class for splash screen.
 */
export default class SplashScreen extends Lightning.Component {
  static _template() {
    return {
      Splashscreen: {
        w: 1920,
        h: 1080,
        alpha: 1,
        src: Utils.asset('/images/splash/Splash-Background.jpg'),
        Img: {
          mount: 0.5,
          x: 1920 / 2,
          y: 1080 / 2,
          src: Utils.asset('/images/splash/RDKLogo.png'),
        },
      },
      AutoRemotePair: {
        w: 1920,
        h: 1080,
        src: Utils.asset('/images/splash/Splash-Background.jpg'),
        alpha: 0,
        Title: {
          w: 1600,
          y: 474,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 55,
            textAlign: 'center',
            text: Language.translate('Pair your remote control'),
            textColor: 0xffffffff,
          },
        },
        Description: {
          w: 1300,
          y: 550,
          x: 150,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 35,
            textAlign: 'center',
            maxLines: 2,
            text: Language.translate("Put the remote control in pairing mode; scan will start in one moment"),
            textColor: 0xffe5e5e5,
          },
        },
        LoadingIcon: {
          x: 750,
          y: 600,
          alpha: 0,
          src: Utils.asset('images/loading.png'),
        },
        RemoteImg: {
          x: 1300,
          y: 300,
          src: Utils.asset('images/remote.png'),
        },
      },
      ConnectivityScreen: {
        w: 1920,
        h: 1080,
        src: Utils.asset('/images/splash/Splash-Background.jpg'),
        alpha: 0,
        Title: {
          w: 1920,
          y: 325,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 55,
            textAlign: 'center',
            text: Language.translate("You're not connected to the internet"),
            textColor: 0xffffffff,
          },
        },
        Description: {
          w: 1920,
          y: 400,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 35,
            textAlign: 'center',
            maxLines: 2,
            text:
              Language.translate('Please connect to a wired network or a WiFi Network; press Home and then go to Settings'),
            wordWrapWidth: 1400,
            textColor: 0xffe5e5e5,
          },
        },
      },
      UISwitch: {
        rect: true,
        w: 1920,
        h: 1080,
        color: 0xff20344D,
        alpha: 0,
        Title: {
          x: 1920 / 2,
          y: 350,
          mountX: 0.5,
          text: {
            fontFace: CONFIG.language.font,
            fontSize: 55,
            textAlign: 'center',
            text: Language.translate('Choose a Service'),
            textColor: 0xffffffff,
          },
        },
        UIList: {
          x: 1920 / 2 - 20,
          y: 500,
          type: Lightning.components.ListComponent,
          w: 300 * 5,
          h: 150,
          itemSize: 300 + 20,
          roll: true,
          mountX: 0.5,
        },
      },
    }
  }
  /**
   * Function to be excuted when the Bluetooth screen is enabled.
   */
  _enable() {
    this.remotePaired = null
    this.hasInternet = true
    this._bt = new BluetoothApi()
    this._bt.activate()
    this._bt
      .getPairedDevices()
      .then(() => this._bt.getConnectedDevices())
      .then(() => {
        let paired = this._bt.pairedDevices

        if (paired.length > 0) {
          this.remotePaired = true
        } else {
          this.remotePaired = false
        }
      })

    this._setState('Splashscreen')
  }
  /**
   * Function to be executed when the Bluetooth screen is disabled from the screen.
   */
  _disable() {
    if (this._bt) this._bt.deactivate()
    if (this.player) this.player.stop()
  }

  _init() {
    this.appApi = new AppApi()
    let homeApi = new HomeApi()
    this.tag('UISwitch.UIList').items = homeApi.getUIInfo().map((item, index) => {
      return {
        ref: 'UI' + index,
        w: 300,
        h: 150,
        type: Item,
        item: item,
      }
    })
  }
  /**
   * Function to handle the different states of the app.
   */
  static _states() {
    return [
      class Splashscreen extends this {
        $enter() {
          const myAnimation = this.tag('Splashscreen').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 0, 1: 1 } }],
          })
          myAnimation.start()
          const myAnimationLogo = this.tag('Img').animation({
            duration: 4,
            repeat: 0,
            timingFunction: 'ease-in',
            actions: [
              { p: 'x', v: { 0: { v: 0, sm: 0.5 }, 1: 950 } },
              { p: 'y', v: { 0: { v: 0, sm: 0.5 }, 1: 550 } },
            ]
          })
          myAnimationLogo.start()

          this.screenTimeout = setTimeout(() => {
            if (this.remotePaired == false) this._setState('AutoRemotePair')
            else if (this.hasInternet == false) this._setState('ConnectivityScreen')
            else Router.navigate('home', { path: 'settings' })
          }, 5000)
        }
        _handleKey(event) {
          if (event.keyCode == Keymap.s) this._setState('UISwitch')
        }
        $exit() {
          const myAnimation = this.tag('Splashscreen').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
          })
          myAnimation.start()
          window.clearTimeout(this.screenTimeout)
        }
      },
      class SplashVideo extends this {
        $enter() {
          const myAnimation = this.tag('SplashVideo').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 0, 1: 1 } }],
          })
          myAnimation.start()
          //this.startVideo()
          this.timeout = setTimeout(() => {

          }, 5000)
        }
        $exit() {
          const myAnimation = this.tag('SplashVideo').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
          })
          myAnimation.on('finish', () => {
            if (this.player) this.player.stop()
          })
          myAnimation.start()
          window.clearTimeout(this.timeout)
        }
        _handleKey(event) {
          if (event.keyCode == Keymap.s) this._setState('UISwitch')
        }
      },
      class ConnectivityScreen extends this {
        $enter() {
          const myAnimation = this.tag('ConnectivityScreen').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [
              { p: 'alpha', v: { 0: 0, 1: 1 } },
              { p: 'x', v: { 0: 1000, 1: 0 } },
            ],
          })
          myAnimation.start()
          setTimeout(() => {
            Router.navigate('home', { path: 'settings' })
          }, 5000)
        }
        $exit() {
          const myAnimation = this.tag('ConnectivityScreen').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
          })
          myAnimation.start()
        }
        _handleKey() {
          Registry.setTimeout(() => {
            Router.navigate('home', { path: 'settings' })
          }, (Router.isNavigating() ? 20 : 0));
        }
      },
      class AutoRemotePair extends this {
        $enter() {
          const myAnimation = this.tag('AutoRemotePair').animation({
            duration: 1,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [
              { p: 'alpha', v: { 0: 0, 1: 1 } },
              { p: 'x', v: { 0: 1000, 1: 0 } },
            ],
          })
          let connected = false
          let timer = setTimeout(() => {
            if (!connected)
              this.tag('AutoRemotePair.Description').text =
                Language.translate('Please put the remote in pairing mode') + ", " + Language.translate('No device found')
            setTimeout(() => {
              if (this.hasInternet == false) this._setState('ConnectivityScreen')
              else Router.navigate('home', { path: 'settings' })
            }, 1000)
          }, 10000)
          let error = () => {
            this.tag('AutoRemotePair.Description').text =
              Language.translate('Please put the remote in pairing mode') + ", " + Language.translate('No device found')
            setTimeout(() => {
              if (this.hasInternet == false) this._setState('ConnectivityScreen')
              else Router.navigate('home', { path: 'settings' })
            }, 1000)
          }
          myAnimation.start()
          setTimeout(() => {
            this.tag('AutoRemotePair.Description').text =
              Language.translate('Please put the remote in pairing mode') + ", " + Language.translate("Scanning") + '...'
            const rotateAnimation = this.tag('AutoRemotePair.LoadingIcon').animation({
              duration: 1,
              repeat: -1,
              stopMethod: 'immediate',
              stopDelay: 0.2,
              actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: Math.PI * 2 } }],
            })
            rotateAnimation.play()
            this.tag('AutoRemotePair.LoadingIcon').alpha = 1
            this._bt.startScan()
            this._bt.registerEvent('onDiscoveredDevice', () => {
              let discovered = this._bt.discoveredDevices
              if (discovered.length > 0) {
                this._bt.pair(discovered[0].deviceID)
              } else {
                error()
              }
            })
          }, 5000)
          this._bt.registerEvent('onPairingChange', () => {
            let pairedDevices = this._bt.pairedDevices
            if (pairedDevices.length > 0) {
              this._bt.connect(pairedDevices[0].deviceID, pairedDevices[0].deviceType)
              this.tag('AutoRemotePair.Description').text = pairedDevices[0].deviceType + Language.translate('remote is paired')
            } else {
              setTimeout(() => {
                this._bt.getPairedDevices().then(() => {
                  let pairedDevices = this._bt.pairedDevices
                  if (pairedDevices.length > 0) {
                    this._bt.connect(pairedDevices[0].deviceID, pairedDevices[0].deviceType)
                  } else {
                    error()
                  }
                })
              }, 2000)
            }
          })
          this._bt.registerEvent('onConnectionChange', () => {
            let connectedDevices = this._bt.connectedDevices
            if (connectedDevices.length > 0) {
              this.tag('AutoRemotePair.Description').text = Language.translate('Remote is Connected to ') + connectedDevices[0].name
              connected = true
              clearTimeout(timer)
              setTimeout(() => {
                if (this.hasInternet == false) this._setState('ConnectivityScreen')
                else Router.navigate('home', { path: 'settings' })
              }, 2000)
            } else {
              setTimeout(() => {
                this._bt.getConnectedDevices().then(() => {
                  let connectedDevices = this._bt.connectedDevices
                  if (connectedDevices.length > 0) {
                    this.tag('AutoRemotePair.Description').text =
                      Language.translate('Connected to ') +
                      connectedDevices[0].name
                    connected = true
                    clearTimeout(timer)
                    setTimeout(() => {
                      if (this.hasInternet == false) this._setState('ConnectivityScreen')
                      else Router.navigate('home', { path: 'settings' })
                    }, 2000)
                  } else {
                    error()
                  }
                })
              }, 2000)
            }
          })
        }
        $exit() {
          const myAnimation = this.tag('AutoRemotePair').animation({
            duration: 1,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
          })
          myAnimation.start()
        }
      },
      class UISwitch extends this {
        $enter() {
          const myAnimation = this.tag('UISwitch').animation({
            duration: 0.5,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [
              { p: 'alpha', v: { 0: 0, 1: 1 } },
              { p: 'x', v: { 0: 1000, 1: 0 } },
            ],
          })
          myAnimation.start()
        }
        _getFocused() {
          console.log('get focused called')
          let _tagEle = this.tag('UISwitch.UIList').element
          let bgColor = ''
          if (_tagEle._item.title == 'LIVE') {
            bgColor = 0xFF445263
          } else if (_tagEle._item.title == 'TATA') {
            bgColor = 0xFF3097A7
          } else if (_tagEle._item.title == 'EPAM') {
            bgColor = 0xFF39C2D7
          } else if (_tagEle._item.title == 'NEW') {
            bgColor = 0xFF141E30
          } else if (_tagEle._item.title == 'COMINGSOON') {
            bgColor = 0xFF485E76
          } else if (_tagEle._item.title == 'DEFAULT') {
            bgColor = 0xff20344D
          }

          this.tag('UISwitch').patch({ smooth: { color: bgColor } })
          return this.tag('UISwitch.UIList').element
        }
        _handleRight() {
          if (this.tag('UISwitch.UIList').length - 1 != this.tag('UISwitch.UIList').index) {
            this.tag('UISwitch.UIList').setNext()
            return this.tag('UISwitch.UIList').element
          }
        }
        _handleLeft() {
          if (this.tag('UISwitch.UIList').index > 0) {
            this.tag('UISwitch.UIList').setPrevious()
            return this.tag('UISwitch.UIList').element
          }
        }
        _handleEnter() {
          if (this.tag('UISwitch.UIList').element._item.title != 'DEFAULT') {
            this.appApi.launchResident(this.tag('UISwitch.UIList').element._item.uri, GLOBALS.selfClientName).catch(err => {
              console.log(JSON.stringify(err));
            })
          } else {
            if (this.remotePaired == false) this._setState('AutoRemotePair')
            else if (this.hasInternet == false) this._setState('ConnectivityScreen')
            else Registry.setTimeout(() => {
              Router.navigate('home', { path: 'settings' })
            }, (Router.isNavigating() ? 20 : 0));
          }
        }
        $exit() {
          const myAnimation = this.tag('UISwitch').animation({
            duration: 1,
            repeat: 0,
            stopMethod: 'immediate',
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
          })
          myAnimation.start()
        }
      },
    ]
  }
}
