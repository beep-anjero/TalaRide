# Phase 11 release setup

Date started: 2026-09-25

## Repository configuration completed

- Android application ID: `com.beepanjero.talaride`
- iOS bundle ID: `com.beepanjero.talaride`
- EAS development, internal preview, and production build profiles
- Remote build-number management with production auto-increment
- Production submission profile
- Native notification config plugin and project-ID-aware token registration
- Common Firebase service-account credential filenames excluded from Git
- EAS project `@an_jelo/talaride` linked with project ID
  `05dd99d8-b198-4386-bdc7-e85e4d5df01c`
- Public Supabase build variables configured for development, preview, and
  production EAS environments
- Android signing keystore generated and stored by EAS

The application IDs become permanent store identities after the first published
build. Change them before creating store listings if a different organization
domain is required.

## Expo project linking (complete)

The repository is linked to
[`@an_jelo/talaride`](https://expo.dev/accounts/an_jelo/projects/talaride). To
verify the current login and link:

```bash
npx eas-cli whoami
npx eas-cli project:info
```

The project ID under `expo.extra.eas.projectId` in `app.json` is public rather
than a credential. Keep it committed so development, preview, and production
builds attribute push tokens to the same stable project.

The linked configuration can be validated with:

```bash
npx eas-cli project:info
npx eas-cli config --platform android --profile development
npx eas-cli config --platform ios --profile development
```

## Push credentials

Android requires an FCM V1 service-account key from the matching Firebase
project. Upload it through `npx eas-cli credentials`; never copy the private JSON
into source control, `.env`, an `EXPO_PUBLIC_*` variable, or Supabase client
configuration. Confirm that the FCM sender/project matches the Android app.

iOS requires an Apple Developer Program team, a registered test device for an
internal device build, and an APNs key. Let EAS manage the distribution,
provisioning, and APNs credentials during `npx eas-cli credentials` or the first
iOS build. Do not commit `.p8`, `.p12`, provisioning profiles, or passwords.

Current credential status: Android app signing is configured. Android FCM V1
and all Apple signing/APNs credentials still require their respective external
developer accounts.

## Builds

After project linking and credentials are ready:

```bash
npx eas-cli build --platform android --profile development
npx eas-cli build --platform ios --profile development
npx eas-cli build --platform all --profile preview
npx eas-cli build --platform all --profile production
```

Production builds must not be submitted until the Phase 10 physical-device and
two-account acceptance matrix is complete. Store submission is intentionally a
separate explicit operation:

```bash
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## Required acceptance evidence

- Install the development build on a physical Android device and an iPhone.
- Confirm camera capture and gallery OCR prefill the recognized-number field.
- Enable notifications and confirm a token registers without exposing it in UI
  or logs.
- Exercise the two-account relay flow and verify the generic lock-screen alert,
  Activity navigation, helper response, and resolution state.
- Verify denied notification permission remains recoverable through Settings.
- Confirm preview and production builds contain the expected application IDs,
  versions, privacy behavior, and no secret credential files.

Do not mark Phase 11 complete until EAS linking, both platform credentials,
signed builds, and the physical-device checks have recorded evidence.
