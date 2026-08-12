# NOCScheduler — Phase Control Ledger

> **Status:** Active  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Workflow:** `docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md`  
> **Superseded Workflow:** `docs/workflow/WORKFLOW_Chat_GitHub_Full_Automation_v1.md`  
> **Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Last Updated:** 2026-08-13

---

# 1. Current Execution State

| Field | Value |
|---|---|
| Current Phase | `WP-F00` — Repository & Toolchain Bootstrap |
| Current Status | `NOT_STARTED` |
| Last Accepted Phase | None — implementation has not started |
| Last Implementation Commit | None |
| Last Workflow Commit | `0854ba2d56aff678cfba91aac070a91c4367a2c8` |
| Active Execution Model | Downloadable `.cjs` generator → local write → commit/push → QA |
| Next Allowed Phase | `WP-F00` only |
| Future Phases | `LOCKED` |
| User Validation Pending | No |
| Blocking Issue | None |
| Package Manager Baseline | `npm` + npm workspaces + `package-lock.json` |

---

# 2. Canonical Phase Progression

The assistant must never infer permission to advance from repository state alone.

```text
NOT_STARTED
→ AUDIT
→ GENERATOR_READY
→ user executes generator
→ PUSHED_UNVERIFIED
   ├─ QA FAIL → QA_FAILED → repair generator → PUSHED_UNVERIFIED
   └─ QA PASS → USER_VALIDATION_REQUIRED
                 → user PASS + explicit continue
                 → ACCEPTED
                 → next phase may begin
```

Possible exceptional states:

```text
BLOCKED
BLOCKED_EXTERNAL
SUPERSEDED
LOCKED
```

A pushed commit is deliberately allowed to be temporarily red because GitHub `main` is the shared debugging state used by the assistant after local QA failure.

---

# 3. Generator Workflow Rule

Normal application-source mutation no longer uses direct GitHub file editing.

Canonical path:

```text
Assistant audits latest GitHub main
→ assistant creates downloadable scripts/<task>.cjs
→ user runs generator locally
→ generator writes repository
→ temporary generator/backups cleaned
→ git add -A
→ git commit
→ git push
→ npm quality gates
→ user reports PASS or FAIL
```

For dependency-changing tasks, npm lockfile materialization may occur after generator writing and before commit. Typecheck/lint/test/build remain after push.

Direct GitHub writes remain acceptable for controlled workflow/workplan/documentation maintenance when source generator execution is not the relevant mechanism.

---

# 4. Phase Ledger

| Phase | Name | Status | Acceptance / Notes |
|---|---|---|---|
| WP-F00 | Repository & Toolchain Bootstrap | NOT_STARTED | Next allowed phase |
| WP-F01 | Workspace & Application Scaffold | LOCKED | Requires WP-F00 acceptance |
| WP-F02 | Quality, CI & Developer Safety Foundation | LOCKED | Requires prior phase acceptance |
| WP-F03 | Design System & Responsive Foundation | LOCKED | Requires prior phase acceptance |
| WP-F04 | Firebase Platform & Emulator Foundation | LOCKED | Requires prior phase acceptance |
| WP-F05 | Shared Contracts & Domain Kernel | LOCKED | Requires prior phase acceptance |
| WP-F06 | Authentication, Identity & Authorization | LOCKED | Requires prior phase acceptance |
| WP-F07 | Employee, Team & Core Settings | LOCKED | Requires prior phase acceptance |
| WP-F08 | Shift Configuration & Scheduling Domain | LOCKED | Requires prior phase acceptance |
| WP-F09 | Application Shell & Dashboard | LOCKED | Requires prior phase acceptance |
| WP-F10 | Schedule Consumption | LOCKED | Requires prior phase acceptance |
| WP-F11 | Schedule Management & Publication | LOCKED | Requires prior phase acceptance |
| WP-F12 | Workforce Exceptions & Requests | LOCKED | Requires prior phase acceptance |
| WP-F13 | Compensation Configuration | LOCKED | Requires prior phase acceptance |
| WP-F14 | Payroll Engine & Lifecycle | LOCKED | Requires prior phase acceptance |
| WP-F15 | Payroll UI & Explainability | LOCKED | Requires prior phase acceptance |
| WP-F16 | Audit, History & Notifications | LOCKED | Requires prior phase acceptance |
| WP-F17 | Reporting, Analytics & Export | LOCKED | Requires prior phase acceptance |
| WP-F18 | Cross-Product UI/UX Polish | LOCKED | Requires prior phase acceptance |
| WP-F19 | Security & Data Integrity Hardening | LOCKED | Requires prior phase acceptance |
| WP-F20 | Performance & Reliability Hardening | LOCKED | Requires prior phase acceptance |
| WP-F21 | Production Operations Foundation | LOCKED | Requires prior phase acceptance |
| WP-F22 | Staging, Seed & End-to-End Rehearsal | LOCKED | Requires prior phase acceptance |
| WP-F23 | User Acceptance Testing | LOCKED | Requires prior phase acceptance |
| WP-F24 | Production Launch | LOCKED | Requires prior phase acceptance |
| WP-F25 | Post-Launch Stabilization | LOCKED | Requires prior phase acceptance |
| WP-F26 | Final Production Sign-Off | LOCKED | Requires prior phase acceptance |

---

# 5. Durable Remote Checkpoint Rule

Because commit/push intentionally occurs before QA, the generator should update this ledger to a durable state appropriate for the pushed code, normally:

```text
Current Status: PUSHED_UNVERIFIED
Last Implementation Commit: populated by the resulting Git commit context when practical
User Validation Pending: Yes
```

If exact implementation SHA cannot be known before the commit is created, the next assistant audit uses latest GitHub `main` as authoritative and the next generator/state update records it.

The ledger does not need to pretend QA passed before the user actually runs it.

---

# 6. Assistant Update Contract

Assistant must ensure this file is updated through the relevant generator or controlled documentation write when any of the following materially changes:

- active workflow;
- active phase;
- phase acceptance;
- blocker;
- phase split/merge/defer/supersede;
- execution model;
- package-manager baseline;
- next valid phase.

During a repair loop, exact pushed GitHub state is authoritative even if the ledger still reflects `PUSHED_UNVERIFIED` from the preceding generator.

---

# 7. User Acceptance Contract

A phase may be marked `ACCEPTED` only after user feedback clearly confirms validation passed.

The following are not sufficient by themselves:

- generator completed;
- commit succeeded;
- push succeeded;
- GitHub shows latest source;
- CI is green;
- assistant believes the implementation is correct.

After user PASS, the assistant still waits for an explicit request to continue before beginning the next phase.

---

# 8. Current Next Action

No implementation phase has started yet.

The next valid implementation request remains:

```text
Start / lanjut WP-F00 — Repository & Toolchain Bootstrap
```

When the user asks to continue, assistant must first re-read:

```text
docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md
docs/workflow/PHASE_CONTROL.md
docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md
PRD-22
latest GitHub main
```

Then assistant creates the first downloadable `.cjs` generator for WP-F00 rather than directly writing application source through GitHub.