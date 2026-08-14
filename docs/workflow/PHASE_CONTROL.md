# NOCScheduler — Phase Control Ledger

> **Status:** Active  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Workflow:** `docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md`  
> **Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Platform Source:** `docs/prd/PRD-23_Firebase_Spark_Client_First_Rebaseline.md`  
> **Last Updated:** 2026-08-13

---

# 1. Current Execution State

| Field | Value |
|---|---|
| Current Phase | `WP-F04` — Firebase Spark Client Platform Foundation |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F03` — Design System & Responsive Foundation |
| Last Accepted Implementation Commit | `5248560ec3fc2c3e47362446de64112b43a3e7f1` |
| WP-F03 Acceptance Commit | `efae3f4d607ad05608b8114943af9f2d34d0a7b8` |
| Last WP-F04 Checkpoint | `3356a528e058c7b6f931012ef4ed7f3b84380085` — Firebase Web config finalized and CI run 31708549040 passed; Hosting deploy exposed that the pinned Cloud Function unnecessarily forced Blaze |
| Architecture Decision | User explicitly decided Cloud Functions are not required; WP-F04 must be fully cleaned before WP-F05 |
| Generator Applied | `scripts/wp-f04-rebaseline-firebase-spark-client-first.cjs` — remove API/Functions runtime and make PRD-23 Spark client-first architecture canonical |
| Next Allowed Phase | `WP-F04` only |
| Future Phases | `WP-F05` and later remain `LOCKED` |
| User Validation Pending | Yes — clean local/CI gates plus Hosting deployment that does not attempt Functions |
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
| WP-F04 | PUSHED_UNVERIFIED | Spark client-first rebaseline pending final QA + Hosting live validation |
| WP-F05+ | LOCKED | Requires WP-F04 acceptance |

---

# 3. Canonical WP-F04 Topology

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

---

# 4. Security Contract

- the browser is untrusted;
- Firestore Security Rules authorize persistence access;
- UI route/button visibility never grants permission;
- WP-F04 remains fail-closed until WP-F06;
- deterministic business rules stay in `packages/domain`;
- domain/contracts must not import Firebase;
- no service-account/private-key material is committed;
- requirements that cannot be safely implemented client-first require a new explicit architecture decision.

---

# 5. WP-F04 Exit Gate

Required automated gates:

```text
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

Clean-clone GitHub Actions must pass.

Then operator validation:

```text
npm run firebase:project
npm run firebase:deploy:hosting
```

Expected result:

- Hosting deploy does not prepare/list/deploy Functions;
- no Blaze requirement is triggered by application backend infrastructure;
- `https://nocmduscheduler.web.app` serves the SPA.

Firestore rules/indexes have already been deployed successfully during WP-F04 and may be
revalidated with `npm run firebase:deploy:firestore` if required.

WP-F05 remains locked until this exit gate is complete.
