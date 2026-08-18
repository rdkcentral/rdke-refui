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
 /**
  * Class for rendering items in Settings screen.
  */
 export default class TimeOverlayItems extends Lightning.Component {

    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

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
        this.LOG("item from refreshList: " + JSON.stringify(item))
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

     _handleDown() {
         this.tag('List').setNext()
     }

     _handleUp() {
         this.tag('List').setPrevious()
     }

    _handleEnter() {
        this.LOG(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        this.fireAncestors("$updateTimeZone",`${this._item.zone}/${this.tag('List').element._item[0]}`)
        //  this.widgets.menu.updateTimeZone(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        this.appApi.setZone(`${this._item.zone}/${this.tag('List').element._item[0]}`)
        //  Router.navigate('settings/advanced/device/timezone', { refresh: true })
         return false; //to execute handle enter in parent component
     }

     _getFocused() {
         return this.tag('List').element
     }
 }
