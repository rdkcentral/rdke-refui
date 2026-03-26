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

import { Lightning, Router, Language } from '@lightningjs/sdk'
import { CONFIG } from '../../Config/Config'
import LanguageItem from '../../items/LanguageItem'
import { availableLanguages, availableLanguageCodes } from '../../Config/Config'
import AppApi from '../../api/AppApi'

const appApi = new AppApi()

export default class LanguageScreen extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  static _template() {
    return {
      w: 1920,
      h: 1080,
      rect: true,
      color: 0xff000000,
      Language: {
        x: 960,
        y: 270,
        Title: {
          x: 0,
          y: 0,
          mountX: 0.5,
          text: {
            text: Language.translate("Language"),
            fontFace: CONFIG.language.font,
            fontSize: 40,
            textColor: CONFIG.theme.hex,
          },
        },
        BorderTop: {
          x: 0, y: 75, w: 1600, h: 3, rect: true, mountX: 0.5,
        },
        Info: {
          x: 0,
          y: 125,
          mountX: 0.5,
          text: {
            text: Language.translate("Select a language"),
            fontFace: CONFIG.language.font,
            fontSize: 25,
          },
        },
        LanguageScreenContents: {
          x: 200 - 1000,
          y: 270,
          Languages: {
            flexItem: { margin: 0 },
            List: {
              type: Lightning.components.ListComponent,
              w: 1920 - 300,
              itemSize: 90,
              horizontal: false,
              invertDirection: true,
              roll: true,
              rollMax: 900,
              itemScrollOffset: -4,
            },
          },

          Continue: {
            x: 820, y: 250, w: 400, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
            Title: {
              x: 200,
              y: 30,
              mount: 0.5,
              text: {
                text: Language.translate("Continue Setup"),
                fontFace: CONFIG.language.font,
                fontSize: 22,
                textColor: 0xFF000000,
                fontStyle: 'bold'
              },
            },
            visible: true
          },
        }
      }
    }
  }

  _init() {
    this._Languages = this.tag('LanguageScreenContents.Languages')
    this._Languages.h = availableLanguages.length * 90
    this._Languages.tag('List').h = availableLanguages.length * 90
    this._Languages.tag('List').items = availableLanguages.map((item, index) => {
      return {
        ref: 'Lng' + index,
        w: 1620,
        h: 90,
        type: LanguageItem,
        item: item,
      }
    })

  }

  pageTransition() {
    return 'left'
  }

  _focus() {
    this._setState('Languages')
  }

  _handleBack() {

  }

  updateUILanguage(index) {
    appApi.setUILanguage(availableLanguageCodes[availableLanguages[index]])
    localStorage.setItem('Language',availableLanguages[index])
  }

  static _states() {
    return [
      class Languages extends this{
        $enter() {
        }
        _getFocused() {
          return this._Languages.tag('List').element
        }
        _handleUp() {
          this._navigate('up')
        }
        _handleDown() {
          if (this._Languages.tag('List').index < availableLanguages.length - 1) {
            this._navigate('down')
          }
          else {
            this._setState('Continue')
          }
        }
        _handleEnter() {
          //need to verify
          if (Language.get() !== availableLanguages[this._Languages.tag('List').index]) {
            const index = this._Languages.tag('List').index
            localStorage.setItem('LanguageSelectedIndex', index)
            this.updateUILanguage(index)
            location.reload();
          }
        }
      },
      class Continue extends this{
        $enter() {
          this._focus()
        }
        _focus() {
          this.tag('Continue').patch({
            color: CONFIG.theme.hex
          })
          this.tag('Continue.Title').patch({
            text: {
              textColor: 0xFFFFFFFF
            }
          })
        }
        _unfocus() {
          this.tag('Continue').patch({
            color: 0xFFFFFFFF
          })
          this.tag('Continue.Title').patch({
            text: {
              textColor: 0xFF000000
            }
          })
        }
        _handleUp() {
          this._setState('Languages');
        }

        _handleEnter() {
          const languageSelectedIndex = localStorage.getItem('LanguageSelectedIndex')
          this.updateUILanguage(languageSelectedIndex ? languageSelectedIndex : 0)
          Router.navigate('splash/network')
        }

        $exit() {
          this._unfocus()
        }
      }
    ]
  }

  _navigate(dir) {
    let list = this._Languages.tag('List')
    if (dir === 'down') {
      if (list.index < list.length - 1) list.setNext()
    } else if (dir === 'up') {
      if (list.index > 0) list.setPrevious()
    }
  }

}
