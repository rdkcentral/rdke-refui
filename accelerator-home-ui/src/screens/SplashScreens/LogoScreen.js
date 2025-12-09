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

import { Lightning, Utils, Router, Storage, Registry } from '@lightningjs/sdk'
import BluetoothApi from '../../api/BluetoothApi'
import Failscreen from '../FailScreen';
import AppApi from '../../api/AppApi';
var appApi = new AppApi();
let path = '';

export default class LogoScreen extends Lightning.Component {
    constructor(...args) {
        super(...args);
        this.INFO = console.info;
        this.LOG = console.log;
        this.ERR = console.error;
        this.WARN = console.warn;
    }

    static _template() {
        return {
            rect: true,
            color: 0xff000000,
            w: 1920,
            h: 1080,
            Logo: {
                mount: 0.5,
                x: 960,
                y: 540,
                src: Utils.asset('/images/splash/RDKLogo.png'),
            },
            Sub: {
                mountY: 1,
                mountX: 0.5,
                x: 960,
                y: 1000,
                w: 216,
                h: 121,
                src: Utils.asset('/images/splash/gracenote.png')
            },
            Error:{
                alpha :0,
                type: Failscreen,
                timerVisible : false
            }
        }
    }

    pageTransition() {
        return 'right'
    }

    async _init() {
        this.btApi = new BluetoothApi()
        await this._performInitialization()
    }
    async _performInitialization() {
        try {
            await appApi.getPluginStatus("org.rdk.Bluetooth").then(this._isBluetoothExist = true);
        } catch (err) {
            this._isBluetoothExist = false;
        }        
        try {
            await appApi.getPluginStatus("org.rdk.RemoteControl").then(this._isRCcontrolExist = true);
        } catch (err) {
            this._isRCcontrolExist = false;
        }
        this.LOG("Init completed - Bluetooth exists:", this._isBluetoothExist, "RC exists:", this._isRCcontrolExist);
    }

    checkPath(path) {
        if (path === 'ui') {
            return 'ui'
        }
        return 'menu'
    }

    _firstEnable() {
        console.timeEnd('PerformanceTest')
        this.LOG('Splash Screen timer end - ' + JSON.stringify(new Date().toUTCString()))
    }

    async _focus() {
        path = ((Storage.get('setup') === true) ? 'menu' : 'splash/bluetooth')
        var map = { 37: false, 38: false, 39: false, 40: false };
        this.handler = (e) => {
            if (e.keyCode in map) {
                map[e.keyCode] = true;
                if (map[37] && map[38] && map[39] && map[40]) {
                    path = 'ui'
                }
            }
        }
        Registry.addEventListener(document, 'keydown', this.handler)

        if(Storage.get('setup') === true) {
            this._setState('Next')
            return true;
        }

        if(!this._isBluetoothExist && !this._isRCcontrolExist) {
            this.tag('Error').notify({
                'title' : "Remote control plugin and Bluetooth plugin are not found",
                'msg': 'Click to proceed','count':0
            })
            this.tag('Error').isButtonVisible('OK', true)
            this.tag('Error').alpha = 1
            this._setState('Ok')
        } else {
            if(this._isBluetoothExist) {
                await this.btApi.btactivate().then(res => { this.LOG("successfully btactivated" + JSON.stringify(res)) })
                .catch(err => this.ERR("error in btactivate" + JSON.stringify(err)))
                this.btApi.getPairedDevices().then(devices => {
                    if (devices.length > 0 || Storage.get('setup')) {
                        path = this.checkPath(path)
                    }
                })
                .catch((err) => {
                    path = this.checkPath(path)
                    this.ERR("getPairedDevices error: " + JSON.stringify(err))
                })
            }
            this._setState('Next')
        }
    }
    _unfocus() {
        Registry.removeEventListener(document, 'keydown', this.handler)
    }
    _handleBack() {
        this.ERR("Initial page; cannot go back.");
    }

    static _states() {
        return [
        class Ok extends this {
           _handleEnter() {
               path = 'splash/language'
               this._setState('Next')
            }

           $exit() {
            this.tag('Error').alpha = 0
           }
        },
        class Next extends this {
            $enter() {
                setTimeout(() => {
                    Router.navigate(path)
                }, 5000)
            }
        }
    ]}
}
