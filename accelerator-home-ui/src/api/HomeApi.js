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
import { Storage } from "@lightningjs/sdk";
import Network from "../api/NetworkApi";
import AppApi from "./AppApi";
import { GLOBALS } from "../Config/Config.js";
import { appListInfo } from "./../../static/data/AppListInfo.js";
import { tvShowsInfo } from "./../../static/data/TvShowsInfo.js";
import { settingsInfo } from "./../../static/data/SettingsInfo.js";
import { sidePanelInfo } from "./../../static/data/SidePanelInfo.js";
import { rightArrowInfo } from "./../../static/data/RightArrowInfo.js";
import { leftArrowInfo } from "./../../static/data/LeftArrowInfo.js";
import { uiInfo } from "./../../static/data/UIInfo";
import { metroAppsInfo } from "./../../static/data/MetroAppsInfo.js";
import { metroAppsInfoOffline } from "./../../static/data/MetroAppsInfoOffline.js";
import { showCaseApps } from "../../static/data/LightningShowcase";
import { Metrics } from "@firebolt-js/sdk";
import xml2json from "@hendt/xml2json";
import PersistentStoreApi from "./PersistentStore.js";

let partnerApps = [];

/**
 * Get the ip address.
 */
let IpAddress1 = "";
let IpAddress2 = "";

Network.get().getStbIp().then((ip) => {
  IpAddress1 = ip;
  Storage.set("ipAddress", IpAddress1);
}).catch(() => {
  Storage.set("ipAddress", null);
});

let appApi = new AppApi();
appApi.getIP().then((ip) => {
  IpAddress2 = ip;
});

/**
 * Class that returns the data required for home screen.
 */
export default class HomeApi {
  /**
   * Function to get details for app listing.
   */
  getAppListInfo() {
    let appsMetaData = appListInfo;
    return JSON.parse(JSON.stringify(appsMetaData));
  }

  /**
   * Function to get details for tv shows listings.
   */
  getTVShowsInfo() {
    return tvShowsInfo;
  }

  /**
   * Function to get details for settings listings.
   */
  getSettingsInfo() {
    return settingsInfo;
  }

  /**
   * Function to get details for lightning showcase apps.
   */
  getShowCaseApps() {
    return JSON.parse(JSON.stringify(showCaseApps));
  }

  /**
   * Function to get details for all apps.
   */
  getAllApps() {
    return [
      ...this.getAppListInfo(),
      ...this.getMetroInfo(),
      ...this.getShowCaseApps(),
    ];
  }

  /**
   * Function to get details for side panel.
   */
  getSidePanelInfo() {
    return sidePanelInfo;
  }

  /**
   * Function to get details of different UI
   */
  getUIInfo() {
    return uiInfo;
  }

  /**
   * Function to details of metro apps
   */
  getMetroInfo() {
    let metroAppsMetaData;

    if (IpAddress1 || IpAddress2) {
      metroAppsMetaData = metroAppsInfo;
    } else {
      metroAppsMetaData = metroAppsInfoOffline;
    }

    return metroAppsMetaData;
  }


  getOnlineMetroApps() {
    return JSON.parse(JSON.stringify(metroAppsInfo));
  }

  /**
   * Function to store partner app details.
   * @param {obj} data Partner app details.
   */
  setPartnerAppsInfo(data) {
    partnerApps = data;
  }

  /**
   *Function to return partner app details.
   */
  getPartnerAppsInfo() {
    return partnerApps;
  }
  /**
   * Function to details of right arrow
   */
  getRightArrowInfo() {
    return rightArrowInfo;
  }
  /**
   * Function to details of left arrow
   */
  getLeftArrowInfo() {
    return leftArrowInfo;
  }

  getMovieSubscriptions(id) {
    return new Promise((resolve) => {
      PersistentStoreApi.get().getValue('gracenote', 'apiKey').then((res) => {
        if (res && res.value && res.value !== undefined && res.value !== "") {
          try {
            fetch("http://feeds.tmsapi.com/v2/movies/" + id + ".xml?api_key=" + res.value)
              .then(response => response.text())
              .then((res) => {
                resolve(xml2json(res));
              });
          } catch (err) {
            console.log("API key not defined." + JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER,"ApiError", JSON.stringify(err), false, null)
          }
        }
      }).catch((err) => {
        console.log("Gracenote Info not found." + JSON.stringify(err));
      });
    });
  }

  getAPIKey() {
    return new Promise((resolve) => {
      PersistentStoreApi.get().getValue('gracenote', 'apiKey').then((res) => {
        if (res && res.value && res.value !== undefined && res.value !== "") {
          let [day, month, year] = [
            new Date().getUTCDate(),
            new Date().getUTCMonth(),
            new Date().getUTCFullYear(),
          ];
          month += 1;
          day = day.toString();
          month = month.toString();
          //fetch date time from the thunder plugins and pass it to the url
          try {
            fetch("http://data.tmsapi.com/v1.1/movies/airings?lineupId=USA-TX42500-X&startDateTime=" + year + "-" + month + "-" + day + "T08%3A00Z&includeAdult=false&imageSize=Lg&imageAspectTV=16x9&imageText=true&api_key=" + res.value)
              .then((response) => response.json())
              .then((response) => {
                const ids = response.map((id) => id.program.rootId);
                const filtered = response.filter(
                  ({ program }, index) => !ids.includes(program.rootId, index + 1)
                );
                resolve({
                  key: res.value,
                  data: filtered.slice(0, 20),
                });
              })
              .catch((err) => {
                console.log("Gracenote: Incorrect API key or no data available" + JSON.stringify(err));
                Metrics.error(Metrics.ErrorType.OTHER,"ApiError", JSON.stringify(err), false, null)
                resolve({
                  key: res.value,
                  data: [],
                });
              });
          } catch (err) {
            console.error("Gracenote fetch failed." + JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER,"ApiError", JSON.stringify(err), false, null)
            resolve({
              key: res.value,
              data: [],
            });
          }
        } else {
          console.error("Gracenote apiKey is invalid in PersistentStore.");
          Metrics.error(Metrics.ErrorType.OTHER,"ApiError", JSON.stringify(err), false, null)
          resolve({
            key: "",
            data: [],
          });
        }
      }).catch((err) => {
        console.error("Gracenote apiKey not found in PersistentStore." + JSON.stringify(err));
        resolve({
          key: "",
          data: [],
        });
      });
    });
  }
  async checkChannelComapatability(items) {
    for (let i = 0; i < items.length; i++) {
      let callsign = null
      if (items[i].dvburi === "OTT") {
        callsign = items[i].callsign
        if (items[i].callsign === "YouTube" || items[i].callsign === "YouTubeTV") {
          callsign = "Cobalt"
        }
        await appApi.getPluginStatus(callsign).catch(err => {
          console.log("Error:", err)
          items.splice(i, 1)
          i--
        })
      }
    }
    return items
  }
  async checkAppCompatability(items) {
    for (let i = 0; i < items.length; i++) {

      let callsign = items[i].applicationType
      if (items[i].applicationType !== '') {
        if ((items[i].applicationType === "FireboltApp") && (GLOBALS.selfClientName === "FireboltMainApp-refui")) {
          callsign = "HtmlApp";
        }
        else if (items[i].applicationType === "YouTube" || items[i].applicationType === "YouTubeTV") {
          callsign = "Cobalt"
        }
        await appApi.getPluginStatus(callsign).catch(err => {
          console.log("Error:", err)
          items.splice(i, 1)
          i--
        })
      }
    }
    return items
  }
}
