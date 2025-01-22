import { Lightning, Router } from "@lightningjs/sdk"
import { CONFIG } from "../../Config/Config"
import { COLORS } from "../../colors/Colors.js"

export default class VideoInfoChange extends Lightning.Component {

    static _template() {
        return {
            w: 1920,
            h: 340,
            y:-340,
            Background: {
                rect: true,
                y: 0,//-340,
                w: 1920,
                h: 340,
                clipping: true,
                colorTop: 0xAA000000,
                colorBottom: 0xDD000000,
            },
            Title: {
                zIndex: 1,
                x: w => w / 2,
                y: h => h / 2,
                mountY: 0.5,
                mountX: 0.5,
                text: {
                    text: "ZZZZ", //Language.translate('New Video Format : '),
                    textColor: COLORS.titleColor,
                    fontFace: CONFIG.language.font,
                    fontSize: 25,
                }
            },
        }
    }

    clear(){
        this.patch({
            smooth: {
              y: -340
            }
          })
        this.tag("Title").text.text = "YYYY"
        Router.focusPage();
        if(this.timer){
            clearTimeout(this.timer)
            this.timer = null;
        }
    }

    update(data , append = false){
        if(append){
            let txt = this.tag("Title").text.text
            txt += "\n" + data
            this.tag("Title").text.text = txt
            console.log("write request recieved with data " , data)
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                Router.focusPage();
                self.clear()
             }, 3000)
        }
        else{
            console.log("update request recieved with the data " , data)
            this.tag("Title").text.text = data
        }
    }

    _focus() {
        this.patch({
            smooth: {
              y: 0
            }
          })

        let self = this;
        if(this.timer){
           clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
           Router.focusPage();
           self.clear()
        }, 3000)
    }

    _handleKey() {
        clearTimeout(this.timer)
        this.timer = null;
        this.clear()
        console.log("Widget handle kEy Trigger")
    }

}