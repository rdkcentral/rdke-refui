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
/**Color constants */

const themeOptions = {
  partnerOne: {
    hex: 0xfff58233,
    logo: 'RDKLogo.png',
    background: '0xff000000'
  },
  partnerTwo: {
    hex: 0xff91c848,
    logo: 'RDKLogo.png',
    background: '0xff000000'
  },
}

export const languages = {
  en: {
    id: 'en',
    fontSrc: 'Play/Play-Regular.ttf',
    font: 'Play'
  },
  es: {
    id: 'es',
    fontSrc: 'Play/Play-Regular.ttf',
    font: 'Play'
  },
}


export const availableLanguages = ['en', 'es'];
export const availableLanguageCodes = {
  "en": "en-US",
  "es": "es-US"
}

export var CONFIG = {
  theme: themeOptions['partnerOne'],
  language:localStorage.getItem('Language') != null ? localStorage.getItem('Language') :'en',
  thunderConfig: {
    host: '127.0.0.1',
    port: 9998,
    versions: {
      default: 1,
      'org.rdk.System': 2,
      ControlSettings: 2,
      'org.rdk.UsbAccess': 2,
      'org.rdk.DisplaySettings': 2,
    }
  }
}

export const GLOBALS = {
  _AlexaAvsstatus:false,
  _previousapp_onActiveSourceStatusUpdated:null,
  _previousapp_onDisplayConnectionChanged:null,
  _constantselfClientName: window.__firebolt && window.__firebolt.endpoint !== undefined ? "FireboltMainApp-refui" : "ResidentApp",
  get selfClientName() {
    return this._constantselfClientName;
  },
  _currentTopMostApp: localStorage.getItem('topmostApp') || (window.__firebolt && window.__firebolt.endpoint !== undefined ? "FireboltMainApp-refui" : "ResidentApp"),
  get topmostApp() {
    return this._currentTopMostApp;
  },
  set topmostApp(value) {
    this._currentTopMostApp = value;
    console.log('Setting current topmostApp as:' + this._currentTopMostApp);
  },
  set powerState(state){
    this._currentPowerState = state
  },
  get powerState() {
    return this._currentPowerState
  },
  set previousapp_onDisplayConnectionChanged(app){
    this._previousapp_onDisplayConnectionChanged = app
  },
  get previousapp_onDisplayConnectionChanged(){
    return this._previousapp_onDisplayConnectionChanged
  },
  set previousapp_onActiveSourceStatusUpdated(app){
    this._previousapp_onActiveSourceStatusUpdated = app
  },
  get previousapp_onActiveSourceStatusUpdated(){
    return this._previousapp_onActiveSourceStatusUpdated
  },
  set AlexaAvsstatus(status){
    this._AlexaAvsstatus=status
  },
  get AlexaAvsstatus(){
    return this._AlexaAvsstatus
  }

}
