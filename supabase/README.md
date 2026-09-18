# Phase 6 backend setup

This directory is migration/function source, not proof of deployment. The mobile
publishable key cannot apply migrations or deploy Edge Functions. No private rides,
vehicle identifiers, scan photos, notes, or locations are sent to this backend.

## Dashboard setup (no CLI credentials needed)

1. Open the intended TalaRide project. In Authentication → Providers, enable
   Email and keep email confirmation enabled. Leave Google and Apple disabled
   until their respective developer-console configuration is ready.
2. In Authentication → URL Configuration, add the exact allowed redirect URLs:
   `talaride://auth-callback` (installed native development build) and
   `http://localhost:8081/auth-callback` (local web preview). Set the development
   Site URL to `http://localhost:8081`. Add your actual web origin if the preview
   runs on another port/host. Do not use unrestricted production wildcards.
3. Open SQL Editor and run the entire
   `migrations/202609180001_profiles.sql` **once**. It creates profiles, RLS,
   restricted grants, a signup trigger, and backfills existing users. It creates
   no ride or relay tables. If it fails, stop and report the error; do not remove
   existing tables or disable RLS to work around it.
4. In Edge Functions, create/deploy a function named `account-profile` using
   `functions/account-profile/index.ts`. Disable the legacy gateway JWT check
   for this function to match `config.toml`. The handler still REQUIRES a valid
   user's bearer JWT, verifies it with Auth `getUser`, and applies that JWT to RLS
   queries. Do not remove its authentication checks. Supabase provides its server
   URL/legacy anon key through the function runtime; no service-role key is used.
   If legacy keys are unavailable, configure the runtime with a public key and
   update the key lookup before deployment rather than inserting a secret key.
5. Enable the Data API and expose `public` if it was disabled at project creation.
   The app uses the authenticated Data API to read/update profiles; the Edge
   function is a separately deployable authenticated backend foundation, not an
   automatic relay or private ride uploader.

Current implementation follows Supabase's
[React Native Auth guide](https://supabase.com/docs/guides/auth/quickstarts/react-native),
[user profile guidance](https://supabase.com/docs/guides/auth/managing-user-data),
and [JWT/header migration guidance](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).

## App configuration

Copy `.env.example` to the repository's ignored `.env`, and set only
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
The app rejects secret/service-role key formats. Restart Metro after changing
environment values. Never commit database passwords, access tokens, refresh
tokens, or secret keys. The app scheme is already `talaride`.

Rebuild the native development client after adding SecureStore. Expo Go does not
provide the installed app's `talaride://` callback scheme; use the development
build for native email links, or the web preview for web email links. Signup can
also be confirmed in a browser and followed by email/password sign-in in the app.
For recovery, open the link on the platform selected when the recovery was requested.

Supabase's built-in SMTP only sends to authorized project-team email addresses
and has a small testing quota. Use your team email for initial confirmation and
recovery tests. Configure custom SMTP before registering ordinary passengers;
do not disable confirmation as a workaround. See the
[SMTP restrictions](https://supabase.com/docs/guides/auth/auth-smtp).

## Optional authenticated CLI deployment

Use the official Supabase CLI (Node 22+ if using npm). Run commands from the
repository root, and authenticate privately in your own terminal:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run
# Review the planned migration before changing the linked database.
npx supabase db push
npx supabase functions deploy account-profile
```

Do not run `db reset --linked`: that is destructive. If the SQL was already run
in the dashboard, reconcile the migration history before CLI `db push`; do not
apply the same table-creation migration twice. `config.toml` supplies local/CLI
configuration; it does not silently change hosted Auth dashboard settings.

## Required live acceptance checks

- Register a real email you control; confirm the email; sign in. A profile row
  should be created. Invalid credentials must show an error without entering Home.
- Change the display name under Profile → Account Settings. Restart and verify
  the profile and session restore. Offline profile errors must not hide local rides.
- Request password recovery. Open the link on the intended platform, enter a new
  password, then verify the new password works and the old one fails. Cancel
  Recovery must clear the temporary session. Expired links must show an error.
- Sign out; a direct `/rides`, `/confirm`, or `/profile` route must not render
  private screens. Sign in as another user; the first user's local rides must be
  absent. Sign back in as the first user; their rides must remain.
- With an already-restored session, enable airplane mode and record/manage a
  manual ride. Signing in, renewing an expired session, and cloud profile edits
  require internet. Offline sign-out removes the device session; server-side
  revocation cannot be confirmed without connectivity. Existing access tokens
  can remain valid until their expiry.
- Call `account-profile` without a JWT or with an invalid JWT: expect 401. With a
  valid user's JWT: expect only their profile. Unsupported methods, extra fields,
  and oversized/invalid input must be rejected. The current function is not a
  web API with CORS support; the web app uses the Data API instead.

Local `npm test` executes the migration in embedded PostgreSQL (PGlite), including
two-user/anonymous access, column grants, trigger/backfill, and deletion cascade.
Provider/form tests use mocked native/network transports. They do not prove
hosted email delivery, redirects, remote RLS deployment, or device-keychain behavior.

Google/Apple are explicitly unavailable in this phase until configured; full relay,
push notifications, account deletion, and additional security/privacy controls
remain in their separately approved phases.
