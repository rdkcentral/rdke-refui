import { Lightning, Router, Storage } from "@lightningjs/sdk";
import ListItem from "../items/ListItem";
import { List } from '@lightningjs/ui'
import HomeApi from "../api/HomeApi";
import AppApi from "../api/AppApi";
import RDKShellApis from "../api/RDKShellApis.js";
import { GLOBALS } from "../Config/Config.js";

export default class AppCarousel extends Lightning.Component {

  static _template() {
    return {
      rect: true,
      y: -340,
      w: 1920,
      h: 340,
      clipping: true,
      colorTop: 0xAA000000,
      colorBottom: 0xDD000000,
      AppList: {
        y: 24,
        x: 0,
        type: List,
        h: 400,
        scroll: {
          after: 2
        },
        spacing: 20,
      },
    }
  }

  set appItems(items) {
    // items.shift();
    this.currentItems = items
    this.tag('AppList').clear()
    this.tag('AppList').add(items.map((info, idx) => {
      return {
        w: 454,
        h: 220,
        type: ListItem,
        data: info,
        focus: 1.11,
        unfocus: 1,
        idx: idx,
        bar: 12
      }
    }))
  }

  _init() {
    this.homeApi = new HomeApi();
    this.appApi = new AppApi()
    this.metroApps = [

    ]
    this.premiumApps = [

    ]
    this.showcaseApps = [

    ]
  }
  async _focus() {
    let self = this
    console.log("self.homeApi.getAppListInfo()", self.homeApi.getAppListInfo());
    self.metroApps = self.homeApi.getOnlineMetroApps()
    self.premiumApps = self.homeApi.getAppListInfo()
    self.showcaseApps = self.homeApi.getShowCaseApps()
    let order = Storage.get("appCarouselOrder")
    console.log("order", order)
    let apps = []
    if (order) {
      let storedApps = order.split(",")
      storedApps.map(appIdentifier => {
        let index;
        if (appIdentifier.startsWith("s")) { // showcase apps
          index = appIdentifier.split(":")[1]
          apps.push(self.showcaseApps[index])
          self.showcaseApps[index] = -1
        }
        else if (appIdentifier.startsWith("n")) { // native apps
          index = appIdentifier.split(":")[1]
          apps.push(self.premiumApps[index])
          self.premiumApps[index] = -1
        }
        else if (appIdentifier.startsWith("m")) { // metro apps
          index = appIdentifier.split(":")[1]
          apps.push(self.metroApps[index])
          self.metroApps[index] = -1
        }
      })
      console.log("APPS ARRAY: ", apps)
      self.premiumApps.map(papp => {
        if (papp !== -1 && papp.uri != "USB") {
          apps.push(papp)
        }
      })

      self.metroApps.map(mapp => {
        if (mapp !== -1) {
          apps.push(mapp)
        }
      })

      self.showcaseApps.map(sapp => {
        if (sapp !== -1) {
          apps.push(sapp)
        }
      })

    }
    else {
      self.premiumApps = self.premiumApps.filter((e) => {
        if (e.uri == "USB") {
          return 0;
        }
        else {
          return e
        }
      })
      apps = [...self.premiumApps, ...self.showcaseApps, ...self.metroApps]
    }

    await this.homeApi.checkAppCompatability(apps).then(res => {
      apps = res
    })

    this.appItems = apps
    self._setState("AppList.0")
    this.patch({
      smooth: {
        y: 0
      }
    })

  }

  close() {
    this.patch({
      smooth: {
        y: -340
      }
    })
  }
  _unfocus() {
    console.log("unfocus")
    this.close();
  }

  _handleBack() {
    let self = this;
    if (GLOBALS.topmostApp !== GLOBALS.selfClientName) { // if a non-resident app is on focus
      RDKShellApis.moveToFront(GLOBALS.topmostApp)
      RDKShellApis.setFocus(GLOBALS.topmostApp)
      RDKShellApis.setVisibility(GLOBALS.topmostApp, true)
    }
    Router.focusPage();
  }

  static _states() {
    return [
      class AppList extends this {
        $enter() {
          this.indexVal = 0
        }
        _getFocused() {
          if (this.tag('AppList').length) {
            return this.tag('AppList')
          }
        }

        _handleLeft() {
          console.log("H left")
        }
        async _handleEnter() {
          let applicationType = this.tag('AppList').items[this.tag('AppList').index].data.applicationType;
          let uri = this.tag('AppList').items[this.tag('AppList').index].data.uri;
          let appIdentifier = this.tag('AppList').items[this.tag('AppList').index].data.appIdentifier;
          let params = {
            url: uri,
            launchLocation: "mainView",
            appIdentifier: appIdentifier
          }
          this.appApi.launchApp(applicationType, params).then(() => {
            Router.focusPage();
          }).catch(err => {
            console.log("ApplaunchError: ", err)
          });
        }
      },
    ]
  }
}
