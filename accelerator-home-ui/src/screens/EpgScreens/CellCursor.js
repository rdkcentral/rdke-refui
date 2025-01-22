
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

import { Lightning } from "@lightningjs/sdk";
import { CONFIG } from "../../Config/Config";
export default class CellCursor extends Lightning.Component {
    static _template() {
        return {
            zIndex: 5,
            UpperLine: {
                x: 0,
                y: 0,
                rect: true,
                w: 236,
                h: 2,
                color: CONFIG.theme.hex
            },
            LowerLine: {
                x: 0,
                y: 79,
                rect: true,
                w: 236,
                h: 2,
                color: CONFIG.theme.hex
            }
            // texture:Lightning.Tools.getRoundRect(236 ,81,0,1,0xffFFFFFF,true,0x0000ffff) // if you change this then you may wanna change the part where it patches itself too.
        }
    }

    patchCursor(x, y, w) {
        this.tag("UpperLine").patch({ smooth: { x: x, y: y, w: w-3 } });
        this.tag("LowerLine").patch({ smooth: { x: x, y: y + 79, w: w-3 } });
    }
}