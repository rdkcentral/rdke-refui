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
import { Lightning, Utils, Language, Router } from '@lightningjs/sdk'
import { CONFIG, GLOBALS } from '../Config/Config';
import StatusProgress from '../overlays/StatusProgress'
import { installDACApp, isDACAppInstalled, startDACApp } from '../api/DACApi'
import { DACAppMixin } from './AppCatalogItem'

/**
 * Class to render DAC app items in main view with download/install functionality.
 * Uses DACAppMixin from AppCatalogItem for common DAC app operations.
 */
export default class DacAppItem extends DACAppMixin(Lightning.Component) {
  constructor(...args) {
    super(...args);
    this.initLogging();
  }

  static _template() {
    return {
      Item: {
        Shadow: {
          alpha: 0,
        },
        y: 20,
        // ImageWrapper contains Image, Overlay and StatusProgress so they scale together
        ImageWrapper: {
          Image: {
          },
          DefaultImage: {
            src: Utils.asset('/images/apps/DACApp_455_255.png'),
            alpha: 0,
          },
          Overlay: {
            alpha: 0,
            rect: true,
            color: 0xFF000000,
            OverlayText: {
              alpha: 0,
              mount: 0.5,
              text: {
                text: Language.translate('Already installed') + "!",
                fontFace: CONFIG.language.font,
                fontSize: 18,
              },
            },
          },
          StatusProgress: {
            type: StatusProgress,
            alpha: 1,
            zIndex: 10,
          },
        },
        Info: {},
      },
    }
  }

  _init() {
    this.initDACApp();

    // Set up ImageWrapper position - this wrapper will scale as a unit
    this.tag('ImageWrapper').patch({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    })

    this.tag('ImageWrapper.Image').on('txError', () => {
      this.tag('ImageWrapper.DefaultImage').patch({
        w: this.w,
        h: this.h,
        alpha: 1
      })
    })
    this.tag('ImageWrapper.Image').on('txLoaded', () => {
      this.tag('ImageWrapper.DefaultImage').alpha = 0
    })
    this.tag('Shadow').patch({
      color: CONFIG.theme.hex,
      rect: true,
      h: this.h + this.bar * 2,
      w: this.w,
      x: this.x,
      y: this.y - this.bar
    })
    if (!this.data.url) {
      this.LOG("data from app carousal: " + JSON.stringify(this.data));
    }
    if (this.data.url.startsWith('/images')) {
      this.tag('ImageWrapper.Image').patch({
        rtt: true,
        w: this.w,
        h: this.h,
        src: Utils.asset(this.data.url),
      });
    } else {
      this.tag('ImageWrapper.Image').patch({
        rtt: true,
        w: this.w,
        h: this.h,
        src: this.data.url,
      });
    }

    // DefaultImage same position as Image (relative to ImageWrapper)
    this.tag('ImageWrapper.DefaultImage').patch({
      w: this.w,
      h: this.h,
    })

    // Overlay for status messages (relative to ImageWrapper)
    this.tag('ImageWrapper.Overlay').patch({
      w: this.w,
      h: this.h,
    })
    this.tag('ImageWrapper.Overlay.OverlayText').patch({
      x: this.w / 2,
      y: this.h / 2,
    })

    // Status progress bar positioning (relative to ImageWrapper)
    // StatusProgress has BackgroundOverlay at x:-50, y:-80 with fixed size 300x168
    // Position StatusProgress so the BackgroundOverlay covers the image at (0, 0)
    const statusProgress = this.tag('ImageWrapper.StatusProgress')
    statusProgress.patch({
      x: 50,
      y: 80,
      w: this.w - 100,
    })
    // Update BackgroundOverlay to match our image dimensions
    statusProgress.tag('BackgroundOverlay').patch({
      x: -50,
      y: -80,
      w: this.w,
      h: this.h,
    })

    this.tag('Info').patch({
      x: this.x - 20,
      y: this.y + this.h + 10,
      w: this.w,
      h: 140,
      alpha: 0,
      PlayIcon: {
        Label: {
          x: this.idx === 0 ? this.x + 20 : this.x,
          y: this.y + 10,
          text: {
            fontFace: CONFIG.language.font,
            text: this.data.displayName,
            fontSize: 35,
            maxLines: 1,
            wordWrapWidth: this.w
          },
        }
      },
    })
  }

  async $fireDACOperationFinished(success, msg) {
    const wasInstalling = this._app.isInstalling;
    const completed = await this.fireDACOperationFinished(success, msg, 'ImageWrapper.StatusProgress', 'ImageWrapper.Overlay');
    if (completed && wasInstalling && success) {
      // Refresh the My Apps row to update installed apps list
      this.fireAncestors('$refreshMyAppsRow')
    }
  }

  updateStatus() {
    this.updateDACStatus('ImageWrapper.StatusProgress', 'ImageWrapper.Overlay');
  }

  async myfireINSTALL() {
    if (this._app.isInstalled) {
      this.LOG("App is already installed, launching...")
      // Launch the installed app
      this._app.isRunning = await startDACApp(this._app);
      return
    }
    await this.performDACInstall('ImageWrapper.StatusProgress', 'ImageWrapper.Overlay');
  }

  /**
   * Function to change properties of item during focus.
   */
  _focus() {
    // Scale the ImageWrapper as a whole - this keeps Image, Overlay, and StatusProgress aligned
    this.tag('ImageWrapper').patch({
      zIndex: 2,
      smooth: {
        scale: [this.focus, { timingFunction: 'ease', duration: 0.3 }],
      }
    })
    this.tag('Info').alpha = 1
    this.tag('Item').patch({
      zIndex: 2,
    })
    this.tag('Shadow').patch({
      smooth: {
        scale: [this.focus, { timingFunction: 'ease', duration: 0.3 }],
        alpha: 1,
      }
    });
  }

  /**
   * Function to change properties of item during unfocus.
   */
  _unfocus() {
    // Scale down the ImageWrapper as a whole
    this.tag('ImageWrapper').patch({
      zIndex: 0,
      smooth: {
        scale: [this.unfocus, { timingFunction: 'ease', duration: 0.3 }],
      }
    })
    this.tag('Item').patch({
      zIndex: 0,
    })
    this.tag('Info').alpha = 0
    this.tag('Shadow').patch({
      smooth: {
        alpha: 0,
        scale: [this.unfocus, { timingFunction: 'ease', duration: 0.3 }]
      }
    });
  }

  async _handleEnter() {
    // Handle "More Apps" item - navigate to apps route
    if (this.data.applicationType === 'MoreApps') {
      Router.navigate('apps');
      return;
    }

    if (!GLOBALS.IsConnectedToInternet) {
      this.fireAncestors('$showNetworkError')
      return
    }

    // Set up app info for DAC operations
    this._app.id = this.data.appIdentifier || this.data.uri
    this._app.name = this.data.displayName
    this._app.version = this.data.version
    this._app.type = this.data.applicationType
    this._app.url = this.data.uri

    // Check if already installed
    this._app.isInstalled = await isDACAppInstalled(this._app);

    // Install or launch
    this.myfireINSTALL();
  }
}
