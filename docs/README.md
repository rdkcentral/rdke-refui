# RDK Reference UI (rdke-refui)

---

RDK Reference UI (`rdke-refui`) is a Lightning.js-based resident application that serves as the home screen and UI shell for RDK Video reference platforms. It runs as the always-present foreground application on the device, presenting a navigable home screen, settings, media playback controls, and an application launcher. The UI communicates bidirectionally with the RDK middleware stack through ThunderJS (WPEFramework JSON-RPC) for device service control, application lifecycle, and window management. It is packaged as a bolt (DAC) application (`com.rdkcentral.refui`) and runs on the WPE runtime.

At the device level, it acts as the orchestrator of the user-visible surface: managing which application window is in focus, intercepting remote-control key presses, handling power state transitions, and launching or exiting third-party applications. At the module level, it encapsulates distinct API adapter classes for every Thunder plugin it interacts with, a Lightning Router-based screen navigation engine, and a set of overlay and widget components that can be rendered independently of the active route.

```mermaid
flowchart LR

%% Styles
classDef Apps stroke:#00B9F1,fill:#E6F7FD,stroke-width:2px;
classDef RDKMW stroke:#75D701,fill:#F1FFE6,stroke-width:2px;
classDef VL stroke:#808080,fill:#F2F2F2,stroke-width:2px;

%% Apps Layer
    subgraph Apps["Apps & Runtimes"]
        BOLT["refui bolt package\n(com.rdkcentral.refui)"]
        REFUI["rdke-refui\n(Resident / Home UI)"]
        WPE_RT["WPE Runtime\n(com.rdkcentral.wpe bolt)"]
    end

%% Middleware
    subgraph RDKMW["RDK Core Middleware"]
        AM["org.rdk.AppManager"]
        WM["org.rdk.RDKWindowManager"]
        Thunder["WPEFramework (Thunder)"]
        NM["org.rdk.NetworkManager"]
        PM["org.rdk.PowerManager"]
        PS["org.rdk.PersistentStore"]
        US["org.rdk.UserSettings"]
        Xcast["org.rdk.Xcast"]
        Miracast["org.rdk.MiracastService/Player"]
        AAMP["AAMP / Rialto"]
    end

%% Vendor Layer
    subgraph VL["Vendor Layer"]
        HAL["Display / HDMI / CEC HAL"]
        BSP["BSP"]
    end

    BOLT -->|packages dist of| REFUI
    BOLT -->|depends on| WPE_RT
    WPE_RT -->|hosts / renders| REFUI
    REFUI -->|ThunderJS JSON-RPC| Thunder
    Thunder --- AM
    Thunder --- WM
    Thunder --- NM
    Thunder --- PM
    Thunder --- PS
    Thunder --- US
    Thunder --- Xcast
    Thunder --- Miracast
    AM -->|HAL APIs| VL
    WM -->|HAL APIs| VL
    AAMP -->|Media Pipeline| VL
```

**Key Features & Responsibilities:**

- **Home Screen & Navigation**: Presents the main menu, side panel, top panel, and a configurable application grid through the Lightning Router. Supports routes including `menu`, `settings`, `epg`, `applauncher`, `usb`, and `player`.
- **Application Lifecycle Management**: Launches, closes, and terminates third-party applications via `org.rdk.AppManager`. On `onAppLifecycleStateChanged`, `AppController` shows and focuses the launched app window (and hides the main UI window) when the app becomes `APP_STATE_ACTIVE`, and restores the main UI window when the app leaves `APP_STATE_ACTIVE`, using `org.rdk.RDKWindowManager`. The currently topmost application is tracked in `GLOBALS.topmostApp`.
- **Remote Control Key Handling**: Registers key intercepts with `org.rdk.RDKWindowManager` at startup for Home, Power, Volume, and shortcut keys. Routes key events to the active screen or widget, and forwards relevant keys to the focused application window.
- **Power State Management**: Subscribes to `onPowerModeChanged` from `org.rdk.PowerManager` and suppresses non-power key events during `LIGHT_SLEEP` and `DEEP_SLEEP`. Only a Power key press is passed to the wake/power-state handler. In other non-`ON` states (for example `STANDBY`), a key press sets the power state to `ON`.
- **Network Management**: Interfaces with `org.rdk.NetworkManager` for Wi-Fi scanning, connecting, IP configuration, and internet connectivity checks. Displays network setup screens during the splash/onboarding flow.
- **Media Playback**: Embeds an integrated video player (`AAMPVideoPlayer`) for VOD and live content playback, with an info overlay.
- **Settings Management**: Provides screens and overlays for picture settings, audio settings, sleep timer, screen saver, language, and time zone. User preferences are persisted via `org.rdk.PersistentStore` and `org.rdk.UserSettings`.
- **Voice & Alexa Integration**: Activates `org.rdk.VoiceControl` for keyword detection and voice session lifecycle, and extends voice handling to manage SmartScreen activation and application state reporting to the Alexa cloud.
- **Miracast Screen Mirroring**: Activates `org.rdk.MiracastService` and `org.rdk.MiracastPlayer`, presents the connection notification overlay, and manages accept/reject flows for incoming Miracast client connections.
- **Application Package Management**: Uses `org.rdk.AppPackageManager` (via `PackageManagerApi`) to list, install, and remove application packages, and relays install/uninstall events from `org.rdk.AppManager` to registered UI listeners.
- **Inactivity & Energy Saving**: Monitors user inactivity through `org.rdk.RDKWindowManager` inactivity reporting, and applies configurable screen saver, energy saver, and sleep timer timeouts stored in browser-side `localStorage`/`Storage`.

---

## Design

The application is structured as a single-page Lightning.js application bootstrapped via `@lightningjs/sdk`'s `Launch()` entry point. The root `App` class extends `Router.App` and owns all global widgets (Menu, Volume overlay, Channel overlay, Settings overlay, App Carousel, Miracast notification). Page-level components are managed by the Lightning Router, which maps URL-like hash paths to Lightning components. This decouples screen logic from the shell layer: each screen or overlay only needs to know its own state, while the `App` class orchestrates global events and key routing.

Interactions with RDK middleware are primarily handled through ThunderJS over a WebSocket connection to `127.0.0.1:9998`. Dedicated adapters in `accelerator-home-ui/src/api/` isolate most JSON-RPC calls and subscriptions, while DTV session management, app-catalog operations, channel data, and content metadata also use HTTP requests.

State shared across screens is held in `GLOBALS` (a module-level object in `Config.js`) and in the Lightning `Storage` API, which wraps `localStorage`. `AppController` maintains the identity of the main client window and the currently focused application instance, coordinating window visibility transitions when apps are launched or exit.

```mermaid
graph TD
    subgraph RefUI["rdke-refui (Lightning.js App / WPE Runtime)"]
        subgraph AppShell["App Shell (App.js)"]
            Router["Lightning Router"]
            Widgets["Global Widgets\n(Menu, Volume, Overlays)"]
            KeyHandler["Key Handler"]
            AppCtrl["AppController"]
        end

        subgraph Screens["Screens & Views"]
            MainView["MainView (Home)"]
            SettingsScreen["SettingsScreen"]
            AppLauncher["AppLauncherScreen"]
            EPGScreen["EPGScreen"]
            VideoPlayer["AAMPVideoPlayer"]
            SplashScreens["SplashScreens (Onboarding)"]
        end

        subgraph APIs["API Adapter Layer (src/api/)"]
            AppApi["AppApi\n(System, Timezone)"]
            AppManagerApi["AppManagerApi\n(org.rdk.AppManager)"]
            RDKWindowMgrApi["RDKWindowManagerApi\n(org.rdk.RDKWindowManager)"]
            NetworkMgrApi["NetworkManagerAPI\n(org.rdk.NetworkManager)"]
            PowerMgrApi["PowerManagerApi\n(org.rdk.PowerManager)"]
            PersistentStoreApi["PersistentStore\n(org.rdk.PersistentStore)"]
            UserSettingsApi["UserSettingsApi\n(org.rdk.UserSettings)"]
            BluetoothApi["BluetoothApi\n(org.rdk.Bluetooth)"]
            HDMIApi["HDMIApi\n(org.rdk.HdmiInput)"]
            CECApi["CECApi\n(org.rdk.HdmiCecSource)"]
            XcastApi["XcastApi\n(org.rdk.Xcast)"]
            MiracastApi["Miracast\n(org.rdk.MiracastService/Player)"]
            VoiceApi["VoiceApi\n(org.rdk.VoiceControl)"]
            SmartScreenApi["SmartScreen Handler\n(VoiceApi)"]
            PackageMgrApi["PackageManagerApi\n(org.rdk.AppPackageManager)"]
            PictureSettingsApi["PictureSettingsApi"]
        end

        subgraph Helpers["Helpers"]
            InactivityHelper["InactivityHelper\n(Energy/Screen/Sleep Timers)"]
            KeyIntercept["keyIntercept\n(RDKWindowManager key registration)"]
        end
    end

    subgraph Thunder["WPEFramework / Thunder (port 9998)"]
        ThunderCore["Thunder Core"]
    end

    Router --> Screens
    KeyHandler --> Router
    AppCtrl --> AppManagerApi
    AppCtrl --> RDKWindowMgrApi
    AppCtrl --> KeyIntercept
    Screens --> APIs
    Widgets --> APIs
    APIs -->|ThunderJS WebSocket| Thunder
    InactivityHelper --> AppApi
```

#### Threading Model

- **Threading Architecture**: Single-threaded (JavaScript event loop within the WPE browser runtime).
- **Main Thread**: Handles all Lightning rendering, key events, and ThunderJS WebSocket callbacks. All API calls are asynchronous (Promise-based) and do not block the render loop.
- **Async / Event Dispatch**: ThunderJS delivers JSON-RPC event notifications via WebSocket callbacks registered with `thunder.on()`. All callbacks dispatch synchronously on the JavaScript event loop and update component state or trigger `Router.navigate()` calls.
- **Synchronization**: Shared state is accessed through the JavaScript event loop, which serialises execution. API adapters use several instantiation patterns, including `static get()` factories, exported singleton instances, and directly constructed classes. `GLOBALS` properties use getter/setter pairs to manage shared state, with logging on selected setters.

### Bolt / DAC Packaging

`rdke-refui` is bundled and delivered as a bolt (DAC) application. The tooling lives in the `bolt/` directory:

| Item                                             | Description                                                                                                                                                                                                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bolt/pack.sh`                                   | Builds the Lightning app (`npm install`, `npx lng dist`) in `accelerator-home-ui/`, copies `dist/es6/*` plus `LICENSE` and `NOTICE` into `usr/share/refui/`, and creates the `packages/refui.tgz` rootfs layer. The entry `index.html` ends up in `/usr/share/refui`. |
| `bolt/package-configs/com.rdkcentral.refui.json` | Package metadata compliant with the [OCI package spec](https://github.com/rdkcentral/oci-package-spec/blob/main/metadata.md). Used by `bolt pack` to create the package.                                                                                              |
| `bolt/README.md`                                 | Build, push, and run instructions using [bolt-tools](https://github.com/rdkcentral/bolt-tools).                                                                                                                                                                       |

**Package manifest (`com.rdkcentral.refui.json`):**

| Field                     | Value                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | `com.rdkcentral.refui`                                                                                                                                                                                                                                              |
| `name`                    | `RDK Ref UI Home Screen`                                                                                                                                                                                                                                            |
| `packageType`             | `application`                                                                                                                                                                                                                                                       |
| `version` / `versionName` | `6.0.41`                                                                                                                                                                                                                                                            |
| `entryPoint`              | `--lightning --dev file:///usr/share/refui/index.html`                                                                                                                                                                                                              |
| `dependencies`            | `com.rdkcentral.wpe` (`~0.5.0`) — the WPE runtime package that hosts the app                                                                                                                                                                                        |
| `permissions`             | `urn:rdk:permission:home-app`, `urn:rdk:permission.internet`, `urn:rdk:permission:firebolt`, `urn:rdk:permission:thunder`, `urn:rdk:permission:rialto`, `urn:rdk:permission:game-controller`, `urn:rdk:permission:display-overlay`, `urn:rdk:permission:compositor` |

**Build and deployment flow:**

1. Run `bolt/pack.sh` to produce `packages/refui.tgz` (the rootfs layer containing the application `dist`).
2. From the `packages` directory, create the bolt package with `bolt pack ../package-configs/com.rdkcentral.refui.json refui.tgz`.
3. Ensure the `gpu-layer`, `base`, and `wpe` (for example `wpe-develop`) packages are available on the device, then push the package with `bolt push <STB_IP> <package>` and start it with `bolt run <STB_IP> <package>`.

**Runtime relationship with the WPE runtime and middleware:**

- The bolt package declares a dependency on the WPE runtime package (`com.rdkcentral.wpe`). At runtime the WPE runtime loads the entry point (`file:///usr/share/refui/index.html`) and `rdke-refui` executes inside it; the Lightning UI is rendered by WPE.
- The package `id` (`com.rdkcentral.refui`) is the value of `GLOBALS.selfclientAppName`. `AppController.init()` uses it to find the main client instance: first by matching `appId` in `org.rdk.AppManager` `getLoadedApps()`, and, when the app was started with `bolt run`, by matching the `com.rdkcentral.refui+` prefix in `org.rdk.RDKWindowManager` `getApps()`.
- The resulting client instance ID is stored in `GLOBALS.selfClientId` and is used for window visibility/focus and key-intercept registration with `org.rdk.RDKWindowManager`.
- Third-party applications are handled in the same DAC model: they are packages managed through `org.rdk.AppPackageManager` (install/uninstall), and launched and tracked through `org.rdk.AppManager`.

### Prerequisites and Dependencies

#### Platform and Integration Requirements

- **Build Dependencies**: Defined in `accelerator-home-ui/package.json` and `accelerator-home-ui/package-lock.json`; refer to these files directly for the exact dependency set and resolved versions.
- **Plugin Dependencies**: `org.rdk.AppManager`, `org.rdk.RDKWindowManager`, `org.rdk.NetworkManager`, `org.rdk.PowerManager`, `org.rdk.PersistentStore`, `org.rdk.UserSettings`, `org.rdk.Bluetooth`, `org.rdk.HdmiInput`, `org.rdk.HdmiCecSource`, `org.rdk.Xcast`, `org.rdk.VoiceControl`, `org.rdk.MiracastService`, `org.rdk.MiracastPlayer`, `org.rdk.TextToSpeech`, `org.rdk.AppPackageManager`, `org.rdk.System`, `SmartScreen`.
- **Configuration Files**:
  - `accelerator-home-ui/settings.json` — Lightning SDK platform and stage settings, loaded at application startup from the static directory.
  - `bolt/package-configs/com.rdkcentral.refui.json` — Application manifest used by the package manager to describe entry point, version, and required permissions.
  - `accelerator-home-ui/static/data/AppListInfo.js` — Static list of pre-configured partner applications shown in the home screen application grid.
  - `accelerator-home-ui/static/moreChannels/ChannelData.json` — Supplementary channel list fetched at runtime from `http://127.0.0.1:50050/lxresui/static/moreChannels/ChannelData.json`.
- **Startup Order**: Successful main-client discovery requires the relevant AppManager or RDKWindowManager service to be reachable. `org.rdk.RDKWindowManager` must also be active for key-intercept registration; failures are logged and do not prevent `AppController.init()` from completing.

---

### Component State Flow

#### Initialization to Active State

When the WPE runtime loads the application, `index.js` calls `Launch(App)`, which triggers `App._setup()`. The router is started, `AppController.get().init()` identifies the main client window through `org.rdk.AppManager` or `org.rdk.RDKWindowManager`, and key intercepts are registered with `org.rdk.RDKWindowManager`. Once the splash screen route completes its onboarding checks (language selection, network configuration, pairing code if required), the router navigates to the main `menu` route and the application is fully active.

The component transitions through the following states: **Loading** (Lightning SDK bootstraps the renderer, `App._setup()` runs) → **Splash** (onboarding screens: language, network, activation code) → **AppControllerInit** (`AppController.init()` resolves the main client ID, registers key intercepts) → **Active** (main `menu` route, all overlays available, ThunderJS event listeners registered) → **Shutdown** (WPE browser exits).

```mermaid
sequenceDiagram
    participant Runtime as WPE Runtime
    participant App as App.js (_setup)
    participant Router as Lightning Router
    participant AppCtrl as AppController
    participant AppMgr as org.rdk.AppManager
    participant WM as org.rdk.RDKWindowManager

    Runtime->>App: Launch(App)
    App->>Router: startRouter(routes)
    Router-->>App: Router ready
    App->>AppCtrl: AppController.get().init()
    AppCtrl->>AppMgr: getLoadedApps()
    AppMgr-->>AppCtrl: app list (mainClientId)
    AppCtrl->>WM: addKeyIntercepts(mainClientId, intercepts)
    WM-->>AppCtrl: success
    AppCtrl-->>App: init() resolved
    Note over App,AppCtrl: App._init() also calls AppController.subscribe(thunder) for onAppLifecycleStateChanged, onAppLaunchRequest, ...
    App->>Router: navigate("splash/...")
    Router-->>App: Splash screens rendered
    Note over App,Router: Onboarding completes
    Router->>App: navigate("menu")
    App-->>Runtime: Active (home screen visible)

    loop Runtime
        Runtime->>App: Key event
        App->>Router: navigate / focusWidget
    end

    AppMgr->>AppCtrl: onAppLifecycleStateChanged {newState: "APP_STATE_ACTIVE"}
    AppCtrl->>WM: setVisible(mainClientId, false)
```

#### Runtime State Changes

**State Change Triggers:**

- **Power state change** (`onPowerModeChanged` from `org.rdk.PowerManager`): `GLOBALS.powerState` is refreshed from the plugin. When the device leaves `ON` (for example to `LIGHT_SLEEP` or `DEEP_SLEEP`), the new state is cached in `Storage`, the topmost third-party app (if any) is exited, and the router navigates to `menu`. While in `LIGHT_SLEEP` or `DEEP_SLEEP`, all non-Power key presses are ignored and only the Power key is passed to the power-key handler; the Power key toggles the state (see below). If the device moves from `DEEP_SLEEP` to `LIGHT_SLEEP`, the UI sets the power state to `ON`. When the device returns to `ON`, the cached sleep state is cleared.
- **Power key handling**: The Power key (`Keymap.Power`) is intercepted for the main client window. When the current state is `ON`, a Power key press requests `DEEP_SLEEP` if the energy saver timeout is configured (falling back to `LIGHT_SLEEP` if that fails), otherwise `LIGHT_SLEEP`; in any other state it sets the power state to `ON`. In non-sleep states other than `ON` (for example `STANDBY`), any key press sets the power state to `ON`.
- **App lifecycle change** (`onAppLifecycleStateChanged` from `org.rdk.AppManager`): `AppController` records the `appId` of the app being launched from `onAppLaunchRequest`. When that app transitions to `APP_STATE_ACTIVE`, `AppController` updates `GLOBALS.topmostApp`, makes the app window visible and focused, registers app-specific key intercepts (YouTube only: volume, mute, and the YouTube key), and hides the main UI window. When the focused app leaves `APP_STATE_ACTIVE`, `GLOBALS.topmostApp` is reset to the main app and the main UI window is made visible and focused again.
- **HDMI source change** (`onInputStatusChanged` from `org.rdk.HdmiInput`): The TV overlay is updated to reflect the active HDMI input and triggers navigation to the HDMI input overlay route.
- **Network state change** (events from `org.rdk.NetworkManager`): The `IsConnectedToInternet` flag in `GLOBALS` is updated, and network status is reflected in the settings overlay and top panel.
- **Miracast connection request** (events from `org.rdk.MiracastService`): The `MiracastNotification` overlay is displayed with accept/reject options. The Miracast state in `GLOBALS.Miracastclientdevicedetails` is updated through the connection lifecycle.

**Context Switching Scenarios:**

- When a third-party application is launched through `org.rdk.AppManager`, the main UI window is hidden and focus is transferred to the application's window client ID once `onAppLifecycleStateChanged` reports `APP_STATE_ACTIVE`. The router navigates to `applauncher` only when an overlay widget (settings overlay, app carousel, Miracast notification) must be shown while a third-party app is topmost.
- On a Home key press while a third-party app is topmost, `jumpToRoute("menu")` is called, which calls `AppManager.closeApp()` followed by `AppManager.terminateApp()` for the topmost app and navigates to the target route. The main UI window is then made visible and focused by the `onAppLifecycleStateChanged` handler when the app leaves `APP_STATE_ACTIVE`.
- The inactivity engine (`initializeInactivityEngine()`) is started once and keeps running across power-state changes. Inactivity reporting is disabled through `org.rdk.RDKWindowManager` only when no valid screen saver, energy saver, or sleep timer timeout is configured.

---

### Call Flows

#### Initialization Call Flow

```mermaid
sequenceDiagram
    participant Runtime as WPE Runtime
    participant App as App.js
    participant AppCtrl as AppController
    participant AppMgr as org.rdk.AppManager
    participant WM as org.rdk.RDKWindowManager

    Runtime->>App: Launch(App) → _setup()
    App->>App: Router.startRouter(routes)
    App->>AppCtrl: init()
    AppCtrl->>AppMgr: thunder.call('org.rdk.AppManager.1', 'getLoadedApps')
    AppMgr-->>AppCtrl: [{appId, appInstanceId}, ...]
    AppCtrl->>WM: addKeyIntercepts({clientId, intercepts})
    WM-->>AppCtrl: {success: true}
    AppCtrl-->>App: init() resolved
    App->>App: Router.navigate("splash/...")
```

#### Application Launch Call Flow

```mermaid
sequenceDiagram
    participant User as User (Key Press)
    participant App as App.js
    participant AppCtrl as AppController
    participant AppMgr as org.rdk.AppManager
    participant WM as org.rdk.RDKWindowManager

    User->>App: Keymap.Amazon / Netflix / YouTube
    App->>App: launchFeaturedApp(appName)
    App->>AppMgr: thunder.call('org.rdk.AppManager.1', 'launchApp', {appId})
    AppMgr-->>App: response
    AppMgr->>AppCtrl: onAppLaunchRequest {appId}
    Note over AppCtrl: launchedAppId = appId
    Note over AppMgr,AppCtrl: Later: onAppLifecycleStateChanged fires
    AppMgr->>AppCtrl: onAppLifecycleStateChanged {newState: "APP_STATE_ACTIVE"}
    AppCtrl->>WM: setVisible(appInstanceId, true)
    AppCtrl->>WM: setFocus(appInstanceId)
    AppCtrl->>WM: addKeyIntercepts (YouTube only)
    AppCtrl->>WM: setVisible(mainClientId, false)
    WM-->>AppCtrl: success
```

#### Power State Handling Call Flow

```mermaid
sequenceDiagram
    participant PM as org.rdk.PowerManager
    participant App as App.js
    participant PowerMgrApi as PowerManagerApi

    PM->>App: onPowerModeChanged {newState: "LIGHT_SLEEP"}
    App->>App: GLOBALS.powerState = LIGHT_SLEEP
    Note over App: Non-Power key presses are ignored in LIGHT_SLEEP / DEEP_SLEEP
    User->>App: Power key press
    App->>App: initializeInactivityEngine()
    App->>App: _powerKeyPressed()
    App->>PowerMgrApi: getPowerState()
    PowerMgrApi-->>App: currentState (LIGHT_SLEEP)
    App->>PowerMgrApi: setPowerState("ON")
    PowerMgrApi->>PM: thunder.call('org.rdk.PowerManager', 'setPowerState', {powerState: "ON"})
    PM-->>PowerMgrApi: result
    PowerMgrApi-->>App: resolved
    PM->>App: onPowerModeChanged {newState: "ON"}
    App->>App: GLOBALS.powerState = ON
```

---

## Internal Modules

Key file paths in the table below are relative to `accelerator-home-ui/`.

| Module / Class      | Description                                                                                                                                                                                                                                             | Key Files                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `App`               | Root Lightning application class. Owns global widget tree, key capture logic, and power state handling. Extends `Router.App`.                                                                                                                           | `src/App.js`                              |
| `AppController`     | Resolves the main client window ID at startup, registers key intercepts, manages app window visibility transitions on lifecycle events, and relays package install/uninstall notifications to registered listeners.                                     | `src/AppController.js`                    |
| `Router / Routes`   | Lightning Router configuration defining all navigable routes and their associated screen components and active widgets.                                                                                                                                 | `src/routes/routes.js`, `src/routes/*.js` |
| `GLOBALS / CONFIG`  | Shared mutable state object (topmost app, power state, network status, Miracast state, client IDs) and static configuration (Thunder host, theme, language).                                                                                            | `src/Config/Config.js`                    |
| `API Adapter Layer` | One class per Thunder plugin or service area. Each class wraps ThunderJS calls and event subscriptions (and, for some adapters such as `DTVApi`, `HomeApi`, and `AppCatalog`, HTTP `fetch()` requests), exposing Promise-based methods to the UI layer. | `src/api/*.js`                            |
| `InactivityHelper`  | Manages three inactivity timers (energy saver, screen saver, sleep timer) using values stored in `localStorage`. Enables/disables `org.rdk.RDKWindowManager` inactivity reporting (via `AppApi`) based on active timer state.                           | `src/helpers/InactivityHelper.js`         |
| `keyIntercept`      | Registers the global key intercept list with `org.rdk.RDKWindowManager` for the main client window. Called during `AppController.init()`.                                                                                                               | `src/keyIntercept/keyIntercept.js`        |
| `MainView`          | Home screen view component. Displays the partner application grid, Gracenote content recommendations, and DAC-installed application items.                                                                                                              | `src/views/MainView.js`                   |
| `Menu`              | Persistent navigation widget composed of `TopPanel` and `SidePanel`. Always present across primary routes.                                                                                                                                              | `src/views/Menu.js`                       |
| `AAMPVideoPlayer`   | Lightning component wrapping the media player. Handles VOD URL playback and live channel playback with an info overlay.                                                                                                                                 | `src/MediaPlayer/AAMPVideoPlayer.js`      |
| `Screens`           | Individual full-screen route components: settings, Wi-Fi, Bluetooth, EPG, USB apps, splash/onboarding, Alexa login, Miracast notification, camera streaming, and error screens.                                                                         | `src/screens/*.js`                        |
| `Overlays`          | Floating overlay components rendered as widgets: `SettingsOverlay`, `AppCarousel`, `VideoInfoChange`, audio/network/live TV settings overlays.                                                                                                          | `src/overlays/*.js`                       |
| `Redux Store`       | Minimal Redux store used to track voice recognition session state (`ACTION_LISTEN_START` / `ACTION_LISTEN_STOP`).                                                                                                                                       | `src/redux.js`                            |

---

## Component Interactions

### Interaction Matrix

| Target Component / Layer    | Interaction Purpose                                                                                | Key APIs / Topics                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thunder Plugins**         |                                                                                                    |                                                                                                                                                                             |
| `org.rdk.AppManager`        | Launch apps, query loaded apps, receive install/uninstall/lifecycle events                         | `launchApp()`, `getLoadedApps()`, `isInstalled()`, `closeApp()`, `terminateApp()`, `onAppLifecycleStateChanged`, `onAppLaunchRequest`, `onAppInstalled`, `onAppUninstalled` |
| `org.rdk.RDKWindowManager`  | Set window visibility and focus, register key intercepts, query running apps, inactivity reporting | `setFocus()`, `setVisible()`, `getApps()`, `addKeyIntercepts()`, `enableInactivityReporting()`, `setInactivityInterval()`, `onUserInactivity`                               |
| `org.rdk.NetworkManager`    | Wi-Fi scan and connect, IP settings, internet connectivity check                                   | `GetAvailableInterfaces()`, `SetInterfaceState()`, `GetIPSettings()`, `IsConnectedToInternet()`, `StartConnectivityMonitoring()`                                            |
| `org.rdk.PowerManager`      | Read and set device power state, subscribe to power mode changes, configure wakeup sources         | `setPowerState()`, `setWakeupSourceConfig()`, `onPowerModeChanged`                                                                                                          |
| `org.rdk.PersistentStore`   | Read and write persistent key-value pairs for user preferences                                     | `getValue()`, `setValue()`, `deleteKey()`, `onValueChanged`, `onStorageExceeded`                                                                                            |
| `org.rdk.UserSettings`      | Get/set voice guidance and presentation language preferences                                       | `setVoiceGuidance()`, `getVoiceGuidance()`, `setPresentationLanguage()`, `getPresentationLanguage()`                                                                        |
| `org.rdk.Bluetooth`         | Device discovery, pairing, connection for remote controls and audio devices                        | `startScan()`, `pair()`, `connect()`, `onDiscoveredDevice`, `onStatusChanged`, `onPairingRequest`                                                                           |
| `org.rdk.HdmiInput`         | Query and switch HDMI input sources                                                                | `getHDMIInputDevices()`, `setHDMIInput()`, `stopHDMIInput()`, `onInputStatusChanged`, `onSignalChanged`                                                                     |
| `org.rdk.HdmiCecSource`     | Enable CEC and manage TV control actions via HDMI-CEC                                              | `getEnabled()`, `setEnabled()`, `performOTP()`, `getActiveSourceStatus()`                                                                                                   |
| `org.rdk.Xcast`             | Enable cast discovery, receive cast application launch/stop/hide requests                          | `setEnabled()`, `onApplicationLaunchRequest`, `onApplicationStopRequest`, `onApplicationHideRequest`                                                                        |
| `org.rdk.VoiceControl`      | Activate voice session, subscribe to keyword and stream events                                     | `configureVoice()`, `onKeywordVerification`, `onSessionBegin`, `onSessionEnd`                                                                                               |
| `SmartScreen`               | Display Alexa smart screen overlay during voice interactions                                       | `Controller.activate()`, `Controller.deactivate()`                                                                                                                          |
| `org.rdk.MiracastService`   | Enable/disable Miracast, accept/reject incoming connections                                        | `setEnable()`, `getEnable()`, `acceptClientConnection()`, `stopClientConnection()`, `stopRequest()`                                                                         |
| `org.rdk.MiracastPlayer`    | Start/stop Miracast media playback                                                                 | `activate()`, `deactivate()`                                                                                                                                                |
| `org.rdk.TextToSpeech`      | Enable/disable TTS and speak UI text                                                               | `enabletts()`, `isttsenabled()`, `speak()`                                                                                                                                  |
| `org.rdk.AppPackageManager` | List, install, and remove application packages                                                     | `listPackages()`, `install()`, `uninstall()`                                                                                                                                |
| `org.rdk.System`            | Query and set time zone                                                                            | `getTimeZones()`, `getTimeZoneDST()`, `setTimeZoneDST()`                                                                                                                    |

### Events Subscribed

| Event Name                   | Source Plugin / Topic     | Trigger Condition                                   | Consumer in refui                                      |
| ---------------------------- | ------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `onPowerModeChanged`         | `org.rdk.PowerManager`    | Device power state changes                          | `App.js` (key suppression, wakeup logic)               |
| `onAppLifecycleStateChanged` | `org.rdk.AppManager`      | Launched app transitions to/from `APP_STATE_ACTIVE` | `AppController` (window focus/visibility management)   |
| `onAppLaunchRequest`         | `org.rdk.AppManager`      | Application launch requested                        | `AppController` (records the launched `appId`)         |
| `onAppInstalled`             | `org.rdk.AppManager`      | Application package installed                       | `AppController` → registered `packageChangedListeners` |
| `onAppUninstalled`           | `org.rdk.AppManager`      | Application package uninstalled                     | `AppController` → registered `packageChangedListeners` |
| `onInputStatusChanged`       | `org.rdk.HdmiInput`       | HDMI input port connected/disconnected              | `HDMIApi` event handler → TV overlay update            |
| `onSignalChanged`            | `org.rdk.HdmiInput`       | HDMI signal state changes                           | `HDMIApi` event handler                                |
| `onDiscoveredDevice`         | `org.rdk.Bluetooth`       | New Bluetooth device discovered during scan         | `BluetoothApi` → Bluetooth screen                      |
| `onStatusChanged`            | `org.rdk.Bluetooth`       | Pairing or connection state changes                 | `BluetoothApi` → Bluetooth screen                      |
| `onKeywordVerification`      | `org.rdk.VoiceControl`    | Wake word detected                                  | `VoiceApi` → Alexa/voice UI                            |
| `onApplicationLaunchRequest` | `org.rdk.Xcast`           | Cast source requests app launch                     | `XcastApi` → app launch handler                        |
| `onValueChanged`             | `org.rdk.PersistentStore` | A stored value changes                              | `PersistentStoreApi` event handler                     |
| `onStorageExceeded`          | `org.rdk.PersistentStore` | Persistent storage quota exceeded                   | `PersistentStoreApi` event handler                     |

### IPC Flow Patterns

**Primary Request / Response Flow:**

All Thunder plugin interactions follow a uniform Promise-based JSON-RPC pattern. The UI calls an adapter method, which constructs and dispatches a ThunderJS call. The resolved or rejected Promise result is propagated back to the calling screen or widget.

```mermaid
sequenceDiagram
    participant Screen as Screen / Widget
    participant Adapter as API Adapter (src/api/)
    participant ThunderJS as ThunderJS (WebSocket)
    participant Thunder as Thunder Plugin

    Screen->>Adapter: adapter.someMethod(params)
    Adapter->>ThunderJS: thunder.call(callsign, method, params)
    ThunderJS->>Thunder: JSON-RPC Request (port 9998)
    Thunder-->>ThunderJS: JSON-RPC Response
    ThunderJS-->>Adapter: result or error
    Adapter-->>Screen: resolved value / rejected error
```

**Event Notification Flow:**

Adapter classes subscribe to plugin events during `activate()`. When an event arrives, the adapter dispatches it to a registered callback, which was set by the screen or the `App` root component.

```mermaid
sequenceDiagram
    participant Thunder as Thunder Plugin
    participant ThunderJS as ThunderJS (WebSocket)
    participant Adapter as API Adapter
    participant App as App.js / Screen

    Thunder->>ThunderJS: JSON-RPC Event notification
    ThunderJS->>Adapter: event callback (registered via thunder.on())
    Adapter->>App: this._events.get(eventId)(notification)
    App->>App: Update GLOBALS / Router.navigate / widget update
```

---

## Implementation Details

### Key Thunder Plugin API Calls

Implementation file paths in the table below are relative to `accelerator-home-ui/`.

| Plugin / API               | Method Called                                  | Purpose                                                          | Implementation File                                                  |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| `org.rdk.AppManager`       | `launchApp()`                                  | Launch a registered application by ID                            | `src/api/AppManagerApi.js`                                           |
| `org.rdk.AppManager`       | `getLoadedApps()`                              | Retrieve list of currently loaded app instances                  | `src/api/AppManagerApi.js`                                           |
| `org.rdk.RDKWindowManager` | `setFocus()`                                   | Transfer input focus to a window client                          | `src/api/RDKWindowManagerApi.js`                                     |
| `org.rdk.RDKWindowManager` | `setVisible()`                                 | Show or hide a window client                                     | `src/api/RDKWindowManagerApi.js`                                     |
| `org.rdk.RDKWindowManager` | `addKeyIntercepts()`                           | Register key intercepts for the main client window               | `src/api/RDKWindowManagerApi.js`, `src/keyIntercept/keyIntercept.js` |
| `org.rdk.PowerManager`     | `setPowerState()`                              | Set device power state (ON / STANDBY / LIGHT_SLEEP / DEEP_SLEEP) | `src/api/PowerManagerApi.js`                                         |
| `org.rdk.PowerManager`     | `setWakeupSourceConfig()`                      | Configure hardware wakeup sources                                | `src/api/PowerManagerApi.js`                                         |
| `org.rdk.NetworkManager`   | `GetAvailableInterfaces()`                     | List network interfaces                                          | `src/api/NetworkManagerAPI.js`                                       |
| `org.rdk.NetworkManager`   | `IsConnectedToInternet()`                      | Check active internet connectivity                               | `src/api/NetworkManagerAPI.js`                                       |
| `org.rdk.NetworkManager`   | `GetIPSettings()`                              | Retrieve IP configuration for an interface                       | `src/api/NetworkManagerAPI.js`                                       |
| `org.rdk.PersistentStore`  | `getValue()` / `setValue()`                    | Read/write persistent user preferences                           | `src/api/PersistentStore.js`                                         |
| `org.rdk.HdmiInput`        | `getHDMIInputDevices()`                        | List available HDMI input ports                                  | `src/api/HDMIApi.js`                                                 |
| `org.rdk.HdmiInput`        | `setHDMIInput()` / `stopHDMIInput()`           | Activate or deactivate an HDMI input source                      | `src/api/HDMIApi.js`                                                 |
| `org.rdk.HdmiCecSource`    | `getEnabled()`, `setEnabled()`, `performOTP()` | Query and enable CEC; trigger OTP action on the HDMI source      | `src/api/CECApi.js`                                                  |
| `org.rdk.Xcast`            | `setEnabled()`                                 | Enable cast discovery advertisement                              | `src/api/XcastApi.js`                                                |
| `org.rdk.MiracastService`  | `setEnable()` / `acceptClientConnection()`     | Enable Miracast and accept/reject peer connections               | `src/api/Miracast.js`                                                |
| `org.rdk.VoiceControl`     | `configureVoice()`                             | Configure voice endpoint and enable keyword detection            | `src/api/VoiceApi.js`                                                |
| `org.rdk.TextToSpeech`     | `enabletts()` / `speak()`                      | Enable TTS and synthesise speech for UI elements                 | `src/api/TTSApi.js`                                                  |
| `org.rdk.System`           | `getTimeZoneDST()` / `setTimeZoneDST()`        | Read and write device time zone                                  | `src/api/AppApi.js`                                                  |

### Key Implementation Logic

- **State / Lifecycle Management**: `GLOBALS` (module-level object in `Config.js`) is the authoritative store for runtime state: `topmostApp`, `powerState`, `selfClientId`, `IsConnectedToInternet`, `Miracastclientdevicedetails`. `AppController` maintains the focused client ID and main client ID for window management. State transitions on power mode or app lifecycle events are handled by callbacks registered in `App.js` and `AppController.js`.

- **Event Processing**: Plugin events are registered in each adapter's `activate()` method via `thunder.on(callsign, eventName, callback)`. Callbacks invoke registered handler functions stored in the adapter's `_events` Map. The `App.js` root registers handlers on adapters directly, or adapters forward events to UI components through the Lightning component event system.

- **Error Handling Strategy**: Each adapter wraps ThunderJS calls in Promise constructors. On `catch`, the error is logged via `console.error`. Depending on the adapter, the Promise is then rejected with the error or resolved with a default value (for example an empty array or `false`). `AppController` uses the `ThunderError` helper class to produce structured error strings.

- **Logging & Diagnostics**: All classes use `console.info`, `console.log`, `console.error`, and `console.warn` assigned to `this.INFO`, `this.LOG`, `this.ERR`, `this.WARN` respectively. Log output is available in the WPE browser console or through the device's logging infrastructure.

---

## Configuration

### Key Configuration Files

| Configuration File                               | Purpose                                                                                                       | Override Mechanism                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `accelerator-home-ui/settings.json`              | Lightning SDK stage settings (clear color, image worker), platform ID, version string, and debug flag         | Replace file in the installed dist directory        |
| `bolt/package-configs/com.rdkcentral.refui.json` | Application package manifest: entry point, version, permissions, runtime dependency on WPE                    | Updated at package build time                       |
| `accelerator-home-ui/static/data/AppListInfo.js` | Static list of partner applications with callsigns, URLs, and launch parameters shown in the home screen grid | Replace file in the installed static data directory |

### Key Configuration Parameters

| Parameter                               | Type   | Default                             | Description                                                                                 |
| --------------------------------------- | ------ | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `platformSettings.version`              | string | `"6.0.41"`                          | Application version string logged at startup and shown when `showVersion` is enabled.       |
| `platformSettings.debug`                | bool   | `false`                             | Enables Lightning.js debug overlay when set to `true`.                                      |
| `platformSettings.enableAppSuspended`   | bool   | `true`                              | Enables the Lightning app-suspended lifecycle mode.                                         |
| `platformSettings.stage.useImageWorker` | bool   | `true`                              | Offloads image decoding to a Web Worker for smoother rendering.                             |
| `CONFIG.thunderConfig.host`             | string | `"127.0.0.1"`                       | ThunderJS WebSocket host address.                                                           |
| `CONFIG.thunderConfig.port`             | number | `9998`                              | ThunderJS WebSocket port.                                                                   |
| `CONFIG.language`                       | string | `localStorage "Language"` or `"en"` | UI display language; read from `localStorage` on startup.                                   |
| `GLOBALS.selfclientAppName`             | string | `"com.rdkcentral.refui"`            | Application identifier used to resolve the main AppManager/window-manager client.           |
| `EnergySaverInterval`                   | string | —                                   | Inactivity timeout for energy saver mode; stored in `localStorage` via Lightning `Storage`. |
| `ScreenSaverTimeoutInterval`            | string | —                                   | Inactivity timeout for screen saver; stored in `localStorage`.                              |
| `TimeoutInterval`                       | string | —                                   | Sleep timer timeout; stored in `localStorage`.                                              |

### Runtime Configuration

The language preference can be changed at runtime through the Settings screen, which writes the selected language code to the `localStorage` key `"Language"`. On the next load, `CONFIG.language` reads this stored value and applies the corresponding locale.

The device power state can be changed at runtime via the `org.rdk.PowerManager` Thunder plugin:

```bash
curl -d '{"jsonrpc":"2.0","id":1,"method":"org.rdk.PowerManager.1.setPowerState","params":{"powerState":"STANDBY","standbyReason":"Manual"}}' http://127.0.0.1:9998/jsonrpc
```

### Configuration Persistence

User-configurable settings (language, inactivity timer intervals, energy saver mode) are persisted across reboots via the Lightning `Storage` API (backed by `localStorage` in the WPE browser). Device-level preferences such as voice guidance and audio description are persisted by `org.rdk.UserSettings` and `org.rdk.PersistentStore` on the middleware side.
