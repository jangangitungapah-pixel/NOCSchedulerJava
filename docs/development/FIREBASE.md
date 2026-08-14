# Firebase Spark Client Platform

WP-F04 uses the real Firebase project directly without Cloud Functions or the Emulator Suite.

## Canonical target

```text
Project ID:   nocschedule1
Hosting site: nocmduscheduler
Public URL:   https://nocmduscheduler.web.app
```

## Runtime topology

```text
Browser
  -> Firebase Hosting
     -> Vite SPA
  -> Firebase Web SDK
     -> Firebase Authentication
     -> Cloud Firestore
     -> Analytics (production only)
```

There is no `/api/**` rewrite, Express server, Firebase Admin SDK runtime, Cloud Functions,
Cloud Run, Cloud Build application pipeline, or Artifact Registry application dependency in the
canonical baseline.

## Security model

The browser is untrusted.

- Firebase Authentication establishes user identity.
- Firestore Security Rules authorize every direct document read/write.
- UI visibility is never an authorization boundary.
- `packages/domain` owns deterministic business rules but cannot grant database access.
- Firestore transactions/batches are used where atomic client-safe mutations are required.
- service-account/private-key material is forbidden from source control.
- privileged behavior that cannot be made safe with Auth + Rules is out of the current baseline
  until an explicit architecture reapproval.

WP-F04 remains fail-closed:

```text
allow read, write: if false;
```

WP-F06 will replace that baseline with authenticated, role/capability-scoped rules.

## Firebase Web config

Canonical public Web SDK identifiers:

```text
projectId:         nocschedule1
authDomain:        nocschedule1.firebaseapp.com
storageBucket:     nocschedule1.firebasestorage.app
messagingSenderId: 757713432444
appId:             1:757713432444:web:c8557af004720fab67fef9
measurementId:     G-YSETL08XS6
```

The API key is public Firebase client configuration, not an Admin credential.

## CLI

```powershell
firebase login
npm run firebase:project
npm run firebase:deploy:hosting
npm run firebase:deploy:firestore
npm run firebase:deploy
```

`firebase deploy --only hosting` must never attempt to deploy a Function under this architecture.

## Billing posture

The baseline is intentionally compatible with the Firebase Spark feature set used by this
application: Hosting, Authentication, Firestore within Spark quotas, and the Firebase Web SDK.

If a future requirement genuinely needs a trusted backend, that must be handled as a new explicit
architecture decision rather than silently reintroducing Functions.
