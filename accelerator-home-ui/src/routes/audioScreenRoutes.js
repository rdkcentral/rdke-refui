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

import AudioScreen from '../screens/VideoAndAudioScreens/AudioScreen'
import HdmiOutputScreen from '../screens/VideoAndAudioScreens/HdmiOutputScreen'
import ResolutionScreen from '../screens/VideoAndAudioScreens/ResolutionScreen'
import VideoScreen from '../screens/VideoAndAudioScreens/VideoScreen'


export default {
  audioScreenRoutes: [
    {
      path: 'settings/audio',
      component: AudioScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'settings/audio/output',
      component: HdmiOutputScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'settings/video',
      component: VideoScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
    {
      path: 'settings/video/resolution',
      component: ResolutionScreen,
      widgets: ['Menu', 'Volume', "AppCarousel"],
    },
  ]
}
