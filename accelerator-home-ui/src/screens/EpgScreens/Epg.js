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

import { Lightning, Utils, Router, Language } from '@lightningjs/sdk'
import ChannelItem from './ChannelItem'
import DTVApi from '../../api/DTVApi'
import Shows from './Shows'
import Cell from './Cell'
import CellCursor from './CellCursor'
import { CONFIG } from "../../Config/Config"
import AppApi from '../../api/AppApi'
import HomeApi from '../../api/HomeApi'

let k = 5
const homeApi = new HomeApi()
const dtvApi = new DTVApi()

export default class Epg extends Lightning.Component {

  static _template() {
    return {
      Background: {
        color: 0xff000000,
        w: 1920,
        h: 1080,
        rect: true,
      },
      Loader: {
        x: 960,
        y: 540,
        mount: 0.5,
        w: 100,
        h: 100,
        src: Utils.asset("images/settings/Loading.png"),
        visible: true,
      },
      Wrapper: {
        x: 200,
        y: 150,
        w: 1920,
        h: 1080,
        visible: false,


        DayLabel: {
          x: 0,
          y: 281,
          w: 236,
          h: 81,
          mountY: 0.5,
          text: {
            text: Language.translate('Today'),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...',
            wordWrapWidth: 236,
          },
        },

        ShowName: {
          x: 0,
          y: 195,
          w: 236,
          h: 81,
          mountY: 0.5,
          text: {
            text: Language.translate('SHOW'),
            fontFace: CONFIG.language.font,
            fontStyle: 'bold',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...',
            wordWrapWidth: 236,
          },
        },

        ShowTimings: {
          x: 236 * 5 + 59,
          y: 195,
          w: 236,
          h: 81,
          mountY: 0.5,
          text: {
            text: Language.translate('SHOW-TIMINGS'),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 1,
            maxLinexSuffix: '...',
            wordWrapWidth: 236,
          },
        },

        ChannelName: {
          x: 236 * 5 + 59,
          y: 225,
          w: 236,
          h: 81,
          mountY: 0.5,
          text: {
            text: Language.translate('CHANNEL-NAME'),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 2,
            maxLinexSuffix: '...',
            wordWrapWidth: 236 * 5,
          },
        },

        ShowDetails: {
          x: 0,
          y: 225,
          w: 236 * 5,
          h: 81,
          mountY: 0.5,
          text: {
            text: Language.translate('SHOW-DETAILS'),
            fontFace: CONFIG.language.font,
            fontStyle: 'normal',
            fontSize: 21,
            textColor: 0xffffffff,
            maxLines: 2,
            maxLinexSuffix: '...',
            wordWrapWidth: 236 * 5,
          },
        },

        Channels: {
          x: 0,
          y: 81 + 200,
          w: 236,
        },

        TopBar: {
          y: 200,
          x: 236,
          TimeNotifiers: {
            x: -4,
            w: 236 * 6 + 2,
            h: 81,
            clipping: true,
            TimeBar: {
              // this is the gray bar
              x: k,
              y: 81 - 12, // this should be the ShowLists "y" value - 9, extra -3 to accomodate margin
              rect: true,
              h: 9,
              w: 0,
              color: 0xff404040,
            },

            DownTriangle: {
              // this is the little triangle over the white bar.
              x: 4,
              y: 81 - 12, // this should be the same as TimeBar's "y" Value, extra -3 to accomodate margin
              mountX: 0.5,
              mountY: 0.5,
              color: 0xffffffff,
              text: { text: `${String.fromCodePoint(9662)}`, fontSize: 25, textColor: 0xffffffff },
            },
          },
          TimeLabels: {
            clipping: true,
            zIndex: 2,
            w: 236 * 6,
            h: 81,
            x: k,
            y: 0,
          },

          Wrapper: {
            w: 236 * 6,
            h: 81 * 9,
            clipping: true,
            Shows: {
              y: 81,
              // x: 236,
              type: Shows,
            },
            CellCursor: {
              y: 81,
              type: CellCursor,
            },
          },
        },
      }
    }
  }

  setChannels(channels) {
    let c = channels.map((c, i) => {
      return {
        y: 81 * i,
        w: 236,
        type: ChannelItem,
        title: c.shortname,
      }
    })
    this.tag('Channels').children = c
    this.channelGridInstance = this.tag('Channels').children
  }



  _firstEnable() {
    this.appApi = new AppApi();
  }


  _handleBack() {
    if (!Router.isNavigating()) {
      Router.navigate("menu")
    }
  }

  getEventURI(events){
    let showName = this.gridInstance[this.currentCellIndex].txt
     let eventUri = null
     for(let i = 0; i < events.length; i++) {
      if(events[i].name === showName) {
        eventUri = events[i].iptvuri
      }
     }
     return eventUri
  }

  async _handleEnter() {
   let channel = this.getCurrentChannel();
   let events = await dtvApi.getEvents(channel.dvburi)
   let eventUri = null
   if(events!=undefined){
    eventUri=this.getEventURI(events);
   }
   if (channel.dvburi === "OTT") {
      let params = {
        launchLocation: "epgScreen",
        url: channel.url
      }
      const appIdentifiers = {
        "YouTube": "n:5",
        "YouTube": "n:4",
        "YouTube": "n:3",
        "Netflix": "n:1",
        "Amazon": "n:2",
      } //callsign to identifier mapping
      const appIdentifier = appIdentifiers[channel.callsign]
      if(appIdentifier){
        params.appIdentifier = appIdentifier
      }
      this.appApi.launchApp(channel.callsign,params)
    } else if(channel.dvburi.startsWith("C_") && eventUri != null){
      if (!Router.isNavigating()) {
        let playerParams = {
          url: eventUri, //video url for playing
          isChannel: true,
          channelName: channel.channelName,
          showName: this.gridInstance[this.currentCellIndex].insText,
          showDescription: this.gridInstance[this.currentCellIndex].description,
          channelIndex: this.D - 8 + this.currentlyFocusedRow
        }
        Router.navigate("player",playerParams)
      }
    } else {
      if (!Router.isNavigating()) {
        this.DTV.launchChannel(channel.dvburi).then(res => {
          console.log("launchChannel method successful: ", JSON.stringify(res));
          this.widgets.channeloverlay.$focusChannel(this.D - 8 + this.currentlyFocusedRow);
          Router.navigate("dtvplayer");
        }).catch(err => {
          console.log("launchChannel method failed: ", JSON.stringify(err));
        })
      } else {
        console.error("Router is still navigating.")
      }
    }
  }

  getCurrentChannel() {
    let currentChannel = this.activeChannels[this.currentlyFocusedRow];
    return currentChannel
  }



  setShows4Channels(channels, headStart = 0) {
    this.strtindexesofrows = []
    let ltp = this.ltp
    let rtp = new Date(this.ltp.getTime() + 3 * 60 * 60 * 1000)


    let cells = []
    let self = this
    function filterShowsBasedOnTimeWindow(shows, index) {
      let inc = headStart < 0 ? -1 : 1
      let i = Math.abs(headStart)
      while (i >= 0) {
        // binary search can optimize this loop.

        shows[i].endtime = shows[i].duration + shows[i].starttime
        if (i >= shows.length) {
          console.warn("Reached the end of data , can't traverse shows any further!")
          break
        } else if (new Date(shows[i].starttime) <= ltp && new Date(shows[i].endtime) > ltp) {
          break
        } else if (new Date(shows[i].starttime) > ltp) {
          console.warn("there's chance that an empty space appear in one of the rows")
          break
        } else if (i === shows.length - 1) {
          console.warn(
            'traversed all of the shows and none of them are airing at this time for this channel'
          )
          return
        }
        i += inc
      }
      let x = 0
      self.strtindexesofrows.push(cells.length)
      for (; i < shows.length; i++) {
        if (new Date(shows[i].starttime) >= rtp) {
          break
        }
        let width = (shows[i].duration / (1000 * 60) / 30) * 236
        shows[i].endtime = shows[i].duration + shows[i].starttime
        // the below code trim the left most and right most cells
        if (new Date(shows[i].starttime) < ltp) {
          width -= ((ltp - new Date(shows[i].starttime)) / (1000 * 60) / 30) * 236
        }
        if (new Date(shows[i].endtime) > rtp) {
          width -= ((new Date(shows[i].endtime) - rtp) / (1000 * 60) / 30) * 236
        }
        //------------ Trimming ends here-----------------
        if(shows[i].shortdescription === "")
        {
        cells.push({
          x: x,
          y: index * 81,
          w: width,
          type: Cell,
          txt: shows[i].name,
          description: shows[i].shortdescription,
          width: width,
          starttime: shows[i].starttime,
          showIndex: i,
          duration: shows[i].duration,
          endtime: shows[i].endtime,
        })
      }
      else{
        cells.push({
          x: x,
          y: index * 81,
          w: width,
          type: Cell,
          txt: shows[i].name,
          description: shows[i].description,
          width: width,
          starttime: shows[i].starttime,
          showIndex: i,
          duration: shows[i].duration,
          endtime: shows[i].endtime,
        })
      }
        let hx = shows[i].duration + shows[i].starttime
        x += width
      }
      // the below code actually sets the shows
      if (index === channels.length - 1) {
        let shows = self.tag('Shows')
        shows.children = cells
        self.strtindexesofrows.push(cells.length) // this is added just for calculation.
        self.gridInstance = shows.children
        // self.updateCursor()
        self._setState('CellSelector')
      }
    }

    channels.map((channel, i) => {
      filterShowsBasedOnTimeWindow(channel.shows, i)
    })
  }

  setTimeLabelsBetween() {
    let startTime = this.ltp
    let endTime = new Date(this.ltp.getTime() + 3 * 60 * 60 * 1000)
    let arr = []
    let p = this.tag('TimeLabels')
    for (let t = startTime, i = 0; t <= endTime; t = new Date(t.getTime() + 30 * 60 * 1000), i++) {
      // the increment can probably be improvised
      let H = t.getHours()
      let M = t.getMinutes()
      M = M.toString().length < 2 ? '0' + M : M
      arr.push({
        x: i * 236,
        y: 35,
        mountY: 0,
        text: {
          text: H >= 12 ? (H === 12 ? `${H}:${M}PM` : `${H - 12}:${M}PM`) : `${H}:${M}AM`,
          fontFace: CONFIG.language.font,
          fontStyle: 'normal',
          fontSize: 21,
          textColor: 0xffffffff,
          maxLines: 1,
          maxLinexSuffix: '...',
        },
      })
      p.children = arr
    }
  }

  initialize() {
    this.ltp = new Date()
    let currentDateTime = this.ltp
    let temp = currentDateTime.getMinutes()
    let closest30MinRoundOff
    //the below round off system only works if the duration of the show is a multiple of 30.
    currentDateTime.setMilliseconds(0)
    currentDateTime.setSeconds(0)
    if (temp >= 30) {
      currentDateTime.setMinutes(30)
      closest30MinRoundOff = currentDateTime
    } else {
      currentDateTime.setMinutes(0)
      closest30MinRoundOff = currentDateTime
    }
    this.ltp = closest30MinRoundOff
    this.closest30MinRoundOff = closest30MinRoundOff.getTime()
    this.setTimeLabelsBetween()

    let tBar = this.tag('TimeBar')
    let dTriangle = this.tag('DownTriangle')
    let self = this
    this.interval = setInterval(() => {
      let now = new Date()
      if (now.getHours() === 0) {
        // this.fireAncestors(`$updateToday`)
      }
      let t = ((now - self.ltp >= 0 ? now - self.ltp : 0) / (1000 * 60 * 30)) * 236
      tBar.w = t
      dTriangle.x = t + k
    }, 0)
  }

  setBoldText() {
    let l = this.strtindexesofrows[this.currentlyFocusedRow]
    let r = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
    this.channelGridInstance[this.currentlyFocusedRow].setBoldText()
    for (let i = l; i <= r; i++) {
      this.gridInstance[i].setBoldText()
    }
  }

  unsetBoldText() {
    let l = this.strtindexesofrows[this.currentlyFocusedRow]
    let r = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
    this.channelGridInstance[this.currentlyFocusedRow].unsetBoldText()

    for (let i = l; i <= r; i++) {
      this.gridInstance[i].unsetBoldText()
    }
  }

  scrollVertically(n) {
    if (n < 0) {
      this.D--
    } else {
      this.D++
    }
    console.log(`setting vertical scroll from ${this.D - 8} to ${this.D} based the value ${n}`)
    this.activeChannels = this.channels.slice(this.D - 8, this.D)
    this.setChannels(this.activeChannels)
    this.setShows4Channels(this.activeChannels)
  }

  onDataProvidedX() {
    console.log(`on Data Provided`)
    this.initialize()
    this.scrollVertically()
    this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime
    this.setBoldText()
    this.paintCell()
    this.updateCursor()
    this.verticallyNonScrollableWindow = Math.min(this.channels.length - 1, 7)
  }

  paintCell() {
    this.gridInstance[this.currentCellIndex].color = CONFIG.theme.hex
  }

  unpaintCell() {
    this.gridInstance[this.currentCellIndex].color = 0xffffffff
  }


  _focus() {

    this.D = 7
    this.DTV = this.DTV ? this.DTV : new DTVApi();
    let wrapper = this.tag("Wrapper")
    let loader = this.tag("Loader")

    wrapper.visible = false;
    loader.visible = true;

    this.loadingAnimation.start();
    let self = this;
    function f(page) {
      let d = new Date()
      d.setHours(0)
      d.setMinutes(0)
      d.setSeconds(0)
      d.setMilliseconds(0)
      d = d.getTime()
      let e = d + 7 * 24 * 60 * 60 * 1000
      function filler(shows) {
        let diff = 0
        let currentShowETime = d
        diff = shows[0].starttime - d

        if (diff > 0) {
          shows.unshift({
            name: '',
            starttime: d,
            duration: diff,
            eventid: 0,
            shortdescription: '',
          })
        }

        let memLeakAlert = shows.length - 1
        for (let i = 0; i < shows.length - 1; i++) {
          currentShowETime = shows[i].starttime + shows[i].duration
          diff = shows[i + 1].starttime - currentShowETime
          if (diff > 0) {
            if (memLeakAlert < 0) {
              console.warn('Memory leak alert; aborting black cell insert')
            }
            shows.splice(i + 1, 0, {
              name: '',
              starttime: currentShowETime,
              duration: diff,
              eventid: 0,
              shortdescription: '',
            })
            memLeakAlert--
          }
        }

        currentShowETime = shows[shows.length - 1].starttime + shows[shows.length - 1].duration
        diff = e - currentShowETime
        if (e > 0) {
          shows.push({
            name: '',
            starttime: currentShowETime,
            duration: diff,
            eventid: 0,
            shortdescription: '',
          })
        }
      }

      return new Promise((resolve, reject) => {
        self.DTV.serviceList()
          .then(async channels => {
            await homeApi.checkChannelComapatability(channels).then(res => {
              channels = res
             })
            let traversedChannels = 0;
            channels.map((channel, i) => {

              if (channel.dvburi === "OTT") {
                traversedChannels++;
                channels[i].shows = [
                  {
                    name: Language.translate("click to launch") + ` ${channel.shortname}`,
                    starttime: 0,
                    duration: e,
                    eventid: 0,
                    shortdescription: '',
                  },
                ]

                if (channels.length - 1 === traversedChannels) {
                  console.log(`premium apps exclusive resolve`);
                  page.channels = channels
                  resolve(true)
                }
                return 0;
              }

              self.DTV.scheduleEvents(channel.dvburi)
                .then(shows => {
                  traversedChannels++;
                  // for premium apps and empty cell
                  if (!shows || shows.length === 0) {
                    channels[i].shows = [
                      {
                        name: '',
                        starttime: d,
                        duration: e,
                        eventid: 0,
                        shortdescription: '',
                      },
                    ]
                  } else {
                    channels[i].shows = shows
                    filler(channels[i].shows)
                  }
                  if (channels.length === traversedChannels) {
                    page.channels = channels
                    resolve(true)
                  }
                })
                .catch(err => {
                  // console.error(err)
                  // return "Home"
                  console.error('error', err)
                  reject(err)
                })
            })
          })
          .catch(err => {
            reject(err)
          })
      })
    }

    f(this).then(res => {
      self.loadingAnimation.stop();
      self.onDataProvidedX();
      loader.visible = false;
      wrapper.visible = true;
    }).catch(err => {
      console.log(`error while fetching data from dtv`, err)
      Router.navigate('menu')
    })

  }

  _init() {
    this.D = 7
    this.currentCellIndex = 0
    this.currentlyFocusedRow = 0
    this.strtindexesofrows = []
    this.cursorInstance = this.tag('CellCursor')
    this.loadingAnimation = this.tag("Loader").animation({
      duration: 3,
      repeat: -1,
      stopMethod: "immediate",
      actions: [{ p: "rotation", v: { sm: 0, 0: 0, 1: 2 * Math.PI } }],
    });
  }

  _unfocus() {
    //resetting all variables
    this.D = 7
    this.currentCellIndex = 0
    this.currentlyFocusedRow = 0
    this.strtindexesofrows = []
  }


  scrollHorizontally(n) {
    if (n < 0) {
      let prevShow = this.channels[this.D - (8 - this.currentlyFocusedRow)].shows[
        this.gridInstance[this.currentCellIndex].showIndex - 1
      ]
      // this.ltp = new Date(Math.max(prevShow.starttime, this.closest30MinRoundOff))
      this.ltp = new Date(Math.max(prevShow.starttime))

      this.setShows4Channels(this.activeChannels)
      this.currentCellIndex = this.strtindexesofrows[this.currentlyFocusedRow]
      this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime
      this.updateCursor()
    } else {
      let nextShow = this.channels[this.D - (8 - this.currentlyFocusedRow)].shows[
        this.gridInstance[this.currentCellIndex].showIndex + 1
      ]
      if (nextShow.duration > 3 * 60 * 60 * 1000) {
        this.ltp = new Date(nextShow.starttime)
      } else {
        let l = nextShow.starttime + nextShow.duration - 3 * 60 * 60 * 1000
        this.ltp = new Date(l)
      }
      this.setShows4Channels(this.activeChannels)
      this.currentCellIndex = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
      this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime
      this.updateCursor()
    }
    this.setTimeLabelsBetween()
    this.setBoldText()
  }

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Guide'))
  }
  pageTransition() {
    return 'up'
  }
  _handleLeft() {
    Router.focusWidget('Menu')
  }

  _handleUp() {
    this.widgets.menu.notify('TopPanel')
  }


  static _states() {
    return [
      class CellSelector extends this {
        $enter() { }

        _handleLeft() {
          this.unpaintCell()
          if (this.currentCellIndex > this.strtindexesofrows[this.currentlyFocusedRow]) {
            this.currentCellIndex--
            this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime
            this.updateCursor()
          } else if (this.gridInstance[this.currentCellIndex].showIndex > 0) {
            this.scrollHorizontally(-1)
          } else {
            console.log("can't traverse any left")
            Router.focusWidget('Menu')
          }
          this.paintCell()
        }

        _handleRight() {
          this.unpaintCell()
          this.channels[this.D - (8 - this.currentlyFocusedRow)].shortname
          if (this.currentCellIndex < this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1) {
            this.currentCellIndex++
            this.cellTimeTracker = this.gridInstance[this.currentCellIndex].starttime
            this.updateCursor()
          } else if (
            this.gridInstance[this.currentCellIndex].showIndex <
            this.channels[this.D - (8 - this.currentlyFocusedRow)].shows.length - 1
          ) {
            //current Cell index has to be updated at last
            this.scrollHorizontally(1)
          } else console.log("can't go further right")
          this.paintCell()
        }

        binarySearch(t, left, right) {
          const lim = left
          t = new Date(t)
          let mid
          while (left <= right) {
            mid = left + Math.floor((right - left) / 2)
            const sTime = new Date(this.gridInstance[mid].starttime)
            const eTime = new Date(this.gridInstance[mid].endtime)
            if (t >= sTime && t < eTime) return mid
            else if (sTime > t) right = mid - 1
            else left = mid + 1
          }
          mid = Math.max(lim, left - 1)
          return mid
        }

        _handleDown() {
          this.unpaintCell()
          this.unsetBoldText()
          if (this.currentlyFocusedRow < this.verticallyNonScrollableWindow) {
            let t = this.cellTimeTracker
            this.currentlyFocusedRow++
            let left = this.strtindexesofrows[this.currentlyFocusedRow]
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
            let idx = this.binarySearch(t, left, right)
            this.currentCellIndex = idx
            this.updateCursor()

          } else if (this.D < this.channels.length) {
            let t = this.cellTimeTracker
            this.scrollVertically(1)
            //---------------------------------
            let left = this.strtindexesofrows[this.currentlyFocusedRow]
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
            let idx = this.binarySearch(t, left, right)
            //---------------------------------
            this.currentCellIndex = idx
            this.updateCursor()
          } else console.log("can't go any further ,it's the last row")
          this.setBoldText()
          this.paintCell()
        }

        _handleUp() {
          this.unpaintCell()
          this.unsetBoldText()
          if (this.currentlyFocusedRow > 0) {
            let t = this.cellTimeTracker
            this.currentlyFocusedRow--
            let left = this.strtindexesofrows[this.currentlyFocusedRow]
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
            let idx = this.binarySearch(t, left, right)
            this.currentCellIndex = idx
            this.updateCursor()
          } else if (this.D > 8) {
            let t = this.cellTimeTracker
            this.scrollVertically(-1)
            //---------------------------------
            let left = this.strtindexesofrows[this.currentlyFocusedRow]
            let right = this.strtindexesofrows[this.currentlyFocusedRow + 1] - 1
            let idx = this.binarySearch(t, left, right)
            //---------------------------------
            this.currentCellIndex = idx
            this.updateCursor()
          } else console.log("can't go any further , it's the first row")
          this.setBoldText()
          this.paintCell()
        }
        async updateDayLabel(starttime) {
          let daylabel = this.tag('DayLabel')
          let dTriangle = this.tag('DownTriangle')
          let channel = this.getCurrentChannel();
          let eventUri = null
          if(channel.dvburi.startsWith("C_")){
          let events = await dtvApi.getEvents(channel.dvburi)
           eventUri=this.getEventURI(events);
          }

          setTimeout(function () {
            let today = new Date()
            today.setHours(0)
            today.setMinutes(0)
            today.setSeconds(0)
            today.setMilliseconds(0)
            let t = today.getTime()
            let day = 24 * 60 * 60 * 1000
            if(starttime==0){
              daylabel.text.text = Language.translate('TODAY')
             }else if(starttime>t){
              t = starttime - t
              if (t < day) {
                daylabel.text.text = Language.translate('TODAY')
              } else{
                let cellStartTime = new Date(starttime)
                daylabel.text.text = cellStartTime.getDate() +'-' + (cellStartTime.getMonth() + 1) + '-' +cellStartTime.getFullYear()
              }
             }else{
              t = t-starttime
              if (t < day) {
                daylabel.text.text = Language.translate('TODAY')
              } else {
                if(dTriangle.__active&&eventUri===null){
                  daylabel.text.text = Language.translate('TODAY')
                } else{
                let cellStartTime = new Date(starttime)
                daylabel.text.text = cellStartTime.getDate() +'-' + (cellStartTime.getMonth() + 1) + '-' +cellStartTime.getFullYear()
              }
            }
             }
          }, 0)
        }

        updateInfoLabels() {
          let currentCell = this.gridInstance[this.currentCellIndex]
          this.tag('ChannelName').text.text = this.channelGridInstance[
            this.currentlyFocusedRow
          ].title.text
          this.tag('ShowName').text.text = currentCell.txt
          this.tag('ShowDetails').text.text = currentCell.description
          let s = new Date(currentCell.starttime)
          let e = new Date(currentCell.endtime)
          let ehours = e.getHours()
          let eminutes = e.getMinutes()
          if (eminutes.toString().length < 2) eminutes = '0' + eminutes
          if (ehours >= 12) {
            eminutes = eminutes + 'p'
            if (ehours > 12) {
              ehours -= 12
            }
          }
          let shours = s.getHours()
          let sminutes = s.getMinutes()
          if (sminutes.toString().length < 2) {
            sminutes = '0' + sminutes
          }
          if (shours > 12) {
            shours -= 12
          }
          this.tag('ShowTimings').text.text = `${shours}:${sminutes} - ${ehours}:${eminutes}`
          this.updateDayLabel(currentCell.starttime)
        }

        updateCursor() {
          let x = this.gridInstance[this.currentCellIndex].x
          let y = this.gridInstance[this.currentCellIndex].y
          let w = this.gridInstance[this.currentCellIndex].w
          let self = this
          setTimeout(function () {
            self.updateInfoLabels()
          }, 0)
          this.cursorInstance.patchCursor(x, y, w)
        }

        $exit() {
          console.log('exiting from state - CellSelector')
        }
      },
    ]
  }
}
