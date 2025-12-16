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
  _MiracastNotificationstatus:false,
  _Wificonnectinprogress:false,
  _deviceType:null,
  _LastvisitedRoute:null,
  _Setup:null,
  _TofocusVOD:false,
  _AlexaAvsstatus:false,
  _RCSkipStatus:false,
  _IsinternetConnected:false,
  _Miracastclientdevicedetails:{mac: null,name: null,reason_code: null,state:null},
  _previousapp_onActiveSourceStatusUpdated:null,
  _previousapp_onDisplayConnectionChanged:null,
  _constantselfClientName: window.__firebolt && window.__firebolt.endpoint !== undefined ? "FireboltMainApp-refui" : "ResidentApp",
  _selfclientId: window.__firebolt && window.__firebolt.endpoint !== undefined ? "FireboltMainApp-refui" : null,
  _LocalDeviceDiscoveryStatus:false,
  get selfClientName() {
    return this._constantselfClientName;
  },
  set selfClientName(value) {
    this._constantselfClientName = value;
  },
  get selfClientId() {
    return this._selfclientId;
  },
  set selfClientId(value) {
   this._selfclientId = value;
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
  },
  set Miracastclientdevicedetails(params)
  {
    this._Miracastclientdevicedetails={mac:params.mac,name:params.name,reason_code:params.reason_code,state:params.state}
  },
  get Miracastclientdevicedetails()
  {
    return this._Miracastclientdevicedetails
  },
  set RCSkipStatus(status)
  {
    this._RCSkipStatus = status
  },
  get RCSkipStatus()
  {
    return this._RCSkipStatus
  },
  set IsConnectedToInternet(status)
  {
    this._IsinternetConnected =status
  },
  get IsConnectedToInternet()
  {
    return this._IsinternetConnected
  },
  set TofocusVOD(status)
  {
    this._TofocusVOD = status
  },
  get TofocusVOD()
  {
    return this._TofocusVOD
  },
  set LastvisitedRoute(route)
  {
    this._LastvisitedRoute = route
  },
  get LastvisitedRoute()
  {
    return this._LastvisitedRoute
  },
  set Wificonnectinprogress(state)
  {
    this._Wificonnectinprogress = state
  },
  get Wificonnectinprogress()
  {
    return this._Wificonnectinprogress
  },
  set Setup(status)
  {
    this._Setup = status
  },
  get Setup()
  {
    return this._Setup
  },
  set deviceType(type) {
	this._deviceType = type;
  },
  get deviceType() {
	return this._deviceType;
  },
  set MiracastNotificationstatus(status)
  {
    this._MiracastNotificationstatus = status
  },
  get MiracastNotificationstatus()
  {
    return this._MiracastNotificationstatus
  },
  set LocalDeviceDiscoveryStatus(status)
  {
    this._LocalDeviceDiscoveryStatus = status
  },
  get LocalDeviceDiscoveryStatus()
  {
    return this._LocalDeviceDiscoveryStatus
  }
}
