# Phase 10 QA record

Date: 2026-09-20

## Automated coverage

The Node test suite covers authentication configuration and callback parsing,
registration/sign-in/recovery actions, session restore and expiration behavior,
offline sign-out, protected routes, account isolation, SQLite create/read/search/
edit/delete/clear/persistence, OCR extraction and failure fallbacks, temporary
photo cleanup, relay ownership and future-scan rules, request expiration and
duplicate prevention, helper responses, notification permission/routing/privacy,
RLS, server authorization, input limits, atomic rate limiting, and retention.

`npm run check`, `npx expo-doctor`, Deno checks for both Edge Functions, and Expo
exports for web, Android, and iOS are required release-candidate checks. Exporting
proves that every Expo Router route can be bundled; it does not prove visual or
hardware behavior.

## Screen and layout inventory

The app has 13 route files representing 14 designed screens because onboarding
contains three states within one route. The shared `Screen` component constrains
content to a 480 px reading width, supports safe areas, scrolling, and keyboard
avoidance. Splash, onboarding, and confirmation use window dimensions. The app
is intentionally portrait-only, so landscape is not a supported orientation.

Routes reviewed: splash/index, onboarding (three screens), sign-in,
authentication callback, home, scan, confirmation, receipt, rides, ride detail,
report lost item, activity, and profile/settings.

## Manual device matrix still required

These checks cannot be honestly completed in this Windows-only automated run:

- Android physical device: camera allow/deny/do-not-ask-again, clear/blurry/
  low-light captures, flash, gallery selection, manual correction, backgrounding,
  and local push receipt/navigation.
- iPhone physical device: the same camera/OCR/push cases plus iOS permission and
  safe-area behavior.
- Small and large physical screens: visual comparison of all 14 designed screens,
  keyboard overlap, text scaling, and portrait layout.
- Two real confirmed Supabase accounts: end-to-end future-scan relay, helper
  response, push delivery, resolution, and account deletion. Use disposable test
  accounts because deletion is permanent.
- Email delivery: confirmation and recovery through configured production SMTP.

Do not mark these cases passed until evidence is collected on the listed devices.

## Known non-blocking release dependencies

- Production push delivery needs an EAS project ID and Android/iOS push
  credentials in Phase 11.
- Supabase retention runs opportunistically with relay traffic; schedule the
  cleanup function if strict wall-clock deletion is required during inactivity.
- `npm audit` reports 13 moderate transitive-development dependency advisories
  and no high or critical advisories. Do not apply `npm audit fix --force`
  without a compatibility review.
