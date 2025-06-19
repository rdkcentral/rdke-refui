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
import { Utils, Router, Storage, Settings, Language } from '@lightningjs/sdk';
import ThunderJS from 'ThunderJS';
import routes from './routes/routes';
import AppApi from '../src/api/AppApi.js';
import XcastApi from '../src/api/XcastApi';
import { CONFIG, GLOBALS, availableLanguageCodes } from './Config/Config';
import Keymap from './Config/Keymap';
import Menu from './views/Menu'
import Failscreen from './screens/FailScreen';
import { keyIntercept } from './keyIntercept/keyIntercept';
import HDMIApi from './api/HDMIApi';
import Volume from './tvOverlay/components/Volume';
import DTVApi from './api/DTVApi';
import TvOverlayScreen from './tvOverlay/TvOverlayScreen';
import ChannelOverlay from './MediaPlayer/ChannelOverlay';
import SettingsOverlay from './overlays/SettingsOverlay';
import { AlexaLauncherKeyMap, PlaybackStateReport, VolumePayload } from './Config/AlexaConfig';
import AppCarousel from './overlays/AppCarousel';
import VideoScreen from './screens/Video';
import VideoInfoChange from './overlays/VideoInfoChange/VideoInfoChange.js';
import Failscreen1 from './screens/FailScreen';
import CECApi from './api/CECApi';
import { appListInfo } from "./../static/data/AppListInfo.js";
import VoiceApi from './api/VoiceApi.js';
import AlexaApi from './api/AlexaApi.js';
import AAMPVideoPlayer from './MediaPlayer/AAMPVideoPlayer';
import FireBoltApi from './api/firebolt/FireBoltApi';
import PinChallengeProvider from './api/firebolt/provider/PinChallengeProvider';
import AckChallengeProvider from './api/firebolt/provider/AckChallengeProvider';
import KeyboardUIProvider from './api/firebolt/provider/KeyboardUIProvider';
import { AcknowledgeChallenge, Keyboard, PinChallenge } from '@firebolt-js/manage-sdk'
import PersistentStoreApi from './api/PersistentStore.js';
import { Localization, Metrics } from '@firebolt-js/sdk';
import RDKShellApis from './api/RDKShellApis.js';
import Miracast from './api/Miracast.js';
import MiracastNotification from './screens/MiracastNotification.js';


var powerState = 'ON';
var AlexaAudioplayerActive = false;
var thunder = ThunderJS(CONFIG.thunderConfig);
var appApi = new AppApi();
var dtvApi = new DTVApi();
var cecApi = new CECApi();
var xcastApi = new XcastApi();
var voiceApi = new VoiceApi();
var miracast = new Miracast();

export default class App extends Router.App {

  _handleAppClose() {
    this.application.closeApp();
  }
  static getFonts() {
    return [{ family: 'Play', url: Utils.asset('fonts/Play/Play-Regular.ttf') }];
  }


  _setup() {
    console.log("accelerator-home-ui version: " + Settings.get("platform", "version"));
    console.log("UI setup selfClientName:" + GLOBALS.selfClientName + ", current topmostApp:", GLOBALS.topmostApp);
    Storage.set("ResolutionChangeInProgress", false);
    Router.startRouter(routes, this);
    document.onkeydown = e => {
      if (e.keyCode == Keymap.Backspace) {
        e.preventDefault();
      }
    };

    function updateAddress() {
      if (window.navigator.onLine) {
        console.log(`is online`);
      }
      else {
        Storage.set("ipAddress", null);
        console.log(`is offline`)
      }
    }
    window.addEventListener("offline", updateAddress)
  }

  static _template() {
    return {
      Pages: {
        // this hosts all the pages
        forceZIndexContext: true
      },
      Widgets: {
        VideoInfoChange: {
          type: VideoInfoChange
        },
        Menu: {
          type: Menu
        },
        Fail: {
          type: Failscreen,
        },
        Volume: {
          type: Volume
        },
        TvOverlays: {
          type: TvOverlayScreen
        },
        ChannelOverlay: {
          type: ChannelOverlay
        },
        SettingsOverlay: {
          type: SettingsOverlay
        },
        AppCarousel: {
          type: AppCarousel
        },
        MiracastNotification: {
          zIndex: 999,
          type:MiracastNotification
        }
      },
      VideoScreen: {
        alpha: 0,
        w: 2000,
        h: 1500,
        zIndex: 999,
        type: VideoScreen
      },
      Failscreen1: {
        alpha: 0,
        type: Failscreen1
      },
      AAMPVideoPlayer: {
        type: AAMPVideoPlayer
      },
      ScreenSaver: {
        alpha: 0,
        w: 2000,
        h: 1500,
        zIndex: 999,
        src: Utils.asset('images/tvShows/fantasy-island.jpg')
      }
    }
  }

  static language() {
    return {
      file: Utils.asset('language/language-file.json'),
      language: ("ResidentApp" === GLOBALS.selfClientName ? CONFIG.language :Localization.language()) || 'en'
    }
  }

  $updateTimeZone(timezone) {
    this.tag('Menu').updateTimeZone(timezone)
  }

  _captureKey(key) {
    console.log("Got keycode : " + JSON.stringify(key.keyCode))
    console.log("powerState ===>", GLOBALS.powerState)
    if(GLOBALS.powerState !=="ON") {
      appApi.setPowerState("ON").then(res => {
        res.success ? console.log("successfully set the power state to ON from ", GLOBALS.powerState) : console.log("Failure while turning ON the device")
      })
      return true
    }
    this.$hideImage(0);
    return this._performKeyPressOPerations(key)
  }
  _performKeyPressOPerations(key) {
    let self = this;
    if ((key.keyCode == Keymap.Home || key.keyCode == Keymap.Escape)  && !Router.isNavigating()) {
      if (GLOBALS.topmostApp.includes("dac.native")) {
        this.jumpToRoute("apps");
      }
      else if (GLOBALS.Miracastclientdevicedetails.state==="INITIATED"||GLOBALS.Miracastclientdevicedetails.state==="INPROGRESS ")
      {
        miracast.stopClientConnection(GLOBALS.Miracastclientdevicedetails.mac,GLOBALS.Miracastclientdevicedetails.name)
      }
      else if(GLOBALS.Miracastclientdevicedetails.state==="PLAYING")
      {
        miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac,GLOBALS.Miracastclientdevicedetails.name,300)
      }
      else {
        this.jumpToRoute("menu"); //method to exit the current app(if any) and route to home screen
      }
      return true
    }
    else if (key.keyCode == Keymap.Inputs_Shortcut && !Router.isNavigating()) { //for inputs overlay
      if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
        if (Router.getActiveHash() === "tv-overlay/inputs") {
          Router.reload();
        } else {
          Router.navigate("tv-overlay/inputs", false);
        }
        this._moveApptoFront(GLOBALS.selfClientName, true)
      } else {
        if (Router.getActiveHash() === "dtvplayer") {
          Router.focusWidget('TvOverlays');
          Router.getActiveWidget()._setState("OverlayInputScreen")
        }
      }
      return true
    }
    else if (key.keyCode == Keymap.Picture_Setting_Shortcut && !Router.isNavigating()) { //for video settings overlay
      if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
        if (Router.getActiveHash() === "tv-overlay/settings") {
          Router.reload();
        } else {
          Router.navigate("tv-overlay/settings", false);
        }
        this._moveApptoFront(GLOBALS.selfClientName, true)
      } else {
        if (Router.getActiveHash() === "dtvplayer") {
          Router.focusWidget('TvOverlays');
          Router.getActiveWidget()._setState("OverlaySettingsScreen")
        }
      }
      return true;
    }
    else if (key.keyCode == Keymap.Settings_Shortcut && !Router.isNavigating()) {
      if (GLOBALS.topmostApp === GLOBALS.selfClientName) { //launch settings overlay/page depending on the current route.
        if (Router.getActiveHash() === "player" || Router.getActiveHash() === "dtvplayer" || Router.getActiveHash() === "usb/player") { //player supports settings overlay, so launch it as overlay
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "SettingsOverlay") { //currently focused on settings overlay, so hide it
            Router.focusPage();
          }
          else { //launch the settings overlay
            Router.focusWidget('SettingsOverlay');
          }
        } else { //navigate to settings page for all other routes
          Router.navigate("settings")
        }
      } else { //currently on some application
        if (Router.getActiveHash() === "applauncher") { //if route is applauncher just focus the overlay widget
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "SettingsOverlay") { //currently focused on settings overlay, so hide it
            Router.focusPage();
            this._moveApptoFront(GLOBALS.topmostApp, true)
          }
          else { //launch the settings overlay
            this._moveApptoFront(GLOBALS.selfClientName, true)
            Router.focusWidget('SettingsOverlay');
          }
        } else { //if on some other route while on an application, route to applauncher before launching the settings overlay
          this._moveApptoFront(GLOBALS.selfClientName, true)
          Router.navigate("applauncher");
          Router.focusWidget('SettingsOverlay');
        }
      }
      return true;
    }
    else if (key.keyCode == Keymap.Guide_Shortcut && !Router.isNavigating()) {
      this.jumpToRoute("epg"); //method to exit the current app(if any) and route to home screen
      return true
    }
    else if (key.keyCode == Keymap.Amazon && !Router.isNavigating()) {
      return this.launchFeaturedApp( "Amazon")
    }
    else if (key.keyCode == Keymap.Youtube && !Router.isNavigating()) {
      this.launchFeaturedApp("YouTube")
      return true
    }
    else if (key.keyCode == Keymap.Netflix && !Router.isNavigating()) { //launchLocation mapping is in launchApp method in AppApi.js
      this.launchFeaturedApp("Netflix")
      return true
    }
    else if (key.keyCode == Keymap.AppCarousel && !Router.isNavigating()) {
      if (GLOBALS.topmostApp === GLOBALS.selfClientName) { // if resident app is on focus
        if (Router.getActiveHash() === "menu") {
          return true;
        }
        else if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on appcarousel, so hide it
          Router.focusPage();
        }
        else { //launch the app carousel
          Router.focusWidget("AppCarousel")
        }
      } else { //currently on some application
        if (Router.getActiveHash() === "applauncher") { //if route is applauncher just focus the overlay widget
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on settings overlay, so hide it
            Router.focusPage();
            this._moveApptoFront(GLOBALS.topmostApp, true)
          }
          else { //launch the settings overlay
            this._moveApptoFront(GLOBALS.selfClientName, true)
            Router.focusWidget('AppCarousel');
          }
        } else { //if on some other route while on an application, route to applauncher before launching the settings overlay
          this._moveApptoFront(GLOBALS.selfClientName, true)
          Router.navigate("applauncher");
          Router.focusWidget('AppCarousel');
        }
      }
      return true
    }
    else if (key.keyCode == Keymap.Power) {
      // Remote power key and keyboard F1 key used for STANDBY and POWER_ON
      return this._powerKeyPressed()
    } else if (key.keyCode === Keymap.AudioVolumeMute && !Router.isNavigating()) {
      if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
        this.tag("Volume").onVolumeMute();
      } else {
        console.log("muting on some app")
        if (Router.getActiveHash() === "applauncher") {
          console.log("muting on some app while route is app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          this.tag("Volume").onVolumeMute();
        } else {
          console.log("muting on some app while route is NOT app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeMute();
        }
      }
      return true
    } else if (key.keyCode == Keymap.AudioVolumeUp && !Router.isNavigating()) {
      if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
        this.tag("Volume").onVolumeKeyUp();
      } else {
        console.log("muting on some app")
        if (Router.getActiveHash() === "applauncher") {
          console.log("muting on some app while route is app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          this.tag("Volume").onVolumeKeyUp();
        } else {
          console.log("muting on some app while route is NOT app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeKeyUp();
        }
      }
      return true
    } else if (key.keyCode == Keymap.AudioVolumeDown && !Router.isNavigating()) {
      if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
        this.tag("Volume").onVolumeKeyDown();
      } else {
        console.log("muting on some app")
        if (Router.getActiveHash() === "applauncher") {
          console.log("muting on some app while route is app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          this.tag("Volume").onVolumeKeyDown();
        } else {
          console.log("muting on some app while route is NOT app launcher")
          RDKShellApis.moveToFront(GLOBALS.selfClientName)
          RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeKeyDown();
        }
      }
      return true
    } else {
      return false
    }
  }

  AvDecodernotificationcall() {
    thunder.on('org.rdk.DeviceDiagnostics', 'onAVDecoderStatusChanged', notification => {
      console.log(new Date().toISOString() + "AvDecoderStatusNotification: ", JSON.stringify(notification))
    })
  }

  userInactivity() {
    PersistentStoreApi.get().activate().then(() => {
      PersistentStoreApi.get().getValue('ScreenSaverTime', 'timerValue').then(result => {
        // check if result has value property and if it is not undefined^M
        if (result && result.value && result.value !== undefined && result.value !== "Off") {
          console.log("App PersistentStoreApi screensaver timer value is: " + result.value);
          RDKShellApis.enableInactivityReporting(true).then(() => {
            RDKShellApis.setInactivityInterval(result.value).then(() => {
              this.userInactivity = thunder.on('org.rdk.RDKShell', 'onUserInactivity', notification => {
                console.log("UserInactivityStatusNotification: ", JSON.stringify(notification))
                appApi.getAvCodeStatus().then(result => {
                  console.log("Avdecoder", result.avDecoderStatus);
                  if ((result.avDecoderStatus === "IDLE" || result.avDecoderStatus === "PAUSE") && GLOBALS.topmostApp === "") {
                    this.$hideImage(1);
                  }
                })
              })
            })
          });
        } else {
          console.warn("App PersistentStoreApi screensaver timer value is not set or is Off.")
          RDKShellApis.enableInactivityReporting(false).then(() => {
            this.userInactivity.dispose();
          })
        }
      }).catch(err => {
        console.error("App PersistentStoreApi getValue error: " + JSON.stringify(err));
        RDKShellApis.enableInactivityReporting(false).then(() => {
          this.userInactivity.dispose();
        })
      });
    }).catch(err => {
      console.error("App PersistentStoreApi activation error: " + JSON.stringify(err));
      reject(err);
    });
  }

  $hideImage(alpha) {
    if (alpha === 1) {
      this.tag("Widgets").visible = false;
      this.tag("Pages").visible = false;
    }
    else {
      this.tag("Widgets").visible = true;
      this.tag("Pages").visible = true;
    }
    this.tag("VideoScreen").alpha = alpha;
    // this.tag("ScreenSaver").alpha = alpha;
  }
  _init() {

    let self = this;
    self.appIdentifiers = {
      "YouTubeTV": "n:4",
      "YouTube": "n:3",
      "Netflix": "n:1",
      "Amazon Prime": "n:2",
      "Amazon": "n:2",
      "Prime": "n:2"
    }
    appApi.getPowerStateIsManagedByDevice().then(res => {
      if (!res.powerStateManagedByDevice) {
        this._getPowerStatebeforeReboot();
      } else {
        appApi.getPowerState().then(res => {
          GLOBALS.powerState = res.success ? res.powerState : "ON";
        });
      }
    }).catch(err => this._getPowerStatebeforeReboot());
    keyIntercept(GLOBALS.selfClientName).catch(err => {
      console.error("App _init keyIntercept err:", JSON.stringify(err));
    });
    this.userInactivity();
    this._registerFireboltListeners()

    Keyboard.provide('xrn:firebolt:capability:input:keyboard', new KeyboardUIProvider(this))
    console.log("Keyboard provider registered")
    PinChallenge.provide('xrn:firebolt:capability:usergrant:pinchallenge', new PinChallengeProvider(this))
    console.log("PinChallenge provider registered")
    AcknowledgeChallenge.provide('xrn:firebolt:capability:usergrant:acknowledgechallenge', new AckChallengeProvider(this))
    console.log("Acknowledge challenge provider registered")

    appApi.deviceType().then(result => {
      console.log("App detected deviceType as:", ((result.devicetype != null) ? result.devicetype : "tv"));
      Storage.set("deviceType", ((result.devicetype != null) ? result.devicetype : "tv"));
    });
    thunder.Controller.activate({ callsign: 'org.rdk.UserPreferences' }).then(result => {
      console.log("App UserPreferences plugin activation result: " + result)
    }).catch(err => {
      console.error("App UserPreferences plugin activation error: " + JSON.stringify(err));
      Metrics.error(Metrics.ErrorType.OTHER, 'PluginError', "Thunder Controller Activate error " + JSON.stringify(err), false, null)
    })
    thunder.Controller.activate({ callsign: 'org.rdk.System' }).then(result => {
      console.log("App System plugin activation result: " + result)
      appApi.setNetworkStandbyMode().then(result => {
        if (!result.success) {
          console.warn("App RFC setNetworkStandbyMode returned false; trying updated API.")
          let param = {
            wakeupSources: [
              {
                "WAKEUPSRC_WIFI": true,
                "WAKEUPSRC_IR": true,
                "WAKEUPSRC_POWER_KEY": true,
                "WAKEUPSRC_CEC": true,
                "WAKEUPSRC_LAN": true
              }
            ]
          }
          appApi.setWakeupSrcConfiguration(param);
        }
      })
    }).catch(err => {
      console.error("App System plugin activation error: " + JSON.stringify(err));
    })
    appApi.getPluginStatus("org.rdk.DeviceDiagnostics").then(res => {
      console.log("App DeviceDiagnostics state:", res[0].state)
      if (res[0].state === "deactivated") {
        thunder.Controller.activate({ callsign: 'org.rdk.DeviceDiagnostics' }).then(() => {
          this.AvDecodernotificationcall();
        }).catch(err => {
          console.error("App DeviceDiagnostics plugin activation error: " + JSON.stringify(err));
        })
      }
      else {
        this.AvDecodernotificationcall();
      }
    })

    appApi.getHDCPStatus().then(result => {
      Storage.set("UICacheonDisplayConnectionChanged", result.isConnected);
    })

    if (GLOBALS.topmostApp !== "HDMI") { //to default to hdmi, if previous input was hdmi
      GLOBALS.topmostApp = GLOBALS.selfClientName;//to set the application type to none
    }
    GLOBALS.LastvisitedRoute=Storage.get("lastVisitedRoute")
    GLOBALS.Setup=Storage.get("setup")
    Storage.set("lastVisitedRoute", "menu"); //setting to menu so that it will be always defaulted to #menu
    GLOBALS.LastvisitedRoute="menu";
    appApi.enableDisplaySettings().then(res => { console.log(`results : ${JSON.stringify(res)}`) }).catch(err => {
      console.error("error while enabling displaysettings:" + JSON.stringify(err));
    })
    appApi.cobaltStateChangeEvent()

    this.xcastApi = new XcastApi()
    this.xcastApi.activate().then(result => {
      let serialNumber;
      try {
        appApi.getSerialNumber().then(res => {
          serialNumber = res;
          console.log("App getSerialNumber result:", serialNumber);
          appApi.getModelName().then(modelName => {
            let friendlyName = modelName + "_" + serialNumber;
            this.xcastApi.setFriendlyName(friendlyName).then(  async (result) => {
            try {
              await xcastApi.setStandbyBehavior("active").then(async res =>{
                  await appApi.getPluginStatus("Cobalt").then(async res=>{
                    let params = {"applications": []}
                    params.applications.push({
                        "names": ["YouTube"],
                        "prefixes": ["myYouTube"],
                        "cors": [".youtube.com"],
                        "properties": { "allowStop": true },
                        "launchParameters": { "query": "source_type=12","payload": "..." }
                    })
                    await xcastApi.registerApplications(params).then(res=>{
                    })
                  })
                  await appApi.getPluginStatus("Amazon").then(async res=>{
                    let params = {"applications": []}
                    params.applications.push({
                        "names": ["AmazonInstantVideo"],
                        "prefixes": ["myPrimeVideo"],
                        "cors": [".amazon.com"],
                        "properties": { "allowStop": true },
                        "launchParameters": { "query": "source_type=12","payload": "..." }
                    })
                    await xcastApi.registerApplications(params).then(res=>{
                    })
                  })
                  await appApi.getPluginStatus("Netflix").then(async res=>{
                    let params = {"applications": []}
                    params.applications.push({
                        "names": ["Netflix"],
                        "prefixes": ["myNetflix"],
                        "cors": [".netflix.com"],
                        "properties": { "allowStop": true },
                        "launchParameters": { "query": "source_type=12","payload": "..." }
                    })
                    await xcastApi.registerApplications(params).then(res=>{
                    })
                  })
                  console.log("Xcast register app param " + JSON.stringify(params))
              })
          } catch (error) {
              console.error( "plugin check and registerapllication error for register" +error)
          }
              console.log("App XCAST setFriendlyName result:", result);
            }).catch(error => {
              console.error("App Error setting friendlyName:", error);
            });
          }).catch(error => {
            console.error("App Error retrieving modelName:", error);
          });
        }).catch(error => {
          console.error("App Error getSerialNumber:", error);
        });
      } catch (error) {
        console.log(error);
      }
      if (result) {
        this.registerXcastListeners()
      }
    })

    thunder.on('Controller.1', 'all', noti => {
      console.log("App controller notification:", noti)
      if ((noti.data.url && noti.data.url.slice(-5) === "#boot") || (noti.data.httpstatus && noti.data.httpstatus != 200 && noti.data.httpstatus != -1)) { // to exit metro apps by pressing back key & to auto exit webapp if httpstatus is not 200
        appApi.exitApp(GLOBALS.topmostApp);
      }
      // TODO: make the check based on XcastApi.supportedApps() list
      if (Object.prototype.hasOwnProperty.call(noti, "callsign") && (noti.callsign.startsWith("YouTube") || noti.callsign.startsWith("Amazon") || noti.callsign.startsWith("Netflix"))) {
        let params = { applicationName: noti.callsign, state: 'stopped' };
        switch (noti.data.state) {
          case "activated":
          case "resumed":
            params.state = 'running';
            break;
          case "Activation":
          case "deactivated":
          case "Deactivation":
            params.state = 'stopped';
            break;
          case "hibernated":
          case "suspended":
            params.state = 'suspended';
            break;
          case "Precondition":
            break;
        }
        if (noti.callsign.startsWith("Amazon")) {
          params.applicationName = "AmazonInstantVideo";
        }
        console.log("App Controller state change to xcast: ", JSON.stringify(params));
        this.xcastApi.onApplicationStateChanged(params);
        params = null;
      }
      if (noti.callsign === "org.rdk.HdmiCecSource") {
        this.SubscribeToHdmiCecSourcevent(noti.data.state,self.appIdentifiers)
      }
      if (noti.callsign === "org.rdk.MiracastPlayer") {
        if(noti.data.state==="activated"){
          console.log("subscribing the events for player")
          this.SubscribeToMiracastPlayer()
        }
      }
      if (noti.callsign === "org.rdk.MiracastService") {
        if(noti.data.state==="activated"){
          console.log("subscribing the events for Service")
          this.SubscribeToMiracastService()
        }
      }
    })
    this._subscribeToRDKShellNotifications()
    appApi.getPluginStatus("Cobalt").then(() => {
      /* Loop through YouTube variants and set respective urls. */
      JSON.parse(JSON.stringify(appListInfo)).forEach(appInfo => {
        if (Object.prototype.hasOwnProperty.call(appInfo, "applicationType") && appInfo.applicationType.startsWith("YouTube") && Object.prototype.hasOwnProperty.call(appInfo, "uri") && appInfo.uri.length) {
          thunder.Controller.clone({ callsign: "Cobalt", newcallsign: appInfo.applicationType }).then(result => {
            console.log("App Controller.clone Cobalt as " + appInfo.applicationType + " done.", result);
          }).catch(err => {
            console.error("App Controller clone Cobalt for " + appInfo.applicationType + " failed: ", err);
            Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Controller clone Cobalt for ${appInfo.applicationType} failed: ${err}`, false, null)
            // TODO: hide YouTube Icon and listing from Menu, AppCarousel, Channel overlay and EPG page.
          })

          appApi.getPluginStatus(appInfo.applicationType).then(res => {
            if (res[0].state !== "deactivated") {
              thunder.Controller.deactivate({ callsign: appInfo.applicationType }).catch(err => {
                console.error("App Controller.deactivate " + appInfo.applicationType + " failed. It may not work.", err);
                Metrics.error(Metrics.ErrorType.OTHER, "pluginError", `App Controller.deactivate failed for ${appInfo.applicationType} with ${err}`, false, null)
              })
            }
            /* Do not change YouTube's configuration as Page-visibility test runs on that. */
            if (res[0].callsign !== "YouTube") {
              thunder.call('Controller', `configuration@${appInfo.applicationType}`).then(result => {
                /* Ensure appending '?' so that later params can be directly appended. */
                result.url = appInfo.uri + "?"; // Make sure that appListInfo.js has only base url.
                thunder.call('Controller', `configuration@${appInfo.applicationType}`, result).then(() => {
                  Storage.set(appInfo.applicationType + "DefaultURL", appInfo.uri + "?"); // Make sure that appListInfo.js has only base url.
                }).catch(err => {
                  console.error("App Controller.configuration@" + appInfo.applicationType + " set failed. It may not work." + JSON.stringify(err));
                  Metrics.error(Metrics.ErrorType.OTHER, "pluginError", `App Controller.configuration for ${appInfo.applicationType} set failed. It may not work. ${JSON.stringify(err)}`, false, null)
                })
              }).catch(err => {
                console.error("App Controller.configuration@" + appInfo.applicationType + " get failed. It may not work." + JSON.stringify(err));
                Metrics.error(Metrics.ErrorType.OTHER, "pluginError", `App Controller.configuration@ for ${appInfo.applicationType} failed with ${JSON.stringify(err)}`, false, null)
              })
            } else {
              /* Just store the plugin configured url as default url and ensure '?' is appended. */
              Storage.set(appInfo.applicationType + "DefaultURL", (res[0].configuration.url.includes('?') ? res[0].configuration.url : res[0].configuration.url + "?"));
            }
          }).catch(err => {
            console.error("App getPluginStatus " + appInfo.applicationType + " Error: " + JSON.stringify(err));
          })
        }
      });
    }).catch(err => {
      console.error("App getPluginStatus Cobalt error: ", err);
    })
    //video info change events begin here---------------------
    /********************   RDKUI-341 CHANGES - DEEP SLEEP/LIGHT SLEEP **************************/
    this._subscribeToControlNotifications()
    let cachedPowerState = Storage.get('SLEEPING');
    console.log('cached power state', cachedPowerState)
    console.log(typeof cachedPowerState)
    if (cachedPowerState) {
      appApi.getWakeupReason().then(result => {
        if (result.result.wakeupReason !== 'WAKEUP_REASON_UNKNOWN') {
          cachedPowerState = 'ON'
        }
      })
      appApi.setPowerState(cachedPowerState).then(result => {
        if (result.success) {
          console.log("successfully set powerstate to: " + cachedPowerState)
        }
      })
    }
    appApi.getPluginStatus('org.rdk.MiracastPlayer').then(result => {
      if (result[0].state === "activated")
      {
        this.SubscribeToMiracastPlayer()
      }
      else
      {
        miracast.activatePlayer().then((res)=>{
          console.log("activating the miracst player from app.js "+ res)
        }).catch((err) => console.error(err))
      }
    })
    appApi.getPluginStatus('org.rdk.MiracastService').then(result => {
      if (result[0].state === "activated")
      {
        miracast.getEnable().then((res)=>{
          if(!res.enabled)
          {
            miracast.setEnable(true)
          }
        })
        this.SubscribeToMiracastService()
      }
      else
      {
        miracast.activateService().then((res)=>{
          miracast.getEnable().then(async (res)=>{
            if(!res.enabled)
            {
              await miracast.setEnable(true)
            }
          })
          console.log("activating the miracst Service from app.js "+ res)
        }).catch((err) => console.error(err))
      }
    })
    /********************   RDKUI-303 - PAGE VISIBILITY API **************************/

    //ACTIVATING HDMI CEC PLUGIN
    appApi.getPluginStatus('org.rdk.HdmiCecSource').then(result => {
      if (result[0].state === "activated")
      {
        this.SubscribeToHdmiCecSourcevent(result[0].state,self.appIdentifiers)
        let getfriendlyname, getosdname;
          setTimeout(() => {
            xcastApi.getFriendlyName().then(res => {
              getfriendlyname = res.friendlyname;
              console.log("XcastApi getFriendlyName :" + getfriendlyname);
            }).catch(err => {
              console.error('XcastApi getFriendlyName Error: ', err);
            })
            cecApi.getOSDName().then(result => {
              getosdname = result.name;
              console.log("CECApi getOSDName :" + getosdname);
              if (getfriendlyname !== getosdname) {
                cecApi.setOSDName(getfriendlyname);
              }
            }).catch(err => {
              console.error('CECApi getOSDName Error :', err);
            })
          }, 5000);
          cecApi.getActiveSourceStatus().then((res) => {
            Storage.set("UICacheCECActiveSourceStatus", res);
            console.log("App getActiveSourceStatus: " + res + " UICacheCECActiveSourceStatus:" + Storage.get("UICacheCECActiveSourceStatus"));
          });
      }
      else
      {
        cecApi.activate().then(() => {
          let getfriendlyname, getosdname;
          setTimeout(() => {
            xcastApi.getFriendlyName().then(res => {
              getfriendlyname = res.friendlyname;
              console.log("XcastApi getFriendlyName :" + getfriendlyname);
            }).catch(err => {
              console.error('XcastApi getFriendlyName Error: ', err);
            })
            cecApi.getOSDName().then(result => {
              getosdname = result.name;
              console.log("CECApi getOSDName :" + getosdname);
              if (getfriendlyname !== getosdname) {
                cecApi.setOSDName(getfriendlyname);
              }
            }).catch(err => {
              console.error('CECApi getOSDName Error :', err);
            })
          }, 5000);
          cecApi.getActiveSourceStatus().then((res) => {
            Storage.set("UICacheCECActiveSourceStatus", res);
            console.log("App getActiveSourceStatus: " + res + " UICacheCECActiveSourceStatus:" + Storage.get("UICacheCECActiveSourceStatus"));
          });
        }).catch((err) => console.log(err))
      }
    })
    this._subscribeToIOPortNotifications()

    this._updateLanguageToDefault()
  }

  SubscribeToMiracastService() {
    thunder.on('org.rdk.MiracastService.1', 'onClientConnectionRequest', data => {
    console.log('onClientConnectionRequest ' + JSON.stringify(data));
    this.tag("MiracastNotification").notify(data)
    if(GLOBALS.topmostApp===GLOBALS.selfClientName)
    {
      Router.focusWidget("MiracastNotification")
    }

    else{
      this._moveApptoFront(GLOBALS.selfClientName, true)
      Router.navigate("applauncher");
      Router.focusWidget("MiracastNotification")
    }
    });
    thunder.on('org.rdk.MiracastService.1', 'onLaunchRequest', data => {
    miracast.playRequest(
        data.device_parameters.source_dev_ip,
        data.device_parameters.source_dev_mac ,
        data.device_parameters.source_dev_name,
        data.device_parameters.sink_dev_ip,
        0,
        0,
        1920,
        1080,
    )
    console.log('onLaunchRequest ' + JSON.stringify(data));
    });
    thunder.on('org.rdk.MiracastService.1', 'onClientConnectionError', data => {
      if(data.name===GLOBALS.Miracastclientdevicedetails.name)
      {
        miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac,GLOBALS.Miracastclientdevicedetails.name,300)
      }
      if(GLOBALS.topmostApp===GLOBALS.selfClientName)
      {
        this.tag("Fail").notify({title:Language.translate("Miracast Status"),msg:`${Language.translate("Reason Code :")}  ${data.error_code} ${Language.translate("Reason :")}${data.reason} `})
        Router.focusWidget("Fail")
      }

      else{
        this._moveApptoFront(GLOBALS.selfClientName, true)
        Router.navigate("applauncher");
        this.tag("Fail").notify({title:Language.translate("Miracast Status"),msg:`${Language.translate("Reason Code :")} ${data.error_code} ${Language.translate("Reason :")}${data.reason} `})
        Router.focusWidget("Fail")
      }
    console.log('onClientConnectionError ' + JSON.stringify(data));
    });
  }

  SubscribeToMiracastPlayer() {
    thunder.on('org.rdk.MiracastPlayer.1', 'onStateChange', data => {
      GLOBALS.Miracastclientdevicedetails=data
      if(data.state==="PLAYING")
      {
        if (GLOBALS.topmostApp != GLOBALS.selfClientName) {
          appApi.exitApp(GLOBALS.topmostApp).then(()=>{

              RDKShellApis.setVisibility(GLOBALS.topmostApp,GLOBALS.topmostApp,false)
              miracast.updatePlayerState(data.mac,data.state,data.reason_code,data.reason)
          }).catch(err => {
            console.log("exitapp err: " + err)
          });}
          else{
            RDKShellApis.setVisibility(GLOBALS.selfClientName,GLOBALS.selfClientName,false)
            miracast.updatePlayerState(data.mac,data.state,data.reason_code,data.reason)
          }

      }
      if(data.state === "STOPPED")
      {
        RDKShellApis.setVisibility(GLOBALS.selfClientName,true)
        Router.navigate(GLOBALS.LastvisitedRoute);
        if(data.reason_code!=200){
          if(GLOBALS.topmostApp===GLOBALS.selfClientName)
          {
            this.tag("Fail").notify({title:Language.translate("Miracast Status"),msg:`${Language.translate("Reason Code :")} ${data.reason_code} ${Language.translate("Reason :")}${data.reason} `})
            Router.focusWidget("Fail")
          }

          else{
            this._moveApptoFront(GLOBALS.selfClientName, true)
            Router.navigate("applauncher");
            this.tag("Fail").notify({title:Language.translate("Miracast Status"),msg:`${Language.translate("Reason Code :")} ${data.reason_code} ${Language.translate("Reason :")}${data.reason} `})
            Router.focusWidget("Fail")
          }
        }
        miracast.updatePlayerState(data.mac,data.state,data.reason_code,data.reason)
      }
      console.log('onStateChange ' + JSON.stringify(data));
      });
  }

  _subscribeToRDKShellNotifications() {
    thunder.on('org.rdk.RDKShell', 'onApplicationActivated', data => {
      console.warn("[RDKSHELLEVT] onApplicationActivated:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationConnected', data => {
      console.warn("[RDKSHELLEVT] onApplicationConnected:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationDisconnected', data => {
      console.warn("[RDKSHELLEVT] onApplicationDisconnected:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationFirstFrame', data => {
      console.warn("[RDKSHELLEVT] onApplicationFirstFrame:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationLaunched', data => {
      console.warn("[RDKSHELLEVT] onApplicationLaunched:", data);
      if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
        RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
        GLOBALS.topmostApp = data.client;
      }
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationResumed', data => {
      console.warn("[RDKSHELLEVT] onApplicationResumed:", data);
      if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
        RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
        GLOBALS.topmostApp = data.client;
      }
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationSuspended', data => {
      console.warn("[RDKSHELLEVT] onApplicationSuspended:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onApplicationTerminated', data => {
      console.warn("[RDKSHELLEVT] onApplicationTerminated:", data);
      if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp != GLOBALS.selfClientName)) {
        appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
        AlexaApi.get().reportApplicationState("menu", true);
      });
        }
    });
    thunder.on('org.rdk.RDKShell', 'onHibernated', data => {
      console.warn("[RDKSHELLEVT] onHibernated:", data);
      if(data.callsign.startsWith('YouTube'))
      {
        RDKShellApis.removeKeyIntercept({"keyCode": 173, "modifiers": [],"client": data.callsign }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 174, "modifiers": [],"client": data.callsign }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 175, "modifiers": [],"client": data.callsign }).then(res=>{console.warn(JSON.stringify(res))})
      }
      if(data.success)
      {
        if ((GLOBALS.topmostApp === data.client)
        && (GLOBALS.selfClientName === "ResidentApp"|| GLOBALS.selfClientName === "FireboltMainApp-refui")) {
        appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
          AlexaApi.get().reportApplicationState("menu", true);
        });
      }
      }
    });
    thunder.on('org.rdk.RDKShell', 'onRestored', data => {
      console.warn("[RDKSHELLEVT] onRestored:", data);
      if(data.callsign.startsWith('YouTube') )
        {
          RDKShellApis.addKeyIntercepts({"intercepts":[{"keys":[{"keyCode":173,"modifiers":[]},{"keyCode":174,"modifiers":[]},{"keyCode":175,"modifiers":[]}],"client": data.callsign }]}).then(res=>{console.warn(JSON.stringify(res))})
        }
    });
    thunder.on('org.rdk.RDKShell', 'onDestroyed', data => {
      console.warn("[RDKSHELLEVT] onDestroyed:", data);
      // No need to handle this when UI is in Firebolt compatible mode.
      if(data.client.startsWith('YouTube'))
      {
        RDKShellApis.removeKeyIntercept({"keyCode": 173, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 174, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 175, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
      }
      if ((GLOBALS.topmostApp === data.client)
        && (GLOBALS.selfClientName === "ResidentApp"|| GLOBALS.selfClientName === "FireboltMainApp-refui")) {
        appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
          AlexaApi.get().reportApplicationState("menu", true);
        });
      }
    });
    thunder.on('org.rdk.RDKShell', 'onLaunched', data => {
      console.warn("[RDKSHELLEVT] onLaunched:", data);
      miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac,GLOBALS.Miracastclientdevicedetails.name,300)
      if ((data.launchType === "activate") || (data.launchType === "resume")) {
        // Change (Tracked TopMost) UI's visibility to false only for other apps.
        if(data.client.startsWith('YouTube') )
        {
          RDKShellApis.addKeyIntercepts({"intercepts":[{"keys":[{"keyCode":173,"modifiers":[]},{"keyCode":174,"modifiers":[]},{"keyCode":175,"modifiers":[]}],"client": data.client }]}).then(res=>{console.warn(JSON.stringify(res))})
        }
        if ((data.client != GLOBALS.selfClientName)
          && ((GLOBALS.topmostApp === "ResidentApp")
            || (GLOBALS.topmostApp === GLOBALS.selfClientName))) {
          RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
        }
        if (((GLOBALS.topmostApp != "ResidentApp")
          || (GLOBALS.topmostApp != GLOBALS.selfClientName))
          && (GLOBALS.topmostApp != data.client)) {
          appApi.suspendPremiumApp(GLOBALS.topmostApp);
        }
        // Assuming launch is followed by moveToFront & setFocus
        GLOBALS.topmostApp = data.client;
        AlexaApi.get().reportApplicationState(data.client);
      } else if (data.launchType === "suspend") {
        // No need to handle this here when UI is in Firebolt compatible mode.
        // It will be done at RefUI's 'foreground' event handler.
        if(data.client.startsWith('YouTube'))
        {
          RDKShellApis.removeKeyIntercept({"keyCode": 173, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
          RDKShellApis.removeKeyIntercept({"keyCode": 174, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
          RDKShellApis.removeKeyIntercept({"keyCode": 175, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        }
        if ((GLOBALS.topmostApp === data.client)
          && (GLOBALS.selfClientName === "ResidentApp")) {
          appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
            AlexaApi.get().reportApplicationState("menu", true);
          });
        }
      }
    });
    thunder.on('org.rdk.RDKShell', 'onSuspended', data => {
      console.warn("[RDKSHELLEVT] onSuspended:", data);
      // No need to handle this here when UI is in Firebolt compatible mode.
      if(data.client.startsWith('YouTube'))
      {
        RDKShellApis.removeKeyIntercept({"keyCode": 173, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 174, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 175, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
      }
      if ((GLOBALS.topmostApp === data.client)
        && (GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui")) {
        appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
          AlexaApi.get().reportApplicationState("menu", true);
        });
      }
    });
    thunder.on('org.rdk.RDKShell', 'onWillDestroy', data => {
      console.warn("[RDKSHELLEVT] onWillDestroy:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onPluginSuspended', data => {
      console.warn("[RDKSHELLEVT] onPluginSuspended:", data);
      if(data.client.startsWith('YouTube'))
      {
        RDKShellApis.removeKeyIntercept({"keyCode": 173, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 174, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
        RDKShellApis.removeKeyIntercept({"keyCode": 175, "modifiers": [],"client": data.client }).then(res=>{console.warn(JSON.stringify(res))})
      }
      if ((GLOBALS.topmostApp === data.client)
        && (GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui")) {
        appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
          AlexaApi.get().reportApplicationState("menu", true);
        });
      }
    });
    thunder.on('org.rdk.RDKShell', 'onBlur', data => {
      console.warn("[RDKSHELLEVT] onBlur:", data);
    });
    thunder.on('org.rdk.RDKShell', 'onFocus', data => {
      console.warn("[RDKSHELLEVT] onFocus:", data);
    });
  }

  _subscribeToControlNotifications() {
    thunder.on('org.rdk.tv.ControlSettings.1', 'videoFormatChanged', notification => {
      console.log("videoFormatChangedNotification: ", JSON.stringify(notification))
      if (Router.getActiveWidget() == this.widgets.videoinfochange) {
        this.widgets.videoinfochange.update(" New videoFormat :  " + notification.currentVideoFormat, true)
      }
      else {
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New videoFormat :  " + notification.currentVideoFormat)
      }
    })

    thunder.on('org.rdk.tv.ControlSettings.1', 'videoFrameRateChanged', notification => {
      console.log("videoFrameRateChangedNotification: ", JSON.stringify(notification))
      if (Router.getActiveWidget() == this.widgets.videoinfochange) {
        this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate, true)
      }
      else {
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate)
      }
    })

    thunder.on('org.rdk.tv.ControlSettings.1', 'videoResolutionChanged', notification => {
      console.log("videoResolutionChangedNotification: ", JSON.stringify(notification))
      if (Router.getActiveWidget() == this.widgets.videoinfochange) {
        this.widgets.videoinfochange.update(" New video resolution :  " + notification.currentVideoFormat, true)
      }
      else {
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New video resolution :  " + notification.currentVideoFormat)
      }
    })

    thunder.on('Controller', 'statechange', notification => {
      // get plugin status
      console.warn("Controller statechange Notification : " + JSON.stringify(notification))
      if (notification && (notification.callsign.startsWith("YouTube") || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'HtmlApp' || notification.callsign === 'Netflix') && (notification.state == 'Deactivation' || notification.state == 'Deactivated')) {
        console.log(`${notification.callsign} status = ${notification.state}`)
        console.log(">>notification.callsign: ", notification.callsign, " applicationType: ", GLOBALS.topmostApp);
        if (Router.getActiveHash().startsWith("tv-overlay") || Router.getActiveHash().startsWith("overlay") || Router.getActiveHash().startsWith("applauncher")) { //navigate to last visited route when exiting from any app
          console.log("navigating to lastVisitedRoute")
          Router.navigate((GLOBALS.LastvisitedRoute));
        }
        if (notification.callsign === GLOBALS.topmostApp) { //only launch residentApp iff notification is from currentApp
          console.log(notification.callsign + " is in: " + notification.state + " state, and application type in Storage is still: " + GLOBALS.topmostApp + " calling launchResidentApp")
          appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
            AlexaApi.get().reportApplicationState("menu", true);
          });
        }
      }
      if (notification && (notification.callsign === 'org.rdk.HdmiCecSource' && notification.state === 'Activated')) {
        this.advanceScreen = Router.activePage()
        if (typeof this.advanceScreen.performOTPAction === 'function') {
          console.log('otp action')
          this.advanceScreen.performOTPAction()
        }
      }

      if (notification && (notification.callsign.startsWith("YouTube") || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'HtmlApp' || notification.callsign === 'Netflix') && notification.state == 'Activated') {
        GLOBALS.topmostApp = notification.callsign; //required in case app launch happens using curl command.
        if (notification.callsign === 'Netflix') {
          appApi.getNetflixESN()
            .then(res => {
              Storage.set('Netflix_ESN', res)
            })
          thunder.on('Netflix', 'notifyeventchange', notification => {
            console.log(`NETFLIX : notifyEventChange notification = `, JSON.stringify(notification));
            if (notification.EventName === "rendered") {
              Router.navigate('menu')
              if (Storage.get("NFRStatus")) {
                thunder.call("Netflix.1", "nfrstatus", { "params": "enable" }).then(nr => {
                  console.log(`Netflix : nfr enable results in ${nr}`)
                }).catch(nerr => {
                  console.error(`Netflix : error while updating nfrstatus ${nerr}`)
                })
              } else {
                thunder.call("Netflix.1", "nfrstatus", { "params": "disable" }).then(nr => {
                  console.log(`Netflix : nfr disable results in ${nr}`)
                }).catch(nerr => {
                  console.error(`Netflix : error while updating nfrstatus ${nerr}`)
                })
              }

             RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
            }
            if (notification.EventName === "requestsuspend") {
              this.deactivateChildApp('Netflix')
            }
            if (notification.EventName === "updated") {
              console.log(`Netflix : xxxxxxxxxxxxxxxxxx Updated Event Trigger xxxxxxxxxxxxxxxxxxxx`)
              appApi.getNetflixESN()
                .then(res => {
                  Storage.set('Netflix_ESN', res)
                })
            }
          })
        } else {
          RDKShellApis.setFocus(notification.callsign) //required in case app launch happens using curl command.
        }
      }
    });
  }

  _subscribeToIOPortNotifications() {
    //UNPLUG/PLUG HDMI
    let self = this;
    thunder.on("org.rdk.HdcpProfile", "onDisplayConnectionChanged", notification => {
      GLOBALS.previousapp_onActiveSourceStatusUpdated=null
      console.log(new Date().toISOString() + " onDisplayConnectionChanged " + notification.HDCPStatus)
      let temp = notification.HDCPStatus
      if (!Storage.get("ResolutionChangeInProgress") && (temp.isConnected != Storage.get("UICacheonDisplayConnectionChanged"))) {
        if (temp.isConnected) {
          let currentApp = GLOBALS.topmostApp
          if(GLOBALS.previousapp_onDisplayConnectionChanged !== null) {
                currentApp=GLOBALS.previousapp_onDisplayConnectionChanged
              }
          if(currentApp === "ResidentApp" && GLOBALS.Setup) {
            Router.navigate(GLOBALS.LastvisitedRoute);
          }
          let launchLocation = Storage.get(currentApp + "LaunchLocation")
          console.log("App HdcpProfile onDisplayConnectionChanged current app is:"  + currentApp)
          let params = {
            launchLocation: launchLocation,
            appIdentifier: self.appIdentifiers[currentApp]
          }
          if (currentApp.startsWith("YouTube")||currentApp.startsWith("Netflix")) {
            params["url"] = Storage.get(currentApp + "DefaultURL");
            appApi.getPluginStatus(currentApp).then(result => {
              const isAppSuspendedEnabled = Settings.get("platform", "enableAppSuspended");
              const expectedState = isAppSuspendedEnabled ? ["hibernated", "suspended"] : ["deactivated"];
                if (expectedState.includes(result[0].state)) {
                 appApi.launchApp(currentApp, params)
                 .then(()=>GLOBALS.previousapp_onDisplayConnectionChanged=null)
                 .catch(err => {
                  Router.navigate(GLOBALS.LastvisitedRoute)
                 console.error(`Error in launching ${currentApp} : ` + JSON.stringify(err))
                });
              } else {
                console.log("App HdcpProfile onDisplayConnectionChanged skipping; " + currentApp + " is already: " + JSON.stringify(result[0].state));
              }
            })
          }
        }
        else {
          let currentApp = GLOBALS.topmostApp
          if (currentApp.startsWith("YouTube")||currentApp.startsWith("Netflix")) {
            appApi.getPluginStatus(currentApp).then(result => {
              if (result[0].state !== (Settings.get("platform", "enableAppSuspended") ? "suspended" : "deactivated")) {
                appApi.exitApp(currentApp, true)
                .then(()=>GLOBALS.previousapp_onDisplayConnectionChanged=currentApp)
                .catch(err => {
                  Router.navigate(GLOBALS.LastvisitedRoute)
                 console.error(`Error in exit app ${currentApp} : ` + JSON.stringify(err))
                });
              } else {
                console.log("App HdcpProfile onDsisplayConnectionChanged skipping; " + currentApp + " is already: ", JSON.stringify(result[0].state));
              }
            })
          }
          Storage.set("lastVisitedRoute",Router.getActiveHash())
          GLOBALS.LastvisitedRoute= Router.getActiveHash()
        }
        Storage.set("UICacheonDisplayConnectionChanged", temp.isConnected)
      } else {
        console.warn("App HdcpProfile onDisplayConnectionChanged discarding.");
        console.log("App HdcpProfile ResolutionChangeInProgress: " + Storage.get("ResolutionChangeInProgress") + " UICacheonDisplayConnectionChanged: " + Storage.get("UICacheonDisplayConnectionChanged"));
      }
    })
  }

  SubscribeToHdmiCecSourcevent(state,appIdentifiers){
    switch (state) {
      case "activated":
        this.onApplicationStateChanged=thunder.on("org.rdk.HdmiCecSource", "onActiveSourceStatusUpdated", notification => {
          console.log(new Date().toISOString() + " onActiveSourceStatusUpdated "+ JSON.stringify(notification))
          if (notification.status != Storage.get("UICacheCECActiveSourceStatus")) {
            if (notification.status) {
              let currentApp = GLOBALS.topmostApp
              if(GLOBALS.previousapp_onActiveSourceStatusUpdated !== null) {
                currentApp=GLOBALS.previousapp_onActiveSourceStatusUpdated
              }
              if(currentApp === "ResidentApp" && GLOBALS.Setup) {
                Router.navigate(GLOBALS.LastvisitedRoute);
              }
              let launchLocation = Storage.get(currentApp + "LaunchLocation")
              console.log("current app is " + JSON.stringify(currentApp))
              let params = {
                launchLocation: launchLocation,
                appIdentifier: appIdentifiers[currentApp]
              }
              if (currentApp.startsWith("YouTube")||currentApp.startsWith("Netflix")) {
                params["url"] = Storage.get(currentApp + "DefaultURL");
                appApi.getPluginStatus(currentApp).then(result => {
                  const isAppSuspendedEnabled = Settings.get("platform", "enableAppSuspended");
                  const expectedState = isAppSuspendedEnabled ? ["hibernated", "suspended"] : ["deactivated"];
                  if (expectedState.includes(result[0].state)) {
                    appApi.launchApp(currentApp, params)
                    .then(()=>GLOBALS.previousapp_onActiveSourceStatusUpdated=null)
                    .catch(err => {
                      Router.navigate(GLOBALS.LastvisitedRoute)
                      console.error(`Error in launching ${currentApp} : ` + JSON.stringify(err))
                    });
                  } else {
                    console.log("App HdmiCecSource onActiveSourceStatusUpdated skipping; " + currentApp + " is already:" + JSON.stringify(result[0].state));
                  }
                })
              }
            }
            else {
              let currentApp = GLOBALS.topmostApp
              if (currentApp.startsWith("YouTube")||currentApp.startsWith("Netflix")) {
                appApi.getPluginStatus(currentApp).then(result => {
                  if (result[0].state !== (Settings.get("platform", "enableAppSuspended") ? "suspended" : "deactivated")) {
                    appApi.exitApp(currentApp, true)
                    .then(()=>GLOBALS.previousapp_onActiveSourceStatusUpdated=currentApp)
                    .catch(err => {
                      Router.navigate(GLOBALS.LastvisitedRoute)
                     console.error(`Error in launching ${currentApp} : ` + JSON.stringify(err))
                    });
                  } else {
                    console.log("App HdmiCecSource onActiveSourceStatusUpdated skipping; " + currentApp + " is already:"+ JSON.stringify(result[0].state));
                  }
                })
              }
              Storage.set("lastVisitedRoute",Router.getActiveHash())
              GLOBALS.LastvisitedRoute= Router.getActiveHash()
            }
            Storage.set("UICacheCECActiveSourceStatus", notification.status);
            console.log("App HdmiCecSource onActiveSourceStatusUpdated UICacheCECActiveSourceStatus:"+ JSON.stringify(Storage.get("UICacheCECActiveSourceStatus")));
          } else {
            console.warn("App HdmiCecSource onActiveSourceStatusUpdated discarding.");
          }
        })
          break;
      case "deactivated":
        this.onApplicationStateChanged.dispose()
          break;
  }
  }

  _getPowerStateWhileReboot() {
    appApi.getPowerState().then(res => {
      console.log("_getPowerStateWhileReboot: Current power state while reboot ".concat(res.powerState));
      this._powerStateWhileReboot = res.powerState;
      this._PowerStateHandlingWhileReboot();
    }).catch(err => {
      console.log("_getPowerStateWhileReboot: Error in getting current power state while reboot ".concat(err));
      this._powerStateWhileReboot = 'STANDBY';
      this._PowerStateHandlingWhileReboot();
    });
  }

  _PowerStateHandlingWhileReboot() {
    console.log("_PowerStateHandlingWhileReboot: this._oldPowerStateWhileReboot , ".concat(this._oldPowerStateWhileReboot, " this._powerStateWhileReboot, ").concat(this._powerStateWhileReboot, " "));
    if (this._oldPowerStateWhileReboot != this._powerStateWhileReboot) {
      console.log("_PowerStateHandlingWhileReboot: old power state is not equal to powerstate while reboot ".concat(this._oldPowerStateWhileReboot, " ").concat(this._powerStateWhileReboot));
      appApi.setPowerState(this._oldPowerStateWhileReboot).then(res => {
        console.log("_PowerStateHandlingWhileReboot: successfully set powerstate to old powerstate ".concat(this._oldPowerStateWhileReboot));
        if (res.success) {
          appApi.getPowerState().then(res => {
            GLOBALS.powerState = res.powerState;
          });
          console.log("_PowerStateHandlingWhileReboot: powerstate after setting to new powerstate ".concat(GLOBALS.powerState, " and "));
        }
      }).catch(err => {
        console.log("_PowerStateHandlingWhileReboot: Rebooting the device as set PowerState failed due to ".concat(err));
        appApi.reboot("setPowerState Api Failure");
      });
    } else {
      console.log("_PowerStateHandlingWhileReboot: power state before reboot and curren tpowerstate is same ".concat(this._oldPowerStateWhileReboot, " ").concat(this._powerStateWhileReboot));
      GLOBALS.powerState = this._powerStateWhileReboot;
    }
  }

  _getPowerStatebeforeReboot() {
    appApi.getPowerStateBeforeReboot().then(res => {
      console.log("_getPowerStatebeforeReboot: getpowerstate before reboot ".concat(res.state));
      this._oldPowerStateWhileReboot = res.state;
      this._getPowerStateWhileReboot();
    }).catch(err => {
      console.log("_getPowerStatebeforeReboot: getPowerStateBeforeReboot error ".concat(err) + " setting powerstate to ON");
      this._oldPowerStateWhileReboot = 'ON';
      this._getPowerStateWhileReboot();
    });
  }
  _registerFireboltListeners(){
    FireBoltApi.get().deviceinfo.gettype()
    FireBoltApi.get().lifecycle.ready()

    FireBoltApi.get().lifecycle.registerEvent('foreground', value => {
      console.log("FireBoltApi[foreground] value:" + JSON.stringify(value) + ", launchResidentApp with:" + JSON.stringify(GLOBALS.selfClientName));
      // Ripple launches refui with this rdkshell client name.
      GLOBALS.topmostApp = GLOBALS.selfClientName;
      FireBoltApi.get().discovery.launch("refui",{ "action": "home", "context": { "source": "device" } } ).then(() => {
        AlexaApi.get().reportApplicationState("menu", true);
      })
    })
    FireBoltApi.get().lifecycle.registerEvent('background', value => {
      // Ripple changed app states; it will be a 'FireboltApp'
      GLOBALS.topmostApp = "FireboltApp";
      console.log("FireBoltApi[foreground] value:" + JSON.stringify(value) + ", Updating top app as:" + GLOBALS.topmostApp);
    })
    FireBoltApi.get().lifecycle.state().then(res => {
      console.log("Lifecycle.state result:" + res)
    });
  }

  _firstEnable() {
    thunder.on("org.rdk.System", "onSystemPowerStateChanged", notification => {
      console.log(new Date().toISOString() + " onSystemPowerStateChanged Notification: ", notification);
      appApi.getPowerState().then(res =>{
        GLOBALS.powerState = res.success ? res.powerState : notification.powerState
      }).catch( e => GLOBALS.powerState = notification.powerState)
      if (notification.powerState !== "ON" && notification.currentPowerState === "ON") {
        console.log("onSystemPowerStateChanged Notification: power state was changed from ON to " + notification.powerState)

        //TURNING OFF THE DEVICE
        Storage.set('SLEEPING', notification.powerState)

        let currentApp = GLOBALS.topmostApp
        if (currentApp !== "") {
          appApi.exitApp(currentApp); //will suspend/destroy the app depending on the setting.
        }
        Router.navigate('menu');
      }

      else if (notification.powerState === "ON" && notification.currentPowerState !== "ON") {
        //TURNING ON THE DEVICE
        Storage.remove('SLEEPING')
      }
    })

    console.log("App Calling listenToVoiceControl method to activate VoiceControl Plugin")
    this.listenToVoiceControl();
    this._updateLanguageToDefault()
    /* Subscribe to Volume status events to report to Alexa. */
    this._subscribeToAlexaNotifications()
  }
  
  async listenToVoiceControl() {
    console.log("App listenToVoiceControl method got called, configuring VoiceControl Plugin")
    await voiceApi.activate().then(() => {
      voiceApi.voiceStatus().then(voiceStatusResp => {
        if(voiceStatusResp.success){
        if(voiceStatusResp.urlPtt.includes("avs://"))
        {
          GLOBALS.AlexaAvsstatus(true)
        }
        if (voiceStatusResp.ptt.status != "ready" || !voiceStatusResp.urlPtt.includes("avs://")) {
          GLOBALS.AlexaAvsstatus(false)
          console.error("App voiceStatus says PTT/AVS not ready, enabling it.");
          // TODO: Future -> add option for user to select which Voice service provider.
          // Then configure VoiceControl plugin for that end point.
          // TODO: voiceApi.configureVoice()
          if (AlexaApi.get().checkAlexaAuthStatus() != "AlexaUserDenied") {
            AlexaApi.get().setAlexaAuthStatus("")
            voiceApi.configureVoice({ "enable": true }).then(() => {
              AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending")
            });
          }
        }
      }

      });

      if (AlexaApi.get().checkAlexaAuthStatus() === "AlexaAuthPending") {
        /* AVS SDK might be awaiting a ping packet to start. */
        AlexaApi.get().pingAlexaSDK();
      } else if (AlexaApi.get().checkAlexaAuthStatus() === "AlexaHandleError") {
        console.log("App checkAlexaAuthStatus is AlexaHandleError; enableSmartScreen.");
        AlexaApi.get().enableSmartScreen();
        AlexaApi.get().getAlexaDeviceSettings();
        /* Alexa device volume state report. */
        appApi.getConnectedAudioPorts().then(audioport => {
          for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
            if ((Storage.get("deviceType") == "tv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) ||
              (Storage.get("deviceType") != "tv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))) {
              appApi.getMuted(audioport.connectedAudioPorts[i]).then(muteRes => {
                appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
                  AlexaApi.get().reportVolumeState((volres.success ? (Number.isInteger(volres.volumeLevel) ? volres.volumeLevel : parseInt(volres.volumeLevel)) : undefined), (muteRes.success ? muteRes.muted : undefined))
                })
              })
            }
          }
        })

        /* Report device language */
        if (availableLanguageCodes[Language.get()].length) {
          AlexaApi.get().updateDeviceLanguageInAlexa(availableLanguageCodes[Language.get()]);
        }
        /* Report device timeZone */
        if ("ResidentApp" === GLOBALS.selfClientName) {
          appApi.getZone().then(timezone => {
            this.updateAlexaTimeZone(timezone)
          });
        } else {
          FireBoltApi.get().localization.getTimeZone().then(timezone=>{
            this.updateAlexaTimeZone(timezone)
          })
        }
      }
      console.log("App VoiceControl check if user has denied ALEXA:" + JSON.stringify(AlexaApi.get().checkAlexaAuthStatus()))

      /* Handle VoiceControl Notifications */
      this._registerVoiceApiEvents()
    }).catch(err => {
      console.error("App VoiceControl Plugin activation error:", err);
    })
  }

  updateAlexaTimeZone(updatedTimeZone){
    if (updatedTimeZone.length) {
      console.log("App: updateDeviceTimeZoneInAlexa with zone:", updatedTimeZone)
      AlexaApi.get().updateDeviceTimeZoneInAlexa(updatedTimeZone);
    } else {
      console.error("App getTimezoneDST returned:", updatedTimeZone)
    }
  }

  deactivateChildApp(plugin) { //#needToBeRemoved
    switch (plugin) {
      case 'WebApp':
        appApi.deactivateWeb();
        break;
      case 'YouTube':
        appApi.suspendPremiumApp("YouTube").then(() => {
          console.log(`YouTube : suspend YouTube request`);
        }).catch((err) => {
          console.error(err)
        });
        break;
      case 'YouTubeTV':
        appApi.suspendPremiumApp("YouTubeTV").then(() => {
          console.log(`YouTubeTV : suspend YouTubeTV request`);
        }).catch((err) => {
          console.error(err)
        });
        break;
      case 'Lightning':
        appApi.deactivateLightning();
        break;
      case 'Native':
        appApi.killNative();
        break;
      case 'Amazon':
        appApi.suspendPremiumApp('Amazon').then(res => {
          if (res) {
            let params = { applicationName: "AmazonInstantVideo", state: 'suspended' };
            this.xcastApi.onApplicationStateChanged(params);
          }
        });
        break;
      case "Netflix":
        appApi.suspendPremiumApp("Netflix").then((res) => {
          Router.navigate(GLOBALS.LastvisitedRoute);
          this._moveApptoFront(GLOBALS.selfClientName, true)
          if (res) {
            let params = { applicationName: "Netflix", state: "suspended" };
            this.xcastApi.onApplicationStateChanged(params);
          }
        });
        break;
      case 'HDMI':
        new HDMIApi().stopHDMIInput()
        Storage.set("_currentInputMode", {});
        break;
      default:
        break;
    }
  }

  $initLaunchPad(url) {
    return new Promise((resolve, reject) => {
      appApi.getPluginStatus('Netflix')
        .then(result => {
          console.log(`netflix plugin status is :`, JSON.stringify(result));
          console.log(`netflix plugin status is :`, result);

          if (result[0].state === 'deactivated' || result[0].state === 'deactivation') {

            Router.navigate('image', { src: Utils.asset('images/apps/App_Netflix_Splash.png') })
            if (url) {
              appApi.configureApplication('Netflix', url).then(() => {
                appApi.launchPremiumApp("Netflix").then(() => {
                  RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
                  resolve(true)
                }).catch(() => { reject(false) });// ie. org.rdk.RDKShell.launch
              }).catch(err => {
                console.error("Netflix : error while fetching configuration data : ", JSON.stringify(err))
                reject(err)

              })// gets configuration object and sets configuration
            }
            else {
              appApi.launchPremiumApp("Netflix").then(() => {
                RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
                resolve(true)
              }).catch(() => { reject(false) });// ie. org.rdk.RDKShell.launch
            }
          }
          else {
            /* Not in deactivated; could be suspended */
            if (url) {
              appApi.launchPremiumApp("Netflix").then(() => {
                thunder.call("Netflix", "systemcommand",
                  { "command": url })
                  .then(() => {

                  }).catch(err => {
                    console.error("Netflix : error while sending systemcommand : ", JSON.stringify(err))
                    Metrics.error(Metrics.ErrorType.OTHER, 'AppError', `Netflix : error while sending systemcommand : ${JSON.stringify(err)}`, false, null)
                    reject(false);
                  });
                RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
                resolve(true)
              }).catch(() => { reject(false) });// ie. org.rdk.RDKShell.launch
            }
            else {
              appApi.launchPremiumApp("Netflix").then(res => {
                console.log(`Netflix : launch premium app resulted in `, JSON.stringify(res));
                RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
                resolve(true)
              });
            }

          }
        })
        .catch(err => {
          console.log('Netflix plugin error', err)
          GLOBALS.topmostApp = GLOBALS.selfClientName;
          reject(false)
        })
    })
  }

  _powerKeyPressed() {
    appApi.getPowerState().then(res => {
      console.log("getPowerState: ", res)
      if (res.success) {
        if (res.powerState === "ON") {
          console.log("current powerState is ON so setting power state to LIGHT_SLEEP/DEEP_SLEEP depending of preferred option");
          appApi.getPreferredStandbyMode().then(res => {
            console.log("getPreferredStandbyMode: ", res.preferredStandbyMode);
            appApi.setPowerState(res.preferredStandbyMode).then(result => {
              if (result.success) {
                console.log("successfully set powerstate to: " + res.preferredStandbyMode)
                return result.success
              }
            })
          })
        } else {
          console.log("current powerState is " + res.powerState + " so setting power state to ON");
          appApi.setPowerState("ON").then(res => {
            if (res.success) {
              console.log("successfully set powerstate to: ON")
              return res.success
            }
          })
        }
      }
    })
  }
  _updateLanguageToDefault() {
    if ("ResidentApp" === GLOBALS.selfClientName) {
      if (availableLanguageCodes[Language.get()].length) {
        appApi.setUILanguage(availableLanguageCodes[Language.get()])
        localStorage.setItem('Language',Language.get())
      }
    } else {
      FireBoltApi.get().localization.language().then(lang => {
        if (lang) {
          FireBoltApi.get().localization.language(lang).then(`language ${lang} set succesfully`)
          localStorage.setItem('Language',lang)
        }
      })
    }
  }

  _moveApptoFront(appName, visibility) {
    RDKShellApis.moveToFront(appName).then(() => {
      RDKShellApis.setVisibility(appName, visibility);
      RDKShellApis.setFocus(appName).then(() => {
      }).catch((err) => {
        console.log(`Error : can't set focus to the ${appName}`, err);
        Metrics.error(Metrics.ErrorType.OTHER, 'APPError', "RDKShell setFocus error" + err, false, null)
      });
    });
  }

  launchFeaturedApp = (appName) =>{
    let params = {
      launchLocation: "dedicatedButton",
      appIdentifier:this.appIdentifiers[appName]
    }
    appApi.launchApp(appName, params).catch(err => {
      console.error(`Error in launching ${appName} via dedicated key: ` + JSON.stringify(err))
    });
  }

  /**
   * Function to register event listeners for Xcast plugin.
   */
  registerXcastListeners() {
    let self = this;
    this.xcastApi.registerEvent('onApplicationLaunchRequest', notification => {
      //power check
      console.log('App onApplicationLaunchRequest: ' + JSON.stringify(notification));
      appApi.getPowerState().then(res =>{
        if(res.powerState === 'STANDBY') {
          appApi.getPreferredStandbyMode().then(result =>{
              if(result.preferredStandbyMode === "LIGHT_SLEEP") appApi.setPowerState('ON')
            })
        }
      })
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let baseUrl = Storage.get(notification.applicationName + "DefaultURL");
        let pairingCode = notification.parameters.payload; 
        let additionalDataUrl = notification.parameters.additionalDataUrl;
        let url = `${baseUrl}${pairingCode}&additionalDataUrl=${additionalDataUrl}`;
          let params = {
            url: applicationName.startsWith("YouTube") ? url : notification.parameters.pluginUrl ,
            launchLocation: "dial",
            appIdentifier: self.appIdentifiers[applicationName]
          }
          appApi.launchApp(applicationName, params).then(res => {
            console.log("App onApplicationLaunchRequest: launched " + applicationName + " : ", res);
            GLOBALS.topmostApp = applicationName;
            // TODO: move to Controller.statuschange event
            let params = { applicationName: notification.applicationName, state: 'running' };
            this.xcastApi.onApplicationStateChanged(params);
          }).catch(err => {
            console.log("App onApplicationLaunchRequest: error ", err)
          })
      } else {
        console.log("App onApplicationLaunchRequest: " + notification.applicationName + " is not supported.")
      }
    });

    this.xcastApi.registerEvent('onApplicationHideRequest', notification => {
      console.log('App onApplicationHideRequest: ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        console.log('App onApplicationHideRequest: ' + this.xcastApps(notification.applicationName));
          //second argument true means resident app won't be launched the required app will be exited in the background.
          //only bring up the resident app when the notification is from the current app(ie app in focus)
          console.log("App onApplicationHideRequest: exitApp as " + applicationName + "!==" + GLOBALS.topmostApp);
          appApi.exitApp(applicationName, applicationName !== GLOBALS.topmostApp);
      } else {
        console.log("App onApplicationHideRequest: " + notification.applicationName + " is not supported.")
      }
    });

    this.xcastApi.registerEvent('onApplicationResumeRequest', notification => {
      console.log('App onApplicationResumeRequest: ' + JSON.stringify(notification));
      appApi.getPowerState().then(res => {
        if(res.powerState === 'STANDBY') {
          appApi.getPreferredStandbyMode().then(result =>{
              if(result.preferredStandbyMode === "LIGHT_SLEEP") appApi.setPowerState('ON')
            })
        }
      })
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let params = {
          url: notification.parameters.url,
          launchLocation: "dial",
          appIdentifier: self.appIdentifiers[applicationName]
        }

        console.log('App onApplicationResumeRequest: launchApp ', applicationName, " with params: ", params);
        appApi.launchApp(applicationName, params).then(res => {
          GLOBALS.topmostApp = applicationName;
          console.log("App onApplicationResumeRequest: launched ", applicationName, " result: ", res);
        }).catch(err => {
          console.log("Error in launching ", applicationName, " on casting resume request: ", err);
        })
      } else {
        console.log("App onApplicationResumeRequest: " + notification.applicationName + " is not supported.")
      }
    });

    this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
      console.log('App onApplicationStopRequest: ' + JSON.stringify(notification));

      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        appApi.exitApp(applicationName, true, true);
      } else {
        console.log("App onApplicationStopRequest: " + notification.applicationName + " is not supported.")
      }
    });

    this.xcastApi.registerEvent('onApplicationStateRequest', notification => {
      //console.log("App onApplicationStateRequest: " + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let appState = { "applicationName": notification.applicationName, "state": "stopped" };
        appApi.checkStatus(applicationName).then(result => {
          console.log("result of xcast app status", result[0].state)
          switch (result[0].state) {
            case "activated":
            case "resumed":
              appState.state = "running";
              break;
            case "Activation":
            case "deactivated":
            case "Deactivation":
            case "Precondition":
              appState.state = "stopped";
              break;
            case "hibernated":
            case "suspended":
              appState.state = "suspended";
              break;
          }
          this.xcastApi.onApplicationStateChanged(appState);
        }).catch(error => {
          console.error("App onApplicationStateRequest: checkStatus error ", error);
        })
      } else {
        console.log("App onApplicationStateRequest: " + notification.applicationName + " is not supported.")
      }
    });
  }

  /**
   * Function to get the plugin name for the application name.
   * @param {string} app App instance.
   */
  xcastApps(app) {
    if (Object.keys(XcastApi.supportedApps()).includes(app)) {
      return XcastApi.supportedApps()[app];
    } else return false;
  }


  $mountEventConstructor(fun) {
    this.ListenerConstructor = fun;
    console.log(`MountEventConstructor was initialized`)
    // console.log(`listener constructor was set t0 = ${this.ListenerConstructor}`);
  }

  $registerUsbMount() {
    this.disposableListener = this.ListenerConstructor();
    console.log(`Successfully registered the usb Mount`)
  }

  $deRegisterUsbMount() {
    console.log(`the current usbListener = ${this.disposableListener}`)
    this.disposableListener.dispose();
    console.log(`successfully deregistered usb listener`);
  }


  standby(value) {
    console.log(`standby call`);
    if (value == 'Back') {
      // TODO: Identify what to do here.
    } else {
      if (powerState == 'ON') {
        console.log(`Power state was on trying to set it to standby`);
        appApi.setPowerState(value).then(res => {

          if (res.success) {
            console.log(`successfully set to standby`);
            powerState = 'STANDBY'
            if (GLOBALS.topmostApp !== GLOBALS.selfClientName) {
              appApi.exitApp(GLOBALS.topmostApp);
            } else {
              if (!Router.isNavigating()) {
                Router.navigate('menu')
              }
            }
          }
        })
        return true
      }
    }
  }

  $registerInactivityMonitoringEvents() {
    return new Promise((resolve, reject) => {
      console.log(`registered inactivity listener`);
      appApi.setPowerState('ON').then(res => {
        if (res.success) {
          powerState = 'ON'
        }
      })

      thunder.Controller.activate({
        callsign: 'org.rdk.RDKShell.1'
      })
        .then(res => {
          console.log(`activated the rdk shell plugin trying to set the inactivity listener; res = ${JSON.stringify(res)}`);
          thunder.on("org.rdk.RDKShell.1", "onUserInactivity", notification => {
            console.log('onUserInactivity: ' + JSON.stringify(notification));
            if (powerState === "ON" && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
              this.standby("STANDBY");
            }
          }, err => {
            console.error(`error while inactivity monitoring , ${err}`)
          })
          resolve(res)
        }).catch((err) => {
          Metrics.error(Metrics.ErrorType.OTHER, 'AppError', `Controller.activate error with ${err}`, false, null)
          reject(err)
          console.error(`error while activating the displaysettings plugin; err = ${err}`)
        })
    })
  }

  $resetSleepTimer(t) {
    console.log(`reset sleep timer call ${t}`);
    var arr = t.split(" ");

    function setTimer() {
      console.log('Timer ', arr)
      var temp = arr[1].substring(0, 1);
      if (temp === 'H') {
        let temp1 = parseFloat(arr[0]) * 60;
        RDKShellApis.setInactivityInterval(temp1).then(() => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} hours`)
        }).catch(err => {
          console.error('error while setting the timer' + JSON.stringify(err))
        });
      } else if (temp === 'M') {
        console.log(`minutes`);
        let temp1 = parseFloat(arr[0]);
        RDKShellApis.setInactivityInterval(temp1).then(() => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} minutes`);
        }).catch(err => {
          console.error('error while setting the timer' + JSON.stringify(err))
        });
      }
    }

    if (arr.length < 2) {
      RDKShellApis.enableInactivityReporting(false).then((res) => {
        if (res === true) {
          Storage.set('TimeoutInterval', false)
          console.log(`Disabled inactivity reporting`);
          // this.timerIsOff = true;
        }
      }).catch(err => {
        console.error(`error : unable to set the reset; error = ${err}`)
      });
    } else {
      RDKShellApis.enableInactivityReporting(true).then(res => {
        if (res === true) {
          console.log(`Enabled inactivity reporting; trying to set the timer to ${t}`);
          // this.timerIsOff = false;
          setTimer();
        }
      }).catch(err => { console.error('error while enabling inactivity reporting' + JSON.stringify(err)) });
    }
  }
  _subscribeToAlexaNotifications() {
    thunder.on('org.rdk.DisplaySettings', 'connectedAudioPortUpdated', notification => {
      console.log("App got connectedAudioPortUpdated: ", notification)
      // TODO: future -> can be used for volume adjustments ?
    });
    thunder.on('org.rdk.DisplaySettings', 'muteStatusChanged', notification => {
      if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
        AlexaApi.get().reportVolumeState(undefined, notification.muted);
      }
    });
    thunder.on('org.rdk.DisplaySettings', 'volumeLevelChanged', notification => {
      if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
        AlexaApi.get().reportVolumeState(notification.volumeLevel, undefined);
      }
    });
    thunder.on('org.rdk.System', 'onTimeZoneDSTChanged', notification => {
      if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
        AlexaApi.get().updateDeviceTimeZoneInAlexa(notification.newTimeZone);
      }
    });
  }

  _registerVoiceApiEvents() {
    let self = this;
    voiceApi.registerEvent('onServerMessage', notification => {
      console.log('App onServerMessage: ' + JSON.stringify(notification));
      if (Storage.get("appSwitchingInProgress")) {
        console.warn("App is appSwitchingInProgress? " + Storage.get("appSwitchingInProgress") + ", dropping processing the server notification.");
        return;
      }
      if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
        if (notification.xr_speech_avs.state_reporter === "authorization_req" || notification.xr_speech_avs.code) {
          console.log("Alexa Auth URL is ", notification.xr_speech_avs.url)
          if (!Router.isNavigating() && !AlexaApi.get().isSmartScreenActiavated() && Router.getActiveHash() === "menu") {
            console.log("App enableSmartScreen");
            AlexaApi.get().enableSmartScreen();
          }
          if ((Router.getActiveHash() === "menu") && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
            if (Router.getActiveHash() != "AlexaLoginScreen" && Router.getActiveHash() != "CodeScreen" && !Router.isNavigating()) {
              console.log("Routing to Alexa login page")
              Router.navigate("AlexaLoginScreen")
            }
          }
          console.log("Alexa Auth OTP is ", notification.xr_speech_avs.code)
        } else if (notification.xr_speech_avs.state_reporter === "authendication") {
          console.log("Alexa Auth State is now at ", notification.xr_speech_avs.state)
          if (notification.xr_speech_avs.state === "refreshed") {
            AlexaApi.get().setAlexaAuthStatus("AlexaHandleError")
            Router.navigate("SuccessScreen")
          } else if ((notification.xr_speech_avs.state === "uninitialized") || (notification.xr_speech_avs.state === "authorizing")) {
            AlexaApi.get().setAlexaAuthStatus("AlexaAuthPending")
          } else if ((notification.xr_speech_avs.state === "unrecoverable error") && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
            // Could be AUTH token Timeout; refresh it.
            if (GLOBALS.Setup === true) {
              Router.navigate("FailureScreen");
            } else {
              Storage.set("alexaOTPReset", true);
            }
          }
        } else if (notification.xr_speech_avs.state_reporter === "login" && notification.xr_speech_avs.state === "User request to disable Alexa") {
          // https://jira.rdkcentral.com/jira/browse/RDKDEV-746: SDK abstraction layer sends on SKIP button event.
          AlexaApi.get().setAlexaAuthStatus("AlexaUserDenied")
        }
      }

      if ((AlexaApi.get().checkAlexaAuthStatus() === "AlexaHandleError") && (notification.xr_speech_avs.state === "CONNECTING" ||
        notification.xr_speech_avs.state === "DISCONNECTED")) {// || notification.xr_speech_avs.state === "CONNECTED"
        this._handleAlexaError(1)
        this.tag("Failscreen1").notify({ title: 'Alexa State', msg: notification.xr_speech_avs.state })
        setTimeout(() => {
          this._handleAlexaError(0)
        }, 5000);
      }
      if ((AlexaApi.get().checkAlexaAuthStatus() != "AlexaUserDenied") && notification.xr_speech_avs.state) {
        if (notification.xr_speech_avs.state.guiAPL === "ACTIVATED") {
          AlexaApi.get().displaySmartScreenOverlay();
          RDKShellApis.setFocus(GLOBALS.topmostApp === "" ? GLOBALS.selfClientName : GLOBALS.topmostApp);
        }
        if (notification.xr_speech_avs.state.dialogUX === "idle" && notification.xr_speech_avs.state.audio === "stopped") {
          console.log("App current AlexaAudioplayerActive state:" + AlexaAudioplayerActive);
          if (AlexaAudioplayerActive && notification.xr_speech_avs.state.guiManager === "DEACTIVATED" || !AlexaAudioplayerActive) {
            AlexaAudioplayerActive = false;
            RDKShellApis.setFocus(GLOBALS.topmostApp === "" ? GLOBALS.selfClientName : GLOBALS.topmostApp);
          }
        }
        if (notification.xr_speech_avs.state.dialogUX === "idle" && notification.xr_speech_avs.state.audio === "playing") {
          AlexaApi.get().displaySmartScreenOverlay(true)
        } else if (notification.xr_speech_avs.state.dialogUX === "listening") {
          AlexaApi.get().displaySmartScreenOverlay();
        } else if (notification.xr_speech_avs.state.dialogUX === "speaking") {
          AlexaApi.get().displaySmartScreenOverlay(true)
        }
        if (notification.xr_speech_avs.state_reporter === "dialog") {
          // Smartscreen playback state reports
          if ((notification.xr_speech_avs.state.dialogUX === "idle") && (notification.xr_speech_avs.state.audio)) {
            AlexaApi.get().setAlexaSmartscreenAudioPlaybackState(notification.xr_speech_avs.state.audio);
          }
        }
      }
      if (notification.xr_speech_avs.directive && (AlexaApi.get().checkAlexaAuthStatus() != "AlexaUserDenied")) {
        const header = notification.xr_speech_avs.directive.header
        const payload = notification.xr_speech_avs.directive.payload
        /////////Alexa.Launcher START
        if (header.namespace === "Alexa.Launcher") {
          //Alexa.launcher will handle launching a particular app(exiting might also be there)
          if (header.name === "LaunchTarget") {
            //Alexa payload will be to "launch" an app
            if (AlexaLauncherKeyMap[payload.identifier]) {
              let appCallsign = AlexaLauncherKeyMap[payload.identifier].callsign
              let appUrl = AlexaLauncherKeyMap[payload.identifier].url //keymap url will be default, if alexa can give a url, it can be used istead
              let targetRoute = AlexaLauncherKeyMap[payload.identifier].route
              let params = {
                url: appUrl,
                launchLocation: "alexa",
                appIdentifier: self.appIdentifiers[appCallsign]
              }
              // Send AVS State report: STOP request if "playing" to end the Smartscreen App instance.
              if (AlexaApi.get().checkAlexaSmartscreenAudioPlaybackState() == "playing") {
                console.log("Sending playbackstatereport to Pause:", PlaybackStateReport)
                AlexaApi.get().reportPlaybackState("PAUSED");
              }
              console.log("Alexa is trying to launch " + appCallsign + " using params: " + JSON.stringify(params))
              if (appCallsign) { //appCallsign is valid means target is an app and it needs to be launched
                appApi.launchApp(appCallsign, params).catch(err => {
                  console.log("Alexa.Launcher LaunchTarget checkerrstatusAlexa", err)
                  if (err.includes("Netflix")) {
                    AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive, "INVALID_VALUE", "Unsupported AppID")
                  } else {
                    AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive)
                  }
                  console.error("Alexa.Launcher LaunchTarget Error in launching " + appCallsign + " via Alexa: " + JSON.stringify(err))
                });
              } else if (targetRoute) {
                console.log("Alexa.Launcher is trying to route to ", JSON.stringify(targetRoute))
                // exits the app if any and navigates to the specific route.
                Storage.set("appSwitchingInProgress", true);
                this.jumpToRoute(targetRoute);
                GLOBALS.topmostApp = GLOBALS.selfClientName;
                Storage.set("appSwitchingInProgress", false);
              }
            } else {
              console.log("Alexa.Launcher is trying to launch an unsupported app : " + JSON.stringify(payload))
              AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive)
            }
          }
        }/////////Alexa.Launcher END
        else if (header.namespace === "Alexa.RemoteVideoPlayer") { //alexa remote video player will search on youtube for now
          console.log("Alexa.RemoteVideoPlayer: " + JSON.stringify(header))
          if (header.name === "SearchAndDisplayResults" || header.name === "SearchAndPlay") {
            console.log("Alexa.RemoteVideoPlayer: SearchAndDisplayResults || SearchAndPlay: " + JSON.stringify(header))
            /* Find if payload contains Destination App */
            if (Object.prototype.hasOwnProperty.call(payload, "entities")) {
              let entityId = payload.entities.filter(obj => Object.keys(obj).some(key => Object.prototype.hasOwnProperty.call(obj[key], "ENTITY_ID")));
              if (entityId.length && AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID]) {
                /* ENTITY_ID or vsk key found; meaning Target App is there in response. */
                let replacedText = payload.searchText.transcribed.replace(entityId[0].value.toLowerCase(), "").trim();
                let appCallsign = AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID].callsign
                //let appUrl = AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID].url
                let launchParams = {
                  url: "",
                  launchLocation: "alexa",
                  appIdentifier: self.appIdentifiers[appCallsign]
                }
                if ("Netflix" === appCallsign) {
                  launchParams.url = encodeURI(replacedText);
                } else if (appCallsign.startsWith("YouTube")) {
                  launchParams.url = Storage.get(appCallsign + "DefaultURL") + "&va=" + ((header.name === "SearchAndPlay") ? "play" : "search") + "&vq=" + encodeURI(replacedText);
                }
                console.log("Alexa.RemoteVideoPlayer: launchApp " + appCallsign + " with params " + launchParams)
                appApi.launchApp(appCallsign, launchParams).then(res => {
                  console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launched successfully using alexa search: " + JSON.stringify(res))
                }).catch(err => {
                  console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launch FAILED using alexa search: " + JSON.stringify(err))
                })
                replacedText = null;
                appCallsign = null;
                launchParams = null;
              } else if (!entityId.length && (GLOBALS.topmostApp != GLOBALS.selfClientName)) {
                /* give it to current focused app */
                console.warn("Alexa.RemoteVideoPlayer: " + GLOBALS.topmostApp + " is the focued app; need Voice search integration support to it.");
              } else if (!entityId.length && (GLOBALS.topmostApp == GLOBALS.selfClientName)) {
                /* Generic global search without a target app; redirect to Youtube as of now. */
                let replacedText = payload.searchText.transcribed.trim();
                let appCallsign = AlexaLauncherKeyMap["amzn1.alexa-ask-target.app.70045"].callsign
                let launchParams = {
                  url: "",
                  launchLocation: "alexa",
                  appIdentifier: self.appIdentifiers[appCallsign]
                }
                launchParams.url = Storage.get(appCallsign + "DefaultURL") + "&va=" + ((header.name === "SearchAndPlay") ? "play" : "search") + "&vq=" + encodeURI(replacedText);
                console.log("Alexa.RemoteVideoPlayer: global search launchApp " + appCallsign + " with params " + launchParams)
                appApi.launchApp(appCallsign, launchParams).then(res => {
                  console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launched successfully using alexa search: " + JSON.stringify(res))
                }).catch(err => {
                  console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launch FAILED using alexa search: " + JSON.stringify(err))
                })
                replacedText = null;
                appCallsign = null;
                launchParams = null;
              } else {
                /* Possibly an unsupported App. */
                console.warn("Alexa.RemoteVideoPlayer: got ENTITY_ID " + entityId[0].externalIds.ENTITY_ID + "but no match in AlexaLauncherKeyMap.");
              }
            } else {
              console.warn("Alexa.RemoteVideoPlayer: payload does not have entities; may not work.");
            }
          }
        }
        else if (header.namespace === "Alexa.PlaybackController") {
          appApi.deeplinkToApp(GLOBALS.topmostApp, header.name, "alexa", header.namespace);
          AlexaApi.get().reportPlaybackState(header.name);
        }
        else if (header.namespace === "Alexa.SeekController") {
          if (Router.getActiveHash() === "player" || Router.getActiveHash() === "usb/player") {
            let time = notification.xr_speech_avs.directive.payload.deltaPositionMilliseconds / 1000
            this.tag("AAMPVideoPlayer").voiceSeek(time)
          }
          else {
            appApi.deeplinkToApp(GLOBALS.topmostApp, payload, "alexa", header.namespace);
          }
        }
        else if (header.namespace === "AudioPlayer") {
          if (header.name === "Play") {
            AlexaApi.get().displaySmartScreenOverlay(true)
            AlexaAudioplayerActive = true;
            console.log("App AudioPlayer: Suspending the current app:'" + GLOBALS.topmostApp + "'");
            if (GLOBALS.topmostApp != GLOBALS.selfClientName) {
              appApi.exitApp(GLOBALS.topmostApp);
            }
          }
        }
        else if (header.namespace === "TemplateRuntime") {
          if (header.name === "RenderPlayerInfo") {
            AlexaApi.get().displaySmartScreenOverlay(true)
            AlexaAudioplayerActive = true;
          }
        }
        else if (header.namespace === "Speaker") {
          console.log("Speaker")
          if (header.name === "AdjustVolume") {
            VolumePayload.msgPayload.event.header.messageId = header.messageId
            appApi.getConnectedAudioPorts().then(audioport => {
              for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
                if ((Storage.get("deviceType") == "tv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) ||
                  (Storage.get("deviceType") != "tv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))) {
                  appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
                    console.log("getVolumeLevel[" + audioport.connectedAudioPorts[i] + "] is:" + parseInt(volres.volumeLevel))
                    if ((parseInt(volres.volumeLevel) >= 0) || (parseInt(volres.volumeLevel) <= 100)) {
                      VolumePayload.msgPayload.event.payload.volume = parseInt(volres.volumeLevel) + payload.volume
                      console.log("volumepayload", VolumePayload.msgPayload.event.payload.volume)
                      if (VolumePayload.msgPayload.event.payload.volume < 0) {
                        VolumePayload.msgPayload.event.payload.volume = 0
                      } else if (VolumePayload.msgPayload.event.payload.volume > 100) {
                        VolumePayload.msgPayload.event.payload.volume = 100
                      }
                    }
                    appApi.setVolumeLevel(audioport.connectedAudioPorts[i], VolumePayload.msgPayload.event.payload.volume).then(() => {
                      let volumeIncremented = parseInt(volres.volumeLevel) < VolumePayload.msgPayload.event.payload.volume ? true : false
                      if(volumeIncremented && VolumePayload.msgPayload.event.payload.muted) {
                        VolumePayload.msgPayload.event.payload.muted = false
                      }
                      if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
                        this.tag("Volume").onVolumeChanged(volumeIncremented);
                      } else {
                        if (Router.getActiveHash() === "applauncher") {
                         RDKShellApis.moveToFront(GLOBALS.selfClientName)
                         RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                          this.tag("Volume").onVolumeChanged(volumeIncremented);
                        } else {
                         RDKShellApis.moveToFront(GLOBALS.selfClientName)
                         RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                          Router.navigate("applauncher");
                          this.tag("Volume").onVolumeChanged(volumeIncremented);
                        }
                      }
                    });
                  });
                }
              }
            });
          }
          if (header.name === "SetVolume") {
            VolumePayload.msgPayload.event.header.messageId = header.messageId
            VolumePayload.msgPayload.event.payload.volume = payload.volume
            console.log("adjust volume", VolumePayload)
            console.log("checkvolume", VolumePayload.msgPayload.event.payload.volume)
            if (VolumePayload.msgPayload.event.payload.volume > 100) {
              VolumePayload.msgPayload.event.payload.volume = 100
            } else if (VolumePayload.msgPayload.event.payload.volume < 0) {
              VolumePayload.msgPayload.event.payload.volume = 0
            }
            appApi.getConnectedAudioPorts().then(audioport => {
              for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
                if ((Storage.get("deviceType") == "tv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) ||
                  (Storage.get("deviceType") != "tv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))) {
                    let volumeIncremented
                  appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
                    volumeIncremented = parseInt(volres.volumeLevel) < VolumePayload.msgPayload.event.payload.volume ? true : false
                    if(volumeIncremented && VolumePayload.msgPayload.event.payload.muted) {
                      VolumePayload.msgPayload.event.payload.muted = false
                    }
                  })
                  appApi.setVolumeLevel(audioport.connectedAudioPorts[i], VolumePayload.msgPayload.event.payload.volume).then(() => {
                    if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
                      this.tag("Volume").onVolumeChanged(volumeIncremented);
                    } else {
                      if (Router.getActiveHash() === "applauncher") {
                       RDKShellApis.moveToFront(GLOBALS.selfClientName)
                       RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                        this.tag("Volume").onVolumeChanged(volumeIncremented);
                      } else {
                       RDKShellApis.moveToFront(GLOBALS.selfClientName)
                       RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                        Router.navigate("applauncher");
                        this.tag("Volume").onVolumeChanged(volumeIncremented);
                      }
                    }
                  });
                }
              }
            });
          }
          if (header.name === "SetMute") {
            VolumePayload.msgPayload.event.header.messageId = header.messageId
            VolumePayload.msgPayload.event.payload.volume = payload.volume
            VolumePayload.msgPayload.event.payload.muted = payload.mute
            if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
              this.tag("Volume").onVolumeMute(payload.mute);
            } else {
              if (Router.getActiveHash() === "applauncher") {
               RDKShellApis.moveToFront(GLOBALS.selfClientName)
               RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                this.tag("Volume").onVolumeMute(payload.mute);
              } else {
               RDKShellApis.moveToFront(GLOBALS.selfClientName)
               RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
                Router.navigate("applauncher");
                this.tag("Volume").onVolumeMute(payload.mute);
              }
            }
          }
        }
        else if (header.namespace === "ExternalMediaPlayer") {
          appApi.deeplinkToApp(GLOBALS.topmostApp, payload, "alexa", header.namespace);
        }
      }
      if ((AlexaApi.get().checkAlexaAuthStatus() != "AlexaUserDenied") && notification.xr_speech_avs.deviceSettings) {
        let updatedLanguage = availableLanguageCodes[Language.get()]
        if (notification.xr_speech_avs.deviceSettings.currentLocale.toString() != updatedLanguage) {
          /* Get Alexa matching Locale String */
          for (let i = 0; i < notification.xr_speech_avs.deviceSettings.supportedLocales.length; i++) {
            if (updatedLanguage === notification.xr_speech_avs.deviceSettings.supportedLocales[i].toString()) {
              AlexaApi.get().updateDeviceLanguageInAlexa(updatedLanguage)
            }
          }
        }
      }
    });
    voiceApi.registerEvent('onSessionBegin', () => {
      this.$hideImage(0);
    });
    voiceApi.registerEvent('onSessionEnd', notification => {
      if (notification.result === "success" && notification.success.transcription === "User request to disable Alexa") {
        console.warn("App VoiceControl.onSessionEnd got disable Alexa.")
        AlexaApi.get().resetAVSCredentials() // To avoid Audio Feedback
        AlexaApi.get().setAlexaAuthStatus("AlexaUserDenied") // Reset back to disabled as resetAVSCredentials() sets to ErrorHandling.
      }
    });
  }

  _handleAlexaError(visibility) {
    this.tag("Failscreen1").alpha = visibility
    this.tag("Widgets").visible = !visibility;
    this.tag("Pages").visible = !visibility;
  }

  jumpToRoute(route) {
    if (GLOBALS.topmostApp != GLOBALS.selfClientName) {
      appApi.exitApp(GLOBALS.topmostApp).catch(err => {
        console.log("jumpToRoute err: " + err)
      });
      Storage.set("lastVisitedRoute", route);// incase any state change event tries to navigate, it need to be navigated to alexa requested route
      GLOBALS.LastvisitedRoute= route
      Router.navigate(route);
    } else {
      if (!Router.isNavigating()) {
        if (Router.getActiveHash() === "dtvplayer") { //exit scenario for dtv player
          dtvApi
            .exitChannel()
            .then((res) => {
              console.log("exit channel: ", JSON.stringify(res));
            })
            .catch((err) => {
              console.log("failed to exit channel: ", JSON.stringify(err));
            });
          if (Router.getActiveWidget()) {
            Router.getActiveWidget()._setState("IdleState");
          }
        }
        Storage.set("lastVisitedRoute", route);
        Router.navigate(route);
        GLOBALS.LastvisitedRoute= route
      }
    }
  }
}
