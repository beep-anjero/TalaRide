# Phase 11 Android APK setup

Date started: 2026-09-25

## Scope

This phase is limited to an installable Android testing APK. It does not include
iOS, Apple credentials, production builds, app-store submission, Firebase/FCM,
or push-notification credentials.

## Completed setup

- EAS project:
  [`@an_jelo/talaride`](https://expo.dev/accounts/an_jelo/projects/talaride)
- EAS project ID: `05dd99d8-b198-4386-bdc7-e85e4d5df01c`
- Android application ID: `com.beepanjero.talaride`
- EAS-managed Android signing keystore
- Development and internal preview build profiles
- Public Supabase variables available to the EAS development and preview builds

The EAS project ID is public and remains committed under
`expo.extra.eas.projectId`. Signing credentials stay on EAS and are not stored in
the repository.

## Build commands

Create a development APK containing the Expo development client:

```bash
npx eas-cli build --platform android --profile development
```

Create a standalone internal preview APK:

```bash
npx eas-cli build --platform android --profile preview
```

The preview profile explicitly uses Android's `apk` build type. No production or
submission profile is configured.

## Testing checklist

- Install the APK on a physical Android device.
- Sign in using the configured Supabase project.
- Capture a clear vehicle plate and confirm OCR prefills the number.
- Choose a plate image from the gallery and confirm the same behavior.
- Correct the detected number manually and save the ride.
- Restart the app and confirm local rides persist.

Push notification delivery is outside this phase and is expected to remain
unavailable until separately configured.
