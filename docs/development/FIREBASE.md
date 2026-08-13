# Firebase Managed Platform Foundation

WP-F04 now uses the real managed Firebase project directly.

## Canonical Firebase target

```text
Project ID:   nocschedule1
Hosting site: nocmduscheduler
Public URL:   https://nocmduscheduler.web.app
Region:       asia-southeast1
```

The repository no longer requires Firebase Emulator Suite for normal
development, QA, or CI.

## Production topology

```text
Browser
  -> Firebase Hosting site nocmduscheduler
     -> Vite static bundle
     -> /api/** rewrite
        -> Cloud Functions 2nd gen api
           -> Express /api/v1
              -> Firebase Admin SDK
                 -> Cloud Firestore / Firebase Auth
```

## Browser SDK

The Firebase Web SDK connects directly to `nocschedule1`.

The Firebase web config is public client configuration. It does not grant
database authorization. Browser Firestore access is still controlled by
Firestore Security Rules.

WP-F04 keeps browser Firestore access fail-closed:

```text
allow read, write: if false;
```

Later authentication/authorization phases will open only the client access that
is intentionally required.

## Server SDK

Cloud Functions uses the Firebase Admin SDK.

In the deployed Google/Firebase runtime, Admin SDK credentials are supplied by
the managed environment.

If a developer later needs to run API code locally against the real project,
Google Application Default Credentials must be configured on that developer
machine. Credential files must never be committed.

## CI policy

CI does not create Firebase Auth users or write Firestore documents in the real
project.

CI validates:

- exact project/site configuration;
- fail-closed rules source;
- TypeScript/lint/format;
- unit/API integration;
- production builds;
- API smoke;
- dead code;
- browser E2E/accessibility.

Live Firebase deployment is an explicit operator action.

## Firebase CLI

Authenticate once:

```powershell
firebase login
```

Select/check the project:

```powershell
npm run firebase:project
```

Deploy everything owned by the current foundation:

```powershell
npm run firebase:deploy
```

Hosting only:

```powershell
npm run firebase:deploy:hosting
```

Functions + Firestore rules/indexes:

```powershell
npm run firebase:deploy:backend
```

A Hosting deploy target named `app` maps to the site ID
`nocmduscheduler`.

## Important production requirement

Deploying Cloud Functions requires the Firebase project to use the Blaze
pricing plan.

## Analytics

The supplied Web SDK configuration contains a Measurement ID, but Analytics is
not initialized in WP-F04. Analytics can be introduced later when product
telemetry requirements are defined.
