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

import BluetoothPairingScreen from "../screens/BluetoothPairingScreen"
import BluetoothScreen from "../screens/BluetoothScreen"
import JoinAnotherNetworkComponent from "../screens/JoinAnotherNetworkComponent"
import NetworkConfigurationScreen from "../screens/OtherSettingsScreens/NetworkConfigurationScreen"
import NetworkInfo from "../screens/OtherSettingsScreens/NetworkInfoScreen"
import NetworkInterfaceScreen from "../screens/OtherSettingsScreens/NetworkInterfaceScreen"
import WifiPairingScreen from "../screens/WiFiPairingScreen"
import WiFiScreen from "../screens/WifiScreen"
import RCVolumeInfoScreen from '../screens/RcInformationScreen'

const networkRoutes = [
    {
        path: 'settings/network',
        component: NetworkConfigurationScreen,
        widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
        path: 'settings/network/info',
        component: NetworkInfo,
        widgets: ['Menu', 'Volume', "AppCarousel"]
    },
    {
        path: 'settings/network/interface',
        component: NetworkInterfaceScreen,
        widgets: ['Menu', 'Volume', "AppCarousel"]
    },
    {
        path: 'settings/network/interface/wifi',
        component: WiFiScreen,
        widgets: ['Menu', 'Fail', 'Volume', "AppCarousel"]
    },
    {
        path: 'settings/network/interface/wifi/connect',
        component: WifiPairingScreen,
        widgets: ['Volume', "AppCarousel"]
    },
    {
        path: 'settings/network/interface/wifi/another',
        component: JoinAnotherNetworkComponent,
        widgets: ['Volume', "AppCarousel"]
    },
    {
        path: 'settings/bluetooth',
        component: BluetoothScreen,
        widgets: ['Menu', 'Fail', 'Volume', "AppCarousel"]
    },
    {
        path: 'settings/bluetooth/pairing',
        component: BluetoothPairingScreen,
        widgets: ['Volume', "AppCarousel"]
    },
    {
        path: 'settings/bluetooth/RCVolumeInfoScreen',
        component: RCVolumeInfoScreen,
        widgets: ["Menu",'Volume', "Fail","AppCarousel"] 
    }
]

export var route = {
    network: networkRoutes
}