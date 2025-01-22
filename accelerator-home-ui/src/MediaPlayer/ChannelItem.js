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

 import { Lightning } from '@lightningjs/sdk'
 import { CONFIG } from '../Config/Config'


 export default class ChannelItem extends Lightning.Component {
   static _template(){
     return {
        zIndex:1,
        TopLine: {
          y: 0,
          mountY: 0.5,
          w: 232,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
        Item: {
          w: 232,
          h: 81,
        },
        BottomLine: {
          y: 81,
          mountY: 0.5,
          w: 232,
          h: 3,
          rect: true,
          color: 0xFFFFFFFF
        },
     }
   }

   set item(item) {
    //  this.shows = item.shows;
     this._item = item
     this.tag('Item').patch({
         Title: {
             x: 10,
             y: 45,
             mountY: 0.5,
             text: { text: this.index+1 + "\t\t\t\t" + item.shortname, fontFace: CONFIG.language.font, fontSize: 21, textColor: 0xffFFFFFF,wordWrap:false,wordWrapWidth:232-20,maxLines:1,textOverflow:'...' }, // update the text
         },
     })
   }



  _focus(){
    this.tag('TopLine').color = CONFIG.theme.hex
    this.tag('BottomLine').color = CONFIG.theme.hex
    this.tag('TopLine').h = 5
    this.tag('BottomLine').h = 5
    this.tag('Item.Title').text.fontStyle = "bold"
    this.patch({
      zIndex: 2
    })
  }

  _unfocus(){
    this.tag('TopLine').color = 0xFFFFFFFF
    this.tag('BottomLine').color = 0xFFFFFFFF
    this.tag('TopLine').h = 3
    this.tag('BottomLine').h = 3
    this.tag('Item.Title').text.fontStyle = "normal"
    this.patch({
      zIndex: 1
    })
  }
}
