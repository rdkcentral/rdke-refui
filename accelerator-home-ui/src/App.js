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
import FailAndOkScreen from './screens/FailAndOkScreen';
import HDMIApi from './api/HDMIApi';
import Volume from './tvOverlay/components/Volume';
import DTVApi from './api/DTVApi';
import TvOverlayScreen from './tvOverlay/TvOverlayScreen';
import ChannelOverlay from './MediaPlayer/ChannelOverlay';
import SettingsOverlay from './overlays/SettingsOverlay';
import AppCarousel from './overlays/AppCarousel';
import VideoScreen from './screens/Video';
import VideoInfoChange from './overlays/VideoInfoChange/VideoInfoChange.js';
import Failscreen1 from './screens/FailScreen';
import CECApi from './api/CECApi';
import {
	appListInfo
} from "./../static/data/AppListInfo.js";
import VoiceApi from './api/VoiceApi.js';
import AAMPVideoPlayer from './MediaPlayer/AAMPVideoPlayer';
import Miracast from './api/Miracast.js';
import MiracastNotification from './screens/MiracastNotification.js';
import NetworkManager from './api/NetworkManagerAPI.js';
import PowerManagerApi, {PowerState} from './api/PowerManagerApi.js';
import InactivityHelper from './helpers/InactivityHelper.js';
import AppManager from './api/AppManagerApi.js';
import PackageManager from './api/PackageManagerApi.js';
import RDKWindowManager from './api/RDKWindowManagerApi.js';
import RuntimeManager from './api/RuntimeManagerApi.js';
import AppController from './AppController.js';
import userSettingsApi from './api/UserSettingsApi.js';

var thunder = ThunderJS(CONFIG.thunderConfig);
var appApi = new AppApi();
var dtvApi = new DTVApi();
var cecApi = new CECApi();
var voiceApi = new VoiceApi();
var miracast = new Miracast();
var inactivityHelper = new InactivityHelper();
const SLEEP_STATE = 'SLEEPING';
var packageManager = new PackageManager();

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

	/**
	 * Abstraction for individual plugin activation with consistent logging and error handling
	 * @param {string} pluginName - Plugin callsign name
	 * @param {string} displayName - Human readable name for logging
	 * @param {Function} activator - Function that returns promise to activate the plugin
	 * @param {Function} [onActivated] - Optional callback to run after successful activation
	 */
	_activatePlugin(pluginName, displayName, activator, onActivated) {
		appApi.getPluginStatus(pluginName).then(result => {
			if (result[0].state === "activated") {
				this.LOG(`${displayName} plugin is already activated`);
				if (onActivated) {
					onActivated();
				}
			} else {
				this.LOG(`Activating ${displayName} plugin...`);
				activator().then(() => {
					this.LOG(`${displayName} plugin activated successfully`);
					if (onActivated) {
						onActivated();
					}
				}).catch(err => {
					this.ERR(`Error activating ${displayName} plugin: ${JSON.stringify(err)}`);
				});
			}
		}).catch(err => {
			this.ERR(`Error checking ${displayName} plugin status: ${JSON.stringify(err)}`);
		});
	}

	static getFonts() {
		return [{
			family: 'Play',
			url: Utils.asset('fonts/Play/Play-Regular.ttf')
		}];
	}

	async _setup() {
		this.LOG("accelerator-home-ui version: " + JSON.stringify(Settings.get("platform", "version")));
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

		try {
			await AppController.get().init();
		} catch (err) {
			this.ERR(`AppController.init(): ${err}`);
		}
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
				FailOk: {
					type: FailAndOkScreen,
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
			language: ("com.rdkcentral.refui" === GLOBALS.selfclientAppName) ? CONFIG.language : 'en'
		}
	}

	$updateTimeZone(timezone) {
		this.tag('Menu').updateTimeZone(timezone)
	}

	_captureKey(key) {
		this.LOG("PowerState: " + JSON.stringify(GLOBALS.powerState) + " and got keycode: " + JSON.stringify(key.keyCode))
		if (GLOBALS.powerState === PowerState.POWER_STATE_DEEP_SLEEP || GLOBALS.powerState === PowerState.POWER_STATE_LIGHT_SLEEP) {
			if (key.keyCode !== Keymap.Power) {
				this.LOG("Ignoring non-power key press while device is in sleep state")
				return true
			}
			this.initializeInactivityEngine();
			return this._performKeyPressOPerations(key)
		} else if (GLOBALS.powerState !== PowerState.POWER_STATE_ON) {
			appApi.setPowerState(PowerState.POWER_STATE_ON).then(res => {
				res ? this.LOG("successfully set the power state to ON from " + JSON.stringify(GLOBALS.powerState)) : this.LOG("Failure while turning ON the device")
				GLOBALS.powerState = PowerState.POWER_STATE_ON;
				this.LOG("powerState after ===>" + JSON.stringify(GLOBALS.powerState))
				this.initializeInactivityEngine();
			})
			.catch(err => {
				this.ERR("Error waking device: " + JSON.stringify(err));
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
				if (Router.getActiveHash().startsWith("splash")) {
					if (Router.getActiveHash() !== "splash/language") {
						Router.navigate("splash/language");
					}
					return true;
				}
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
					} else { //launch the settings overlay
						Router.focusWidget('SettingsOverlay');
					}
				} else { //if on some other route while on an application, route to applauncher before launching the settings overlay
					Router.navigate("applauncher");
					Router.focusWidget('SettingsOverlay');
				}
			}
			return true;
		} else if (key.keyCode == Keymap.Guide_Shortcut && !Router.isNavigating()) {
			this.jumpToRoute("epg"); //method to exit the current app(if any) and route to home screen
			return true
		} else if (key.keyCode == Keymap.Amazon && !Router.isNavigating()) {
			this.launchFeaturedApp("Amazon")
			return true
		} else if (key.keyCode == Keymap.Youtube && !Router.isNavigating()) {
			console.log("YouTube key pressed, calling launchFeaturedApp");
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
					} else { //launch the settings overlay
						Router.focusWidget('AppCarousel');
					}
				} else { //if on some other route while on an application, route to applauncher before launching the settings overlay
					Router.navigate("applauncher");
					Router.focusWidget('AppCarousel');
				}
			}
			return true
		} else if (key.keyCode == Keymap.Power) {
			// Remote power key and keyboard F1 key used for STANDBY and POWER_ON
			return this._powerKeyPressed()
		} else if (key.keyCode === Keymap.AudioVolumeMute && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
				this.tag("Volume").onVolumeMute();
			} else {
				this.LOG("muting on some app")
				this.tag("Volume").onVolumeMute();
			}
			return true
		} else if (key.keyCode == Keymap.AudioVolumeUp && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
				this.tag("Volume").onVolumeKeyUp();
			} else {
				this.LOG("increasing volume on some app")
				this.tag("Volume").onVolumeKeyUp();
			}
			return true
		} else if (key.keyCode == Keymap.AudioVolumeDown && !Router.isNavigating()) {
			if (GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
				this.tag("Volume").onVolumeKeyDown();
			} else {
				this.LOG("decreasing volume on some app")
				this.tag("Volume").onVolumeKeyDown();
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
		PersistentStoreApi.get().getValue('ScreenSaverTime', 'timerValue').then(result => {
			// check if result has value property and if it is not undefined^M
			if (result && result.value && result.value !== undefined && result.value !== "Off") {
				this.LOG("App PersistentStoreApi screensaver timer value is: " + JSON.stringify(result.value));
				appApi.enableInactivityReporting(true).then(() => {
					appApi.setInactivityInterval(result.value).then(() => {
						this.userInactivity = thunder.on('org.rdk.RDKWindowManager', 'onUserInactivity', notification => {
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
				appApi.enableInactivityReporting(false).then(() => {
					this.userInactivity.dispose();
				})
			}
		}).catch(err => {
			this.ERR("App PersistentStoreApi getValue error: " + JSON.stringify(err));
			appApi.enableInactivityReporting(false).then(() => {
				this.userInactivity.dispose();
			})
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
		this.inactivityEngineInitialized = false;
		this.thunderListenerRegistered = false;
		this.currentStage = null;
		this.currentInterval = null;
		self.appIdentifiers = {
			"YouTubeTV": "n:4",
			"YouTube": "n:3",
			"Netflix": "n:1",
			"Amazon Prime": "n:2",
			"Amazon": "n:2",
			"Prime": "n:2"
		}

		appApi.deviceType().then(result => {
			this.LOG("App detected deviceType as:" + JSON.stringify(((result.devicetype != null) ? result.devicetype : "IpTv")));
			GLOBALS.deviceType = ((result.devicetype != null) ? result.devicetype : "IpTv");
			Storage.set("deviceType", ((result.devicetype != null) ? result.devicetype : "IpTv"));
		});
		appApi.getPluginStatus("org.rdk.DeviceDiagnostics").then(res => {
			this.LOG("App DeviceDiagnostics state:" + JSON.stringify(res[0].state))
			if (res[0].state === "activated") {
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
		NetworkManager.IsConnectedToInternet().then(result => {
		if (result.connected)
			GLOBALS.IsConnectedToInternet = true;
		else
			GLOBALS.IsConnectedToInternet = false;
		});
		appApi.enableDisplaySettings().then(res => {
			this.LOG("results : " + JSON.stringify(res))
		}).catch(err => {
			this.ERR("error while enabling displaysettings:" + JSON.stringify(err));
		})

		thunder.on('Controller.1', 'all', noti => {
			this.LOG("App controller notification:" + JSON.stringify(noti))
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
			if (noti.callsign === "org.rdk.PowerManager") {
				if (noti.data.state === "activated") {
					this.subscribeToPowerChangeNotifications()
				}
			}
			if( noti.callsign === "org.rdk.AppManager")	{
				if(noti.data.state === "activated")	{
					this._SubscribeToAppManagerNotifications();
				}
			}
		})

		//video info change events begin here---------------------
		/********************   RDKUI-341 CHANGES - DEEP SLEEP/LIGHT SLEEP **************************/
		this._subscribeToControlNotifications()
		let cachedPowerState = Storage.get(SLEEP_STATE);
		this.LOG("cached power state" + JSON.stringify(cachedPowerState))
		this.LOG(typeof cachedPowerState)
		if (cachedPowerState) {
			appApi.getWakeupReason().then(result => {
				if (result.wakeupReason !== 'WAKEUP_REASON_UNKNOWN') {
					cachedPowerState = PowerState.POWER_STATE_ON;
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
				this.subscribeToPowerChangeNotifications()
				this._getPowerStatebeforeReboot();
				this._setWakeupSourceConfig();
			}
		})
		appApi.getPluginStatus('org.rdk.NetworkManager').then(result => {
			if (result[0].state === "activated") {
				this.SubscribeToNetworkManager()
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
					appApi.getFriendlyName().then(res => {
						getfriendlyname = res.friendlyName;
						this.LOG("AppApi getFriendlyName :" + JSON.stringify(getfriendlyname));
					}).catch(err => {
						this.ERR("AppApi getFriendlyName Error: " + JSON.stringify(err));
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
						appApi.getFriendlyName().then(res => {
							getfriendlyname = res.friendlyName;
							this.LOG("AppApi getFriendlyName :" + JSON.stringify(getfriendlyname));
						}).catch(err => {
							this.ERR("AppApi getFriendlyName Error: " + JSON.stringify(err));
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
		this._subscribeToIOPortNotifications();
		this._updateLanguageToDefault();
		this._SubscribeToAppManagerNotifications();
		this._SubscribeToRDKWindowManagerNotifications();
		this._SubscribeToRuntimeManagerNotifications();

		this.xcastApi = new XcastApi()
		this.xcastApi.activate().then(async result => {
			console.warn("Xcast plugin activate");
			if (result) {
				this.registerXcastListeners();
				let serialnumber = "DefaultSLNO";
				let modelName = "RDK" + GLOBALS.deviceType;
				const serialRes = await appApi.getSerialNumber();
				serialnumber = (serialRes.length < 6) ? serialRes : serialRes.slice(-6);
				const model = await this.xcastApi.getModelName();
				modelName = (model || modelName) + serialnumber;
				this.LOG("Xcast friendly name to be set: " + JSON.stringify(modelName));
				try {
					await appApi.setFriendlyName(modelName);
				} catch (err) {
					this.ERR("AppApi setFriendlyName error: " + JSON.stringify(err) + " - continuing Xcast activation");
				}
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
		thunder.on('org.rdk.NetworkManager', 'onInternetStatusChange', data => {
			if (data.status === "FULLY_CONNECTED") {
				GLOBALS.IsConnectedToInternet = true
			}
			else {
				GLOBALS.IsConnectedToInternet = false
			}
			console.warn("onInternetStatusChange:", data);
		});
	}
	SubscribeToMiracastService() {
		thunder.on('org.rdk.MiracastService.1', 'onClientConnectionRequest', data => {
			this.LOG('onClientConnectionRequest ' + JSON.stringify(data));
			this.tag("MiracastNotification").notify(data)
			if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
				Router.focusWidget("MiracastNotification")
			} else {
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
						miracast.updatePlayerState(data.mac, data.state, data.reason_code, data.reason)
						GLOBALS.topmostApp = "MiracastPlayer"
					}).catch(err => {
						this.ERR("exitapp err: " + JSON.stringify(err))
					});
				} else {
					miracast.updatePlayerState(data.mac, data.state, data.reason_code, data.reason)
					GLOBALS.topmostApp = "MiracastPlayer"
				}

			}
			if (data.state === "STOPPED") {
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
	_SubscribeToRDKWindowManagerNotifications() {
		thunder.on('org.rdk.RDKWindowManager', 'onConnected', data => {
			this.LOG('RDKWindowManager onConnected	 ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onDisconnected', async data => {
			this.LOG('RDKWindowManager onDisconnected ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onReady', data => {
			this.LOG('RDKWindowManager onReady ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onUserInactivity', data => {
			this.LOG('RDKWindowManager onUserInactivity ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onBlur', data => {
			this.LOG('RDKWindowManager onBlur ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onVisible', data => {
			this.LOG('RDKWindowManager onVisible ' + JSON.stringify(data));
		});
		thunder.on('org.rdk.RDKWindowManager', 'onHidden', data => {
			this.LOG('RDKWindowManager onHidden ' + JSON.stringify(data));
		});
	}
	_SubscribeToRuntimeManagerNotifications() {
		thunder.on(RuntimeManager.callsign, 'onStarted', data => {
			this.LOG('onStarted ' + JSON.stringify(data));
		});
		thunder.on(RuntimeManager.callsign, 'onTerminated', data => {
			this.LOG('onTerminated ' + JSON.stringify(data));
		});
		thunder.on(RuntimeManager.callsign, 'onFailure', data => {
			this.LOG('onFailure ' + JSON.stringify(data));
		});
		thunder.on(RuntimeManager.callsign, 'onStateChanged', data => {
			this.LOG('onStateChanged ' + JSON.stringify(data));
		});
	}
	_SubscribeToAppManagerNotifications() {
		AppController.get().subscribe(thunder);
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
			if (notification && (notification.callsign === 'org.rdk.HdmiCecSource' && notification.state === 'Activated')) {
				this.advanceScreen = Router.activePage()
				if (typeof this.advanceScreen.performOTPAction === 'function') {
					this.LOG('otp action')
					this.advanceScreen.performOTPAction()
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
					if (currentApp === GLOBALS._selfclientAppName && GLOBALS.Setup) {
						Router.navigate(GLOBALS.LastvisitedRoute);
					}
				} else {
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
							if (currentApp === GLOBALS._selfclientAppName && GLOBALS.Setup) {
								Router.navigate(GLOBALS.LastvisitedRoute);
							}
							this.LOG("current app is " + JSON.stringify(currentApp))
						} else {
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
			this._powerStateWhileReboot = PowerState.POWER_STATE_STANDBY;
			this._PowerStateHandlingWhileReboot();
		});
	}

	_PowerStateHandlingWhileReboot() {
		this.LOG("_PowerStateHandlingWhileReboot: this._oldPowerStateWhileReboot , " + JSON.stringify(this._oldPowerStateWhileReboot) + " this._powerStateWhileReboot, " + JSON.stringify(this._powerStateWhileReboot) + " ");
		if (this._oldPowerStateWhileReboot != this._powerStateWhileReboot) {
			this.LOG("_PowerStateHandlingWhileReboot: old power state is not equal to powerstate while reboot " + JSON.stringify(this._oldPowerStateWhileReboot) + " " + JSON.stringify(this._powerStateWhileReboot));
			appApi.setPowerState(this._oldPowerStateWhileReboot).then(res => {
				// setPowerState resolves false when the call did not succeed, so only
				// mark the state as restored after a confirmed successful restore.
				if (res) {
					this.LOG("_PowerStateHandlingWhileReboot: successfully set powerstate to old powerstate " + JSON.stringify(this._oldPowerStateWhileReboot));
					appApi.getPowerState().then(res => {
						GLOBALS.powerState = res.currentState;
					});
					this.LOG("_PowerStateHandlingWhileReboot: powerstate after setting to new powerstate " + JSON.stringify(GLOBALS.powerState) + " and ");
					sessionStorage.setItem('powerStateRestored', 'true');
				} else {
					// setPowerState resolved false (call did not succeed). Avoid an automatic
					// reboot here to prevent a reboot loop if PowerManager keeps returning a
					// non-null result. Keep the current power state and leave powerStateRestored
					// unset so restoration can be retried later.
					this.LOG("_PowerStateHandlingWhileReboot: setPowerState did not succeed (resolved false) for " + JSON.stringify(this._oldPowerStateWhileReboot) + ". Keeping current power state; leaving powerStateRestored unset for a later retry.");
					appApi.getPowerState().then(res => {
						GLOBALS.powerState = res.currentState;
						this.LOG("_PowerStateHandlingWhileReboot: current power state after failed restore " + JSON.stringify(GLOBALS.powerState));
					}).catch(err => {
						this.LOG("_PowerStateHandlingWhileReboot: Error getting current power state after failed restore " + JSON.stringify(err));
					});
				}
			}).catch(err => {
				this.LOG("_PowerStateHandlingWhileReboot: Rebooting the device as set PowerState failed due to " + JSON.stringify(err));
				appApi.reboot("setPowerState Api Failure");
			});
		} else {
			this.LOG("_PowerStateHandlingWhileReboot: power state before reboot and curren tpowerstate is same " + JSON.stringify(this._oldPowerStateWhileReboot) + " " + JSON.stringify(this._powerStateWhileReboot));
			GLOBALS.powerState = this._powerStateWhileReboot;
			sessionStorage.setItem('powerStateRestored', 'true');
		}
	}

	_setWakeupSourceConfig() {
		//https://jira.rdkcentral.com/jira/browse/RDKEAPPRT-693
		//by the above jira, we need to enable all wakeup sources in order to wake up the device from standby using any source. So enabling all the wakeup sources here.
		let param = {
			"wakeupSources": [
				{"wakeupSource": "VOICE", "enabled": true},
				{"wakeupSource": "IR", "enabled": true},
				{"wakeupSource": "CEC", "enabled": true},
				{"wakeupSource": "BLUETOOTH", "enabled": true},
				{"wakeupSource": "WIFI", "enabled": true},
				{"wakeupSource": "LAN", "enabled": true},
				{"wakeupSource": "POWERKEY", "enabled": true},
			]
		}
		this.LOG("_setWakeupSourceConfig: Calling with param: " + JSON.stringify(param))
		appApi.setWakeupSourceConfig(param).then(res => {
			this.LOG("_setWakeupSourceConfig: Successfully set wakeup source config: " + JSON.stringify(res))
		}).catch(err => {
			this.ERR("_setWakeupSourceConfig: Error setting wakeup source config: " + JSON.stringify(err))
		})
	}

	_getPowerStatebeforeReboot() {
		// Skip power state restoration on UI reload (e.g., language change)
		// sessionStorage flag persists across UI reloads but is cleared on actual device reboot
		if (sessionStorage.getItem('powerStateRestored') === 'true') {
			this.LOG("_getPowerStatebeforeReboot: Power state already restored in this session, skipping (UI reload detected)");
			appApi.getPowerState().then(res => {
				GLOBALS.powerState = res.currentState;
				this.LOG("_getPowerStatebeforeReboot: Set GLOBALS.powerState to current state: " + JSON.stringify(res.currentState));
			}).catch(err => {
				this.LOG("_getPowerStatebeforeReboot: Error getting current power state: " + JSON.stringify(err));
				GLOBALS.powerState = PowerState.POWER_STATE_ON;
			});
			return;
		}
		appApi.getPowerStateBeforeReboot().then(res => {
			this.LOG("_getPowerStatebeforeReboot: getpowerstate before reboot " + JSON.stringify(res));
			this._oldPowerStateWhileReboot = res;
			this._getPowerStateWhileReboot();
		}).catch(err => {
			this.LOG("_getPowerStatebeforeReboot: getPowerStateBeforeReboot error " + JSON.stringify(err) + " setting powerstate to ON");
			this._oldPowerStateWhileReboot = PowerState.POWER_STATE_ON;
			this._getPowerStateWhileReboot();
		});
	}

	_firstEnable() {
		this.LOG("App Calling listenToVoiceControl method to activate VoiceControl Plugin")
		this.listenToVoiceControl();
		this._updateLanguageToDefault()
		this.initializeInactivityEngine();
	}

	initializeInactivityEngine() {
		if (this.inactivityEngineInitialized) {
			this.LOG("Inactivity engine already initialized. Skipping...");
			return;
		}
		this.inactivityEngineInitialized = true;
		this.initializeInactivity();
	}

	initializeInactivity() {
        this.LOG('Into initialize');

        const { energySaver, screenSaver, sleepTimer } = inactivityHelper.getInactivityConfig();
		this.LOG(`Loaded config: energySaver=${energySaver}, screenSaver=${screenSaver}, sleep=${sleepTimer}`)

		const hasValidTimer = inactivityHelper.isValidTimeout(screenSaver) || inactivityHelper.isValidTimeout(energySaver) || inactivityHelper.isValidTimeout(sleepTimer);

        if (!hasValidTimer) {
            this.LOG('No valid inactivity timers found. Disabling inactivity reporting.');
			appApi.enableInactivityReporting(false)
            .catch(err => this.ERR('Error disabling inactivity: ' + JSON.stringify(err)));
			return;
        }

		// Set initial interval based on valid timers
		if (inactivityHelper.isValidTimeout(screenSaver)) {
            this.$setInactivityIntervalStage('ScreenSaver', screenSaver);
        } else if (inactivityHelper.isValidTimeout(sleepTimer)) {
            this.$setInactivityIntervalStage('SleepTimer', sleepTimer);
        } else if(inactivityHelper.isValidTimeout(energySaver)) {
            this.$setInactivityIntervalStage('EnergySaver', energySaver);
        } else {
            this.LOG('No valid inactivity timers found. Engine will not start.');
        }
    }

	async registerOnUserInactivityListener() {
		try {
			thunder.on("org.rdk.RDKWindowManager", "onUserInactivity", async notification => {
				const { energySaver, screenSaver, sleepTimer } = inactivityHelper.getInactivityConfig();
				const minutes = Math.floor(Number(notification.minutes));

				this.LOG(`onUserInactivity fired: ${notification.minutes} mins`);
				// Screensaver stage
				if (screenSaver && minutes === screenSaver) {
					this.LOG("Screensaver event reached");
					this.currentStage = 'ScreenSaver';
					await this.triggerScreensaver();
				}
				// Sleep Timer + Energy Saver combined logic
				const hasSleepTimer = inactivityHelper.isValidTimeout(sleepTimer);
				const hasEnergySaver = inactivityHelper.isValidTimeout(energySaver);

				if (hasSleepTimer && hasEnergySaver && minutes === sleepTimer) {
					// Both enabled: at sleep timer time, execute energy saver (deep sleep)
					this.LOG('Sleep Timer + Energy Saver triggered together — entering deep sleep');
					this.currentStage = 'EnergySaver';
					if (GLOBALS.powerState === "ON" && GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
						this.LOG("Going to deep sleep due to inactivity (sleep timer + energy saver)");
						inactivityHelper._enterSleepMode();
					}
				} else if (hasSleepTimer && !hasEnergySaver && minutes === sleepTimer) {
					// Only sleep timer: standby as before
					this.LOG('Sleep Timer triggered (no energy saver) — entering standby');
					this.currentStage = 'SleepTimer';
					if (GLOBALS.powerState === "ON" && GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
						inactivityHelper.standby('STANDBY');
					}
				} else if (hasEnergySaver && !hasSleepTimer && minutes === energySaver) {
					// Only energy saver (default 15 min): deep sleep
					this.LOG('Energy Saver triggered (no sleep timer) — entering deep sleep');
					this.currentStage = 'EnergySaver';
					if (GLOBALS.powerState === "ON" && GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
						this.LOG("Going to deep sleep due to inactivity (energy saver only)");
						inactivityHelper._enterSleepMode();
					}
				}
			}, err => this.ERR("Listener error: " + JSON.stringify(err)));
		} catch (err) {
			this.ERR("Failed to activate RDKWindowManager for inactivity listener: " + JSON.stringify(err));
			throw err;
		}
	}

	async triggerScreensaver() {
		const result = await appApi.getAvCodeStatus();
		if (["IDLE", "PAUSE"].includes(result.avDecoderStatus) &&
			GLOBALS.topmostApp === GLOBALS.selfclientAppName) {
			this.$hideImage(1);
		}
		return result;
	}

	$setInactivityIntervalStage(stage, minutes) {
		this.LOG(`Request for set interval from stage=${stage} minutes=${minutes}`);
		if (!inactivityHelper.isValidTimeout(minutes)) {
			this.$resetInactivityStage(stage);
			return;
		}
		this.currentStage = stage;
		this.currentInterval = minutes;

        const { energySaver, screenSaver, sleepTimer } = inactivityHelper.getInactivityConfig();
		if (inactivityHelper.isValidTimeout(screenSaver)) {
			this.currentStage = 'ScreenSaver';
			this.currentInterval = screenSaver;
		}

		appApi.enableInactivityReporting(true)
			.then(() => appApi.setInactivityInterval(this.currentInterval))
			.then(async () => {
				this.LOG(`Inactivity interval set to ${this.currentInterval} for stage=${this.currentStage}`)

				if (!this.thunderListenerRegistered) {
					this.LOG("Registering listener for inactivity events...");
					try {
						await this.registerOnUserInactivityListener();
						this.thunderListenerRegistered = true;
					} catch (err) {
						this.ERR("Inactivity listener registration failed, will retry on next interval set: " + JSON.stringify(err));
					}
				}
				})
			.catch(err => this.ERR("setInactivityIntervalStage error: " + JSON.stringify(err)));
	}

	$resetInactivityStage(stage) {
        this.LOG(`Reset request for stage=${stage}`);
        if (this.currentStage === stage) {
            this.currentStage = null;
            this.currentInterval = null;
        }
		inactivityHelper.$resetInactivity(stage);
    }

	async listenToVoiceControl() {
		this.LOG("App listenToVoiceControl method got called, configuring VoiceControl Plugin")
		await voiceApi.activate().then(() => {
			voiceApi.voiceStatus().then(voiceStatusResp => {
				if (voiceStatusResp.success) {
					if (voiceStatusResp.ptt.status != "ready") {
						this.ERR("App voiceStatus says PTT not ready, enabling it.");
						// TODO: Future -> add option for user to select which Voice service provider.
						// Then configure VoiceControl plugin for that end point.
						// TODO: voiceApi.configureVoice()
						voiceApi.configureVoice({ "enable": true })
					}
				}
			});
			this._registerVoiceApiEvents()
		}).catch(err => {
			this.ERR("App VoiceControl Plugin activation error: " + JSON.stringify(err));
		})
	}

	_powerKeyPressed() {
		appApi.getPowerState().then(res => {
			this.LOG("getPowerState: " + JSON.stringify(res));
			if (res.currentState === "ON") {
				const { energySaver } = inactivityHelper.getInactivityConfig();
				if (inactivityHelper.isValidTimeout(energySaver)) {
					this.LOG("Energy Saver is enabled — going to DEEP_SLEEP on power key press");
					inactivityHelper._enterSleepMode();
				} else {
					this.LOG("current powerState is ON so setting power state to LIGHT_SLEEP");
					appApi.setPowerState(PowerState.POWER_STATE_LIGHT_SLEEP).then(result => {
						if (result) {
							this.LOG("successfully set powerstate to LIGHT_SLEEP")
							return result
						}
					})
				}
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
		if (availableLanguageCodes[Language.get()].length) {
			userSettingsApi.setPresentationLanguage(availableLanguageCodes[Language.get()])
			localStorage.setItem('Language', Language.get())
		}
	}

	subscribeToPowerChangeNotifications() {
		if (this.PowerChangeNotificationsSubscribed) {
			this.LOG("PowerChangeNotifications already subscribed, skipping...");
			return;
		}
		this.PowerChangeNotificationsSubscribed = true;
		thunder.on("org.rdk.PowerManager", "onPowerModeChanged", notification => {
			this.LOG(new Date().toISOString() + " onPowerModeChanged Notification: " + JSON.stringify(notification));
			appApi.getPowerState().then(res => {
				GLOBALS.powerState = res ? res.currentState : notification.newState
			}).catch(e => GLOBALS.powerState = notification.newState)
			if (notification.newState !== PowerState.POWER_STATE_ON && notification.currentState === PowerState.POWER_STATE_ON) {
				this.LOG("onPowerModeChanged Notification: power state was changed from ON to " + JSON.stringify(notification.newState))

				//TURNING OFF THE DEVICE
				Storage.set(SLEEP_STATE, notification.newState)
				let currentApp = GLOBALS.topmostApp
				if (currentApp !== "") {
					appApi.exitApp(currentApp); //will suspend/destroy the app depending on the setting.
				}
				Router.navigate('menu');
			}
			else if(notification.newState === PowerState.POWER_STATE_LIGHT_SLEEP && notification.currentState === PowerState.POWER_STATE_DEEP_SLEEP){
				appApi.setPowerState(PowerState.POWER_STATE_ON).then(res => {
					this.LOG("Device woke up from DEEP_SLEEP to LIGHT_SLEEP . setPowerState result: " + JSON.stringify(res))
				}).catch(err => {
					this.ERR("Failed to set power state to ON when device woke up from DEEP_SLEEP to LIGHT_SLEEP. Error: " + JSON.stringify(err))
				})
			}
			else if (notification.newState === PowerState.POWER_STATE_ON && notification.currentState !== PowerState.POWER_STATE_ON) {
				//TURNING ON THE DEVICE
				Storage.remove(SLEEP_STATE)
			}
		})
		// Catch up: if onPowerModeChanged fired before this listener was registered,
		// sync GLOBALS.powerState and Storage(SLEEP_STATE) against live plugin state now.
		appApi.getPowerState().then(res => {
			if (!res) return;
			const liveState = res.currentState;
			this.LOG("subscribeToPowerChangeNotifications catch-up getPowerState: " + JSON.stringify(liveState));
			GLOBALS.powerState = liveState;
			if (liveState !== PowerState.POWER_STATE_ON) {
				Storage.set(SLEEP_STATE, liveState);
			} else {
				Storage.remove(SLEEP_STATE);
			}
		}).catch(err => {
			this.ERR("subscribeToPowerChangeNotifications catch-up getPowerState error: " + JSON.stringify(err));
		});
	}

	launchFeaturedApp = async (appName) => {
		console.log("Launching Featured App from AI 2.0: " + appName);
		let installedApps;
		try {
			installedApps = await AppManager.get().getInstalledApps();
		} catch (err) {
			this.ERR("Error fetching installed apps: " + JSON.stringify(err));
			return;
		}

		const matchedApp = installedApps && installedApps.find(app =>
			app.appId.toLowerCase().includes(appName.toLowerCase())
		);
		const launchAppId = matchedApp ? matchedApp.appId : "";

		if (launchAppId === "") {
			this.ERR("Featured App not found in getInstalledApps: " + appName);
			return;
		}

		try {
			await AppManager.get().launchApp(launchAppId)
		} catch (err) {
			this.ERR("Error launching featured app: " + JSON.stringify(err));
		}
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
				if (res.currentState != PowerState.POWER_STATE_ON) {
					appApi.setPowerState(PowerState.POWER_STATE_ON)
				}
			})
			if (this.xcastApps(notification.applicationName)) {
				// FIXME: Implement DIAL launch functionality.
				this.WARN("App onApplicationLaunchRequest: not implemented.");
			} else {
				this.LOG("App onApplicationLaunchRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationHideRequest', notification => {
			this.LOG('App onApplicationHideRequest: ' + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				// FIXME: Implement hide logic for xcast apps if needed.
				this.WARN("App onApplicationHideRequest: not implemented.");
			} else {
				this.LOG("App onApplicationHideRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationResumeRequest', notification => {
			this.LOG('App onApplicationResumeRequest: ' + JSON.stringify(notification));
			appApi.getPowerState().then(res => {
				if (res.currentState != PowerState.POWER_STATE_ON) {
					appApi.setPowerState(PowerState.POWER_STATE_ON)
				}
			})
			if (this.xcastApps(notification.applicationName)) {
				// FIXME: Implement DIAL resume functionality.
				this.WARN("App onApplicationResumeRequest: not implemented.");
			} else {
				this.LOG("App onApplicationResumeRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
			this.LOG('App onApplicationStopRequest: ' + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				// FIXME: Implement DIAL stop functionality.
				this.WARN("App onApplicationStopRequest: not implemented.");
			} else {
				this.LOG("App onApplicationStopRequest: " + JSON.stringify(notification.applicationName) + " is not supported.")
			}
		});

		this.xcastApi.registerEvent('onApplicationStateRequest', notification => {
			console.log("App onApplicationStateRequest: " + JSON.stringify(notification));
			if (this.xcastApps(notification.applicationName)) {
				// FIXME: Implement DIAL state functionality.
				this.WARN("App onApplicationStateRequest: not implemented.");
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

	$registerUsbMount() {
		this.disposableListener = this.ListenerConstructor();
		this.LOG("Successfully registered the usb Mount")
	}

	$deRegisterUsbMount() {
		this.LOG("the current usbListener = " + JSON.stringify(this.disposableListener))
		this.disposableListener.dispose();
		this.LOG("successfully deregistered usb listener");
	}

	$setEnergySaverMode(time) {
		var timeoutInMinutes = inactivityHelper.$setEnergySaver(time);
        this.LOG("Final timeout (minutes): " + timeoutInMinutes);
		try {
			Storage.set('EnergySaverInterval', timeoutInMinutes);
			this.$setInactivityIntervalStage("EnergySaver", parseInt(timeoutInMinutes));
		} catch (err) {
			this.ERR("Error setting energy saver mode: " + JSON.stringify(err));
		}
	}

	standby(value) {
		this.LOG("standby call");
		if (value == 'Back') {
			// TODO: Identify what to do here.
		} else {
			if (GLOBALS.powerState == PowerState.POWER_STATE_ON) {
				this.LOG("Power state was on trying to set it to standby");
				appApi.setPowerState(value).then(res => {
					if (res) {
						this.LOG("successfully set to standby");
						GLOBALS.powerState = PowerState.POWER_STATE_STANDBY
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
			appApi.setPowerState(PowerState.POWER_STATE_ON).then(res => {
				if (res) {
					GLOBALS.powerState = PowerState.POWER_STATE_ON
				}
			})

			thunder.on("org.rdk.RDKWindowManager", "onUserInactivity", notification => {
				this.LOG('onUserInactivity: ' + JSON.stringify(notification));
				if (GLOBALS.powerState === "ON" && (GLOBALS.topmostApp === GLOBALS.selfClientName)) {
					this.standby("STANDBY");
				}
			}, err => {
				this.ERR("error while inactivity monitoring , " + JSON.stringify(err))
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
				appApi.setInactivityInterval(temp1).then(() => {
					Storage.set('TimeoutInterval', t)
					this.LOG("successfully set the timer to " + JSON.stringify(t) + " hours")
				}).catch(err => {
					this.ERR("error while setting the timer " + JSON.stringify(err))
				});
			} else if (temp === 'M') {
				this.LOG("minutes");
				let temp1 = parseFloat(arr[0]);
				appApi.setInactivityInterval(temp1).then(() => {
					Storage.set('TimeoutInterval', t)
					this.LOG("successfully set the timer to " + JSON.stringify(t) + " minutes");
				}).catch(err => {
					this.ERR("error while setting the timer " + JSON.stringify(err))
				});
			}
		}

		if (arr.length < 2) {
			appApi.enableInactivityReporting(false).then((res) => {
				if (res === true) {
					Storage.set('TimeoutInterval', false)
					this.LOG("Disabled inactivity reporting");
					// this.timerIsOff = true;
				}
			}).catch(err => {
				this.ERR("error : unable to set the reset; error = " + JSON.stringify(err))
			});
		} else {
			appApi.enableInactivityReporting(true).then(res => {
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

	_registerVoiceApiEvents() {
		let self = this;
		voiceApi.registerEvent('onServerMessage', notification => {
			this.LOG('App onServerMessage: ' + JSON.stringify(notification));
		});
		voiceApi.registerEvent('onSessionBegin', () => {
			this.$hideImage(0);
		});
		voiceApi.registerEvent('onSessionEnd', notification => {
			this.WARN("App VoiceControl.onSessionEnd notification: " + JSON.stringify(notification));
		});
	}

	jumpToRoute(route) {
		const targetApp = GLOBALS.topmostApp;
		if (targetApp != GLOBALS.selfclientAppName) {
			AppManager.get().closeApp(targetApp).then(() => {
				this.LOG("closeApp success for: " + targetApp)
				AppManager.get().terminateApp(targetApp).then(() => {
					this.LOG("terminateApp success after closeApp for: " + targetApp)
				}).catch(err => {
					this.ERR("terminateApp err after closeApp: " + JSON.stringify(err))
				});
			}).catch(err => {
				this.ERR("closeApp err for " + targetApp + ": " + JSON.stringify(err))
				AppManager.get().terminateApp(targetApp).then(() => {
					this.LOG("terminateApp success after closeApp failure for: " + targetApp)
				}).catch(termErr => {
					this.ERR("terminateApp err after closeApp failure for " + targetApp + ": " + JSON.stringify(termErr))
				});
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
