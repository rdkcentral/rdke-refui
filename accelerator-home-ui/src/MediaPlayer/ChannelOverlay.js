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
import { Lightning, Registry, Router } from '@lightningjs/sdk'
import AppApi from '../api/AppApi';
import DTVApi from '../api/DTVApi'
import ChannelItem from './ChannelItem'
import HomeApi from '../api/HomeApi';

export default class ChannelOverlay extends Lightning.Component {
  /**
   * Function to create components for the player controls.
   */
  static _template() {
    return {
      Wrapper: {
        x: -235,
        y: 90,
        clipping: true,
        w: 232,
        h: 900,
        Channels: {
          y: 5,
          w: 232,
          h: 891,
          type: Lightning.components.ListComponent,
          // clipping:true,
          itemSize: 81,
          roll: true,
          horizontal: false,
          invertDirection: true,
          itemScrollOffset: -10,
        }
      }
    }
  }

  _init() {
    this.activeChannelIdx = 0; //this must be initialised in init
  }
  _firstEnable() {
    this.homeApi = new HomeApi();
    this.dtvApi = new DTVApi();
    this.appApi = new AppApi();
    this.options = [];
    this.overlayTimeout = null;
    this.timeoutDuration = 10000;
    this.dtvApi.serviceList().then(async channels => {
      await this.homeApi.checkChannelComapatability(channels).then(res => {
        channels = res
      })

      this.options = channels;
      this.tag('Channels').items = this.options.map((item, index) => {
        return {
          type: ChannelItem,
          index: index,
          item: item,
          ref: "Channel" + index,
        }
      })
    }).catch(err => {
      console.log("Failed to fetch channels: ", JSON.stringify(err))
    })
    this._overlayAnimation = this.tag("Wrapper").animation({
      delay: 0.3,
      duration: 0.3,
      stopMethod: "reverse", //so that .stop will play the transition towards left
      actions: [{ p: "x", v: { 0: -235, 1: 0 } }],
    });
  }
  _focus() {
    this.overlayTimeout = Registry.setTimeout(() => {
      this._handleBack();
    }, this.timeoutDuration)
    this.$focusChannel(this.activeChannelIdx)
    this._overlayAnimation.start();
  }

  _unfocus() {
    this.overlayTimeout && Registry.clearTimeout(this.overlayTimeout);
    this._overlayAnimation.stop();
  }

  resetTimeout() {
    this.overlayTimeout && Registry.clearTimeout(this.overlayTimeout);
    this.overlayTimeout = Registry.setTimeout(() => {
      this._handleBack();
    }, this.timeoutDuration)
  }

  $focusChannel(index) {
    this.activeChannelIdx = index
    this.tag('Channels').setIndex(this.activeChannelIdx)
  }
  _getFocused() {
    return this.tag('Channels').element // add logic to focus on current channel

  }

  _handleDown() {
    this.resetTimeout()
    this.tag('Channels').setNext()
  }

  _handleUp() {
    this.resetTimeout()
    this.tag('Channels').setPrevious()
  }

  _handleBack() {
    if (Router.getActiveHash() === "player") { //for normal video player channel overlay is not a widget
      return false; //handleback of parent class will be executed
    }
    Router.focusPage();
  }

  _handleLeft() {
    if (Router.getActiveHash() === "player") { //for normal video player channel overlay is not a widget
      return false; //handleback of parent class will be executed
    }
    Router.focusPage();
  }

  _handleRight() {
    if (Router.getActiveHash() === "player") { //for normal video player channel overlay is not a widget
      return false; //handleback of parent class will be executed
    }
    Router.focusPage();
  }

  _handleEnter() {
    this.resetTimeout()
    let focusedChannelIdx = this.tag("Channels").index;
    let channel = this.options[focusedChannelIdx];
    if (channel.dvburi === "OTT") {
      let params = {
        launchLocation: "epgScreen",
        url: channel.url
      }
      this.appApi.launchApp(channel.callsign, params).then(() => {
        this.dtvApi.exitChannel()
      }).catch(() => {
        this.dtvApi.exitChannel() //to exit previous channel regardless the app launch succeeds or fails
      })
    } else if (channel.dvburi.startsWith("C_")) {
      if (!Router.isNavigating()) {
        let playerParams = {
          url: channel.iptvuri, //video url for playing
          isChannel: true,
          channelName: channel.channelName,
          showName: "sample show name",
          showDescription: "sample description",
          channelIndex: focusedChannelIdx
        }
        if (Router.getActiveHash() === "player") {
          this.activeChannelIdx = focusedChannelIdx;
          this.fireAncestors("$changeChannel", channel.iptvuri, playerParams.showName, playerParams.channelName)
        } else {
          Router.navigate("player", playerParams);
        }
      }
    } else {
      if (focusedChannelIdx !== this.activeChannelIdx) {
        this.dtvApi.exitChannel().then(res => {
          console.log("Current channel exit successful, launching new channel: ", JSON.stringify(res));
          this.dtvApi
            .launchChannel(this.options[focusedChannelIdx].dvburi)
            .then((res) => {
              console.log("Change Channel successfull: ", JSON.stringify(res));
              this.activeChannelIdx = focusedChannelIdx;
            })
            .catch((err) => {
              console.log("Failed to launch new channel", JSON.stringify(err));
            });
        }).catch(err => {
          console.log("Failed to exit current playing channel: ", JSON.stringify(err));
        })
      }
    }
  }
}
