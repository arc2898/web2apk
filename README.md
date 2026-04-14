# Web2APK

**Convert any website to an Android APK in minutes.**

Give it an app name, an icon, and a URL — get a real Android APK you can install on any phone.

```bash
npx web2apk "My App" ./icon.png "https://example.com"
```

## Features

- Custom app name
- Custom icon (any PNG image)
- Any URL (PWA, web app, mobile site)
- Real Android APK — installs on any Android device
- Built with Capacitor (native web container)

## Requirements

- Node.js 18+
- Android SDK (for building the APK)
  - Set `ANDROID_HOME` env var (e.g. `C:\Users\You\AppData\Local\Android\Sdk`)
  - Or install via Android Studio

## Usage

```bash
npx web2apk "App Name" /path/to/icon.png "https://your-site.com"
```

### Example

```bash
npx web2apk "Reddit" ./reddit-icon.png "https://reddit.com"
```

### What it does

1. Scaffolds a Capacitor project
2. Resizes your icon to all Android densities
3. Configures the URL as the app's start page
4. Syncs to Android
5. Builds the APK

The APK lands in your current directory when done.

## Install globally

```bash
npm install -g web2apk
web2apk "My App" ./icon.png "https://..."
```

## How it works

Web2APK wraps your URL in a Capacitor WebView — the same tech behind Ionic/PWA Builder apps. It's a real native APK, not a browser shortcut.

## License

MIT
