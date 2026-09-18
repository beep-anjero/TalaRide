# TalaRide

Privacy-first React Native application for recording tricycle and pedicab rides
and helping passengers recover lost belongings.

## Current scope

Phase 2 UI is complete: all 14 approved prototype screens are available through
Expo Router with in-memory mock rides, requests, notifications, and a sample
profile. The camera screen remains a placeholder. No backend, persistent
storage, camera, OCR, authentication service, or tracking integration is enabled.

## Development

- Install Node.js LTS and run `npm ci`.
- Run `npm start`, then scan the QR code using a compatible Expo Go installation.
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
