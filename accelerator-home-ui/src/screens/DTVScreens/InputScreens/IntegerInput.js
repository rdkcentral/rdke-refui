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

import { Lightning, Utils, Language } from "@lightningjs/sdk";
import { CONFIG } from "../../../Config/Config";
import keyMap from "../../../Config/Keymap";
import { COLORS } from "../../../colors/Colors";
import { Keyboard } from "../../../ui-components";
import { KEYBOARD_FORMATS } from "../../../ui-components/components/Keyboard";

export default class IntegerInput extends Lightning.Component {
  static _template() {
    return {
      x: 200,
      y: 275,
      InputBox: {
        Border: {
          texture: Lightning.Tools.getRoundRect(
            1600,
            90,
            0,
            3,
            0xffffffff,
            false
          ),
        },
        Arrows: {
          y: 50,
          visible:false,
          RightArrow: {
            h: 50,
            w: 50,
            x: 1600,
            mountX: 1,
            mountY: 0.5,
            color: 0xffffffff,
            src: Utils.asset("images/settings/Arrow.png"),
          },
          LeftArrow: {
            h: 50,
            w: 50,
            x: 0,
            mountX: 0,
            mountY: 0.5,
            scaleX:-1,
            color: 0xffffffff,
            src: Utils.asset("images/settings/Arrow.png"),
          },
        },
        Content: {
          x: 50,
          y: 50,
          mountY: 0.5,
          text: {
            text: Language.translate("Enter the value and click Done"),
            textColor: COLORS.titleColor,
            fontFace: CONFIG.language.font,
            fontSize: 25,
            wordWrap: false,
            wordWrapWidth: 1500,
            textOverflow: "ellipsis",
          },
        },
      },
      Keyboard: {
        x: 660,
        y: 200,
        type: Keyboard,
        visible: true,
        zIndex: 2,
        formats: KEYBOARD_FORMATS.numbers,
      },
    };
  }

  _init() {
    this.numKeyCodes = [keyMap["0"], keyMap["1"], keyMap["2"], keyMap["3"], keyMap["4"], keyMap["5"], keyMap["6"], keyMap["7"], keyMap["8"],keyMap["9"]]
    //console.log(this.numKeyCodes) // above array order is importent as index is used as numeric value
  }

  _focus() {
    this._setState("InputBox");
    this.tag("Content").text.text =
      this.prevVal === "" ? Language.translate("Enter the value and click Done") : this.prevVal;
    this.inputValue = this.prevVal;
    console.log("presetValues: ",this.presetValues)
    this.presetValuesLength = 0;
    this.presetIdx = -1; //to accomodate previous value of the input field
    if(Array.isArray(this.presetValues)){
      this.presetValuesLength = this.presetValues.length;
      console.log(this.presetValues, this.presetValuesLength)
      this.tag("Arrows").visible = true;
    } else {
      this.tag("Arrows").visible = false;
    }
  }

  handleDone() {
    // console.log(this.inputValue);
    this.onHandleDone(this.inputValue);
  }

  _handleKey(key) {
    let keyValue = this.numKeyCodes.indexOf(key.keyCode) //index is used as value for numeric keys
    if( keyValue >=0){
      this.inputValue += String(keyValue);
      this.tag("Content").text.text = this.inputValue;
    }else {
      return false; //to pass on other keys such as handleBack
    }
  }

  static _states() {
    return [
      class InputBox extends this {
        $enter() {
          this.tag("InputBox.Border").texture = Lightning.Tools.getRoundRect(
            1600,
            90,
            0,
            3,
            CONFIG.theme.hex,
            false
          );
          this.tag("RightArrow").color = CONFIG.theme.hex;
          this.tag("LeftArrow").color = CONFIG.theme.hex;
        }
        $exit() {
          this.tag("InputBox.Border").texture = Lightning.Tools.getRoundRect(
            1600,
            90,
            0,
            3,
            0xffffffff,
            false
          );
          this.tag("RightArrow").color = 0xffffffff;
          this.tag("LeftArrow").color = 0xffffffff;
        }

        _handleDown() {
          this._setState("Keyboard");
        }
        _handleEnter() {
          this._setState("Keyboard");
        }
        _handleLeft() {
          if(this.presetValuesLength > 0){
            if (this.presetIdx <= 0 ){
              this.presetIdx = this.presetValuesLength - 1;
            } else {
              this.presetIdx -= 1 ;
            }
            this.inputValue = this.presetValues[this.presetIdx];
            this.tag("Content").text.text = this.inputValue;
          }
        }
        _handleRight() {
          if(this.presetValuesLength > 0){
            if (this.presetIdx === this.presetValuesLength - 1 || this.presetIdx < 0){
              this.presetIdx = 0;
            } else {
              this.presetIdx += 1 ;
            }
            this.inputValue = this.presetValues[this.presetIdx];
            this.tag("Content").text.text = this.inputValue;
          }
        }
        _handleUp() {
          // do nothing
        }
      },
      class Keyboard extends this {
        _handleDown() {
          // do nothing
        }
        _handleUp() {
          this._setState("InputBox");
        }
        _getFocused() {
          return this.tag("Keyboard");
        }
        _handleBack() {
          this._setState("InputBox");
        }

        $onSoftKey({ key }) {
          if (key === "Done") {
            this.handleDone();
          } else if (key === "Clear") {
            this.inputValue = this.inputValue.substring(
              0,
              this.inputValue.length - 1
            );
          } else if (key === "Delete") {
            this.inputValue = "";
          } else {
            this.inputValue += key;
          }

          this.tag("Content").text.text = this.inputValue;
        }
      },
    ];
  }
}
