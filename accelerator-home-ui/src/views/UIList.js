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

import { Lightning, Router, Utils } from "@lightningjs/sdk";
import { List } from "@lightningjs/ui";
import HomeApi from '../api/HomeApi';
import Item from "../items/item";

const homeApi = new HomeApi()

export default class UIList extends Lightning.Component {
    static _template() {
        return {
            w: 1920,
            h: 1080,
            src: Utils.asset('images/splash/Splash-Background.jpg'),
            UI: {
                x: 200,
                y: 465,
                type: List,
                spacing: 20,
                direction: 'row',
                scroll: {
                    after: 4,
                }
            }
        }
    }

    pageTransition() {
        return 'right'
    }

    _firstEnable() {
        this.tag('UI').add(homeApi.getUIInfo().map((element, idx) => {
            return {
                ref: 'UI' + idx,
                w: 300,
                h: 150,
                type: Item,
                item: element,
                focus: 1.11,
                unfocus: 1,
                idx: idx,
                bar: 12
            }
        }))
    }

    _getFocused() {
        return this.tag('UI')
    }

    _handleEnter() {
        if (this.tag('UI').currentItem._item.title != 'DEFAULT') {
            console.log('Redirect to url')
            return
        }
        Router.navigate('menu')
    }
}
