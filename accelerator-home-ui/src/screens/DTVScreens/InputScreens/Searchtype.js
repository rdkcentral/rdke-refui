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
import TickMarkItem from "../../../items/TickMarkItem";

export default class SearchType extends Lightning.Component {
  static _template() {
    return {
      Contents: {
        x: 200,
        y: 270,
        w: 1620,
        h: 730,
        clipping: true,
        List: {
          type: Lightning.components.ListComponent,
          w: 1620,
          h: 730,
          y: 5,
          itemSize: 90,
          horizontal: false,
          invertDirection: true,
          roll: true,
          rollMax: 900,
          itemScrollOffset: -7,
        },
      },
    };
  }

  _getFocused() {
    return this.tag("List").element;
  }
  _handleDown() {
    this.tag("List").setNext();
  }
  _handleUp() {
    this.tag("List").setPrevious();
  }

  refreshItems(selected) {
    this.fireAncestors("$setSearchType", selected);
    this.tag("List").items = this.fireAncestors("$getSearchTypeList").map(
      (item, index) => {
        return {
          ref: "SearchType" + index,
          w: 1620,
          h: 90,
          type: TickMarkItem,
          isTicked: selected === item, //boolean
          itemName: item.charAt(0).toUpperCase() + item.slice(1), //pass the formated item name
          uniqID: item, //pass a uniq id that is to be returned when handle enter is pressed
          onHandleEnter: this.refreshItems.bind(this), //pass this function to refresh the tickmarks
        };
      }
    );
  }

  _focus() {
    this.refreshItems(this.fireAncestors("$getSelectedSearchType"));
  }
}
