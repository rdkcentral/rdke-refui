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
import { Lightning, Utils } from "@lightningjs/sdk"

export default class PasswordSwitch extends Lightning.Component {
    static _template() {
        return {
            src: Utils.asset('images/settings/ToggleOffWhite.png'),
        }
    }
    _handleEnter() {
        if (this.isOn) {
            this.patch({ src: Utils.asset("images/settings/ToggleOffWhite.png") })
        } else {
            this.patch({ src: Utils.asset("images/settings/ToggleOnOrange.png") });
        }
        this.isOn = !this.isOn;
        this.fireAncestors('$handleEnter', this.isOn);
    }
    _init() {
        this.isOn = false;
    }

    _disable() {
        if (this.isOn) {
            this.isOn = false
            this.patch({ src: Utils.asset("images/settings/ToggleOffWhite.png") })
            this.fireAncestors('$handleEnter', this.isOn);
        }
    }
}