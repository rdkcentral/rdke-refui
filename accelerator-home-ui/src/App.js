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
import {
	Utils,
	Router,
	Storage,
	Settings,
	Language
} from '@lightningjs/sdk';
import ThunderJS from 'ThunderJS';
import routes from './routes/routes';
import AppApi from '../src/api/AppApi.js';
import XcastApi from '../src/api/XcastApi';
import {
	CONFIG,
	GLOBALS,
	availableLanguageCodes
} from './Config/Config';
import Keymap from './Config/Keymap';
import Menu from './views/Menu'
import Failscreen from './screens/FailScreen';
import {
	keyIntercept
} from './keyIntercept/keyIntercept';
import HDMIApi from './api/HDMIApi';
import Volume from './tvOverlay/components/Volume';
import DTVApi from './api/DTVApi';
import TvOverlayScreen from './tvOverlay/TvOverlayScreen';
import ChannelOverlay from './MediaPlayer/ChannelOverlay';
import SettingsOverlay from './overlays/SettingsOverlay';
import {
	AlexaLauncherKeyMap,
	PlaybackStateReport,
	VolumePayload
} from './Config/AlexaConfig';
import AppCarousel from './overlays/AppCarousel';
import VideoScreen from './screens/Video';
import VideoInfoChange from './overlays/VideoInfoChange/VideoInfoChange.js';
import Failscreen1 from './screens/FailScreen';
import CECApi from './api/CECApi';
import {
	appListInfo
} from "./../static/data/AppListInfo.js";
import VoiceApi from './api/VoiceApi.js';
import AlexaApi from './api/AlexaApi.js';
import AAMPVideoPlayer from './MediaPlayer/AAMPVideoPlayer';
import FireBoltApi from './api/firebolt/FireBoltApi';
import PinChallengeProvider from './api/firebolt/provider/PinChallengeProvider';
import AckChallengeProvider from './api/firebolt/provider/AckChallengeProvider';
import KeyboardUIProvider from './api/firebolt/provider/KeyboardUIProvider';
import {
	AcknowledgeChallenge,
	Keyboard,
	PinChallenge
} from '@firebolt-js/manage-sdk'
import PersistentStoreApi from './api/PersistentStore.js';
import {
	Localization,
	Metrics
} from '@firebolt-js/sdk';
import RDKShellApis from './api/RDKShellApis.js';
import Miracast from './api/Miracast.js';
import MiracastNotification from './screens/MiracastNotification.js';
import NetworkManager from './api/NetworkManagerAPI.js';
import PowerManagerApi from './api/PowerManagerApi.js';
import UserSettingsApi from './api/UserSettingsApi';

var AlexaAudioplayerActive = false;
var thunder = ThunderJS(CONFIG.thunderConfig);
var appApi = new AppApi();
var dtvApi = new DTVApi();
var cecApi = new CECApi();
var xcastApi = new XcastApi();
var voiceApi = new VoiceApi();
var miracast = new Miracast();

export default class App extends Router.App {

	constructor(...args) {
		super(...args);
		this.INFO = console.info;
		this.LOG = console.log;
		this.ERR = console.error;
		this.WARN = console.warn;
	}

	_handleAppClose() {
		this.application.closeApp();
	}
	static getFonts() {
		return [{
			family: 'Play',
			url: Utils.asset('fonts/Play/Play-Regular.ttf')
		}];
	}


	_setup() {
		this.LOG("accelerator-home-ui version: " + JSON.stringify(Settings.get("platform", "version")));
		this.LOG("UI setup selfClientName:" + JSON.stringify(GLOBALS.selfClientName) + ", current topmostApp:" + JSON.stringify(GLOBALS.topmostApp));
		Storage.set("ResolutionChangeInProgress", false);
		Router.startRouter(routes, this);
		document.onkeydown = e => {
			if (e.keyCode == Keymap.Backspace) {
				e.preventDefault();
			}
		};

		function updateAddress() {
			if (window.navigator.onLine) {
				console.log("is online");
			} else {
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
					type: MiracastNotification
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
			language: ("ResidentApp" === GLOBALS.selfClientName ? CONFIG.language : Localization.language()) || 'en'
		}
	}

	$updateTimeZone(timezone) {
		this.tag('Menu').updateTimeZone(timezone)
	}

	_captureKey(key) {
		this.LOG("Got keycode : " + JSON.stringify(key.keyCode))
		this.LOG("powerState ===>" + JSON.stringify(GLOBALS.powerState))
		if (GLOBALS.powerState !== "ON") {
			appApi.setPowerState("ON").then(res => {
				res ? this.LOG("successfully set the power state to ON from " + JSON.stringify(GLOBALS.powerState)) : this.LOG("Failure while turning ON the device")
			})
			return true
		}
		this.$hideImage(0);
		return this._performKeyPressOPerations(key)
	}
	_performKeyPressOPerations(key) {
		let self = this;
			if(GLOBALS.MiracastNotificationstatus && key.keyCode !== Keymap.Power && key.keyCode !== Keymap.Home ){
				return false
			} else if ((key.keyCode == Keymap.Home || key.keyCode == Keymap.Escape) && !Router.isNavigating()) {
			if (GLOBALS.topmostApp.includes("dac.native")) {
				this.jumpToRoute("apps");
			} else if (GLOBALS.Miracastclientdevicedetails.state === "INITIATED" || GLOBALS.Miracastclientdevicedetails.state === "INPROGRESS ") {
				miracast.stopClientConnection(GLOBALS.Miracastclientdevicedetails.mac, GLOBALS.Miracastclientdevicedetails.name)
			} else if (GLOBALS.Miracastclientdevicedetails.state === "PLAYING") {
				miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac, GLOBALS.Miracastclientdevicedetails.name, 300)
			} else if(GLOBALS.MiracastNotificationstatus){
				this.jumpToRoute("menu");
				miracast.acceptClientConnection("Reject").then(res=>{
					if(res.success){Router.focusPage()} 
				})
		    } else {
				this.jumpToRoute("menu"); //method to exit the current app(if any) and route to home screen
			}
			return true
		} else if (key.keyCode == Keymap.Inputs_Shortcut && !Router.isNavigating()) { //for inputs overlay
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
		} else if (key.keyCode == Keymap.Picture_Setting_Shortcut && !Router.isNavigating()) { //for video settings overlay
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
		} else if (key.keyCode == Keymap.Settings_Shortcut && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) { //launch settings overlay/page depending on the current route.
				if (Router.getActiveHash() === "player" || Router.getActiveHash() === "dtvplayer" || Router.getActiveHash() === "usb/player") { //player supports settings overlay, so launch it as overlay
					if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "SettingsOverlay") { //currently focused on settings overlay, so hide it
						Router.focusPage();
					} else { //launch the settings overlay
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
					} else { //launch the settings overlay
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
		} else if (key.keyCode == Keymap.Guide_Shortcut && !Router.isNavigating()) {
			this.jumpToRoute("epg"); //method to exit the current app(if any) and route to home screen
			return true
		} else if (key.keyCode == Keymap.Amazon && !Router.isNavigating()) {
			return this.launchFeaturedApp("Amazon")
		} else if (key.keyCode == Keymap.Youtube && !Router.isNavigating()) {
			this.launchFeaturedApp("YouTube")
			return true
		} else if (key.keyCode == Keymap.Netflix && !Router.isNavigating()) { //launchLocation mapping is in launchApp method in AppApi.js
			this.launchFeaturedApp("Netflix")
			return true
		} else if (key.keyCode == Keymap.AppCarousel && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) { // if resident app is on focus
				if (Router.getActiveHash() === "menu") {
					return true;
				} else if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on appcarousel, so hide it
					Router.focusPage();
				} else { //launch the app carousel
					Router.focusWidget("AppCarousel")
				}
			} else { //currently on some application
				if (Router.getActiveHash() === "applauncher") { //if route is applauncher just focus the overlay widget
					if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on settings overlay, so hide it
						Router.focusPage();
						this._moveApptoFront(GLOBALS.topmostApp, true)
					} else { //launch the settings overlay
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
		} else if (key.keyCode == Keymap.Power) {
			// Remote power key and keyboard F1 key used for STANDBY and POWER_ON
			return this._powerKeyPressed()
		} else if (key.keyCode === Keymap.AudioVolumeMute && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
				this.tag("Volume").onVolumeMute();
			} else {
				this.LOG("muting on some app")
				if (Router.getActiveHash() === "applauncher") {
					this.LOG("muting on some app while route is app launcher")
					RDKShellApis.moveToFront(GLOBALS.selfClientName)
					RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
					this.tag("Volume").onVolumeMute();
				} else {
					this.LOG("muting on some app while route is NOT app launcher")
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
				this.LOG("muting on some app")
				if (Router.getActiveHash() === "applauncher") {
					this.LOG("muting on some app while route is app launcher")
					RDKShellApis.moveToFront(GLOBALS.selfClientName)
					RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
					this.tag("Volume").onVolumeKeyUp();
				} else {
					this.LOG("muting on some app while route is NOT app launcher")
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
				this.LOG("muting on some app")
				if (Router.getActiveHash() === "applauncher") {
					this.LOG("muting on some app while route is app launcher")
					RDKShellApis.moveToFront(GLOBALS.selfClientName)
					RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
					this.tag("Volume").onVolumeKeyDown();
				} else {
					this.LOG("muting on some app while route is NOT app launcher")
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
			this.LOG(new Date().toISOString() + "AvDecoderStatusNotification: " + JSON.stringify(notification))
		})
	}

	userInactivity() {
		PersistentStoreApi.get().activate().then(() => {
			PersistentStoreApi.get().getValue('ScreenSaverTime', 'timerValue').then(result => {
				// check if result has value property and if it is not undefined^M
				if (result && result.value && result.value !== undefined && result.value !== "Off") {
					this.LOG("App PersistentStoreApi screensaver timer value is: " + JSON.stringify(result.value));
					RDKShellApis.enableInactivityReporting(true).then(() => {
						RDKShellApis.setInactivityInterval(result.value).then(() => {
							this.userInactivity = thunder.on('org.rdk.RDKShell', 'onUserInactivity', notification => {
								this.LOG("UserInactivityStatusNotification: " + JSON.stringify(notification))
								appApi.getAvCodeStatus().then(result => {
									this.LOG("Avdecoder" + JSON.stringify(result.avDecoderStatus));
									if ((result.avDecoderStatus === "IDLE" || result.avDecoderStatus === "PAUSE") && GLOBALS.topmostApp === "") {
										this.$hideImage(1);
									}
								})
							})
						})
					});
				} else {
					this.WARN("App PersistentStoreApi screensaver timer value is not set or is Off.")
					RDKShellApis.enableInactivityReporting(false).then(() => {
						this.userInactivity.dispose();
					})
				}
			}).catch(err => {
				this.ERR("App PersistentStoreApi getValue error: " + JSON.stringify(err));
				RDKShellApis.enableInactivityReporting(false).then(() => {
					this.userInactivity.dispose();
				})
			});
		}).catch(err => {
			this.ERR("App PersistentStoreApi activation error: " + JSON.stringify(err));
			reject(err);
		});
	}

	$hideImage(alpha) {
		if (alpha === 1) {
			this.tag("Widgets").visible = false;
			this.tag("Pages").visible = false;
		} else {
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
		this._getPowerStatebeforeReboot();

		keyIntercept(GLOBALS.selfClientName).catch(err => {
			this.ERR("App _init keyIntercept err:" + JSON.stringify(err));
		});
		this.userInactivity();
		this._registerFireboltListeners()

		Keyboard.provide('xrn:firebolt:capability:input:keyboard', new KeyboardUIProvider(this))
		this.LOG("Keyboard provider registered")
		PinChallenge.provide('xrn:firebolt:capability:usergrant:pinchallenge', new PinChallengeProvider(this))
		this.LOG("PinChallenge provider registered")
		AcknowledgeChallenge.provide('xrn:firebolt:capability:usergrant:acknowledgechallenge', new AckChallengeProvider(this))
		this.LOG("Acknowledge challenge provider registered")

		appApi.deviceType().then(result => {
			this.LOG("App detected deviceType as:" + JSON.stringify(((result.devicetype != null) ? result.devicetype : "IpTv")));
			GLOBALS.deviceType = ((result.devicetype != null) ? result.devicetype : "IpTv");
			Storage.set("deviceType", ((result.devicetype != null) ? result.devicetype : "IpTv"));
		});
		UserSettingsApi.get().activate();
		thunder.Controller.activate({
			callsign: 'org.rdk.System'
		}).then(result => {
			this.LOG("App System plugin activation result: " + JSON.stringify(result))
			let param = {
				//https://github.com/rdkcentral/entservices-apis/blob/1.15.11/docs/apis/PowerManagerPlugin.md#setWakeupSrcConfig
				//By the above documentation we passed the Enum value sum to enable all wakeup sources expect WAKEUP_REASON_UNKNOWN
				//Enum indicating bit position (bit counting starts at 1)
				"wakeupSources": 262143 
			}
			appApi.setWakeupSrcConfiguration(param);
			appApi.setPowerState(GLOBALS.powerState).then(res => {});
		}).catch(err => {
			this.ERR("App System plugin activation error: " + JSON.stringify(err));
		})
		appApi.getPluginStatus("org.rdk.DeviceDiagnostics").then(res => {
			this.LOG("App DeviceDiagnostics state:" + JSON.stringify(res[0].state))
			if (res[0].state === "deactivated") {
				thunder.Controller.activate({
					callsign: 'org.rdk.DeviceDiagnostics'
				}).then(() => {
					this.AvDecodernotificationcall();
				}).catch(err => {
					this.ERR("App DeviceDiagnostics plugin activation error: " + JSON.stringify(err));
				})
			} else {
				this.AvDecodernotificationcall();
			}
		})

		appApi.getHDCPStatus().then(result => {
			Storage.set("UICacheonDisplayConnectionChanged", result.isConnected);
		})

		if (GLOBALS.topmostApp !== "HDMI") { //to default to hdmi, if previous input was hdmi
			GLOBALS.topmostApp = GLOBALS.selfClientName; //to set the application type to none
		}
		GLOBALS.LastvisitedRoute = Storage.get("lastVisitedRoute")
		GLOBALS.Setup = Storage.get("setup")
		Storage.set("lastVisitedRoute", "menu"); //setting to menu so that it will be always defaulted to #menu
		GLOBALS.LastvisitedRoute = "menu";
		appApi.enableDisplaySettings().then(res => {
			this.LOG("results : " + JSON.stringify(res))
		}).catch(err => {
			this.ERR("error while enabling displaysettings:" + JSON.stringify(err));
		})
		appApi.cobaltStateChangeEvent()

		thunder.on('Controller.1', 'all', noti => {
			this.LOG("App controller notification:" + JSON.stringify(noti))
			if ((noti.data.url && noti.data.url.slice(-5) === "#boot") || (noti.data.httpstatus && noti.data.httpstatus != 200 && noti.data.httpstatus != -1)) { // to exit metro apps by pressing back key & to auto exit webapp if httpstatus is not 200
				appApi.exitApp(GLOBALS.topmostApp);
			}
			// TODO: make the check based on XcastApi.supportedApps() list
			if (Object.prototype.hasOwnProperty.call(noti, "callsign") && (noti.callsign.startsWith("YouTube") || noti.callsign.startsWith("Amazon") || noti.callsign.startsWith("Netflix"))) {
				let params = {
					applicationName: noti.callsign,
					state: 'stopped'
				};
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
				this.LOG("App Controller state change to xcast: " + JSON.stringify(params));
				this.xcastApi.setApplicationState(params).then(status => {
					if (status == false) {
						this.ERR("App xcast setApplicationState failed, trying fallback. error: ");
						this.xcastApi.onApplicationStateChanged(params).catch(err => {
							this.ERR("App xcast onApplicationStateChanged failed: " + JSON.stringify(err));
						});
					}
				});
				params = null;
			}
			if (noti.callsign === "org.rdk.HdmiCecSource") {
				this.SubscribeToHdmiCecSourcevent(noti.data.state, self.appIdentifiers)
			}
			if (noti.callsign === "org.rdk.MiracastPlayer") {
				if (noti.data.state === "activated") {
					this.LOG("subscribing the events for player")
					this.SubscribeToMiracastPlayer()
				}
			}
			if (noti.callsign === "org.rdk.MiracastService") {
				if (noti.data.state === "activated") {
					this.LOG("subscribing the events for Service")
					this.SubscribeToMiracastService()
				}
			}
			if (noti.callsign === "org.rdk.NetworkManager") {
				if (noti.data.state === "activated") {
					this.SubscribeToNetworkManager()
				}
			}
		})
		this._subscribeToRDKShellNotifications()
		appApi.getPluginStatus("Cobalt").then(() => {
			/* Loop through YouTube variants and set respective urls. */
			JSON.parse(JSON.stringify(appListInfo)).forEach(appInfo => {
				if (Object.prototype.hasOwnProperty.call(appInfo, "applicationType") && appInfo.applicationType.startsWith("YouTube") && Object.prototype.hasOwnProperty.call(appInfo, "uri") && appInfo.uri.length) {
					thunder.Controller.clone({
						callsign: "Cobalt",
						newcallsign: appInfo.applicationType
					}).then(result => {
						this.LOG("App Controller.clone Cobalt as " + JSON.stringify(appInfo.applicationType) + " done." + JSON.stringify(result));
					}).catch(err => {
						this.ERR("App Controller clone Cobalt for " + JSON.stringify(appInfo.applicationType) + " failed: " + JSON.stringify(err));
						Metrics.error(Metrics.ErrorType.OTHER, "PluginError", `Controller clone Cobalt for ${appInfo.applicationType} failed: ${err}`, false, null)
						// TODO: hide YouTube Icon and listing from Menu, AppCarousel, Channel overlay and EPG page.
					})

					appApi.getPluginStatus(appInfo.applicationType).then(res => {
						if (res[0].state !== "deactivated") {
							thunder.Controller.deactivate({
								callsign: appInfo.applicationType
							}).catch(err => {
								this.ERR("App Controller.deactivate " + JSON.stringify(appInfo.applicationType) + " failed. It may not work." + JSON.stringify(err));
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
									this.ERR("App Controller.configuration@" + JSON.stringify(appInfo.applicationType) + " set failed. It may not work." + JSON.stringify(err));
									Metrics.error(Metrics.ErrorType.OTHER, "pluginError", `App Controller.configuration for ${appInfo.applicationType} set failed. It may not work. ${JSON.stringify(err)}`, false, null)
								})
							}).catch(err => {
								this.ERR("App Controller.configuration@" + JSON.stringify(appInfo.applicationType) + " get failed. It may not work." + JSON.stringify(err));
								Metrics.error(Metrics.ErrorType.OTHER, "pluginError", `App Controller.configuration@ for ${appInfo.applicationType} failed with ${JSON.stringify(err)}`, false, null)
							})
						} else {
							/* Just store the plugin configured url as default url and ensure '?' is appended. */
							Storage.set(appInfo.applicationType + "DefaultURL", (res[0].configuration.url.includes('?') ? res[0].configuration.url : res[0].configuration.url + "?"));
						}
					}).catch(err => {
						this.ERR("App getPluginStatus " + JSON.stringify(appInfo.applicationType) + " Error: " + JSON.stringify(err));
					})
				}
			});
		}).catch(err => {
			this.ERR("App getPluginStatus Cobalt error: " + JSON.stringify(err));
		})
		//video info change events begin here---------------------
		/********************   RDKUI-341 CHANGES - DEEP SLEEP/LIGHT SLEEP **************************/
		this._subscribeToControlNotifications()
		let cachedPowerState = Storage.get('SLEEPING');
		this.LOG("cached power state" + JSON.stringify(cachedPowerState))
		this.LOG(typeof cachedPowerState)
		if (cachedPowerState) {
			appApi.getWakeupReason().then(result => {
				if (result.result.wakeupReason !== 'WAKEUP_REASON_UNKNOWN') {
					cachedPowerState = 'ON'
				}
			})
			appApi.setPowerState(cachedPowerState).then(result => {
				if (result) {
					this.LOG("successfully set powerstate to: " + JSON.stringify(cachedPowerState))
				}
			})
		}
		appApi.getPluginStatus('org.rdk.PowerManager').then(result => {
			if (result && result.length > 0 && result[0].state === "activated") {
				console.log("org.rdk.PowerManager is already activated");
			} else {
				 PowerManagerApi.get().activate().then((res) => {
					this.LOG("activating the powermanager from app.js " + JSON.stringify(res))
				}).catch((err) => this.ERR(JSON.stringify(err)))
			}
		})
		appApi.getPluginStatus('org.rdk.NetworkManager').then(result => {
			if (result[0].state === "activated") {
				this.SubscribeToNetworkManager()
			} else {
				NetworkManager.activate().then((res) => {}).catch((err) => console.error(err))
			}
		})
		appApi.getPluginStatus('org.rdk.MiracastPlayer').then(result => {
			if (result[0].state === "activated") {
				this.SubscribeToMiracastPlayer()
			} else {
				miracast.activatePlayer().then((res) => {
					this.LOG("activating the miracst player from app.js " + JSON.stringify(res))
				}).catch((err) => this.ERR(JSON.stringify(err)))
			}
		})
		appApi.getPluginStatus('org.rdk.MiracastService').then(result => {
			if (result[0].state === "activated") {
				miracast.getEnable().then((res) => {
					if (!res.enabled) {
						miracast.setEnable(true)
					}
				})
				this.SubscribeToMiracastService()
			} else {
				miracast.activateService().then((res) => {
					miracast.getEnable().then(async (res) => {
						if (!res.enabled) {
							await miracast.setEnable(true)
						}
					})
					this.LOG("activating the miracst Service from app.js " + JSON.stringify(res))
				}).catch((err) => this.ERR(JSON.stringify(err)))
			}
		})
		/********************   RDKUI-303 - PAGE VISIBILITY API **************************/

		//ACTIVATING HDMI CEC PLUGIN
		appApi.getPluginStatus('org.rdk.HdmiCecSource').then(result => {
			if (result[0].state === "activated") {
				this.SubscribeToHdmiCecSourcevent(result[0].state, self.appIdentifiers)
				let getfriendlyname, getosdname;
				setTimeout(() => {
					xcastApi.getFriendlyName().then(res => {
						getfriendlyname = res.friendlyname;
						this.LOG("XcastApi getFriendlyName :" + JSON.stringify(getfriendlyname));
					}).catch(err => {
						this.ERR("XcastApi getFriendlyName Error: " + JSON.stringify(err));
					})
					cecApi.getOSDName().then(result => {
						getosdname = result.name;
						this.LOG("CECApi getOSDName :" + JSON.stringify(getosdname));
						if (getfriendlyname !== getosdname) {
							cecApi.setOSDName(getfriendlyname);
						}
					}).catch(err => {
						this.ERR("CECApi getOSDName Error :" + JSON.stringify(err));
					})
				}, 5000);
				cecApi.getActiveSourceStatus().then((res) => {
					Storage.set("UICacheCECActiveSourceStatus", res);
					this.LOG("App getActiveSourceStatus: " + JSON.stringify(res) + " UICacheCECActiveSourceStatus:" + JSON.stringify(Storage.get("UICacheCECActiveSourceStatus")));
				});
			} else {
				cecApi.activate().then(() => {
					let getfriendlyname, getosdname;
					setTimeout(() => {
						xcastApi.getFriendlyName().then(res => {
							getfriendlyname = res.friendlyname;
							this.LOG("XcastApi getFriendlyName :" + JSON.stringify(getfriendlyname));
						}).catch(err => {
							this.ERR("XcastApi getFriendlyName Error: " + JSON.stringify(err));
						})
						cecApi.getOSDName().then(result => {
							getosdname = result.name;
							this.LOG("CECApi getOSDName :" + JSON.stringify(getosdname));
							if (getfriendlyname !== getosdname) {
								cecApi.setOSDName(getfriendlyname);
							}
						}).catch(err => {
							this.ERR("CECApi getOSDName Error :" + JSON.stringify(err));
						})
					}, 5000);
					cecApi.getActiveSourceStatus().then((res) => {
						Storage.set("UICacheCECActiveSourceStatus", res);
						this.LOG("App getActiveSourceStatus: " + JSON.stringify(res) + " UICacheCECActiveSourceStatus:" + JSON.stringify(Storage.get("UICacheCECActiveSourceStatus")));
					});
				}).catch((err) => this.ERR(JSON.stringify(err)))
			}
		})
		this._subscribeToIOPortNotifications()

		this._updateLanguageToDefault()

		this.xcastApi = new XcastApi()
		this.xcastApi.activate().then(async result => {
			console.warn("Xcast plugin activate");
			if (result) {
				this.registerXcastListeners();
				// Update Xcast friendly name
				let serialnumber = "DefaultSLNO";
				let modelName = "RDK" + GLOBALS.deviceType;
				await appApi.getSerialNumber().then(async res => {
					// Reduce display length; trim to last 6 characters
					serialnumber = (res.length < 6) ? res : res.slice(-6);
				});
				await this.xcastApi.getModelName().then(model => {
					modelName = model + serialnumber;
				});
				this.LOG("Xcast friendly name to be set: " + JSON.stringify(modelName));
				await this.xcastApi.setFriendlyName(modelName);
				await this.xcastApi.setEnabled(true).then(res => {
					GLOBALS.LocalDeviceDiscoveryStatus = true;
					console.warn("Xcast setEnabled success" + JSON.stringify(res));
				}).catch(err => {
					GLOBALS.LocalDeviceDiscoveryStatus = false;
					this.ERR("Xcast setEnabled error:" + JSON.stringify(err))
				});
				await this.xcastApi.setStandbyBehavior("active").then(async res => {
					this.LOG("XcastApi setStandbyBehavior result:" + JSON.stringify(res));
					let params = {
						"applications": []
					};
					try {
						await appApi.getPluginStatus("Cobalt").then(async res => {
							params.applications.push({
								"cors": ".youtube.com",
								"name": "YouTube",
								"prefix": "myYoutube"
							}, {
								"cors": ".youtube.com",
								"name": "YouTubeTV",
								"prefix": "myYouTubeTV"
							});
						});
					} catch (e) {
						this.ERR("getPluginStatus error :" + JSON.stringify(e))
					}
					try {
						await appApi.getPluginStatus("Amazon").then(async res => {
							params.applications.push({
								"name": "AmazonInstantVideo",
								"prefix": "myPrimeVideo",
								"cors": ".amazon.com"
							})
						});
					} catch (e) {
						this.ERR("Amazon getPluginStatus error :" + JSON.stringify(e))
					}
					try {
						await appApi.getPluginStatus("Netflix").then(async res => {
							params.applications.push({
								"name": "Netflix",
								"prefix": "myNetflix",
								"cors": ".netflix.com"
							})
						});
					} catch (e) {
						this.ERR("Amazon getPluginStatus error :" + JSON.stringify(e))
					}
					console.warn("Xcast register app param " + JSON.stringify(params));
					await this.xcastApi.registerApplications(params).then(async res => {
						console.warn("Xcast registerApplications success" + JSON.stringify(res));
					}).catch(err => {
						this.ERR("Xcast registerApplications error:" + JSON.stringify(err))
					});
				}).catch(error => {
					this.ERR("XcastApi setStandbyBehavior error:" + JSON.stringify(error));
				});
			} else {
				this.ERR("XcastApi activate failed");
			}
		})
	}

	SubscribeToNetworkManager() {
		thunder.on('org.rdk.NetworkManager', 'onInterfaceStateChange', data => {
			console.warn("onInterfaceStateChange:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onAddressChange', data => {
			console.warn(" onAddressChange:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onActiveInterfaceChange', data => {
			console.warn("onActiveInterfaceChange:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onInternetStatusChange', data => {
			if (data.status === "FULLY_CONNECTED") {
				GLOBALS.IsConnectedToInternet = true
			}
			console.warn("onInternetStatusChange:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onAvailableSSIDs', data => {
			console.warn(" onAvailableSSIDs:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onWiFiStateChange', data => {
			console.warn("onWiFiStateChange:", data);
		});
		thunder.on('org.rdk.NetworkManager', 'onWiFiSignalStrengthChange', data => {
			console.warn("onWiFiSignalStrengthChange:", data);
		});

	}
	SubscribeToMiracastService() {
		thunder.on('org.rdk.MiracastService.1', 'onClientConnectionRequest', data => {
			this.LOG('onClientConnectionRequest ' + JSON.stringify(data));
			this.tag("MiracastNotification").notify(data)
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
				Router.focusWidget("MiracastNotification")
			} else {
				this._moveApptoFront(GLOBALS.selfClientName, true)
				Router.navigate("applauncher");
				Router.focusWidget("MiracastNotification")
			}
		});
		thunder.on('org.rdk.MiracastService.1', 'onLaunchRequest', data => {
			miracast.playRequest(
				data.device_parameters.source_dev_ip,
				data.device_parameters.source_dev_mac,
				data.device_parameters.source_dev_name,
				data.device_parameters.sink_dev_ip,
				0,
				0,
				1920,
				1080,
			)
			this.LOG('onLaunchRequest ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.MiracastService.1', 'onClientConnectionError', data => {
			if (data.name === GLOBALS.Miracastclientdevicedetails.name) {
				miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac, GLOBALS.Miracastclientdevicedetails.name, 300)
			}
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
				this.tag("Fail").notify({
					title: Language.translate("Miracast Status"),
					msg: `${Language.translate("Reason Code :")}  ${data.error_code} ${Language.translate("Reason :")}${data.reason} `
				})
				Router.focusWidget("Fail")
			} else {
				this._moveApptoFront(GLOBALS.selfClientName, true)
				Router.navigate("applauncher");
				this.tag("Fail").notify({
					title: Language.translate("Miracast Status"),
					msg: `${Language.translate("Reason Code :")} ${data.error_code} ${Language.translate("Reason :")}${data.reason} `
				})
				Router.focusWidget("Fail")
			}
			this.LOG('onClientConnectionError ' + JSON.stringify(data));
		});
	}

	SubscribeToMiracastPlayer() {
		thunder.on('org.rdk.MiracastPlayer.1', 'onStateChange', data => {
			this.LOG('onStateChange ' + JSON.stringify(data));
			GLOBALS.Miracastclientdevicedetails = data
			if (data.state === "PLAYING") {
				if (GLOBALS.topmostApp != GLOBALS.selfClientName) {
					appApi.exitApp(GLOBALS.topmostApp).then(() => {
						RDKShellApis.setVisibility(GLOBALS.topmostApp, GLOBALS.topmostApp, false)
						miracast.updatePlayerState(data.mac, data.state, data.reason_code, data.reason)
						GLOBALS.topmostApp = "MiracastPlayer"
					}).catch(err => {
						this.ERR("exitapp err: " + JSON.stringify(err))
					});
				} else {
					RDKShellApis.setVisibility(GLOBALS.selfClientName, GLOBALS.selfClientName, false)
					miracast.updatePlayerState(data.mac, data.state, data.reason_code, data.reason)
					GLOBALS.topmostApp = "MiracastPlayer"
				}

			}
			if (data.state === "STOPPED") {
				RDKShellApis.setVisibility(GLOBALS.selfClientName, true)
				Router.navigate(GLOBALS.LastvisitedRoute);
				if (data.reason_code != 200) {
					this.tag("Fail").notify({
						title: Language.translate("Miracast Status"),
						msg: `${Language.translate("Reason Code :")} ${data.reason_code} ${Language.translate("Reason :")}${data.reason} `
					})
					Router.focusWidget("Fail")
				}
				miracast.updatePlayerState(data.mac, data.state, data.reason_code, data.reason)
				GLOBALS.Miracastclientdevicedetails = {
					mac: null,
					name: null,
					reason_code: null,
					state: null
				}
				GLOBALS.topmostApp = GLOBALS.selfClientName
			}
		});
	}
	_subscribeToRDKShellNotifications() {
		thunder.on('org.rdk.RDKShell', 'onApplicationActivated', data => {
			this.WARN("[RDKSHELLEVT] onApplicationActivated:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationConnected', data => {
			this.WARN("[RDKSHELLEVT] onApplicationConnected:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationDisconnected', data => {
			this.WARN("[RDKSHELLEVT] onApplicationDisconnected:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationFirstFrame', data => {
			this.WARN("[RDKSHELLEVT] onApplicationFirstFrame:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationLaunched', data => {
			this.WARN("[RDKSHELLEVT] onApplicationLaunched:" + JSON.stringify(data));
			if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
				RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
				GLOBALS.topmostApp = data.client;
			}
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationResumed', data => {
			this.WARN("[RDKSHELLEVT] onApplicationResumed:" + JSON.stringify(data));
			if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
				RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
				GLOBALS.topmostApp = data.client;
			}
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationSuspended', data => {
			this.WARN("[RDKSHELLEVT] onApplicationSuspended:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onApplicationTerminated', data => {
			this.WARN("[RDKSHELLEVT] onApplicationTerminated:" + JSON.stringify(data));
			if ((data.client != GLOBALS.selfClientName) && (GLOBALS.topmostApp != GLOBALS.selfClientName)) {
				appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
					AlexaApi.get().reportApplicationState("menu", true);
				});
			}
		});
		thunder.on('org.rdk.RDKShell', 'onHibernated', data => {
			this.WARN("[RDKSHELLEVT] onHibernated:" + JSON.stringify(data));
			if (data.callsign && data.callsign.startsWith('YouTube')) {
				RDKShellApis.removeKeyIntercept({
					"keyCode": 173,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 174,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 175,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 115,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
			}
			if (data.success) {
				if ((GLOBALS.topmostApp === data.client) &&
					(GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui") && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") {
					appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
						AlexaApi.get().reportApplicationState("menu", true);
					});
				}
			}
		});
		thunder.on('org.rdk.RDKShell', 'onRestored', data => {
			this.WARN("[RDKSHELLEVT] onRestored:" + JSON.stringify(data));
			if (data.callsign && data.callsign.startsWith('YouTube')) {
				RDKShellApis.addKeyIntercepts({
					"intercepts": [{
						"keys": [{
							"keyCode": 173,
							"modifiers": []
						}, {
							"keyCode": 174,
							"modifiers": []
						}, {
							"keyCode": 175,
							"modifiers": []
						}, {
							"keyCode": 115,
							"modifiers": []
						}],
						"client": data.callsign
					}]
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
			}
		});
		thunder.on('org.rdk.RDKShell', 'onDestroyed', data => {
			this.WARN("[RDKSHELLEVT] onDestroyed:" + JSON.stringify(data));
			// No need to handle this when UI is in Firebolt compatible mode.
			if (data.client && data.client.startsWith('YouTube')) {
				RDKShellApis.removeKeyIntercept({
					"keyCode": 173,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 174,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 175,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 115,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
			}
			if ((GLOBALS.topmostApp === data.client) &&
				(GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui") && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") {
				appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
					AlexaApi.get().reportApplicationState("menu", true);
				});
			}
		});
		thunder.on('org.rdk.RDKShell', 'onLaunched', data => {
			this.WARN("[RDKSHELLEVT] onLaunched:" + JSON.stringify(data));
			if (GLOBALS.Miracastclientdevicedetails.mac != null && GLOBALS.Miracastclientdevicedetails.name != null) {
				miracast.stopRequest(GLOBALS.Miracastclientdevicedetails.mac, GLOBALS.Miracastclientdevicedetails.name, 300)
			}
			if ((data.launchType === "activate") || (data.launchType === "resume")) {
				// Change (Tracked TopMost) UI's visibility to false only for other apps.
				if (data.client.startsWith('YouTube')) {
					RDKShellApis.addKeyIntercepts({
						"intercepts": [{
							"keys": [{
								"keyCode": 173,
								"modifiers": []
							}, {
								"keyCode": 174,
								"modifiers": []
							}, {
								"keyCode": 175,
								"modifiers": []
							}, {
								"keyCode": 115,
								"modifiers": []
							}],
							"client": data.client
						}]
					}).then(res => {
						this.WARN(JSON.stringify(res))
					})
				}
				if ((data.client != GLOBALS.selfClientName) &&
					((GLOBALS.topmostApp === "ResidentApp") ||
						(GLOBALS.topmostApp === GLOBALS.selfClientName))) {
					RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
				}
				if (((GLOBALS.topmostApp != "ResidentApp") ||
						(GLOBALS.topmostApp != GLOBALS.selfClientName)) &&
					(GLOBALS.topmostApp != data.client)) {
					appApi.suspendPremiumApp(GLOBALS.topmostApp);
				}
				// Assuming launch is followed by moveToFront & setFocus
				GLOBALS.topmostApp = data.client;
				AlexaApi.get().reportApplicationState(data.client);
			} else if (data.launchType === "suspend") {
				// No need to handle this here when UI is in Firebolt compatible mode.
				// It will be done at RefUI's 'foreground' event handler.
				if (data.client.startsWith('YouTube')) {
					RDKShellApis.removeKeyIntercept({
						"keyCode": 173,
						"modifiers": [],
						"client": data.client
					}).then(res => {
						this.WARN(JSON.stringify(res))
					})
					RDKShellApis.removeKeyIntercept({
						"keyCode": 174,
						"modifiers": [],
						"client": data.client
					}).then(res => {
						this.WARN(JSON.stringify(res))
					})
					RDKShellApis.removeKeyIntercept({
						"keyCode": 175,
						"modifiers": [],
						"client": data.client
					}).then(res => {
						this.WARN(JSON.stringify(res))
					})
					RDKShellApis.removeKeyIntercept({
					"keyCode": 115,
					"modifiers": [],
					"client": data.callsign
					}).then(res => {
						this.WARN(JSON.stringify(res))
					})
				}
				if ((GLOBALS.topmostApp === data.client) &&
					(GLOBALS.selfClientName === "ResidentApp") && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") {
					appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
						AlexaApi.get().reportApplicationState("menu", true);
					});
				}
			}
		});
		thunder.on('org.rdk.RDKShell', 'onSuspended', data => {
			this.WARN("[RDKSHELLEVT] onSuspended:" + JSON.stringify(data));
			// No need to handle this here when UI is in Firebolt compatible mode.
			if (data.client.startsWith('YouTube')) {
				RDKShellApis.removeKeyIntercept({
					"keyCode": 173,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 174,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 175,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 115,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
			}
			if ((GLOBALS.topmostApp === data.client) &&
				(GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui") && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") {
				appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
					AlexaApi.get().reportApplicationState("menu", true);
				});
			}
		});
		thunder.on('org.rdk.RDKShell', 'onWillDestroy', data => {
			this.WARN("[RDKSHELLEVT] onWillDestroy:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onPluginSuspended', data => {
			this.WARN("[RDKSHELLEVT] onPluginSuspended:" + JSON.stringify(data));
			if (data.client.startsWith('YouTube')) {
				RDKShellApis.removeKeyIntercept({
					"keyCode": 173,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 174,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 175,
					"modifiers": [],
					"client": data.client
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
				RDKShellApis.removeKeyIntercept({
					"keyCode": 115,
					"modifiers": [],
					"client": data.callsign
				}).then(res => {
					this.WARN(JSON.stringify(res))
				})
			}
			if ((GLOBALS.topmostApp === data.client) &&
				(GLOBALS.selfClientName === "ResidentApp" || GLOBALS.selfClientName === "FireboltMainApp-refui") && GLOBALS.Miracastclientdevicedetails.state != "PLAYING") {
				appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
					AlexaApi.get().reportApplicationState("menu", true);
				});
			}
		});
		thunder.on('org.rdk.RDKShell', 'onBlur', data => {
			this.WARN("[RDKSHELLEVT] onBlur:" + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKShell', 'onFocus', data => {
			this.WARN("[RDKSHELLEVT] onFocus:" + JSON.stringify(data));
		});
	}
	_subscribeToControlNotifications() {
		thunder.on('org.rdk.tv.ControlSettings.1', 'videoFormatChanged', notification => {
			this.LOG("videoFormatChangedNotification: " + JSON.stringify(notification))
			if (Router.getActiveWidget() == this.widgets.videoinfochange) {
				this.widgets.videoinfochange.update(" New videoFormat :  " + notification.currentVideoFormat, true)
			} else {
				Router.focusWidget("VideoInfoChange")
				this.widgets.videoinfochange.update(" New videoFormat :  " + notification.currentVideoFormat)
			}
		})

		thunder.on('org.rdk.tv.ControlSettings.1', 'videoFrameRateChanged', notification => {
			this.LOG("videoFrameRateChangedNotification: " + JSON.stringify(notification))
			if (Router.getActiveWidget() == this.widgets.videoinfochange) {
				this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate, true)
			} else {
				Router.focusWidget("VideoInfoChange")
				this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate)
			}
		})

		thunder.on('org.rdk.tv.ControlSettings.1', 'videoResolutionChanged', notification => {
			this.LOG("videoResolutionChangedNotification: " + JSON.stringify(notification))
			if (Router.getActiveWidget() == this.widgets.videoinfochange) {
				this.widgets.videoinfochange.update(" New video resolution :  " + notification.currentVideoFormat, true)
			} else {
				Router.focusWidget("VideoInfoChange")
				this.widgets.videoinfochange.update(" New video resolution :  " + notification.currentVideoFormat)
			}
		})

		thunder.on('Controller', 'statechange', notification => {
			// get plugin status
			this.WARN("Controller statechange Notification : " + JSON.stringify(notification))
			if (notification && (notification.callsign.startsWith("YouTube") || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'HtmlApp' || notification.callsign === 'Netflix') && (notification.state == 'Deactivation' || notification.state == 'Deactivated')) {
				this.LOG(notification.callsign + " status = " + notification.state)
				this.LOG(">>notification.callsign: " + notification.callsign + " applicationType: " + GLOBALS.topmostApp);
				if (Router.getActiveHash().startsWith("tv-overlay") || Router.getActiveHash().startsWith("overlay") || Router.getActiveHash().startsWith("applauncher")) { //navigate to last visited route when exiting from any app
					this.LOG("navigating to lastVisitedRoute")
					Router.navigate((GLOBALS.LastvisitedRoute));
				}
				if (notification.callsign === GLOBALS.topmostApp) { //only launch residentApp iff notification is from currentApp
					this.LOG(notification.callsign + " is in: " + notification.state + " state, and application type in Storage is still: " + GLOBALS.topmostApp + " calling launchResidentApp")
					appApi.launchResidentApp(GLOBALS.selfClientName, GLOBALS.selfClientName).then(() => {
						AlexaApi.get().reportApplicationState("menu", true);
					});
				}
			}
			if (notification && (notification.callsign === 'org.rdk.HdmiCecSource' && notification.state === 'Activated')) {
				this.advanceScreen = Router.activePage()
				if (typeof this.advanceScreen.performOTPAction === 'function') {
					this.LOG('otp action')
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
						this.LOG("NETFLIX : notifyEventChange notification = " + JSON.stringify(notification));
						if (notification.EventName === "rendered") {
							Router.navigate('menu')
							if (Storage.get("NFRStatus")) {
								thunder.call("Netflix.1", "nfrstatus", {
									"params": "enable"
								}).then(nr => {
									this.LOG("Netflix : nfr enable results in " + JSON.stringify(nr))
								}).catch(nerr => {
									this.ERR("Netflix : error while updating nfrstatus " + JSON.stringify(nerr))
								})
							} else {
								thunder.call("Netflix.1", "nfrstatus", {
									"params": "disable"
								}).then(nr => {
									this.LOG("Netflix : nfr disable results in " + JSON.stringify(nr))
								}).catch(nerr => {
									this.ERR("Netflix : error while updating nfrstatus " + JSON.stringify(nerr))
								})
							}

							RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
						}
						if (notification.EventName === "requestsuspend") {
							this.deactivateChildApp('Netflix')
						}
						if (notification.EventName === "updated") {
							this.LOG("Netflix : xxxxxxxxxxxxxxxxxx Updated Event Trigger xxxxxxxxxxxxxxxxxxxx")
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
			GLOBALS.previousapp_onActiveSourceStatusUpdated = null
			this.LOG(new Date().toISOString() + " onDisplayConnectionChanged " + JSON.stringify(notification.HDCPStatus))
			let temp = notification.HDCPStatus
			if (!Storage.get("ResolutionChangeInProgress") && (temp.isConnected != Storage.get("UICacheonDisplayConnectionChanged"))) {
				if (temp.isConnected) {
					let currentApp = GLOBALS.topmostApp
					if (GLOBALS.previousapp_onDisplayConnectionChanged !== null) {
						currentApp = GLOBALS.previousapp_onDisplayConnectionChanged
					}
					if (currentApp === "ResidentApp" && GLOBALS.Setup) {
						Router.navigate(GLOBALS.LastvisitedRoute);
					}
					let launchLocation = Storage.get(currentApp + "LaunchLocation")
					this.LOG("App HdcpProfile onDisplayConnectionChanged current app is:" + JSON.stringify(currentApp))
					let params = {
						launchLocation: launchLocation,
						appIdentifier: self.appIdentifiers[currentApp]
					}
					if (currentApp.startsWith("YouTube") || currentApp.startsWith("Netflix")) {
						params["url"] = Storage.get(currentApp + "DefaultURL");
						appApi.getPluginStatus(currentApp).then(result => {
							const isAppSuspendedEnabled = Settings.get("platform", "enableAppSuspended");
							const expectedState = isAppSuspendedEnabled ? ["hibernated", "suspended"] : ["deactivated"];
							if (expectedState.includes(result[0].state)) {
								appApi.launchApp(currentApp, params)
									.then(() => GLOBALS.previousapp_onDisplayConnectionChanged = null)
									.catch(err => {
										Router.navigate(GLOBALS.LastvisitedRoute)
										this.ERR("Error in launching " + JSON.stringify(currentApp) + " : " + JSON.stringify(err))
									});
							} else {
								this.LOG("App HdcpProfile onDisplayConnectionChanged skipping; " + currentApp + " is already: " + JSON.stringify(result[0].state));
							}
						})
					}
				} else {
					let currentApp = GLOBALS.topmostApp
					if (currentApp.startsWith("YouTube") || currentApp.startsWith("Netflix")) {
						appApi.getPluginStatus(currentApp).then(result => {
							if (result[0].state !== (Settings.get("platform", "enableAppSuspended") ? "suspended" : "deactivated")) {
								appApi.exitApp(currentApp, true)
									.then(() => GLOBALS.previousapp_onDisplayConnectionChanged = currentApp)
									.catch(err => {
										Router.navigate(GLOBALS.LastvisitedRoute)
										this.ERR("Error in exit app " + JSON.stringify(currentApp) + " : " + JSON.stringify(err))
									});
							} else {
								this.LOG("App HdcpProfile onDsisplayConnectionChanged skipping; " + currentApp + " is already: " + JSON.stringify(result[0].state));
							}
						})
					}
					Storage.set("lastVisitedRoute", Router.getActiveHash())
					GLOBALS.LastvisitedRoute = Router.getActiveHash()
				}
				Storage.set("UICacheonDisplayConnectionChanged", temp.isConnected)
			} else {
				this.WARN("App HdcpProfile onDisplayConnectionChanged discarding.");
				this.LOG("App HdcpProfile ResolutionChangeInProgress: " + JSON.stringify(Storage.get("ResolutionChangeInProgress")) + " UICacheonDisplayConnectionChanged: " + JSON.stringify(Storage.get("UICacheonDisplayConnectionChanged")));
			}
		})
	}

	SubscribeToHdmiCecSourcevent(state, appIdentifiers) {
		switch (state) {
			case "activated":
				this.onApplicationStateChanged = thunder.on("org.rdk.HdmiCecSource", "onActiveSourceStatusUpdated", notification => {
					this.LOG(new Date().toISOString() + " onActiveSourceStatusUpdated " + JSON.stringify(notification))
					if (notification.status != Storage.get("UICacheCECActiveSourceStatus")) {
						if (notification.status) {
							let currentApp = GLOBALS.topmostApp
							if (GLOBALS.previousapp_onActiveSourceStatusUpdated !== null) {
								currentApp = GLOBALS.previousapp_onActiveSourceStatusUpdated
							}
							if (currentApp === "ResidentApp" && GLOBALS.Setup) {
								Router.navigate(GLOBALS.LastvisitedRoute);
							}
							let launchLocation = Storage.get(currentApp + "LaunchLocation")
							this.LOG("current app is " + JSON.stringify(currentApp))
							let params = {
								launchLocation: launchLocation,
								appIdentifier: appIdentifiers[currentApp]
							}
							if (currentApp.startsWith("YouTube") || currentApp.startsWith("Netflix")) {
								params["url"] = Storage.get(currentApp + "DefaultURL");
								appApi.getPluginStatus(currentApp).then(result => {
									const isAppSuspendedEnabled = Settings.get("platform", "enableAppSuspended");
									const expectedState = isAppSuspendedEnabled ? ["hibernated", "suspended"] : ["deactivated"];
									if (expectedState.includes(result[0].state)) {
										appApi.launchApp(currentApp, params)
											.then(() => GLOBALS.previousapp_onActiveSourceStatusUpdated = null)
											.catch(err => {
												Router.navigate(GLOBALS.LastvisitedRoute)
												this.ERR("Error in launching " + JSON.stringify(currentApp) + " : " + JSON.stringify(err))
											});
									} else {
										this.LOG("App HdmiCecSource onActiveSourceStatusUpdated skipping; " + currentApp + " is already:" + JSON.stringify(result[0].state));
									}
								})
							}
						} else {
							let currentApp = GLOBALS.topmostApp
							if (currentApp.startsWith("YouTube") || currentApp.startsWith("Netflix")) {
								appApi.getPluginStatus(currentApp).then(result => {
									if (result[0].state !== (Settings.get("platform", "enableAppSuspended") ? "suspended" : "deactivated")) {
										appApi.exitApp(currentApp, true)
											.then(() => GLOBALS.previousapp_onActiveSourceStatusUpdated = currentApp)
											.catch(err => {
												Router.navigate(GLOBALS.LastvisitedRoute)
												this.ERR("Error in launching " + JSON.stringify(currentApp) + " : " + JSON.stringify(err))
											});
									} else {
										this.LOG("App HdmiCecSource onActiveSourceStatusUpdated skipping; " + currentApp + " is already:" + JSON.stringify(result[0].state));
									}
								})
							}
							Storage.set("lastVisitedRoute", Router.getActiveHash())
							GLOBALS.LastvisitedRoute = Router.getActiveHash()
						}
						Storage.set("UICacheCECActiveSourceStatus", notification.status);
						this.LOG("App HdmiCecSource onActiveSourceStatusUpdated UICacheCECActiveSourceStatus:" + JSON.stringify(Storage.get("UICacheCECActiveSourceStatus")));
					} else {
						this.WARN("App HdmiCecSource onActiveSourceStatusUpdated discarding.");
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
			this.LOG("_getPowerStateWhileReboot: Current power state while reboot " + JSON.stringify(res));
			this._powerStateWhileReboot = res.currentState;
			this._PowerStateHandlingWhileReboot();
		}).catch(err => {
			this.LOG("_getPowerStateWhileReboot: Error in getting current power state while reboot " + JSON.stringify(err));
			this._powerStateWhileReboot = 'STANDBY';
			this._PowerStateHandlingWhileReboot();
		});
	}

	_PowerStateHandlingWhileReboot() {
		this.LOG("_PowerStateHandlingWhileReboot: this._oldPowerStateWhileReboot , " + JSON.stringify(this._oldPowerStateWhileReboot) + " this._powerStateWhileReboot, " + JSON.stringify(this._powerStateWhileReboot) + " ");
		if (this._oldPowerStateWhileReboot != this._powerStateWhileReboot) {
			this.LOG("_PowerStateHandlingWhileReboot: old power state is not equal to powerstate while reboot " + JSON.stringify(this._oldPowerStateWhileReboot) + " " + JSON.stringify(this._powerStateWhileReboot));
			appApi.setPowerState(this._oldPowerStateWhileReboot).then(res => {
				this.LOG("_PowerStateHandlingWhileReboot: successfully set powerstate to old powerstate " + JSON.stringify(this._oldPowerStateWhileReboot));
				if (res) {
					appApi.getPowerState().then(res => {
						GLOBALS.powerState = res.currentState;
					});
					this.LOG("_PowerStateHandlingWhileReboot: powerstate after setting to new powerstate " + JSON.stringify(GLOBALS.powerState) + " and ");
				}
			}).catch(err => {
				this.LOG("_PowerStateHandlingWhileReboot: Rebooting the device as set PowerState failed due to " + JSON.stringify(err));
				appApi.reboot("setPowerState Api Failure");
			});
		} else {
			this.LOG("_PowerStateHandlingWhileReboot: power state before reboot and curren tpowerstate is same " + JSON.stringify(this._oldPowerStateWhileReboot) + " " + JSON.stringify(this._powerStateWhileReboot));
			GLOBALS.powerState = this._powerStateWhileReboot;
		}
	}

	_getPowerStatebeforeReboot() {
		appApi.getPowerStateBeforeReboot().then(res => {
			this.LOG("_getPowerStatebeforeReboot: getpowerstate before reboot " + JSON.stringify(res));
			this._oldPowerStateWhileReboot = res;
			this._getPowerStateWhileReboot();
		}).catch(err => {
			this.LOG("_getPowerStatebeforeReboot: getPowerStateBeforeReboot error " + JSON.stringify(err) + " setting powerstate to ON");
			this._oldPowerStateWhileReboot = 'ON';
			this._getPowerStateWhileReboot();
		});
	}
	_registerFireboltListeners() {
		FireBoltApi.get().deviceinfo.gettype()
		FireBoltApi.get().lifecycle.ready()

		FireBoltApi.get().lifecycle.registerEvent('foreground', value => {
			this.LOG("FireBoltApi[foreground] value:" + JSON.stringify(value) + ", launchResidentApp with:" + JSON.stringify(GLOBALS.selfClientName));
			// Ripple launches refui with this rdkshell client name.
			GLOBALS.topmostApp = GLOBALS.selfClientName;
			FireBoltApi.get().discovery.launch("refui", {
				"action": "home",
				"context": {
					"source": "device"
				}
			}).then(() => {
				AlexaApi.get().reportApplicationState("menu", true);
			})
		})
		FireBoltApi.get().lifecycle.registerEvent('background', value => {
			// Ripple changed app states; it will be a 'FireboltApp'
			GLOBALS.topmostApp = "FireboltApp";
			this.LOG("FireBoltApi[foreground] value:" + JSON.stringify(value) + ", Updating top app as:" + JSON.stringify(GLOBALS.topmostApp));
		})
		FireBoltApi.get().lifecycle.state().then(res => {
			this.LOG("Lifecycle.state result:" + JSON.stringify(res))
		});
	}

	_firstEnable() {
		thunder.on("org.rdk.PowerManager", "onPowerModeChanged", notification => {
			this.LOG(new Date().toISOString() + " onPowerModeChanged Notification: " + JSON.stringify(notification));
			appApi.getPowerState().then(res => {
				GLOBALS.powerState = res ? res.currentState : notification.newState
			}).catch(e => GLOBALS.powerState = notification.newState)
			if (notification.newState !== "ON" && notification.currentState === "ON") {
				this.LOG("onPowerModeChanged Notification: power state was changed from ON to " + JSON.stringify(notification.newState))

				//TURNING OFF THE DEVICE
				Storage.set('SLEEPING', notification.newState)
				let currentApp = GLOBALS.topmostApp
				if (currentApp !== "") {
					appApi.exitApp(currentApp); //will suspend/destroy the app depending on the setting.
				}
				Router.navigate('menu');
			} else if (notification.newState === "ON" && notification.currentState !== "ON") {
				//TURNING ON THE DEVICE
				Storage.remove('SLEEPING')
			}
		})

		this.LOG("App Calling listenToVoiceControl method to activate VoiceControl Plugin")
		this.listenToVoiceControl();
		this._updateLanguageToDefault()
		/* Subscribe to Volume status events to report to Alexa. */
		this._subscribeToAlexaNotifications()
	}

	async listenToVoiceControl() {
		this.LOG("App listenToVoiceControl method got called, configuring VoiceControl Plugin")
		await voiceApi.activate().then(() => {
			voiceApi.voiceStatus().then(voiceStatusResp => {
				if (voiceStatusResp.success) {
					if (voiceStatusResp.urlPtt.includes("avs://")) {
						GLOBALS.AlexaAvsstatus(true)
					}
					if (voiceStatusResp.ptt.status != "ready" || !voiceStatusResp.urlPtt.includes("avs://")) {
						GLOBALS.AlexaAvsstatus(false)
						this.ERR("App voiceStatus says PTT/AVS not ready, enabling it.");
						// TODO: Future -> add option for user to select which Voice service provider.
						// Then configure VoiceControl plugin for that end point.
						// TODO: voiceApi.configureVoice()
						if (AlexaApi.get().checkAlexaAuthStatus() != "AlexaUserDenied") {
							AlexaApi.get().setAlexaAuthStatus("")
							voiceApi.configureVoice({
								"enable": true
							}).then(() => {
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
				this.LOG("App checkAlexaAuthStatus is AlexaHandleError; enableSmartScreen.");
				AlexaApi.get().enableSmartScreen();
				AlexaApi.get().getAlexaDeviceSettings();
				/* Alexa device volume state report. */
				appApi.getConnectedAudioPorts().then(audioport => {
					for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
						if (
							(GLOBALS.deviceType == "IpTv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) ||
							(GLOBALS.deviceType != "IpTv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))
						) {
							appApi.getMuted(audioport.connectedAudioPorts[i]).then(muteRes => {
								appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
									AlexaApi.get().reportVolumeState(
										(volres.success ? (Number.isInteger(volres.volumeLevel) ? volres.volumeLevel : parseInt(volres.volumeLevel)) : undefined),
										(muteRes.success ? muteRes.muted : undefined)
									)
								})
							})
						}
					}
				})
				// Report device language
				if (availableLanguageCodes[Language.get()].length) {
					AlexaApi.get().updateDeviceLanguageInAlexa(availableLanguageCodes[Language.get()]);
				}
				// Report device timeZone
				if ("ResidentApp" === GLOBALS.selfClientName) {
					appApi.getZone().then(timezone => {
						this.updateAlexaTimeZone(timezone)
					});
				} else {
					FireBoltApi.get().localization.getTimeZone().then(timezone => {
						this.updateAlexaTimeZone(timezone)
					})
				}
			}
			this.LOG("App VoiceControl check if user has denied ALEXA:" + JSON.stringify(AlexaApi.get().checkAlexaAuthStatus()))
			/* Handle VoiceControl Notifications */
			this._registerVoiceApiEvents()
		}).catch(err => {
			this.ERR("App VoiceControl Plugin activation error: " + JSON.stringify(err));
		})
	}

	updateAlexaTimeZone(updatedTimeZone) {
		if (updatedTimeZone.length) {
			this.LOG("App: updateDeviceTimeZoneInAlexa with zone:" + JSON.stringify(updatedTimeZone))
			AlexaApi.get().updateDeviceTimeZoneInAlexa(updatedTimeZone);
		} else {
			this.ERR("App getTimezoneDST returned: " + JSON.stringify(updatedTimeZone))
		}
	}

	deactivateChildApp(plugin) { //#needToBeRemoved
		switch (plugin) {
			case 'WebApp':
				appApi.deactivateWeb();
				break;
			case 'YouTube':
				appApi.suspendPremiumApp("YouTube").then(() => {
					this.LOG("YouTube : suspend YouTube request");
				}).catch((err) => {
					this.ERR(JSON.stringify(err));
				});
				break;
			case 'YouTubeTV':
				appApi.suspendPremiumApp("YouTubeTV").then(() => {
					this.LOG("YouTubeTV : suspend YouTubeTV request");
				}).catch((err) => {
					this.ERR(JSON.stringify(err));
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
						let params = {
							applicationName: "AmazonInstantVideo",
							state: 'suspended'
						};
						this.xcastApi.setApplicationState(params).then(status => {
							if (status == false) {
								this.ERR("App xcast setApplicationState failed, trying fallback. error: ");
								this.xcastApi.onApplicationStateChanged(params).catch(err => {
									this.ERR("App xcast onApplicationStateChanged failed: " + JSON.stringify(err));
								});
							}
						});
					}
				});
				break;
			case "Netflix":
				appApi.suspendPremiumApp("Netflix").then((res) => {
					Router.navigate(GLOBALS.LastvisitedRoute);
					this._moveApptoFront(GLOBALS.selfClientName, true)
					if (res) {
						let params = {
							applicationName: "Netflix",
							state: "suspended"
						};
						this.xcastApi.setApplicationState(params).then(status => {
							if (status == false) {
								this.ERR("App xcast setApplicationState failed, trying fallback. error: ");
								this.xcastApi.onApplicationStateChanged(params).catch(err => {
									this.ERR("App xcast onApplicationStateChanged failed: " + JSON.stringify(err));
								});
							}
						});
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
					this.LOG("netflix plugin status is : " + JSON.stringify(result));
					if (result[0].state === 'deactivated' || result[0].state === 'deactivation') {
						Router.navigate('image', {
							src: Utils.asset('images/apps/App_Netflix_Splash.png')
						})
						if (url) {
							appApi.configureApplication('Netflix', url).then(() => {
								appApi.launchPremiumApp("Netflix").then(() => {
									RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
									resolve(true)
								}).catch(() => {
									reject(false)
								}); // ie. org.rdk.RDKShell.launch
							}).catch(err => {
								this.ERR("Netflix : error while fetching configuration data : " + JSON.stringify(err));
								reject(err)
							}) // gets configuration object and sets configuration
						} else {
							appApi.launchPremiumApp("Netflix").then(() => {
								RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
								resolve(true)
							}).catch(() => {
								reject(false)
							}); // ie. org.rdk.RDKShell.launch
						}
					} else {
						/* Not in deactivated; could be suspended */
						if (url) {
							appApi.launchPremiumApp("Netflix").then(() => {
								thunder.call("Netflix", "systemcommand", {
										"command": url
									})
									.then(() => {})
									.catch(err => {
										this.ERR("Netflix : error while sending systemcommand : " + JSON.stringify(err))
										Metrics.error(Metrics.ErrorType.OTHER, 'AppError', "Netflix : error while sending systemcommand : " + JSON.stringify(err), false, null)
										reject(false);
									});
								RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
								resolve(true)
							}).catch(() => {
								reject(false)
							}); // ie. org.rdk.RDKShell.launch
						} else {
							appApi.launchPremiumApp("Netflix").then(res => {
								this.LOG("Netflix : launch premium app resulted in " + JSON.stringify(res));
								RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
								resolve(true)
							});
						}
					}
				})
				.catch(err => {
					this.ERR("Netflix plugin error: " + JSON.stringify(err));
					GLOBALS.topmostApp = GLOBALS.selfClientName;
					reject(false)
				})
		})
	}

	_powerKeyPressed() {
		appApi.getPowerState().then(res => {
			this.LOG("getPowerState: " + JSON.stringify(res));
			if (res.currentState === "ON") {
				this.LOG("current powerState is ON so setting power state to LIGHT_SLEEP/DEEP_SLEEP depending of preferred option");
				appApi.setPowerState(res.previousState).then(result => {
					if (result) {
						this.LOG("successfully set powerstate to: " + JSON.stringify(res.previousState))
						return result
					}
				})
			} else {
				this.LOG("current powerState is " + JSON.stringify(res.currentState) + " so setting power state to ON");
				appApi.setPowerState("ON").then(result => {
					if (result) {
						this.LOG("successfully set powerstate to: ON")
						return result
					}
				})
			}
		})
	}

	_updateLanguageToDefault() {
		if ("ResidentApp" === GLOBALS.selfClientName) {
			if (availableLanguageCodes[Language.get()].length) {
				appApi.setUILanguage(availableLanguageCodes[Language.get()])
				localStorage.setItem('Language', Language.get())
			}
		} else {
			FireBoltApi.get().localization.language().then(lang => {
				if (lang) {
					FireBoltApi.get().localization.language(lang).then(() => {
						this.LOG("language " + JSON.stringify(lang) + " set succesfully")
					})
					localStorage.setItem('Language', lang)
				}
			})
		}
	}

	_moveApptoFront(appName, visibility) {
		RDKShellApis.moveToFront(appName).then(() => {
			RDKShellApis.setVisibility(appName, visibility);
			RDKShellApis.setFocus(appName).then(() => {}).catch((err) => {
				this.ERR("Error : can't set focus to the " + JSON.stringify(appName) + " " + JSON.stringify(err));
				Metrics.error(Metrics.ErrorType.OTHER, 'APPError', "RDKShell setFocus error" + JSON.stringify(err), false, null)
			});
		});
	}

	launchFeaturedApp = (appName) => {
		let params = {
			launchLocation: "dedicatedButton",
			appIdentifier: this.appIdentifiers[appName]
		}
		appApi.launchApp(appName, params).catch(err => {
			this.ERR("Error in launching " + JSON.stringify(appName) + " via dedicated key: " + JSON.stringify(err))
		});
	}

	/**
	 * Function to register event listeners for Xcast plugin.
	 */
	registerXcastListeners() {
		console.warn("Registering Xcast Listeners");
		let self = this;
		this.xcastApi.registerEvent('onApplicationLaunchRequest', notification => {
			this.LOG('App onApplicationLaunchRequest: ' + JSON.stringify(notification));
			appApi.getPowerState().then(res => {
				if (res.currentState != 'ON') {
					appApi.setPowerState('ON')
				}
			})
			if (this.xcastApps(notification.applicationName)) {
				let applicationName = this.xcastApps(notification.applicationName);
				let baseUrl = Storage.get(notification.applicationName + "DefaultURL");
				let pairingCode = notification.strPayLoad;
				let additionalDataUrl = notification.strAddDataUrl;
				let url = `${baseUrl}${pairingCode}&additionalDataUrl=${additionalDataUrl}`;
				if (applicationName.startsWith("Netflix")) {
					url = `${baseUrl}&dial=${pairingCode}&additionalDataUrl=${additionalDataUrl}`
				}
				let params = {
					url: applicationName.startsWith("YouTube") || applicationName.startsWith("Netflix") ? url : notification.parameters.pluginUrl,
					launchLocation: "dial",
					appIdentifier: self.appIdentifiers[applicationName]
				}
				appApi.launchApp(applicationName, params).then(res => {
					this.LOG("App onApplicationLaunchRequest: launched " + JSON.stringify(applicationName) + " : " + JSON.stringify(res));
					GLOBALS.topmostApp = applicationName;
					// TODO: move to Controller.statuschange event
					let params = {
						applicationName: notification.applicationName,
						state: 'running'
					};
					this.xcastApi.setApplicationState(params).then(status => {
						if (status == false) {
							this.ERR("App xcast setApplicationState failed, trying fallback. error: ");
							this.xcastApi.onApplicationStateChanged(params).catch(err => {
								this.ERR("App xcast onApplicationStateChanged failed: " + JSON.stringify(err));
							});
						}
					});
				}).catch(err => {
					this.ERR("App onApplicationLaunchRequest: error " + JSON.stringify(err))
				})
			} else {
				this.LOG("App onApplicationLaunchRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationHideRequest', notification => {
			this.LOG('App onApplicationHideRequest: ' + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				let applicationName = this.xcastApps(notification.applicationName);
				this.LOG('App onApplicationHideRequest: ' + JSON.stringify(this.xcastApps(notification.applicationName)));
				//second argument true means resident app won't be launched the required app will be exited in the background.
				//only bring up the resident app when the notification is from the current app(ie app in focus)
				this.LOG("App onApplicationHideRequest: exitApp as " + JSON.stringify(applicationName) + "!==" + JSON.stringify(GLOBALS.topmostApp));
				appApi.exitApp(applicationName, applicationName !== GLOBALS.topmostApp);
			} else {
				this.LOG("App onApplicationHideRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationResumeRequest', notification => {
			this.LOG('App onApplicationResumeRequest: ' + JSON.stringify(notification));
			appApi.getPowerState().then(res => {
				if (res.currentState != 'ON') {
					appApi.setPowerState('ON')
				}
			})
			if (this.xcastApps(notification.applicationName)) {
				let applicationName = this.xcastApps(notification.applicationName);
				let params = {
					url: notification.parameters.url,
					launchLocation: "dial",
					appIdentifier: self.appIdentifiers[applicationName]
				}
				this.LOG('App onApplicationResumeRequest: launchApp ' + JSON.stringify(applicationName) + " with params: " + JSON.stringify(params));
				appApi.launchApp(applicationName, params).then(res => {
					GLOBALS.topmostApp = applicationName;
					this.LOG("App onApplicationResumeRequest: launched " + JSON.stringify(applicationName) + " result: " + JSON.stringify(res));
				}).catch(err => {
					this.ERR("Error in launching " + JSON.stringify(applicationName) + " on casting resume request: " + JSON.stringify(err));
				})
			} else {
				this.LOG("App onApplicationResumeRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
			this.LOG('App onApplicationStopRequest: ' + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				let applicationName = this.xcastApps(notification.applicationName);
				appApi.exitApp(applicationName, true, true);
			} else {
				this.LOG("App onApplicationStopRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationStateRequest', notification => {
			console.log("App onApplicationStateRequest: " + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				let applicationName = this.xcastApps(notification.applicationName);
				let appState = {
					"applicationName": notification.applicationName,
					"state": "stopped"
				};
				appApi.checkStatus(applicationName).then(result => {
					this.LOG("result of xcast app status" + JSON.stringify(result[0].state))
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
					this.xcastApi.setApplicationState(appState).then(status => {
						if (status == false) {
							this.ERR("App xcast setApplicationState failed, trying fallback. error: ");
							this.xcastApi.onApplicationStateChanged(appState).catch(err => {
								this.ERR("App xcast onApplicationStateChanged failed: " + JSON.stringify(err));
							});
						}
					});
				}).catch(error => {
					this.ERR("App onApplicationStateRequest: checkStatus error " + JSON.stringify(error));
				})
			} else {
				this.LOG("App onApplicationStateRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
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
		this.LOG("MountEventConstructor was initialized")
		// console.log(`listener constructor was set t0 = ${this.ListenerConstructor}`);
	}

	$registerUsbMount() {
		this.disposableListener = this.ListenerConstructor();
		this.LOG("Successfully registered the usb Mount")
	}

	$deRegisterUsbMount() {
		this.LOG("the current usbListener = " + JSON.stringify(this.disposableListener))
		this.disposableListener.dispose();
		this.LOG("successfully deregistered usb listener");
	}

	standby(value) {
		this.LOG("standby call");
		if (value == 'Back') {
			// TODO: Identify what to do here.
		} else {
			if (GLOBALS.powerState == 'ON') {
				this.LOG("Power state was on trying to set it to standby");
				appApi.setPowerState(value).then(res => {
					if (res) {
						this.LOG("successfully set to standby");
						GLOBALS.powerState = 'STANDBY'
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
			this.LOG("registered inactivity listener");
			appApi.setPowerState('ON').then(res => {
				if (res) {
					GLOBALS.powerState = 'ON'
				}
			})

			thunder.Controller.activate({
					callsign: 'org.rdk.RDKShell.1'
				})
				.then(res => {
					this.LOG("activated the rdk shell plugin trying to set the inactivity listener; res = " + JSON.stringify(res));
					thunder.on("org.rdk.RDKShell.1", "onUserInactivity", notification => {
						this.LOG('onUserInactivity: ' + JSON.stringify(notification));
						if (GLOBALS.powerState === "ON" && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
							this.standby("STANDBY");
						}
					}, err => {
						this.ERR("error while inactivity monitoring , " + JSON.stringify(err))
					})
					resolve(res)
				}).catch((err) => {
					Metrics.error(Metrics.ErrorType.OTHER, 'AppError', "Controller.activate error with " + JSON.stringify(err), false, null)
					reject(err)
					this.ERR("error while activating the displaysettings plugin; err = " + JSON.stringify(err))
				})
		})
	}

	$resetSleepTimer(t) {
		this.LOG("reset sleep timer call " + JSON.stringify(t));
		var arr = t.split(" ");

		const setTimer = () => {
			this.LOG('Timer ' + JSON.stringify(arr))
			var temp = arr[1].substring(0, 1);
			if (temp === 'H') {
				let temp1 = parseFloat(arr[0]) * 60;
				RDKShellApis.setInactivityInterval(temp1).then(() => {
					Storage.set('TimeoutInterval', t)
					this.LOG("successfully set the timer to " + JSON.stringify(t) + " hours")
				}).catch(err => {
					this.ERR("error while setting the timer " + JSON.stringify(err))
				});
			} else if (temp === 'M') {
				this.LOG("minutes");
				let temp1 = parseFloat(arr[0]);
				RDKShellApis.setInactivityInterval(temp1).then(() => {
					Storage.set('TimeoutInterval', t)
					this.LOG("successfully set the timer to " + JSON.stringify(t) + " minutes");
				}).catch(err => {
					this.ERR("error while setting the timer " + JSON.stringify(err))
				});
			}
		}

		if (arr.length < 2) {
			RDKShellApis.enableInactivityReporting(false).then((res) => {
				if (res === true) {
					Storage.set('TimeoutInterval', false)
					this.LOG("Disabled inactivity reporting");
					// this.timerIsOff = true;
				}
			}).catch(err => {
				this.ERR("error : unable to set the reset; error = " + JSON.stringify(err))
			});
		} else {
			RDKShellApis.enableInactivityReporting(true).then(res => {
				if (res === true) {
					this.LOG("Enabled inactivity reporting; trying to set the timer to " + JSON.stringify(t));
					// this.timerIsOff = false;
					setTimer();
				}
			}).catch(err => {
				this.ERR("error while enabling inactivity reporting " + JSON.stringify(err))
			});
		}
	}

	_subscribeToAlexaNotifications() {
		thunder.on('org.rdk.DisplaySettings', 'connectedAudioPortUpdated', notification => {
			this.LOG("App got connectedAudioPortUpdated: " + JSON.stringify(notification))
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
			this.LOG('App onServerMessage: ' + JSON.stringify(notification));
			if (Storage.get("appSwitchingInProgress")) {
				this.WARN("App is appSwitchingInProgress? " + JSON.stringify(Storage.get("appSwitchingInProgress")) + ", dropping processing the server notification.");
				return;
			}
			if (AlexaApi.get().checkAlexaAuthStatus() !== "AlexaUserDenied") {
				if (notification.xr_speech_avs.state_reporter === "authorization_req" || notification.xr_speech_avs.code) {
					this.LOG("Alexa Auth URL is " + JSON.stringify(notification.xr_speech_avs.url))
					if (!Router.isNavigating() && !AlexaApi.get().isSmartScreenActiavated() && Router.getActiveHash() === "menu") {
						this.LOG("App enableSmartScreen");
						AlexaApi.get().enableSmartScreen();
					}
					if ((Router.getActiveHash() === "menu") && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
						if (Router.getActiveHash() != "AlexaLoginScreen" && Router.getActiveHash() != "CodeScreen" && !Router.isNavigating()) {
							this.LOG("Routing to Alexa login page")
							Router.navigate("AlexaLoginScreen")
						}
					}
					this.LOG("Alexa Auth OTP is " + JSON.stringify(notification.xr_speech_avs.code))
				} else if (notification.xr_speech_avs.state_reporter === "authendication") {
					this.LOG("Alexa Auth State is now at " + JSON.stringify(notification.xr_speech_avs.state))
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
					notification.xr_speech_avs.state === "DISCONNECTED")) { // || notification.xr_speech_avs.state === "CONNECTED"
				this._handleAlexaError(1)
				this.tag("Failscreen1").notify({
					title: 'Alexa State',
					msg: notification.xr_speech_avs.state
				})
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
					this.LOG("App current AlexaAudioplayerActive state:" + JSON.stringify(AlexaAudioplayerActive));
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
								this.LOG("Sending playbackstatereport to Pause: " + JSON.stringify(PlaybackStateReport))
								AlexaApi.get().reportPlaybackState("PAUSED");
							}
							this.LOG("Alexa is trying to launch " + JSON.stringify(appCallsign) + " using params: " + JSON.stringify(params))
							if (appCallsign) { //appCallsign is valid means target is an app and it needs to be launched
								appApi.launchApp(appCallsign, params).catch(err => {
									this.ERR("Alexa.Launcher LaunchTarget Error in launching " + JSON.stringify(appCallsign) + " via Alexa: " + JSON.stringify(err))
									if (err.includes("Netflix")) {
										AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive, "INVALID_VALUE", "Unsupported AppID")
									} else {
										AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive)
									}
								});
							} else if (targetRoute) {
								this.LOG("Alexa.Launcher is trying to route to " + JSON.stringify(targetRoute))
								// exits the app if any and navigates to the specific route.
								Storage.set("appSwitchingInProgress", true);
								this.jumpToRoute(targetRoute);
								GLOBALS.topmostApp = GLOBALS.selfClientName;
								Storage.set("appSwitchingInProgress", false);
							}
						} else {
							this.LOG("Alexa.Launcher is trying to launch an unsupported app : " + JSON.stringify(payload))
							AlexaApi.get().reportErrorState(notification.xr_speech_avs.directive)
						}
					}
				} /////////Alexa.Launcher END
				else if (header.namespace === "Alexa.RemoteVideoPlayer") { //alexa remote video player will search on youtube for now
					this.LOG("Alexa.RemoteVideoPlayer: " + JSON.stringify(header))
					if (header.name === "SearchAndDisplayResults" || header.name === "SearchAndPlay") {
						this.LOG("Alexa.RemoteVideoPlayer: SearchAndDisplayResults || SearchAndPlay: " + JSON.stringify(header))
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
								this.LOG("Alexa.RemoteVideoPlayer: launchApp " + JSON.stringify(appCallsign) + " with params " + JSON.stringify(launchParams))
								appApi.launchApp(appCallsign, launchParams).then(res => {
									this.LOG("Alexa.RemoteVideoPlayer:" + JSON.stringify(appCallsign) + " launched successfully using alexa search: " + JSON.stringify(res))
								}).catch(err => {
									this.ERR("Alexa.RemoteVideoPlayer:" + JSON.stringify(appCallsign) + " launch FAILED using alexa search: " + JSON.stringify(err))
								})
								replacedText = null;
								appCallsign = null;
								launchParams = null;
							} else if (!entityId.length && (GLOBALS.topmostApp != GLOBALS.selfClientName)) {
								/* give it to current focused app */
								this.WARN("Alexa.RemoteVideoPlayer: " + JSON.stringify(GLOBALS.topmostApp) + " is the focued app; need Voice search integration support to it.");
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
								this.LOG("Alexa.RemoteVideoPlayer: global search launchApp " + JSON.stringify(appCallsign) + " with params " + JSON.stringify(launchParams))
								appApi.launchApp(appCallsign, launchParams).then(res => {
									this.LOG("Alexa.RemoteVideoPlayer:" + JSON.stringify(appCallsign) + " launched successfully using alexa search: " + JSON.stringify(res))
								}).catch(err => {
									this.ERR("Alexa.RemoteVideoPlayer:" + JSON.stringify(appCallsign) + " launch FAILED using alexa search: " + JSON.stringify(err))
								})
								replacedText = null;
								appCallsign = null;
								launchParams = null;
							} else {
								/* Possibly an unsupported App. */
								this.WARN("Alexa.RemoteVideoPlayer: got ENTITY_ID " + JSON.stringify(entityId[0]?.externalIds?.ENTITY_ID) + " but no match in AlexaLauncherKeyMap.");
							}
						} else {
							this.WARN("Alexa.RemoteVideoPlayer: payload does not have entities; may not work.");
						}
					}
				} else if (header.namespace === "Alexa.PlaybackController") {
					appApi.deeplinkToApp(GLOBALS.topmostApp, header.name, "alexa", header.namespace);
					AlexaApi.get().reportPlaybackState(header.name);
				} else if (header.namespace === "Alexa.SeekController") {
					if (Router.getActiveHash() === "player" || Router.getActiveHash() === "usb/player") {
						let time = notification.xr_speech_avs.directive.payload.deltaPositionMilliseconds / 1000
						this.tag("AAMPVideoPlayer").voiceSeek(time)
					} else {
						appApi.deeplinkToApp(GLOBALS.topmostApp, payload, "alexa", header.namespace);
					}
				} else if (header.namespace === "AudioPlayer") {
					if (header.name === "Play") {
						AlexaApi.get().displaySmartScreenOverlay(true)
						AlexaAudioplayerActive = true;
						this.LOG("App AudioPlayer: Suspending the current app:'" + JSON.stringify(GLOBALS.topmostApp) + "'");
						if (GLOBALS.topmostApp != GLOBALS.selfClientName) {
							appApi.exitApp(GLOBALS.topmostApp);
						}
					}
				} else if (header.namespace === "TemplateRuntime") {
					if (header.name === "RenderPlayerInfo") {
						AlexaApi.get().displaySmartScreenOverlay(true)
						AlexaAudioplayerActive = true;
					}
				} else if (header.namespace === "Speaker") {
					this.LOG("Speaker")
					if (header.name === "AdjustVolume") {
						VolumePayload.msgPayload.event.header.messageId = header.messageId
						appApi.getConnectedAudioPorts().then(audioport => {
							for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
								if ((GLOBALS.deviceType == "IpTv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) || (GLOBALS.deviceType != "IpTv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))) {
									appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
										this.LOG("getVolumeLevel[" + JSON.stringify(audioport.connectedAudioPorts[i]) + "] is:" + JSON.stringify(parseInt(volres.volumeLevel)))
										if ((parseInt(volres.volumeLevel) >= 0) || (parseInt(volres.volumeLevel) <= 100)) {
											VolumePayload.msgPayload.event.payload.volume = parseInt(volres.volumeLevel) + payload.volume
											this.LOG("volumepayload" + JSON.stringify(VolumePayload.msgPayload.event.payload.volume))
											if (VolumePayload.msgPayload.event.payload.volume < 0) {
												VolumePayload.msgPayload.event.payload.volume = 0
											} else if (VolumePayload.msgPayload.event.payload.volume > 100) {
												VolumePayload.msgPayload.event.payload.volume = 100
											}
										}
										appApi.setVolumeLevel(audioport.connectedAudioPorts[i], VolumePayload.msgPayload.event.payload.volume).then(() => {
											let volumeIncremented = parseInt(volres.volumeLevel) < VolumePayload.msgPayload.event.payload.volume ? true : false
											if (volumeIncremented && VolumePayload.msgPayload.event.payload.muted) {
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
						this.LOG("adjust volume" + JSON.stringify(VolumePayload))
						this.LOG("checkvolume" + JSON.stringify(VolumePayload.msgPayload.event.payload.volume))
						if (VolumePayload.msgPayload.event.payload.volume > 100) {
							VolumePayload.msgPayload.event.payload.volume = 100
						} else if (VolumePayload.msgPayload.event.payload.volume < 0) {
							VolumePayload.msgPayload.event.payload.volume = 0
						}
						appApi.getConnectedAudioPorts().then(audioport => {
							for (let i = 0; i < audioport.connectedAudioPorts.length && !audioport.connectedAudioPorts[i].startsWith("SPDIF"); i++) {
								if ((GLOBALS.deviceType == "IpTv" && audioport.connectedAudioPorts[i].startsWith("SPEAKER")) ||
									(GLOBALS.deviceType != "IpTv" && audioport.connectedAudioPorts[i].startsWith("HDMI"))) {
									let volumeIncremented
									appApi.getVolumeLevel(audioport.connectedAudioPorts[i]).then(volres => {
										volumeIncremented = parseInt(volres.volumeLevel) < VolumePayload.msgPayload.event.payload.volume ? true : false
										if (volumeIncremented && VolumePayload.msgPayload.event.payload.muted) {
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
				} else if (header.namespace === "ExternalMediaPlayer") {
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
				this.WARN("App VoiceControl.onSessionEnd got disable Alexa.")
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
				this.ERR("jumpToRoute err: " + JSON.stringify(err))
			});
			Storage.set("lastVisitedRoute", route); // incase any state change event tries to navigate, it need to be navigated to alexa requested route
			GLOBALS.LastvisitedRoute = route
			Router.navigate(route);
		} else {
			if (!Router.isNavigating()) {
				if (Router.getActiveHash() === "dtvplayer") { //exit scenario for dtv player
					dtvApi
						.exitChannel()
						.then((res) => {
							this.LOG("exit channel: " + JSON.stringify(res));
						})
						.catch((err) => {
							this.ERR("failed to exit channel: " + JSON.stringify(err));
						});
					if (Router.getActiveWidget()) {
						Router.getActiveWidget()._setState("IdleState");
					}
				}
				Storage.set("lastVisitedRoute", route);
				Router.navigate(route);
				GLOBALS.LastvisitedRoute = route
			}
		}
	}
}