import { Language, Lightning } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";

export default class OptionsItem extends Lightning.Component {
    static _template() {
        return {
            Wrapper: {
                Text: {
                    text: {
                        text: '',
                        fontFace: CONFIG.language.font,
                        fontSize: 35,
                        wordWrap: false,
                        wordWrapWidth: 230,
                        fontStyle: "normal",
                        textOverflow: "ellipsis",
                    },
                },
                Bar: {
                    y: 50,
                    texture: Lightning.Tools.getRoundRect(0, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex),
                }
            },
        }
    }

    _focus() {
        this.tag('Bar').texture = Lightning.Tools.getRoundRect(this.tag('Text').finalW, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex)
        this.tag('Text').text.fontStyle = 'bold'
    }

    _unfocus() {
        this.tag('Bar').texture = Lightning.Tools.getRoundRect(0, 5, 0, 0, CONFIG.theme.hex, true, CONFIG.theme.hex)
        this.tag('Text').text.fontStyle = ''
    }

    static get width() {
        return 250
    }

    _handleEnter() {
        this.fireAncestors('$selectOption', this.idx, this)
        this._focus()
    }

    _handleDown(){
        this._handleEnter()
    }

    set element(item) {
        this.tag('Text').text.text = Language.translate(item);
        if(this.tag('Text').text.text.length > 11){
            this.tag('Text').text.fontSize = 25
        }
    }
}