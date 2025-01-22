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
import { Lightning, Utils } from '@lightningjs/sdk'
import AppApi from '../api/AppApi';
import { CONFIG } from '../Config/Config'
/**
 * Class to render items in Subscription in details screen .
 */
let index = 0;
export default class SubscriptionItem extends Lightning.Component {
  static _template() {
    return {
      SubscriptionItem: {
        Title: {
          y: 40,
          mountY: 0.5,
          text: {
            text: "YouTube",
            fontFace: CONFIG.language.font,
            fontSize: 25,
            // maxLines: 1,
            wordWrap: false,
            wordWrapWidth: 175,
            fontStyle: 'normal',
            textOverflow: 'ellipsis',
          },
        },
        SubscriptionBox: {
          x: 183,
          y: 0,
          Lines: {
            TopLine: {
              y: 0,
              mountY: 0.5,
              w: 484,
              h: 3,
              rect: true,
              color: 0xFFFFFFFF
            },
            BottomLine: {
              y: 77,
              mountY: 0.5,
              w: 484,
              h: 3,
              rect: true,
              color: 0xFFFFFFFF
            }
          },
          Arrows: {
            ArrowBackward: {
              h: 30,
              w: 45,
              x: 0,
              scaleX: -1,
              y: 38,
              mountY: 0.5,
              src: Utils.asset('images/settings/Arrow.png'),
            },
            ArrowForward: {
              h: 30,
              w: 45,
              y: 38,
              x: 484,
              mountY: 0.5,
              mountX: 1,
              src: Utils.asset('images/settings/Arrow.png'),
            },
          }
        },
        SubscriptionValues: {
          x: 433,
          y: 40,
          mount: 0.5,
          zIndex: 2,
          text: {
            text: 'Youtube',
            fontSize: 25,
            fontFace: CONFIG.language.font,
            textColor: 0xffffffff,
            wordWrapWidth: 400,
            maxLines: 1,
            textOverflow: 'ellipsis',
            textAlign: 'center'
          },
        },
      }
    }
  }

  set item(item) {
    this._item = item
    this.tag('Title').text.text = this._item.host["_@attribute"]
    if (Array.isArray(this._item.viewingOptions.viewingOption)) {
      this.tag('SubscriptionValues').text.text = this.convertPricing(this._item.viewingOptions.viewingOption[0])
      this.tag('Arrows').visible = true
    } else if (this._item.viewingOptions.viewingOption !== null && typeof this._item.viewingOptions.viewingOption === 'object') {
      this.tag('SubscriptionValues').text.text = this.convertPricing(this._item.viewingOptions.viewingOption)
      this._item.viewingOptions.viewingOption = [this._item.viewingOptions.viewingOption]
      this.tag('Arrows').visible = false
    }
    // this.tag('SubscriptionValues').text.text=`${this._item.viewingOptions.viewingOption[0].price["_@attribute"]}-${this._item.viewingOptions.viewingOption[0].license}-${this._item.viewingOptions.viewingOption[0].quality}`;
  }

  convertPricing(option) {
    let res = ''
    if (option.license !== undefined) {
      let license = option.license.toLowerCase()
      res = res + license.substr(0, 1).toUpperCase() + license.substr(1) + " "
    }
    if (option.price !== undefined) {
      res = res + "$" + option.price["_@attribute"] + " "
    }
    if (option.quality !== undefined) {
      res = res + option.quality
    }
    return res
  }


  _focus() {
    this.tag("TopLine").color = CONFIG.theme.hex
    this.tag("TopLine").h = 5
    this.tag("BottomLine").color = CONFIG.theme.hex
    this.tag("BottomLine").h = 5
    this.tag("TopLine").zIndex = 10
    this.tag("BottomLine").zIndex = 10
    this.tag('Title').text.fontStyle = 'bold'
    this.tag('SubscriptionValues').text.fontStyle = 'bold'
    // console.log(this._item)
  }
  _handleLeft() {
    // index = (3 + (--index)) % 3;
    index = index - 1;
    if (index < 0) {
      index = this._item.viewingOptions.viewingOption.length - 1;
    }
    this.tag('SubscriptionValues').text.text = this.convertPricing(this._item.viewingOptions.viewingOption[index]);

  }
  _handleEnter() {
    // this.handleDone()
    if (this._item.host["_@attribute"].toLowerCase() === "youtube") {
      let appApi = new AppApi()
      console.log(this._item.url);
      let params = {
        url: this._item.url,
        launchLocation: "gracenote",
        appIdentifier: 'n:3'
      }
      appApi.launchApp("YouTube", params).catch((err) => {
        console.log("Error in launching YouTube", JSON.stringify(err))
      });
    }
  }
  _handleRight() {
    // index = (3 + (++index)) % 3;
    index = index + 1;
    if (index > this._item.viewingOptions.viewingOption.length - 1) {
      index = 0;
    }
    this.tag('SubscriptionValues').text.text = this.convertPricing(this._item.viewingOptions.viewingOption[index]);

  }
  _unfocus() {
    this.tag("TopLine").color = 0xFFFFFFFF
    this.tag("TopLine").h = 3
    this.tag("BottomLine").color = 0xFFFFFFFF
    this.tag("BottomLine").h = 3
    this.tag("TopLine").zIndex = 0
    this.tag("BottomLine").zIndex = 0
    this.tag('Title').text.fontStyle = 'normal'
    this.tag('SubscriptionValues').text.fontStyle = 'normal'
  }
}
