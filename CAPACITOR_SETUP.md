# Building the standalone Android + iOS apps (Capacitor)

This turns the web app into a real native shell for Android and iOS, using
Capacitor. Unlike the TWA/PWABuilder APK, this does **not** depend on Chrome
being installed — Android builds use the system WebView component, and iOS
builds use Apple's native WKWebView. Both are bundled directly into the app
package, so the app is fully standalone once installed.

## One-time setup (do this first, on your own machine)

You need [Node.js](https://nodejs.org) installed (any recent LTS version).

1. Open a terminal in this project folder.
2. Run:
   ```
   npm install
   ```
   This installs Capacitor's tooling (already configured in `package.json`).

## Keeping the native apps in sync with your web app

Your actual app code lives in the root `index.html` (same file you've always
edited — this is also what GitHub Pages serves). The `www/` folder is a
staging copy Capacitor uses to build the native apps from. Whenever you've
changed `index.html` and want that reflected in the Android/iOS builds, run:

```
npm run sync
```

This copies the latest `index.html` (and manifest/service worker/icons) into
`www/`, then pushes them into both native projects. Run this before every
build.

## App icon & splash screen

A source icon is already in `resources/icon.png` (from your existing
`icon-512.png`), plus a matching dark splash screen at `resources/splash.png`.
To generate all the icon sizes both platforms need (Android: ~6 densities,
iOS: ~15+ sizes, including the App Store's 1024×1024):

```
npm install --save-dev @capacitor/assets
npm run icons
npm run sync
```

Swap in a higher-resolution source image at `resources/icon.png` first
(1024×1024 or larger) if you want the sharpest result — the current one is
upscaled from 512×512, which is fine but not ideal for the largest slots.

---

## Android — building the APK

1. Install [Android Studio](https://developer.android.com/studio) (free).
2. Run `npx cap open android` — this opens the `android/` folder as an
   Android Studio project.
3. Let Gradle finish syncing (first time takes a few minutes).
4. Build → Generate Signed Bundle / APK → APK → create a new keystore (or
   reuse the one from your PWABuilder build — doesn't matter, this is a
   different app package) → build.
5. The signed APK lands in `android/app/release/`. Sideload it exactly like
   before — no Play Store needed.

This APK does not depend on Chrome. It'll keep working even if Chrome is
uninstalled, as long as Android's System WebView component is present, which
is a near-universal, essentially non-removable part of Android itself.

## iOS — this is where Apple's rules apply, not mine

Apple only allows building iOS apps on a Mac, using Xcode — this isn't a
Capacitor limitation, it's an Apple platform requirement with no workaround.
If you don't have a Mac, options are: borrow/rent one (cloud Mac services
like MacinCloud exist), ask a friend, or a local Apple Store's genius bar
won't help but a campus Mac lab might.

1. On a Mac, install Xcode from the App Store (free, but large — a few GB).
2. Run `npx cap open ios` — opens `ios/App/App.xcworkspace` in Xcode.
3. To run it on your own iPhone for free (no Apple Developer account needed):
   plug your iPhone into the Mac, select it as the build target, hit Run.
   Apple lets you sideload this way for free, but it expires after 7 days
   and needs re-installing from Xcode each time.
4. To share with other iOS users properly, you need an
   [Apple Developer Program](https://developer.apple.com/programs/) account
   ($99/year — this is Apple's fee, not optional, not avoidable). With that:
   - **TestFlight**: upload a build from Xcode → invite up to 10,000 testers
     by email or a public link → they install via the TestFlight app. Apple
     does a quick automated review (usually hours, not the full App Store
     review). This is the realistic way to share with iOS users without
     going fully public.
   - **App Store**: full public release, full review process.

## If a Mac genuinely isn't accessible right now

The zero-cost, zero-build-tools fallback for iOS is: open the site in Safari
on an iPhone → Share → **Add to Home Screen**. Because the manifest already
has `"display": "standalone"`, this launches full-screen with no Safari UI,
and works offline the same way the Android PWA install does. It's not a
"real" App Store/TestFlight app, but it's genuinely usable today with nothing
to install, no Apple Developer fee, and no Mac required.
