# NOCScheduler PRD Index & Canonical Reading Order

> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Last Architecture Rebaseline:** 2026-08-13  
> **Highest-Precedence Platform Document:** PRD-23

## Critical implementation rule

Read the relevant product/business PRD and **PRD-23 — Firebase Spark Client-First Architecture
Rebaseline** before implementing runtime, persistence, authentication, deployment, security, or
platform-specific code.

When platform statements conflict, **PRD-23 wins**.

PRD-22 remains useful for TypeScript/React/Vite/Tailwind decisions that PRD-23 does not change.

## Canonical platform

```text
Frontend
  TypeScript / TSX
  React
  Vite
  React Router
  Tailwind + semantic tokens

Shared logic
  packages/domain
  packages/contracts
  packages/ui

Firebase
  Hosting
  Authentication Web SDK
  Cloud Firestore Web SDK
  Firestore Security Rules
  Analytics (production)

Explicitly absent
  Cloud Functions
  Cloud Run application backend
  Express /api/v1
  Firebase Admin SDK runtime
  Emulator Suite requirement
  self-managed server
```

## Platform status matrix

| Document | Current role |
|---|---|
| PRD-01 through PRD-20 | Product/business/UX/security/operations requirements retained unless platform mechanism is superseded |
| PRD-21 | Historical Firebase amendment |
| PRD-22 | TypeScript/React/Vite/Tailwind rebaseline; backend/runtime portions superseded |
| PRD-23 | **Highest-precedence active platform architecture** |

## Important reinterpretations

- “server-authoritative” legacy wording now means: never trust UI state; enforce database access
  through authenticated Firestore Security Rules and client-safe transactional document design.
- HTTP API routes from PRD-15 are not a required V1 runtime surface.
- `packages/domain` still owns deterministic business logic.
- Firestore repositories/adapters live in the web application, not in domain/contracts.
- Any requirement that truly needs privileged backend execution must trigger a new explicit
  architecture decision instead of silently reintroducing Cloud Functions.

## Framework/platform prohibitions

Do not reintroduce as baseline without an approved architecture change:

- Next.js;
- PostgreSQL/ORM stacks;
- Better Auth;
- Cloud Functions;
- Express API;
- Firebase Admin SDK runtime;
- local Emulator Suite as a mandatory workflow;
- Docker/VPS hosting;
- public client secrets.

Business invariants, Light/Dark parity, desktop/mobile parity, auditability, deterministic payroll,
cross-midnight scheduling, and strong authorization requirements remain mandatory.
