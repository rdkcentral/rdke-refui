import { Lightning, Router, Language } from '@lightningjs/sdk'
import { CONFIG } from '../Config/Config';

export default class CameraStreamingScreenExitConfirmationScreen extends Lightning.Component {

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            w: 1920,
            h: 2000,
            rect: true,
            color: 0xCC000000,
            RebootScreen: {
                x: 950,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Streaming has Ended Please go to Home"),
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 125,
                    mountX: 0.5,
                    text: {
                        text: Language.translate("Click Confirm to go to Home!"),
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                },
                Buttons: {
                    x: 100, y: 200, w: 440, mountX: 0.5, h: 50,
                    Confirm: {
                        x: 0, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Confirm"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                    Cancel: {
                        x: 220, w: 200, mountX: 0.5, h: 50, rect: true, color: 0xFF7D7D7D,
                        Title: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Cancel"),
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000
                            },
                        }
                    },
                },
                BorderBottom: {
                    x: 0, y: 300, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            }
        }
    }

    _focus() {
        this._setState('Confirm')
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('camera/player')
        }
    }

    static _states() {
        return [

            class Confirm extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    Router.navigate('menu')
                }
                _handleRight() {
                    this._setState('Cancel')
                }
                _focus() {
                    this.tag('Confirm').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Confirm').patch({
                        color: 0xFFFFFFFF
                    })
                    this.tag('Confirm.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
            class Cancel extends this {
                $enter() {
                    this._focus()
                }
                _handleEnter() {
                    if(!Router.isNavigating()){
                    Router.back()
                    }
                }
                _handleLeft() {
                    this._setState('Confirm')
                }
                _focus() {
                    this.tag('Cancel').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _unfocus() {
                    this.tag('Cancel').patch({
                        color: 0xFF7D7D7D
                    })
                    this.tag('Cancel.Title').patch({
                        text: {
                            textColor: 0xFF000000
                        }
                    })
                }
                $exit() {
                    this._unfocus()
                }
            },
        ]
    }

}