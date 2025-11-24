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
import { Language, Router, Settings, Storage } from '@lightningjs/sdk';
import HDMIApi from './HDMIApi';
import NetflixIIDs from "../../static/data/NetflixIIDs.json";
import HomeApi from './HomeApi';
import { availableLanguageCodes, CONFIG, GLOBALS } from '../Config/Config.js';
import AlexaApi from './AlexaApi.js';
import RDKShellApis from './RDKShellApis.js';
import { Metrics } from '@firebolt-js/sdk';
import Network from './NetworkApi.js';
import UserSettingsApi from './UserSettingsApi.js';
import PowerManagerApi from './PowerManagerApi.js';
import RDKWindowManager from './RDKWindowManagerApi.js';
import AppManager from './AppManagerApi.js';

const thunder = ThunderJS(CONFIG.thunderConfig)

/**
 * Class that contains functions which commuicates with thunder API's
 */
export default class AppApi {
  constructor() {
    this.activatedForeground = false
    this._events = new Map()
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
    this.WARN = console.warn;
  }

  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the Bluetooth plugin.
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }

  fetchTimeZone() {
    return new Promise((resolve) => {
      thunder.call('org.rdk.System', 'getTimeZones')
        .then(result => {
          resolve(result.zoneinfo)
        })
        .catch(err => {
          this.ERR('AppAPI Cannot fetch time zone', err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getTimeZones" + err, false, null)
          resolve({})
        })
    })
  }


  /**
   * Function to launch Html app.
   * @param {String} url url of app.
   */
  /**
  *  Function to get timeZone
  */
  getZone() {
    return new Promise((resolve) => {
      thunder.call('org.rdk.System', 'getTimeZoneDST')
        .then(result => {
          resolve(result.timeZone)
        })
        .catch(err => {
          this.ERR('AppAPI System plugin getTimeZoneDST failed.' + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getTimeZoneDST" + JSON.stringify(err), false, null)
          resolve(undefined)
        })
    })
  }

  setZone(zone) {
    this.LOG(zone)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'setTimeZoneDST', { timeZone: zone })
        .then(result => {
          resolve(result.success)
        }).catch(err => {
          this.ERR("AppAPI System plugin setTimeZoneDST failed." + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system setTimeZoneDSt" + JSON.stringify(err), false, null)
          resolve(false)
        })
    }).catch(err => {
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system setTimeZoneDST " + JSON.stringify(err), false, null)
      this.ERR("AppAPI activate System failed." + JSON.stringify(err));
    })
  }


  getPluginStatus(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI Controller plugin '" + plugin + "' status check failed.");
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system status " + JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }


  /**
   * Function to get resolution of the display screen.
   */
  getResolution() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getCurrentResolution', {
          "videoDisplay": "HDMI0"
        })
        .then(result => {
          resolve(result.resolution)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings plugin getCurrentResolution failed." + JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "ApiError", "Error in Thunder displaySettings getCurrentResolution " + JSON.stringify(err), false, null)
          resolve('NA')
        });
    })

  }

  activateDisplaySettings() {
    return new Promise((resolve) => {
      const systemcCallsign = "org.rdk.DisplaySettings"
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings failed.' + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error while Thunder Controller displaysettings activate ' + JSON.stringify(err), false, null) // change from here on monday
        })
    });
  }

  getSupportedResolutions() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSupportedResolutions', { params: 'HDMI0' })
            .then(result => {
              resolve(result.supportedResolutions)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings getSupportedResolutions failed." + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "ApiError", "Error in Thunder displaySettings getSupportedResolutions " + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error while Thunder Controller displaysettings activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to set the display resolution.
   */
  setResolution(res) {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'setCurrentResolution', {
              videoDisplay: 'HDMI0',
              resolution: res,
              persist: true,
            })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings setCurrentResolution failed." + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error in Thunder displaysettings setCurrentResolution ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error while Thunder Controller displaysettings activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to get HDCP Status.
   */
  getHDCPStatus() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.HdcpProfile' })
        .then(() => {
          thunder
            .call('org.rdk.HdcpProfile', 'getHDCPStatus')
            .then(result => {
              this.LOG("AppAPI HdcpProfile getHDCPStatus : " + JSON.stringify(result.HDCPStatus));
              resolve(result.HDCPStatus)
            })
            .catch(err => {
              this.ERR("AppAPI HdcpProfile getHDCPStatus failed." + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "HDCPError", 'Error in Thunder HdcpProfile getHDCPStatus ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate HdcpProfile ', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "HDCPError", 'Error while Thunder Controller HdcpProfile activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to get TV HDR Support.
   */
  getTvHDRSupport() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getTvHDRSupport')
            .then(result => {
              this.LOG("AppAPI DisplaySettings getTvHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR("AppAPI DisplaySettings getTvHDRSupport failed." + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error in Thunder DisplaySettings getTvHDRSupport ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER, "ApiError", 'Error while Thunder Controller DisplaySettings activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to get settop box HDR Support.
   */
  getSettopHDRSupport() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSettopHDRSupport')
            .then(result => {
              this.LOG("AppAPI DisplaySettings getSettopHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR('AppAPI DisplaySettings getSettopHDRSupport failed ', JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", 'Error in Thunder DisplaySettings getSettopHDRSupport ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings Error', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", 'Error while Thunder Controller DisplaySettings activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to get HDR Format in use.
   */
  getHDRSetting() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'DisplayInfo' })
        .then(() => {
          thunder
            .call('DisplayInfo', 'hdrsetting')
            .then(result => {
              this.LOG("AppAPI DisplayInfo hdrsetting : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR("AppAPI DisplayInfo hdrsetting failed : " + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", 'Error in fetching Thunder DisplayInfo hdrsetting ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.LOG('AppAPI activate DisplayInfo Error', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", 'Error while Thunder Controller DisplayInfo activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to get DRMs.
   */
  getDRMS() {
    return new Promise((resolve) => {
      thunder.Controller.activate({ callsign: 'OCDM' })
        .then(() => {
          thunder
            .call('OCDM', 'drms')
            .then(result => {
              this.LOG("AppAPI OCDM supported drms: " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              this.ERR("AppAPI OCDM drms failed." + JSON.stringify(err));
              Metrics.error(Metrics.ErrorType.OTHER, "OCDMError", 'Error in fetching Thunder OCDM drms ' + JSON.stringify(err), false, null)
              resolve(false)
            })
        })
        .catch(err => {
          this.ERR('AppAPI activate OCDM error:', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "OCDMError", 'Error while Thunder Controller OCDM activate ' + JSON.stringify(err), false, null)
        })
    })
  }

  /**
   * Function to clear cache.
   */
  clearCache() {
    return new Promise((resolve) => {
      thunder
        .call(GLOBALS.selfClientName, 'delete', { path: ".cache" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI ResidentApp delete cache failed.");
          Metrics.error(Metrics.ErrorType.OTHER, "Cache failure", JSON.stringify(err), false, null)
          resolve(err)
        })
    })
  }

  async getAvailableTypes() {
    return RDKShellApis.getAvailableTypes().then(types => {
      // Include NativeApp as well as its not being included from backend.
      if (!types.includes("NativeApp")) types.push("NativeApp");
      this.LOG("RDKShell.getAvailableTypes:", JSON.stringify(types))
      resolve(types)
    }).catch(err => {
      Metrics.error(Metrics.ErrorType.OTHER, "Cache failure", 'Error in fetching Thunder RDKShell getAvailableTypes ' + JSON.stringify(err), false, null)
      resolve(false)
    })
  }

  /**
   * Function to launch All types of apps. Accepts 2 params.
   * @param {String} callsign String required callsign of the particular app.
   * @param {Object} args Object optional depending on following properties.
   *  @property {string} url: optional for YouTube & netflix | required for Lightning and WebApps
   *  @property {string} launchLocation: optional | to pass Netflix IIDs or YouTube launch reason | launchLocation value is one among these values ["mainView", "dedicatedButton", "appsMenu", "epgScreen", "dial", "gracenote","alexa"]
   *  @property {boolean} preventInternetCheck: optional | true will prevent bydefault check for internet
   *  @property {boolean} preventCurrentExit: optional |  true will prevent bydefault launch of previous app
   */

  async launchApp(callsign, args) {
    Storage.set("appSwitchingInProgress", true);
    const saveAbleRoutes = ["menu", "epg", "apps"] //routing back will happen to only these routes, otherwise it will default to #menu when exiting the app.
    const lastVisitedRoute = Router.getActiveHash();
    if (saveAbleRoutes.includes(lastVisitedRoute)) {
      Storage.set("lastVisitedRoute", lastVisitedRoute);
      GLOBALS.LastvisitedRoute= lastVisitedRoute
    } else {
      Storage.set("lastVisitedRoute", "menu");
      GLOBALS.LastvisitedRoute="menu"
    }
    Router.navigate("applauncher");
    this.LOG("AppAPI launchApp called with: " + JSON.stringify(callsign) + JSON.stringify(args));
    if (callsign.startsWith("YouTube")) {
      Storage.set(callsign + "LaunchLocation", args.launchLocation)
    }

    let url, preventInternetCheck, preventCurrentExit, launchLocation, gracenoteUrl = null;
    if (args) {
      url = args.url;
      preventInternetCheck = args.preventInternetCheck;
      preventCurrentExit = args.preventCurrentExit;
      launchLocation = args.launchLocation
    }

    const launchLocationKeyMapping = {
      //currently supported launch locations by the UI and mapping to corresponding reason/keys for IID
      "mainView": { "YouTube": "menu", "YouTubeTV": "menu", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
      "dedicatedButton": { "YouTube": "remote", "YouTubeTV": "remote", "Netflix": "App_launched_via_Netflix_Button" },
      "appsMenu": { "YouTube": "menu", "YouTubeTV": "menu", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Section" },
      "epgScreen": { "YouTube": "guide", "YouTubeTV": "guide", "Netflix": "App_launched_from_EPG_Grid" },
      "dial": { "YouTube": "dial", "YouTubeTV": "dial", "Netflix": "App_launched_via_DIAL_request" },
      "gracenote": { "YouTube": "launcher", "YouTubeTV": "launcher", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
      "alexa": { "YouTube": "voice", "YouTubeTV": "voice", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
    };
    if (launchLocation && launchLocationKeyMapping[launchLocation]) {
      if (callsign === "Netflix" || callsign.startsWith("YouTube")) {
        /* Gracenote provides shortened url which shall only be deeplinked; do not use for activation. */
        if (launchLocation === "gracenote") {
          gracenoteUrl = url
        }
        launchLocation = launchLocationKeyMapping[launchLocation][callsign]
      }
    }

    this.LOG("AppAPI launchApp with callsign: " + JSON.stringify(callsign) + " | url: " + JSON.stringify(url) + " | preventInternetCheck: " + JSON.stringify(preventInternetCheck) + " | preventCurrentExit: " + JSON.stringify(preventCurrentExit) + " | launchLocation: " + JSON.stringify(launchLocation));

    let IIDqueryString = "";
    if (callsign === "Netflix") {
      let netflixIids = await this.getNetflixIIDs();
      if (launchLocation) {
        IIDqueryString = `source_type=${netflixIids[launchLocation].source_type}&iid=${netflixIids[launchLocation].iid}`;
        if (url) {
          IIDqueryString = "&" + IIDqueryString; //so that IIDqueryString can be appended with url later.
        }
      } else {
        this.WARN("AppAPI launchLocation(IID) not specified while launching netflix");
      }
    }

    const availableCallsigns = await RDKShellApis.getAvailableTypes();

    if (!availableCallsigns.includes(callsign)) {
      Storage.set("appSwitchingInProgress", false);
      Router.navigate(GLOBALS.LastvisitedRoute);
      return Promise.reject("Can't launch App: " + callsign + " | Error: callsign not found!");
    }

    if (!preventInternetCheck) {
      let internet = await Network.get().isConnectedToInternet();
      if (!internet) {
        Storage.set("appSwitchingInProgress", false);
        Router.navigate(GLOBALS.LastvisitedRoute);
        return Promise.reject("No Internet Available, can't launchApp.");
      }
    }

    const currentApp = GLOBALS.topmostApp; //get it from stack if required. | current app ==="" means residentApp

    let pluginStatus, pluginState;// to check if the plugin is active, resumed, deactivated etc
    try {
      if (callsign != "NativeApp") {
        pluginStatus = await this.getPluginStatus(callsign);
        pluginState = pluginStatus[0].state;
      }
    } catch (err) {
      this.ERR("Getplugin status error"+err);
      Storage.set("appSwitchingInProgress", false);
      Router.navigate(GLOBALS.LastvisitedRoute);
      return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device | Error: " + JSON.stringify(err));
    }
    this.LOG("AppAPI " + callsign + " : pluginStatus: " + JSON.stringify(pluginStatus) + " pluginState: ", JSON.stringify(pluginState));

    if(callsign.startsWith("Amazon") || callsign.startsWith("Netflix")||callsign.startsWith("YouTube")){
      if(pluginState ==='hibernated')
        {
          thunder.call('org.rdk.RDKShell.1','restore',{"callsign":  callsign}).then(res =>{
            this.LOG(JSON.stringify(res));
          })
        }
    }
    if (callsign === "Netflix") {
      if (pluginState === "deactivated" || pluginState === "deactivation") { //netflix cold launch scenario
        this.LOG(`AppAPI Netflix : ColdLaunch`)
        if (Router.getActivePage().showSplashImage) {
          Router.getActivePage().showSplashImage(callsign) //to make the splash image for netflix visible
        }
        if (url) {
          try {
            this.LOG("AppAPI Netflix ColdLaunch passing netflix url & IIDqueryString using configureApplication method:  ", url, IIDqueryString);
            await this.configureApplication("Netflix", url + IIDqueryString);
          } catch (err) {
            this.ERR("AppAPI Netflix configureApplication error: ", err);
          }
        } else {
          try {
            this.LOG("AppAPI Netflix ColdLaunch passing netflix IIDqueryString using configureApplication method:  ", IIDqueryString);
            await this.configureApplication("Netflix", IIDqueryString);
          } catch (err) {
            this.ERR("AppAPI Netflix configureApplication error: ", err);
          }
        }
      } else { //netflix hot launch scenario
        this.LOG("AppAPI Netflix : HotLaunch")
        if (url) {
          try {
            this.LOG("AppAPI Netflix HotLaunch passing netflix url & IIDqueryString using systemcommand method: ", url, IIDqueryString);
            await thunder.call("Netflix", "systemcommand", { command: url + IIDqueryString });
          } catch (err) {
            this.ERR("AppAPI Netflix systemcommand error: ", err);
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder Netflix systemcommand " + JSON.stringify(err), false, null)
          }
        }
        else {
          try {
            this.LOG("AppAPI Netflix HotLaunch passing netflix IIDqueryString using systemcommand method: ", IIDqueryString);
            await thunder.call("Netflix", "systemcommand", { command: IIDqueryString });
          } catch (err) {
            this.ERR("AppAPI Netflix systemcommand error: ", err);
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder Netflix systemcommand " + JSON.stringify(err), false, null)
          }
        }
      }
    }

    let params = {
      "callsign": callsign,
      "type": callsign,
      "configuration": {}
    };
    if (url && (callsign === "LightningApp" || callsign === "HtmlApp" || callsign === "NativeApp")) { //for lightning/htmlapp url is passed via rdkshell.launch method
      params.uri = url
    } else if (callsign.startsWith("YouTube")) {
      let language = Language.get()
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US" //default to english US if language is not available.
      if (gracenoteUrl === null) {
        url = url ? url : Storage.get(callsign + "DefaultURL");
      } else {
        /* Gracenote provided url cannot be used for 'Configuring' plugin. Use only to deeplink. */
        url = Storage.get(callsign + "DefaultURL");
      }
      if (url) {
        if (!url.includes("?")) {
          url += "?"
        }
        if (!url.includes("inApp=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += ((GLOBALS.topmostApp === callsign) ? "inApp=true" : "inApp=false")
        }
        if (!url.includes("launch=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += "launch=" + launchLocation
        }
        if ((launchLocation === "voice") && !url.includes("vs=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += "vs=2" // YT Dev Doc specific to Alexa
        }
        this.LOG("AppAPI " + callsign + " is being launched using the url: " + JSON.stringify(url))
      }

      params.configuration = { //for gracenote cold launch url needs to be re formatted to youtube.com/tv/
        "language": language,
        "url": url,
        "launchtype": "launch=" + launchLocation
      }
      params.type = "Cobalt";
    }

    else if (callsign === "Amazon") {
      let language = Language.get();
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US"
      params.configuration = { "deviceLanguage": language };
    }
    else if (callsign === "Netflix") {
      let language = Language.get();
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US"
      params.configuration = { "language": language };
    }

    if (!preventCurrentExit && (currentApp !== GLOBALS.selfClientName) && (currentApp !== callsign)) {
      //currentApp==="" means currently on residentApp | make currentApp = "residentApp" in the cache and stack
      try {
        this.LOG("AppAPI calling exitApp with params: " + callsign + " and exitInBackground " + currentApp + " true.")
        await this.exitApp(currentApp, true)
      }
      catch (err) {
        this.ERR("AppAPI currentApp " + currentApp + " exit failed!: launching new app...")
        Metrics.error(Metrics.ErrorType.OTHER, "AppError", `exit failed! for ${currentApp} with ${JSON.stringify(err)}.So launching new app...`, false, null)
      }
    }

    if ((currentApp === GLOBALS.selfClientName) && callsign !== "Netflix") { //currentApp==="" means currently on residentApp | make currentApp = "residentApp" in the cache and stack | for netflix keep the splash screen visible till it launches
      RDKShellApis.setVisibility(GLOBALS.selfClientName, false)
    }

    if (callsign === "Netflix") { //special case for netflix to show splash screen
      params.behind = GLOBALS.selfClientName //to make the app launch behind resident app | app will be moved to front after first frame event is triggered
    }
    if (JSON.stringify(params.configuration) === '{}') {
      delete params.configuration;
    }
    this.LOG("AppAPI RDKShell launch with params: " + JSON.stringify(params));
    return new Promise((resolve, reject) => {
      if (callsign === "NativeApp") {
        // Could be coming from PartnerApp.
        params.client = callsign;
        params.mimeType = "application/native";
        RDKShellApis.launchApplication(params).then(res => {
          this.LOG(`AppAPI ${callsign} : Launch results in ${JSON.stringify(res)}`)
          if (res.success) {
            AlexaApi.get().reportApplicationState(callsign);
            if (args.appIdentifier) {
              let order = Storage.get("appCarouselOrder")
              if (!order) {
                Storage.set("appCarouselOrder", "")
              } else {
                let storedApps = order.split(",")
                let ix = storedApps.indexOf(args.appIdentifier)
                if (ix != -1) {
                  storedApps.splice(ix, 1)
                }
                storedApps.unshift(args.appIdentifier)
                Storage.set("appCarouselOrder", storedApps.toString())
              }
            }
            GLOBALS.topmostApp = callsign;
            Storage.set("appSwitchingInProgress", false);
            resolve(res);
          } else {
            this.ERR("AppAPI failed to launchApp(success false) : ", callsign, " ERROR: ", JSON.stringify(res))
            Storage.set("appSwitchingInProgress", false);
            Router.navigate(GLOBALS.LastvisitedRoute);
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launchApplication " + JSON.stringify(res), false, null)
            reject(res)
          }
        }).catch(err => {
          this.ERR("AppAPI failed to launchApp: ", callsign, " ERROR: ", JSON.stringify(err), " | Launching residentApp back")
          RDKShellApis.kill(callsign);
          this.launchResidentApp(GLOBALS.selfClientName);
          Storage.set("appSwitchingInProgress", false);
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launchApplication " + JSON.stringify(err), false, null)
          Router.navigate(GLOBALS.LastvisitedRoute);
          reject(err)
        })
      } else {
        RDKShellApis.launch(params).then(res => {
          this.LOG("AppAPI " + callsign + " : Launch results in " + JSON.stringify(res))
          if (res.success) {
            if ((callsign === "HtmlApp") || (callsign === "LightningApp")) {
              AlexaApi.get().reportApplicationState(url);
            } else {
              AlexaApi.get().reportApplicationState(callsign);
            }
            if (args.appIdentifier) {
              let order = Storage.get("appCarouselOrder")
              if (!order) {
                Storage.set("appCarouselOrder", "")
              } else {
                let storedApps = order.split(",")
                let ix = storedApps.indexOf(args.appIdentifier)
                if (ix != -1) {
                  storedApps.splice(ix, 1)
                }
                storedApps.unshift(args.appIdentifier)
                Storage.set("appCarouselOrder", storedApps.toString())
              }
            }

            if (callsign !== "Netflix") { //if app is not netflix, move it to front(netflix will be moved to front from applauncherScreen.)
              RDKShellApis.getZOrder().then(res => {
                this.WARN("AppAPI zOrder:" + JSON.stringify(res));
              }).catch(err => {
                this.ERR("AppAPI failed to zOrder : " + JSON.stringify(callsign) + " ERROR: " + JSON.stringify(err))
                Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell zOrder " + JSON.stringify(err), false, null)
              })
              RDKShellApis.moveToFront(callsign, callsign).catch(err => {
                this.ERR("AppAPI failed to moveToFront : " + JSON.stringify(callsign) + " ERROR: " + JSON.stringify(err) + " | fail reason can be since app is already in front")
                Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell moveToFront " + JSON.stringify(err), false, null)
              })
            }

            RDKShellApis.setFocus(callsign, callsign).catch(err => {
              this.ERR("AppAPI failed to setFocus : ", callsign, " ERROR: ", JSON.stringify(err))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell setFocus " + JSON.stringify(err), false, null)
            })

            RDKShellApis.setVisibility(callsign, true).catch(err => {
              this.ERR("AppAPI failed to setVisibility : ", callsign, " ERROR: ", JSON.stringify(err))
              Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell setVisibility " + JSON.stringify(err), false, null)
            })

            if (callsign === "Netflix") {
              this.LOG("AppAPI Netflix launched: hiding residentApp");
              //if netflix splash screen was launched resident app was kept visible Netflix until app launched.
              RDKShellApis.setVisibility(GLOBALS.selfClientName, false).catch(err => {
                this.ERR("AppAPI failed to setVisibility : ", GLOBALS.selfClientName, " ERROR: ", JSON.stringify(err))
              })
            }

            if (callsign.startsWith("YouTube") && ((res.launchType === "resume") || (gracenoteUrl != null))) {
              // Page visibility requirement; 'launch' need to be 'deeplink'ed when app is 'resumed'.
              if (gracenoteUrl != null) {
                url = gracenoteUrl;
              } else if (!url) {
                url = params.configuration.url;
              }
              this.LOG("AppAPI Calling " + callsign + ".deeplink with url: " + url);
              thunder.call(callsign, 'deeplink', url)
            }
            Storage.set("appSwitchingInProgress", false);
            GLOBALS.topmostApp = callsign;
            resolve(res);
          } else {
            this.ERR("AppAPI failed to launchApp(success false) : "+ JSON.stringify(callsign), " ERROR: ", JSON.stringify(res))
            Storage.set("appSwitchingInProgress", false);
            Router.navigate(GLOBALS.LastvisitedRoute);
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)
            reject(res)
          }
        }).catch(err => {
          this.ERR("AppAPI failed to launchApp: " + JSON.stringify(callsign) + " ERROR: " + JSON.stringify(err) + " | Launching residentApp back")
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)

          //destroying the app incase it's stuck in launching | if taking care of ResidentApp as callsign, make sure to prevent destroying it
          RDKShellApis.destroy(callsign).catch(err => {
            this.ERR("AppAPI failed to destroy : " + JSON.stringify(callsign) + " ERROR: " + JSON.stringify(err))
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell destroy " + JSON.stringify(err), false, null)
          })
          this.launchResidentApp(GLOBALS.selfClientName);
          Storage.set("appSwitchingInProgress", false);
          Router.navigate(GLOBALS.LastvisitedRoute);
          reject(err)
        })
      }
    })
  }


  /**
   * Function to launch Exit types of apps.
   * @param {String} callsign callsign of the particular app.
   * @param {boolean} exitInBackground to make the app not bring up residentApp on exit
   * @param {boolean} forceDestroy to force the app to do rdkshell.destroy instead of suspend
   */

  // exit method does not need to launch the previous app.
  async exitApp(callsign, exitInBackground, forceDestroy) { //test the new exit app method
    if ((callsign === "") || (callsign === GLOBALS.selfClientName)) { //previousApp==="" means it's residentApp | change it to residentApp in cache and here
      return Promise.reject("AppAPI Can't exit from " + callsign);
    }

    if (callsign === "HDMI") {
      this.LOG("AppAPI exit method called for hdmi")
      new HDMIApi().stopHDMIInput()
      Storage.set("_currentInputMode", {});
      if (!exitInBackground) { //means resident App needs to be launched
        this.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
          AlexaApi.get().reportApplicationState("menu", true);
        });
      }
      return Promise.resolve(true);
      //check for hdmi scenario
    }

    if (callsign === "LightningApp" || callsign === "HtmlApp" || callsign === "Peacock") {
      forceDestroy = true //html and lightning apps need not be suspended.
    }

    let pluginStatus, pluginState;// to check if the plugin is active, resumed, deactivated etc
    if (callsign != "NativeApp" && !callsign.includes('application/dac.native') && (callsign != "FireboltApp")) {
      try {
        pluginStatus = await this.getPluginStatus(callsign);
        if (pluginStatus !== undefined) {
          pluginState = pluginStatus[0].state;
          this.LOG("AppAPI pluginStatus: " + JSON.stringify(pluginStatus) + " pluginState: ", JSON.stringify(pluginState));
        }
        else {
          return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device");
        }
      } catch (err) {
        return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device | Error: " + JSON.stringify(err));
      }
    }

    if (!exitInBackground && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") { //means resident App needs to be launched
      this.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
        AlexaApi.get().reportApplicationState("menu", true);
      });
    }

    //to hide the current app
    this.LOG("AppAPI setting visibility of " + callsign + " to false")
    await RDKShellApis.setVisibility(callsign, false).catch(err => {
      this.ERR("AppAPI failed to setVisibility : " + callsign + " ERROR: ", JSON.stringify(err))
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell setVisibility " + JSON.stringify(err), false, null)
    })

    if (forceDestroy) {
      if (pluginState != undefined) { // App is a Plugin
        this.LOG("AppAPI Force Destroying the app: ", callsign)
        await RDKShellApis.destroy(callsign).catch(err => {
          this.ERR("AppAPI Error in destroying app: " + callsign + " " + JSON.stringify(err));
          RDKShellApis.kill(callsign).catch(err => {
            this.ERR("AppAPI Error in killing app: " + callsign + " " + JSON.stringify(err));
          })
        })
        return Promise.resolve(true);
      } else if (callsign === "NativeApp" || callsign.includes('application/dac.native')) {
        await RDKShellApis.kill((callsign.includes('application/dac.native') ? callsign.substring(0, callsign.indexOf(';')) : callsign)).catch(err => {
          this.ERR("AppAPI RDKShell kill: " + callsign + " ERROR: ", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell kill " + JSON.stringify(err), false, null)
          return Promise.resolve(false);
        });
      }
    }
    else {
      this.LOG("AppAPI Exiting from App: ", callsign, " depending on platform settings enableAppSuspended: ", Settings.get("platform", "enableAppSuspended"));
      //enableAppSuspended = true means apps will be suspended by default
      if (Settings.get("platform", "enableAppSuspended")) {
        if (pluginState != undefined) { // App is a Plugin
          await RDKShellApis.suspend(callsign).catch(err => {
            this.ERR("AppAPI Error in suspending app: ", callsign, " | trying to destroy the app" + JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell suspend " + JSON.stringify(err), false, null)
            RDKShellApis.destroy(callsign);
          })
          return Promise.resolve(true)
        } else if (callsign === "NativeApp" || callsign.includes('application/dac.native')) {
          // DAC Demo WorkAround; TODO: use suspendApplication instead of kill
          await RDKShellApis.kill((callsign.includes('application/dac.native') ? callsign.substring(0, callsign.indexOf(';')) : callsign)).catch(err => {
            this.ERR("AppAPI Error in kill app: ", callsign, " | trying to destroy the app" + JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell kill " + JSON.stringify(err), false, null)
            RDKShellApis.destroy(callsign);
          })
          return Promise.resolve(true)
        }
      }
      else {
        await RDKShellApis.destroy(callsign);
        return Promise.resolve(true);
      }
    }
  }

  /**
   * Function to launch ResidentApp explicitly(incase of special scenarios)
   * Prefer using launchApp and exitApp for ALL app launch and exit scenarios.
   */
  async launchResidentApp(client = GLOBALS.selfClientName, callsign = GLOBALS.selfClientName) {
    this.LOG("AppAPI launchResidentApp got Called: setting visibility, focus and moving to front the client: " + client)
    await RDKShellApis.moveToFront(client, callsign).catch(err => {
      this.ERR("AppAPI failed to moveToFront : ResidentApp ERROR: ", JSON.stringify(err), " | fail reason can be since app is already in front")
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell moveToFront " + JSON.stringify(err), false, null)
    })

    await RDKShellApis.setFocus(client, callsign).catch(err => {
      this.ERR("AppAPI failed to setFocus : ResidentApp ERROR: ", JSON.stringify(err))
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell setFocus " + JSON.stringify(err), false, null)
    })

    await RDKShellApis.setVisibility(client, true).catch(err => {
      this.ERR("AppAPI failed to setVisibility : ResidentApp ERROR: ", JSON.stringify(err))
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell setVisibility " + JSON.stringify(err), false, null)
    })

    GLOBALS.topmostApp = client;
  }


  async getNetflixIIDs() {
    let defaultIIDs = NetflixIIDs;
    let data = new HomeApi().getPartnerAppsInfo();
    if (!data) {
      return defaultIIDs;
    }
    this.LOG("AppAPI homedata: " + JSON.stringify(data));
    try {
      data = await JSON.parse(data);
      if (data != null && Object.prototype.hasOwnProperty.call(data, "netflix-iid-file-path")) {
        let url = data["netflix-iid-file-path"]
        this.LOG("AppAPI Netflix : requested to fetch iids from " + JSON.stringify(url))
        const fetchResponse = await fetch(url);
        const fetchData = await fetchResponse.json();
        return fetchData;
      } else {
        this.LOG("AppAPI Netflix IID file path not found in conf file, using deffault IIDs" + JSON.stringify(undefined));
        return defaultIIDs;
      }
    } catch (err) {
      this.ERR("AppAPI Error in fetching iid data from specified path, returning defaultIIDs | Error:", err);
      Metrics.error(Metrics.ErrorType.OTHER, "Apperror", "AppAPI Error in fetching iid data from specified path" + JSON.stringify(err), false, null)
      return defaultIIDs;
    }
  }

  /*
   *Function to launch apps in hidden mode
   */
  launchPremiumAppInSuspendMode(childCallsign) {
    return new Promise((resolve, reject) => {
      RDKShellApis.launch({
        callsign: childCallsign,
        type: childCallsign,
        suspend: true,
        visible: false,
        focused: false,
      }).then((res) => {
        if (childCallsign == "Netflix") {
          this.LOG(`AppAPI launchPremiumAppInSuspendMode : launch netflix results in :`, res);
        }
        else {
          this.LOG(`AppAPI launchPremiumAppInSuspendMode : launch amazon results in :`, res);
        }
        resolve(true)
      }).catch(err => {
        if (childCallsign == "Netflix") {
          this.ERR(`AppAPI Netflix : error while launching netflix :`, err);
        }
        else {
          this.LOG(`AppAPI Amazon : error while launching amazon :`, err);
        }
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)
        reject(false)
      });
    })
  }

  /**
   * Function to launch Netflix/Amazon Prime app.
   */
  launchPremiumApp(childCallsign) {
    return new Promise((resolve, reject) => {
      RDKShellApis.launch({
        callsign: childCallsign,
        type: childCallsign,
        visible: true,
        focused: true
      }).then((res) => {
        if (childCallsign == "Netflix") {
          this.LOG(`AppAPI launchPremiumApp : launch netflix results in :`, res);
        }
        else {
          this.LOG(`AppAPI launchPremiumApp : launch amazon results in :`, res);
        }
        RDKShellApis.setVisibility(childCallsign, true)
        RDKShellApis.setFocus(childCallsign)
        RDKShellApis.moveToFront(childCallsign)
        GLOBALS.topmostApp = childCallsign;
        this.LOG(`AppAPI launchPremiumApp the current application Type : `, GLOBALS.topmostApp);
        resolve(true)
      }).catch(err => {
        if (childCallsign == "Netflix") {
          this.ERR(`AppAPI launchPremiumApp : error while launching netflix :`, err);
        }
        else {
          this.ERR(`AppAPI launchPremiumApp : error while launching amazon :`, err);
        }
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)
        reject(false)
      });
    })
  }

  /**
   * Function to launch Resident app.
   * @param {String} url url of app.
   */
  launchResident(url, client) {
    return new Promise((resolve, reject) => {
      const childCallsign = client
      RDKShellApis.launch({
        callsign: childCallsign,
        type: GLOBALS.selfClientName,
        uri: url,
      }).then((res) => {
        this.LOG(`AppAPI launchResident returned: `, JSON.stringify(res));
        resolve(true)
      }).catch(err => {
        this.ERR('AppAPI launchResident error: ' + JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)
        reject(false)
      })
    })
  }

  launchOverlay(url, client) {
    return new Promise((resolve, reject) => {
      const childCallsign = client
      RDKShellApis.launch({
        callsign: childCallsign,
        type: GLOBALS.selfClientName,
        uri: url,
      }).then(res => {
        RDKShellApis.moveToFront(childCallsign, childCallsign)
        this.LOG(`AppAPI launchOverlay : launched overlay : `, JSON.stringify(res));
        resolve(res)
      }).catch(err => {
        this.ERR("AppAPI launchOverlay : error ", JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell launch " + JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  /**
   * Function to suspend Netflix/Amazon Prime app.
   */
  suspendPremiumApp(appName) {
    return new Promise((resolve) => {
      RDKShellApis.suspend(appName).then(() => {
        resolve(true);
      }).catch(err => {
        this.ERR("AppAPI suspendPremiumApp error: ", JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder RDKShell suspend " + JSON.stringify(err), false, null)
        resolve(false)
      })
    })
  }

  registerPowerEvent(callback) {
    return PowerManagerApi.get().registerEvent("onPowerModeChanged", callback);
  }

  /**
   * Function to deactivate html app.
   */
  deactivateWeb() {
    RDKShellApis.destroy("HtmlApp")
  }

  /**
   * Function to deactivate cobalt app.
   */
  deactivateCobalt(instanceName = 'Cobalt') {
    RDKShellApis.destroy(instanceName)
  }

  cobaltStateChangeEvent() {
    try {
      thunder.on('Controller', 'statechange', notification => {
        if (this._events.has('statechange')) {
          this._events.get('statechange')(notification)
        }
      })
    } catch (e) {
      this.ERR('AppAPI Failed to register statechange event' + e)
      Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error while Thunder Controller stateChange " + JSON.stringify(e), false, null)
    }
  }

  /**
   * Function to deactivate lightning app.
   */
  deactivateLightning() {
    RDKShellApis.destroy("Lightning")
  }

  /**
   * Function to deactivate resident app.
   */
  deactivateResidentApp(client) {
    RDKShellApis.destroy(client)
  }

  enabledisableinactivityReporting(bool) {
    RDKWindowManager.get().enableInactivityReporting(bool)
  }

  setInactivityInterval(duration) {
    RDKWindowManager.get().setInactivityInterval(duration)
  }

  async setfocustoResidentapp() {
    return AppManager.get().getLoadedApps().then(async (res) => {
            this.LOG('Currently loaded apps: ' + JSON.stringify(res));
            const targetAppId = "com.rdk.app.wpebrowser_2.38";
            const targetApp = res.find(app => app.appId === targetAppId);
            if (targetApp) {
              const appInstanceId = targetApp.appInstanceId;
              this.LOG('Found appInstanceId for ' + targetAppId + ': ' + appInstanceId);
              await RDKWindowManager.get().setFocus(appInstanceId).then(() => {
                this.LOG('setFocus successful for ' + targetAppId);
              }	).catch((err) => {
                this.ERR('setFocus error for ' + targetAppId + ': ' + JSON.stringify(err));
              });
            } else {
              this.WARN('App not found: ' + targetAppId);
            }
          }).catch((err) => {
            this.ERR('Error getting loaded apps from setfocustoresidentapp ' + JSON.stringify(err));
          });
  }
  async setVisibletoResidentapp(visible) {
    return AppManager.get().getLoadedApps().then(async (res) => {
            this.LOG('Currently loaded apps: ' + JSON.stringify(res));
            const targetAppId = "com.rdk.app.wpebrowser_2.38";
            const targetApp = res.find(app => app.appId === targetAppId); 
            if (targetApp) {
              const appInstanceId = targetApp.appInstanceId;
              this.LOG('Found appInstanceId for ' + targetAppId + ': ' + appInstanceId);
              await RDKWindowManager.get().setVisible(appInstanceId, visible).then(() => {
                this.LOG('setVisibility successful for ' + targetAppId);
              }  ).catch((err) => {
                this.ERR('setVisibility error for ' + targetAppId + ': ' + JSON.stringify(err));
              });
              
            } else {
              this.WARN('App not found: ' + targetAppId);
            } 
          }).catch((err) => {
            this.ERR('Error getting loaded apps from setvisibletoresidentapp : ' + JSON.stringify(err));
          });
  }

  /**
 * Function to set the configuration of premium apps.
 * @param {appName} Name of the application
 * @param {config_data} config_data configuration data
 */
  configureApplication(appName, config_data) {
    let plugin = 'Controller';
    let method = 'configuration@' + appName;
    return new Promise((resolve, reject) => {
      thunder.call(plugin, method).then((res) => {
        res.querystring = config_data;
        thunder.call(plugin, method, res).then((resp) => {
          this.LOG(`AppAPI ${appName} : updating configuration with object ${res} results in ${resp}`)
          resolve(true);
        }).catch((err) => {
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error in Thunder ${plugin} ${method} ${JSON.stringify(err)}`, false, null)
          reject(err); //resolve(true)
        });
      }).catch((err) => {
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error in Thunder ${plugin} ${method} ${JSON.stringify(err)}`, false, null)
        reject(err);
      });
    })
  }

  setPowerState(value) {
    return PowerManagerApi.get().setPowerState(value)
  }

  getPowerStateBeforeReboot() {
    return PowerManagerApi.get().getPowerStateBeforeReboot();
  }

  getPowerStateIsManagedByDevice() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getPowerStateIsManagedByDevice').then(result => {
        resolve(result);
      }).catch(err => {
        this.ERR("AppAPI System getPowerStateIsManagedByDevice failed: ", JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, "PowerStateFailure", "Error in Thunder System getPowerStateIsManagedByDevice " + JSON.stringify(err), false, null);
        reject(err);
      });
    });
  }

  getPowerState() {
    return PowerManagerApi.get().getPowerState().then(result => {
      this.LOG("AppApi getPowerState result:", JSON.stringify(result))
      return {
        currentState: result?.currentState ?? null,
        previousState: result?.previousState ?? null
      };
    })
  }

  getWakeupReason() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getWakeupReason')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("org.rdk.System: getWakeupReason: Error in getting wake up reason: " + JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PowerStateFailure", "Error in Thunder System getWakeupReason " + JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  enableDisplaySettings() {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', 'activate', { callsign: 'org.rdk.DisplaySettings' })
        .then(result => {
          this.LOG('AppAPI activate DisplaySettings success.')
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI activate DisplaySettings error: ', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "AppError", "Error while Thunder Controller displaySettings activate " + JSON.stringify(err), false, null)
          reject(err)
        })
    })
  }

  getSoundMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSoundMode', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSoundMode error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getSoundMode " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  setSoundMode(mode) {
    mode = mode.startsWith("AUTO") ? "AUTO" : mode
    this.LOG("mode", mode)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setSoundMode', {
          "audioPort": "HDMI0",
          "soundMode": mode,
          "persist": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setSoundMode error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings setSoundMode " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getSupportedAudioModes() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioModes', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSupportedAudioModes error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getSupportedAudioModes " + JSON.stringify(err), false, null)
          reject(false)
        })
    })
  }

  //Enable or disable the specified audio port based on the input audio port ID.
  setEnableAudioPort(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setEnableAudioPort', {
          "audioPort": port, "enable": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setEnableAudioPort error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings setEnableAudioPort " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getDRCMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getDRCMode', { "audioPort": "HDMI0" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getDRCMode error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getDRCMode " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  setDRCMode(DRCNum) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setDRCMode', {
          "DRCMode": DRCNum
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setDRCMode error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings setDRCMode " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getZoomSetting() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getZoomSetting')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getZoomSetting error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getZoomSetting " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  setZoomSetting(zoom) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setZoomSetting', { "zoomSetting": zoom })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings setZoomSetting error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings setZoomSetting " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getEnableAudioPort(audioPort) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getEnableAudioPort', { "audioPort": audioPort })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getEnableAudioPort error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getEnableAudioPort " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getSupportedAudioPorts() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioPorts')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI DisplaySettings getSupportedAudioPorts error:", JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DisplaySettings getSupportedAudioPorts " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  //________________________________________________________________________________________________________________________

  //OTHER SETTINGS PAGE API

  //1. UI VOICE

  // 4. Check for Firmware Update

  //Get Firmware Update Info
  getFirmwareUpdateInfo() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getFirmwareUpdateInfo error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getFirmwareUpdateInfo " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  // Get Firmware Update State
  getFirmwareUpdateState() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateState')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR(" AppAPI System getFirmwareUpdateState error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getFirmwareUpdateState " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  // Get Firmware download info
  getDownloadFirmwareInfo() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getDownloadedFirmwareInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getDownloadedFirmwareInfo error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getDownloadedFirmwareInfo " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getModelName() {
    return new Promise((resolve) => {
      thunder.call('DeviceInfo', 'modelname').then(result => {
        resolve(result.model)
      }).catch(err => {
        this.ERR("AppAPI DeviceInfo modelname failed:" + JSON.stringify(err));
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DeviceInfo modelname " + JSON.stringify(err), false, null)
        resolve("RDK-VA")
      })
    })
  }

  getSerialNumber() {
    return new Promise((resolve) => {
      thunder.call('DeviceInfo', 'serialnumber').then(result => {
        resolve(result.serialnumber)
      }).catch(err => {
        this.ERR("AppAPI DeviceInfo serialnumber error:", JSON.stringify(err, 3, null));
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DeviceInfo serialnumber " + JSON.stringify(err), false, null)
        resolve('0123456789')
      })
    })
  }

  //Get system versions
  getSystemVersions() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getSystemVersions')
        .then(result => {
          this.LOG(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System getSystemVersions error:" + JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getSystemVersions " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  //Update firmware
  updateFirmware() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'updateFirmware')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI System updateFirmware error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system updateFirmware " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  //Get download percentage
  getFirmwareDownloadPercent() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getFirmwareDownloadPercent')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getFirmwareDownloadPercent error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getFirmwareDownloadPercent " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }


  // 5. Device Info
  systeminfo() {
    return new Promise((resolve) => {
      thunder
        .call('DeviceInfo', 'systeminfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI systeminfo error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DeviceInfo systeminfo " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  deviceType() {
    return new Promise((resolve) => {
      thunder
        .call('DeviceInfo', 'devicetype')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI devicetype error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder DeviceInfo devicetype " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  // 6. Reboot and add default reason as FIRMWARE_FAILURE
  reboot(reason = "FIRMWARE_FAILURE") {
    return PowerManagerApi.get().reboot(reason)
  }

  getNetflixESN() {
    return new Promise((resolve) => {
      thunder.call('Netflix', 'esn')
        .then(res => {
          resolve(res)
        })
    })
  }

  // get prefered standby mode
  getPreferredStandbyMode() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.System', 'getPreferredStandbyMode').then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getPreferredStandbyMode error:", JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.NETWORK, "PluginError", "Error in Thunder system getPreferredStandbyMode " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  getNetworkStandbyMode() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getNetworkStandbyMode').then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR("AppAPI getNetworkStandbyMode error:", JSON.stringify(err, 3, null))
        Metrics.error(Metrics.ErrorType.NETWORK, "PluginError", "Error in Thunder system getNetworkStandbyMode " + JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getRFCConfig(rfcParamsList) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getRFCConfig', rfcParamsList).then(result => {
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR("AppAPI getRFCConfig error:", JSON.stringify(err, 3, null))
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder system getRFCConfig " + JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setWakeupSrcConfiguration(params) {
    return PowerManagerApi.get().setWakeupSrcConfig(params)
  }

  async sendAppState(value) {
    const state = await thunder
      .call('org.rdk.RDKShell', 'getState', {})
      .then(result => result.state);
    this.state = state;
    let params = { applicationName: value, state: 'stopped' };
    for (let i = 0; i < state.length; i++) {
      if (state[i].callsign == value) {
        if (state[i].state == 'resumed') {
          params.state = 'running';
        } else if (state[i].state == 'suspended') {
          params.state = 'suspended';
        } else {
          params.state = 'stopped'
        }
      }
    }
    await thunder
      .call('org.rdk.Xcast', 'onApplicationStateChanged', params)
      .then(result => result.success);
  }

  // Volume Apis
  getConnectedAudioPorts() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getConnectedAudioPorts', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI getConnectedAudioPorts error:', JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder getConnectedAudioPorts of DisplaySettings " + JSON.stringify(err), false, null)
          reject(false)
        })
    })
  }

  getVolumeLevel(port) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.DisplaySettings', 'getVolumeLevel', { audioPort: port }).then(result => {
        resolve(result)
      }).catch(err => {
        this.ERR('AppAPI getVolumeLevel error:', JSON.stringify(err, 3, null))
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder getVolumeLevel of DisplaySettings " + JSON.stringify(err), false, null)
        reject(false)
      })
    })
  }

  getMuted(port) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getMuted', {
          audioPort: port,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI getMuted error:', JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder getMuted of DisplaySettings " + JSON.stringify(err), false, null)
          reject(false)
        })
    })
  }

  setVolumeLevel(port, volume) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setVolumeLevel', {
          audioPort: port,
          volumeLevel: volume,
        })
        .then(result => {
          this.LOG("AppAPI setVolumeLevel :", JSON.stringify(result))
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI setVolumeLevel error:', JSON.stringify(err))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder setVolumeLevel of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  audio_mute(audio_source, value) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setMuted', {
          audioPort: audio_source,
          muted: value,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI audio_mute setMuted error:', JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder setMuted of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }
  //created only to get the required params
  getPluginStatusParams(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          this.LOG("pluginstatus", result)
          let pluginParams = [result[0].callsign, result[0].state]
          resolve(pluginParams)
        })
        .catch(err => {
          this.ERR("AppAPI getPluginStatusParams error: ", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error in fetching Thunder status@${plugin} of Thunder Controller ${JSON.stringify(err)}`, false, null)
          reject(err)
        })
    })
  }
  //activate autopairing for stack
  activateAutoPairing() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.RemoteControl', 'startPairing', {
          "netType": '1',
          "timeout": '30'
        })
        .then(result => {
          this.LOG("AppAPI activateAutoPairing: ", result)
          resolve(result)
        })
        .catch(err => {
          this.ERR('AppAPI activateAutoPairing error:', JSON.stringify(err, 3, null))
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder startPairing of RemoteControl " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }
  resetBassEnhancer(port) {
    this.LOG("portname", port)
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetBassEnhancer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetBassEnhancer error: ", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder resetBassEnhancer of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        });
    })

  }
  resetDialogEnhancement(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetDialogEnhancement', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetDialogEnhancement error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder resetDialogEnhancement of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        });
    })
  }
  //resetSurroundVirtualizer
  resetSurroundVirtualizer(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetSurroundVirtualizer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetSoundVitualizer error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder resetSurroundVirtualizer of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        });
    })
  }
  //resetVolumeLeveller
  resetVolumeLeveller(port) {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetVolumeLeveller', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetvolumeLevel error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder resetVolumeLeveller of DisplaySettings " + JSON.stringify(err), false, null)
          resolve(false)
        });
    })
  }
  //resetInactivityTime
  resetInactivityTime() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.RDKShell', 'resetInactivityTime')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI resetInactivityTime error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in fetching Thunder resetInactivityTime of RDKShell " + JSON.stringify(err), false, null)
          resolve(false)
        })
    })
  }

  monitorStatus(callsign) {
    return new Promise((resolve) => {
      thunder
        .call('Monitor', 'resetstats', {
          "callsign": callsign
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI monitorStatus error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Error in Thunder fetching resetstats of Monitor " + JSON.stringify(err), false, null)
          resolve(false)
        });
    })
  }

  //{ path: ".cache" }
  deletecache(systemcCallsign, path) {
    return new Promise((resolve) => {
      thunder.call(systemcCallsign, 'delete', { path: path })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI deletecache error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error in Thunder delete of ${systemcCallsign} ${JSON.stringify(err)}`, false, null)
          resolve(false)
        });
    })
  }

  // activate controller plugin
  activateController(callsign) {
    return new Promise((resolve) => {
      thunder
        .call('Controller', 'activate', { callsign: callsign })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI activateController error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error while Thunder Controller activate ${callsign} ${JSON.stringify(err)}`, false, null)
          resolve(false)
        });
    })
  }

  checkStatus(plugin) {
    return new Promise((resolve) => {
      thunder.call('Controller', 'status@' + plugin).then(res => {
        //this.LOG("AppAPI checkStatus ", JSON.stringify(res))
        resolve(res)
      }).catch(err => {
        this.ERR("AppAPI checkStatus error:", err)
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error while Thunder Controller fetching status@${plugin} ${JSON.stringify(err)}`, false, null)
        resolve(false)
      });
    })
  }

  configStatus() {
    //controller.1.configuration
    return new Promise((resolve) => {
      thunder.call('Controller', 'status').then(res => {
        //this.LOG("AppAPI configStatus ",JSON.stringify(res))
        resolve(res)
      }).catch(err => {
        this.ERR("AppAPI configStatus error:", err)
        Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Error while Thunder Controller fetching status ${JSON.stringify(err)}`, false, null)
        resolve(false)
      });
    })
  }

  getAvCodeStatus() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.DeviceDiagnostics', 'getAVDecoderStatus')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          this.ERR("AppAPI getAvCodeStatus error:", err)
          Metrics.error(Metrics.ErrorType.OTHER, "PluginError", 'Error in Thunder fetching getAVDecoderStatus of DeviceDiagnostics' + JSON.stringify(err), false, null)
          resolve(false)
        });
    })
  }
  
  setUILanguage(updatedLanguage) {
    return UserSettingsApi.get().setPresentationLanguage(updatedLanguage)
  }
  
  getUILanguage() {
    return UserSettingsApi.get().getPresentationLanguage(updatedLanguage)
  }

  deeplinkToApp(app = undefined, payload = undefined, launchLocation = "voice", namespace = undefined) {
    return new Promise((resolve, reject) => {
      if (app === undefined || app === "" || payload == undefined) {
        this.ERR("AppApi: deeplinkToApp '" + app + "' not possible with payload '" + payload + "'.");
        Metrics.error(Metrics.ErrorType.OTHER, "AppError", `AppApi: deeplinkToApp ${app} not possible with payload ${payload}`, false, null)
        resolve(false);
      } else if (app.startsWith("YouTube")) {
        let url = Storage.get(app + "DefaultURL").toString();
        url = url.substring(0, url.indexOf('?'));
        if (!url.endsWith("?")) url += "?";
        url += ((GLOBALS.topmostApp === app) ? "inApp=true" : "inApp=false");
        // For the timebeing Alexa alone. Revisit when we have other voice sysyems.
        url += "&launch=voice" + "&vs=" + ((launchLocation === "alexa") ? 2 : 0);

        if (namespace === "ExternalMediaPlayer") {
          // Received sample : {"payload":{"playbackContextToken":"{deeplinkMethodType=PLAY, searchString='cat videos'}"}}
          url += "&va=" + ((payload.playbackContextToken.includes("deeplinkMethodType=PLAY")) ? "play" : "search");
          if (payload.playbackContextToken.includes("deeplinkMethodType")) {
            let searchString = payload.playbackContextToken.replace(/[{}]/g, '').split(',');
            for (let i = 0; i < searchString.length; i++) {
              if (searchString[i].includes("searchString")) {
                let data = searchString[i].split('=').slice(1)[0].replace(/'/g, '');
                url += "&vaa=" + encodeURI(data.trim());
                break;
              }
            }
          }
        } else if (namespace === "Alexa.SeekController") {
          let time = payload.deltaPositionMilliseconds / 1000
          let minutes = Math.abs(parseInt(time / 60))
          let seconds = Math.abs(parseInt(time % 60))
          url += "&va=" + ((time < 0) ? "mediaRewind" : "mediaFastForward") + "&vaa=" + minutes + "m" + seconds + "s";
        } else if (namespace === "Alexa.PlaybackController") {
          let playbackOperations = new Set(["Play", "Pause", "FastForward", "Rewind", "Shuffle", "Repeat"])
          if (playbackOperations.has(payload)) {
            url += "&va=media" + payload;
          } else if (payload === "Next" || payload === "Previous") {
            url += "&va=media" + payload + "Video";
          }
        }
        this.INFO("AppApi: deeplinkToApp " + app + " url - " + url);
        thunder.call(app, 'deeplink', url);
      } else if (app === "Amazon") {
        // TODO: no deeplink format support.
        this.ERR("AppApi: deeplinkToApp '" + app + "' not supported.");
        Metrics.error(Metrics.ErrorType.OTHER, "AppDeeplinkError", JSON.stringify(err), false, null)
        reject(false);
      } else if (app === "Netflix") {
        // TODO: no deeplink format support.
        this.ERR("AppApi: deeplinkToApp '" + app + "' not supported.");
        Metrics.error(Metrics.ErrorType.OTHER, "AppDeeplinkError", JSON.stringify(err), false, null)
        reject(false);
      } else {
        this.ERR("AppApi: deeplinkToApp '" + app + "' not supported.");
        Metrics.error(Metrics.ErrorType.OTHER, "AppDeeplinkError", JSON.stringify(err), false, null)
        reject(false);
      }
    });
  }
}
