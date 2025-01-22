/**
 * If not stated otherwise in this file or this component"s LICENSE
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

export var showCaseApps = [
    {
      displayName: 'Strike Benchmark',
      applicationType: 'LightningApp',
      uri: 'https://strike.lightningjs.io/es6/#home',
      url: '/images/lightningApps/strike_app.png',
      appIdentifier: 's:0'
    },
    {
      displayName: 'TMBD App',
      applicationType: 'LightningApp',
      uri: 'https://lightningjs.io/tmdb/#splash',
      url: '/images/lightningApps/tmbd.png',
      appIdentifier: 's:1'
    },
    {
      displayName: 'FCA',
      applicationType: 'FireboltApp',
      appId : "comcast.test.firecert",
      intent : { "action": "home", "context": { "source": "device" } } ,
      url: '/images/lightningApps/fb_cert.png',
      appIdentifier: 's:2'
    }
  ]