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
 import SettingsItem from '../../items/SettingsItem'
 
 export default class HDRScreen extends Lightning.Component {
     static _template() {
         return {
             List: {
                 w: 1920 - 300,
                 type: Lightning.components.ListComponent,
                 itemSize: 90,
                 horizontal: false,
                 invertDirection: true,
                 roll: true,
                 rollMax: 900,
                 itemScrollOffset: -5,
             }
         }
     }
     _init() {
         this.lastElement = false
         this.options = [
            { value: 'Auto', tick: true },
            { value: 'Follow TV', tick: false },
            { value: 'SDR', tick: false },
            { value: 'HDR', tick: false },
            { value: 'Dolby Vision', tick: false },
         ]
         this.tag('List').h = this.options.length * 90
         this.tag('List').items = this.options.map(item => {
             return {
                 w: 1920 - 300,
                 h: 90,
                 type: SettingsItem,
                 item: item.value
             }
         })
         this.tag('List').getElement(0).tag('Tick').visible = true
         this._setState('Options')
     }
 
     static _states() {
         return [
             class Options extends this{
                 _getFocused() {
                     return this.tag('List').element
                 }
                 _handleDown() {
                     this.tag('List').setNext()
                 }
                 _handleUp() {
                     this.tag('List').setPrevious()
                 }
                 _handleEnter() {
                     this.options.forEach((element, idx) => {
                         if (element.tick) {
                             this.tag('List').getElement(idx).tag('Tick').visible = false
                             this.options[idx].tick = false
                         }
                     });
                     this.tag('List').element.tag('Tick').visible = true
                     this.options[this.tag('List').index].tick = true
                     this.fireAncestors('$updateHDR', this.options[this.tag('List').index].value)
                 }
             }
         ]
     }
 }