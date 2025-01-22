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
 import AppApi from '../api/AppApi.js'
 import TimeItem from './TimeItem.js'
 import { GLOBALS } from '../Config/Config.js';
import FireBoltApi from '../api/firebolt/FireBoltApi.js';
 /**
  * Class for rendering items in Settings screen.
  */
 export default class TimeOverlayItems extends Lightning.Component {

     static _template() {
         return {
             TimeItemsContents: {
                y:3,
                List: {
                    type: Lightning.components.ListComponent,
                    h: 810,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -6,
                }
             },

         }
     }

     /**
      * Function refresh the list.
      */
     refreshList(item) {
         console.log("item from refreshList",item)
         this._item = item
         this.tag('List').items = Object.keys(item.time_region).map((ele, idx) => {
             return {
                 ref: 'Time' + idx,
                 w: 1620,
                 h: 90,
                 type: TimeItem,
                 item: [ele, ele === item.isActive],
             }
         })
     }

     _firstEnable() {
         this.appApi = new AppApi()
     }

     _init(){
        if ("ResidentApp" !== GLOBALS.selfClientName){
            FireBoltApi.get().localization.listen("timeZoneChanged",value =>{
                console.log('timezone changed successfully to ', JSON.stringify(value))
            })
        }
     }


     _handleDown() {
         this.tag('List').setNext()
     }

     _handleUp() {
         this.tag('List').setPrevious()
     }

     _handleEnter() {
         console.log(`${this._item.zone}/${this.tag('List').element._item[0]}`)
         this.fireAncestors("$updateTimeZone",`${this._item.zone}/${this.tag('List').element._item[0]}`)
        //  this.widgets.menu.updateTimeZone(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        if ("ResidentApp" === GLOBALS.selfClientName) {
            this.appApi.setZone(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        } else {
            FireBoltApi.get().localization.setTimeZone(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        }
        //  Router.navigate('settings/advanced/device/timezone', { refresh: true })
         return false; //to execute handle enter in parent component
     }

     _getFocused() {
         return this.tag('List').element
     }
 }
