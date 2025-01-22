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

 import { Lightning, Utils, Router } from "@lightningjs/sdk";
 import { CONFIG } from "../Config/Config";
 import HomeApi from "../api/HomeApi";
 import SubscriptionItem from "../items/SubscriptionItem";
 
 var homeApi = new HomeApi();
 export default class DetailsScreen extends Lightning.Component {
   _onChanged() {
     this.widgets.menu.updateTopPanelText(this.name);
   }
 
   pageTransition() {
     return "left";
   }
 
   static _template() {
     return {
       w: 1920,
       h: 1080,
       rect: true,
       color: 0xff000000,
       Details: {
         x: 200,
         y: 270,
         Image: {
           x: 0,
           y: 0,
           h: 493,
           w: 878,
         },
         Cast: {
           Title: {
             x: 10,
             y: 520,
             text: {
               text: "",
               fontStyle: "bold",
               fontSize: 22,
             },
           },
         },
         Description: {
           Title: {
             x: 10,
             y: 550,
             text: {
               text: "",
               fontFace: CONFIG.language.font,
               fontSize: 22,
               wordWrapWidth: 900,
               wordWrap: true,
             },
           },
         },
         Subscriptions: {
           x: 950,
           y: 50,
           w: 670,
           h: 395,
           visible: false,
           clipping: true,
           List: {
             type: Lightning.components.ListComponent,
             w: 670,
             h: 390,
             y: 5,
             itemSize: 77,
             horizontal: false,
             invertDirection: true,
             roll: true,
             rollMax: 900,
             itemScrollOffset: -4,
           },
         },
         Time: {
           y: 520,
           x: 1000,
           Title: {
             // mountX: 0.5,
             text: {
               text: "",
               fontFace: CONFIG.language.font,
               fontSize: 25,
             },
           },
         },
         Rating: {
           y: 550,
           x: 1000,
           Title: {
             // mountX: 0.5,
             text: {
               text: "",
               fontFace: CONFIG.language.font,
               fontSize: 25,
               wordWrap: true,
               wordWrapWidth: 500,
             },
           },
         },
         GracenoteLogo: {
           x: 925,
           y: 510,
           w: 300,
           h: 168,
           src: Utils.asset("images/powered_by_gracenote.png"),
         },
       },
     };
   }
 
   set params(args) {
     this.rootId = args.gracenoteItem.program.tmsid;
     this.name = args.gracenoteItem.program.title;
     let imgUrl =
       "http://developer.tmsimg.com/" +
       args.gracenoteItem.program.preferredImage.uri
         .replace("w=1280&", "w=878&")
         .replace("&h=720", "&h=493") +
       "&api_key=" +
       args.key;
     this.tag("Image").src = Utils.proxyUrl(imgUrl);
     this.tag(
       "Cast.Title"
     ).text.text = `${args.gracenoteItem.program.topCast[0]} \t ${args.gracenoteItem.program.topCast[1]} \t ${args.gracenoteItem.program.topCast[2]}`;
     this.tag("Description.Title").text.text =
       args.gracenoteItem.program.longDescription;
     this.tag("Time.Title").text.text = `${args.gracenoteItem.duration} Minutes`;
     if (args.gracenoteItem.ratings) {
       this.tag(
         "Rating.Title"
       ).text.text = `${args.gracenoteItem.ratings[0].body} \n${args.gracenoteItem.ratings[0].subRating}`;
     } else {
       this.tag("Rating.Title").text.text = "";
     }
 
     homeApi
       .getMovieSubscriptions(args.gracenoteItem.program.tmsId)
       .then((response) => {
         let options = response.ovd.movie.videos.video;
         if (options) {
           this.tag("Subscriptions.List").items = options.map((item, index) => {
             return {
               w: 670,
               h: 77,
               type: SubscriptionItem,
               item: item,
             };
           });
           this.tag("Subscriptions").visible = true;
         } else {
           this.tag("Subscriptions").visible = false;
         }
         this._setState("Subscriptions");
         this.tag("Subscriptions.List").setIndex(0);
       })
       .catch((error) => console.log(error));
   }
 
   _init() {}
 
   _focus() {
     this._setState("DetailsScreen");
     this.tag("Subscriptions.List").setIndex(0);
   }
   _unfocus() {
     this.tag("Subscriptions").visible = false;
   }
 
   _handleBack() {
     Router.navigate("menu");
   }
 
   static _states() {
     return [
       class DetailsScreen extends this {
         _handleDown() {
           this._setState("Subscriptions");
         }
         _handleUp() {
           this._setState("Subscriptions");
         }
         _handleLeft() {
           this._setState("Subscriptions");
         }
         _handleRight() {
           this._setState("Subscriptions");
         }
         _handleEnter() {
           this._setState("Subscriptions");
         }
       },
       class Subscriptions extends this {
         _getFocused() {
           return this.tag("Subscriptions.List").element;
         }
         _handleDown() {
           this.tag("Subscriptions.List").setNext();
         }
         _handleUp() {
           this.tag("Subscriptions.List").setPrevious();
         }
       },
     ];
   }
 }
 