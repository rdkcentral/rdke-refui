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
import { COLORS } from '../colors/Colors'
import { CONFIG } from '../Config/Config'

export default class WiFiItem extends Lightning.Component {

  _construct() {
    this.Lock = Utils.asset('/images/settings/Lock.png')
    this.WiFi1 = Utils.asset('/images/settings/WiFi1.png')
    this.WiFi2 = Utils.asset('/images/settings/WiFi2.png')
    this.WiFi3 = Utils.asset('/images/settings/WiFi3.png')
    this.WiFi4 = Utils.asset('/images/settings/WiFi4.png')
    this.Tick = Utils.asset('/images/settings/Tick.png')
  }

  _init() {
    this.tag('Item.Tick').on('txError', () => {
      const url = 'http://127.0.0.1:50050/lxresui/static/images/settings/Tick.png'
      this.tag('Item.Tick').src = url
    })
  }
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
        w: 1600,
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
    if(item.ssid){
      this.status = item.connected ? 'Connected' : 'Not Connected'
    }
    let wifiicon = "";
    if (item.signalStrength >= -50) {
      wifiicon = this.WiFi4
    }
    else if (item.signalStrength >= -60) {
      wifiicon = this.WiFi3
    }
    else if (item.signalStrength >= -67) {
      wifiicon = this.WiFi2
    }
    else {
      wifiicon = this.WiFi1
    }



    this.tag('Item').patch({
      Tick: {
        x: 10,
        y: 45,
        mountY: 0.5,
        h: 32.5,
        w: 32.5,
        src: this.Tick,
        //texture: Lightning.Tools.getSvgTexture(this.Tick, 32.5, 32.5),
        color: 0xffffffff,
        visible: item.connected ? true : false
      },
      Left: {
        x: 40,
        y: 45,
        mountY: 0.5,
        text: { text: `${item.ssid} - ${item.frequency}G`, fontSize: 25, textColor: COLORS.textColor, fontFace: CONFIG.language.font, },
      },

      Right: {
        x: 1560,
        mountX: 1,
        y: 45,
        mountY: 0.5,
        flex: { direction: 'row' },
        Lock: {
          color: 0xffffffff,
          texture: Lightning.Tools.getSvgTexture(this.Lock, 32.5, 32.5),
          alpha: 1
        },
        Icon: {
          color: 0xffffffff,
          flexItem: { marginLeft: 15 },
          texture: Lightning.Tools.getSvgTexture(wifiicon, 32.5, 32.5),
        },
      },
    })
    if (item.security == '0' || item.security == '15') {
      this.tag('Item.Right.Lock').visible = false
    } else {
      this.tag('Item.Right.Lock').visible = true
    }
  }

  _focus() {
    this.tag("Item").color = COLORS.hightlightColor
    this.tag('TopLine').color = CONFIG.theme.hex
    this.tag('BottomLine').color = CONFIG.theme.hex
    this.patch({
      zIndex: 2
    })
    this.tag('TopLine').h = 6
    this.tag('BottomLine').h = 6
  }

  _unfocus() {
    this.tag('TopLine').color = 0xFFFFFFFF
    this.tag('BottomLine').color = 0xFFFFFFFF
    this.patch({
      zIndex: 1
    })
    this.tag('TopLine').h = 3
    this.tag('BottomLine').h = 3
  }
}
