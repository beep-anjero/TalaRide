# TalaRide

Privacy-first React Native application for recording tricycle and pedicab rides
and helping passengers recover lost belongings.

## Current scope

The approved screens are connected through Expo Router. Onboarding completion
persists locally, and authentication uses a temporary sample session. Ride
creation, history, search, filtering, editing, and deletion use device-local
SQLite. The camera captures images and offers on-device OCR in a native
development build. The community relay remains a demonstration.

## Phase 5 camera and recognition

The scanner uses Expo Camera for preview, capture, camera switching, and rear
torch control where hardware supports it. Camera permission requests are shown
in the scanner; denied permission, mount errors, and capture failures leave
manual entry available. The gallery action uses the system image picker. No
microphone permission is requested.

OCR uses pinned `expo-mlkit-ocr` 0.2.7: bundled Latin ML Kit on Android and
Apple Vision on iOS (`iosEngine: vision`). Both engines process images locally.
The package uses Expo Modules API and accepts the installed Expo/React versions;
autolinking, JavaScript bundles, Android OCR Kotlin compilation, and an isolated
x86_64 Android debug APK build have been checked for SDK 57. iOS native compilation and recognition accuracy
on hardware are **not yet verified**. The
older Infinite Red wrapper was considered, but its published version targets an
older Expo SDK. See the [selected package documentation](https://github.com/rbayuokt/expo-mlkit-ocr).

Install a development build containing the OCR module, then start Metro with
`npx expo start --dev-client`. Local builds use `npx expo run:android` with an
Android SDK/JDK/device, or `npx expo run:ios --device` on macOS with Xcode and
signing configured. App identifiers/build access must be configured before native
builds; distribution/EAS setup belongs to Phase 11. Expo Go and web use manual
entry when the native OCR module is unavailable. iOS requires 16.4 or later.

Candidates cover numeric, alphanumeric, spaced, and hyphenated identifiers. OCR
characters are not silently corrected. Review/select a candidate, choose its
identifier type, and edit the value before confirming. Failed or empty OCR starts
with an empty input. Only confirmation creates a SQLite record; repeated capture
and save taps are guarded. Retake returns to the existing scanner route.

Photos are copied to `cache/talaride-scans` and retained only through confirmation.
App-created source cache files are removed after processing. Save, retake, and
back/cancel clear the draft and delete its cached photo; abandoned owned copies
are removed at next app startup. Cleanup errors are retried at startup. Gallery
originals outside the app cache are never deleted. OS-owned picker/camera caches
remain subject to OS eviction if cleanup fails. Photos, raw OCR text, and file
paths are not stored in ride records or uploaded. Web images exist only in the
in-memory draft until cleared.
Temporary browser blob URLs are revoked when their draft is cleared.

`npm test` covers candidate extraction, OCR success/empty/error/unavailable paths,
cached-photo cleanup, and stale-draft cleanup. Native camera permissions, flash,
low light, blurry images, OCR accuracy, interruption, and the capture-to-receipt
flow still require device tests. Bundle export does not verify native linking.

Android verification used a temporary app ID (`com.talaride.phase5verification`)
in the ignored `.expo/phase5-native` copy. It did not set a release identifier or
publish/install the app. The first full build failed on Windows' 260-character
filename limit in generated C++ files. Moving CMake staging to a shorter
temporary path and setting `CMAKE_OBJECT_PATH_MAX=256` in that verification copy
allowed the full build to pass. Use a short checkout/build path for future local
Windows native builds; this workaround is not a production app configuration.

## Phase 4 storage and privacy

The database has a transactional, versioned initial migration, account/date and
account/vehicle indexes, and parameterized queries. Each ride has a random UUID,
local account association, identifier type, ride timestamp, creation timestamp,
and optional note/location. Existing demonstration rides are not imported.
Local ride operations require no network connection and never upload records.

One installation currently has one sample local account. SQL reads, edits, and
deletes always include its account ID; this is logical isolation, not real
authentication. Phase 6 must map authenticated users to separate local accounts,
clear the visible cache on account changes, and define sample-data ownership.
Do not treat entering a different email in the sample sign-in as a new account.

SQLite files are currently **unencrypted**. The OS app sandbox and device lock
provide baseline protection, but do not protect extracted databases or device
backups. SQLCipher is the preferred native encryption mechanism; it requires a
custom development build and secure per-account key storage, and is unavailable
in Expo Go/web. Encryption is not enabled here and must be verified before
production use with sensitive data. See [Expo SQLite documentation](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/).

Web SQLite uses WASM and requires cross-origin isolation. Metro is configured
for WASM and COOP/COEP headers. A deployed web server must also send
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp`. Browser storage can be cleared by
the user/browser and is not an encrypted native database.

Run `npm test` with Node 24 to test the actual repository SQL against a file-backed
SQLite engine: persistence after reopening, search/filtering, edit/delete,
parameter binding, repeated vehicle numbers, and account isolation. These tests
replace the Expo transport only; native Expo SQLite and airplane-mode interaction
still require Android/iOS device testing.

## Development

- Install Node.js LTS and run `npm ci`.
- Run `npx expo start --dev-client` with an installed native development build for OCR.
- Expo Go can preview camera/manual entry; it does not contain the OCR module.
- Run `npm run android` with an Android emulator or connected device.
- Run `npm run ios` on macOS with an iOS simulator, or use Expo Go on an iPhone.
- Run `npm run web` for the browser preview.
- Run `npm run check` for TypeScript, ESLint, and formatting verification.
- Run `npm run format` to format source and configuration files.
- Run `npx expo-doctor` for Expo configuration and dependency checks.

No environment variables are required yet. `.env.example` documents the policy;
local environment files are ignored. Public Expo variables cannot hold secrets.

## Structure

- `src/app`: file-based routes for all approved screens and root navigation layout.
- `src/components`: reusable UI components.
- `src/constants`, `src/hooks`, `src/types`, `src/mocks`: shared UI foundations.
- `assets/branding`, `assets/illustrations`: approved standalone asset exports.
- `assets/references`: original supplied prototypes and infographic.

The supplied reference images are visual requirements. Phase 2 uses crops from
the approved prototype composite for its logo and illustrations while preserving
the finalized layouts. App icons from the Expo template remain temporary until
approved standalone branding is available.

Dependencies for UI include safe areas, native screens, linking, vector icons,
SVG rendering, images, fonts, and web preview support. Install native libraries
with `npx expo install` to keep them compatible with this project's Expo SDK.

## Phase 1 verification

- `npm run check`: TypeScript, ESLint, and Prettier passed.
- `npx expo-doctor`: all 21 checks passed.
- `npx expo export --platform all`: Android, iOS, and web bundles exported.
- `npm run web`: the setup route rendered successfully in the browser.
- Native device/simulator launch has not been tested on this Windows host.
- `npm audit --omit=dev`: 13 moderate findings in the upstream Expo/Router
  dependency tree; no high or critical findings. npm's suggested fixes include
  incompatible major downgrades, so no forced dependency changes were applied.

Exported bundles and local Expo state are ignored and are not committed.
