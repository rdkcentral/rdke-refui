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
import { Lightning, Utils, Router, Language, Registry } from '@lightningjs/sdk'
import AppApi from '../api/AppApi'
import { CONFIG, GLOBALS } from '../Config/Config'
import Keymap from '../Config/Keymap'
import FireBoltApi from '../api/firebolt/FireBoltApi'


/** Class for top panel in home UI */
export default class TopPanel extends Lightning.Component {
  static _template() {
    return {
      TopPanel: {
        color: 0xff000000,
        rect: true,
        w: 1920,
        h: 270,
        Mic: {
          x: 105,
          // zIndex: 2,
          y: 87,
          src: Utils.asset('/images/topPanel/microphone.png'),
          w: 50,
          h: 50,
        },
        Logo: {
          x: 200,
          y: 90,
          src: Utils.asset('/images/' + CONFIG.theme.logo),
          w: 227,
          h: 43
        },
        Page: {
          x: 200,
          y: 184,
          // mountY: 0.5,
          text: {
            fontSize: 40,
            text: Language.translate('home'),
            textColor: CONFIG.theme.hex,
            fontStyle: 'bolder',
            fontFace: CONFIG.language.font,
            wordWrapWidth: 1720,
            maxLines: 1,
          }
        },
        Settings: {
          x: 1825 - 105 - 160 - 37 + 30,
          y: 111,
          mountY: 0.5,
          src: Utils.asset('/images/topPanel/setting.png'),
          w: 37,
          h: 37,
        },
        Time: {
          x: 1920 - 105 - 160,
          y: 111,
          mountY: 0.5,
          text: { text: '', fontSize: 35, fontFace: CONFIG.language.font, },
          w: 160,
          h: 60,
        },
      },
    }
  }

  changeTimeZone(time) {
    this.zone = time
  }

  updateZone(res) {
    this.zone = res
  }


  _construct() {
    this.indexVal = 1;
    this.audiointerval = null;
    this.zone = null // declaring this variable to keep track of zone changes
    this.appApi = new AppApi()

    if ("ResidentApp" === GLOBALS.selfClientName) {
      this.appApi.getZone().then((res) => {
        this.updateZone(res)
      })
    }else {
      FireBoltApi.get().localization.getTimeZone().then(timezone=>{
        this.updateZone(timezone)
      })
    }

    this.zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  set index(index) {
    this.indexVal = index
  }

  _focus() {
    this._setState('Setting')
    this.tag('Settings').color = CONFIG.theme.hex
  }

  set changeText(text) {
    this.tag('Page').text.text = text
    if (text === 'Home') {
      this.tag('Settings').color = 0xffffffff
    }
  }

  /**
*
* @param {boolean} toggle
* Function to change the mic icon.
*/
  set changeMic(toggle) {
    if (toggle) {
      this.tag('Mic').src = Utils.asset('/images/topPanel/microphone_mute.png')
    }
    else {
      this.tag('Mic').src = Utils.asset('/images/topPanel/microphone.png')
    }
  }


  _build() {
    Registry.setInterval(() => {
      let _date = this._updateTime(this.zone)
      if (this.zone) {
        this.tag('Time').patch({ text: { text: _date.strTime } })
      }
    }, 1000)
  }

  updateIcon(tagname, url) {
    this.tag(tagname).patch({
      src: Utils.asset(url),
    })
  }

  /**
   * Function to update time in home UI.
   */
  _updateTime(zone) {
    if (zone != null) {
      let date = new Date()
      date = new Date(date.toLocaleString('en-US', { timeZone: zone }))
      // get day
      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let strDay = days[date.getDay()];

      // get month
      let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let strMonth = month[date.getMonth()]
      let strDate = date.toLocaleDateString('en-US', { day: '2-digit' }) + ' ' + strMonth + ' ' + date.getFullYear()
      let hours = date.getHours()
      let minutes = date.getMinutes()
      let ampm = hours >= 12 ? 'pm' : 'am'
      hours = hours % 12
      hours = hours ? hours : 12
      minutes = minutes < 10 ? '0' + minutes : minutes
      let strTime = hours + ':' + minutes + ' ' + ampm
      return { strTime, strDay, strDate }
    } else {
      return ""
    }
  }

  static _states() {
    return [
      class Mic extends this{
        $enter() {
          this.tag('Mic').color = CONFIG.theme.hex
        }
        _getFocused() {
          this.tag('Mic').color = CONFIG.theme.hex
        }
        $exit() {
          this.tag('Mic').color = 0xffffffff
        }

        _handleKey(key) {
          if (key.keyCode == Keymap.ArrowRight) {
            this._setState('Setting')
          } else if (key.keyCode == Keymap.ArrowDown) {
            this.tag('Mic').color = 0xffffffff
            this.fireAncestors('$goToSidePanel', 0)
          }
        }
      },
      class Setting extends this{
        $enter() {
          this.tag('Settings').color = CONFIG.theme.hex
        }
        _handleKey(key) {
          if (key.keyCode === Keymap.ArrowDown) {
            Router.focusPage()
            this.tag('Settings').color = 0xffffffff
          } else if (key.keyCode === Keymap.ArrowLeft) {
            // this._setState('Mic')
          } else if (key.keyCode === Keymap.Enter) {
            //this.tag('Page').text.text = Language.translate('settings')
            Router.navigate('settings')
            Router.focusPage()
            this.tag('Settings').color = 0xffffffff
          }
        }
        $exit() {
          this.tag('Settings').color = 0xffffffff
        }
      },
    ]
  }
}
