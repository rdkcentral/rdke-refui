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

let instance = null

export default class Network {
  constructor() {
    this._thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.Network';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  static get() {
    if (instance === null) {
      instance = new Network()
      // Vital plugins; always keep activated.
      instance.activate();
    }
    return instance;
  }

  activate() {
    return new Promise((resolve, reject) => {
      this._thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " activate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " activate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error while Thunder Controller Network activate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  deactivate() {
    return new Promise((resolve, reject) => {
      this._thunder.call('Controller', 'deactivate', { callsign: this.callsign }).then(result => {
        this.INFO(this.callsign + " deactivate result:" + result)
        resolve(true)
      }).catch(err => {
        this.ERR(this.callsign + " deactivate error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error while Thunder Controller Network deactivate "+JSON.stringify(err), false, null)
        reject(err)
      });
    });
  }

  getDefaultInterface() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getDefaultInterface').then(result => {
        this.INFO(this.callsign + " getDefaultInterface result: " + result)
        if (result.success) resolve(result.interface)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " getDefaultInterface error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getDefaultInterface "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getInterfaces() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getInterfaces').then(result => {
        this.INFO(this.callsign + " getInterfaces result: " + result)
        if (result.success) {
          resolve(result.interfaces)
        }
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + " getInterfaces error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getInterfaces "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getIPSettings(interfaceName, ipversion = "IPv4") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getIPSettings', { "interface": interfaceName, "ipversion": ipversion }).then(result => {
        this.INFO(this.callsign + "[getIPSettings] result: " + result)
        if (result.success) {
          resolve(result);
        }
        reject(false);
      }).catch(err => {
        this.ERR(this.callsign + "[getIPSettings] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getIPSettings "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getNamedEndpoints() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getNamedEndpoints').then(result => {
        this.INFO(this.callsign + "[getNamedEndpoints] result: " + result)
        if (result.success) resolve(result.endpoints);
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getNamedEndpoints] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getNamedEndpoints "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getQuirks() {
    return new Promise((resolve, reject) => {
      // TODO: unknown usecase.
      reject(false)
    })
  }

  getStbIp() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getStbIp').then(result => {
        this.INFO(this.callsign + "[getStbIp] result: " + JSON.stringify(result))
        if (result.success) {
          resolve(result.ip)
        }
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getStbIp] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getStbIp result "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getSTBIPFamily(family = "AF_INET") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getSTBIPFamily', { "family": family }).then(result => {
        this.INFO(this.callsign + "[getSTBIPFamily] result: " + result)
        if (result.success) { resolve(result) }
        reject(false);
      }).catch(err => {
        this.ERR(this.callsign + "[getSTBIPFamily] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getSTBIPFamily "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setConnectivityTestEndpoints(endpoints = []) {
    return new Promise((resolve, reject) => {
      if (!endpoints.length) reject(false)
      this._thunder.call(this.callsign, 'setConnectivityTestEndpoints', { endpoints: endpoints }).then(result => {
        this.INFO(this.callsign + "[setConnectivityTestEndpoints] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setConnectivityTestEndpoints] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network setConnectivityTestEndpoints "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  isConnectedToInternet() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'isConnectedToInternet').then(result => {
        this.LOG(this.callsign + "[isConnectedToInternet] result: " + JSON.stringify(result))
        if (result.success) resolve(result.connectedToInternet)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[isConnectedToInternet] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network isConnectedToInternet "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getinternetconnectionstate() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getInternetConnectionState').then(result => {
        this.INFO(this.callsign + "[getinternetconnectionstate] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getinternetconnectionstate] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getInternetConnectionState "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getCaptivePortalURI() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getCaptivePortalURI').then(result => {
        this.INFO(this.callsign + "[getCaptivePortalURI] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getCaptivePortalURI] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getCaptivePortalURI "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  startConnectivityMonitoring(intervalInSec = 30) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'startConnectivityMonitoring', { "interval": intervalInSec }).then(result => {
        this.INFO(this.callsign + "[startConnectivityMonitoring] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[startConnectivityMonitoring] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network startConnectivityMonitoring "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  stopConnectivityMonitoring() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'stopConnectivityMonitoring').then(result => {
        this.INFO(this.callsign + "[stopConnectivityMonitoring] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[stopConnectivityMonitoring] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network stopConnectivityMonitoring "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  isInterfaceEnabled(interfaceName = "WIFI") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'isInterfaceEnabled', { "interface": interfaceName }).then(result => {
        this.INFO(this.callsign + "[isInterfaceEnabled]" + interfaceName + " result: " + JSON.stringify(result))
        if (result.success) resolve(result.enabled)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[isInterfaceEnabled] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network isInterfaceEnabled "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  ping(endpoint = "8.8.8.8", packets = 10, guid = "2c6ff543-d929-4be4-a0d8-9abae2ca7471") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'ping', { "endpoint": endpoint, "packets": packets, "guid": guid }).then(result => {
        this.INFO(this.callsign + "[ping] result: " + result)
        if (result.success) resolve(result)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[ping] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network ping "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  pingNamedEndpoint(endpointName = "CMTS", packets = 15, guid = "2c6ff543-d929-4be4-a0d8-9abae2ca7471") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'pingNamedEndpoint', { "endpointName": endpointName, "packets": packets, "guid": guid }).then(result => {
        this.INFO(this.callsign + "[pingNamedEndpoint] result: " + result)
        if (result.success) resolve(result)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[pingNamedEndpoint] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network pingNamedEndpoint "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setDefaultInterface(interfaceName = "ETHERNET", persist = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setDefaultInterface', { "interface": interfaceName, "persist": persist }).then(result => {
        this.INFO(this.callsign + "[setDefaultInterface] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setDefaultInterface] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network setDefaultInterface "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setInterfaceEnabled(interfaceName, enabled = true, persist = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setInterfaceEnabled', { "interface": interfaceName, "enabled": enabled, "persist": persist }).then(result => {
        this.INFO(this.callsign + "[setInterfaceEnabled] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setInterfaceEnabled] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network setInterfaceEnabled "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setIPSettings(IPSettings) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setIPSettings', IPSettings).then(result => {
        this.INFO(this.callsign + "[setIPSettings] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setIPSettings] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network setIPSettings "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getPublicIP(iface = "ETHERNET", ipv6 = false) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getPublicIP', { "iface": iface, "ipv6": ipv6 }).then(result => {
        this.INFO(this.callsign + "[getPublicIP] result: " + result)
        if (result.success) resolve(result.public_ip)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getPublicIP] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network getPublicIP "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setStunEndPoint(server = "global.stun.twilio.com", port = 3478, sync = true, timeout = 30, cache_timeout = 0) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setStunEndPoint', {
        "server": server,
        "port": port,
        "sync": sync,
        "timeout": timeout,
        "cache_timeout": cache_timeout
      }).then(result => {
        this.INFO(this.callsign + "[setStunEndPoint] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setStunEndPoint] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network setStunEndPoint "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  configurePNI(disableConnectivityTest = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'configurePNI', { "disableConnectivityTest": disableConnectivityTest }).then(result => {
        this.INFO(this.callsign + "[configurePNI] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[configurePNI] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network configurePNI "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  trace(endpoint = "8.8.8.8", packets = 15) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'trace', { endpoint: endpoint, packets: packets }).then(result => {
        this.INFO(this.callsign + "[trace] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[trace] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network trace "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  traceNamedEndpoint(endpointName = "CMTS", packets = 15) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'trace', { "endpointName": endpointName, "packets": packets }).then(result => {
        this.INFO(this.callsign + "[traceNamedEndpoint] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[traceNamedEndpoint] error: " + err)
        Metrics.error(Metrics.ErrorType.NETWORK,"NetworkApiError", "Error in Thunder Network traceNamedEndpoint "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }
}
