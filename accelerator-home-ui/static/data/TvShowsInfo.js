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
/**
 * Class which contains data for tv shows listings.
 */
export var tvShowsInfo = [
  {
    displayName: 'BiPBop',
    url: '/images/tvShows/fantasy-island.jpg',
    uri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
  },
  {
    // "Big Buck Bunny" © copyright 2008, Blender Foundation | www.bigbuckbunny.org
    // Licensed under Creative Commons Attribution 3.0: https://creativecommons.org/licenses/by/3.0/
    displayName: 'BigBuckBunny',
    url: '/images/tvShows/onward.jpg',
    uri: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    attribution: '"Big Buck Bunny" © copyright 2008, Blender Foundation | www.bigbuckbunny.org | CC BY 3.0'
  },
  {
    // "Sintel" © copyright 2010, Blender Foundation | www.blender.org | https://durian.blender.org
    // Licensed under Creative Commons Attribution 3.0: https://creativecommons.org/licenses/by/3.0/
    displayName: 'Sintel',
    url: '/images/tvShows/let-it-snow.jpg',
    uri: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    attribution: '"Sintel" © copyright 2010, Blender Foundation | www.blender.org | CC BY 3.0'
  },
  {
    displayName: 'DAI Test',
    url: '/images/tvShows/do-little.jpg',
    uri: "https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8",
  },
  {
    // "Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org
    // Licensed under Creative Commons Attribution 3.0: https://creativecommons.org/licenses/by/3.0/
    displayName: 'Tears of Steel',
    url: '/images/tvShows/summerland.jpg',
    uri: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    attribution: '"Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org | CC BY 3.0'
  },
  {
    // "Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org | CC BY 3.0
    displayName: 'WideVine Test',
    url: '/images/tvShows/summerland.jpg',
    uri: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel-dash-widevine.ism/.mpd",
    attribution: '"Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org | CC BY 3.0',
    drmConfig: {
      licenseServerUrl: "https://proxy.uat.widevine.com/proxy?provider=widevine_test",
      preferredDrm: 1
    }
  },
	{
		displayName: 'Sintel 4K Widevine Alpha',
		url: '/images/tvShows/summerland.jpg',
		attribution: '"Sintel" © copyright 2010, Blender Foundation | www.blender.org | CC BY 3.0',
		uri: "https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd",
		drmConfig: {
			licenseServerUrl: "https://cwip-shaka-proxy.appspot.com/no_auth",
			preferredDrm: 1
		}
	},
	{
		displayName: 'Sintel 4K WV+Ads',
		url: '/images/tvShows/summerland.jpg',
		attribution: '"Sintel" © copyright 2010, Blender Foundation | www.blender.org | CC BY 3.0',
		uri: "https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd",
		drmConfig: {
			licenseServerUrl: "https://cwip-shaka-proxy.appspot.com/no_auth",
			preferredDrm: 1
		}
	},
  {
    // "Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org | CC BY 3.0
    displayName: 'Playready Test',
    url: '/images/tvShows/summerland.jpg',
    uri: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel-dash-playready.ism/.mpd",
    attribution: '"Tears of Steel" © copyright 2012, Blender Foundation | mango.blender.org | CC BY 3.0',
    drmConfig: {
      preferredDrm: 2
    }
  }
]
