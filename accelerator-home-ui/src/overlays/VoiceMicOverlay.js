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
      Glow: {
        w: 128,
        h: 128,
        mount: 0.5,
        rect: true,
        alpha: 0,
        color: CONFIG.theme.hex,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 64 },
      },
      Orbit: {
        mount: 0.5,
        alpha: 0,
        Dot: {
          x: 70,
          w: 10,
          h: 10,
          mount: 0.5,
          rect: true,
          color: CONFIG.theme.hex,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 5 },
        },
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
    this._sessionColor = CONFIG.theme.hex
    this._streamColor = 0xFF1E90FF

    this._sessionPulseAnimation = this.tag('Ring').animation({
      duration: 1.2,
      repeat: -1,
      stopMethod: 'immediate',
      actions: [
        { p: 'scale', v: { 0: 1, 0.5: 1.14, 1: 1 } },
        { p: 'alpha', v: { 0: 1, 0.5: 0.72, 1: 1 } },
      ],
    })

    this._streamPulseAnimation = this.tag('Ring').animation({
      duration: 0.55,
      repeat: -1,
      stopMethod: 'immediate',
      actions: [
        { p: 'scale', v: { 0: 1, 0.45: 1.28, 1: 1 } },
        { p: 'alpha', v: { 0: 1, 0.45: 0.45, 1: 1 } },
      ],
    })

    this._glowAnimation = this.tag('Glow').animation({
      duration: 0.9,
      repeat: -1,
      stopMethod: 'immediate',
      actions: [
        { p: 'scale', v: { 0: 0.92, 0.5: 1.12, 1: 0.92 } },
        { p: 'alpha', v: { 0: 0.12, 0.5: 0.28, 1: 0.12 } },
      ],
    })

    this._orbitAnimation = this.tag('Orbit').animation({
      duration: 1.2,
      repeat: -1,
      stopMethod: 'immediate',
      actions: [
        { p: 'rotation', v: { 0: 0, 1: 6.283 } },
        { p: 'alpha', v: { 0: 0.3, 0.5: 0.9, 1: 0.3 } },
      ],
    })
  }

  show() {
    this.patch({ smooth: { alpha: [1, { duration: 0.3 }] } })
  }

  _applyColor(color) {
    this.tag('Ring').color = color
    this.tag('Glow').color = color
    this.tag('Orbit.Dot').color = color
  }

  showSession() {
    this._applyColor(this._sessionColor)
    this._streamPulseAnimation.stop()
    this._glowAnimation.stop()
    this._orbitAnimation.stop()
    this.tag('Glow').alpha = 0
    this.tag('Orbit').alpha = 0
    this._sessionPulseAnimation.start()
    this.show()
  }

  setStreaming(isStreaming) {
    if (isStreaming) {
      this._applyColor(this._streamColor)
      this._sessionPulseAnimation.stop()
      this._streamPulseAnimation.start()
      this._glowAnimation.start()
      this._orbitAnimation.start()
      return
    }

    this._applyColor(this._sessionColor)
    this._streamPulseAnimation.stop()
    this._glowAnimation.stop()
    this._orbitAnimation.stop()
    this.tag('Glow').alpha = 0
    this.tag('Orbit').alpha = 0
    this._sessionPulseAnimation.start()
  }

  hide() {
    this._sessionPulseAnimation.stop()
    this._streamPulseAnimation.stop()
    this._glowAnimation.stop()
    this._orbitAnimation.stop()
    this.tag('Glow').alpha = 0
    this.tag('Orbit').alpha = 0
    this.patch({ smooth: { alpha: [0, { duration: 0.3 }] } })
  }
}
