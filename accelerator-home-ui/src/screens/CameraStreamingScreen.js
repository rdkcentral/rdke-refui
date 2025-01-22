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
import { Lightning, Router, Utils, VideoPlayer, Language } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config';

export default class CameraStreamingScreen extends Lightning.Component {
    static _template() {
        return {
         Background: {
          w: 1920,
          h: 1080,
          shader: {
              x: 260,
              y: 390,
              w: 910,
              h: 520,
              type: Lightning.shaders.Hole,
          },
          visible: true
      },
          Riot: {
            x: 300,
            y: 300,
            mount: 0.5,
            text: {
                text: "RIoT",
                fontFace: CONFIG.language.font,
                fontSize: 32,
                textColor: 0xFFF9F9F9,
                fontStyle: 'normal',
                zIndex: 10,
            },
          },
          BorderTop: {
            x: 1470, y: 400, w: 550, h: 6, rect: true, mountX: 0.5,
          },

          Switch1: {
            Text: {
              x: 1260,
              y: 450,
              mount: 0.5,
              text: {
                  text: Language.translate("Switch 1"),
                  fontFace: CONFIG.language.font,
                  fontSize: 32,
                  textColor: 0xFFF9F9F9,
                  fontStyle: 'normal',
                  wordWrap: true,
                  wordWrapWidth: 800,
              },
            },
              Button: {
                h: 45,
                w: 67,
                x: 1750,
                mountX: 1,
                y: 450,
                mountY: 0.5,
                src: Utils.asset('images/settings/ToggleOffWhite.png'),
            },
            BorderBottom: {
              x: 1470, y: 500, w: 550, h: 6, rect: true, mountX: 0.5,
            },
          },
         Switch2: {
            Text: {
              x: 1260,
              y: 550,
              mount: 0.5,
              text: {
                  text: Language.translate("Switch 2"),
                  fontFace: CONFIG.language.font,
                  fontSize: 32,
                  textColor: 0xFFF9F9F9,
                  fontStyle: 'normal',
                  wordWrap: true,
                  wordWrapWidth: 800,
              },
            },
              Button: {
                h: 45,
                w: 67,
                x: 1750,
                mountX: 1,
                y: 550,
                mountY: 0.5,
                src: Utils.asset('images/settings/ToggleOffWhite.png'),
            },
            BorderBottom2: {
              x: 1470, y: 600, w: 550, h: 6, rect: true, mountX: 0.5,
            },
          },
         Switch3: {
            Text: {
              x: 1260,
              y: 650,
              mount: 0.5,
              text: {
                  text: Language.translate("Switch 3"),
                  fontFace: CONFIG.language.font,
                  fontSize: 32,
                  textColor: 0xFFF9F9F9,
                  fontStyle: 'normal',
                  wordWrap: true,
                  wordWrapWidth: 800,
              },
            },
              Button: {
                h: 45,
                w: 67,
                x: 1750,
                mountX: 1,
                y: 650,
                mountY: 0.5,
                src: Utils.asset('images/settings/ToggleOffWhite.png'),
            },
            BorderBottom3: {
              x: 1470, y: 700, w: 550, h: 6, rect: true, mountX: 0.5,
            },
          },
          Switch4: {
            Text: {
              x: 1260,
              y: 750,
              mount: 0.5,
              text: {
                  text: Language.translate("Switch 4"),
                  fontFace: CONFIG.language.font,
                  fontSize: 32,
                  textColor: 0xFFF9F9F9,
                  fontStyle: 'normal',
                  wordWrap: true,
                  wordWrapWidth: 800,
              },
            },
              Button: {
                h: 45,
                w: 67,
                x: 1750,
                mountX: 1,
                y: 750,
                mountY: 0.5,
                src: Utils.asset('images/settings/ToggleOffWhite.png'),
            },
            BorderBottom4: {
              x: 1470, y: 800, w: 550, h: 6, rect: true, mountX: 0.5,
            },
          },
      }
    }

    _init(){
      this._setState('Switch1')
    }

    set params(args){
      VideoPlayer.position(350, 270)
      VideoPlayer.size(890, 600);
      VideoPlayer.open(args.cameraUrl)
      VideoPlayer.consumer(this)
    }

    $videoPlayerEvent(eventName) {
      if (eventName === "Error" || eventName === "Abort") {
        VideoPlayer.reload()
      }
      else if(eventName === "Ended") {
        if (!Router.isNavigating()) {
          VideoPlayer.close()
          Router.navigate('camera/player/ExitScreen')
        }
      }
    }

    _handleBack(){
      VideoPlayer.close()
      Router.navigate('menu')
    }

    static _states() {
      return[
        class Switch1 extends this{
          $enter(){
            this.tag('BorderTop').color = CONFIG.theme.hex
            this.tag('BorderBottom').color = CONFIG.theme.hex
          }
          $exit(){
            this.tag('BorderTop').color = 0xFFF9F9F9
            this.tag('BorderBottom').color = 0xFFF9F9F9
          }
          _handleDown() {
            this._setState('Switch2')
          }
          _handleEnter() {
            if(this.tag("Switch1.Button").src == "static/images/settings/ToggleOnOrange.png") {
            this.tag("Switch1.Button").src = "static/images/settings/ToggleOffWhite.png"
            console.log("Switch1 Turned Off");
            } else {
              this.tag("Switch1.Button").src = "static/images/settings/ToggleOnOrange.png"
              console.log("Switch1 Turned On");
            }
          }
        },
        class Switch2 extends this{
          $enter(){
            this.tag('BorderBottom').color = CONFIG.theme.hex
            this.tag('BorderBottom2').color = CONFIG.theme.hex
          }
          $exit(){
            this.tag('BorderBottom').color = 0xFFF9F9F9
            this.tag('BorderBottom2').color = 0xFFF9F9F9
          }
          _handleDown() {
            this._setState('Switch3')
          }
          _handleUp() {
            this._setState('Switch1')
          }
          _handleEnter() {
            if(this.tag("Switch2.Button").src == "static/images/settings/ToggleOnOrange.png") {
              this.tag("Switch2.Button").src = "static/images/settings/ToggleOffWhite.png"
              console.log("Switch2 Turned Off");
              } else {
                this.tag("Switch2.Button").src = "static/images/settings/ToggleOnOrange.png"
                console.log("Switch2 Turned On");
              }
          }
        },
        class Switch3 extends this{
          $enter(){
            this.tag('BorderBottom2').color = CONFIG.theme.hex
            this.tag('BorderBottom3').color = CONFIG.theme.hex
          }
          $exit(){
            this.tag('BorderBottom2').color = 0xFFF9F9F9
            this.tag('BorderBottom3').color = 0xFFF9F9F9
          }
          _handleDown() {
            this._setState('Switch4')
          }
          _handleUp() {
            this._setState('Switch2')
          }
          _handleEnter() {
            if(this.tag("Switch3.Button").src == "static/images/settings/ToggleOnOrange.png") {
              this.tag("Switch3.Button").src = "static/images/settings/ToggleOffWhite.png"
              console.log("Switch3 Turned Off");
              } else {
                this.tag("Switch3.Button").src = "static/images/settings/ToggleOnOrange.png"
                console.log("Switch3 Turned On");
              }
          }
        },
        class Switch4 extends this{
          $enter(){
            this.tag('BorderBottom3').color = CONFIG.theme.hex
            this.tag('BorderBottom4').color = CONFIG.theme.hex
          }
          $exit(){
            this.tag('BorderBottom3').color = 0xFFF9F9F9
            this.tag('BorderBottom4').color = 0xFFF9F9F9
          }
          _handleUp() {
            this._setState('Switch3')
          }
          _handleEnter() {
            if(this.tag("Switch4.Button").src == "static/images/settings/ToggleOnOrange.png") {
              this.tag("Switch4.Button").src = "static/images/settings/ToggleOffWhite.png"
              console.log("Switch4 Turned Off");
              } else {
                this.tag("Switch4.Button").src = "static/images/settings/ToggleOnOrange.png"
                console.log("Switch4 Turned On");
              }
          }
        }
      ]
    }
}