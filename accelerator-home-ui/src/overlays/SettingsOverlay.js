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
import { Lightning, Utils, Language, Router, Storage } from "@lightningjs/sdk";
import { COLORS } from "../colors/Colors";
import SettingsMainItem from "../items/SettingsMainItem";
import { CONFIG, GLOBALS } from "../Config/Config";
import DTVApi from "../api/DTVApi";
import AppApi from "../api/AppApi";
import RDKShellApis from "../api/RDKShellApis";
import AudioScreenOverlay from './AudioScreens/AudioScreenOverlay'
import VideoScreenOverlay from './AudioScreens/VideoScreenOverlay';
import NetworkConfigurationOverlay from "./NetworkScreens/NetworkConfigurationOverlay";
import BluetoothScreenOverlay from './NetworkScreens/BluetoothScreenOverlay'
import LiveTvSettings from './LiveTvSettings/LiveTvSettingsOverlay'
import ThunderJS from 'ThunderJS';
import OtherSettingsScreen from "./OtherSettings/OtherSettingsOverlay";
import { Metrics } from "@firebolt-js/sdk";

var thunder = ThunderJS(CONFIG.thunderConfig);
/**
 * Class for settings screen.
 */
export default class SettingsOverlay extends Lightning.Component {
  static _template() {
    return {
      Wrapper: {
        rect: true,
        color: 0xcc000000,
        w: 1920,
        h: 1080,
        visible: false,
        BreadCrumbs: {
          x: 200,
          y: 184,
          text: {
            fontSize: 40,
            text: Language.translate("settings"),
            textColor: CONFIG.theme.hex,
            fontStyle: "bolder",
            fontFace: CONFIG.language.font,
            wordWrapWidth: 1720,
            maxLines: 1,
          },
        },
        SettingsScreenContents: {
          x: 200,
          y: 275,
          NetworkConfiguration: {
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Network Configuration"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
          Bluetooth: {
            y: 90,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Pair Remote Control"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
          Video: {
            y: 180,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Video"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
          Audio: {
            y: 270,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Audio"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
          OtherSettings: {
            y: 360,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Other Settings"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
          NFRStatus: {
            y: 450,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate('Native Frame Rate'),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              }
            },
            Button: {
              h: 45,
              w: 67,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset('images/settings/ToggleOffWhite.png'),
            },
          },

          DTVSettings: {
            alpha: 0.3,
            y: 540,
            type: SettingsMainItem,
            Title: {
              x: 10,
              y: 45,
              mountY: 0.5,
              text: {
                text: Language.translate("Live TV"),
                textColor: COLORS.titleColor,
                fontFace: CONFIG.language.font,
                fontSize: 25,
              },
            },
            Button: {
              h: 45,
              w: 45,
              x: 1600,
              mountX: 1,
              y: 45,
              mountY: 0.5,
              src: Utils.asset("images/settings/Arrow.png"),
            },
          },
        },
        AudioScreenOverlay: {
          type: AudioScreenOverlay,
          visible: false,
        },
        NetworkConfigurationOverlay: {
          type: NetworkConfigurationOverlay,
          visible: false,
        },
        BluetoothScreenOverlay: {
          type: BluetoothScreenOverlay,
          visible: false
        },
        LiveTvSettings: {
          type: LiveTvSettings,
          visible: false
        },
        VideoScreenOverlay: {
          type: VideoScreenOverlay,
          visible: false,
        },
        OtherSettingsScreen: {
          type: OtherSettingsScreen,
          visible: false
        }
      }
    };
  }

  _focus() {
    this.tag("Wrapper").visible = true;
    this._setState("NetworkConfiguration");
    this.$updatePageTitle("settings"); //use this method as fireancestor from child components to change the page title
  }
  _unfocus() {
    this.tag("Wrapper").visible = false;
  }
  _firstActive() {
    if (Storage.get("NFRStatus")) {
      console.log(`Netflix : NFRStatus is found to be enabled`)
      this.tag("NFRStatus.Button").src = "static/images/settings/ToggleOnOrange.png"
    }
    else {
      console.log(`Netflix : NFRStatus is found to be disabled`)
      this.tag("NFRStatus.Button").src = "static/images/settings/ToggleOffWhite.png"
    }
    this.appApi = new AppApi();
    this.dtvApi = new DTVApi();
    this.dtvPlugin = false; //plugin availability
    if (Storage.get("deviceType") != "IpStb") {
      this.dtvApi.activate().then(() => {
        this.dtvPlugin = true;
        this.tag("DTVSettings").alpha = 1;
      });
    }
  }

  _handleBack() {
    console.log("application Type = ", GLOBALS.topmostApp);
    if (GLOBALS.topmostApp === GLOBALS.selfClientName) {
      if (Router.getActiveHash() === "player" || Router.getActiveHash() === "dtvplayer" || Router.getActiveHash() === "usb/player") {
        Router.focusPage();
      } else {
        Router.focusPage();
        Router.navigate("menu");
      }
    } else {
      Router.focusPage();
      RDKShellApis.setVisibility(GLOBALS.selfClientName, false);
      RDKShellApis.setFocus(GLOBALS.topmostApp);
    }
  }

  _handleLeft() {
    //do nothing
  }
  _handleRight() {
    //do nothing
  }
  _handleUp() {
    //do nothing
  }
  _handleDown() {
    //do nothing
  }

  $updatePageTitle(title, alreadyTranslated) {
    console.log("title", title)
    if (alreadyTranslated) {
      this.tag("BreadCrumbs").text.text = title;
    } else {
      this.tag("BreadCrumbs").text.text = Language.translate(title);
    }
  }

  hide() {
    this.tag('SettingsScreenContents').visible = false

  }

  show() {
    this.tag('SettingsScreenContents').visible = true
  }
  $hideBreadCrum() {
    this.tag("BreadCrumbs").visible = false;
  }
  $showBreadCrum() {
    this.tag("BreadCrumbs").visible = true;
  }

  static _states() {
    return [
      class NetworkConfiguration extends this {
        $enter() {
          this.tag("NetworkConfiguration")._focus();
        }
        $exit() {
          this.tag("NetworkConfiguration")._unfocus();
        }
        _handleDown() {
          this._setState("Bluetooth");
        }
        _handleEnter() {
          this._setState('NetworkConfigurationOverlay')
        }
      },
      class Bluetooth extends this {
        $enter() {
          this.tag("Bluetooth")._focus();
        }
        $exit() {
          this.tag("Bluetooth")._unfocus();
        }
        _handleUp() {
          this._setState("NetworkConfiguration");
        }
        _handleDown() {
          this._setState("Video");
        }
        _handleLeft() { }
        _handleEnter() {
          this._setState("BluetoothScreenOverlay")
        }
      },

      class Video extends this {
        $enter() {
          this.tag("Video")._focus();
        }
        $exit() {
          this.tag("Video")._unfocus();
        }
        _handleUp() {
          this._setState("Bluetooth");
        }
        _handleDown() {
          this._setState("Audio");
        }
        _handleEnter() {
          this._setState('VideoScreenOverlay')
        }
      },

      class Audio extends this {
        $enter() {
          this.tag("Audio")._focus();
        }
        $exit() {
          this.tag("Audio")._unfocus();
        }
        _handleUp() {
          this._setState("Video");
        }
        _handleEnter() {
          this._setState('AudioScreenOverlay')
        }
        _handleDown() {
          this._setState("OtherSettings");
        }
      },

      class OtherSettings extends this {
        $enter() {
          this.tag("OtherSettings")._focus();
        }
        $exit() {
          this.tag("OtherSettings")._unfocus();
        }
        _handleUp() {
          this._setState("Audio");
        }
        _handleEnter() {
          this._setState("OtherSettingsScreen")
        }
        _handleDown() {
          this._setState("NFRStatus")
        }
      },
      class NFRStatus extends this{
        $enter() {
          this.tag('NFRStatus')._focus()
        }
        $exit() {
          this.tag('NFRStatus')._unfocus()
        }
        _handleUp() {
          this._setState('OtherSettings')
        }
        _handleDown() {
          if (this.dtvPlugin) {
            this._setState('DTVSettings')
          }
        }
        _handleEnter() {
          //handle Switch
          let self = this;
          if (Storage.get("NFRStatus")) {

            thunder.call("Netflix.1", "nfrstatus", { "params": "disable" }).then(nr => {
              self.tag("NFRStatus.Button").src = "static/images/settings/ToggleOffWhite.png"
              Storage.set("NFRStatus", false)
              console.log(`Netflix : nfr disable updation results in ${nr}`)
            }).catch(nerr => {
              console.error(`Netflix : error while updating nfrstatus`)
              Metrics.error(Metrics.ErrorType.OTHER,"PluginError", "Thunder Netflix.1 error disabling nfrstatus "+JSON.stringify(nerr), false, null)
              console.error(nerr)
            })

          }
          else {

            thunder.call("Netflix.1", "nfrstatus", { "params": "enable" }).then(nr => {
              self.tag("NFRStatus.Button").src = "static/images/settings/ToggleOnOrange.png"
              Storage.set("NFRStatus", true)
              console.log(`Netflix : nfr enable results in ${nr}`)
            }).catch(nerr => {
              console.error(`Netflix : error while updating nfrstatus `)
              Metrics.error(Metrics.ErrorType.OTHER,"PluginError", "Thunder Netflix.1 error enabling nfrstatus "+JSON.stringify(nerr), false, null)
              console.error(nerr)
            })

          }

        }
      },


      class DTVSettings extends this {
        $enter() {
          this.tag("DTVSettings")._focus();
        }
        $exit() {
          this.tag("DTVSettings")._unfocus();
        }
        _handleUp() {
          this._setState('NFRStatus')
        }
        _handleEnter() {
          if (this.dtvPlugin) {
            this._setState("LiveTvSettings")
          }
          DTVApi.activate().then(res => {
            this.tag('DTVSettings.Title').text.text = 'DTV Settings: Activtion' + res
          })
        }
      },
      class AudioScreenOverlay extends this {
        $enter() {
          this.hide()
          this.tag('AudioScreenOverlay').visible = true
          this.$updatePageTitle('Settings  Audio')
        }
        _getFocused() {
          return this.tag('AudioScreenOverlay')
        }
        $exit() {
          this.show()
          this.tag('AudioScreenOverlay').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState("Audio");
        }
      },
      class VideoScreenOverlay extends this {
        $enter() {
          this.hide()
          this.tag('VideoScreenOverlay').visible = true
          this.$updatePageTitle('Settings  Video')
        }
        _getFocused() {
          return this.tag('VideoScreenOverlay')
        }
        $exit() {
          this.show()
          this.tag('VideoScreenOverlay').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState('Video')
        }
      },
      class NetworkConfigurationOverlay extends this{
        $enter() {
          this.hide()
          this.tag('NetworkConfigurationOverlay').visible = true
          this.$updatePageTitle("Settings  Network Configuration")
        }
        _getFocused() {
          return this.tag('NetworkConfigurationOverlay')
        }
        $exit() {
          this.show()
          this.tag('NetworkConfigurationOverlay').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState("NetworkConfiguration")
        }
      },
      class BluetoothScreenOverlay extends this {
        $enter() {
          this.hide()
          this.tag('BluetoothScreenOverlay').visible = true
          this.$updatePageTitle('Settings  Bluetooth On/Off')
        }
        _getFocused() {
          return this.tag('BluetoothScreenOverlay')
        }
        $exit() {
          this.show()
          this.tag('BluetoothScreenOverlay').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState('Bluetooth')
        }
      },
      class OtherSettingsScreen extends this {
        $enter() {
          this.hide()
          this.tag('OtherSettingsScreen').visible = true
          this.$updatePageTitle('Settings  Other Settings')
        }
        _getFocused() {
          return this.tag('OtherSettingsScreen')
        }
        $exit() {
          this.show()
          this.tag('OtherSettingsScreen').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState('OtherSettings')
        }
      },
      class LiveTvSettings extends this {
        $enter() {
          this.hide()
          this.tag('LiveTvSettings').visible = true
          this.$updatePageTitle("Settings / Live TV")
        }
        _getFocused() {
          return this.tag('LiveTvSettings')
        }
        $exit() {
          this.show()
          this.tag('LiveTvSettings').visible = false
          this.$updatePageTitle('Settings')
        }
        _handleBack() {
          this._setState('DTVSettings')
        }
      },
    ];
  }
}
