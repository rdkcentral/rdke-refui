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

import { Lightning, Utils, Language, Router, Storage } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG, GLOBALS } from '../../Config/Config'
import AppApi from '../../api/AppApi.js';

/**
 * Class for Audio screen.
 */

export default class AudioScreen extends Lightning.Component {

  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  pageTransition() {
    return 'left'
  }

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings  Audio'));
  }

  static _template() {
    return {
      rect: true,
      color: 0xCC000000,
      w: 1920,
      h: 1080,
      Wrapper: {
        x: 200,
        y: 275,
        AudioOutput: {
          alpha: 0.3,
          y: 0,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Audio Output: ') + " HDMI",
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 45,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Arrow.png'),
          },
        },
        OutputMode: {
          y: 90,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Output Mode: '),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            },
          },
          Button: {
            h: 45,
            w: 45,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Arrow.png'),
          },
        },
        DynamicRange: {
          alpha: 0.3,
          y: 180,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Full Dynamic Range'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 45,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Arrow.png'),
          },
        },

        AudioLanguage: {
          y: 270,
          alpha: 0.3,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Audio Language: ') + "Auto",
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 45,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Arrow.png'),
          },
        },

        NavigationFeedback: {
          y: 360,
          alpha: 0.3,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Navigation Feedback'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 66,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/ToggleOnWhite.png'),
          },
        },

        Bluetooth: {
          alpha: 0.3,
          y: 450,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Bluetooth: ') + "None",
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 45,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Arrow.png'),
          },
        },
      },
    }
  }

  _init() {
    this.appApi = new AppApi();
    this._setState('OutputMode')
  }

  _focus() {
    this._setState(this.state)
    this.appApi.getSoundMode()
      .then(result => {
        this.tag('OutputMode.Title').text.text = Language.translate('Output Mode: ') + result.soundMode
      })
  }

  hide() {
    this.tag('Wrapper').visible = false
  }
  show() {
    this.tag('Wrapper').visible = true
  }

  _handleBack() {
    if(!Router.isNavigating()){
    Router.navigate('settings')
    }
  }

  static _states() {
    return [
      class AudioOutput extends this{
        $enter() {
          this.tag('AudioOutput')._focus()
        }
        $exit() {
          this.tag('AudioOutput')._unfocus()
        }
        _handleDown() {
          this._setState('OutputMode')
        }
        _handleEnter() {
          if(!Router.isNavigating()){
          Router.navigate('settings/audio/output')
          }
        }

      },
      class OutputMode extends this{
        $enter() {
          this.tag('OutputMode')._focus()
        }
        $exit() {
          this.tag('OutputMode')._unfocus()
        }
        _handleUp() {
          // this._setState('AudioOutput')
        }
        _handleDown() {
          // this._setState('DynamicRange');
        }
        _handleEnter() {
          if(!Router.isNavigating()){
          Router.navigate('settings/audio/output')
          }
        }
      },
      class DynamicRange extends this{
        $enter() {
          this.tag('DynamicRange')._focus()
        }
        $exit() {
          this.tag('DynamicRange')._unfocus()
        }
        _handleUp() {
          this._setState('OutputMode')
        }
        _handleDown() {
          this._setState('Bluetooth');
        }
        _handleEnter() {
          /**
           * This handle Enter has api calls -
           * 1 - get DRC Mode which doesnot return a drc mode and the success value is mostly false
           * 2- set Volume - able to set the value to 100
           * 3- get Volume - able to get the volume successfully as well
           * 4-
           *
           */
          //console.log(`Enter input was given to dynamic range ... `);
          // gets the drc mode
          this.appApi.getDRCMode().then(res => {
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          })

          this.appApi.setVolumeLevel(((GLOBALS.deviceType=="IpTv")?"SPEAKER0":"HDMI0"), 100).then(res => {
            this.appApi.getVolumeLevel().catch(err => {
              this.ERR("Error: " + JSON.stringify(err))
            })
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          });

          this.appApi.getConnectedAudioPorts().then(res => {
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          })
          // gets the enabled Audio Port
          this.appApi.getEnableAudioPort(((GLOBALS.deviceType=="IpTv")?"SPEAKER0":"HDMI0")).then(res => {
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          })

          this.appApi.getSupportedAudioPorts().catch(err => {
            this.ERR("Error while getting the supported Audio ports ie. " + JSON.stringify(err));
          });

          // set enable Audio POrt
          this.appApi.setEnableAudioPort(((GLOBALS.deviceType=="IpTv")?"SPEAKER0":"HDMI0")).then(res => {

            this.appApi.getEnableAudioPort(((GLOBALS.deviceType=="IpTv")?"SPEAKER0":"HDMI0")).then(res => {

            }).catch(err => {
              this.ERR("Error: " + JSON.stringify(err))
            })
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          });

          // set zoom setting ,possible values : FULL, NONE, Letterbox 16x9, Letterbox 14x9, CCO, PanScan, Letterbox 2.21 on 4x3, Letterbox 2.21 on 16x9, Platform, Zoom 16x9, Pillarbox 4x3, Widescreen 4x3
          this.appApi.setZoomSetting("FULL").then(res => {
            this.appApi.getZoomSetting().then(res => {
            }).catch(err => {
              this.ERR("Error: " + JSON.stringify(err))
            })
          }).catch(err => {
            this.ERR("Error: " + JSON.stringify(err))
          })
        }
      },
      class NavigationFeedback extends this{
        $enter() {
          this.tag('NavigationFeedback')._focus()
        }
        $exit() {
          this.tag('NavigationFeedback')._unfocus()
        }
        _handleUp() {
          this._setState('DynamicRange')
        }
        _handleDown() {
          this._setState('Bluetooth');
        }
        _handleEnter() {
          //
        }
      },
      class Bluetooth extends this{
        $enter() {
          this.tag('Bluetooth')._focus()
        }
        $exit() {
          this.tag('Bluetooth')._unfocus()
        }
        _handleUp() {
          this._setState('DynamicRange')
        }
      },
    ]

  }
}
