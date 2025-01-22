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
 import { Lightning, Language } from '@lightningjs/sdk'
 import { CONFIG } from "../../Config/Config"
 let _item
 /**
  * Class for pairing screen for the Bluetooth.
  */
 export default class BluetoothPairingScreen extends Lightning.Component {
     static _template() {
         return {
             BluetoothPair: {
                 x: 960,
                 y: 300,
                 Title: {
                     mountX: 0.5,
                     text: {
                         text: "",
                         fontFace: CONFIG.language.font,
                         fontSize: 40,
                         textColor: CONFIG.theme.hex,
                     },
                 },
                 BorderTop: {
                     x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                 },
                 Pairing: {
                     x: 0,
                     y: 125,
                     mountX: 0.5,
                     text: {
                         text: "",
                         fontFace: CONFIG.language.font,
                         fontSize: 25,
                     },
                 },
                 Buttons: {
                     x: 0, y: 200, w: 440, mountX: 0.5, h: 50,
                     ConnectDisconnect: {
                         x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                         Title: {
                             x: 100,
                             y: 25,
                             mount: 0.5,
                             text: {
                                 text: "",
                                 fontFace: CONFIG.language.font,
                                 fontSize: 22,
                                 textColor: 0xFF000000
                             },
                         }
                     },
                     Unpair: {
                         x: 0 + 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                         Title: {
                             x: 100,
                             y: 25,
                             mount: 0.5,
                             text: {
                                 text: Language.translate("Unpair"),
                                 fontFace: CONFIG.language.font,
                                 fontSize: 22,
                                 textColor: 0xFF000000
                             },
                         }
                     },
                     Cancel: {
                         x: 0 + 220 + 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFF7D7D7D,
                         Title: {
                             x: 100,
                             y: 25,
                             mount: 0.5,
                             text: {
                                 text: Language.translate("Cancel"),
                                 fontFace: CONFIG.language.font,
                                 fontSize: 22,
                                 textColor: 0xFF000000
                             },
                         }
                     },
                 },
                 BorderBottom: {
                     x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                 },
             },
         }
     }

     getData(item) {
        console.log("setting pairing screen item: ",item)
         _item = item
         this._setState('ConnectDisconnect')
         this.tag('Title').text = item.name
         if (item.connected) {
             this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').text = Language.translate('Disconnect')
         } else {
             this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').text = Language.translate('Connect')
         }
     }

     _init() {
         this._setState('ConnectDisconnect')
     }
     _focus(){
        this._setState('ConnectDisconnect')
        this.item(this.fireAncestors("$BluetoothParams"))
     }

     static _states() {
         return [
             class ConnectDisconnect extends this {
                 $enter() {
                     this._focus()
                 }
                 _handleEnter() {
                     // this.tag('Pairing').text = "Someting is wrong " + _item.name
                     if (_item.connected) {
                         this.fireAncestors('$triggerBluetoothAction', 'Disconnect')
                     } else {
                         this.fireAncestors('$triggerBluetoothAction', 'Connect')
                     }
                 }
                 _handleRight() {
                     this._setState('Unpair')
                 }
                 _focus() {
                     this.tag('BluetoothPair.Buttons.ConnectDisconnect').patch({
                         color: CONFIG.theme.hex
                     })
                     this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').patch({
                         text: {
                             textColor: 0xFFFFFFFF
                         }
                     })
                 }
                 _unfocus() {
                     this.tag('BluetoothPair.Buttons.ConnectDisconnect').patch({
                         color: 0xFFFFFFFF
                     })
                     this.tag('BluetoothPair.Buttons.ConnectDisconnect.Title').patch({
                         text: {
                             textColor: 0xFF000000
                         }
                     })
                 }
                 $exit() {
                     this._unfocus()
                 }
             },
             class Unpair extends this {
                 $enter() {
                     this._focus()
                 }
                 _handleEnter() {
                     this.fireAncestors('$triggerBluetoothAction', 'Unpair')

                 }
                 _handleRight() {
                     this._setState('Cancel')
                 }
                 _handleLeft() {
                     this._setState('ConnectDisconnect')
                 }
                 _focus() {
                     this.tag('Unpair').patch({
                         color: CONFIG.theme.hex
                     })
                     this.tag('Unpair.Title').patch({
                         text: {
                             textColor: 0xFFFFFFFF
                         }
                     })
                 }
                 _unfocus() {
                     this.tag('Unpair').patch({
                         color: 0xFFFFFFFF
                     })
                     this.tag('Unpair.Title').patch({
                         text: {
                             textColor: 0xFF000000
                         }
                     })
                 }
                 $exit() {
                     this._unfocus()
                 }
             },
             class Cancel extends this {
                 $enter() {
                     this._focus()
                 }
                 _handleEnter() {
                     this.fireAncestors('$triggerBluetoothAction', 'Cancel')
                 }
                 _handleLeft() {
                     this._setState('Unpair')
                 }
                 _focus() {
                     this.tag('Cancel').patch({
                         color: CONFIG.theme.hex
                     })
                     this.tag('Cancel.Title').patch({
                         text: {
                             textColor: 0xFFFFFFFF
                         }
                     })
                 }
                 _unfocus() {
                     this.tag('Cancel').patch({
                         color: 0xFF7D7D7D
                     })
                     this.tag('Cancel.Title').patch({
                         text: {
                             textColor: 0xFF000000
                         }
                     })
                 }
                 $exit() {
                     this._unfocus()
                 }
             },
         ]
     }

 }
