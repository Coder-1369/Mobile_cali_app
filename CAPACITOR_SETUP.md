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
The splash screens actually baked into `android/app/src/main/res/drawable*/`
are already solid dark (`#0c0c0e`) to match your theme — no white flash on
launch. To generate all the icon sizes both platforms need (Android: ~6
densities, iOS: ~15+ sizes, including the App Store's 1024×1024):

```
npm install --save-dev @capacitor/assets
npm run icons
npm run sync
```

Swap in a higher-resolution source image at `resources/icon.png` first
(1024×1024 or larger) if you want the sharpest result — the current one is
upscaled from 512×512, which is fine but not ideal for the largest slots.

---

## Fixed automatically — no action needed

These were bugs from the first native build; they're already fixed in the
code and require nothing further from you:

- **Text overflowing its boxes** — Android's system font-size accessibility
  setting was scaling text past what the CSS expected. Locked with
  `text-size-adjust: 100%`.
- **Grey/blank area around the notch and above the nav bar** — the native
  Android theme didn't have a background color defined at all (missing
  `colors.xml`), so unpainted areas fell back to a default light color. Now
  explicitly dark, matching the app.
- **Bottom nav bar sitting too close to the gesture bar** — added proper
  `env(safe-area-inset-bottom)` padding so it clears Android's gesture area
  on every device, not just ones where the fixed padding happened to be
  enough.
- **Hardware/gesture back button exiting the app** — it now closes an open
  modal first, then returns to the Today tab if you're elsewhere, and only
  minimizes (not force-closes) the app if you're already home with nothing
  open.
- **Exporting a workout not showing any confirmation** — a plain download
  doesn't really exist inside a native app shell, so on native builds export
  now writes the file and opens Android's native Share sheet, which doubles
  as the "it worked" confirmation and lets you save it anywhere (Drive,
  Files, email, etc.).

## Google Sign-In on native Android — one required extra step

The reason sign-in previously bounced you out to a browser and never came
back: Google actively blocks its OAuth sign-in flow from running inside a
bare WebView (a security policy, not something fixable from the web-app
side). The fix was switching to a plugin that uses Android's actual native
Google Sign-In UI (an account picker, no browser at all) — but that requires
one extra piece of Firebase setup you'll need to do once.

Firebase's console walks you through a generic 4-step wizard meant for
*any* Android project, including ones with no existing tooling at all. You're
using Capacitor, which already did steps 3 and 4 for you automatically the
moment you ran `npx cap sync` (I confirmed this myself — your
`android/build.gradle` and `android/app/build.gradle` already have the exact
lines that wizard is asking you to paste in by hand). Here's exactly what to
do at each screen, including which ones to skip:

1. Go to the [Firebase console](https://console.firebase.google.com), open
   your existing project (the same one your web app already uses).
2. Click the gear icon (top left) → **Project settings**.
3. Scroll down to **"Your apps"** → click the **Android icon** (`</>`  is
   web, the little Android robot icon is what you want) to start "Add app."

   **Wizard Step 1 — "Register app":**
   - **Android package name**: `io.github.coder1369.calitraining` (must
     match exactly — this is your `capacitor.config.json`'s `appId`).
   - **App nickname**: anything, e.g. "Cali Training Android."
   - **Debug signing certificate SHA-1**: this field is what actually makes
     Google Sign-In work, so don't skip it. Get the value by running this
     from your project folder (use the same keystore file you created earlier
     when building the signed APK):
     ```
     keytool -list -v -keystore your-keystore-file.keystore -alias your-alias-name
     ```
     It'll ask for the keystore password, then print a block of info —
     find the line starting with `SHA1:` and copy that hex string (with or
     without the colons, either works) into Firebase's field.
   - Click **Register app**.

   **Wizard Step 2 — "Download config file":**
   - Click **Download google-services.json**. Save it somewhere you can
     find it.
   - Click **Next**.

   **Wizard Step 3 — "Add Firebase SDK" — this is the screen you got stuck
   on. Skip it entirely:**
   - Ignore the Kotlin DSL / Groovy code blocks it shows you — that's the
     manual setup Capacitor already did for you automatically.
   - Just click **Next** without pasting or editing anything.

   **Wizard Step 4 — "Run your app to verify installation":**
   - This just wants to see your app launch once and talk to Firebase. You
     can safely click **"Skip this step"** (usually a small link/button near
     the bottom) — you'll verify it yourself in a minute anyway.
   - Click **Continue to console**. You're done in the browser.

4. Now, back in your project folder: take the `google-services.json` file
   you downloaded in Step 2 above, and place it at exactly:
   ```
   android/app/google-services.json
   ```
   (directly inside the `app` folder, right next to `build.gradle` — **not**
   inside `src/`, and not renamed.)
5. Run:
   ```
   npm run sync
   ```
6. Rebuild the signed APK in Android Studio exactly like before (Build →
   Generate Signed Bundle / APK), install it, and try "Sign in with Google"
   again — it should now show Android's native account picker instead of
   bouncing to a browser.

Until you do this, tapping "Sign in with Google" on the native app will show
a toast saying native sign-in isn't set up yet — everything else in the app
keeps working normally either way.
a toast saying native sign-in isn't set up yet — everything else in the app
keeps working normally either way.

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
