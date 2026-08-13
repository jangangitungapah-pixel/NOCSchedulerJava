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
| Current Phase | `WP-F02` — Quality, CI & Developer Safety Foundation |
| Current Status | `PUSHED_UNVERIFIED` |
| Last Accepted Phase | `WP-F01` — Workspace & Application Scaffold |
| Last Implementation Commit | `c7b81122da51d6adfc736541df53e2c8908b7370` — API test response validation repair pushed; typecheck/lint/tests/build/smoke passed locally; Knip then reported a CSS module-graph false positive plus one genuinely unused exported type |
| Generator Applied | `scripts/wp-f02-fix-knip-module-graph.cjs` — restore CSS compiler coverage in Knip graph, remove redundant config patterns, and delete unused HealthResponse export |
| Active Execution Model | Downloadable `.cjs` generator → dependency materialization → format write-stage → commit/push → QA |
| Next Allowed Phase | `WP-F02` only |
| Future Phases | `WP-F03` and later remain `LOCKED` |
| User Validation Pending | Yes — Knip repair must be pushed, then dead-code, E2E, accessibility, and clean-clone CI must pass |
| Blocking Issue | None |
| Package Manager Baseline | npm workspaces + committed `package-lock.json` |
| Runtime Baseline | Node.js 22 |

---

# 2. Accepted Foundation

| Phase | Status | Notes |
|---|---|---|
| WP-F00 | ACCEPTED | Repository/toolchain bootstrap |
| WP-F01 | ACCEPTED | Web/API/package scaffold and local health runtime |
| WP-F02 | PUSHED_UNVERIFIED | Knip module-graph/dead-export repair prepared after dead-code gate failure |
| WP-F03+ | LOCKED | Requires WP-F02 acceptance |

---

# 3. WP-F02 Generated Quality Foundation

WP-F02 establishes:

- Vitest test projects for browser-like web unit tests, future domain unit tests, and API integration tests;
- React Testing Library + jest-dom;
- MSW Node interception infrastructure;
- deterministic web health fixture;
- API health/readiness/not-found integration contract tests;
- V8 coverage command without artificial repository-wide threshold;
- Playwright Chromium + mobile Chromium scaffold;
- axe accessibility smoke;
- Knip dead-code/dependency analysis;
- lint-staged opt-in command without a pre-commit hook;
- React Hooks lint rules;
- GitHub Actions quality workflow;
- documented test/fixture/coverage conventions.

No Firebase, authentication, production design-system implementation, or product business logic is introduced here.

---

# 4. Push-Before-QA and Formatting Rule

Formatting is a hygiene gate, not runtime behavior.

Generators that create source/config must run:

```text
npm run format
```

during the write/materialization stage before commit. This prevents formatting-only failures from consuming a repair loop while preserving `format:check` as deterministic CI verification.

No pre-commit hook is installed because the canonical collaboration workflow intentionally permits pushed red checkpoints for remote repair.

---

# 5. Required WP-F02 Validation

After dependency lock materialization, format, commit, and push:

```text
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
npm run check:workspaces
npm test
npm run test:integration
npm run build
npm run smoke:api
npm run check:deadcode
npx playwright install chromium
npm run test:e2e
npm run test:a11y
```

CI must reproduce the static/unit/integration/build/dead-code gates and install Chromium before browser tests.

---

# 6. Acceptance Rule

A tool being installed is not proof that the quality foundation works.

WP-F02 can be accepted only when the generated tests and gates actually execute successfully. WP-F03 remains locked until then.
