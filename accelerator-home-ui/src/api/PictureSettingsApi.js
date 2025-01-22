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

import ThunderJS from "ThunderJS";
import { CONFIG } from '../Config/Config'
import {Metrics} from "@firebolt-js/sdk"

/**
 * Class for ControlSettings thunder plugin apis.
 */

export default class PictureSettingsApi {
  constructor() {
    this._thunder = ThunderJS(CONFIG.thunderConfig);
    this._events = new Map();
    this.callsign = "org.rdk.tv.ControlSettings";
    this.settingsOptions = [
      {
        id: "_pictureMode",
        name: "Picture Mode",
        value: [
          "standard",
          "vivid",
          "energysaving",
          "custom",
          "theater",
          "game",
          "sports"
        ]
      },
      {
        id: "_colorTemp",
        name: "Color Temperature",
        value: ["Standard", "Warm", "Cold", "User Defined"]
      },
      { id: "_backlight", name: "Backlight", value: "0" },
      { id: "_brightness", name: "Brightness", value: "0" },
      { id: "_contrast", name: "Contrast", value: "0" },
      { id: "_sharpness", name: "Sharpness", value: "0" },
      { id: "_saturation", name: "Saturation", value: "0" }
    ];
    this.methodNames = {
      _pictureMode: {get: this.getPictureMode.bind(this), set: this.setPictureMode.bind(this)},
      _colorTemp: {get: this.getColorTemperature.bind(this), set: this.setColorTemperature.bind(this)},
      _backlight: {get: this.getBacklight.bind(this), set: this.setBacklight.bind(this)},
      _brightness: {get: this.getBrightness.bind(this), set: this.setBrightness.bind(this)},
      _contrast: {get: this.getContrast.bind(this), set: this.setContrast.bind(this)},
      _sharpness: {get: this.getSharpness.bind(this), set: this.setSharpness.bind(this)},
      _saturation: {get: this.getSaturation.bind(this), set: this.setSaturation.bind(this)}
    };
  }

  activate() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call("Controller", "activate", { callsign: this.callsign })
        .then(result => {
          console.log(
            "Activated tv.ControlSettings plugin: ",
            JSON.stringify(result)
          );
          resolve(result);
        })
        .catch(err => {
          console.log(
            "Failed to activate tv.ControlSettings plugin: ",
            JSON.stringify(err)
          );
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error while Thunder Controller TvControlSettings activate "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getSettingsValue(settingsName) {
    console.log("getSettingsValue called for : ",settingsName)
    return new Promise((resolve, reject) => {
      this.methodNames[settingsName].get().then(result => {
        console.log(`Result from getSettingsValue API for ${settingsName} : ${JSON.stringify(result)}`)
        resolve(result)
      }).catch(err => {
        console.log(`Error from getSettingsValue API for ${settingsName} : ${JSON.stringify(err)}`)
        Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getSettings "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  setSettingsValue(settingsName, value){
    console.log("setSettingsValue called for : ",settingsName, " and for value: ",value)
    return new Promise((resolve, reject) => {
      this.methodNames[settingsName].set(value).then(result => {
        console.log(`Result from setSettingsValue API for ${settingsName} : ${JSON.stringify(result)}`)
        resolve(result)
      }).catch(err => {
        console.log(`Error from setSettingsValue API for ${settingsName} and value : ${value} | Error: ${JSON.stringify(err)}`)
        Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setSettings "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getOptions() {
    console.log("getOptions called: ",JSON.stringify(this.settingsOptions))
    return this.settingsOptions;
  }

  getSupportedPictureModes() {
    console.log("getSupportedPictureModes got called")

    return new Promise((resolve,reject) => {
      this._thunder.call(this.callsign, "getSupportedPictureModes").then(result => {
        console.log("getSupportedPictureModes Result: ",JSON.stringify(result))
        if (result.success) {
          this.settingsOptions[0].value=result.SupportedPicmodes
          resolve(true)
        }
      }).catch(err => {
        console.log("getSupportedPictureModes Error: ",JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getSupportedPictureModes "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getSupportedColorTemps() {
    console.log("getSupportedColorTemps got called")

    return new Promise((resolve,reject) => {
      this._thunder.call(this.callsign, "getColorTemperature").then(result => {
        console.log("Log from getSupportedColorTemps API: ", JSON.stringify(result))
        if (result.success) {
          this.settingsOptions[1].value=result.ColorTemperature.Options
          resolve(true)
        }
      }).catch(err => {
        console.log("Error from getSupportedColorTemps API: ", JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getColorTemperature "+JSON.stringify(err), false, null)
        reject(err)
      })
    })
  }

  getPictureMode() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getPictureMode")
        .then(result => {
          resolve(result.pictureMode);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getPictureMode "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setPictureMode(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setPictureMode", {
          "pictureMode": value
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setPictureMode "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getColorTemperature() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getColorTemperature")
        .then(result => {
          resolve(result.ColorTemperature.Selected);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getColorTemperature "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setColorTemperature(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setColorTemperature", {
          "colorTemp": value
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setColorTemperature "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getBrightness() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getBrightness")
        .then(result => {
          resolve(result.Brightness.Setting);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getBrightness "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setBrightness(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setBrightness", {
          "brightness": `${value}`
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setBrightness "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getContrast() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getContrast")
        .then(result => {
          resolve(result.Contrast.Setting);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getContrast "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setContrast(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setContrast", {
          "contrast": `${value}`
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setContrast "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getSharpness() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getSharpness")
        .then(result => {
          resolve(result.Sharpness.Setting);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getSharpness "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setSharpness(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setSharpness", {
          "sharpness": `${value}`
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setSharpness "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getSaturation() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getSaturation")
        .then(result => {
          resolve(result.Saturation.Setting);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getSaturation "+ JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setSaturation(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setSaturation", {
          "saturation": `${value}`
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setSaturation "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  getBacklight() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "getBacklight")
        .then(result => {
          resolve(result.Backlight.Setting);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings getBacklight "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  setBacklight(value) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, "setBacklight", {
          "backlight": `${value}`
        })
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          Metrics.error(Metrics.ErrorType.OTHER,"PictureSettingsApiError", "Error in Thunder TvControlSettings setBacklight "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
}
