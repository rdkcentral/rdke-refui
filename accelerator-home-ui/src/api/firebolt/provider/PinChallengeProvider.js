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
import { Router, Storage } from '@lightningjs/sdk'
import ThunderJS from 'ThunderJS';
import { CONFIG, GLOBALS } from '../../../Config/Config'
import { Metrics } from '@firebolt-js/sdk';

let thunder = ThunderJS(CONFIG.thunderConfig)

export default class PinChallengeProvider {

  challenge(challenge, session) {
    if (!challenge) return
    console.log('Got challenge ' + JSON.stringify(challenge), "challenge")

    return new Promise((resolve) => {
      this.showChallengeUi(challenge, resolve)
      session.focus()
    })
  }

  showChallengeUi(challenge, responder) {
    console.log("Displaying showChallengeUi with: " + GLOBALS.selfClientName)
    new Promise(async (resolve) => {
      let message = challenge.requestor.name + ' is requesting that you enter your ' + challenge.pinSpace + ' pin.'
      let params = { message: message, challenge: challenge, responder }
      thunder.call('org.rdk.RDKShell', 'setVisibility', { client: GLOBALS.selfClientName, visible: true }).then(() => {
        Router.navigate('settings/other/SecurityPinScreen', params)
      }).catch(err => Metrics.error(Metrics.ErrorType.OTHER, "PluginError", "Thunder RDKShell set visibility error "+err, true, null))
      resolve(true)
    })
  }
}
