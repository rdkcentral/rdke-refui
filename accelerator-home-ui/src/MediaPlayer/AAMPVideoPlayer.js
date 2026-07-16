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
import { CONFIG, GLOBALS } from '../Config/Config';
import ChannelOverlay from './ChannelOverlay';
import AppManager from '../api/AppManagerApi.js';
import IPAPlayerRPC from '../api/IPAPlayer.js';

let position = null
/**
 * Class to render AAMP video player.
 */
export default class AAMPVideoPlayer extends Lightning.Component {
  constructor(...args) {
    super(...args);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }
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
    let url = args.url ? args.url : 'http://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
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
      this.ERR('Playback Failed ' + JSON.stringify(error))
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

  async _init() {
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
    this.playbackRateIndex = this.playbackSpeeds.indexOf(1)

    this._instanceId = GLOBALS.selfclientAppName;

    try {
        const isInstalled = await AppManager.get().isInstalled('com.rdkcentral.aamp-cli-sh')
        if (!isInstalled) {
          throw new Error('AAMP CLI is not installed on the device')
        }
        const response = await AppManager.get().launchApp('com.rdkcentral.aamp-cli-sh')
        this.LOG('launchApp response: ' + JSON.stringify(response))
    } catch (error) {
        this.ERR('Error launching AAMP CLI: ' + JSON.stringify(error))
    }
  }

  async _active() {
    this._selfAppInstanceId = null;
    this._sessionId = null;
    this._ipaPlayer = new IPAPlayerRPC();
    await AppManager.get().getLoadedApps().then((apps) => {
	  if (apps && apps.length > 0) {
		// extract the appInstanceId matching to this._instanceId
		const appInstance = apps.find(app => app.appId === this._instanceId);
		if (appInstance) {
			this._selfAppInstanceId = "wst-" + appInstance.appInstanceId;
			this.LOG('Found app instance with matching instanceId: ' + this._instanceId + ', appInstanceId: ' + this._selfAppInstanceId);
			this._ipaPlayer.openSession(this._instanceId, this._selfAppInstanceId).then((response) => {
				this.LOG('openSession response: ' + JSON.stringify(response));
				if (response && response.sessionId) {
					this._sessionId = response.sessionId;
					this.LOG('Session opened successfully, sessionId: ' + this._sessionId);
					const aampcfg = { forceHttp: true, enableVideoEndEvent: false };
					this._ipaPlayer.configureSession(this._sessionId, aampcfg).then((configResponse) => {
						this.LOG('configureSession response: ' + JSON.stringify(configResponse));
						this._ipaPlayer.play(this._sessionId, this.videoInfo.url).then((playResponse) => {
							this.LOG('play response: ' + JSON.stringify(playResponse));
							if (playResponse && playResponse.status) {
								this.LOG('Playback started successfully for sessionId: ' + this._sessionId);
							} else {
								this.ERR('Invalid response from play: ' + JSON.stringify(playResponse));
							}
						}).catch((error) => {
							this.ERR('Error starting playback: ' + JSON.stringify(error));
						});
					}).catch((error) => {
						this.ERR('Error configuring session: ' + JSON.stringify(error));
					});
				} else {
					this.ERR('Invalid response from openSession: ' + JSON.stringify(response));
				}
			}).catch((error) => {
				this.ERR('Error opening session: ' + JSON.stringify(error));
			});
		} else {
			this.WARN('No app instance found with matching instanceId: ' + this._instanceId);
		}
	  }
	}).catch((error) => {
	  this.ERR('Error getting loaded apps: ' + JSON.stringify(error))
	})
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
      case this.playerStatesEnum.idle:
        this.playerState = this.playerStatesEnum.idle
        break
      case this.playerStatesEnum.initializing:
        this.playerState = this.playerStatesEnum.initializing
        break
      case this.playerStatesEnum.playing:
        this.playerState = this.playerStatesEnum.playing
        break
      case this.playerStatesEnum.paused:
        this.playerState = this.playerStatesEnum.paused
        break
      case this.playerStatesEnum.seeking:
        this.playerState = this.playerStatesEnum.seeking
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
  _mediaDurationChanged(event) {
    if (event && event.duration !== undefined) {
      this.tag('PlayerControls').duration = event.duration
    }
  }

  /**
   * Loads the player with video URL.
   * @param videoInfo the url and the info regarding the video like title.
   */
  load(videoInfo) {
    this.videoInfo = videoInfo
    this.tag('PlayerControls').title = videoInfo.title
    this.tag('PlayerControls').currentTime = 0
    this.play(videoInfo.url)
  }

  /**
   * Starts playback when enough data is buffered at play head.
   */
  play(url) {
    if (url && this._ipaPlayer) {
      this.LOG('Starting playback for sessionId: ' + this._sessionId + ', url: ' + url);
      this._ipaPlayer.play(this._sessionId, url).then((response) => {
		  this.LOG('play response: ' + JSON.stringify(response));
		  if (response && response.status) {
			  this.LOG('Playback started successfully for sessionId: ' + this._sessionId);
		  } else {
			  this.ERR('Invalid response from play: ' + JSON.stringify(response));
		  }
	  }).catch((error) => {
		  this.ERR('Error starting playback: ' + JSON.stringify(error));
	  });
    }
    this.playbackRateIndex = this.playbackSpeeds.indexOf(1)
  }

  /**
   * Stop playback and free resources.
   */
  async stop() {
    if (this._ipaPlayer) {
      await this._ipaPlayer.stop(this._sessionId).then((response) => {
		  this.LOG('stop response: ' + JSON.stringify(response));
		  if (response && response.status) {
			  this.LOG('Playback stopped successfully for sessionId: ' + this._sessionId);
		  } else {
			  this.ERR('Invalid response from stop: ' + JSON.stringify(response));
		  }
	  }).catch((error) => {
		  this.ERR('Error stopping playback: ' + JSON.stringify(error));
	  });
    }
    this.hidePlayerControls()
  }

  async $changeChannel(url, showName, channelName) {
    await this.stop()
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
      this.ERR('Playback Failed ' + JSON.stringify(error))
    }
  }

  async nextTrack() {
    if (this.data[this.currentIndex + 1]) {
      this.currentIndex += 1
      await this.stop()
      try {
        this.load({
          title: this.data[this.currentIndex].data.displayName,
          url: this.data[this.currentIndex].data.uri,
          drmConfig: null,
        })
        this.updateInfo()
        this.setVideoRect(0, 0, 1920, 1080)
      } catch (error) {
        this.ERR('Playback Failed ' + JSON.stringify(error))
      }
    }
  }

  async prevTrack() {
    if (this.data[this.currentIndex - 1]) {
      this.currentIndex -= 1
      await this.stop()
      try {
        this.load({
          title: this.data[this.currentIndex].data.displayName,
          url: this.data[this.currentIndex].data.uri,
          drmConfig: null,
        })
        this.updateInfo()
        this.setVideoRect(0, 0, 1920, 1080)
      } catch (error) {
        this.ERR('Playback Failed ' + JSON.stringify(error))
      }
    }
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

  async _inactive() {
    this.tag('Image').alpha = 0
    this.tag('InfoOverlay').alpha = 0
    this.isUSB = false
    this.isChannel = false
    this.tag('PlayerControls').reset()
	this.hidePlayerControls()
    if (!this._ipaPlayer) {
      this._sessionId = null
      return
    }

    try {
      if (this._sessionId && this._sessionId.length > 0) {
        const response = await this._ipaPlayer.closeSession(this._sessionId)
        this.LOG('closeSession response: ' + JSON.stringify(response))
      }
    } catch (error) {
      this.ERR('Error closing session: ' + JSON.stringify(error))
    } finally {
      this._ipaPlayer.destroy()
      this._ipaPlayer = null
      this._sessionId = null
    }
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
