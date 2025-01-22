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
import SidePanelItem from '../items/SidePanelItem.js'
import HomeApi from '../api/HomeApi.js'
import Keymap from '../Config/Keymap.js'

/** Class for side panel in home UI */
export default class SidePanel extends Lightning.Component {
  static _template() {
    return {
      color: 0xff000000,
      rect: true,
      y: 270,
      w: 200,
      h: 810,
      SidePanel: {
        x: 0,
        y: 127,
        w: 240,
        h: 750,
        type: Lightning.components.ListComponent,
        roll: true,
        horizontal: false,
        invertDirection: true,
      },
    }
  }

  _init() {
    this.homeApi = new HomeApi()
    this.tag('SidePanel').sidePanelItems = this.homeApi.getSidePanelInfo()
    this.sidePanelData = this.homeApi.getSidePanelInfo()
    this._setState('SidePanel')
    this.indexVal = 0
    this.prevIndex = 0
  }

  /**
   * Function to set items in side panel.
   */
  set sidePanelItems(items) {
    this.tag('SidePanel').patch({ x: 105 })
    this.tag('SidePanel').items = items.map((info, index) => {
      this.data = info
      return {
        w: 50,
        h: 50,
        y: index == 0 ? 20 : (index + 1) * 20,
        type: SidePanelItem,
        data: info,
        focus: 1.1,
        unfocus: 1,
        x_text: 100,
        y_text: 160,
        text_focus: 1.1,
        text_unfocus: 0.9,
      }
    })
    this.tag('SidePanel').start()
  }

  /**
   * Function to reset items in side panel.
   */
  set resetSidePanelItems(items) {
    this.tag('SidePanel').patch({ x: 0 })
    this.tag('SidePanel').items = items.map((info, index) => {
      return {
        w: 204,
        h: 184,
        y: index == 0 ? 25 : (index == 1 ? 105 : (index == 2 ? 260 : 470)),
        type: SidePanelItem,
        data: info,
        focus: 0.7,
        unfocus: 0.4,
        x_text: 100,
        y_text: 160,
        text_focus: 1.1,
        text_unfocus: 0.9,
      }
    })
    this.tag('SidePanel').start()
  }
  /**
   * Function to set scaling to side panel.
   */
  set scale(scale) {
    this.tag('SidePanel').patch({ scale: scale })
  }

  /**
   * Function to set x coordinate of side panel.
   */
  set x(x) {
    this.tag('SidePanel').patch({ x: x })
  }

  /**
   * Function to set index value of side panel.
   */
  set index(index) {
    this.tag('SidePanel').items[this.prevIndex].clearColor()
    this.indexVal = index
  }

  set deFocus(val) {
    if (val) {
      this.tag('SidePanel').items[this.prevIndex].clearColor()
    } else {
      this.tag('SidePanel').items[this.prevIndex].setColor()
    }

  }
  set scrollableLastRow(bool) {
    this.isLastRowScrollable = bool;
  }

  static _states() {
    return [
      class SidePanel extends this {
        _getFocused() {
          if (this.tag('SidePanel').length) {
            return this.tag('SidePanel').items[this.indexVal]
          }
        }
        _handleKey(key) {
          if (key.keyCode == Keymap.ArrowRight || key.keyCode == Keymap.Enter) {
            if (this.prevIndex != this.indexVal) {
              this.tag('SidePanel').items[this.prevIndex].clearColor()
            }
            this.prevIndex = this.indexVal
            this.fireAncestors('$goToMainView', this.tag('SidePanel').items[this.indexVal], this.indexVal)
          } else if (key.keyCode == Keymap.ArrowDown) {
            if (this.tag('SidePanel').length - 1 != this.indexVal) {
              this.indexVal = this.indexVal + 1
            }
            return this.tag('SidePanel').items[this.indexVal]
          } else if (key.keyCode == Keymap.ArrowUp) {
            if (0 === this.indexVal) {
              this.fireAncestors('$goToTopPanel', 0)
            } else {
              this.indexVal = this.indexVal - 1
              return this.tag('SidePanel').items[this.indexVal]
            }

          }
        }
      },
    ]
  }
}
