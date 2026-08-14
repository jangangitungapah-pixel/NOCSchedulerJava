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
| Current Phase | `WP-F06` — Authentication, Identity & Authorization |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F05` — Shared Contracts & Domain Kernel |
| Last Accepted Implementation Commit | `b5fc38d8205cb47068d4c2e5de8224689b17b16e` |
| WP-F05 Acceptance Evidence | GitHub Actions Quality run `31790868577` completed successfully: typecheck, lint, format, repository/workspace/Firebase safety, unit/domain tests, build, dead-code, Chromium E2E, and accessibility all passed |
| Architecture Baseline | PRD-23 Firebase Spark client-first: Hosting + Auth Web SDK + Firestore Web SDK + Security Rules; no Cloud Functions/API runtime |
| Active Execution Model | WP-F06 Auth/access implementation committed → completion repair → format write-stage → manual commit/push → QA against exact pushed checkpoint → Firestore rules deploy + operator-created Auth/access manual acceptance |
| Next Allowed Phase | `WP-F06` only |
| Future Phases | `WP-F07` and later remain `LOCKED` |
| User Validation Pending | Yes — partial WP-F06 implementation commit `86d045d18cec951c960dc1a95746739cc5931ae4` is being completed; repository/CI QA, Firestore rules deployment, and operator-created Auth/access validation must pass |
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
| WP-F05 | ACCEPTED | Shared contracts/domain kernel; branded identifiers/timestamps, BusinessDate/Asia-Jakarta, integer IDR, operation/error contracts, serialization boundary, deterministic clock; Quality run `31790868577` SUCCESS |
| WP-F06 | PUSHED_UNVERIFIED | Auth UI/session + role/access contracts + deny-by-default Firestore authorization are implemented; completion repair and QA/live validation pending |
| WP-F07+ | LOCKED | Requires WP-F06 acceptance |

---

# 3. Accepted Platform Topology

```text
Browser
  -> Firebase Hosting (nocmduscheduler)
  -> React/Vite SPA
  -> Firebase Web SDK
       -> Firebase Authentication
       -> Cloud Firestore
       -> Analytics (production)
```

Security boundary:

```text
Firebase Auth identity
  + canonical Firestore access record
  + Firestore Security Rules
  + client-side domain/runtime validation for correctness/UX
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

---

# 4. WP-F05 Acceptance Evidence

```text
Implementation commit: b5fc38d8205cb47068d4c2e5de8224689b17b16e
Quality workflow run: 31790868577 -> SUCCESS
Typecheck: SUCCESS
Lint: SUCCESS
Format check: SUCCESS
Repository/workspace policy: SUCCESS
Firebase architecture safety: SUCCESS
Unit/domain tests: SUCCESS
Build: SUCCESS
Dead-code/dependency sanity: SUCCESS
Chromium E2E: SUCCESS
Accessibility smoke: SUCCESS
```

WP-F05 exit criteria satisfied:

- cross-midnight BusinessDate/Asia-Jakarta tests;
- integer-IDR helpers and overflow/fraction rejection;
- serialization round-trip;
- invalid external payload rejected by Zod;
- operation/result/error contracts;
- shared domain/contracts remain React/Firebase-independent.

---

# 5. WP-F06 Contract

Goal: user can authenticate, but application access and mutations are allowed only through explicit capability/scope rules.

PRD precedence:

- PRD-07 owns role/permission/internal-transparency business policy;
- PRD-16 owns authentication/security/data-integrity requirements;
- PRD-23 supersedes legacy server/API enforcement mechanisms with Firebase Authentication + Firestore Security Rules.

Required WP-F06 direction:

- Firebase email/password login/logout;
- auth-state/session refresh awareness;
- separate Firebase Auth UID from Employee business identity;
- canonical Firestore access/account record keyed by UID;
- active/inactive/suspended application-account enforcement;
- capability + scope model (`SELF`, `TEAM`, `ALL`);
- deny by default;
- UI guards are UX only, never security boundaries;
- Firestore Security Rules enforce authenticated identity, account status, capability/scope, immutable security fields, and owner-only access-management documents;
- public self-registration must not grant application access;
- access mutation/self-escalation and last-administrator risks must fail closed;
- Firebase/Admin-SDK-only account administration must not be silently reintroduced under Spark; if a requirement cannot be implemented safely client-first, it requires an explicit architecture decision.

WP-F07 remains locked until WP-F06 is accepted.
