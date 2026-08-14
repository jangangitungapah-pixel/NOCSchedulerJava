# PRD-23 — Firebase Spark Client-First Architecture Rebaseline

> **Product:** NOCScheduler  
> **Document Type:** Canonical Platform Architecture Rebaseline  
> **Document ID:** PRD-23  
> **Status:** Approved — Highest-Precedence Platform Source of Truth  
> **Decision Date:** 2026-08-13  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Supersedes:** PRD-22 wherever PRD-22 requires Node/Express, Cloud Functions, Admin SDK,
> server-authoritative HTTP APIs, or Emulator Suite infrastructure.

---

# 1. Decision

NOCScheduler production V1 uses a **Firebase Spark-friendly client-first architecture**.

Canonical topology:

```text
User Browser
  -> React + TypeScript/TSX + Vite
  -> Firebase Hosting
  -> Firebase Web SDK
       -> Firebase Authentication
       -> Cloud Firestore
       -> Analytics in production
```

The canonical application does **not** require:

- Cloud Functions;
- Cloud Run;
- Cloud Build application deployment;
- Artifact Registry application deployment;
- Express;
- `/api/v1`;
- Firebase Admin SDK runtime;
- a VPS/VM;
- Docker hosting;
- a local API server;
- Firebase Emulator Suite as a normal development/CI dependency.

# 2. Precedence

For platform/runtime/data-access conflicts across PRD-01 through PRD-22, **PRD-23 wins**.

PRD-22 remains authoritative for choices not contradicted here, including:

- TypeScript/TSX strict mode;
- React;
- Vite;
- React Router;
- Tailwind and semantic design tokens;
- shared domain/contracts/ui packages;
- accessibility, responsive, Light/Dark, and quality expectations.

Business rules from scheduling, payroll, attendance, audit, reporting, and permission PRDs remain
mandatory. Their implementation mechanism changes from trusted HTTP server commands to
client-safe domain logic + Firebase Auth + Firestore Rules/transactions.

# 3. Canonical stack

| Layer | Technology |
|---|---|
| Language | TypeScript ESM + TSX strict mode |
| Frontend | React + Vite + React Router |
| Styling | Tailwind + semantic CSS tokens |
| UI state/data query | TanStack Query and focused React state |
| Runtime contracts | Zod |
| Business logic | `packages/domain`, deterministic and Firebase-independent |
| Shared contracts | `packages/contracts`, runtime-independent |
| Authentication | Firebase Authentication Web SDK |
| Persistence | Cloud Firestore Web SDK |
| Authorization | Firestore Security Rules + authenticated identity |
| Atomic persistence | Firestore transactions / batched writes where appropriate |
| Hosting | Firebase Hosting |
| Analytics | Firebase Analytics, production only |
| Testing | Vitest + Testing Library + Playwright + axe |
| Package manager | npm workspaces |

# 4. Security model

The client is untrusted.

A hidden button, route guard, disabled field, TypeScript type, or domain helper can improve UX but
cannot authorize a Firestore operation.

Every Firestore operation must be valid under Security Rules.

Rules must progressively enforce:

- authenticated identity;
- document ownership/scope;
- role/capability lookup from canonical Firestore identity/role documents;
- immutable identifiers and actor fields;
- allowed lifecycle transitions where representable safely;
- append-only/immutable evidence where required;
- owner-only permission/account-management documents;
- denial by default for unknown collections/fields.

WP-F04 remains fail-closed. WP-F06 owns the first real authenticated authorization model.

# 5. Business logic and integrity

`packages/domain` remains the deterministic source for scheduling/payroll/workforce calculations.

The UI must not duplicate those algorithms.

For persistence:

- use transactions when a read-modify-write operation must detect conflicting state;
- use batches for atomic multi-document writes that do not require reads;
- include optimistic version/revision metadata where required;
- use server timestamps where canonical event time must come from Firestore;
- design document shapes so Security Rules can validate critical invariants.

If a business requirement cannot be made safe under the client-first model, it must not be
silently weakened. It becomes an explicit architecture decision requiring product-owner approval.

# 6. Authentication and internal accounts

Firebase Authentication provides identity.

NOCScheduler remains an internal application. Account bootstrap/provisioning must be designed so
public self-service registration cannot accidentally grant application access.

Application authorization is based on authenticated UID plus canonical Firestore access records,
not on UI state.

Any future need for privileged Firebase Auth administration that cannot be safely implemented
without Admin SDK must be treated as a separate approved architecture requirement.

# 7. Repository topology

Canonical workspaces:

```text
apps/
  web/
packages/
  domain/
  contracts/
  ui/
```

Forbidden baseline workspace:

```text
apps/api/
```

Firebase-specific code belongs inside web-owned adapters such as
`apps/web/src/lib/firebase/` or feature data repositories.

Domain/contracts packages must not depend on Firebase.

# 8. Firebase deployment

Canonical target:

```text
Project: nocschedule1
Hosting site: nocmduscheduler
URL: https://nocmduscheduler.web.app
```

`firebase.json` may own:

- Hosting;
- Firestore rules/indexes.

It must not own:

- Functions;
- Cloud Run rewrites;
- `/api/**` rewrites;
- Emulator Suite runtime configuration under the current baseline.

# 9. Billing posture

The architecture intentionally avoids Cloud Functions so the application backend does not force a
Blaze upgrade.

The owner must still respect Firebase quotas and current product pricing for Hosting,
Authentication, and Firestore usage.

A future move to Blaze is a business/architecture decision, not an accidental side effect of a
Hosting deploy.

# 10. Testing posture

Required foundation gates:

```text
typecheck
lint
format check
repository/workspace policy
Firebase architecture safety
unit/domain tests
web build
dead-code/dependency sanity
browser E2E
accessibility smoke
```

There is no Express integration test or API smoke gate.

Security-rule/data-access testing must evolve with WP-F06 and later security phases.

# 11. WP-F04 exit criteria

WP-F04 can be accepted when:

- `apps/api` is removed;
- no Cloud Functions/Admin SDK runtime dependency remains;
- Hosting has only SPA fallback rewrite;
- Vite has no local API proxy;
- CI starts only the web runtime;
- root scripts contain no API/Functions deployment path;
- Firebase Web config targets `nocschedule1`;
- Firestore remains fail-closed pending WP-F06;
- clean-clone CI is fully green;
- Hosting deploy succeeds without attempting Functions;
- `nocmduscheduler.web.app` serves the built SPA.

Only then may WP-F05 begin.
