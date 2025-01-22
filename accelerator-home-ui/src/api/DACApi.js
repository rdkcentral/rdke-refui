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

import ThunderJS from 'ThunderJS'
import HomeApi from './HomeApi';
import { Storage } from "@lightningjs/sdk";
import { CONFIG, GLOBALS } from '../Config/Config';
import LISAApi from './LISAApi';
import {Metrics} from '@firebolt-js/sdk'

let platform = null
let thunder = null

function thunderJS() {
  if (thunder)
    return thunder

  thunder = ThunderJS(CONFIG.thunderConfig)
  return thunder
}

async function registerListener(plugin, eventname, cb) {
  return await LISAApi.get().thunder.on(plugin, eventname, (notification) => {
    console.log("DACApi Received event " + plugin + ":" + eventname, notification)
    if (cb != null) {
      cb(notification, eventname, plugin)
    }
  })
}

async function addEventHandler(eventHandlers, pluginname, eventname, cb) {
  eventHandlers.push(await registerListener(pluginname, eventname, cb))
}

function translateLisaProgressEvent(evtname) {
  if (evtname === "DOWNLOADING") {
    return "Downloading"
  } else if (evtname === "UNTARING") {
    return "Extracting"
  } else if (evtname === "UPDATING_DATABASE") {
    return "Installing"
  } else if (evtname === "FINISHED") {
    return "Finished"
  } else {
    return evtname
  }
}

async function registerLISAEvents(id, progress) {
  let eventHandlers = []
  if (progress === undefined) {
    console.log("DACApi progress undefined, return")
    return
  }
  progress.reset()

  let handleProgress = (notification, eventname, plugin) => {
    console.log('DACApi handleProgress: ' + plugin + ' ' + eventname)
    if (plugin !== 'LISA') {
      return
    }
    if (notification.status === 'Progress') {
      let parts = notification.details.split(" ")
      if (parts.length >= 2) {
        let pc = parseFloat(parts[1]) / 100.0
        progress.setProgress(pc, translateLisaProgressEvent(parts[0]))
      }
    } else if (notification.status === 'Success') {
      progress.fireAncestors('$fireDACOperationFinished', true)
      eventHandlers.map(h => { h.dispose() })
      eventHandlers = []
    } else if (notification.status === 'Failed') {
      progress.fireAncestors('$fireDACOperationFinished', false, 'Failed')
      eventHandlers.map(h => { h.dispose() })
      eventHandlers = []
    }
  }
  addEventHandler(eventHandlers, 'LISA', 'operationStatus', handleProgress);
}

export const installDACApp = async (app, progress) => {
  let platName = await getPlatformNameForDAC()
  let url = app.url
  if (!Storage.get("CloudAppStore")) {
    url = app.url.replace(/ah212/g, platName)
  }

  registerLISAEvents(app.id, progress)

  let param = {
    id: app.id,
    type: 'application/dac.native',
    appName: app.name,
    category: app.category,
    versionAsParameter: app.version,
    url: url
  }

  try {
    console.info("installDACApp LISA.install with param:", JSON.stringify(param))
    app.handle = await LISAApi.get().install(param)
  } catch (error) {
    console.error('DACApi Error on installDACApp: ' + error.code + ' ' + error.message)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DACApi Error on installDACApp: '+JSON.stringify(error), true, null)
    app.errorCode = error.code;
    return false
  }
  return true
}

export const uninstallDACApp = async (app, progress) => {
  // Could be same app is running; lets end it if so.
  await thunderJS()['org.rdk.RDKShell'].getClients().then(response => {
    if (Array.isArray(response.clients) && response.clients.includes(app.id.toLowerCase())) {
      console.log("DACApi killing " + app.id + " as we got a match in getClients response.");
      thunderJS()['org.rdk.RDKShell'].kill({ client: app.id })
    }
  })

  registerLISAEvents(app.id, progress)

  let param = {
    id: app.id,
    type: 'application/dac.native',
    versionAsParameter: app.version,
    uninstallType: 'full'
  }

  try {
    console.info("uninstallDACApp LISA.uninstall with params:", JSON.stringify(param))
    if (Object.prototype.hasOwnProperty.call(app, "errorCode")) delete app.errorCode;
    await LISAApi.get().uninstall(param)
  } catch (error) {
    console.error('DACApi Error on LISA uninstall: ' + error.code + ' ' + error.message)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DACApi Error on LISA uninstall: '+JSON.stringify(error), true, null)
    app.errorCode = error.code;
    return false
  }
  return true
}

export const isInstalledDACApp = async (app) => {
  let result = null
  try {
    result = await LISAApi.get().getStorageDetails({
      id: app.id,
      type: 'application/dac.native',
      versionAsParameter: app.version,
    })
  } catch (error) {
    console.error('DACApi Error on LISA getStorageDetails: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DACApi Error on LISA getStorageDetails: '+JSON.stringify(error), false, null)
    return false
  }

  return result == null ? false : result.apps.path !== ''
}

export const getInstalledDACApps = async () => {
  let result = null
  try {
    result = await LISAApi.get().getList()
  } catch (error) {
    console.error('DACApi Error on LISA getList: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DACApi Error on LISA getList: '+JSON.stringify(error), false, null)
  }

  return result == null ? [] : (result.apps ? result.apps : [])
}

export const getPlatformNameForDAC = async () => {
  //code temporarily added based on new api implementation
  platform = await getPlatform()
  if (platform == null || platform === "") {
    platform = await getDeviceName()
    platform = platform.split('-')[0]
    console.info("getPlatformNameForDAC platform after split: ", JSON.stringify(platform))
  }
  else {
    return platform
  }

  if (platform.startsWith('raspberrypi4')) {
    return 'rpi4'
  } else if (platform.startsWith('raspberrypi')) {
    return 'rpi3'
  } else if (platform === 'brcm972180hbc') {
    return '7218c'
  } else if (platform === 'brcm972127ott') {
    return '72127ott'
  } else if (platform === 'vip7802') {
    return '7218c'
  } else if (platform === 'm393') {
    return '7218c'
  } else if (platform.toLowerCase().includes('hp44h')) {
    return 'ah212'
  } else if (platform.toLowerCase().includes('amlogic')) {
    return 'ah212'
  } else if (platform.toLowerCase().includes('mediaclient')) {
    return 'rtd1319'
  } else if (platform.toLowerCase().includes('blade')) {
    return 'rtd1319'
  } else {
    // default
    return 'rpi3'
  }
}

export const getDeviceName = async () => {
  let result = null
  try {
    result = await thunderJS().DeviceInfo.systeminfo()
  } catch (error) {
    console.error('DAC Api Error on systeminfo: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DAC Api Error on systeminfo: '+JSON.stringify(error), false, null)
  }
  return result == null ? "unknown" : result.devicename
}

export const startDACApp = async (app) => {
  console.log('DACApi startDACApp invoked with data:' + app)
  let result = null
  try {
    if (app.type === 'application/dac.native') {
      result = await thunderJS()['org.rdk.RDKShell'].launchApplication({
        client: app.id,
        mimeType: app.type,
        uri: app.id + ';' + app.version + ';' + app.type,
        topmost: true,
        focus: true
      })
    } else if (app.type === 'application/html') {
      result = await thunderJS()['org.rdk.RDKShell'].launch({ callsign: app.id, uri: app.url, type: 'HtmlApp' })
    } else if (app.type === 'application/lightning') {
      result = await thunderJS()['org.rdk.RDKShell'].launch({ callsign: app.id, uri: app.url, type: 'LightningApp' })
    } else {
      console.warn('DACApi Unsupported app type: ' + app.type)
      return false
    }
  } catch (error) {
    console.error('DACApi Error on launchApplication: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", 'DACApi Error on launchApplication: '+JSON.stringify(error), false, null)
    return false
  }

  if (result == null) {
    console.error('DACApi launch error returned result: ', result)
    return false
  } else if (!result.success) {
    // Could be same app is in suspended mode.
    await thunderJS()['org.rdk.RDKShell'].getClients().then(response => {
      if (Array.isArray(response.clients) && response.clients.includes(app.id.toLowerCase())) {
        console.log("DACApi " + app.id + " got a match in getClients response; could be in suspended mode, resume it.");
        thunderJS()['org.rdk.RDKShell'].resumeApplication({ client: app.id }).then(result => {
          if (!result.success) {
            return false;
          } else if (result.success) {
            if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
              thunder.call('org.rdk.RDKShell', 'setVisibility', { "client": GLOBALS.selfClientName, "visible": false })
            }
          }
        })
      }
    })
  } else if (result.success) {
    if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
      thunder.call('org.rdk.RDKShell', 'setVisibility', { "client": GLOBALS.selfClientName, "visible": false })
    }
  } else {
    // Nothing to do here.
  }

  try {
    result = await thunderJS()['org.rdk.RDKShell'].moveToFront({ client: app.id })
  } catch (error) {
    console.log('DACApi Error on moveToFront: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", "Error in Thunder RDKShell moveToFront DACApiError"+JSON.stringify(error), false, null)
  }

  try {
    result = await thunderJS()['org.rdk.RDKShell'].setFocus({ client: app.id })
    GLOBALS.topmostApp = (app.id + ';' + app.version + ';' + app.type);
  } catch (error) {
    console.log('DACApi Error on setFocus: ', error)
    Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", "Error in Thunder DACApi setFocus"+JSON.stringify(error), false, null)
    return false
  }
  return result == null ? false : result.success
}

/* WorkAround until proper cloud based App Catalog support */
export const getAppCatalogInfo = async () => {
  Storage.set("CloudAppStore", true);
  let appListArray = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "app-catalog-path")) {
        Storage.set("CloudAppStore", false);
        console.log("Fetching apps from local server")
        let url = data["app-catalog-path"]
        await fetch(url, { method: 'GET', cache: "no-store" })
          .then(response => response.text())
          .then(result => {
            result = JSON.parse(result)
            console.log("DACApi fetch result: ", result)
            if (Object.prototype.hasOwnProperty.call(result, "applications")) {
              appListArray = result["applications"];
            } else {
              console.error("DACApi result does not have applications")
              Metrics.error(Metrics.ErrorType.OTHER, "DACApiError","DACApi result does not have applications", false, null)
              Storage.set("CloudAppStore", true);
            }
          })
          .catch(error => {
            console.error("DACApi fetch error from local server", error)
            Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", JSON.stringify(error), false, null)
            Storage.set("CloudAppStore", true);
          });
      }
      else if (Storage.get("CloudAppStore") && (data != null) && Object.prototype.hasOwnProperty.call(data, "app-catalog-cloud")) {
        console.log("Fetching apps from cloud server")
        let cloud_data = data["app-catalog-cloud"]
        if (cloud_data && Object.prototype.hasOwnProperty.call(cloud_data, "url")) {
          let url = cloud_data["url"] + "?platform=arm:v7:linux&category=application"
          await fetch(url, { method: 'GET', cache: "no-store" })
            .then(response => response.text())
            .then(result => {
              result = JSON.parse(result)
              console.log("DACApi fetch result: ", result)
              if (Object.prototype.hasOwnProperty.call(result, "applications")) {
                appListArray = result["applications"];
              } else {
                console.error("DACApi result does not have applications")
                Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", "DACApi result does not have applications", false, null)
              }
            })
            .catch(error => {
               console.log("DACApi fetch error from cloud", error)
               Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", JSON.stringify(error), false, null)
            });
        } else {
          console.error("DACApi app-catalog-cloud does not have URL property.")
          Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", "DACApi app-catalog-cloud does not have URL property.", false, null)
        }
      }
    } else {
      let asms = await getAsmsUrlObj()
      let myHeaders = new Headers();
      if ((asms.password !== null) && (asms.username !== null)) {
        myHeaders.append("Authorization", "Basic " + btoa(asms.username + ':' + asms.password));
      }
      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      await fetch(asms.url, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (Object.prototype.hasOwnProperty.call(result, "applications")) {
            appListArray = result["applications"];
          } else {
            console.error("DACApi result does not have applications")
            Metrics.error(Metrics.ErrorType.OTHER, "DACApiError", "DACApi result does not have applications", false, null)
          }
        })
        .catch(error => {
          console.log("DACApi fetch error from cloud", error)
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
        });
    }
  } catch (error) {
    console.log("DACApi Using new getMetadata API.")
    Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "DACApi Using new getMetadata API.", false, null)
    let asms = await getAsmsUrlObj()
    let myHeaders = new Headers();
    if ((asms.password !== null) && (asms.username !== null)) {
      myHeaders.append("Authorization", "Basic " + btoa(asms.username + ':' + asms.password));
    }
    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    await fetch(asms.url, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (Object.prototype.hasOwnProperty.call(result, "applications")) {
          appListArray = result["applications"];
        } else {
          console.error("DACApi result does not have applications")
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "DACApi result does not have applications", false, null)
        }
      })
      .catch(error => {
        console.log("DACApi fetch error from cloud", error)
        Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
      });
  }
  return appListArray == null ? undefined : appListArray;
}

export const getFirmwareVersion = async () => {
  let firmwareVerList = null, firmwareVer = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "app-catalog-cloud")) {
        let cloud_data = data["app-catalog-cloud"]
        if (Object.prototype.hasOwnProperty.call(cloud_data, "firmwareVersions")) {
          firmwareVerList = cloud_data['firmwareVersions']
          let i = 0
          while (i < firmwareVerList.length) {
            if (await getPlatformNameForDAC() === firmwareVerList[i].platform) {
              firmwareVer = firmwareVerList[i].ver
              break
            }
            i += 1
          }
          if (firmwareVer === null) {
            console.error("Platform not supported")
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "Platform not supported", false, null)
          }
        }
        else {
          console.error("Firmware version not available")
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "Firmware version not available", false, null)
        }
      }
    } else {
      //code temporarily added based on new api implementation
      firmwareVer = await getFirmareVer()
    }
  } catch (error) {
    console.log("DACApi getFirmwareVersion Error: ", error)
    //code temporarily added based on new api implementation
    Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
    firmwareVer = await getFirmareVer()
  }
  return firmwareVer;
}

export const fetchAppIcon = async (id, version) => {
  let appIcon = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "app-catalog-cloud")) {
        let cloud_data = data["app-catalog-cloud"]
        let url = cloud_data["url"] + "/" + id + ":" + version + "?platformName=" + await getPlatformNameForDAC() + "&firmwareVer=" + await getFirmwareVersion()
        await fetch(url, { method: 'GET', cache: "no-store" })
          .then(response => response.text())
          .then(result => {
            result = JSON.parse(result)
            console.log("fetchAppIcon fetch result: ", result)
            if (Object.prototype.hasOwnProperty.call(result, "header")) {
              appIcon = result.header.icon;
            } else {
              console.error("fetchAppIcon App does not have URL")
              Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchAppIcon App does not have URL", false, null)
            }
          })
          .catch(error => {
            console.log("App Icon fetch error", error)
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
          });
      }
    } else {
      //code temporarily added based on new api implementation
      let asms = await getAsmsUrlObj()
      let myHeaders = new Headers();
      if ((asms.password !== null) && (asms.username !== null)) {
        myHeaders.append("Authorization", "Basic " + btoa(asms.username + ':' + asms.password));
      }

      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      let url = asms.url + "/" + id + ":" + version + "?platformName=" + await getPlatformNameForDAC() + "&firmwareVer=" + await getFirmwareVersion()

      await fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
          result = JSON.parse(result)
          if (Object.prototype.hasOwnProperty.call(result, "header")) {
            appIcon = result.header.icon;
          } else {
            console.error("fetchAppIcon App does not have URL")
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchAppIcon App does not have URL", false, null)
          }
        })
        .catch(error => {
          console.log("fetchAppIcon App Icon fetch error", error)
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
        });
    }
  } catch (error) {
    console.log("DACApi fetchAppIcon try block Error: ", error)
    //code temporarily added based on new api implementation
    let asms = await getAsmsUrlObj()
    let myHeaders = new Headers();
    if ((asms.password !== null) && (asms.username !== null)) {
      myHeaders.append("Authorization", "Basic " + btoa(asms.username + ':' + asms.password));
    }

    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    let url = asms.url + "/" + id + ":" + version + "?platformName=" + await getPlatformNameForDAC() + "&firmwareVer=" + await getFirmwareVersion()
    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (Object.prototype.hasOwnProperty.call(result, "header")) {
          appIcon = result.header.icon;
        } else {
          console.error("fetchAppIcon App does not have URL")
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchAppIcon App does not have URL", false, null)
        }
      })
      .catch(error => {
        console.log("fetchAppIcon App Icon fetch error", error)
        Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
      });
  }
  return appIcon == null ? undefined : appIcon;
}

export const fetchLocalAppIcon = async (id) => {
  let appIcon = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "app-catalog-path")) {
        let url = data["app-catalog-path"]
        await fetch(url, { method: 'GET', cache: "no-store" })
          .then(response => response.text())
          .then(result => {
            result = JSON.parse(result)
            if (Object.prototype.hasOwnProperty.call(result, "applications")) {
              let appListArray = result["applications"];
              for (let i = 0; i < appListArray.length; i++) {
                if (appListArray[i].id === id) {
                  appIcon = appListArray[i]["icon"]
                  break;
                }
              }
            } else {
              console.error("fetchLocalAppIcon DACApi result does not have applications")
              Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchLocalAppIcon DACApi result does not have applications", false, null)
              Storage.set("CloudAppStore", true);
            }
          })
          .catch(error => {
            console.log("fetchLocalAppIcon App Icon fetch error", error)
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
          });
      }
    } else {
      console.error("fetchLocalAppIcon Appstore info not available; DAC features won't work.")
      Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "etchLocalAppIcon Appstore info not available; DAC features won't work", false, null)
    }
  } catch (error) {
    console.log("fetchLocalAppIcon Appstore info Error: ", error)
    Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
  }
  return appIcon == null ? undefined : appIcon;
}

export const fetchAppUrl = async (id, version) => {
  let appUrl = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "app-catalog-cloud")) {
        let cloud_data = data["app-catalog-cloud"]
        let url = cloud_data["url"] + "/" + id + ":" + version + "?platformName=" + await getPlatformNameForDAC() + "&firmwareVer=" + await getFirmwareVersion()
        await fetch(url, { method: 'GET', cache: "no-store" })
          .then(response => response.text())
          .then(result => {
            result = JSON.parse(result)
            console.log("fetchAppUrl App fetch result: ", result)
            if (Object.prototype.hasOwnProperty.call(result, "header")) {
              appUrl = result.header.url;
            } else {
              console.error("fetchAppUrl App does not have URL")
              Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchAppUrl App does not have URL", false, null)
            }
          })
          .catch(error => {
            console.log("fetchAppUrl App URL fetch error", error)
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
          });
      }
    } else {
      //code temporarily added based on new api implementation
      let asms = await getAsmsUrlObj()
      let myHeaders = new Headers();
      if ((asms.password !== null) && (asms.username !== null)) {
        myHeaders.append("Authorization", "Basic " + btoa(asms.username + ":" + asms.password));
      }
      let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      let platformName = await getPlatformNameForDAC();
      let firmwareVer = await getFirmwareVersion();
      let url = asms.url + "/" + id + ":" + version + "?platformName=" + platformName + "&firmwareVer=" + firmwareVer;
      await fetch(url, requestOptions)
        .then(response => response.json())
        .then(result => {
          if (Object.prototype.hasOwnProperty.call(result, "header")) {
            appUrl = result.header.url;
          } else {
            console.error("fetchAppUrl App does not have URL")
            Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "fetchAppUrl App does not have URL", false, null)
          }
        })
        .catch(error => { 
          console.log("fetchAppUrl App URL fetch error", error)
          Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
        });
    }
  } catch (error) {
    console.log("fetchAppUrl DACApi Appstore info Error: ", error)
    Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", error, false, null)
  }
  return appUrl == null ? undefined : appUrl;
}

//New api implementation

export const getMetadata = async () => {
  const result = await LISAApi.get().getMetadata();
  return result;
}

export const getAsmsUrlObj = async () => {
  try {
    let metadata = await getMetadata();
    let response = await fetch(metadata.configUrl);
    let result = await response.json();

    if (Object.prototype.hasOwnProperty.call(result, "appstore-catalog")) {
      const appstoreCatalog = result['appstore-catalog'];
      const asmsUrl = appstoreCatalog.url + "/apps" || null;
      const authentication = appstoreCatalog.authentication || {};
      const username = authentication.user || null;
      const password = authentication.password || null;
      return { url: asmsUrl, username: username, password: password };
    } else {
      console.error("getAsmsUrlObj: Don't have ASMS URL");
      Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", "getAsmsUrlObj: Don't have ASMS URL", false, null)
      throw new Error('getAsmsUrlObj: Failed to parse data');
    }
  } catch (err) {
    console.error("getAsmsUrlObj FETCH error: ", err);
    Metrics.error(Metrics.ErrorType.OTHER,"DACApiError", err, false, null)
    throw new Error('getAsmsUrlObj: Failed to parse data: ' + err);
  }
}

export const getFirmareVer = async () => {
  const firmwareVer = await getMetadata().then(metadata => {
    let key = metadata.dacBundleFirmwareCompatibilityKey;
    return key
  });
  return firmwareVer
}

export const getPlatform = async () => {
  const platformName = await getMetadata().then(metadata => {
    let platName = metadata.dacBundlePlatformNameOverride;
    return platName
  });
  return platformName;
}
