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
import { Lightning, Utils, Language, Router } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG, GLOBALS } from '../../Config/Config'
import AppApi from '../../api/AppApi'
import FireBoltApi from '../../api/firebolt/FireBoltApi'

/**
 * Class for Video screen.
 */

export default class VideoScreen extends Lightning.Component {

  pageTransition() {
    return 'left'
  }

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings  Video'));
  }

  static _template() {
    return {
      rect: true,
      color: 0xCC000000,
      w: 1920,
      h: 1080,
      VideoScreenContents: {
        x: 200,
        y: 275,
        Resolution: {
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Resolution: '),
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
        HDR: {
          y: 90,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('High Dynamic Range: '),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
        },
        MatchContent: {
          alpha: 0.3, // disabled
          y: 180,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Match Content: '),
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
        OutputFormat: {
          alpha: 0.3, // disabled
          y: 270,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Output Format:'),
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
        Chroma: {
          alpha: 0.3, // disabled
          y: 360,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Chroma:'),
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
        HDCP: {
          y: 450,
          h: 90,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('HDCP Status: '),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
        },
      },
    }
  }

  _init() {
    this._appApi = new AppApi()
    this._setState('Resolution')
  }

  _focus() {
    if ("ResidentApp" !== GLOBALS.selfClientName)
    {
      FireBoltApi.get().deviceinfo.getscreenresolution().then(resolution =>{
        this.tag("Resolution.Title").text.text = Language.translate('Resolution: ') + `${JSON.stringify(resolution[0])} , ${JSON.stringify(resolution[1])}`;
      })
      FireBoltApi.get().deviceinfo.gethdcp().then(res=>{
        let hdcp =""
        for (let key in res)
        {
          hdcp += `\t\t${key} : ${res[key]} `
          hdcp += ","
        }
        this.tag("HDCP.Title").text.text = `${Language.translate('HDCP Status: ')} ${hdcp.substring(0, hdcp.length -1)}`
      })
      FireBoltApi.get().deviceinfo.gethdr().then(res=>{
        let hdr =""
        for (let key in res)
        {
          hdr += `\t\t${key} : ${res[key]}`
          hdr += ","
        }
        this.tag("HDR.Title").text.text = `${Language.translate('High Dynamic Range: ')}${hdr.substring(0,hdr.length -1 )}`
      })
      
    }
    else{
      this._appApi.getResolution().then(resolution => {
        this.tag("Resolution.Title").text.text = Language.translate('Resolution: ') + resolution;
      }).catch(err => {
        console.log("Error fetching the Resolution")
      })
    this._appApi.getHDCPStatus().then(result => {
      if (result.isHDCPCompliant && result.isHDCPEnabled) {
        this.tag("HDCP.Title").text.text = `${Language.translate('HDCP Status: ')}Enabled, Version: ${result.currentHDCPVersion}`;
      } else {
        this.tag("HDCP.Title").text.text = `${Language.translate('HDCP Status: ')}Not Supported `;
      }

    })

    this._appApi.getHDRSetting().then(result => {
      const availableHDROptions = {
        "HdrOff": "Off",
        "Hdr10": "HDR 10",
        "Hdr10Plus": "HDR 10+",
        "HdrHlg": "HLG",
        "HdrDolbyvision": "Dolby Vision",
        "HdrTechnicolor": "Technicolor HDR"
      }
      this.tag("HDR.Title").text.text = Language.translate('High Dynamic Range: ') + availableHDROptions[result];
    })
  }
    this._setState(this.state)
  }

  _handleBack() {
    if(!Router.isNavigating()){
    Router.navigate('settings')
    }
  }

  static _states() {
    return [
      class Resolution extends this{
        $enter() {
          this.tag('Resolution')._focus()
        }
        $exit() {
          this.tag('Resolution')._unfocus()
        }
        _handleDown() {
          this._setState('HDR')
        }
        _handleEnter() {
          if(!Router.isNavigating()){
          Router.navigate('settings/video/resolution')
          }
        }

      },
      class HDR extends this{
        $enter() {
          this.tag('HDR')._focus()
        }
        $exit() {
          this.tag('HDR')._unfocus()
        }
        _handleUp() {
          this._setState('Resolution')
        }
        _handleDown() {
          this._setState('HDCP')
        }
      },
      class MatchContent extends this{
        $enter() {
          this.tag('MatchContent')._focus()
        }
        $exit() {
          this.tag('MatchContent')._unfocus()
        }
        _handleUp() {
          this._setState('HDR')
        }
        _handleDown() {
          this._setState('OutputFormat')
        }
        _handleEnter() {
          //
        }
      },
      class OutputFormat extends this{
        $enter() {
          this.tag('OutputFormat')._focus()
        }
        $exit() {
          this.tag('OutputFormat')._unfocus()
        }
        _handleUp() {
          this._setState('MatchContent')
        }
        _handleDown() {
          this._setState('Chroma')
        }
        _handleEnter() {
          //
        }
      },
      class Chroma extends this{
        $enter() {
          this.tag('Chroma')._focus()
        }
        $exit() {
          this.tag('Chroma')._unfocus()
        }
        _handleUp() {
          this._setState('OutputFormat')
        }
        _handleDown() {
          // this._setState('HDCP') 
        }
        _handleEnter() {
          //
        }
      },
      class HDCP extends this{ // class not required
        $enter() {
          this.tag('HDCP')._focus()
        }
        $exit() {
          this.tag('HDCP')._unfocus()
        }
        _handleUp() {
          this._setState('HDR')
        }
        _handleEnter() {
          //
        }
      },
    ]

  }
}
