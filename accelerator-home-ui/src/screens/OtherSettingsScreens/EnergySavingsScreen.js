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
import { Lightning, Router, Utils, Language } from '@lightningjs/sdk'
import AppApi from '../../api/AppApi';
import EnergySavingsItem from '../../items/EnergySavingsItem'



export default class EnergySavingsScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Energy Saver'));
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
            EnerygySavingContents: {
                x: 200,
                y: 275,
                List: {
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -6,
                },
                Loader: {
                    x: 740,
                    y: 340,
                    w: 90,
                    h: 90,
                    mount: 0.5,
                    zIndex: 4,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: true,
                },
            },
        }
    }

    $resetPrevTickObject(prevTicObject) {
        if (!this.prevTicOb) {
            this.prevTicOb = prevTicObject;

        }
        else {
            this.prevTicOb.tag("Item.Tick").visible = false;

            this.prevTicOb = prevTicObject;

        }
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings/other')
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
                _handleEnter() {
                    // this.tag("List").element.patch({ "Item.Tick.visible": true });
                    this.tag("List").element.tag("Tick").visible = true;
                    // enable the tick mark in VideoAudioItem.js
                    //to update the resolution value on Video Screen
                }
            }
        ]
    }
    _firstEnable() {
        this._appApi = new AppApi();
        this.options = [Language.translate("Deep Sleep"), Language.translate("Light Sleep")]
        this.tag('EnerygySavingContents').h = this.options.length * 90
        this.tag('EnerygySavingContents.List').h = this.options.length * 90
        this.loadingAnimation = this.tag('Loader').animation({
            duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
            actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
        })
    }
    _unfocus() {
        if (this.loadingAnimation.isPlaying()) {
            this.loadingAnimation.stop()
        }
    }
    _focus() {
        this.loadingAnimation.start()
        var standbyMode = ""
        this._appApi.getPreferredStandbyMode().then(result => {
            if (result.preferredStandbyMode == "LIGHT_SLEEP") {
                standbyMode = Language.translate("Light Sleep")
            } else if (result.preferredStandbyMode == "DEEP_SLEEP") {
                standbyMode = Language.translate("Deep Sleep")
            }

            this.tag('List').items = this.options.map((item, index) => {
                return {
                    ref: 'Option' + index,
                    w: 1920 - 300,
                    h: 90,
                    type: EnergySavingsItem,
                    isTicked: (standbyMode === item) ? true : false,
                    item: item,
                    energyItem: true,
                }
            })
            this.loadingAnimation.stop()
            this.tag('Loader').visible = false
            this._setState("Options")
        })
    }
}