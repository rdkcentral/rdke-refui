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
import ThunderJS from "ThunderJS";
import { Storage } from '@lightningjs/sdk';
import Keymap from "../Config/Keymap";
import { CONFIG, GLOBALS } from "../Config/Config";
import {Metrics} from '@firebolt-js/sdk'

const thunder = ThunderJS(CONFIG.thunderConfig);

export function keyIntercept(clientName = GLOBALS.selfClientName) {
    return new Promise((resolve, reject) => {
        thunder.call('org.rdk.RDKShell', 'addKeyIntercepts',
            {
                "intercepts": [{
                    "client": clientName, "keys": [
                        { "keyCode": Keymap.Home, "modifiers": [] },
                        { "keyCode": Keymap.AudioVolumeDown, "modifiers": [] },
                        { "keyCode": Keymap.AudioVolumeUp, "modifiers": [] },
                        { "keyCode": Keymap.AudioVolumeMute, "modifiers": [] },
                        { "keyCode": Keymap.Inputs_Shortcut, "modifiers": [] },
                        { "keyCode": Keymap.Picture_Setting_Shortcut, "modifiers": [] },
                        { "keyCode": Keymap.Youtube, "modifiers": [] },
                        { "keyCode": Keymap.Power, "modifiers": [] },
                        { "keyCode": Keymap.Amazon, "modifiers": [] },
                        { "keyCode": Keymap.Netflix, "modifiers": [] },
                        { "keyCode": Keymap.Settings_Shortcut, "modifiers": [] },
                        { "keyCode": Keymap.Guide_Shortcut, "modifiers": [] },
                        { "keyCode": Keymap.AppCarousel, "modifiers": [] }
                    ]
                }]
            }
        ).then(result => {
            if (result.success) resolve(result.success);
            reject(result);
        }).catch(err => {
            Metrics.error(Metrics.ErrorType.OTHER,"KeyInterceptError", "Thunder RDKShell addKeyIntercepts error "+JSON.stringify(err), false, null)
            reject(err);
        });
    });
}
