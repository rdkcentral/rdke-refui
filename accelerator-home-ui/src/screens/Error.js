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
import { Lightning, Router } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config'

export default class Error extends Lightning.Component {
  static _template() {
    return {
      rect: true,
      w: 1920,
      h: 1080,
      color: 0xffb70606,
      InvalidText: {
        x: 960,
        y: 540,
        mount: 0.5,
        text: {
          text: 'Invalid Route',
          textColor: 0xff000000,
          fontFace: CONFIG.language.font,
          fontSize: 70,
          fontStyle: 'bold'
        },
        SubText: {
          y: 80,
          text: {
            text: 'Press OK to return home',
            textColor: 0xffffffff,
            fontFace: CONFIG.language.font,
            fontSize: 40,
            fontStyle: 'bold',
            textAlign: 'center'
          }
        }
      }
    }
  }

  _handleEnter() {
    Router.navigate('menu')
  }

  _focus() {
    console.log('focus error page')
  }

  pageTransition() {
    return 'up'
  }
}
