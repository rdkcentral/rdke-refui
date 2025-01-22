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
import { Language, Lightning, Router, Storage } from '@lightningjs/sdk'
import SettingsItem from '../items/SettingsItem'
import AppApi from '../api/AppApi';
import RDKShellApis from '../api/RDKShellApis';
import ThunderJS from 'ThunderJS';
import { CONFIG, GLOBALS } from '../Config/Config'
import PersistentStoreApi from '../api/PersistentStore'

var appApi = new AppApi();
var thunder = ThunderJS(CONFIG.thunderConfig);

export default class SreenSaverScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Screen Saver'));
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            SleepTimer: {
                y: 275,
                x: 200,
                List: {
                    w: 1920 - 300,
                    type: Lightning.components.ListComponent,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -5,
                }
            }
        }
    }

    _firstEnable() {
        this.options = [
            { value: 'Off', tick: true },
            { value: '5 Minutes', tick: false },
            { value: '15 Minutes', tick: false },
            { value: '30 Minutes', tick: false },
            { value: '60 Minutes', tick: false }
        ]
        this.tag('List').h = this.options.length * 90
        let timeoutInterval = Storage.get('TimeoutInterval');
        if (!timeoutInterval) {
            timeoutInterval = 'Off'
        }
        let index = 0;
        this.tag('List').items = this.options.map((item, id) => {
            if (timeoutInterval === item.value) {
                index = id;
            }
            return {
                w: 1920 - 300,
                h: 90,
                type: SettingsItem,
                item: item.value
            }
        })
        this.tag('List').getElement(index).tag('Tick').visible = true
        this._setState('Options')
        // this.setTimerValue(this.timerValue);
    }

    async _focus() {
        let FocusedValue = await PersistentStoreApi.get().getValue('ScreenSaverTime', 'timerValue').then(result => {
            if (result && result.value !== undefined && result.value !== "Off") {
                return result.value;
            } else {
                return "Off";
            }
        }).catch(err => {
            console.error("App PersistentStoreApi getValue error: " + JSON.stringify(err));
            return "Off";
        });
        console.log("PersistentStoreApi focusedValue", FocusedValue);

        this.options = [
            { value: 'Off', tick: true },
            { value: '5 Minutes', tick: false },
            { value: '15 Minutes', tick: false },
            { value: '30 Minutes', tick: false },
            { value: '60 Minutes', tick: false }
        ]
        //let timeoutInterval = Storage.get('TimeoutInterval');
        if (!FocusedValue) {
            FocusedValue = 'Off'
        }
        let index = 0;
        this.tag('List').items = this.options.map((item, id) => {
            if (item.value.startsWith(FocusedValue)) {
                index = id;
            }
            return {
                w: 1920 - 300,
                h: 90,
                type: SettingsItem,
                item: item.value
            }
        })
        this.tag('List').getElement(index).tag('Tick').visible = true
        this._setState('Options')
    }

    _handleBack() {
        if (!Router.isNavigating()) {
            Router.navigate('settings/other')
        }
    }

    setTimerValue(time) {
        if (time === "Off" || time === undefined || time === null) {
            RDKShellApis.enableInactivityReporting(false).then(resp => console.log(resp))
            Storage.remove('ScreenSaverTimeoutInterval')
        }
        else {
            // 10
            RDKShellApis.enableInactivityReporting(true).then(() => {
                RDKShellApis.setInactivityInterval(parseInt(time)).then(res => {
                    console.log("setinactivityres", res)
                    Storage.set('ScreenSaverTimeoutInterval', time)
                    console.log(`successfully set the timer to ${time} minutes`)
                    thunder.on('org.rdk.RDKShell', 'onUserInactivity', notification => {
                        console.log("UserInactivityStatusNotification: ", JSON.stringify(notification))
                        appApi.getAvCodeStatus().then(result => {
                            console.log("Avdecoder", result.avDecoderStatus);
                            if ((result.avDecoderStatus === "IDLE" || result.avDecoderStatus === "PAUSE") && GLOBALS.topmostApp === GLOBALS.selfClientName) {
                                this.fireAncestors("$hideImage", 1);
                            }
                        })
                    })
                }).catch(err => {
                    console.error(`error while setting the timer` + JSON.stringify(err))
                });
            })
        }
    }

    static _states() {
        return [
            class Options extends this{
                _getFocused() {
                    return this.tag('List').element
                }
                _handleDown() {
                    this.tag('List').setNext()
                }
                _handleUp() {
                    this.tag('List').setPrevious()
                }
                async _handleEnter() {
                    this.options.forEach((element, idx) => {
                        this.tag('List').getElement(idx).tag('Tick').visible = false
                    });
                    this.tag('List').element.tag('Tick').visible = true
                    this.timerValue = this.options[this.tag('List').index].value//10 minutes
                    this.timerValue = this.timerValue === "Off" ? "Off" : this.timerValue.substring(0, 2) // 10
                    console.log("ScreenSaverTime Value:" + JSON.stringify(this.timerValue))
                    await PersistentStoreApi.get().setValue('ScreenSaverTime', 'timerValue', this.timerValue).catch(err => {
                        console.error("App PersistentStoreApi setValue error: " + JSON.stringify(err));
                    });
                    this.setTimerValue(this.timerValue);// enable and setinactivity process
                    this.fireAncestors('$screenSaverTime', this.options[this.tag('List').index].value)
                }
            }
        ]
    }
}
