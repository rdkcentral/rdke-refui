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
import { Language, Lightning } from '@lightningjs/sdk'
import LanguageItem from '../../items/LanguageItem'
import { availableLanguages, availableLanguageCodes } from '../../Config/Config'
import AppApi from '../../api/AppApi';
import RDKShellApis from '../../api/RDKShellApis';
import thunderJS from 'ThunderJS';
import { CONFIG, GLOBALS } from '../../Config/Config'
import { Metrics } from '@firebolt-js/sdk';
import FireBoltApi from '../../api/firebolt/FireBoltApi';

const appApi = new AppApi()
const thunder = thunderJS(CONFIG.thunderConfig)
const loader = 'Loader'

export default class LanguageScreen extends Lightning.Component {
  static _template() {
    return {
      LanguageScreenContents: {
        x: 200,
        y: 275,
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
      }
    }
  }

  _active() {
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
    RDKShellApis.destroy(loader).catch(err => {
      console.log("LanguageScreenOverlay: Error destroy loader: " + JSON.stringify(err))
    });
    RDKShellApis.setVisibility(GLOBALS.selfClientName, true);
    RDKShellApis.moveToFront(GLOBALS.selfClientName);
    RDKShellApis.setFocus(GLOBALS.selfClientName).then(() => {
      console.log('LanguageScreenOverlay: ResidentApp moveToFront Success');
    }).catch(err => {
      console.log('LanguageScreenOverlay: Error', err);
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Thunder RDKShell Failed to moveToFront " + JSON.stringify(err), false, null)
    });
  }

  _focus() {
    this._setState('Languages')
  }

  static _states() {
    return [
      class Languages extends this{
        $enter() {
        }
        _getFocused() {
          return this._Languages.tag('List').element
        }
        _handleDown() {
          this._navigate('down')
        }
        _handleUp() {
          this._navigate('up')
        }
        _handleEnter() {
          //need to verify
          if (Language.get() !== availableLanguages[this._Languages.tag('List').index]) {
            let updatedLanguage = availableLanguageCodes[availableLanguages[this._Languages.tag('List').index]]
            if ("ResidentApp" !== GLOBALS.selfClientName) {
              FireBoltApi.get().localization.setlanguage(availableLanguages[this._Languages.tag('List').index]).then(res => console.log(`language set successfully`))
            } else {
              appApi.setUILanguage(updatedLanguage)
            }
            localStorage.setItem('Language',availableLanguages[this._Languages.tag('List').index])
            let path = location.pathname.split('index.html')[0]
            let url = path.slice(-1) === '/' ? "static/loaderApp/index.html" : "/static/loaderApp/index.html"
            let notification_url = location.origin + path + url
            console.log(notification_url)
            appApi.launchResident(notification_url, loader).catch(err => {
              console.log("Error launchResident: " + JSON.stringify(err))
            })
            RDKShellApis.setVisibility(GLOBALS.selfClientName, false)
            location.reload();
          }
        }
      },
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
