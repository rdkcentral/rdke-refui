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

import { CONFIG } from "../Config/Config";

export default class Progress extends lng.Component {
    static _template() {
        let RR = lng.shaders.RoundedRectangle

        return {
            BackgroundOverlay: {
                rect: true,
                color: 0xFF000000,
                alpha: 0,
                w: 300,
                h: 168,
                x: -50,
                y:-80
            },
            Label: {
                x: 10, y: -28,
                text: {
                    fontSize: 18,
                    textColor: 0xFFFFFFFF
                }
            },
            ProgressBar: {
                Background: { x: -2, y: 0, w: 4, h: 12, rtt: true, rect: true, color: 0xFF666666, shader: { radius: 3, type: RR } },
                Progress: { x: 0, y: 0, w: 0, h: 10, rtt: true, rect: true, color: CONFIG.theme.hex, shader: { radius: 3, type: RR } },
            },
        }
    }

    getProgress() {
        return this.value
    }

    reset() {
        this.value = 0
        this.tag("Progress").w = 0
        this.tag("ProgressBar").alpha = 0.0
        this.tag("Label").text.text = ""
        this.tag("Label").alpha = 1.0
    }

    setProgress(pc, state) {
        this.percent=pc*100
        this.value = pc

        var ww = (this.w - 4) * pc
        if(pc != 1.0) {
            this.tag("BackgroundOverlay").alpha=0.6
            this.tag("ProgressBar").setSmooth('alpha', 0.7, {duration: .1})
            this.tag("Progress").setSmooth('w', ww, { duration: 1 })
        }

        if (state !== "") {
            this.tag("Label").text.text = state+" "+ Math.floor(this.percent) +"%"
        }

        if (pc == 1.0) {
            this.tag("ProgressBar").setSmooth('alpha', 0, {duration: 2.3})
            this.tag("Label").setSmooth('alpha', 0, {duration: 2.3})
            this.tag("BackgroundOverlay").setSmooth('alpha', 0, {duration: 1.5})
        }
    }

    _init() {
        this.tag("Background").w = this.w
        this.reset()
    }
}
