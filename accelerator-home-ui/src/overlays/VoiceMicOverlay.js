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
import { Lightning, Utils } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config'

/**
 * VoiceMicOverlay
 *
 * Displays a mic icon with a pulsing blue ring animation while a voice
 * audio session is active and the ResidentApp is in the foreground.
 * Show by calling show(), hide by calling hide().
 */
export default class VoiceMicOverlay extends Lightning.Component {
  static _template() {
    return {
      alpha: 0,
      // Bottom-right corner, above all other content
      x: 1820,
      y: 940,
      zIndex: 1000,
      // Outer pulsing blue ring
      Ring: {
        w: 100,
        h: 100,
        mount: 0.5,
        rect: true,
        color: CONFIG.theme.hex,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 50 },
      },
      // Mic icon centred on the ring
      MicIcon: {
        w: 56,
        h: 56,
        mount: 0.5,
        src: Utils.asset('images/topPanel/microphone.png'),
      },
    }
  }

  _init() {
    this._pulseAnimation = this.tag('Ring').animation({
      duration: 1,
      repeat: -1,
      stopMethod: 'immediate',
      actions: [
        { p: 'scale', v: { 0: 1, 0.5: 1.25, 1: 1 } },
        { p: 'alpha', v: { 0: 1, 0.5: 0.5, 1: 1 } },
      ],
    })
  }

  show() {
    this._pulseAnimation.start()
    this.patch({ smooth: { alpha: [1, { duration: 0.3 }] } })
  }

  hide() {
    this._pulseAnimation.stop()
    this.patch({ smooth: { alpha: [0, { duration: 0.3 }] } })
  }
}
