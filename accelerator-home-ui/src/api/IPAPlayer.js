/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
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

const wsUrl = `ws://localhost:10101`
const LOGTAG = 'AAMPIPPlayer :'

const METHOD_BASE = 'org.rdk.player.'
const METHODS = {
	REGISTER: METHOD_BASE + 'register',
	UNREGISTER: METHOD_BASE + 'unregister',
	GET_LISTENERS: METHOD_BASE + 'getListeners',
	OPEN_SESSION: METHOD_BASE + 'openSession',
	GET_SESSION_INFO: METHOD_BASE + 'getSessionInfo',
	SETUP_SESSION: METHOD_BASE + 'setupSession',
	PLAY: METHOD_BASE + 'play',
	STOP: METHOD_BASE + 'stop',
	SEEK: METHOD_BASE + 'seek',
	SEEK_TO_LIVE: METHOD_BASE + 'seekToLive',
	SET_RATE: METHOD_BASE + 'setRate',
	SET_PLAYBACK_SPEED: METHOD_BASE + 'setPlaybackSpeed',
	PAUSE_AT: METHOD_BASE + 'pauseAt',
	SET_RATE_AND_SEEK: METHOD_BASE + 'setRateAndSeek',
	GET_STATE: METHOD_BASE + 'getState',
	GET_PLAYBACK_POSITION: METHOD_BASE + 'getPlaybackPosition',
	GET_PLAYBACK_DURATION: METHOD_BASE + 'getPlaybackDuration',
	GET_PLAYBACK_RATE: METHOD_BASE + 'getPlaybackRate',
	CLOSE_SESSION: METHOD_BASE + 'closeSession',
	IS_LIVE: METHOD_BASE + 'isLive',
	SET_VIDEO_MUTE: METHOD_BASE + 'setVideoMute',
	GET_VIDEO_MUTE: METHOD_BASE + 'getVideoMute',
	SET_AUDIO_VOLUME: METHOD_BASE + 'setAudioVolume',
	GET_AUDIO_VOLUME: METHOD_BASE + 'getAudioVolume',
	GET_AUDIO_LANGUAGE: METHOD_BASE + 'getAudioLanguage',
	GET_AVAILABLE_AUDIO_TRACKS: METHOD_BASE + 'getAvailableAudioTracks',
	SET_AUDIO_TRACK: METHOD_BASE + 'setAudioTrack',
	GET_AUDIO_TRACK: METHOD_BASE + 'getAudioTrack',
	GET_AUDIO_TRACK_INFO: METHOD_BASE + 'getAudioTrackInfo',
	SET_SUBTITLE_MUTE: METHOD_BASE + 'setSubtitleMute',
	GET_AVAILABLE_TEXT_TRACKS: METHOD_BASE + 'getAvailableTextTracks',
	SET_TEXT_TRACK: METHOD_BASE + 'setTextTrack',
	GET_TEXT_TRACK: METHOD_BASE + 'getTextTrack',
	GET_VIDEO_BITRATE: METHOD_BASE + 'getVideoBitrate',
	SET_VIDEO_BITRATE: METHOD_BASE + 'setVideoBitrate',
	GET_VIDEO_BITRATES: METHOD_BASE + 'getVideoBitrates',
	SET_INITIAL_BITRATE: METHOD_BASE + 'setInitialBitrate',
	GET_INITIAL_BITRATE: METHOD_BASE + 'getInitialBitrate',
	SET_MINIMUM_BITRATE: METHOD_BASE + 'setMinimumBitrate',
	GET_MINIMUM_BITRATE: METHOD_BASE + 'getMinimumBitrate',
	SET_MAXIMUM_BITRATE: METHOD_BASE + 'setMaximumBitrate',
	GET_MAXIMUM_BITRATE: METHOD_BASE + 'getMaximumBitrate',
	SET_LICENSE_SERVER_URL: METHOD_BASE + 'setLicenseServerURL',
	GET_DRM: METHOD_BASE + 'getDRM',
	SET_PREFERRED_DRM: METHOD_BASE + 'setPreferredDRM',
	CONFIGURE_SESSION: METHOD_BASE + 'configureSession',
	GET_AAMP_CONFIG: METHOD_BASE + 'getAAMPConfig',
	SET_APP_NAME: METHOD_BASE + 'setAppName',
	SET_PREFERRED_LANGUAGES: METHOD_BASE + 'setPreferredLanguages',
	GET_PREFERRED_LANGUAGES: METHOD_BASE + 'getPreferredLanguages'
}

// IntegratedPlayer PR#22 emits only these RPC event names via m_wsRpcServer->onEvent(...)
const EVENT_BASE = 'org.rdk.player.'
const EVENT_SUBSCRIPTION_ID = 'events.1'
const EVENTS = {
	ON_TUNED: EVENT_BASE + 'onTuned',
	ON_TUNE_FAILED: EVENT_BASE + 'onTuneFailed',
	ON_STATE_CHANGED: EVENT_BASE + 'onStateChanged',
	ON_PROGRESS: EVENT_BASE + 'onProgress',
	ON_EOS: EVENT_BASE + 'onEOS',
	ON_SPEED_CHANGED: EVENT_BASE + 'onSpeedChanged',
	ON_BUFFERING_CHANGED: EVENT_BASE + 'onBufferingChanged',
	ON_SEEKED: EVENT_BASE + 'onSeeked',
	ON_BITRATE_CHANGED: EVENT_BASE + 'onBitrateChanged'
}

class IPAPlayerRPC {
	constructor() {
		this.pending = new Map();
		this.defaultRequestTimeoutMs = 10000;
		this.INFO = function () { };
		this.LOG = function () { };
		this.ERR = console.error;
		this.WARN = console.warn;
		this.activeSessionId = null;
		this.listeners = new Set();
		this.isRegisteredForEvents = false;
		this.pendingRegisterPromise = null;
		this.pendingUnregisterPromise = null;
		this.socket = new WebSocket(wsUrl);
		this.isOpen = false;
		this.rpcId = 0;
		let _resolveOpen, _rejectOpen;
		this._openPromise = new Promise((resolve, reject) => { _resolveOpen = resolve; _rejectOpen = reject; });
		this.ready = this._openPromise;
		this.socket.onopen = () => {
			this.isOpen = true;
			_resolveOpen();
			this.LOG(LOGTAG + 'WebSocket connection established with IPAPlayer backend at ' + wsUrl);
		}
		this.socket.onmessage = (event) => {
			this._handleIncomingMessage(event);
		}
		this.socket.onerror = (event) => {
			try { _rejectOpen(new Error('WebSocket error')); } catch(e) {}
			this.ERR(LOGTAG + 'WebSocket error with IPAPlayer backend at ' + wsUrl + ': ' + (event && event.message ? event.message : 'unknown error'));
		}
		this.socket.onclose = () => {
			this.isOpen = false;
			this.activeSessionId = null;
			this.pending.forEach(({ reject, timeoutId }) => {
				clearTimeout(timeoutId);
				reject(new Error('WebSocket connection closed'));
			});
			this.pending.clear();
			this.ERR(LOGTAG + 'WebSocket connection closed with IPAPlayer backend at ' + wsUrl);
		}
	}

	_normalizeResponse(response) {
		if (response && response.result !== undefined) {
			return response.result;
		}
		return response;
	}

	_handleIncomingMessage(event) {
		let response = null;
		try {
			this.INFO(LOGTAG + 'Received message from IPAPlayer backend: ' + JSON.stringify(event.data));
			response = JSON.parse(event.data);
		} catch (error) {
			this.ERR(LOGTAG + 'Failed to parse IPAPlayer response: ' + (error && error.message ? error.message : String(error)));
			return;
		}

		if (!response || !Object.prototype.hasOwnProperty.call(response, 'id')) {
			const consumed = this._emitEvent(response);
			if (!consumed) {
				this.WARN && this.WARN(LOGTAG + 'Received IPAPlayer notification/event without request id: ' + JSON.stringify(response));
			}
			return;
		}

		const pendingId = response.id;
		if (!this.pending.has(pendingId)) {
			this.WARN && this.WARN(LOGTAG + 'Received IPAPlayer response without a matching pending request: ' + JSON.stringify(response));
			return;
		}

		const pendingRequest = this.pending.get(pendingId);
		this.pending.delete(pendingId);
		clearTimeout(pendingRequest.timeoutId);

		if (response && response.error) {
			const errMsg = response.error.message || JSON.stringify(response.error);
			pendingRequest.reject(new Error(errMsg));
			return;
		}

		if (response && response.status === false) {
			pendingRequest.reject(new Error(response.message || 'Request failed'));
			return;
		}

		pendingRequest.resolve(response);
	}

	_emitEvent(response) {
		if (!this.listeners || this.listeners.size === 0) {
			return false;
		}

		const method = response && typeof response.method === 'string' ? response.method : '';
		const methodPrefix = EVENT_SUBSCRIPTION_ID + '.';
		if (!method || method.indexOf(methodPrefix) !== 0) {
			return false;
		}

		const eventPayload = response && Object.prototype.hasOwnProperty.call(response, 'params') ? response.params : response;
		this.listeners.forEach((callback) => {
			try {
				callback(eventPayload, response);
			} catch (error) {
				this.ERR(LOGTAG + 'Error in IPAPlayer event callback: ' + (error && error.message ? error.message : String(error)));
			}
		});

		return true;
	}

	_registerForServerEvents() {
		if (this.isRegisteredForEvents) {
			return Promise.resolve({ status: true, reused: true });
		}
		if (this.pendingRegisterPromise) {
			return this.pendingRegisterPromise;
		}

		const eventNames = Object.values(EVENTS);
		this.pendingRegisterPromise = Promise.all(eventNames.map((event) => {
			return this._invoke(METHODS.REGISTER, { event: event, id: EVENT_SUBSCRIPTION_ID }).catch((error) => {
				this.ERR(LOGTAG + 'Failed to subscribe to event: ' + event + ', error: ' + (error && error.message ? error.message : String(error)));
				throw error;
			});
		})).then(() => {
			this.isRegisteredForEvents = true;
			return { status: true, events: eventNames.length };
		}).finally(() => {
			this.pendingRegisterPromise = null;
		});

		return this.pendingRegisterPromise;
	}

	_unregisterFromServerEvents() {
		if (!this.isRegisteredForEvents) {
			return Promise.resolve({ status: true, skipped: true });
		}
		if (this.pendingUnregisterPromise) {
			return this.pendingUnregisterPromise;
		}

		const eventNames = Object.values(EVENTS);
		this.pendingUnregisterPromise = Promise.all(eventNames.map((event) => {
			return this._invoke(METHODS.UNREGISTER, { event: event, id: EVENT_SUBSCRIPTION_ID }).catch((error) => {
				this.WARN(LOGTAG + 'Failed to unsubscribe from event: ' + event + ', error: ' + (error && error.message ? error.message : String(error)));
				throw error;
			});
		})).then(() => {
			this.isRegisteredForEvents = false;
			return { status: true, events: eventNames.length };
		}).finally(() => {
			this.pendingUnregisterPromise = null;
		});

		return this.pendingUnregisterPromise;
	}

	_validateOpenSocket() {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			throw new Error('WebSocket is not connected');
		}
	}

	_getValidatedSessionId(sessionId, methodName) {
		const value = sessionId || this.activeSessionId;
		if (!value || typeof value !== 'string' || !value.trim()) {
			throw new Error(`Invalid parameters for ${methodName} method`);
		}
		return value.trim();
	}

	_getValidatedString(value, paramName, methodName) {
		if (!value || typeof value !== 'string' || !value.trim()) {
			throw new Error(`Invalid parameter '${paramName}' for ${methodName} method`);
		}
		return value.trim();
	}

	_getValidatedNumber(value, paramName, methodName) {
		if (typeof value !== 'number' || Number.isNaN(value)) {
			throw new Error(`Invalid parameter '${paramName}' for ${methodName} method`);
		}
		return value;
	}

	_getValidatedBoolean(value, paramName, methodName) {
		if (typeof value !== 'boolean') {
			throw new Error(`Invalid parameter '${paramName}' for ${methodName} method`);
		}
		return value;
	}

	_isSuccessResult(result) {
		return !!(result && (result.status === true || result.success === true));
	}

	async _invoke(method, params) {
		if (params === undefined) {
			this.LOG(LOGTAG + `Invoking method: ${method}`);
		} else {
			this.LOG(LOGTAG + `Invoking method: ${method} with params: ${JSON.stringify(params)}`);
		}
		const response = await this.sendRpc(method, params);
		this.LOG(LOGTAG + `${method} response: ${JSON.stringify(response)}`);
		return this._normalizeResponse(response);
	}

	async _invokeWithSession(method, sessionId, params = {}) {
		const validSessionId = this._getValidatedSessionId(sessionId, method);
		return this._invoke(method, { sessionId: validSessionId, ...params });
	}

	async _invokeExpectSuccess(method, params = {}) {
		const result = await this._invoke(method, params);
		if (this._isSuccessResult(result)) {
			return result;
		}
		throw new Error((result && result.message) || 'Invalid response from server');
	}

	async _invokeWithSessionExpectSuccess(method, sessionId, params = {}) {
		const result = await this._invokeWithSession(method, sessionId, params);
		if (this._isSuccessResult(result)) {
			return result;
		}
		throw new Error((result && result.message) || 'Invalid response from server');
	}

	async _invokeWithSessionRequiredKey(method, sessionId, requiredKey, params = {}) {
		const result = await this._invokeWithSession(method, sessionId, params);
		if (result && Object.prototype.hasOwnProperty.call(result, requiredKey)) {
			return result;
		}
		throw new Error((result && result.message) || 'Invalid response from server');
	}

	sendRpc(method, params) {
		return new Promise((resolve, reject) => {
			const startSend = () => {
				if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
					reject(new Error('WebSocket is not connected'));
					return;
				}

				const payload = {
					jsonrpc: '2.0',
					id : this.rpcId++,
					method,
					params: params || {}
				};

				const timeoutId = setTimeout(() => {
					if (this.pending.has(payload.id)) {
						this.pending.delete(payload.id);
						reject(new Error(`Request timed out for method: ${method}`));
					}
				}, this.defaultRequestTimeoutMs);

				this.pending.set(payload.id, { resolve, reject, timeoutId });
				this.socket.send(JSON.stringify(payload));
			};

			if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
				this._openPromise
					.then(startSend)
					.catch(() => reject(new Error('WebSocket is not connected')));
				return;
			}

			startSend();
		});
	}

	register(callback) {
		if (typeof callback !== 'function') {
			throw new Error("Callback must be a function");
		}

		this.listeners.add(callback);
		return this._registerForServerEvents().catch((error) => {
			this.listeners.delete(callback);
			throw error;
		});
	}

	unregister(callback) {
		if (typeof callback !== 'function') {
			throw new Error("Callback must be a function");
		}

		this.listeners.delete(callback);
		if (this.listeners.size === 0) {
			return this._unregisterFromServerEvents();
		}

		return Promise.resolve({ status: true, listeners: this.listeners.size });
	}

	getListeners() {
		return this._invoke(METHODS.GET_LISTENERS, {});
	}

	async openSession(instanceId, displayId) {
		const validInstanceId = this._getValidatedString(instanceId, 'instanceId', METHODS.OPEN_SESSION);
		const validDisplayId = this._getValidatedString(displayId, 'displayId', METHODS.OPEN_SESSION);
		const result = await this._invokeExpectSuccess(METHODS.OPEN_SESSION, {
			instanceId: validInstanceId,
			displayId: validDisplayId
		});
		if (result && result.sessionId) {
			this.activeSessionId = result.sessionId;
			return result;
		}
		throw new Error((result && result.message) || 'Invalid response from server');
	}

	getSessionInfo() {
		return this._invoke(METHODS.GET_SESSION_INFO, {});
	}

	setupSession() {
		return this._invokeExpectSuccess(METHODS.SETUP_SESSION, {});
	}

	play(sessionId, url) {
		const validUrl = this._getValidatedString(url, 'url', METHODS.PLAY);
		return this._invokeWithSessionExpectSuccess(METHODS.PLAY, sessionId, { url: validUrl });
	}

	stop(sessionId) {
		return this._invokeWithSessionExpectSuccess(METHODS.STOP, sessionId, {});
	}

	seek(sessionId, position) {
		const validPosition = this._getValidatedNumber(position, 'position', METHODS.SEEK);
		return this._invokeWithSessionExpectSuccess(METHODS.SEEK, sessionId, { position: validPosition });
	}

	seekToLive(sessionId) {
		return this._invokeWithSessionExpectSuccess(METHODS.SEEK_TO_LIVE, sessionId, {});
	}

	setRate(sessionId, rate) {
		const validRate = this._getValidatedNumber(rate, 'rate', METHODS.SET_RATE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_RATE, sessionId, { rate: validRate });
	}

	setPlaybackSpeed(sessionId, speed) {
		const validSpeed = this._getValidatedNumber(speed, 'speed', METHODS.SET_PLAYBACK_SPEED);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_PLAYBACK_SPEED, sessionId, { speed: validSpeed });
	}

	pauseAt(sessionId, position) {
		const validPosition = this._getValidatedNumber(position, 'position', METHODS.PAUSE_AT);
		return this._invokeWithSessionExpectSuccess(METHODS.PAUSE_AT, sessionId, { position: validPosition });
	}

	setRateAndSeek(sessionId, rate, position) {
		const validRate = this._getValidatedNumber(rate, 'rate', METHODS.SET_RATE_AND_SEEK);
		const validPosition = this._getValidatedNumber(position, 'position', METHODS.SET_RATE_AND_SEEK);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_RATE_AND_SEEK, sessionId, {
			rate: validRate,
			position: validPosition
		});
	}

	getState(sessionId) {
		return this._invokeWithSession(METHODS.GET_STATE, sessionId, {});
	}

	getPlaybackPosition(sessionId) {
		return this._invokeWithSession(METHODS.GET_PLAYBACK_POSITION, sessionId, {});
	}
	getPlaybackDuration(sessionId) {
		return this._invokeWithSession(METHODS.GET_PLAYBACK_DURATION, sessionId, {});
	}
	getPlaybackRate(sessionId) {
		return this._invokeWithSession(METHODS.GET_PLAYBACK_RATE, sessionId, {});
	}

	closeSession(sessionId) {
		return this._invokeWithSessionExpectSuccess(METHODS.CLOSE_SESSION, sessionId, {}).then((result) => {
			this.activeSessionId = null;
			return result;
		});
	}

	isLive(sessionId) {
		return this._invokeWithSession(METHODS.IS_LIVE, sessionId, {});
	}
	setVideoMute(sessionId, mute) {
		const validMute = this._getValidatedBoolean(mute, 'muted', METHODS.SET_VIDEO_MUTE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_VIDEO_MUTE, sessionId, { muted: validMute });
	}
	getVideoMute(sessionId) {
		return this._invokeWithSession(METHODS.GET_VIDEO_MUTE, sessionId, {});
	}
	setAudioVolume(sessionId, volume) {
		const validVolume = this._getValidatedNumber(volume, 'volume', METHODS.SET_AUDIO_VOLUME);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_AUDIO_VOLUME, sessionId, { volume: validVolume });
	}
	getAudioVolume(sessionId) {
		return this._invokeWithSession(METHODS.GET_AUDIO_VOLUME, sessionId, {});
	}
	getAudioLanguage(sessionId) {
		return this._invokeWithSession(METHODS.GET_AUDIO_LANGUAGE, sessionId, {});
	}
	getAvailableAudioTracks(sessionId) {
		return this._invokeWithSession(METHODS.GET_AVAILABLE_AUDIO_TRACKS, sessionId, {});
	}
	setAudioTrack(sessionId, track) {
		const validTrack = this._getValidatedNumber(track, 'trackId', METHODS.SET_AUDIO_TRACK);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_AUDIO_TRACK, sessionId, { trackId: validTrack });
	}
	getAudioTrack(sessionId) {
		return this._invokeWithSession(METHODS.GET_AUDIO_TRACK, sessionId, {});
	}
	getAudioTrackInfo(sessionId) {
		return this._invokeWithSession(METHODS.GET_AUDIO_TRACK_INFO, sessionId, {});
	}
	setSubtitleMute(sessionId, mute) {
		const validMute = this._getValidatedBoolean(mute, 'muted', METHODS.SET_SUBTITLE_MUTE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_SUBTITLE_MUTE, sessionId, { muted: validMute });
	}
	getAvailableTextTracks(sessionId) {
		return this._invokeWithSession(METHODS.GET_AVAILABLE_TEXT_TRACKS, sessionId, {});
	}
	setTextTrack(sessionId, track) {
		const validTrack = this._getValidatedNumber(track, 'trackId', METHODS.SET_TEXT_TRACK);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_TEXT_TRACK, sessionId, { trackId: validTrack });
	}
	getTextTrack(sessionId) {
		return this._invokeWithSession(METHODS.GET_TEXT_TRACK, sessionId, {});
	}
	getVideoBitrate(sessionId) {
		return this._invokeWithSession(METHODS.GET_VIDEO_BITRATE, sessionId, {});
	}
	setVideoBitrate(sessionId, bitrate) {
		const validBitrate = this._getValidatedNumber(bitrate, 'bitrate', METHODS.SET_VIDEO_BITRATE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_VIDEO_BITRATE, sessionId, { bitrate: validBitrate });
	}
	getVideoBitrates(sessionId) {
		return this._invokeWithSession(METHODS.GET_VIDEO_BITRATES, sessionId, {});
	}
	setInitialBitrate(sessionId, bitrate) {
		const validBitrate = this._getValidatedNumber(bitrate, 'bitrate', METHODS.SET_INITIAL_BITRATE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_INITIAL_BITRATE, sessionId, { bitrate: validBitrate });
	}
	getInitialBitrate(sessionId) {
		return this._invokeWithSession(METHODS.GET_INITIAL_BITRATE, sessionId, {});
	}
	setMinimumBitrate(sessionId, bitrate) {
		const validBitrate = this._getValidatedNumber(bitrate, 'bitrate', METHODS.SET_MINIMUM_BITRATE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_MINIMUM_BITRATE, sessionId, { bitrate: validBitrate });
	}
	getMinimumBitrate(sessionId) {
		return this._invokeWithSession(METHODS.GET_MINIMUM_BITRATE, sessionId, {});
	}
	setMaximumBitrate(sessionId, bitrate) {
		const validBitrate = this._getValidatedNumber(bitrate, 'bitrate', METHODS.SET_MAXIMUM_BITRATE);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_MAXIMUM_BITRATE, sessionId, { bitrate: validBitrate });
	}
	getMaximumBitrate(sessionId) {
		return this._invokeWithSession(METHODS.GET_MAXIMUM_BITRATE, sessionId, {});
	}
	setLicenseServerURL(sessionId, url) {
		const validUrl = this._getValidatedString(url, 'url', METHODS.SET_LICENSE_SERVER_URL);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_LICENSE_SERVER_URL, sessionId, { url: validUrl });
	}
	getDRM(sessionId) {
		return this._invokeWithSession(METHODS.GET_DRM, sessionId, {});
	}
	setPreferredDRM(sessionId, drm) {
		const validDrm = this._getValidatedString(drm, 'drmType', METHODS.SET_PREFERRED_DRM);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_PREFERRED_DRM, sessionId, { drmType: validDrm });
	}

	configureSession(sessionId, config) {
		if (config === undefined || config === null) {
			throw new Error('Invalid parameters for configureSession method');
		}
		return this._invokeWithSessionExpectSuccess(METHODS.CONFIGURE_SESSION, sessionId, { config });
	}

	getAAMPConfig(sessionId) {
		return this._invokeWithSessionRequiredKey(METHODS.GET_AAMP_CONFIG, sessionId, 'config', {});
	}

	setAppName(sessionId, appName) {
		const validName = this._getValidatedString(appName, 'name', METHODS.SET_APP_NAME);
		return this._invokeWithSessionExpectSuccess(METHODS.SET_APP_NAME, sessionId, { name: validName });
	}

	setPreferredLanguages(sessionId, languages) {
		const validSessionId = this._getValidatedSessionId(sessionId, METHODS.SET_PREFERRED_LANGUAGES);
		if (!languages || typeof languages !== 'object') {
			throw new Error("Invalid parameter 'languages' for setPreferredLanguages method");
		}
		const payload = { sessionId: validSessionId };
		if (typeof languages.languageList === 'string') payload.languageList = languages.languageList;
		if (typeof languages.rendition === 'string') payload.rendition = languages.rendition;
		if (typeof languages.type === 'string') payload.type = languages.type;
		if (typeof languages.codecList === 'string') payload.codecList = languages.codecList;
		if (typeof languages.labelList === 'string') payload.labelList = languages.labelList;
		return this._invokeExpectSuccess(METHODS.SET_PREFERRED_LANGUAGES, payload);
	}
	getPreferredLanguages(sessionId) {
		return this._invokeWithSession(METHODS.GET_PREFERRED_LANGUAGES, sessionId, {});
	}

	async destroy() {
		if (this.isRegisteredForEvents && this.socket && this.socket.readyState === WebSocket.OPEN) {
			try {
				await this._unregisterFromServerEvents();
			} catch (error) {
				this.WARN(LOGTAG + 'Failed to unregister events during destroy: ' + (error && error.message ? error.message : String(error)));
			}
		}

		if (this.socket) {
			this.socket.onclose = null;
			this.socket.onerror = null;
			this.socket.onmessage = null;
			this.socket.close();
			this.socket = null;
		}
		this.pending.forEach(({ reject, timeoutId }) => {
			clearTimeout(timeoutId);
			reject(new Error('IPAPlayer destroyed'));
		});
		this.pending.clear();
		this.listeners.clear();
		this.isRegisteredForEvents = false;
		this.pendingRegisterPromise = null;
		this.pendingUnregisterPromise = null;
		this.activeSessionId = null;
		this.isOpen = false;
	}
}

export default IPAPlayerRPC;
