# NOCScheduler — Phase Control Ledger

> **Status:** Active  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Workflow:** `docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md`  
> **Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Last Updated:** 2026-08-13

---

# 1. Current Execution State

| Field | Value |
|---|---|
| Current Phase | `WP-F04` — Firebase Platform & Emulator Foundation |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F03` — Design System & Responsive Foundation |
| Last Accepted Implementation Commit | `5248560ec3fc2c3e47362446de64112b43a3e7f1` |
| WP-F03 Acceptance Commit | `efae3f4d607ad05608b8114943af9f2d34d0a7b8` — accepted WP-F03 and opened WP-F04 |
| Generator Applied | `scripts/wp-f04-fix-firebase-options-exact-optional.cjs` — normalize validated Firebase client config into FirebaseOptions while omitting undefined optional properties |
| Active Execution Model | Downloadable `.cjs` generator → dependency materialization → format write-stage → commit/push → QA |
| Next Allowed Phase | `WP-F04` only |
| Future Phases | `WP-F05` and later remain `LOCKED` |
| User Validation Pending | Yes — Firebase config, emulator integration, Hosting/Functions smoke, and clean-clone CI |
| Blocking Issue | Checkpoint `2081cf9...`: production/emulator target repair pushed; clean CI and local QA stop at web typecheck because Zod optional Firebase fields were represented as present `string | undefined`, incompatible with FirebaseOptions under exactOptionalPropertyTypes. Explicit omission repair prepared. |
| Local Firebase Project | `demo-nocscheduler` only by default |
| Runtime Baseline | Node.js 22; Firestore emulator CI uses Java 21 |

---

# 2. Accepted Foundation

| Phase | Status | Notes |
|---|---|---|
| WP-F00 | ACCEPTED | Repository/toolchain bootstrap |
| WP-F01 | ACCEPTED | Web/API/package scaffold and local health runtime |
| WP-F02 | ACCEPTED | Quality/CI/E2E/accessibility foundation |
| WP-F03 | ACCEPTED | Design system/responsive foundation |
| WP-F04 | PUSHED_UNVERIFIED | Production/emulator mapping pushed at `2081cf9...`; FirebaseOptions exact-optional normalization repair prepared before emulator gates resume |
| WP-F05+ | LOCKED | Requires WP-F04 acceptance |

---

# 3. WP-F04 Generated Foundation

WP-F04 introduces infrastructure only:

- `firebase.json` and `.firebaserc`;
- Firebase Hosting static Vite output;
- `/api/**` Hosting rewrite to Functions 2nd gen;
- Node.js 22 Functions runtime wrapping the existing Express app;
- Firestore config and empty index baseline;
- fail-closed Firestore Security Rules;
- Auth + Firestore + Functions + Hosting emulators;
- Emulator UI;
- `demo-nocscheduler` local project convention;
- browser Firebase client initialization boundary;
- API Firebase Admin SDK initialization boundary;
- explicit local/live-project safety guards;
- deterministic emulator reset/seed;
- Firebase config safety check;
- Admin SDK emulator integration tests;
- Firestore fail-closed rules test;
- Hosting/Functions same-origin smoke;
- CI Java 21 + Firebase emulator job.

WP-F04 does not implement NOCScheduler login, roles, capabilities, employees, scheduling, or payroll behavior.

---

# 4. WP-F04 Exit Gate

Required:

```text
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
npm run check:workspaces
npm run check:firebase
npm test
npm run test:integration
npm run build
npm run smoke:api
npm run check:deadcode
npm run test:firebase
npm run smoke:firebase
npm run test:e2e
npm run test:a11y
```

Clean-clone GitHub Actions must also pass the Firebase emulator job.

---

# 5. Security Baseline

- local Firebase defaults to `demo-nocscheduler`;
- all emulators bind to loopback only;
- Firestore browser access is fail-closed;
- server credentials never enter browser code;
- service-account JSON/private keys are forbidden in source control;
- Admin SDK uses managed credentials in production;
- non-production Admin SDK live access requires explicit opt-in;
- destructive reset/seed refuses non-demo targets.

---

# 6. Acceptance Rule

WP-F04 is not accepted merely because Firebase packages install.

Acceptance requires real Emulator Suite integration, rules denial, Hosting-to-Functions rewrite smoke, and clean-clone CI success.

WP-F05 remains locked until then.
