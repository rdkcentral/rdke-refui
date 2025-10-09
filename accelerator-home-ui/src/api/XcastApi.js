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

import ThunderJS from 'ThunderJS';
import { CONFIG } from '../Config/Config'
import { Metrics } from '@firebolt-js/sdk';

/**
 * Class for Xcast thunder plugin apis.
 */
export default class XcastApi {
  constructor() {
    this._thunder = ThunderJS(CONFIG.thunderConfig);
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
    this.callsign = "org.rdk.Xcast";
    this.LOG("Xcast constructor");
    this._events = new Map();
  }

  /**
   * Function to activate the Xcast plugin
   */
  activate() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(result => {
          this.LOG("Xcast activation success " + JSON.stringify(result));
          this._thunder
            .call(this.callsign, 'setEnabled', { enabled: true })
            .then(result => {
              if (result.success) {
                this.LOG("Xcast enabled");
                this._thunder.on(this.callsign, 'onApplicationLaunchRequest', notification => {
                  this.LOG("onApplicationLaunchRequest " + JSON.stringify(notification));
                  if (this._events.has('onApplicationLaunchRequest')) {
                    this._events.get('onApplicationLaunchRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationHideRequest', notification => {
                  this.LOG("onApplicationHideRequest " + JSON.stringify(notification));
                  if (this._events.has('onApplicationHideRequest')) {
                    this._events.get('onApplicationHideRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationResumeRequest', notification => {
                  this.LOG("onApplicationResumeRequest " + JSON.stringify(notification));
                  if (this._events.has('onApplicationResumeRequest')) {
                    this._events.get('onApplicationResumeRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStopRequest', notification => {
                  this.LOG("onApplicationStopRequest " + JSON.stringify(notification));
                  if (this._events.has('onApplicationStopRequest')) {
                    this._events.get('onApplicationStopRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStateRequest', notification => {
                  // this.LOG("onApplicationStateRequest " + JSON.stringify(notification));
                  if (this._events.has('onApplicationStateRequest')) {
                    this._events.get('onApplicationStateRequest')(notification);
                  }
                });
                resolve(true);
              } else {
                this.LOG("Xcast enabled failed");
              }
            })
            .catch(err => {
              this.ERR("Enabling failure: " + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Xcast enable  " + JSON.stringify(err), false, null)
              reject('Xcast enabling failed', err);
            });
        })
        .catch(err => {
          this.ERR("Activation failure: " + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Controller Xcast activate "+JSON.stringify(err), false, null)
          reject('Xcast activation failed', err);
        });
    });
  }

   setEnabled(enable) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setEnabled', { enabled: enable })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR("Xdial setEnabled error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while fetching Thunder Xcast enable status"+JSON.stringify(err), false, null)
          reject(err)
        })
    })
   }

  getEnabled() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getEnabled')
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR("Xdial error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while fetching Thunder Xcast enable status"+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  getFriendlyName() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getFriendlyName')
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR("Xdial getFriendlyName error: " + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while getting Thunder Xcast FriendlyName "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  getModelName() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getModelName')
        .then(res => {
          this.LOG("Xcast getModelName success: " + JSON.stringify(res));
          resolve(res.model)
        })
        .catch(err => {
          this.ERR("Xdial getModelName error: " + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while getting Thunder Xcast getModelName "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  setStandbyBehavior(state) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setStandbyBehavior',{ standbybehavior : state})
		  .then(res => {
			console.warn("Xcast setStandbyBehavior success: " + JSON.stringify(res));
          resolve(res)
        })
        .catch(err => {
          this.ERR("Xdial setStandbyBehavior error: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while fetching Thunder setStandbyBehavior status"+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  setFriendlyName(name) {
    return new Promise((resolve) => {
      this._thunder.call(this.callsign, 'setFriendlyName', { friendlyname: name }).then(result => {
        this.LOG("Xcast setFriendlyName: " + name + " result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR(JSON.stringify(err)); resolve(false);
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while setting Thunder Xcast FriendlyName "+JSON.stringify(err), false, null)
      });
    }).then(val => {
      this.LOG("The resolved value is: " + JSON.stringify(val));
    })
      .catch(error => {
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "An error occurred: "+JSON.stringify(error), false, null)
        this.ERR("An error occurred: " + JSON.stringify(error));
      });
  }
  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the Xcast plugin.
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback);
  }

  /**
   * Function to deactivate the Xcast plugin.
   */
  deactivate() {
	return new Promise((resolve) => {
		this._thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(res => {
			resolve(res);
		}).catch(err => {
			Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error Failed to deactivate Xcast: "+JSON.stringify(err), false, null)
			this.ERR("Failed to deactivate Xcast: " + JSON.stringify(err))
		})
	})
  }

	setApplicationState(params) {
    params.error = 'none';
		return new Promise((resolve) => {
			this._thunder.call(this.callsign, 'setApplicationState', params).then(result => {
        this.LOG("XcastAPI setApplicationState Updating: " + JSON.stringify(params) + " result: " + JSON.stringify(result))
				resolve(true);
			}).catch(err => {
				this.ERR("setApplicationState failed trying older API. error is: " + JSON.stringify(err));
				Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Xcast setApplicationState "+JSON.stringify(err), false, null)
				resolve(false);
			});
		});
	}


  /**
   * Function to notify the state of the app.
   */
  onApplicationStateChanged(params) {
    return new Promise((resolve) => {
      this._thunder.call(this.callsign, 'onApplicationStateChanged', params).then(result => {
        this.LOG("XCastAPI onApplicationStateChanged Updating: " + JSON.stringify(params) + " result: " + JSON.stringify(result))
        resolve(result);
      }).catch(err => {
        this.ERR(JSON.stringify(err)); resolve(false);
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Xcast.1 onApplicationStateChange "+JSON.stringify(err), false, null)
      });
    });
  }
  registerApplications(params){
    this.LOG("Register Application Params" + JSON.stringify(params))
    return new Promise((resolve,reject) => {
    this._thunder.call('org.rdk.Xcast', 'registerApplications',params )
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR("Xdial registerApplications error: " + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while getting Thunder Xcast registerApplications "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  static supportedApps() {
    let xcastApps = { AmazonInstantVideo: 'Amazon', YouTube: 'YouTube', Netflix: 'Netflix', YouTubeTV: "YouTubeTV" };
    return xcastApps;
  }
}
