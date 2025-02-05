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
import Error from './../screens/Error'
import HomeApi from '../api/HomeApi.js'
import SettingsScreen from '../screens/SettingsScreen'
import MainView from '../views/MainView'
import { route } from './networkRoutes'
import AAMPVideoPlayer from '../MediaPlayer/AAMPVideoPlayer'
import otherSettingsRoutes from './otherSettingsRoutes'
import audioScreenRoutes from './audioScreenRoutes'
import FailScreen from '../screens/FailScreen'
import UsbAppsScreen from '../screens/UsbAppsScreen'
import LightningPlayerControls from '../MediaPlayer/LightningPlayerControl'
import ImageViewer from '../MediaPlayer/ImageViewer'
import splashScreenRoutes from './splashScreenRoutes'
import LogoScreen from '../screens/SplashScreens/LogoScreen'
import UIList from '../views/UIList'
import AppStore from '../views/AppStore'
import detailsScreenRoutes from './detailsScreenRoutes'
import liveTvRoutes from './liveTvRoutes'
import TvOverlayScreen from '../tvOverlay/TvOverlayScreen'
import EPGScreen from "../screens/EpgScreens/Epg"
import DTVPlayer from '../MediaPlayer/DTVPlayer'
import AppLauncherScreen from '../screens/AppLauncherScreen'
import CodeScreen from '../screens/CodeScreen'
import AlexaLoginScreen from '../screens/AlexaLoginScreen'
import SuccessScreen from '../screens/SuccessScreen'
import FailureScreen from '../screens/FailureScreen'
import AlexaConfirmationScreen from '../screens/AlexaConfirmationScreen'
import CameraStreamingScreen from '../screens/CameraStreamingScreen'
import CameraStreamingScreenExitConfirmationScreen from '../screens/CameraStreamingScreenExitConfirmationScreen'
import AlexaApi from '../api/AlexaApi.js'
import { Storage } from '@lightningjs/sdk'
import { Metrics } from '@firebolt-js/sdk'
import { GLOBALS } from '../Config/Config.js'

let api = null

export default {
  boot: (queryParam) => {
    let homeApi = new HomeApi()
    homeApi.setPartnerAppsInfo(queryParam.data)
    homeApi.getAPIKey()
      .then((data) => {
        if (data.data.length > 1) {
          api = data
        }
      })
    return Promise.resolve()
  },
  // root: 'splash',
  routes: [
    ...splashScreenRoutes.splashScreenRoutes,
    ...route.network,
    ...otherSettingsRoutes.otherSettingsRoutes,
    ...audioScreenRoutes.audioScreenRoutes,
    ...detailsScreenRoutes.detailsScreenRoutes,
    ...liveTvRoutes,
    {
      path: 'settings',
      component: SettingsScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'failscreen',
      component: FailScreen,
    },
    {
      path: 'videoplayer',
      component: LightningPlayerControls,
      widgets: ['Volume', "AppCarousel", "VideoInfoChange"]
    },
    {
      path: 'usb',
      component: UsbAppsScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'epg',
      component: EPGScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'apps',
      component: AppStore,
      widgets: ['Menu', 'Volume', "AppCarousel"]
    },
    {
      path: 'usb/player',
      component: AAMPVideoPlayer,
      widgets: ['Volume', "SettingsOverlay", "AppCarousel"]
    },
    {
      path: 'usb/image',
      component: ImageViewer,
      widgets: ['Volume', "AppCarousel"]
    },
    {
      path: 'image',
      component: ImageViewer,
      widgets: ['Volume', "AppCarousel"]
    },
    {
      path: 'ui',
      component: UIList,
      widgets: ['Volume', "AppCarousel"]
    },
    {
      path: 'menu',
      component: MainView,
      before: (page) => {
        const homeApi = new HomeApi()
        page.tvShowItems = homeApi.getTVShowsInfo()
        // page.usbApps = homeApi.getTVShowsInfo()
        if (api) {
          page.setGracenoteData(api)
        }
        return Promise.resolve()
      },
      widgets: ['Menu', 'Fail', 'Volume', "AppCarousel", "VideoInfoChange"],
    },
    {
      path: 'tv-overlay/:type',
      component: TvOverlayScreen,
      options: {
        preventStorage: true,
      }
    },
    {
      path: 'applauncher',
      component: AppLauncherScreen,
      widgets: ['Volume', 'SettingsOverlay', "AppCarousel"] //other overlays needs to be added to improve ovelay functionality.
    },
    {
      path: 'player',
      component: AAMPVideoPlayer,
      widgets: ['Volume', "SettingsOverlay", "AppCarousel"]
    },
    {
      path: 'camera/player',
      component: CameraStreamingScreen,
      widgets: ['Menu'],
    },
    {
      path: 'camera/player/ExitScreen',
      component: CameraStreamingScreenExitConfirmationScreen,
    },
    {
      path: 'dtvplayer',
      component: DTVPlayer,
      widgets: ['Volume', 'TvOverlays', 'ChannelOverlay', "SettingsOverlay", "AppCarousel"]
    },
    {
      path: '!',
      component: Error,
    },
    {
      path: '*',
      component: LogoScreen,
    },
    {
      path: "FailureScreen",
      component: FailureScreen
    },
    {
      path: "SuccessScreen",
      component: SuccessScreen
    },
    {
      path: "AlexaLoginScreen",
      component: AlexaLoginScreen
    },
    {
      path: "CodeScreen",
      component: CodeScreen,
    },
    {
      path: "AlexaConfirmationScreen",
      component: AlexaConfirmationScreen
    }
  ],
  afterEachRoute: (request) => {
    console.log("Routed to:" + JSON.stringify(request.hash));
    if ("ResidentApp" !== GLOBALS.selfClientName) {
      Metrics.page(request.hash)
      .then(success => {
        console.log("successfully routed to page  ==>", request.hash)
      })
      .catch(err => console.log("error in metrics.page", err))
    }
    AlexaApi.get().reportApplicationState(request.hash, true);
    if (request.hash === "menu") {
      /* To prevent the onboarding screen appearing next time. */
      Storage.set("setup", true);
    }
  }
}
