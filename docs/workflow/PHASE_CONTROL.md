# NOCScheduler — Phase Control Ledger

> **Status:** Active  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Workflow:** `docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md`  
> **Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Platform Source:** `docs/prd/PRD-23_Firebase_Spark_Client_First_Rebaseline.md`  
> **Last Updated:** 2026-08-14

---

# 1. Current Execution State

| Field | Value |
|---|---|
| Current Phase | `WP-F05` — Shared Contracts & Domain Kernel |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F04` — Firebase Spark Client Platform Foundation |
| Last Accepted Implementation Commit | `ae572cf29e470985a0483444e3c7bad841d61ce8` |
| WP-F04 Acceptance Evidence | GitHub Actions Quality run `31759165051` completed successfully; Firebase project `nocschedule1` and Hosting site `nocmduscheduler` operator deployment completed successfully without Cloud Functions/Blaze backend dependency |
| Architecture Baseline | PRD-23 Firebase Spark client-first: Hosting + Auth Web SDK + Firestore Web SDK + Analytics; no Cloud Functions/API runtime |
| Active Execution Model | WP-F05 kernel generator applied → dependency materialization → format write-stage → commit/push → QA against exact pushed checkpoint |
| Next Allowed Phase | `WP-F05` only |
| Future Phases | `WP-F06` and later remain `LOCKED` |
| User Validation Pending | Yes — WP-F05 local quality gates and clean GitHub Actions must pass |
| Firebase Project | `nocschedule1` |
| Hosting Site | `nocmduscheduler` |
| Billing Baseline | Spark-friendly; no application Cloud Functions dependency |

---

# 2. Accepted Foundation

| Phase | Status | Notes |
|---|---|---|
| WP-F00 | ACCEPTED | Repository/toolchain bootstrap |
| WP-F01 | ACCEPTED | Historical scaffold accepted; API portion later superseded/removed by PRD-23 |
| WP-F02 | ACCEPTED | Quality/CI/E2E/accessibility foundation |
| WP-F03 | ACCEPTED | Design system/responsive foundation |
| WP-F04 | ACCEPTED | Spark client-first Firebase foundation; clean CI; Firestore deployed; Hosting deployed successfully without Functions |
| WP-F05 | PUSHED_UNVERIFIED | Shared contracts/domain kernel implementation prepared; exact pushed commit + QA pending |
| WP-F06+ | LOCKED | Requires WP-F05 acceptance |

---

# 3. Accepted WP-F04 Topology

```text
Browser
  -> Firebase Hosting (nocmduscheduler)
  -> React/Vite SPA
  -> Firebase Web SDK
       -> Firebase Authentication
       -> Cloud Firestore
       -> Analytics (production)
```

Explicitly absent:

```text
Cloud Functions
Cloud Run app backend
Express /api/v1
Firebase Admin SDK runtime
apps/api
Vite /api proxy
mandatory Emulator Suite
```

WP-F04 acceptance evidence:

```text
Implementation commit: ae572cf29e470985a0483444e3c7bad841d61ce8
Quality workflow run: 31759165051 -> SUCCESS
Firebase project: nocschedule1
Hosting site: nocmduscheduler
Firestore deployment: SUCCESS during WP-F04
Hosting deployment: SUCCESS by operator after Spark rebaseline
Cloud Functions deployment required: NO
Blaze backend dependency: NO
```

---

# 4. WP-F05 Contract

Goal: establish type-safe shared business language before feature domains expand.

Required deliverables:

- stable identifier types;
- `BusinessDate`;
- timestamp contract;
- integer IDR money;
- common operation-result/error taxonomy;
- pagination/filter contracts;
- optimistic version/revision contract;
- client-safe idempotency intent/operation-key contract;
- audit metadata contract;
- Asia/Jakarta timezone helpers / Temporal-compatible abstraction;
- Firestore serialization boundary types without Firebase imports in domain/contracts;
- deterministic clock/test clock where needed.

Boundary rules:

- `packages/domain` must not depend on React, Vite, Tailwind, or Firebase SDK;
- `packages/contracts` must remain runtime-agnostic and Firebase-independent;
- Firebase-specific conversion/adapters belong to `apps/web`, not shared business packages;
- no business logic duplication in UI components.

---

# 5. WP-F05 Exit Gate

Required evidence:

```text
cross-midnight BusinessDate/timezone helper tests
integer-IDR money helper tests
serialization round-trip tests
invalid external payload rejected by Zod
operation/result/error contract tests where relevant
no React/Firebase SDK dependency in domain/contracts
repository quality gates green
clean GitHub Actions green
```

WP-F06 remains locked until WP-F05 is accepted.
