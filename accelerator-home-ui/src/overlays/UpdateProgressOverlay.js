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
import { Lightning, Language } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";

/**
 * Progress overlay for app installation/update operations.
 * Prevents user interaction while operation is in progress.
 */
export default class UpdateProgressOverlay extends Lightning.Component {
  static _template() {
    return {
      rect: true,
      w: 1920,
      h: 1080,
      color: 0xCC000000, // Semi-transparent black background
      zIndex: 10,
      BackgroundBlocker: {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0x00000000, // Invisible but blocks input
      },
      ProgressDialog: {
        x: 960,
        y: 540,
        mount: 0.5,
        rect: true,
        w: 600,
        h: 280,
        color: 0xFF1A1A1A,
        shader: {
          type: Lightning.shaders.RoundedRectangle,
          radius: 16,
        },
        DialogBorder: {
          x: -2,
          y: -2,
          w: 604,
          h: 284,
          rect: true,
          color: 0x00000000,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 18,
            stroke: 2,
            strokeColor: 0xFF3D3D3D,
          },
        },
        Title: {
          x: 300,
          y: 30,
          mountX: 0.5,
          text: {
            text: Language.translate("Updating App"),
            fontFace: CONFIG.language.font,
            fontSize: 32,
            textColor: CONFIG.theme.hex,
            fontStyle: "bold",
          },
        },
        AppName: {
          x: 300,
          y: 75,
          mountX: 0.5,
          text: {
            text: "",
            fontFace: CONFIG.language.font,
            fontSize: 22,
            textColor: 0xFFCCCCCC,
            textAlign: "center",
          },
        },
        ProgressBarContainer: {
          x: 50,
          y: 130,
          w: 500,
          h: 40,
          rect: true,
          color: 0xFF333333,
          shader: {
            type: Lightning.shaders.RoundedRectangle,
            radius: 8,
          },
          ProgressBarFill: {
            x: 0,
            y: 0,
            w: 0,
            h: 40,
            rect: true,
            color: CONFIG.theme.hex,
            shader: {
              type: Lightning.shaders.RoundedRectangle,
              radius: 8,
            },
          },
        },
        StatusText: {
          x: 300,
          y: 190,
          mountX: 0.5,
          text: {
            text: "",
            fontFace: CONFIG.language.font,
            fontSize: 18,
            textColor: 0xFFAAAAAA,
            textAlign: "center",
          },
        },
        PercentText: {
          x: 300,
          y: 230,
          mountX: 0.5,
          text: {
            text: "0%",
            fontFace: CONFIG.language.font,
            fontSize: 20,
            textColor: 0xFFFFFFFF,
            textAlign: "center",
            fontStyle: "bold",
          },
        },
      },
    };
  }

  _init() {
    this._appName = "";
    this._isOperationInProgress = false;
  }

  /**
   * Show the progress overlay with app name
   * @param {string} appName - Name of the app being updated
   */
  showProgress(appName) {
    this._appName = appName;
    this._isOperationInProgress = true;
    this.tag("AppName").text.text = appName;
    this.tag("StatusText").text.text = "";
    this.tag("PercentText").text.text = "0%";
    this.tag("ProgressBarFill").w = 0;
    this.visible = true;
    this.setSmooth("alpha", 1, { duration: 0.3 });
  }

  /**
   * Set progress of the operation
   * @param {number} percent - Progress as decimal (0.0 to 1.0)
   * @param {string} state - Optional state text (e.g., "Downloading")
   */
  setProgress(percent, state) {
    const containerWidth = 500;
    const fillWidth = containerWidth * Math.max(0, Math.min(1, percent));

    this.tag("ProgressBarFill").setSmooth("w", fillWidth, { duration: 0.5 });

    const percentValue = Math.floor(percent * 100);
    this.tag("PercentText").text.text = `${percentValue}%`;

    if (state) {
      this.tag("StatusText").text.text = state;
    }
  }

  /**
   * Hide the progress overlay
   */
  hideProgress() {
    this._isOperationInProgress = false;
    this.setSmooth("alpha", 0, { duration: 0.3 });
    this.visible = false;
  }

  /**
   * Check if operation is in progress
   */
  isOperationInProgress() {
    return this._isOperationInProgress;
  }

  /**
   * Block all key events to prevent user interaction
   */
  _handleUp() {
    return true;
  }

  _handleDown() {
    return true;
  }

  _handleLeft() {
    return true;
  }

  _handleRight() {
    return true;
  }

  _handleEnter() {
    return true;
  }

  _handleBack() {
    return true;
  }
}
