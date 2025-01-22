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
import { Utils, Language } from '@lightningjs/sdk'
import SettingsItem from './SettingsItem'
import { COLORS } from '../colors/Colors'
import { CONFIG } from '../Config/Config'


export default class LanguageItem extends SettingsItem {
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

  _init() {

  }

  /**
   * Function to set contents of an item in the Language screen.
   */
  set item(item) {


    // console.log(item)
    this.tag('Item').patch({
      Tick: {
        x: 10,
        y: 45,
        mountY: 0.5,
        w: 32.5,
        h: 32.5,
        src: Utils.asset('images/settings/Tick.png'),
        color: 0xffffffff,
        visible: Language.get() === item ? true : (item === 'en' && Language.get() === null) ? true : false
      },

      Left: {
        x: 60,
        y: 45,
        mountY: 0.5,
        text: { text: Language.translate(item), fontSize: 25, textColor: COLORS.textColor, fontFace: CONFIG.language.font, },
      },

    })
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
