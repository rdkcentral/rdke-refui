/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2026 RDK Management
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
import ThunderJS from 'ThunderJS';
import { CONFIG, GLOBALS } from '../Config/Config'

class AppAction {
    constructor() {
        if (AppAction._instance) {
            return AppAction._instance;
        }
        this.INFO = function () { }; // Disable INFO logs by default
        this.LOG = function () { }; // Disable LOG logs by default
        this.ERR = console.error;
        this.WARN = console.warn;
        this.logtag = 'AppActionApi: ';
        this.thunder = ThunderJS(CONFIG.thunderConfig);
        this.callsign = 'org.rdk.AppActions';
        AppAction._instance = this;
        this._eventCb = new Map();
        this.thunder.call('Controller', `status@${this.callsign}`).then(result => {
            if (result && result.length > 0 && result[0].state === 'activated') {
                this.thunder.on(this.callsign, 'onActionStartRequest', notification => {
                    this.LOG(`${this.logtag} onActionStartRequest received: ${JSON.stringify(notification)}`);
                    if (this._eventCb.has('onActionStartRequest')) {
                        this._eventCb.get('onActionStartRequest')(notification);
                    }
                });
            }
        }).catch(error => {
            this.ERR(`${this.logtag} getStatus error: ${error}`);
        });
    }

    static getInstance() {
        if (!AppAction._instance) {
            AppAction._instance = new AppAction();
        }
        return AppAction._instance;
    }

    register(callback) {
        this._eventCb.set('onActionStartRequest', callback);
    }

    unregister(callback) {
        if (callback) {
            if (this._eventCb.has('onActionStartRequest') && this._eventCb.get('onActionStartRequest') === callback) {
                this._eventCb.delete('onActionStartRequest');
            }
        } else {
            this.WARN(`${this.logtag} unregister - clearing all registered callbacks`);
            this._eventCb.clear();
        }
    }

    actionStart(intent, handlerAppId, initiator = GLOBALS?._selfclientAppName ?? '') {
        const param = { intent, handlerAppId, initiator };
        return this.thunder.call(this.callsign, 'actionStart', param).then(result => {
            this.LOG(`${this.logtag} actionStart result: ${JSON.stringify(result)}`);
            return result;
        }).catch(error => {
            this.ERR(`${this.logtag} actionStart error: ${error}`);
            throw error;
        });
    }
}

AppAction._instance = null;

export default AppAction;
