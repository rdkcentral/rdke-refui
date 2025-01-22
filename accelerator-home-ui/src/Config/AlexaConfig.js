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
//Payloads, and other keys related to alexa and voiceControl plugin.

//app/shortcuts identifier and callsign map
export const AlexaLauncherKeyMap = {
    "amzn1.alexa-ask-target.app.70045": {
        "name": "YouTube",
        "callsign": "YouTube",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.50623": {
        "name": "YouTubeTV",
        "callsign": "YouTubeTV",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.72095": {
        "name": "Prime Video",
        "callsign": "Amazon",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.36377": {
        "name": "Netflix",
        "callsign": "Netflix",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.34908": {
        "name": "XUMO",
        "callsign": "HtmlApp",
        "url": "https://x1box-app.xumo.com/index.html",
    },
    "amzn1.alexa-ask-target.app.94721": {
        "name": "NBCU Peacock",
        "callsign": "Peacock",
        "url": "",
    },
    // // TODO: refactor
    // "amzn1.alexa-ask-target.app.73751": {
    //     "name": "Amazon Alexa",
    //     "callsign": "SmartScreen",
    //     "url": "",
    // },
    // // TODO: refactor
    // "amzn1.alexa-ask-target.app.32470": {
    //     "name": "Amazon Music",
    //     "callsign": "SmartScreen",
    //     "url": "",
    // },
    //shortcuts
    "amzn1.alexa-ask-target.shortcut.33122": {
        "name": "Home",
        "route": "menu"
    },
    "amzn1.alexa-ask-target.shortcut.28647": {
        "name": "Apps",
        "route": "apps"
    },
    "amzn1.alexa-ask-target.shortcut.82911": {
        "name": "Audio Output",
        "route": "settings/audio"
    },
    "amzn1.alexa-ask-target.shortcut.68228": {
        "name": "Guide",
        "route": "epg"
    },
    "amzn1.alexa-ask-target.shortcut.07395": {
        "name": "Settings",
        "route": "settings"
    },
    "amzn1.alexa-ask-target.shortcut.94081": {
        "name": "Bluetooth Settings",
        "route": "settings/bluetooth"
    },
    "amzn1.alexa-ask-target.app.30720": {
        "name": "Simple Player",
        "route": "player"
    },
    "amzn1.alexa-ask-target.shortcut.72631": {
        "name": "Language Settings",
        "route": "settings/other/language"
    },
    "amzn1.alexa-ask-target.shortcut.58566": {
        "name": "Network Settings",
        "route": "settings/network"
    },
    "amzn1.alexa-ask-target.shortcut.07345": {
        "name": "Power Settings",
        "route": "settings/other/energy"
    },
    "amzn1.alexa-ask-target.shortcut.12736": {
        "name": "Privacy Settings",
        "route": "settings/other/privacy"
    },
    "amzn1.alexa-ask-target.shortcut.69249": {
        "name": "Reset",
        "route": "settings/advanced/device/factoryReset"
    },
    "amzn1.alexa-ask-target.shortcut.78173": {
        "name": "Resolution Settings",
        "route": "settings/video/resolution"
    },
    "amzn1.alexa-ask-target.shortcut.94631": {
        "name": "Sleep timer",
        "route": "settings/other/timer"
    },
    "amzn1.alexa-ask-target.shortcut.32343": {
        "name": "Sound Settings",
        "route": "settings/audio"
    },
    "amzn1.alexa-ask-target.shortcut.10089": {
        "name": "System Information",
        "route": "settings/advanced/device/info"
    },
    "amzn1.alexa-ask-target.shortcut.01622": {
        "name": "Terms and Policy",
        "route": "settings/other/privacyPolicy"
    },
};

export const errorPayload = {
    "msgPayload": {
        "event": {
            "header": {
                "namespace": "Alexa",
                "name": "ErrorResponse",
                "messageId": "Unique identifier, preferably a version 4 UUID",
                "correlationToken": "Opaque correlation token that matches the request",
                "payloadVersion": "3"
            },
            "endpoint": {
                "endpointId": "Endpoint ID"
            },
            "payload": {
                "type": "Error type",
                "message": "Error message"
            }
        }
    }
}

export const VolumePayload = {
    "msgPayload": {
        "event": {
            "header": {
                "namespace": "Speaker",
                "name": "VolumeChanged",
                "messageId": "8912c9cc-a770-4fe9-8bf1-87e01a4a1f0b"
            },
            "payload": {
                "volume": 30,
                "muted": false
            }
        }
    }
}

export const ApplicationStateReporter = {
    "msgPayload": {
        "event": {
            "header": {
                "namespace": "Alexa.ApplicationStateReporter",
                "name": "ForegroundApplication",
                "value": {
                    "foregroundApplication": {
                        "id": "amzn1.alexa-ask-target.shortcut.33122",
                        "version": "1",
                        "type": "vsk",
                        "metadata": {
                            "categories": ["OTHER"],
                            "isVisible": true,
                            "isHome": true
                        }
                    }
                }
            }
        }
    }
}

/* state: PLAYING/PAUSED/STOPPED */
export const PlaybackStateReport = {
    "msgPayload": {
        "event": {
            "header": {
                "namespace": "Alexa.PlaybackStateReporter",
                "name": "playbackState",
                "value": {
                    "state": "PLAYING"
                }
            }
        }
    }
}
