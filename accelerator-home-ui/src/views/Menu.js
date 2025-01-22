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

import { Lightning, Router } from "@lightningjs/sdk"
import HomeApi from "../api/HomeApi"
import SidePanel from "./SidePanel"
import TopPanel from "./TopPanel"

var route = {
    1: () => {
        Router.navigate('epg')
        Router.focusPage()
    },
    3: () => {
        Router.navigate('apps')
        Router.focusPage()
    },
    'default': () => {
        Router.navigate('menu')
        Router.focusPage()
    }
}

export default class Menu extends Lightning.Component {
    static _template() {
        return {
            TopPanel: {
                type: TopPanel
            },
            SidePanel: {
                type: SidePanel
            }
        }
    }
    pageTransition() {
        return 'down'
    }
    _init() {
        this.homeApi = new HomeApi()
        this.tag('SidePanel').sidePanelItems = this.homeApi.getSidePanelInfo()
    }
    _focus() {
        if (!this.mainView) {
            this.mainView = Router.activePage()
        }
        this._setState('SidePanel')
    }
    _handleRight() {
        Router.focusPage()
    }
    $goToTopPanel() {
        this._setState('TopPanel')
        Router.focusWidget('Menu')

    }
    $goToSidePanel() {
        this._setState('SidePanel')
    }
    $goToMainView(sidePanelInstance, index) {
        if (route[index]) {
            route[index]()
        } else {
            route['default']()
        }
        sidePanelInstance.setColor()
        return
    }
    refreshMainView() {
        if (this.mainView) {
            this.mainView.refreshFirstRow()
        }
    }
    setIndex(index) {
        this.tag('SidePanel').index = index
    }
    notify(val) {
        if (val === 'TopPanel') {
            Router.focusWidget('Menu')
            this._setState('TopPanel')
        }
    }

    $scroll(val) {
        if (this.mainView) {
            this.mainView.scroll(val)
        }
    }
    updateTimeZone(timezone) {
        this.tag('TopPanel').changeTimeZone(timezone)
    }
    updateTopPanelText(text) {
        this.tag('TopPanel').changeText = text
    }
    static _states() {
        return [
            class SidePanel extends this{
                _getFocused() {
                    return this.tag('SidePanel')
                }
            },
            class TopPanel extends this{
                _getFocused() {
                    return this.tag('TopPanel')
                }
            }
        ]
    }
}
