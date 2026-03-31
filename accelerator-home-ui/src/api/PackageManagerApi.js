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
import { ThunderError } from './ThunderError';

let instance = null;

export default class PackageManager {
  static get() {
    if (instance === null) {
      instance = new PackageManager()
    }

    return instance;
  }

  constructor() {
    this.thunder = ThunderJS(CONFIG.thunderConfig);
    this.callsign = 'org.rdk.PackageManagerRDKEMS';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  handleThunderError(thunderCall, thunderErr) {
    const err = new ThunderError(thunderCall, thunderErr);
    const errString = err.toString();
    this.ERR(errString);
    Metrics.error(Metrics.ErrorType.OTHER, "PackageManagerRDKEMS", errString, false, null)

    throw err;
  }

  activate() {
    return this.thunder.Controller.activate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("PackageManagerRDKEMS activated");
      return true;
    }).catch(err => {
      this.handleThunderError(`activate(${this.callsign})`, err);
    });
  }

  deactivate() {
    return this.thunder.Controller.deactivate(
      { callsign: this.callsign }
    ).then(() => {
      this.INFO("PackageManagerRDKEMS deactivated");
      return true;
    }).catch(err => {
      this.handleThunderError(`deactivate(${this.callsign})`, err);
    });
  }

  configuration() {
    const thunderCall = `configuration@${this.callsign}`;

    return this.thunder.Controller[thunderCall](
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  listPackages() {
    const thunderCall = "listPackages";

    return this.thunder.call(
      this.callsign, thunderCall
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result.packages ?? result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  getStorageDetails(packageId, version) {
    const thunderCall = "getStorageDetails";

    return this.thunder.call(
      this.callsign, thunderCall,
      /* ThunderJS treats "version" as its own parameter.
         To forward a version to the remote function, use "versionAsParameter". */
      { packageId, "versionAsParameter": version }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  config(packageId, version) {
    const thunderCall = "config";

    return this.thunder.call(
      this.callsign, thunderCall,
      /* ThunderJS treats "version" as its own parameter.
         To forward a version to the remote function, use "versionAsParameter". */
      { packageId, "versionAsParameter": version }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  uninstall(packageId) {
    const thunderCall = "uninstall";

    return this.thunder.call(
      this.callsign, thunderCall,
      { packageId }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  install(packageId, version, fileLocator) {
    const thunderCall = "install";

    return this.thunder.call(
      this.callsign, thunderCall,
      /* ThunderJS treats "version" as its own parameter.
         To forward a version to the remote function, use "versionAsParameter". */
      { packageId, "versionAsParameter": version, fileLocator }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }

  packageState(packageId, version) {
    const thunderCall = "packageState";

    return this.thunder.call(
      this.callsign, thunderCall,
      /* ThunderJS treats "version" as its own parameter.
         To forward a version to the remote function, use "versionAsParameter". */
      { packageId, "versionAsParameter": version }
    ).then(result => {
      this.LOG(thunderCall, " result:", JSON.stringify(result));
      return result;
    }).catch(err => {
      this.handleThunderError(thunderCall, err);
    });
  }
}
