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
import { Language, Lightning, Router } from '@lightningjs/sdk'
import LanguageItem from '../../items/LanguageItem'
import { availableLanguages, availableLanguageCodes, CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi';
import RDKShellApis from '../../api/RDKShellApis';
import AlexaApi from '../../api/AlexaApi';
import thunderJS from 'ThunderJS';
import { GLOBALS } from '../../Config/Config'
import FireBoltApi from '../../api/firebolt/FireBoltApi';
import { Metrics } from '@firebolt-js/manage-sdk';

const appApi = new AppApi()
const thunder = thunderJS(CONFIG.thunderConfig)
const loader = 'Loader'

export default class LanguageScreen extends Lightning.Component {

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Language'));
  }

  pageTransition() {
    return 'left'
  }


  static _template() {
    return {
      rect: true,
      color: 0xCC000000,
      w: 1920,
      h: 1080,
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
    if ("ResidentApp" !== GLOBALS.selfClientName) {
      this.OnLanguageChangedfirebolt = FireBoltApi.get().localization.listen("languageChanged", value => {
        console.log('language changed successfully', value)
      })
    }
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

  _focus() {
    this._setState('Languages')
  }

  _handleBack() {
    if (!Router.isNavigating()) {
      Router.navigate('settings/other')
    }
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
          if (Language.get() !== availableLanguages[this._Languages.tag('List').index]) {
            let updatedLanguage = availableLanguageCodes[availableLanguages[this._Languages.tag('List').index]]
            if (AlexaApi.get().checkAlexaAuthStatus() === "AlexaHandleError") {
              AlexaApi.get().getAlexaDeviceSettings();
              thunder.on('org.rdk.VoiceControl', 'onServerMessage', notification => {
                if (notification.xr_speech_avs.deviceSettings.currentLocale.toString() != updatedLanguage) {
                  for (let i = 0; i < notification.xr_speech_avs.deviceSettings.supportedLocales.length; i++) {
                    if (updatedLanguage === notification.xr_speech_avs.deviceSettings.supportedLocales[i].toString()) {
                      AlexaApi.get().updateDeviceLanguageInAlexa(updatedLanguage)
                    }
                  }
                }
              })
            }
            if ("ResidentApp" === GLOBALS.selfClientName) {
              appApi.setUILanguage(updatedLanguage)
            } else {
              FireBoltApi.get().localization.setlanguage(availableLanguages[this._Languages.tag('List').index]).then(res => console.log("sucess language set ::::", res))
            }
            localStorage.setItem('Language',availableLanguages[this._Languages.tag('List').index])
            let path = location.pathname.split('index.html')[0]
            let url = path.slice(-1) === '/' ? "static/loaderApp/index.html" : "/static/loaderApp/index.html"
            let notification_url = location.origin + path + url
            appApi.launchResident(notification_url, loader).catch(err => {console.error("error while launching loader url in resident app", err) })
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
