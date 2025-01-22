import { Lightning, Utils, VideoPlayer } from "@lightningjs/sdk";

export default class Splash extends Lightning.Component {
  static _template() {
    return {};
  }

  _active() {
    console.log("Activevideo")
    VideoPlayer.playPause()
    VideoPlayer.consumer(this);
    VideoPlayer.size(1920, 1080);
    VideoPlayer.position(0, 0);
    VideoPlayer.open(Utils.asset("images/Screensaver.mp4"));
    VideoPlayer.loop();
  }

  _inactive() {
    VideoPlayer.close();
  }

  _init() {
    // VideoPlayer.playPause()
    // VideoPlayer.consumer(this);
    // VideoPlayer.size(1920, 1080);
    // VideoPlayer.position(0, 0);
    //VideoPlayer.mute();
  }
}
