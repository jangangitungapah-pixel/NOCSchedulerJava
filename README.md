# NOCScheduler

NOCScheduler is an internal operational scheduling, workforce, attendance, and payroll platform.

## Current architecture

The active production baseline is **Firebase Spark-friendly and client-first**:

```text
React / Vite / TypeScript
  -> Firebase Hosting (nocmduscheduler.web.app)
  -> Firebase Web SDK
       -> Firebase Authentication
       -> Cloud Firestore
       -> Analytics in production
```

There is no Cloud Functions, Cloud Run, Express, Admin SDK runtime, self-managed server, or normal
Emulator Suite requirement in the active baseline.

The browser is always treated as untrusted. Firestore Security Rules are the authorization/data
access boundary, while deterministic business rules remain isolated in `packages/domain`.

## Current implementation phase

WP-F00 through WP-F03 are accepted. WP-F04 is rebaselining the Firebase platform to the Spark
client-first architecture before WP-F05 may begin.

## Workspace topology

```text
apps/
  web/
packages/
  domain/
  contracts/
  ui/
```

## Required local runtime

- Node.js 22.x
- npm 10 or newer
- Git
- Firebase CLI for explicit Hosting/Firestore deployment

Java, Docker, a VPS, and a local API server are not normal prerequisites.

## Install

```powershell
nvm use 22
npm install
```

## Development

```powershell
npm run dev
```

Local web URL:

```text
http://127.0.0.1:5173
```

## Quality gates

```powershell
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
npm run check:workspaces
npm run check:firebase
npm test
npm run build
npm run check:deadcode
npm run test:e2e
npm run test:a11y
```

## Firebase

Canonical target:

```text
Project ID:   nocschedule1
Hosting site: nocmduscheduler
URL:          https://nocmduscheduler.web.app
```

Deploy Hosting only:

```powershell
npm run firebase:deploy:hosting
```

Deploy Firestore rules/indexes only:

```powershell
npm run firebase:deploy:firestore
```

Deploy the current Firebase-owned surface:

```powershell
npm run firebase:deploy
```

The active baseline intentionally avoids Cloud Functions so it does not require Blaze merely for
an application backend.

## Source boundaries

- `apps/web`: React/Vite application and Firebase client data-access adapters.
- `packages/domain`: deterministic scheduling/payroll/workforce rules; no React/Firebase.
- `packages/contracts`: runtime-agnostic schemas and data contracts.
- `packages/ui`: shared visual primitives and tokens.

## Secrets

Firebase Web SDK configuration is public client configuration. Never place service-account JSON,
private keys, or privileged server credentials in this repository.
