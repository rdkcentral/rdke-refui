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

import { Lightning, Router, Language, Storage } from '@lightningjs/sdk'
import { CONFIG, GLOBALS } from '../../Config/Config'
import LanguageItem from '../../items/LanguageItem'
import { availableLanguages, availableLanguageCodes } from '../../Config/Config'
import AppApi from '../../api/AppApi'
import RDKShellApis from '../../api/RDKShellApis'
import FireBoltApi from '../../api/firebolt/FireBoltApi'

const appApi = new AppApi()
const loader = 'Loader'

export default class LanguageScreen extends Lightning.Component {
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
            x: 820, y: 250, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
            Title: {
              x: 150,
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

    appApi.deactivateResidentApp(loader)
    RDKShellApis.moveToFront(GLOBALS.selfClientName)
    RDKShellApis.setFocus(GLOBALS.selfClientName).then(result => {
      console.log('LanguageScreen: ResidentApp moveToFront Success');
    }).catch(err => {
      console.log('LanguageScreen: Error', err);
      Metrics.error(Metrics.ErrorType.OTHER, "AppLangugaeError", 'Thunder RDKShell setFocus Error' + JSON.stringify(err), false, null)
    });
  }


  pageTransition() {
    return 'left'
  }

  _focus() {
    this._setState('Languages')
  }

  _handleBack() {

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
            let updatedLanguage = availableLanguageCodes[availableLanguages[this._Languages.tag('List').index]]
            if ("ResidentApp" === GLOBALS.selfClientName) {
              appApi.setUILanguage(updatedLanguage)
            } else {
              FireBoltApi.get().localization.setlanguage(availableLanguages[this._Languages.tag('List').index]).then(res => console.log("sucess language set ::::",res))
            }
            localStorage.setItem('Language',availableLanguages[this._Languages.tag('List').index])
            let path = location.pathname.split('index.html')[0]
            let url = path.slice(-1) === '/' ? "static/loaderApp/index.html" : "/static/loaderApp/index.html"
            let notification_url = location.origin + path + url
            console.log(notification_url)
            appApi.launchResident(notification_url, loader).catch(err => { })
            RDKShellApis.setVisibility(GLOBALS.selfClientName, false)
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
