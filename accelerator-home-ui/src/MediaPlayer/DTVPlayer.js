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
import { Lightning, Router } from "@lightningjs/sdk";
import AppApi from "../api/AppApi";
import DTVApi from "../api/DTVApi";
export default class DTVPlayer extends Lightning.Component {
  static _template() {
    return {
      Player: {
        w: 1920,
        h: 1080,
      },
    };
  }

  _firstEnable() {
    this.dtvApi = new DTVApi();
    this.appApi = new AppApi();
  }

  _handleBack() {
    this.dtvApi
      .exitChannel()
      .then((res) => {
        console.log("exit channel: ", JSON.stringify(res));
      })
      .catch((err) => {
        console.log("failed to exit channel: ", JSON.stringify(err));
      });
    Router.back();
  }

  _handleLeft() {
    Router.focusWidget("ChannelOverlay");
  }

}
