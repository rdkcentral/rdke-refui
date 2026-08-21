# RDK Reference UI - Flutter Web Implementation

A minimal Flutter Web port of the [accelerator-home-ui](../accelerator-home-ui/) LightningJS application,
designed to verify Flutter Web compatibility on RDK/WPE target devices.

> **Note:** This is NOT a full migration. It recreates only the basic application flow
> (Splash → Home → Navigation) with mock data to test Flutter Web rendering on the device.

---

## Prerequisites

### Install Flutter SDK

1. Download Flutter from: https://docs.flutter.dev/get-started/install
2. Extract and add to PATH:
   ```bash
   # Linux/macOS
   export PATH="$PATH:/path-to-flutter/bin"

   # Windows (add to System Environment Variables)
   # Or run: setx PATH "%PATH%;C:\path-to-flutter\bin"
   ```
3. Verify installation:
   ```bash
   flutter --version
   flutter doctor
   ```
4. Enable web support:
   ```bash
   flutter config --enable-web
   ```

### Required Tools
- Flutter SDK >= 3.0.0
- Dart SDK (included with Flutter)
- Chrome browser (for local development)
- Python 3 (optional, for serving the production build)

---

## Project Structure

```
flutter-app/
├── lib/
│   ├── main.dart              # App entry point, routes, theme
│   ├── screens/
│   │   ├── splash_screen.dart # Splash screen with RDK logo
│   │   ├── home_screen.dart   # Main home screen with app grid
│   │   └── settings_screen.dart # Settings menu
│   ├── widgets/
│   │   ├── top_panel.dart     # Top bar (logo, time, settings)
│   │   ├── side_panel.dart    # Side navigation panel
│   │   └── app_card.dart      # App card component
│   └── services/
│       └── mock_api.dart      # Mock data replacing Thunder APIs
├── assets/
│   ├── images/                # Copied from LightningJS static/images
│   │   ├── splash/
│   │   ├── apps/
│   │   ├── sidePanel/
│   │   └── topPanel/
│   └── fonts/
│       └── Play/              # Play font family
├── web/
│   ├── index.html             # Web entry point
│   └── manifest.json          # PWA manifest
├── pubspec.yaml               # Flutter dependencies & asset config
├── flutter-dist.sh            # Build script (Linux/macOS)
├── flutter-dist.ps1           # Build script (Windows)
├── package.json               # npm scripts (optional)
└── README.md                  # This file
```

---

## Running Locally (Development)

```bash
cd flutter-app

# Get dependencies
flutter pub get

# Run in Chrome with hot-reload
flutter run -d chrome --web-port 8080
```

The app will launch in Chrome at `http://localhost:8080`.

### Keyboard Navigation (simulating remote control)
- **Arrow keys** — Navigate between app cards
- **Enter** — Select/launch app (shows mock notification)
- **Mouse/Touch** — Click on side panel, settings, app cards

---

## Generating Production Build

### Option 1: Using the build script (recommended)

**Windows (PowerShell):**
```powershell
cd flutter-app
powershell -ExecutionPolicy Bypass -File flutter-dist.ps1
```

**Linux/macOS:**
```bash
cd flutter-app
chmod +x flutter-dist.sh
./flutter-dist.sh
```

### Option 2: Using npm scripts
```bash
cd flutter-app
npm run flutter-dist        # Windows
npm run flutter-dist:unix   # Linux/macOS
```

### Option 3: Manual build
```bash
cd flutter-app
flutter clean
flutter pub get
flutter build web --release --web-renderer html

# Copy output
# The build output is in: flutter-app/build/web/
# Copy to project root:
cp -r build/web ../flutter-dist    # Linux/macOS
xcopy /E /I build\web ..\flutter-dist   # Windows
```

---

## Production Build Output

After building, the `flutter-dist/` folder (in the project root) will contain:

```
flutter-dist/
├── index.html              # Entry point
├── flutter.js              # Flutter engine loader
├── flutter_bootstrap.js    # Bootstrap script
├── main.dart.js            # Compiled Dart application
├── assets/
│   ├── AssetManifest.json
│   ├── FontManifest.json
│   ├── fonts/
│   ├── images/
│   └── packages/
└── icons/
```

This folder is deployable as a static website, similar to the LightningJS `dist/` folder.

---

## Serving the Production Build

```bash
cd flutter-dist

# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve -s . -l 8080

# Using any static file server
# Point it to the flutter-dist/ directory
```

Then open: `http://localhost:8080`

---

## Deploying to RDK/WPE Device

1. Build the production output (`flutter-dist/`)
2. Transfer files to the device (same method used for LightningJS `dist/`):
   ```bash
   scp -r flutter-dist/ root@<device-ip>:/opt/www/
   ```
3. Configure WPE browser to load: `http://localhost/index.html`

The Flutter Web build uses the **HTML renderer** (`--web-renderer html`) which provides
better compatibility with embedded browsers like WPE WebKit.

---

## LightningJS Features — Migration Notes

| LightningJS Feature | Flutter Equivalent | Status |
|---|---|---|
| `Lightning.Component` | `StatefulWidget` / `StatelessWidget` | ✅ Implemented |
| `Router` (page navigation) | `Navigator` with named routes | ✅ Implemented |
| `Utils.asset()` (static assets) | `AssetImage` / `Image.asset()` | ✅ Implemented |
| `Language.translate()` | `Localizations` / hardcoded strings | ⚠️ Mock (hardcoded EN) |
| Canvas-based rendering | HTML/DOM rendering (html renderer) | ✅ Built-in |
| `ThunderJS` (device APIs) | Not available | ❌ Mocked |
| `RDKShellApis` | Not available | ❌ Mocked |
| `Storage` (local storage) | `SharedPreferences` / `window.localStorage` | ⚠️ Not needed for POC |
| `Lightning.components.ListComponent` | `ListView` / `GridView` | ✅ Implemented |
| Key handling (`_handleKey`) | `KeyboardListener` / `RawKeyboardListener` | ✅ Implemented |
| Component focus system | `FocusNode` / `FocusScope` | ✅ Basic implementation |
| Animations (alpha, scale) | `AnimatedContainer` / `AnimationController` | ✅ Implemented |
| `CONFIG.theme` | `ThemeData` | ✅ Implemented |
| FireBolt SDK | Not available | ❌ Not applicable |
| AAMP Video Player | `video_player` package (if needed) | ❌ Not in scope |
| Bluetooth/WiFi APIs | Not available in browser | ❌ Mocked |
| DTV/EPG | Not applicable for POC | ❌ Not in scope |

### Key Differences

1. **Rendering Engine**: LightningJS uses WebGL canvas rendering; Flutter Web uses either
   HTML/CSS/Canvas (html renderer) or CanvasKit (Skia-based). We use `--web-renderer html`
   for better WPE compatibility.

2. **Focus Management**: LightningJS has a built-in focus/state system; Flutter uses
   `FocusNode` and `FocusScope` widgets for keyboard/remote navigation.

3. **Device APIs**: All Thunder/RDKShell APIs are mocked. This build only tests
   rendering and basic interactivity, not device integration.

4. **Bundle Size**: Flutter Web builds are larger than LightningJS builds (~2-4MB vs ~500KB).
   The HTML renderer is smaller than CanvasKit but has slightly different rendering behavior.

---

## Renderer Options

| Renderer | Command | Size | WPE Compat | Notes |
|---|---|---|---|---|
| HTML | `--web-renderer html` | Smaller | Better | Uses DOM elements, CSS |
| CanvasKit | `--web-renderer canvaskit` | Larger (~2MB+) | May vary | Uses Skia via WASM |
| Auto | `--web-renderer auto` | Varies | Varies | Mobile→HTML, Desktop→CanvasKit |

**Recommendation for RDK/WPE:** Start with `html` renderer. If rendering quality
is insufficient, try `canvaskit`.

---

## Troubleshooting

### Flutter SDK not found
```bash
flutter doctor    # Check installation status
which flutter     # Verify PATH (Linux/macOS)
where flutter     # Verify PATH (Windows)
```

### Build fails with asset errors
Ensure all referenced images exist in `assets/` and are declared in `pubspec.yaml`.

### Blank screen on device
- Check browser console for JavaScript errors
- Verify the device's WebKit version supports ES6+
- Try `--web-renderer html` if using CanvasKit
- Ensure `base href` in index.html matches deployment path

### Large bundle size
- Use `--web-renderer html` (smaller than CanvasKit)
- Run `flutter build web --release` (not debug)
- Consider `--dart2js-optimization O4` for aggressive optimization

---

## License

Copyright 2020 RDK Management. Licensed under Apache License 2.0.
See [LICENSE](../LICENSE) for details.
