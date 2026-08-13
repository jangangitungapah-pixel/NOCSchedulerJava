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
| Current Phase | `WP-F04` — Firebase Managed Platform Foundation |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F03` — Design System & Responsive Foundation |
| Last Accepted Implementation Commit | `5248560ec3fc2c3e47362446de64112b43a3e7f1` |
| WP-F03 Acceptance Commit | `efae3f4d607ad05608b8114943af9f2d34d0a7b8` |
| Last WP-F04 Checkpoint | `3f0fc864a28d43ef8780900dab2ec36543ec3ccd` — Functions now consumes the Admin SDK boundary; local dead-code gate now reports only a redundant root-level `firebase` dependency while the Web workspace already owns the Firebase client SDK |
| Generator Applied | `scripts/wp-f04-remove-redundant-root-firebase-dependency.cjs` — remove the redundant root Firebase Web SDK declaration while retaining workspace-owned client/admin dependencies |
| Active Execution Model | Downloadable `.cjs` generator → dependency materialization → format write-stage → commit/push → QA → explicit live deploy |
| Next Allowed Phase | `WP-F04` only |
| Future Phases | `WP-F05` and later remain `LOCKED` |
| User Validation Pending | Yes — clean local/CI quality gates plus explicit Firebase CLI project/deploy validation |
| Blocking Issue | Checkpoint `3f0fc86...`: Admin SDK wiring repair applied; Knip now reports only root `firebase` as unused because `apps/web` already declares the Web SDK and `apps/api` separately declares `firebase-admin`/`firebase-functions` — manifest cleanup prepared |
| Firebase Project | `nocschedule1` |
| Hosting Site | `nocmduscheduler` |
| Runtime Baseline | Node.js 22 / Cloud Functions 2nd gen |

---

# 2. Accepted Foundation

| Phase | Status | Notes |
|---|---|---|
| WP-F00 | ACCEPTED | Repository/toolchain bootstrap |
| WP-F01 | ACCEPTED | Web/API/package scaffold |
| WP-F02 | ACCEPTED | Quality/CI/E2E/accessibility |
| WP-F03 | ACCEPTED | Design system/responsive foundation |
| WP-F04 | PUSHED_UNVERIFIED | Managed Firebase topology and Admin SDK wiring are in place; redundant root Firebase dependency cleanup prepared before final quality/deploy validation |
| WP-F05+ | LOCKED | Requires WP-F04 acceptance |

---

# 3. WP-F04 Managed Firebase Contract

Canonical topology:

```text
nocmduscheduler.web.app
  -> Firebase Hosting
  -> /api/** rewrite
  -> Cloud Functions 2nd gen (api)
  -> Express /api/v1
  -> Firebase Admin SDK
  -> Firebase Auth / Cloud Firestore
```

Canonical target:

```text
Project: nocschedule1
Hosting site: nocmduscheduler
Region: asia-southeast1
```

The Emulator Suite is no longer a required project dependency or quality gate.

---

# 4. Security Contract

- Firebase Web SDK config is public client configuration, not an Admin secret.
- Browser Firestore access remains fail-closed during WP-F04.
- Business-critical writes remain server-authoritative.
- Deployed Cloud Functions use Firebase Admin SDK with managed Google credentials.
- CI never writes test users/documents into the real production Firebase project.
- Service-account JSON/private keys are forbidden from source control.
- Local Admin SDK access to real Firebase requires developer-managed ADC outside the repository.

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
npm run test:integration
npm run build
npm run smoke:api
npm run check:deadcode
npm run test:e2e
npm run test:a11y
```

Clean-clone GitHub Actions must pass.

Then operator validation:

```text
firebase login
npm run firebase:project
npm run firebase:deploy
```

WP-F04 is accepted after the repository gates are green and the managed
Firebase deployment target is validated successfully.

WP-F05 remains locked until then.
