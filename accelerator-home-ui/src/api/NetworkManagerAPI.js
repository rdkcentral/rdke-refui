/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2025 RDK Management
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
import { Metrics } from "@firebolt-js/sdk"

class NetworkManager {
  constructor() {
    this._events = new Map();
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.NetworkManager';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  registerEvent = (eventId, callback) => {
    this._events.set(eventId, callback)
  }

  thunderCall = (infoMessage, method, params = {}, property) => {
    return new Promise((resolve, reject) => {
      this.INFO('info', `NetworkManager: ${infoMessage}.`);
      this.thunder.call(this.callsign, method, params)
        .then(result => {
          this.LOG('info', `NetworkManager: ${infoMessage}: ${JSON.stringify(params)} result: ${JSON.stringify(result)}`);
          if (result.success) {
            if (property === 'result') {
              resolve(result);
            } else {
              resolve(property ? result[property] : result.success);
            }
          } else {
            this.ERR('error', `NetworkManager: Error ${infoMessage} ${JSON.stringify(params)} result: ${JSON.stringify(result)}`);
            Metrics.error(Metrics.ErrorType.OTHER, "NetworkManagerError", `Error ${infoMessage} ${JSON.stringify(params)} result: ${JSON.stringify(result)}`, false, null)
            reject(result.success);
          }
        })
        .catch(err => {
          this.ERR('error', `NetworkManager: Error ${infoMessage} ${err}`);
          reject(err);
        });
    });
  }
  activate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " NetworkManager activate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " NetworkManager activate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkManagerError", "Error while Thunder Controller NetworkManager activate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this.thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " NetworkManager deactivate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " NetworkManager deactivate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkManagerError", "Error while Thunder Controller NetworkManager deactivate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  GetAvailableInterfaces =() => this.thunderCall('GetAvailableInterfaces', 'GetAvailableInterfaces', {}, 'result');
  GetPrimaryInterface =() => this.thunderCall('GetPrimaryInterface', 'GetPrimaryInterface', {}, 'Interface');
  SetPrimaryInterface =(Interface) => this.thunderCall('SetPrimaryInterface', 'SetPrimaryInterface', {Interface} );
  SetInterfaceState =(Interface,enabled) => this.thunderCall('SetInterfaceState', 'SetInterfaceState', {Interface,enabled} );
  GetInterfaceState =(Interface) => this.thunderCall('GetInterfaceState', 'GetInterfaceState', {Interface}, );
  GetIPSettings =(Interface,ipversion) => this.thunderCall('GetIPSettings', 'GetIPSettings', {Interface,ipversion}, 'result');
  SetIPSettings =(Interface,ipversion,autoconfig,ipaddress,prefix,gateway,primarydns,secondarydns) => this.thunderCall('SetIPSettings', 'SetIPSettings', {Interface,ipversion,autoconfig,ipaddress,prefix,gateway,primarydns,secondarydns}, );
  GetStunEndpoint =() => this.thunderCall('GetStunEndpoint', 'GetStunEndpoint', {}, 'result');
  SetStunEndpoint =(endPoint,port,bindTimeout,cacheTimeout) => this.thunderCall('SetStunEndpoint', 'SetStunEndpoint', {endPoint,port,bindTimeout,cacheTimeout} );
  GetConnectivityTestEndpoints =() => this.thunderCall('GetConnectivityTestEndpoints', 'GetConnectivityTestEndpoints', {}, 'result');
  SetConnectivityTestEndpoints =(endpoints) => this.thunderCall('SetConnectivityTestEndpoints', 'SetConnectivityTestEndpoints', {endpoints} );
  IsConnectedToInternet =(ipversion) => this.thunderCall('IsConnectedToInternet', 'IsConnectedToInternet', {ipversion}, 'result');
  GetCaptivePortalURI =() => this.thunderCall('GetCaptivePortalURI', 'GetCaptivePortalURI', {}, 'result');
  StartConnectivityMonitoring =(interval) => this.thunderCall('StartConnectivityMonitoring', 'StartConnectivityMonitoring', {interval});
  StopConnectivityMonitoring =() => this.thunderCall('StopConnectivityMonitoring', 'StopConnectivityMonitoring', {});
  GetPublicIP =(ipversion) => this.thunderCall('GetPublicIP', 'GetPublicIP', {ipversion}, 'result');
  Ping =(endpoint,ipversion,noOfRequest,timeout,guid) => this.thunderCall('Ping', 'Ping', {endpoint,ipversion,noOfRequest,timeout,guid}, 'result');
  Trace =(endpoint,ipversion,noOfRequest,guid) => this.thunderCall('Trace', 'Trace', {endpoint,ipversion,noOfRequest,guid}, 'result');
  StartWiFiScan =(frequency) => this.thunderCall('StartWiFiScan', 'StartWiFiScan', {frequency});
  StopWiFiScan =() => this.thunderCall('StopWiFiScan', 'StopWiFiScan', {});
  GetKnownSSIDs =() => this.thunderCall('GetKnownSSIDs', 'GetKnownSSIDs', {}, 'result');
  AddToKnownSSIDs =(ssid,passphrase,securityMode) => this.thunderCall('AddToKnownSSIDs', 'AddToKnownSSIDs', {ssid,passphrase,securityMode});
  RemoveKnownSSID =(ssid) => this.thunderCall('RemoveKnownSSID', 'RemoveKnownSSID', {ssid});
  WiFiConnect =(ssid,passphrase,securityMode) => this.thunderCall('WiFiConnect', 'WiFiConnect', {ssid,passphrase,securityMode});
  WiFiDisconnect =() => this.thunderCall('WiFiDisconnect', 'WiFiDisconnect', {});
  GetConnectedSSID =() => this.thunderCall('GetConnectedSSID', 'GetConnectedSSID', {}, 'result');
  StartWPS =(method,wps_pin) => this.thunderCall('StartWPS', 'StartWPS', {method,wps_pin},'result');
  StopWPS =() => this.thunderCall('StopWPS', 'StopWPS', {});
  GetWiFiSignalStrength =() => this.thunderCall('GetWiFiSignalStrength', 'GetWiFiSignalStrength', {}, 'result');
  GetSupportedSecurityModes =() => this.thunderCall('GetSupportedSecurityModes', 'GetSupportedSecurityModes', {}, 'result');
  SetLogLevel =(logLevel) => this.thunderCall('SetLogLevel', 'SetLogLevel', {logLevel} );
  GetWifiState =() => this.thunderCall('GetWifiState', 'GetWifiState', {});
}

const NetworkManagerInstance = new NetworkManager();
export default NetworkManagerInstance;
