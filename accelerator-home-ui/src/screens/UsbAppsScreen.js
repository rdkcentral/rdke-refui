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
import { Language, Lightning, Router } from "@lightningjs/sdk"
import UsbApi from '../api/UsbApi'
import { CONFIG } from '../Config/Config.js'
import { imageListInfo } from '../../static/data/ImageListInfo'
import { musicListInfo } from '../../static/data/MusicListInfo'
import { videoListInfo } from '../../static/data/VideoListInfo'
import { UsbInnerFolderListInfo } from "../../static/data/UsbInnerFolderListInfo"
import UsbListItem from '../items/UsbListItem.js'
import LightningPlayerControls from "../MediaPlayer/LightningPlayerControl"

var usbApi = new UsbApi();

export default class UsbAppsScreen extends Lightning.Component {

  _onChanged() {
    this.widgets.menu.updateTopPanelText('USB')
  }

  static _template() {
    return {
      UsbAppsScreenContents: {
        rect: true,
        color: 0xff000000,
        x: 200,
        y: 270,
        w: 1765,
        h: 1250,
        clipping: true,
        Wrapper: {
          x: 0,
          w: 1765,
          h: 1250,
          clipping: true,
          Text1: {
            y: 0,
            h: 30,
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 25,
              text: Language.translate("Videos"),
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF,
            },
            zIndex: 0
          },
          Row1: {
            y: 30,
            x: -20,
            flex: { direction: 'row', paddingLeft: 20, wrap: false },
            type: Lightning.components.ListComponent,
            w: 1745,
            h: 300,
            itemSize: 277,
            roll: true,
            rollMax: 1745,
            horizontal: true,
            itemScrollOffset: -4,
            clipping: false,
          },



          Text2: {
            // x: 10 + 25,
            y: 243,
            h: 30,
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 25,
              text: Language.translate("Audio"),
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF,
            },
            zIndex: 0
          },
          Row2: {
            y: 273,
            x: -20,
            flex: { direction: 'row', paddingLeft: 20, wrap: false },
            type: Lightning.components.ListComponent,
            w: 1745,
            h: 300,
            itemSize: 171,
            roll: true,
            rollMax: 1745,
            horizontal: true,
            itemScrollOffset: -4,
            clipping: false,
          },
          Text3: {
            // x: 10 + 25,
            y: 486,
            h: 30,
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 25,
              text: Language.translate("Photos"),
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF,
            },
            zIndex: 0
          },
          Row3: {
            y: 516,
            x: -20,
            flex: { direction: 'row', paddingLeft: 20, wrap: false },
            type: Lightning.components.ListComponent,
            w: 1745,
            h: 400,
            itemSize: 165,
            roll: true,
            rollMax: 1745,
            horizontal: true,
            itemScrollOffset: -4,
            clipping: false,
          },

          Text4: {
            // x: 10 + 25,
            y: 729,
            h: 30,
            text: {
              fontFace: CONFIG.language.font,
              fontSize: 25,
              text: Language.translate("Folders"),
              fontStyle: 'normal',
              textColor: 0xFFFFFFFF,
            },
            zIndex: 0
          },
          Row4: {
            y: 759,
            x: -20,
            flex: { direction: 'row', paddingLeft: 20, wrap: false },
            type: Lightning.components.ListComponent,
            w: 1745,
            h: 400,
            itemSize: 165,
            roll: true,
            rollMax: 1745,
            horizontal: true,
            itemScrollOffset: -4,
            clipping: false,
          },

        },
        NoUSB: {
          x: 0,
          w: 1765,
          h: 800,
          clipping: true,
          visible: false,
          Image: {
            x: 800,
            y: 400,
            mount: 0.5,
            texture: {
              type: Lightning.textures.ImageTexture,
              src: 'static/images/usb/Unsupported_file_640x360.jpg',
              resizeMode: { type: 'contain', w: 640, h: 360 },
            },
          },
        }
      },
      AudioInfo: {
        zIndex: 2,
        visible: false,
        h: 1080,
        w: 1920,
        // x: -200,
        // y: -286,
        Image: {
          scale: 0.5,
          x: 960,
          y: 560,
          mount: 0.5,
          texture: {
            type: Lightning.textures.ImageTexture,
            src: 'static/images/Media Player/Audio_Background_16k.jpg'
          }
        },
        Title: {
          x: 960,
          y: 900,
          mount: 0.5,
          text: {
            fontFace: CONFIG.language.font,
            text: 'file_name.mp3',
            fontSize: 35,
          },
        }
      },
      PlayerControls: {
        type: LightningPlayerControls,
        y: 810,
        alpha: 0,
        signals: {
          pause: 'pause',
          play: 'play',
          hide: 'hidePlayerControls',
          fastfwd: 'fastfwd',
          fastrwd: 'fastrwd',
        },
        zIndex: 4
      },
    }
  }

  _handleBack() {
    if (!(this.cwd.length === 0)) {
      let clone = [...this.cwd]
      clone.pop();
      let cwdname = clone.join("/");
      usbApi.cd(cwdname).then(() => {
        this.cwd.pop();
        this.loadData();
      }).catch(err => {
        console.error(`error while getting the usb contents; error = ${JSON.stringify(err)}`);
      });
    } else {
      Router.navigate('menu');
    }
  }

  reset() {
    for (let i = this.tag('Row1').index; i > 0; i--) {
      this.tag('Row1').setPrevious()
    }
    for (let i = this.tag('Row2').index; i > 0; i--) {
      this.tag('Row2').setPrevious()
    }
    for (let i = this.tag("Row3").index; i > 0; i--) {
      this.tag('Row3').setPrevious()
    }
    for (let i = this.tag("Row3").index; i > 0; i--) {
      this.tag('Row4').setPrevious()
    }
  }

  hide() {
    this.tag('UsbAppsScreenContents').visible = false
    this.fireAncestors('$hideAllforVideo')
  }
  show() {
    this.tag('UsbAppsScreenContents').visible = true
    this.fireAncestors('$showAllforVideo')
  }

  traverseMinus() {
    this.index = (this.traversableRows.length + (--this.index)) % this.traversableRows.length;
    this._setState(this.traversableRows[this.index])
  }
  traversePlus() {
    this.index = ++this.index % this.traversableRows.length;
    this._setState(this.traversableRows[this.index])
  }


  static _states() {
    return [
      class Video extends this {
        $enter() {
          this.scroll(0);
        }
        _getFocused() {
          this.tag('Text1').text.fontStyle = 'bold'
          if (this.tag('Row1').length) {
            return this.tag('Row1').element
          }
        }
        _handleDown() {
          this.traversePlus()
        }
        _handleUp() {
          this.traverseMinus()
        }
        _handleRight() {
          if (this.tag('Row1').length - 1 != this.tag('Row1').index) {
            this.tag('Row1').setNext()
            return this.tag('Row1').element
          }
        }
        _handleEnter() {
          Router.navigate('usb/player', {
            url: this.tag('Row1').element.data.uri,
            currentIndex: this.tag('Row1').element.idx,
            list: this.tag('Row1').items,
            isUSB: true
          })
        }
        _handleLeft() {
          this.tag('Text1').text.fontStyle = 'normal'
          if (0 != this.tag('Row1').index) {
            this.tag('Row1').setPrevious()
            return this.tag('Row1').element
          } else {
            this.reset()
          }
        }
      },
      class Audio extends this {
        $enter() {
          this.scroll(0);
        }
        _getFocused() {
          this.tag('Text2').text.fontStyle = 'bold'
          if (this.tag('Row2').length) {
            return this.tag('Row2').element
          }
        }
        _handleDown() {
          this.traversePlus()
        }
        _handleUp() {
          this.traverseMinus()
        }
        _handleEnter() {
          Router.navigate('usb/player', {
            url: this.tag('Row2').element.data.uri,
            isAudio: true,
            list: this.tag('Row2').items,
            currentIndex: this.tag('Row2').element.idx,
            isUSB: true
          })
        }
        _handleRight() {
          if (this.tag('Row2').length - 1 != this.tag('Row2').index) {
            this.tag('Row2').setNext()
            return this.tag('Row2').element
          }
        }
        _handleLeft() {
          this.tag('Text2').text.fontStyle = 'normal'
          if (0 != this.tag('Row2').index) {
            this.tag('Row2').setPrevious()
            return this.tag('Row2').element
          } else {
            this.reset()
          }
        }
      },
      class Picture extends this {
        $enter() {
          this.scroll(0);
        }
        _getFocused() {
          this.tag('Text3').text.fontStyle = 'bold'
          if (this.tag('Row3').length) {
            return this.tag('Row3').element
          }
        }
        _handleDown() {
          this.traversePlus()
        }
        _handleUp() {
          this.traverseMinus()
        }
        _handleEnter() {
          // console.log(this.tag('Row3').items)
          Router.navigate('usb/image', {
            src: this.tag('Row3').element.data.uri,
            currentIndex: this.tag('Row3').element.idx,
            list: this.tag('Row3').items,
            cwd: this.cwd
          })
        }

        _handleRight() {
          if (this.tag('Row3').length - 1 != this.tag('Row3').index) {
            this.tag('Row3').setNext()
            return this.tag('Row3').element
          }
        }
        _handleLeft() {
          this.tag('Text3').text.fontStyle = 'normal'
          if (0 != this.tag('Row3').index) {
            this.tag('Row3').setPrevious()
            return this.tag('Row3').element
          } else {
            this.reset()
          }
        }

      },

      class Folder extends this {
        $enter() {
          if (this.traversableRows.length > 3) {
            this.scroll(-243);
          }
        }
        _getFocused() {
          this.tag('Text4').text.fontStyle = 'bold'
          if (this.tag('Row4').length) {
            return this.tag('Row4').element
          }
        }
        _handleDown() {
          this.traversePlus()
        }
        _handleUp() {
          this.traverseMinus()
        }
        _handleEnter() {
          //do something after folder click.
          let dname = this.cwd.join("/") + "/" + this.tag('Row4').element.data.displayName;
          usbApi.cd(dname).then(() => {

            this.cwd.push(this.tag('Row4').element.data.displayName);
            // console.log(`loading the data from the directory ${this.cwd}

            // and its data = music:${JSON.stringify(musicListInfo)}

            // Pictures : ${JSON.stringify(imageListInfo)}

            // videos : ${JSON.stringify(videoListInfo)}

            // folders : ${JSON.stringify(UsbInnerFolderListInfo)}

            // `);
            this.loadData();
          }).catch(err => {
            console.error(`error while getting the usb contents; error = ${JSON.stringify(err)}`);
          });

        }

        _handleRight() {
          if (this.tag('Row4').length - 1 != this.tag('Row4').index) {
            this.tag('Row4').setNext()
            return this.tag('Row4').element
          }
        }
        _handleLeft() {
          this.tag('Text4').text.fontStyle = 'normal'
          if (0 != this.tag('Row4').index) {
            this.tag('Row4').setPrevious()
            return this.tag('Row4').element
          } else {
            this.reset()
          }
        }
      },
    ]
  }

  set params(args) {
    this.currentIndex = args.currentIndex
    this.thisDir = args.cwd
  }

  set Row1Items(items) {
    this.tag('Row1').items = items.map((info, idx) => {
      return {
        w: 257,
        h: 145,
        type: UsbListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx
      }
    })
    this.tag('Row1').start()
  }

  set Row2Items(items) {
    this.tag('Row2').items = items.map((info, idx) => {
      return {
        w: 151,
        h: 151,
        type: UsbListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx
      }
    })
    this.tag('Row2').start()
  }

  set Row3Items(items) {
    this.tag('Row3').items = items.map((info, idx) => {
      return {
        w: 145,
        h: 145,
        type: UsbListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx
      }
    })
    this.tag('Row3').start()
  }

  set Row4Items(items) {
    this.tag('Row4').items = items.map((info, idx) => {
      return {
        w: 145,
        h: 145,
        type: UsbListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx
      }
    })
    this.tag('Row4').start()
  }


  scroll(y) { this.tag('Wrapper').setSmooth('y', y, { duration: 0.5 }) }



  loadData() {
    // console.log(`loading data from the directory ${this.cwd}`);
    let sumY = 0;
    this.index = 0;
    this.traversableRows = [];

    this.Row1Items = videoListInfo;
    this.Row2Items = musicListInfo;
    this.Row3Items = imageListInfo;
    this.Row4Items = UsbInnerFolderListInfo;
    let text1 = this.tag("Text1");
    let row1 = this.tag('Row1');
    let text2 = this.tag("Text2");
    let row2 = this.tag('Row2');
    let text3 = this.tag("Text3");
    let row3 = this.tag('Row3');
    let text4 = this.tag('Text4');
    let row4 = this.tag('Row4');

    if (videoListInfo.length === 0 && musicListInfo.length === 0 && imageListInfo.length === 0 && UsbInnerFolderListInfo.length === 0) {
      this.tag('NoUSB').visible = true;
      text1.visible = false;
      row1.visible = false;
      text2.visible = false;
      row2.visible = false;
      text3.visible = false;
      row3.visible = false;
      text4.visible = false;
      row4.visible = false;
      //either the usb is not mounted or there aren't any videos , images or audio files.
    } else {
      this.tag('NoUSB').visible = false;
      if (videoListInfo.length === 0) {
        text1.visible = false;
        row1.visible = false;
      } else {
        this.traversableRows.push("Video");
        text1.visible = true;
        row1.visible = true;
        text1.y = sumY;
        row1.y = sumY + 30;
        sumY += 243;
      }

      if (musicListInfo.length === 0) {
        text2.visible = false;
        row2.visible = false;
      } else {
        this.traversableRows.push("Audio");
        text2.visible = true;
        row2.visible = true;
        text2.y = sumY;
        row2.y = sumY + 30;
        sumY += 243;
      }

      if (imageListInfo.length === 0) {
        text3.visible = false;
        row3.visible = false;
      } else {
        this.traversableRows.push("Picture");
        text3.visible = true;
        row3.visible = true;
        text3.y = sumY;
        row3.y = sumY + 30;
        sumY += 243;
      }


      if (UsbInnerFolderListInfo.length === 0) {
        text4.visible = false;
        row4.visible = false;
      } else {
        this.traversableRows.push("Folder");
        text4.visible = true;
        row4.visible = true;
        text4.y = sumY;
        row4.y = sumY + 30;
        sumY += 243;
      }
      this._setState(this.traversableRows[0]);
    }

  }

  _focus() {
    if (this.thisDir) {
      if (this.thisDir.length > 0) {
        this.cwd = [...this.thisDir];
        let dname = this.cwd.join("/")
        usbApi.cd(dname).then(() => {
          this.loadData();
          this._setState(this.traversableRows[this.index] + `.${this.currentIndex}`)//focus on first element
        }).catch(err => {
          console.error(`error while getting the usb contents; error = ${JSON.stringify(err)}`);
        });
      }
    } else {
      this.index = 0;
      this.traversableRows = [];
      this.cwd = [];
      usbApi.retrieUsb().then(() => {
        this.loadData();
        this._setState(this.traversableRows[this.index])
      }).catch(err => {
        console.error(`error while getting the usb contents; error = ${JSON.stringify(err)}`);
      })
    }
    // this._setState(this.traversableRows[this.index])
  }

  _unfocus() {
    //this.exitFunctionality()
  }
}
