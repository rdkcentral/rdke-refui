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
import { Lightning, Router } from '@lightningjs/sdk'
import LightningPlayerControls from './LightningPlayerControl';
import { CONFIG } from '../Config/Config';
import ChannelOverlay from './ChannelOverlay';
import {Metrics} from'@firebolt-js/sdk'

let player = null
let position = null
/**
 * Class to render AAMP video player.
 */
export default class AAMPVideoPlayer extends Lightning.Component {
  /**
   * Function to render player controls.
   */


  set params(args) {
    this.currentIndex = args.currentIndex
    this.data = args.list
    if (args.isUSB) {
      this.isUSB = args.isUSB
    } else if (args.isChannel) {
      this.isChannel = args.isChannel
      this.channelName = args.channelName
      this.showName = args.showName
      this.showDescription = args.description
      this.channelIndex = args.channelIndex
    }
    let url = args.url ? args.url : 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8'
    if (args.isAudio) {
      this.tag('Image').alpha = 1
    }
    try {
      this.load({
        title: 'Parkour event',
        url: url,
        drmConfig: null,
      })
      this.setVideoRect(0, 0, 1920, 1080)
    } catch (error) {
      console.error('Playback Failed ' + error)
      Metrics.error(Metrics.ErrorType.MEDIA,"PlaybackError", "Playback Failed"+JSON.stringify(error), false, null)
    }
  }

  static _template() {
    return {
      Image: {
        alpha: 0,
        x: 960,
        y: 560,
        mount: 0.5,
        texture: {
          type: Lightning.textures.ImageTexture,
          src: 'static/images/Media Player/Audio_Background_16k.jpg',
          resizeMode: { type: 'contain', w: 1920, h: 1080 },
        }
      },
      InfoOverlay: {
        x: 90,
        y: 820,
        alpha: 0,
        zIndex: 3,
        ShowName: {
          text: {
            text: "Show Name",
            fontFace: CONFIG.language.font,
            fontSize: 48,
            fontStyle: 'bold',
            textColor: 0xffFFFFFF,
            wordWrap: true, wordWrapWidth: 1350, maxLines: 1,
          }
        },
        ChannelName: {
          y: 50,
          visible: false,
          text: {
            text: "Channel Name",
            fontFace: CONFIG.language.font,
            fontSize: 35,
            textColor: 0xffFFFFFF,
            wordWrap: true, wordWrapWidth: 1350, maxLines: 1,
          }
        }
      },
      PlayerControlsWrapper: {
        alpha: 0,
        h: 330,
        w: 1920,
        y: 750,
        rect: true,
        colorBottom: 0xFF000000,
        colorTop: 0x00000000,
        PlayerControls: {
          y: 70,
          type: LightningPlayerControls,
          signals: {
            pause: 'pause',
            play: 'play',
            hide: 'hidePlayerControls',
            fastfwd: 'fastfwd',
            fastrwd: 'fastrwd',
            nextTrack: 'nextTrack',
            prevTrack: 'prevTrack',
            seekFwd: 'seekFwd',
            seekRwd: 'seekRwd'
          },
        },
      },
      ChannelWrapper: {
        h: 1080,
        w: 350,
        x: -360,
        rect: true,
        colorLeft: 0xFF000000,
        colorRight: 0x00000000,
        ChannelOverlay: {
          type: ChannelOverlay,
          x: 50,
          y: 92,
        }
      }
    }
  }

  _init() {
    this.x = 0
    this.y = 0
    this.w = 0
    this.h = 0
    this.videoEl = document.createElement('video')
    this.videoEl.setAttribute('id', 'video-player')
    this.videoEl.style.position = 'absolute'
    this.videoEl.style.zIndex = '1'
    this.videoEl.setAttribute('width', '100%')
    this.videoEl.setAttribute('height', '100%')
    this.videoEl.setAttribute('type', 'video/ave')
    document.body.appendChild(this.videoEl)
    this.playbackSpeeds = [-16, -8, -4, -2, 1, 2, 4, 8, 16]
    this.playerStatesEnum = { idle: 0, initializing: 1, playing: 8, paused: 6, seeking: 7 }
    player = null
    this.playbackRateIndex = this.playbackSpeeds.indexOf(1)
    this.defaultInitConfig = {
      initialBitrate: 2500000,
      offset: 0,
      networkTimeout: 10,
      preferredAudioLanguage: 'en',
      liveOffset: 15,
      drmConfig: null,
    }
  }

  /**
   * Function to set video coordinates.
   * @param {int} x x position of video
   * @param {int} y y position of video
   * @param {int} w width of video
   * @param {int} h height of video
   */
  setVideoRect(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  /**
   * Event handler to store the current playback state.
   * @param  event playback state of the video.
   */
  _playbackStateChanged(event) {
    switch (event.state) {
      case player.playerStatesEnum.idle:
        this.playerState = player.playerStatesEnum.idle
        break
      case player.playerStatesEnum.initializing:
        this.playerState = player.playerStatesEnum.initializing
        break
      case player.playerStatesEnum.playing:
        this.playerState = player.playerStatesEnum.playing
        break
      case player.playerStatesEnum.paused:
        this.playerState = player.playerStatesEnum.paused
        break
      case player.playerStatesEnum.seeking:
        this.playerState = player.playerStatesEnum.seeking
        break
      default:
        break
    }
  }

  /**
   * Event handler to handle the event of completion of a video playback.
   */
  _mediaEndReached() {
    this.load(this.videoInfo)
    this.setVideoRect(this.x, this.y, this.w, this.h)
  }

  /**
   * Event handler to handle the event of changing the playback speed.
   */
  _mediaSpeedChanged() { }

  /**
   * Event handler to handle the event of bit rate change.
   */
  _bitrateChanged() { }

  /**
   * Function to handle the event of playback failure.
   */
  _mediaPlaybackFailed() {
    this.load(this.videoInfo)
  }

  /**
   * Function to handle the event of playback progress.
   * @param event playback event.
   */
  _mediaProgressUpdate(event) {
    position = event.positionMiliseconds / 1000
    this.tag('PlayerControls').currentTime = position
  }

  /**
   * Function to handle the event of starting the playback.
   */
  _mediaPlaybackStarted() {
    this.tag('PlayerControls').reset()
    this.showPlayerControls()
    if (this.isUSB) {
      this.tag("InfoOverlay").setSmooth('alpha', 1)
    }
  }

  /**
   * Function to handle the event of change in the duration of the playback content.
   */
  _mediaDurationChanged() { }

  /**
   * Function to create the video player instance for video playback and its initial settings.
   */
  createPlayer() {
    if (player !== null) {
      this.destroy()
      player = null
    }

    try {
      player = new AAMPMediaPlayer()
      player.addEventListener('playbackStateChanged', this._playbackStateChanged)
      player.addEventListener('playbackCompleted', this._mediaEndReached.bind(this))
      player.addEventListener('playbackSpeedChanged', this._mediaSpeedChanged)
      player.addEventListener('bitrateChanged', this._bitrateChanged)
      player.addEventListener('playbackFailed', this._mediaPlaybackFailed.bind(this))
      player.addEventListener('playbackProgressUpdate', this._mediaProgressUpdate.bind(this))
      player.addEventListener('playbackStarted', this._mediaPlaybackStarted.bind(this))
      player.addEventListener('durationChanged', this._mediaDurationChanged)
      this.playerState = this.playerStatesEnum.idle
    } catch (error) {
      console.error('AAMPMediaPlayer is not defined')
      Metrics.error(Metrics.ErrorType.MEDIA,"PlaybackError", "AAMPMediaPlayer is not defined" +JSON.stringify(error), false, null)
    }
  }

  /**
   * Loads the player with video URL.
   * @param videoInfo the url and the info regarding the video like title.
   */
  load(videoInfo) {
    this.createPlayer()
    this.videoInfo = videoInfo
    this.configObj = this.defaultInitConfig
    this.configObj.drmConfig = this.videoInfo.drmConfig
    player.initConfig(this.configObj)
    player.load(videoInfo.url)

    this.tag('PlayerControls').title = videoInfo.title
    this.tag('PlayerControls').duration = player.getDurationSec()
    console.log('Duration of video', player.getDurationSec())
    this.tag('PlayerControls').currentTime = 0
    this.play()
  }

  /**
   * Starts playback when enough data is buffered at play head.
   */
  play() {
    player.play()
    this.playbackRateIndex = this.playbackSpeeds.indexOf(1)
  }

  /**
   * Pauses playback.
   */
  pause() {
    player.pause()
  }

  /**
   * Stop playback and free resources.
   */
  stop() {
    player.stop()
    this.hidePlayerControls()
  }

  $changeChannel(url, showName, channelName) {
    this.stop()
    this.destroy()
    try {
      this.load({
        title: showName,
        url: url,
        drmConfig: null,
      })
      this.tag('ShowName').text.text = showName
      this.tag('ChannelName').text.text = channelName
      this.setVideoRect(0, 0, 1920, 1080)
    } catch (error) {
      console.error('Playback Failed ' + error)
      Metrics.error(Metrics.ErrorType.MEDIA,"PlaybackError", "Playback Failed "+JSON.stringify(error), false, null)
    }
  }

  seekFwd() {
    player.seek(position + 10)
  }

  seekRwd() {
    player.seek(position - 10)
  }

  voiceSeek(time) {
    player.seek(position + time)
  }

  nextTrack() {
    if (this.data[this.currentIndex + 1]) {
      this.currentIndex += 1
      this.stop()
      this.destroy()
      try {
        this.load({
          title: 'Parkour event',
          url: this.data[this.currentIndex].data.uri,
          drmConfig: null,
        })
        this.updateInfo()
        this.setVideoRect(0, 0, 1920, 1080)
      } catch (error) {
        console.error('Playback Failed ' + error)
        Metrics.error(Metrics.ErrorType.MEDIA,"PlaybackError", 'Playback Failed ' + JSON.stringify(error), false, null)
      }
    }
  }

  prevTrack() {
    if (this.data[this.currentIndex - 1]) {
      this.currentIndex -= 1
      this.stop()
      this.destroy()
      try {
        this.load({
          title: 'Parkour event',
          url: this.data[this.currentIndex].data.uri,
          drmConfig: null,
        })
        this.updateInfo()
        this.setVideoRect(0, 0, 1920, 1080)
      } catch (error) {
        console.error('Playback Failed ' + error)
        Metrics.error(Metrics.ErrorType.MEDIA,"PlaybackError", 'Playback Failed '+JSON.stringify(error), false, null)
      }
    }
  }

  /**
   * Function to perform fast forward of the video content.
   */
  fastfwd() {
    if (this.playbackRateIndex < this.playbackSpeeds.length - 1) {
      this.playbackRateIndex++
    }
    this.rate = this.playbackSpeeds[this.playbackRateIndex]
    player.setPlaybackRate(this.rate)
  }

  /**
   * Function to perform fast rewind of the video content.
   */
  fastrwd() {
    if (this.playbackRateIndex > 0) {
      this.playbackRateIndex--
    }
    this.rate = this.playbackSpeeds[this.playbackRateIndex]
    player.setPlaybackRate(this.rate)
  }

  /**
   * Function that returns player instance.
   * @returns player instance.
   */
  getPlayer() {
    return player
  }

  /**
   * Function to release the video player instance when not in use.
   */
  destroy() {
    if (player.getCurrentState() !== this.playerStatesEnum.idle) {
      player.stop()
    }
    player.removeEventListener('playbackStateChanged', this._playbackStateChanged)
    player.removeEventListener('playbackCompleted', this._mediaEndReached)
    player.removeEventListener('playbackSpeedChanged', this._mediaSpeedChanged)
    player.removeEventListener('bitrateChanged', this._bitrateChanged)
    player.removeEventListener('playbackFailed', this._mediaPlaybackFailed.bind(this))
    player.removeEventListener('playbackProgressUpdate', this._mediaProgressUpdate.bind(this))
    player.removeEventListener('playbackStarted', this._mediaPlaybackStarted.bind(this))
    player.removeEventListener('durationChanged', this._mediaDurationChanged)
    player.release()
    player = null
    this.hidePlayerControls()
  }

  /**
   * Function to hide the player controls.
   */
  hidePlayerControls() {
    this.tag('PlayerControlsWrapper').setSmooth('y', 1080, { duration: 0.7 })
    this.tag('PlayerControlsWrapper').setSmooth('alpha', 0, { duration: 0.7 })
    this._setState('HideControls')
    this.hideInfo()
  }

  /**
   * Function to show the player controls.
   */
  showPlayerControls() {
    // this.tag('PlayerControls').reset()
    this.tag('PlayerControlsWrapper').setSmooth('alpha', 1)
    this.tag('PlayerControlsWrapper').setSmooth('y', 750, { duration: 0.7 })
    this._setState('ShowControls')
    this.timeout = setTimeout(this.hidePlayerControls.bind(this), 5000)
  }


  showInfo() {
    if (this.isUSB || this.isChannel) {
      this.tag("InfoOverlay").setSmooth('alpha', 1, { duration: 0.3, delay: 0.7 })
    }
  }


  hideInfo() {
    if (this.isUSB || this.isChannel) {
      this.tag("InfoOverlay").setSmooth('alpha', 0, { duration: 0.3 })
    }
  }

  updateInfo() {
    if (this.isUSB) {
      this.tag('ShowName').text.text = this.data[this.currentIndex].data.displayName
    } else if (this.isChannel) {
      this.tag('ShowName').text.text = this.showName
      this.tag('ChannelName').text.text = this.channelName
    }
  }
  /**
   * Function to display player controls on down key press.
   */

  /**
   *Function to hide player control on up key press.
   */

  _handleBack() {
    Router.back()
  }

  _inactive() {
    this.tag('Image').alpha = 0
    this.tag('InfoOverlay').alpha = 0
    this.isUSB = false
    this.isChannel = false
    this.tag('PlayerControls').reset()
    this.stop()
    this.destroy()
  }

  _focus() {
    this._setState('HideControls')
    this.updateInfo()
    if (this.isChannel) {
      this.tag('ChannelOverlay').$focusChannel(this.channelIndex)
      this.tag('InfoOverlay').y = 790
      this.tag('ChannelName').visible = true
      this.tag('PlayerControls').hideNextPrevious()
    } else {
      this.tag('InfoOverlay').y = 820
      this.tag('ChannelName').visible = false
      this.tag('PlayerControls').showNextPrevious()
    }
    if (this.data == undefined || this.data.length <= 1) {
      this.tag('PlayerControls').hideNextPrevious()
    }
  }
  /**
   * Function to define the different states of the video player.
   */
  static _states() {
    return [
      class ShowControls extends this {
        _getFocused() {
          return this.tag('PlayerControls')
        }
        _handleDown() {
          this.hidePlayerControls()
          this._setState('HideControls')
        }
        _handleUp() {
          if (this.isChannel) {
            this.hidePlayerControls()
            this._setState('ChannelOverlay')
          }
        }
      },
      class HideControls extends this {
        // _handleBack(){
        //   console.log('go back from hidecontrol')
        // }
        _handleUp() {
          // this.tag('PlayerControlsWrapper').setSmooth('alpha', 1, { duration: 1 })
          // this.tag('PlayerControlsWrapper').setSmooth('y', 820, { duration: 1 })
          this.showPlayerControls()
          this._setState('ShowControls')
          this.showInfo()
          clearTimeout(this.timeout)
        }

        _handleLeft() {
          if (this.isChannel) {
            this._setState('ChannelOverlay')
          }
        }
      },
      class ChannelOverlay extends this {
        $enter() {
          this.tag('ChannelWrapper').setSmooth('x', 0, { duration: 1 })
        }
        $exit() {
          this.tag('ChannelWrapper').setSmooth('x', -360, { duration: 1 })
        }
        _handleLeft() {
          this.hidePlayerControls()
          this._setState('HideControls')
        }
        _handleRight() {
          this.hidePlayerControls()
          this._setState('HideControls')
        }
        _handleBack() {
          this.hidePlayerControls()
          this._setState('HideControls')
        }
        _getFocused() {
          return this.tag('ChannelOverlay')
        }
      },
    ]
  }
}
