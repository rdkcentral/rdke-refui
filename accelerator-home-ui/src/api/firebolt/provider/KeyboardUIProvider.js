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

let thunder = ThunderJS(CONFIG.thunderConfig)

export default class KeyboardUIProvider {
  constructor(app) {
    this._app = app
    this.INFO = function () { };
    this.LOG = console.log;
    this.ERR = console.error;
  }

  standard(keyboardSession, providerSession) {
    this.LOG("Inside standard call")
    if (!keyboardSession) return
    return new Promise((resolve) => {
      this.showKeyboardUi(keyboardSession, false, resolve)
      providerSession.focus()
    })
  }

  email(keyboardSession, providerSession) {
    this.LOG("Inside email call")
    if (!keyboardSession) return
    return new Promise((resolve) => {
      this.showKeyboardUi(keyboardSession, false, resolve)
      providerSession.focus()
    })
  }

  password(keyboardSession, providerSession) {
    this.LOG("Inside password call")
    if (!keyboardSession) return
    return new Promise((resolve) => {
      this.showKeyboardUi(keyboardSession, true, resolve)
      providerSession.focus()
    })
  }

  async showKeyboardUi(session, mask, responder) {
    if (!session) return
    this.LOG('Got session ' + JSON.stringify(session), "showKeyboardUi")
    this.LOG("Displaying Keyboard overlay with: " + GLOBALS.selfClientName)
    let params = { message: session.message, type: session.type, responder }
    thunder.call('org.rdk.RDKShell', 'setVisibility', { client: GLOBALS.selfClientName, visible: true }).then(() => {
      Router.navigate("settings/other/KeyboardScreen", params)
    })
  }
}
