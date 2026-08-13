# Firebase Platform & Emulator Foundation

WP-F04 establishes Firebase as managed infrastructure without introducing product authentication or business persistence ahead of their phases.

## Production topology

```text
Browser
  -> Firebase Hosting
     -> static Vite build
     -> /api/** rewrite
        -> Cloud Functions 2nd gen
           -> Express /api/v1
              -> Firebase Admin SDK
                 -> Cloud Firestore
```

The function codebase is `apps/api`, uses Node.js 22, and exports the existing Express application as the HTTPS function `api`.

## Local safety policy

The canonical local Firebase project is:

```text
demo-nocscheduler
```

The `demo-` prefix is intentional. Normal local workflows must not point to a real Firebase project.

Emulators bind only to `127.0.0.1`:

| Service | Port |
|---|---:|
| Emulator UI | 4000 |
| Hosting | 5000 |
| Functions | 5001 |
| Firestore | 8180 |
| Authentication | 9099 |

The browser Firebase adapter defaults to emulator mode during Vite development.

The Admin SDK adapter refuses live Firebase access outside production unless an explicit live-project override is supplied. Destructive seed/reset logic additionally requires emulator mode plus a `demo-*` project ID.

## Daily hot development

```powershell
npm run dev:firebase
```

This runs:

- Auth emulator;
- Firestore emulator;
- local Express API with emulator-safe environment variables;
- Vite web dev server.

Vite continues to proxy `/api` to the local Express API.

## Full Firebase topology

To validate the built application through Firebase Hosting + Functions emulators:

```powershell
npm run firebase:emulators
```

The command builds the API and web first.

URLs:

```text
Web via Hosting: http://127.0.0.1:5000
Emulator UI:     http://127.0.0.1:4000
```

## Deterministic reset/seed

With Auth and Firestore emulators already running:

```powershell
npm run firebase:seed
```

The seed command refuses non-demo/live targets, clears Auth emulator users, recursively clears Firestore emulator collections, then writes one deterministic `foundationMetadata/seed` marker.

No production business seed data is introduced in WP-F04.

## Firebase tests

```powershell
npm run check:firebase
npm run test:firebase
npm run smoke:firebase
```

`test:firebase` proves:

- Admin SDK Firestore read/write works against the emulator;
- Admin SDK Authentication works against the emulator;
- direct unauthenticated Firestore browser read/write remains denied.

`smoke:firebase` proves:

- Firebase Hosting serves the Vite build;
- `/api/v1/health` is rewritten to the Functions v2 `api` function;
- the existing Express contract survives the managed-runtime wrapper.

## Firestore rules baseline

WP-F04 is intentionally fail-closed:

```text
allow read, write: if false;
```

Later phases may open narrowly scoped direct browser reads only when there is a concrete UX/performance reason and emulator rule tests accompany the rule.

Business-critical writes remain server-authoritative.

## Credentials

Never commit:

- service-account JSON;
- Firebase Admin private keys;
- Application Default Credential files;
- production secrets.

Production Admin SDK authentication uses managed Firebase/Google Cloud credentials/IAM.

Firebase Web SDK configuration values are public identifiers, but they still do not belong in server credential files and never replace authorization.


## Production Firebase target

WP-F04 now records the owner-provided live Firebase topology without making it
the default local project:

- Firebase project alias: `production` -> `nocschedule1`;
- Hosting site ID: `nocmduscheduler`;
- expected Hosting URL: `https://nocmduscheduler.web.app`;
- production Hosting config: `firebase.production.json`;
- Hosting target name: `app`.

The normal/default Firebase project remains `demo-nocscheduler`. Production
deployment is intentionally not executed during WP-F04; launch/deployment
remains controlled by the later production phases.

The Firebase Web SDK public configuration supplied by the owner is represented
in the client Firebase configuration boundary. Analytics is not initialized in
WP-F04.
