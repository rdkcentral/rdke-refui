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
import { Metrics } from "@firebolt-js/sdk";

const thunder = ThunderJS(CONFIG.thunderConfig)
let playerID = -1; //set to -1 to indicate nothing is currently playing

let customServiceList = []; //list containing all channel details
let customEventList = {}; //object with dvduri mapping to eventlist on that channel
const getCustomServiceList = async () => {
  try {
    let response = await fetch(
      "http://127.0.0.1:50050/lxresui/static/moreChannels/ChannelData.json"
    );
    response = await response.json();
    customServiceList = response.serviceList;
    customEventList = response.eventList;
    console.log("customServiceList: ", customServiceList);
    console.log("customEventList: ", customEventList);
  } catch (err) {
    Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", JSON.stringify(err), false, null)
    console.log("Failed to read Custom Channel Data: ", err);
  }
};

getCustomServiceList(); //call this method in activate

//plugin is activated by default, no need to call explicitly
export default class DTVApi {
  activate() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: "DTV" })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          console.log("DTV Error Activation", err);
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error while Thunder Controller DTV activate "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
  deactivate() {
    return new Promise((resolve, reject) => {
      thunder.Controller.deactivate({ callsign: "DTV" })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          console.log("DTV Error Deactivation", err);
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error while Thunder Controller DTV deactivate "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
  //gets the number of available countries
  noOfCountries() {
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "numberOfCountries")
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log("Error: noOfCountries: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV numberOfCountries "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
  //returns the list of the available countries
  countryList() {
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "countryList")
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          console.log("Error: countryList: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV countryList "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  //returns the list of services(channels with name, uri and other details)
  serviceList() {
    let arr = [
      { shortname: "Amazon Prime", callsign: "Amazon", url: "", dvburi: "OTT", lcn: 0 },
      { shortname: "Netflix", callsign: "Netflix", url: "", dvburi: "OTT", lcn: 0 },
      { shortname: "YouTube", callsign: "YouTube", url: "", dvburi: "OTT", lcn: 0 },
      { shortname: "YouTubeTV", callsign: "YouTubeTV", url: "", dvburi: "OTT", lcn: 0 },
    ];
    if (customServiceList) {
      arr = arr.concat(JSON.parse(JSON.stringify(customServiceList)));
    }
    console.log("arr from serviceList: ", arr)
    return new Promise((resolve) => {
      thunder
        .call("DTV", "serviceList@dvbs")
        .then((result) => {
          arr = arr.concat(result)
          console.log("serviceListResult: ", JSON.stringify(arr));
          resolve(arr);
        })
        .catch((err) => {
          console.log("Error: serviceList: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV serviceList@dvbs "+JSON.stringify(err), false, null)
          resolve(arr);
        });
    });
  }

  getEvents(dvburi) {
    return customEventList[dvburi]
  }

  //returns the schedule for the given channel with provided dvburi
  scheduleEvents(dvburi) {
    let method = 'scheduleEvents@' + dvburi
    return new Promise((resolve, reject) => {
      if (dvburi.startsWith("C_")) {
        let data = customEventList[dvburi];
        if (data) {
          // resolve([]); //need to pass actual data here
          data = JSON.parse(JSON.stringify(data))
          for (let show of data) {
            show.starttime *= 1000;
            show.duration *= 1000;
          }
          resolve(data);
        } else {
          console.log("Error: getting schedule from custom channels");
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error: getting schedule from custom channels", false, null)
          resolve([]);
        }
      } else {
        thunder
          .call("DTV", method)
          .then((result) => {
            console.log("scheduleEventsResult: ", JSON.stringify(result));
            for (let show of result) {
              show.starttime *= 1000;
              show.duration *= 1000;
            }
            resolve(result);
          })
          .catch((err) => {
            console.log("Error: scheduleEvents: ", JSON.stringify(err));
            Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV scheduleEvents@dvbs "+JSON.stringify(err), false, null)
            reject(err);
          });
      }
    });
  }

  //lists the satellites available
  satelliteList() {
    return new Promise((resolve, reject) => {
      // resolve([{name: "Satellite 1",longitude: 282,lnb: "Universal" },{name: "Satellite 2",longitude: 282,lnb: "Universal" }]) //#forTesting
      thunder
        .call("DTV", "satelliteList")
        .then((result) => {
          if (result.length === 0) {
            result = [{ "name": "Astra 28.2E", "longitude": 282, "lnb": "Universal" }]
          }
          resolve(result);
        })
        .catch((err) => {
          console.log("Error: satelliteList: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV satelliteList "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
  //returns the available polarity options for dvb-s scan, returns a list of static values
  polarityList() {
    return new Promise((resolve) => {
      resolve(["horizontal", "vertical", "left", "right"]);
    });
  }

  //returns the available symbolRate options for dvb-s scan, returns a list of static values
  symbolRateList() {
    return new Promise((resolve) => {
      resolve(["22000", "23000", "27500", "29500"]); //values can be edited/entered custom from UI, no need to mention custom here
    });
  }
  //returns the available FEC options for dvb-s scan, returns a list of static values
  fecList() {
    return new Promise((resolve) => {
      resolve([
        "fecauto",
        "fec1_2",
        "fec2_3",
        "fec3_4",
        "fec5_6",
        "fec7_8",
        "fec1_4",
        "fec1_3",
        "fec2_5",
        "fec8_9",
        "fec9_10",
        "fec3_5",
        "fec4_5",
      ]);
    });
  }
  //returns the available modulation options for dvb-s scan, returns a list of static values
  modulationList() {
    return new Promise((resolve) => {
      resolve(["auto", "qpsk", "8psk", "16qam"]);
    });
  }
  //returns the available searchtype(searchmode) options for dvb-s scan, returns a list of static values
  searchtypeList() {
    return new Promise((resolve) => {
      resolve(["frequency", "network"]);
    });
  }
  //initiates a service search for the provided params
  startServiceSearch(params) {
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "startServiceSearch", params)
        .then((result) => {
          //console.log("serviceSearchResult: ", JSON.stringify(result));
          resolve(result);
        })
        .catch((err) => {
          console.log("serviceSearchError: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV startServiceSearch "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }
  //returns the number of available services(channels)
  noOfServices() {
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "numberOfServices")
        .then((result) => {
          //console.log("numberOfServicesResult: ", JSON.stringify(result));
          resolve(result);
        })
        .catch((err) => {
          console.log("Error: numberOfServices: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV numberOfServices "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  //returns the current and next event details for the given channel with provided dvburi
  nowNextEvents(dvburi) {
    let method = "nowNextEvents@" + dvburi;
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", method)
        .then((result) => {
          //console.log("nowNextEventsResult: ", JSON.stringify(result));
          resolve(result);
        })
        .catch((err) => {
          console.log("Error: nowNextEvents: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV nowNextEvents@dvbs "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }


  startPlaying(params) {
    //params contains dvburi and lcn
    console.log("PARAMS: startPlaying: ", JSON.stringify(params));
    if (playerID !== -1) {
      this.stopPlaying();
      return Promise.reject("something is still playing Please retry");
    }
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "startPlaying", params)
        .then((result) => {
          console.log("RESULT: startPlaying: ", JSON.stringify(result));
          if (result === -1) {
            reject("Can't be played");
          } else {
            playerID = result; //to be used in stopPlaying method
            resolve(result);
          }
        })
        .catch((err) => {
          console.log("ERROR: startPlaying: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV startPlaying "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  stopPlaying() {
    return new Promise((resolve, reject) => {
      thunder
        .call("DTV", "stopPlaying", playerID)
        .then((result) => {
          //playerID is retuned from startPlaying method
          console.log("RESULT: stopPlaying: ", JSON.stringify(result)); //result is always null
          playerID = -1; //to set that nothing is being played currently
          resolve(true);
        })
        .catch((err) => {
          console.log("ERROR: stopPlaying: ", JSON.stringify(err));
          Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", "Error in Thunder DTV stopPlaying "+JSON.stringify(err), false, null)
          reject(err);
        });
    });
  }

  launchChannel(dvburi) {
    console.log("PARAMS: launchChannel: ", JSON.stringify(dvburi));
    if (playerID !== -1) {
      this.exitChannel()
      console.log("launchChannel: FAIL: something is still playing, trying to call exitChannel")
      return Promise.reject("Fail: something is still playing")
    }
    return new Promise((resolve, reject) => {
      let port = "8080"; //try to fetch it later
      let cmd = "open"; //add other methods also
      let url = "http://127.0.0.1:" + port + "/vldms/sessionmgr/" + cmd;
      let data = {
        "openRequest": {
          "type": "main",
          "locator": "dtv://" + dvburi,
          "playerParams": {
            "subContentType": "live",
            "window": "0,0,1920,1080",
            "videoBlank": false,
          },
        },
      };
      let params = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      console.log("launchChannel: url & params: ", JSON.stringify(url), JSON.stringify(params))
      fetch(url, params).then(response => response.json()).then(result => {
        console.log("launchChannel: SUCCESS: ", JSON.stringify(result))
        playerID = result.openStatus.sessionId
        console.log("launchChannel: SESSIONID: ", playerID)
        resolve(result)
      }).catch(err => {
        console.log("launchChannel: FAILED: ", JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", JSON.stringify(err), false, null)
        reject(err)
      })
    });
  }

  exitChannel() {
    return new Promise((resolve, reject) => {
      let port = "8080"; //try to fetch it later
      let cmd = "close"; //add other methods also
      let url = "http://127.0.0.1:" + port + "/vldms/sessionmgr/" + cmd;
      let data = { "closeRequest": { "sessionId": playerID } };
      let params = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      console.log("exitChannel: url & params: ", JSON.stringify(url), JSON.stringify(params))
      fetch(url, params).then(response => response.json()).then(result => {
        console.log("exitChannel: SUCCESS: ", JSON.stringify(result))
        playerID = -1
        resolve(result)
      }).catch(err => {
        console.log("exitChannel: FAILED: ", JSON.stringify(err))
        Metrics.error(Metrics.ErrorType.OTHER,"DTVApiError", JSON.stringify(err), false, null)
        reject(err)
      })
    });
  }
}
