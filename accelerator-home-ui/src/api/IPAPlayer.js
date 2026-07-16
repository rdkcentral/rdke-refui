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

class IPAPlayerRPC {
	constructor() {
		this.pending = new Map();
		this.pendingOrder = [];
		this.INFO = console.info;
		this.LOG = console.log;
		this.ERR = console.error;
		this.WARN = console.warn;
		this.WARN("IPAPlayerRPC initialized. Connecting to IPAPlayer backend at " + wsUrl);
		this.activeSessionId = null;
		this.pendingOpenSessionPromise = null;
		this.socket = new WebSocket(wsUrl);
		this.isOpen = false;
		this.rpcId = 0;
		let _resolveOpen, _rejectOpen;
		this._openPromise = new Promise((resolve, reject) => { _resolveOpen = resolve; _rejectOpen = reject; });
		this.socket.onopen = () => {
			this.isOpen = true;
			_resolveOpen();
			this.LOG('WebSocket connection established with IPAPlayer backend at ' + wsUrl);
		}
		this.socket.onmessage = (event) => {
			this._handleIncomingMessage(event);
		}
		this.socket.onerror = (event) => {
			try { _rejectOpen(new Error('WebSocket error')); } catch(e) {}
			this.ERR('WebSocket error with IPAPlayer backend at ' + wsUrl + ': ' + (event && event.message ? event.message : 'unknown error'));
		}
		this.socket.onclose = () => {
			this.isOpen = false;
			this.activeSessionId = null;
			this.pendingOpenSessionPromise = null;
			this.pending.forEach(({ reject }) => {
				reject(new Error('WebSocket connection closed'));
			});
			this.pending.clear();
			this.pendingOrder = [];
			this.ERR('WebSocket connection closed with IPAPlayer backend at ' + wsUrl);
		}
	}

	_normalizeResponse(response) {
		if (response && response.result !== undefined) {
			return response.result;
		}
		return response;
	}

	_removePendingId(id) {
		const index = this.pendingOrder.indexOf(id);
		if (index !== -1) {
			this.pendingOrder.splice(index, 1);
		}
	}

	_handleIncomingMessage(event) {
		let response = null;
		try {
			response = JSON.parse(event.data);
		} catch (error) {
			this.ERR('Failed to parse IPAPlayer response: ' + (error && error.message ? error.message : String(error)));
			return;
		}

		let pendingId = null;
		if (response && Object.prototype.hasOwnProperty.call(response, 'id') && this.pending.has(response.id)) {
			pendingId = response.id;
			this._removePendingId(pendingId);
		} else {
			pendingId = this.pendingOrder.shift();
		}

		if (pendingId === undefined || pendingId === null || !this.pending.has(pendingId)) {
			this.WARN && this.WARN('Received IPAPlayer response without a matching pending request: ' + JSON.stringify(response));
			return;
		}

		const pendingRequest = this.pending.get(pendingId);
		this.pending.delete(pendingId);

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

	sendRpc(method, params) {
		return new Promise((resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				reject(new Error("WebSocket is not connected"));
				return;
			}

			const payload = {
				jsonrpc: "2.0",
				id : this.rpcId++,
				method,
				params
			};

			this.pending.set(payload.id, { resolve, reject });
			this.pendingOrder.push(payload.id);
			this.socket.send(JSON.stringify(payload));
			setTimeout(() => {
				if (this.pending.has(payload.id)) {
					this.pending.delete(payload.id);
					this._removePendingId(payload.id);
					reject(new Error(`Request timed out for method: ${method}`));
				}
			}, 5000);
		});
	}

	openSession(instanceId, displayId) {
		if (this.activeSessionId) {
			return Promise.resolve({ status: true, sessionId: this.activeSessionId, reused: true });
		}
		if (this.pendingOpenSessionPromise) {
			return this.pendingOpenSessionPromise;
		}

		this.pendingOpenSessionPromise = new Promise(async (resolve, reject) => {
			try {
				await this._openPromise;
			} catch (err) {
				reject(err);
				return;
			}
			if (!instanceId || !displayId) {
				reject(new Error("Invalid parameters for openSession method"));
				return;
			}
			await this.sendRpc("org.rdk.player.openSession", {
				instanceId: instanceId.trim(),
				displayId: displayId.trim()
			}).then((response) => {
				this.LOG(`openSession response: ${JSON.stringify(response)}`);
				const result = this._normalizeResponse(response);
				if (result && result.status && result.sessionId) {
					this.activeSessionId = result.sessionId;
					resolve(result);
				} else {
					reject(new Error((result && result.message) || "Invalid response from server"));
				}
			}).catch((error) => {
				reject(error);
			});
		}).finally(() => {
			this.pendingOpenSessionPromise = null;
		});

		return this.pendingOpenSessionPromise;
	}

	configureSession(sessionId, config) {
		return new Promise(async (resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				reject(new Error("WebSocket is not connected"));
				return;
			}
			if (!sessionId || !config) {
				reject(new Error("Invalid parameters for configureSession method"));
				return;
			}
			await this.sendRpc("org.rdk.player.configureSession", {
				sessionId: sessionId.trim(),
				config: config
			}).then((response) => {
				this.LOG(`configureSession response: ${JSON.stringify(response)}`);
				const result = this._normalizeResponse(response);
				if (result && result.status) {
					resolve(result);
				} else {
					reject(new Error((result && result.message) || "Invalid response from server"));
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}


	play(sessionId, url) {
		return new Promise(async (resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				reject(new Error("WebSocket is not connected"));
				return;
			}
			if (!sessionId || !url) {
				reject(new Error("Invalid parameters for play method"));
				return;
			}
			await this.sendRpc("org.rdk.player.play", {
				sessionId: sessionId.trim(),
				url: url.trim()
			}).then((response) => {
				this.LOG(`play response: ${JSON.stringify(response)}`);
				const result = this._normalizeResponse(response);
				if (result && result.status) {
					resolve(result);
				} else {
					reject(new Error((result && result.message) || "Invalid response from server"));
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	stop(sessionId) {
		return new Promise(async (resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				reject(new Error("WebSocket is not connected"));
				return;
			}
			if (!sessionId) {
				reject(new Error("Invalid parameters for stop method"));
				return;
			}
			await this.sendRpc("org.rdk.player.stop", {
				sessionId: sessionId.trim()
			}).then((response) => {
				this.LOG(`stop response: ${JSON.stringify(response)}`);
				const result = this._normalizeResponse(response);
				if (result && result.status) {
					resolve(result);
				} else {
					reject(new Error((result && result.message) || "Invalid response from server"));
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	closeSession(sessionId) {
		return new Promise(async (resolve, reject) => {
			if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
				reject(new Error("WebSocket is not connected"));
				return;
			}
			if (!sessionId) {
				reject(new Error("Invalid parameters for closeSession method"));
				return;
			}
			await this.sendRpc("org.rdk.player.closeSession", {
				sessionId: sessionId.trim()
			}).then((response) => {
				this.LOG(`closeSession response: ${JSON.stringify(response)}`);
				const result = this._normalizeResponse(response);
				if (result && result.status) {
					this.activeSessionId = null;
					resolve(result);
				} else {
					reject(new Error((result && result.message) || "Invalid response from server"));
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	destroy() {
		if (this.socket) {
			this.socket.onclose = null;
			this.socket.onerror = null;
			this.socket.onmessage = null;
			this.socket.close();
			this.socket = null;
		}
		this.pending.forEach(({ reject }) => reject(new Error('IPAPlayer destroyed')));
		this.pending.clear();
		this.pendingOrder = [];
		this.activeSessionId = null;
		this.pendingOpenSessionPromise = null;
		this.isOpen = false;
	}
}

export default IPAPlayerRPC;
