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
    console.log('Xcast constructor');
    this._events = new Map();
  }

  /**
   * Function to activate the Xcast plugin
   */
  activate() {
    return new Promise((resolve, reject) => {
      this.callsign = 'org.rdk.Xcast';
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(result => {
          console.log('Xcast activation success ' + result);
          this._thunder
            .call('org.rdk.Xcast', 'setEnabled', { enabled: true })
            .then(result => {
              if (result.success) {
                console.log('Xcast enabled');
                this._thunder.on(this.callsign, 'onApplicationLaunchRequest', notification => {
                  console.log('onApplicationLaunchRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationLaunchRequest')) {
                    this._events.get('onApplicationLaunchRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationHideRequest', notification => {
                  console.log('onApplicationHideRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationHideRequest')) {
                    this._events.get('onApplicationHideRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationResumeRequest', notification => {
                  console.log('onApplicationResumeRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationResumeRequest')) {
                    this._events.get('onApplicationResumeRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStopRequest', notification => {
                  console.log('onApplicationStopRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationStopRequest')) {
                    this._events.get('onApplicationStopRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStateRequest', notification => {
                  // console.log('onApplicationStateRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationStateRequest')) {
                    this._events.get('onApplicationStateRequest')(notification);
                  }
                });
                resolve(true);
              } else {
                console.log('Xcast enabled failed');
              }
            })
            .catch(err => {
              console.error('Enabling failure', err);
              Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Xcast enable  " + JSON.stringify(err), false, null)
              reject('Xcast enabling failed', err);
            });
        })
        .catch(err => {
          console.error('Activation failure', err);
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Controller Xcast activate "+JSON.stringify(err), false, null)
          reject('Xcast activation failed', err);
        });
    });
  }

  getEnabled() {
    return new Promise((resolve, reject) => {
      this._thunder.call('org.rdk.Xcast', 'getEnabled')
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          console.log('Xdial error', err)
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while fetching Thunder Xcast enable status"+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  getFriendlyName() {
    return new Promise((resolve, reject) => {
      this._thunder.call('org.rdk.Xcast', 'getFriendlyName')
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          console.log('Xdial getFriendlyName error', err);
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while getting Thunder Xcast FriendlyName "+JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }
  setFriendlyName(name) {
    return new Promise((resolve) => {
      this._thunder.call('org.rdk.Xcast', 'setFriendlyName', { friendlyname: name }).then(result => {
        console.log("Xcast setFriendlyName: " + name + " result: ", JSON.stringify(result))
        resolve(result);
      }).catch(err => { 
        console.error(err); resolve(false); 
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while setting Thunder Xcast FriendlyName "+JSON.stringify(err), false, null)
      });
    }).then(val => {
      console.log("The resolved value is:", val);
    })
      .catch(error => {
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "An error occurred: "+JSON.stringify(err), false, null)
        console.error("An error occurred:", error);
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
      this._thunder.call('org.rdk.Xcast', 'setEnabled', { enabled: false })
        .then(res => {
          resolve(res.success)
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error while setting Thunder Xcast enable "+JSON.stringify(err), false, null)
          console.log('Failed to close Xcast', err)
        })
    })
  }

  /**
   * Function to notify the state of the app.
   */
  onApplicationStateChanged(params) {
    return new Promise((resolve) => {
      this._thunder.call('org.rdk.Xcast.1', 'onApplicationStateChanged', params).then(result => {
        //console.log("XCastAPI onApplicationStateChanged Updating: "+ JSON.stringify(params) +" result: ",JSON.stringify(result))
        resolve(result);
      }).catch(err => { 
        console.error(err); resolve(false);
        Metrics.error(Metrics.ErrorType.OTHER,"XcastApiError", "Error in Thunder Xcast.1 onApplicationStateChange "+JSON.stringify(err), false, null)
      });
    });
  }

  static supportedApps() {
    let xcastApps = { AmazonInstantVideo: 'Amazon', YouTube: 'YouTube', NetflixApp: 'Netflix', YouTubeTV: "YouTubeTV" };
    return xcastApps;
  }
}
