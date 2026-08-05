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
const LOGTAG = 'AAMPVideoPlayerDBG: '
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
		this._sessionReadyPromise = null;
		this._pendingUrl = null;
		this._pendingDrmConfig = null;
		this._playInFlight = false;
		this._lastState = null;
		this._lastDuration = null;
		this._lastRate = null;
		this._lastBitrate = null;
		this._lastCriticalAnomalySignature = null;
		this._errorMessageTimeout = null;
		this._isPlaybackNotificationPinned = false;
		this._playbackStartedEmitted = false;
		this._playbackEndedEmitted = false;
		this._isSessionInitialized = false;
		this._stopPromise = null;
		this._pendingStopWaiter = null;
		this._showingCleanupNotification = false;
		this._boundOnIpaEvent = this._onIpaEvent.bind(this);
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
				drmConfig: args.drmConfig || null,
				attribution: args.attribution || null,
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
			PlaybackNotification: {
				x: 960,
				y: 700,
				mountX: 0.5,
				alpha: 0,
				zIndex: 4,
				w: 1560,
				h: 80,
				rect: true,
				color: 0xCC7A1E1E,
				clipping: true,
				Message: {
					x: 24,
					y: 40,
					mountY: 0.5,
					text: {
						text: '',
						fontFace: CONFIG.language.font,
						fontSize: 30,
						textColor: 0xffFFFFFF,
						wordWrap: true,
						wordWrapWidth: 1510,
						maxLines: 1,
					}
				}
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
		this.setVideoRect(0, 0, 1920, 1080);
		this._sessionId = null;
		this._isSessionInitialized = false;
		if (!this._ipaPlayer) { this._ipaPlayer = new IPAPlayerRPC(); }
		const player = this._ipaPlayer;
		this.LOG(LOGTAG + 'active start, instanceId=' + GLOBALS.selfclientAppName + ', pendingUrl=' + this._pendingUrl);

		try {
			// Ensure the session is ready before attempting to play
			if (GLOBALS._selfClientId === null || GLOBALS._selfClientId === undefined) {
				throw new Error('Missing self client id. Could not resolve in _active for instanceId: ' + GLOBALS.selfclientAppName);
			}
			await player.ready;
			await this._initializePlaybackSession(GLOBALS._selfClientId, this._pendingUrl, this._pendingDrmConfig).then(() => {
				this.LOG(LOGTAG + 'active: playback session initialized successfully');
				this._playPendingUrl();
			}).catch((error) => {
				this.ERR(LOGTAG + 'active: error initializing playback session: ' + (error && error.message ? error.message : JSON.stringify(error)));
			});
		} catch (error) {
			this.ERR('Error during player activation: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	async _initializePlaybackSession(selfAppInstanceId = GLOBALS._selfClientId, url = null, drmConfig = null) {
		try {
			this.LOG(LOGTAG + 'initialize session start');
			const player = this._ipaPlayer;
			if (!player) {
				throw new Error('IPA player instance not available during session initialization');
			}
			if (!selfAppInstanceId) {
				throw new Error('Missing self app instance id. Could not resolve in _initializePlaybackSession for instanceId: ' + GLOBALS.selfclientAppName);
			}
			// ensure selfAppInstanceId begins with 'wst-'
			if (!selfAppInstanceId.startsWith('wst-')) {
				selfAppInstanceId = 'wst-' + selfAppInstanceId;
			}

			this.LOG(LOGTAG + 'using cached selfAppInstanceId=' + selfAppInstanceId);
			const sessionResponse = await player.openSession(GLOBALS.selfclientAppName, selfAppInstanceId);
			this.LOG('openSession response: ' + JSON.stringify(sessionResponse));

			if (!sessionResponse || !sessionResponse.sessionId) {
				throw new Error('Invalid response from openSession: ' + JSON.stringify(sessionResponse));
			}

			const sessionId = sessionResponse.sessionId;
			this.LOG('Session opened successfully, sessionId: ' + sessionId);
			this._sessionId = sessionId;
			this._isSessionInitialized = false;

			await player.register(this._boundOnIpaEvent);
			if (player !== this._ipaPlayer) {
				this.WARN(LOGTAG + 'initialize session aborted: player instance changed during async init');
				return;
			}
			this.LOG(LOGTAG + 'registered for server events');

			const aampcfg = { };
			if (drmConfig) {
				// TODO: remove forceHttp once the bolt bundles have access to ca certs.
				if (url && url.startsWith('http://')) aampcfg.forceHttp = false;
				if (drmConfig.licenseServerUrl) aampcfg.licenseServerUrl = drmConfig.licenseServerUrl;
				if (drmConfig.preferredDrm) { aampcfg.preferredDrm = drmConfig.preferredDrm; aampcfg.isPreferredDRMConfigured = true; }
			}
			this.LOG(LOGTAG + 'configureSession request params: ' + JSON.stringify(aampcfg));
			const configResponse = await player.configureSession(sessionId, aampcfg);
			this.LOG('configureSession response: ' + JSON.stringify(configResponse));
			this._isSessionInitialized = true;
			this.LOG(LOGTAG + 'initialize session complete');
		} catch (error) {
			this._isSessionInitialized = false;
			this.ERR('Error initializing playback session: ' + (error && error.message ? error.message : JSON.stringify(error)));
			throw error;
		}
	}

	async _playPendingUrl() {
		if (this._playInFlight || !this._pendingUrl || !this._ipaPlayer || !this._sessionId || !this._isSessionInitialized) {
			this.INFO(LOGTAG + 'playPendingUrl skip: inFlight=' + this._playInFlight + ', hasPendingUrl=' + !!this._pendingUrl + ', hasIpa=' + !!this._ipaPlayer + ', hasSessionId=' + !!this._sessionId + ', sessionInitialized=' + this._isSessionInitialized);
			return;
		}

		this._playInFlight = true;
		try {
			while (this._pendingUrl) {
				const url = this._pendingUrl;
				this._pendingUrl = null;
				this.LOG('Starting playback for sessionId: ' + this._sessionId + ', url: ' + url);
				const playResponse = await this._ipaPlayer.play(this._sessionId, url);
				this.LOG('play response: ' + JSON.stringify(playResponse));

				if (playResponse && playResponse.status) {
					this.LOG('Playback started successfully for sessionId: ' + this._sessionId);
					this._playbackStartedEmitted = false;
					this._playbackEndedEmitted = false;
				} else {
					this.ERR('Invalid response from play: ' + JSON.stringify(playResponse));
					this._mediaPlaybackFailed();
				}
			}
		} catch (error) {
			this.ERR('Error starting playback: ' + JSON.stringify(error));
			this._mediaPlaybackFailed();
		} finally {
			this._playInFlight = false;
		}
	}

	_mapPlayerStateToEnum(state) {
		switch (state) {
			case 'idle': return this.playerStatesEnum.idle;
			case 'initializing': return this.playerStatesEnum.initializing;
			case 'preparing': return this.playerStatesEnum.initializing;
			case 'buffering': return this.playerStatesEnum.initializing;
			case 'playing': return this.playerStatesEnum.playing;
			case 'paused': return this.playerStatesEnum.paused;
			case 'seeking': return this.playerStatesEnum.seeking;
			default: return null;
		}
	}

	_onIpaEvent(eventPayload, responseEnvelope) {
		if (!eventPayload) return;
		const eventMethod = responseEnvelope && typeof responseEnvelope.method === 'string' ? responseEnvelope.method : '';
		const eventName = eventMethod ? eventMethod.split('.').pop() : '';
		const payload = this._normalizeIpaEventPayload(eventPayload);
		this.INFO(LOGTAG + 'event=' + (eventName || 'unknown') + ', payload=' + JSON.stringify(payload));

		if (payload.sessionId && payload.sessionId !== this._sessionId) {
			this.WARN(LOGTAG + 'Received event for different sessionId: ' + payload.sessionId + ', expected: ' + this._sessionId + ', discarding event: ' + JSON.stringify(payload));
			return;
		}

		if (this._handleTuneFailedEvent(payload, eventName)) {
			return;
		}

		if (this._handleAnomalyEvent(payload, eventName)) {
			return;
		}

		if (this._handleStateEvent(payload, eventName)) {
			return;
		}

		if (this._handleProgressEvent(payload, eventName)) {
			return;
		}

		if (this._handleDurationEvent(payload, eventName)) {
			return;
		}

		if (this._handleSpeedEvent(payload, eventName)) {
			return;
		}

		if (this._handleBitrateEvent(payload, eventName)) {
			return;
		}

		this.INFO(LOGTAG + 'unhandled event=' + (eventName || 'unknown') + ', payload=' + JSON.stringify(payload));
	}

	_handleTuneFailedEvent(payload, eventName = '') {
		const tuneFailedMessage = payload.description || payload.msg || payload.message;
		const isTuneFailedEvent = eventName === 'onTuneFailed';
		if (isTuneFailedEvent || (typeof payload.code === 'number' && typeof tuneFailedMessage === 'string')) {
			const shouldRetry = !!payload.shouldRetry;
			this.WARN(LOGTAG + 'onTuneFailed: code=' + payload.code + ', description=' + tuneFailedMessage + ', shouldRetry=' + shouldRetry);
			this._showPlaybackError(tuneFailedMessage || 'Playback failed', true);
			if (!shouldRetry) {
				this._mediaPlaybackFailed();
			}
			return true;
		}
		return false;
	}

	_handleAnomalyEvent(payload, eventName = '') {
		const anomalySeverity = typeof payload.severity === 'number' ? payload.severity : null;
		const isAnomalyEvent = eventName === 'onAnomalyReport';
		if (isAnomalyEvent || anomalySeverity !== null) {
			const anomalyMessage = typeof payload.msg === 'string'
				? payload.msg
				: (typeof payload.message === 'string' ? payload.message : 'unknown anomaly');
			const severityForDecision = anomalySeverity === null ? 1 : anomalySeverity;
			this.WARN(LOGTAG + 'onAnomalyReport: severity=' + severityForDecision + ', msg=' + anomalyMessage);

			const isCriticalSeverity = severityForDecision <= 1;
			const isCriticalMessage = /error|failed|fatal|unknown/i.test(anomalyMessage);
			if (isCriticalSeverity || isCriticalMessage) {
				const signature = severityForDecision + ':' + anomalyMessage;
				if (signature !== this._lastCriticalAnomalySignature) {
					this._lastCriticalAnomalySignature = signature;
					this.ERR(LOGTAG + 'Critical anomaly detected. Triggering playback failure flow.');
					this._showPlaybackError(anomalyMessage, true);
					this._mediaPlaybackFailed();
				}
			}
			return true;
		}
		return false;
	}

	_handleStateEvent(payload, eventName = '') {
		if (eventName && eventName !== 'onStateChanged' && !payload.state) {
			return false;
		}
		if (payload.state) {
			const state = payload.state;
			this._notifyStopWaiter(payload.sessionId, state);
			const mappedState = this._mapPlayerStateToEnum(state);
			if (mappedState !== null && state !== this._lastState) {
				this._playbackStateChanged({ state: mappedState });
				this._lastState = state;
			}
			if (state === 'playing' && !this._playbackStartedEmitted) {
				this._clearPlaybackNotification();
				this._mediaPlaybackStarted();
				this._playbackStartedEmitted = true;
				return;
			}
			if ((state === 'complete' || state === 'stopped') && !this._playbackEndedEmitted) {
				this._playbackEndedEmitted = true;
				this._mediaEndReached();
				return;
			}
			if (state === 'error') {
				this._showPlaybackError(payload.description || payload.message || 'Playback error occurred', true);
				this._mediaPlaybackFailed();
				return true;
			}
			return true;
		}
		return false;
	}

	_handleProgressEvent(payload, eventName = '') {
		if (eventName && eventName !== 'onProgress' && typeof payload.positionMs !== 'number' && typeof payload.position !== 'number') {
			return false;
		}
		const positionMs = typeof payload.positionMs === 'number'
			? payload.positionMs
			: (typeof payload.position === 'number' ? payload.position * 1000 : null);
		if (positionMs !== null) {
			if (positionMs > 0 && this._isPlaybackNotificationPinned) {
				this._clearPlaybackNotification();
			}
			this._mediaProgressUpdate({ positionMiliseconds: positionMs });
			return true;
		}
		return false;
	}

	_handleDurationEvent(payload, eventName = '') {
		if (eventName && eventName !== 'onProgress' && eventName !== 'onMediaMetadata' && typeof payload.durationMs !== 'number' && typeof payload.duration !== 'number') {
			return false;
		}
		const durationSeconds = typeof payload.durationMs === 'number'
			? payload.durationMs / 1000
			: (typeof payload.duration === 'number' ? payload.duration : null);
		if (durationSeconds !== null && durationSeconds >= 0 && durationSeconds !== this._lastDuration) {
			this._mediaDurationChanged({ duration: durationSeconds });
			this._lastDuration = durationSeconds;
			return true;
		}
		return false;
	}

	_handleSpeedEvent(payload, eventName = '') {
		if (eventName && eventName !== 'onSpeedChanged' && typeof payload.rate !== 'number' && typeof payload.speed !== 'number') {
			return false;
		}
		const playbackRate = typeof payload.rate === 'number'
			? payload.rate
			: (typeof payload.speed === 'number' ? payload.speed : null);
		if (playbackRate !== null && playbackRate !== this._lastRate) {
			this._lastRate = playbackRate;
			this._mediaSpeedChanged({ rate: playbackRate });
			return true;
		}
		return false;
	}

	_handleBitrateEvent(payload, eventName = '') {
		if (eventName && eventName !== 'onBitrateChanged' && eventName !== 'onProgress' && typeof payload.bitrate !== 'number' && typeof payload.profileBitrate !== 'number') {
			return false;
		}
		const bitrate = typeof payload.bitrate === 'number'
			? payload.bitrate
			: (typeof payload.profileBitrate === 'number' ? payload.profileBitrate : null);
		if (bitrate !== null && bitrate !== this._lastBitrate) {
			this._lastBitrate = bitrate;
			this._bitrateChanged({ bitrate });
			return true;
		}
		return false;
	}

	_notifyStopWaiter(sessionId, state) {
		const waiter = this._pendingStopWaiter;
		if (!waiter || waiter.sessionId !== sessionId) {
			return;
		}

		if (state === 'stopping') waiter.seenStopping = true;
		if (state === 'idle') waiter.seenIdle = true;

		if (waiter.seenStopping && waiter.seenIdle) {
			clearTimeout(waiter.timeoutId);
			this._pendingStopWaiter = null;
			waiter.resolve();
		}
	}

	_shouldWaitForStopSequence(sessionId) {
		if (!sessionId) return false;
		const activeStates = ['initializing', 'initialized', 'preparing', 'prepared', 'buffering', 'playing', 'paused', 'seeking', 'stopping'];
		return activeStates.indexOf(this._lastState) !== -1;
	}

	_waitForStopStateSequence(sessionId) {
		if (!sessionId) return Promise.resolve();
		if (this._lastState === 'idle') return Promise.resolve();

		return new Promise((resolve) => {
			const timeoutId = setTimeout(() => {
				if (this._pendingStopWaiter && this._pendingStopWaiter.sessionId === sessionId) {
					this.WARN(LOGTAG + 'Timed out waiting for stopping->idle for sessionId: ' + sessionId);
					this._pendingStopWaiter = null;
				}
				resolve();
			}, 4000);

			this._pendingStopWaiter = {
				sessionId,
				seenStopping: this._lastState === 'stopping',
				seenIdle: this._lastState === 'idle',
				timeoutId,
				resolve,
			};
		});
	}

	_showCleanupNotification() {
		this._showingCleanupNotification = true;
		this._showPlaybackError('Cleaning up video playback sessions...', true);
	}

	_normalizeIpaEventPayload(eventPayload) {
		if (!eventPayload || typeof eventPayload !== 'object') {
			return {};
		}

		const nestedPayload =
			(eventPayload.data && typeof eventPayload.data === 'object' && !Array.isArray(eventPayload.data) && eventPayload.data) ||
			(eventPayload.payload && typeof eventPayload.payload === 'object' && !Array.isArray(eventPayload.payload) && eventPayload.payload) ||
			null;

		if (!nestedPayload) {
			return eventPayload;
		}

		return { ...eventPayload, ...nestedPayload };
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
	_mediaSpeedChanged(speedEvent) {
		const rate = speedEvent && typeof speedEvent.rate === 'number' ? speedEvent.rate : this._lastRate;
		// 0x and 1x transitions are expected for pause/play and should not surface as warning banners.
		if (rate === 0 || rate === 1) {
			return;
		}
		this.LOG(LOGTAG + 'Playback speed changed to ' + rate + 'x');
	}

	/**
	 * Event handler to handle the event of bit rate change.
	 */
	_bitrateChanged(bitrateEvent) {
		// use the bitrate from the event if available, otherwise use the last known bitrate
		const bitrate = bitrateEvent && typeof bitrateEvent.bitrate === 'number' ? bitrateEvent.bitrate : this._lastBitrate;
		this.LOG(LOGTAG + 'Bitrate changed to ' + bitrate + ' bps');
	}

	/**
	 * Function to handle the event of playback failure.
	 */
	_mediaPlaybackFailed() {
		this._showPlaybackError('Playback error occurred', true);
	}

	_showPlaybackError(message, pinned = false) {
		if (!message) return;
		if (this._isPlaybackNotificationPinned && !pinned) {
			return;
		}
		if (this._errorMessageTimeout) {
			clearTimeout(this._errorMessageTimeout);
			this._errorMessageTimeout = null;
		}
		this._isPlaybackNotificationPinned = this._isPlaybackNotificationPinned || !!pinned;

		this.showPlayerControls();
		this.tag('PlaybackNotification').patch({ alpha: 1 });
		this.tag('PlaybackNotification').tag('Message').text.text = message;

		if (!this._isPlaybackNotificationPinned) {
			this._errorMessageTimeout = setTimeout(() => {
				this.tag('PlaybackNotification').setSmooth('alpha', 0, { duration: 0.4 });
				this._errorMessageTimeout = null;
			}, 6000);
		}
	}

	_clearPlaybackNotification() {
		this._isPlaybackNotificationPinned = false;
		if (this._errorMessageTimeout) {
			clearTimeout(this._errorMessageTimeout);
			this._errorMessageTimeout = null;
		}
		this.tag('PlaybackNotification').setSmooth('alpha', 0, { duration: 0.25 });
		this.tag('PlaybackNotification').tag('Message').text.text = '';
	}

	async pause() {
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			await this._ipaPlayer.setRate(this._sessionId, 0);
			this.LOG('Playback paused');
		} catch (error) {
			this.ERR('Error pausing playback: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	async seekFwd() {
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			const posResp = await this._ipaPlayer.getPlaybackPosition(this._sessionId);
			const current = posResp && typeof posResp.position === 'number' ? posResp.position : 0;
			await this._ipaPlayer.seek(this._sessionId, current + 10);
			this.LOG('Seeked forward 10s from ' + current);
		} catch (error) {
			this.ERR('Error seeking forward: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	async seekRwd() {
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			const posResp = await this._ipaPlayer.getPlaybackPosition(this._sessionId);
			const current = posResp && typeof posResp.position === 'number' ? posResp.position : 0;
			await this._ipaPlayer.seek(this._sessionId, Math.max(0, current - 10));
			this.LOG('Seeked backward 10s from ' + current);
		} catch (error) {
			this.ERR('Error seeking backward: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	async fastfwd() {
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			this.playbackRateIndex = Math.min(this.playbackRateIndex + 1, this.playbackSpeeds.length - 1);
			const rate = this.playbackSpeeds[this.playbackRateIndex];
			await this._ipaPlayer.setRate(this._sessionId, rate);
			this.LOG('Fast forward rate: ' + rate);
		} catch (error) {
			this.ERR('Error fast forwarding: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	async fastrwd() {
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			this.playbackRateIndex = Math.max(this.playbackRateIndex - 1, 0);
			const rate = this.playbackSpeeds[this.playbackRateIndex];
			await this._ipaPlayer.setRate(this._sessionId, rate);
			this.LOG('Fast rewind rate: ' + rate);
		} catch (error) {
			this.ERR('Error fast rewinding: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
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
		if (this.isUSB || this.isChannel) {
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
		this.setVideoRect(0, 0, 1920, 1080)
		this.tag('PlayerControls').title = videoInfo.title
		this.tag('PlayerControls').currentTime = 0
		this.tag('PlayerControls').attribution = videoInfo.attribution || null
		this.play(videoInfo.url, videoInfo.drmConfig)
	}

	/**
	 * Starts playback with a URL, or resumes from pause if no URL provided.
	 */
	async play(url, drmConfig = null) {
		if (url) {
			this._pendingUrl = url;
			this._pendingDrmConfig = drmConfig;
			this.playbackRateIndex = this.playbackSpeeds.indexOf(1);
			if (this._ipaPlayer && this._sessionId && this._isSessionInitialized) {
				this._playPendingUrl();
			}
			return;
		}
		// Resume from pause (signal from player controls)
		if (!this._ipaPlayer || !this._sessionId) return;
		try {
			await this._ipaPlayer.setRate(this._sessionId, 1);
			this.LOG('Playback resumed');
		} catch (error) {
			this.ERR('Error resuming playback: ' + (error && error.message ? error.message : JSON.stringify(error)));
		}
	}

	/**
	 * Stop playback and free resources.
	 */
	async stop() {
		if (this._stopPromise) {
			return this._stopPromise;
		}

		this._stopPromise = (async () => {
			const stoppingSessionId = this._sessionId;
			const shouldWaitForStopSequence = this._shouldWaitForStopSequence(stoppingSessionId);
			const stopSequencePromise = shouldWaitForStopSequence
				? this._waitForStopStateSequence(stoppingSessionId)
				: Promise.resolve();
			const showedCleanupNotification = shouldWaitForStopSequence;
			if (showedCleanupNotification) {
				this._showCleanupNotification();
			}

		this._pendingUrl = null;
		this._pendingDrmConfig = null;
		this._lastDuration = null;
		this._lastRate = null;
		this._lastBitrate = null;
		this._lastCriticalAnomalySignature = null;
		if (!this._showingCleanupNotification) {
			if (this._errorMessageTimeout) {
				clearTimeout(this._errorMessageTimeout);
				this._errorMessageTimeout = null;
			}
			this._isPlaybackNotificationPinned = false;
			this.tag('PlaybackNotification').alpha = 0;
			this.tag('PlaybackNotification').tag('Message').text.text = '';
		}
		this._playbackStartedEmitted = false;
		this._playbackEndedEmitted = false;
		if (this._ipaPlayer && this._sessionId) {
			try {
				const response = await this._ipaPlayer.stop(this._sessionId);
				this.LOG('stop response: ' + JSON.stringify(response));
				if (response && response.status) {
					this.LOG('Playback stopped successfully for sessionId: ' + this._sessionId);
					if (shouldWaitForStopSequence) {
						await stopSequencePromise;
					}
				} else {
					this.ERR('Invalid response from stop: ' + JSON.stringify(response));
				}
			} catch (error) {
				this.ERR('Error stopping playback: ' + JSON.stringify(error));
			}
		}
		if (this._showingCleanupNotification) {
			this._clearPlaybackNotification();
			this._showingCleanupNotification = false;
		}
		this._lastState = null;
		this.hidePlayerControls()
		})().finally(() => {
			this._showingCleanupNotification = false;
			this._stopPromise = null;
		});

		return this._stopPromise;
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
					drmConfig: this.data[this.currentIndex].data.drmConfig || null,
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
					drmConfig: this.data[this.currentIndex].data.drmConfig || null,
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
		if (this._isPlaybackNotificationPinned) {
			return;
		}
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

	async _handleBack() {
		if (!Router.isNavigating()) {
			if (this._shouldWaitForStopSequence(this._sessionId)) {
				this._showCleanupNotification();
			}
			await this.stop()
			Router.back()
		}
	}

	async _inactive() {
		this.tag('Image').alpha = 0
		this.tag('InfoOverlay').alpha = 0
		this.isUSB = false
		this.isChannel = false
		this.tag('PlayerControls').reset()
		if (this._shouldWaitForStopSequence(this._sessionId)) {
			this._showCleanupNotification();
		}
		await this.stop()
		this._pendingUrl = null
		this._pendingDrmConfig = null
		this._playInFlight = false
		this._lastState = null
		this._lastDuration = null
		this._lastRate = null
		this._lastBitrate = null
		this._playbackStartedEmitted = false
		this._playbackEndedEmitted = false
		this._isSessionInitialized = false;

		// Snapshot and null current refs first to avoid races with a new activation.
		const player = this._ipaPlayer;
		this._ipaPlayer = null;
		this._sessionId = null;
		this._sessionReadyPromise = null;

		if (!player) {
			this.WARN(LOGTAG + 'inactive: player instance is null.');
			return;
		}

		try {
			await player.unregister(this._boundOnIpaEvent);
		} catch (error) {
			this.WARN(LOGTAG + 'unregister error: ' + (error && error.message ? error.message : JSON.stringify(error)));
		} finally {
			player.destroy();
		}
	}

	_focus() {
		this._setState('HideControls')
		this.updateInfo()
		this.setVideoRect(0, 0, 1920, 1080)
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
		this.showPlayerControls()
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
				_showControlsFromNavigation() {
					this.showPlayerControls()
					this._setState('ShowControls')
					this.showInfo()
					clearTimeout(this.timeout)
				}

				_handleUp() {
					this._showControlsFromNavigation()
				}

				_handleDown() {
					this._showControlsFromNavigation()
				}

				_handleRight() {
					this._showControlsFromNavigation()
				}

				_handleLeft() {
					if (this.isChannel) {
						this._setState('ChannelOverlay')
					} else {
						this._showControlsFromNavigation()
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
