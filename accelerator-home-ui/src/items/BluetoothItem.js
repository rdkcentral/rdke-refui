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
 import SettingsItem from './SettingsItem'
 import { COLORS } from '../colors/Colors'
 import { CONFIG } from '../Config/Config'
 import { Language} from '@lightningjs/sdk'

 /**
  * Class for the item in the Bluetooth screen.
  */
 export default class BluetoothItem extends SettingsItem {
   static _template() {
     return {
       TopLine: {
         y: 0,
         mountY: 0.5,
         w: 1600,
         h: 3,
         rect: true,
         color: 0xFFFFFFFF
       },
       Item: {
         w: 1920 -300,
         h: 90,
       },
       BottomLine: {
         y: 90,
         mountY: 0.5,
         w: 1600,
         h: 3,
         rect: true,
         color: 0xFFFFFFFF
       },
     }
   }

   /**
    * Function to set contents of an item in the Bluetooth screen.
    */
   set item(item) {
     this._item = item
     this.connected = item.connected ? 'Connected' : 'Not Connected'
     this.status = item.paired ? Language.translate(this.connected) : Language.translate('Not Paired')
     this.tag('Item').patch({
       Left: {
         x: 10,
         y: 45,
         mountY: 0.5,
         text: { text: item.name, fontSize: 25, textColor: COLORS.textColor, fontFace: CONFIG.language.font },
       },

       Right: {
         x: 1600-200,
         y: 30,
         mountY: 0.5,
         mountX:1,
         Text: { text: { text: this.status, fontSize: 25,fontFace:CONFIG.language.font,verticalAlign:"middle" } },
       },
      //  Debug:{
      //    x: 300,
      //    y:5,
      //    mountY: 0.5,
      //    mountX:1,
      //    Text: { text: { text: `item: ${JSON.stringify(item)}`, fontSize: 15,fontFace:CONFIG.language.font,verticalAlign:"middle" } },
      //  }
     })
   }

   _focus() {
     this.tag('TopLine').color = CONFIG.theme.hex
     this.tag('BottomLine').color = CONFIG.theme.hex
     this.patch({
       zIndex:10
     })
    this.tag('TopLine').h = 6
    this.tag('BottomLine').h = 6
   }

   _unfocus() {
     this.tag('TopLine').color = 0xFFFFFFFF
     this.tag('BottomLine').color = 0xFFFFFFFF
     this.patch({
       zIndex:1
     })
      this.tag('TopLine').h = 3
      this.tag('BottomLine').h = 3
   }
   // _handleEnter() {
   //   // this.tag("Item").patch(
   //   //   {
   //   //     text: {
   //   //       text: "this works",
   //   //     }
   //   //   }
   //   // )
   //   this.fireAncestors('$connectBluetooth', this.tag('List').element.ref)
   // }
 }
