/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2025 RDK Management
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
import { Language, Lightning, Router, Registry} from "@lightningjs/sdk";
import { CONFIG } from '../Config/Config'
import Miracast from "../api/Miracast";

var devicename = ''
var devicemac = ''
var miracast = new Miracast()

export default class MiracastNotification extends Lightning.Component {
    
    notify(args) {
        if (!args || !args.mac || !args.name) {
            console.warn("Invalid arguments passed to notify");
            return;
        }
        devicename = args.name;
        devicemac = args.mac;
        this.tag('MiracastNotification.Message.Name').text.text = Language.translate(`NAME: ${devicename}`) ;
        this.tag('MiracastNotification.Message.Mac').text.text= Language.translate(`MAC: ${devicemac}`);
    }

    set params(args){
        console.log(args)
        this.notify(args)

    }
    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
          alpha:0,
            w: 1920,
            h: 2000,
            rect: true,
            color: 0xff000000,
            MiracastNotification: {
                x: 960,
                y: 300,
                Title: {
                    mountX: 0.5,
                    text: {
                        text: 'Screen Cast Request From ',
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Message: {
                    x: 0,
                    y: 125,
                    Name: {
                      mountX: 0.5,
                      text :{
                        text: `NAME: ${devicename}`,
                        fontFace: CONFIG.language.font,
                        fontSize: 25
                      },
                    },
                    Mac: {
                      mountX: 0.5,
                      y:30,
                      text:{
                        text: `MAC: ${devicemac}`,
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                      },
                      
                    },
                },
                RectangleDefault: {
                  x: 0, y: 230, w: 200, mountX: 0.5, h: 50, rect: true,color: 0x000000,
                  Timer: {
                      x: 100,
                      y: 25,
                      mount: 0.5,
                      text: {
                          text: "",
                          fontFace: CONFIG.language.font,
                          fontSize: 25,
                      },
                  },
                  visible:true
                },
                BorderBottom: {
                    x: 0, y: 330, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Accept: {
                    x: 0, y: 430, w: 300, mountX: 1, h: 60, rect: true, color: 0xffffffff,
                    Title: {
                      x: 150,
                      y: 30,
                      mount: 0.5,
                      text: {
                        text: 'Accept',
                        fontFace: CONFIG.language.font,
                        fontSize: 22,
                        textColor: 0xff000000,
                        fontStyle: 'bold'
                      },
                    },
                    visible: true
                },
                Deny: {
                    x: 250, y: 430, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xffffffff,
                    Title: {
                      x: 150,
                      y: 30,
                      mount: 0.5,
                      text: {
                        text: 'Deny',
                        fontFace: CONFIG.language.font,
                        fontSize: 22,
                        textColor: 0xff000000,
                        fontStyle: 'bold'
                      },
                    },
                    visible: true
                },
                
            },

        };
    }
    _active(){
      this.tag('Timer').text.text =""
      this.timeout=30
      this.initTimer()
      console.info('MiracastNotification initialized');
      this._setState("Accept");
    }
    _inactive() {
      if (this.timeInterval) {
          Registry.clearInterval(this.timeInterval)
      }
    }
  
    initTimer() {
      this.timeInterval = Registry.setInterval(() => {
          if (this.timeout > 0) { --this.timeout }
          else {
            miracast.acceptClientConnection("Reject").then(res=>{
              if(res.success){Router.focusPage()} 
             })
          }
          this.tag('Timer').text.text = this.timeout >= 10 ? `0:${this.timeout}` : `0:0${this.timeout}`
      }, 1000)
  }
    _focus() {
      this.alpha=1
        console.log('MiracastNotification focused');
    }
    _unfocus() {
        this.alpha = 0
        this.tag('MiracastNotification.Message.Name').text.text = `NAME: Default Name`
        this.tag('MiracastNotification.Message.Mac').text.text = `MAC: Default MAC`
    }
    _handleBack() {
        Router.focusPage()
    }
    
    static _states() {
        return [
          class Accept extends this {
            $enter() {
                this.tag("Accept").patch({
                    color: CONFIG.theme.hex,
                  });
                  this.tag("Accept.Title").patch({
                    text: {
                      textColor: 0xffffffff,
                    },
                  });
            }
            $exit() {
                this.tag("Accept").patch({
                    color: 0xffffffff,
                });
                this.tag("Accept.Title").patch({
                    text: {
                    textColor: 0xff000000,
                    },
                });
            }
            _handleRight() {
                this._setState('Deny')
            }
            _handleLeft(){

            }
            _handleDown(){

            }
            _handleUp(){
              
            }
            _handleEnter() {
              miracast.acceptClientConnection("Accept").then(res=>{
                if(res.success){Router.focusPage()}

              })
            
            }
            },
            class Deny extends this {
                $enter() {
                    this.tag("Deny").patch({
                        color: CONFIG.theme.hex,
                      });
                      this.tag("Deny.Title").patch({
                        text: {
                          textColor: 0xffffffff,
                        },
                      });

                }
                $exit() {
                    this.tag("Deny").patch({
                        color: 0xffffffff,
                      });
                      this.tag("Deny.Title").patch({
                        text: {
                          textColor: 0xff000000,
                        },
                      });
                }
              _handleLeft() {
                  this._setState('Accept')
                }
              _handleRight(){

              }
              _handleDown(){

              }
              _handleUp(){

              }
              _handleEnter() {
                miracast.acceptClientConnection("Reject").then(res=>{
                  if(res.success){Router.focusPage()} 
                })
              }
              },
        ]
    }}