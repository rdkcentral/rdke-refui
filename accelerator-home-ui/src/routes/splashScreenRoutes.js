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
import LogoScreen from '../screens/SplashScreens/LogoScreen'
import BluetoothScreen from '../screens/SplashScreens/BluetoothScreen'
import LanguageScreen from '../screens/SplashScreens/LanguageScreen'
import NetworkScreen from '../screens/SplashScreens/NetworkScreen'
import NetworkPromptScreen from '../screens/SplashScreens/NetworkPromptScreen'
import NetworkList from '../screens/SplashScreens/NetworkList'

export default {
    splashScreenRoutes: [
        {
            path: 'splash',
            component: LogoScreen,
            widgets: ['Volume', "AppCarousel"],
        },
        {
            path: 'splash/bluetooth',
            component: BluetoothScreen,
            widgets: ['Volume', "AppCarousel"],
        },
        {
            path: 'splash/language',
            component: LanguageScreen,
            widgets: ['Volume', "AppCarousel"],
        },
        {
            path: 'splash/network',
            component: NetworkScreen,
            widgets: ['Volume', "AppCarousel"],
        },
        {
            path: 'splash/networkPrompt',
            component: NetworkPromptScreen,
            widgets: ['Volume', "AppCarousel"],
        },
        {
            path: 'splash/networkList',
            component: NetworkList,
            widgets: ['Volume', "AppCarousel"],
        }
    ]
}