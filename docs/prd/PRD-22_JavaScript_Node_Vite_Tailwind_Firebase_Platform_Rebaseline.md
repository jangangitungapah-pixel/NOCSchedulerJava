# PRD-22 — JavaScript, Node.js, Vite, Tailwind & Firebase Managed Platform Rebaseline

> **Product:** NOCScheduler  
> **Document Type:** Canonical Platform Architecture Rebaseline  
> **Document ID:** PRD-22  
> **Status:** Approved — Highest-Precedence Platform Source of Truth  
> **Decision Date:** 2026-08-13  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Frontend Language:** JavaScript / JSX  
> **Backend Language:** JavaScript / Node.js  
> **Default Theme:** Light  
> **Theme Support:** Light + Dark parity required

---

# 1. Purpose

PRD-22 rebaselines the implementation platform of the entire NOCScheduler PRD set from the previous Next.js-oriented architecture to a modern **JavaScript + React + Vite + Tailwind CSS frontend and JavaScript + Node.js backend**, while retaining Firebase as managed infrastructure so the owner does not need to operate a dedicated application/database server.

This document exists to make future implementation unambiguous.

The canonical platform is no longer:

```text
Next.js full-stack application
```

The canonical platform is:

```text
React SPA written in JavaScript/JSX
+ Vite
+ Tailwind CSS
+ Node.js API written in JavaScript
+ Firebase managed platform
```

The migration changes implementation architecture, not the product's scheduling, payroll, authorization, history, reporting, notification, responsive, or visual-quality requirements.

---

# 2. Precedence Across the Entire PRD Set

PRD-22 has the highest precedence for any platform-specific statement in **PRD-01 through PRD-21**.

When another PRD conflicts with PRD-22 on any of the following, **PRD-22 wins**:

- programming language;
- frontend framework/build tooling;
- routing implementation;
- server rendering assumptions;
- API runtime;
- authentication implementation;
- hosting topology;
- database vendor/runtime implementation;
- ORM/migration assumptions;
- frontend state/data-access architecture;
- CSS/tooling implementation;
- test runner/tooling;
- deployment mechanism;
- Node runtime topology;
- Firebase integration.

Product/business requirements remain canonical unless this document explicitly changes them.

## 2.1 PRD impact matrix

| PRD | Status after PRD-22 |
|---|---|
| PRD-01 Product Vision | Product requirements retained |
| PRD-02 Feature Specification | Feature requirements retained |
| PRD-03 Scheduling & Shift Logic | Business logic retained; implemented in shared/server JavaScript domain modules |
| PRD-04 Payroll Logic | Business logic retained; implemented server-authoritatively in JavaScript |
| PRD-05 Workforce Exceptions | Business logic retained |
| PRD-06 IA & Navigation | Route semantics retained; implemented with client-side routing |
| PRD-07 Roles & Permissions | Authorization policy retained; enforced in Node API |
| PRD-08 Data Model | Domain/data requirements retained; relational/SQL-specific assumptions superseded by Firestore model |
| PRD-09 Audit & Historical Data | Requirements retained |
| PRD-10 UI/UX | Fully retained |
| PRD-11 Design System | Fully retained; Tailwind implements semantic token/component system |
| PRD-12 Responsive & Mobile | Fully retained |
| PRD-13 UI Polish | Fully retained |
| PRD-14 Technical Architecture | Next.js/TypeScript/PostgreSQL-specific baseline superseded by PRD-22 |
| PRD-15 API Contract | HTTP semantics retained; route implementation moves to Node.js API |
| PRD-16 Security | Security requirements retained; Better Auth/Next.js-specific guidance superseded |
| PRD-17 Reporting | Requirements retained |
| PRD-18 Notifications | Requirements retained |
| PRD-19 QA | Quality requirements retained; tooling/environment updated by PRD-22 |
| PRD-20 Operations | Operational requirements retained; Next.js/PostgreSQL topology superseded |
| PRD-21 Firebase Amendment | Historical; superseded by PRD-22 |

---

# 3. Architecture Decision Summary

## 3.1 Canonical baseline stack

| Layer | Canonical Technology |
|---|---|
| Source language | JavaScript ESM + JSX; no TypeScript source requirement |
| Frontend | React |
| Frontend build/dev tooling | Vite |
| React compiler pipeline | Vite React SWC plugin or equivalent supported fast compiler |
| Routing | React Router |
| Styling | Tailwind CSS + semantic CSS custom properties |
| UI primitives | Radix-style accessible headless primitives |
| Server-state | TanStack Query |
| Tables | TanStack Table |
| Large-list/grid virtualization | TanStack Virtual |
| Complex form state | React Hook Form |
| Runtime contracts | Zod |
| Focused cross-tree UI state | Zustand only where justified |
| Motion | Motion for React |
| Drag/drop | dnd-kit |
| Icons | Lucide React |
| Toast/feedback | Sonner or equivalent lightweight accessible toast layer |
| Command palette | cmdk or equivalent accessible command primitive |
| Mobile drawer/sheet | Vaul or equivalent accessible drawer primitive where needed |
| Date/calendar UI | React Day Picker or purpose-built NOCScheduler calendar components |
| Date/time business logic | Temporal-compatible abstraction / polyfill with explicit Asia/Jakarta handling |
| Charts | Recharts for bounded operational/reporting visualizations |
| Authentication | Firebase Authentication |
| Backend runtime | Node.js managed runtime |
| HTTP backend | Express-based `/api/v1` application |
| Production API hosting | Firebase Cloud Functions 2nd gen managed runtime; Cloud Run may replace it later without changing API contracts |
| Database | Cloud Firestore |
| Privileged Firebase access | Firebase Admin SDK |
| Browser abuse signal | Firebase App Check where production setup supports it |
| Static web hosting | Firebase Hosting |
| Local managed-service emulation | Firebase Local Emulator Suite |
| Unit/component tests | Vitest + Testing Library |
| API mocking | MSW where useful |
| Browser/E2E | Playwright |
| Accessibility automation | axe integration + manual keyboard/touch QA |
| Logging | Pino structured logs to stdout/managed logging |
| Package manager | pnpm |
| Repository structure | pnpm workspace modular monorepo |

Package versions must be pinned by lockfile at project setup time. Avoid hardcoding stale exact versions in PRDs; upgrade dependencies intentionally and test before release.

---

# 4. Why This Architecture Fits NOCScheduler

## 4.1 Internal application does not need SSR for SEO

NOCScheduler is an authenticated internal operations application. Search-engine indexing and public marketing-page SEO are not primary requirements.

A Vite-powered SPA therefore removes unnecessary server-rendering framework complexity while preserving:

- fast initial application shell delivery;
- excellent client interactions;
- code splitting;
- modern HMR;
- predictable frontend/backend separation;
- straightforward Firebase Hosting deployment.

## 4.2 Server authority remains mandatory

Moving away from Next.js does **not** move business logic into the browser.

Critical rules remain server-authoritative:

- schedule validation/publication;
- replacement and swap approval;
- payroll calculation/recalculation;
- payroll finalize/lock/unlock;
- salary and incentive mutation;
- permission/access mutation;
- historical correction;
- audit creation;
- concurrency and idempotency checks.

## 4.3 No self-managed server requirement

“Node.js backend” means application code runs on a managed Node.js runtime.

Baseline production does **not** require the owner to manage:

- a VPS;
- Linux patching;
- Nginx;
- PM2;
- Docker host;
- PostgreSQL server;
- database backups on a VM;
- manual TLS certificates.

Firebase/Google Cloud operates the runtime infrastructure.

---

# 5. High-Level Runtime Topology

```text
User Browser
  ↓ HTTPS
Firebase Hosting
  ├─ static Vite build assets
  ├─ SPA fallback → /index.html
  └─ /api/** rewrite
       ↓
Firebase Cloud Functions 2nd gen
Node.js API
  ├─ request correlation
  ├─ security headers
  ├─ Firebase ID-token verification
  ├─ optional App Check verification
  ├─ Zod request validation
  ├─ capability authorization
  ├─ application commands / queries
  ├─ domain services
  ├─ Firestore repositories
  ├─ audit policy
  └─ structured logging
       ↓
Firebase Admin SDK
       ↓
Cloud Firestore
```

Authentication flow:

```text
Browser
  → Firebase Authentication
  → Firebase ID token
  → Authorization: Bearer <token>
  → Node API verifies token with Firebase Admin SDK
  → application role/capability is loaded/evaluated
```

Local development:

```text
Vite dev server
  + Node API local runtime/functions emulator
  + Auth emulator
  + Firestore emulator
  + Emulator UI
```

---

# 6. Repository and Folder Architecture

Canonical direction:

```text
/
├─ apps/
│  ├─ web/
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  ├─ routes/
│  │  │  ├─ features/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  ├─ lib/
│  │  │  ├─ styles/
│  │  │  └─ main.jsx
│  │  ├─ index.html
│  │  └─ vite.config.js
│  │
│  └─ api/
│     ├─ src/
│     │  ├─ app.js
│     │  ├─ routes/
│     │  ├─ middleware/
│     │  ├─ modules/
│     │  ├─ repositories/
│     │  ├─ services/
│     │  └─ firebase/
│     └─ index.js
│
├─ packages/
│  ├─ domain/
│  │  ├─ scheduling/
│  │  ├─ payroll/
│  │  ├─ workforce/
│  │  └─ shared/
│  ├─ contracts/
│  │  ├─ api/
│  │  └─ schemas/
│  └─ ui/
│     ├─ primitives/
│     ├─ patterns/
│     └─ tokens/
│
├─ docs/prd/
├─ firebase.json
├─ firestore.rules
├─ firestore.indexes.json
├─ .firebaserc
├─ pnpm-workspace.yaml
└─ package.json
```

Exact directory names may evolve, but these boundaries are mandatory:

- UI cannot own payroll/scheduling truth;
- domain logic must be reusable and deterministic;
- API routes must remain thin orchestration layers;
- Firestore access must be isolated behind repository/data-access modules;
- shared contracts must not import browser-only code;
- business modules must not depend on Tailwind or React.

---

# 7. JavaScript Source Standard

NOCScheduler intentionally uses JavaScript rather than TypeScript as the source language.

Canonical file extensions:

- `.js` for standard modules;
- `.jsx` for React components.

Do not introduce `.ts` or `.tsx` without a future explicit architecture decision.

To keep a large JavaScript codebase safe:

- use ESM imports/exports;
- enable strict ESLint rules;
- use Zod at untrusted boundaries;
- use JSDoc for important domain/API types;
- optionally enable `// @ts-check` / `checkJs` static analysis while keeping source files JavaScript;
- keep functions small and domain-specific;
- prefer pure deterministic functions for calculation rules;
- never represent IDR using binary floating point;
- add contract/regression tests for every critical rule.

A TypeScript compiler may be used only as a **development checker for JavaScript/JSDoc** if useful; this does not make TypeScript the application source language.

---

# 8. Frontend Application Architecture

## 8.1 React + Vite

Vite owns:

- local frontend dev server;
- HMR;
- production bundling;
- environment exposure rules;
- code splitting;
- asset optimization.

Frontend output is a static bundle deployable to Firebase Hosting.

## 8.2 Routing

React Router owns application routing.

PRD-06 route semantics remain canonical.

Protected-route UI may redirect unauthenticated users, but **route hiding is never authorization**. Backend endpoints independently authorize every protected request.

Use lazy route/module loading for large admin/reporting surfaces.

## 8.3 Server state — TanStack Query

TanStack Query is the canonical frontend server-state layer for interactive application data.

Use it for:

- current schedule;
- team schedule;
- schedule management workspace;
- employees;
- requests;
- payroll;
- reports;
- notifications;
- audit/history.

Rules:

- use stable query-key factories;
- invalidate only affected scopes;
- use optimistic UI only when rollback behavior is safe;
- dangerous commands should prefer pending/confirmed server states rather than pretending success;
- do not duplicate API truth into Zustand.

## 8.4 Local UI state

React state/context remains default for local interaction state.

Zustand is allowed for focused cross-tree UI state such as:

- schedule editor selection/bulk mode;
- command palette state;
- persistent workspace panel preferences;
- non-server UI coordination.

Do not create one global application store containing server data.

## 8.5 URL state

Shareable filters belong in URL/search params when practical:

- schedule period/date;
- employee filters;
- report filters;
- payroll period;
- request status;
- activity filter.

---

# 9. Modern UI and UX Implementation Stack

PRD-10 through PRD-13 remain fully authoritative.

Dependencies must support the product design rather than dictate it.

## 9.1 Tailwind CSS

Tailwind is the implementation engine for styling.

It is **not** the design system itself.

Canonical layering:

```text
Foundation palette
→ semantic CSS custom properties
→ light/dark theme mapping
→ Tailwind utilities/component recipes
→ NOCScheduler UI components
```

Never scatter raw arbitrary colors across feature files.

## 9.2 Accessible headless primitives

Use Radix-style primitives for behaviors that are difficult to implement correctly from scratch:

- dialog;
- popover;
- dropdown menu;
- select;
- tabs;
- tooltip;
- context menu;
- focus trapping;
- roving focus.

Their default visual styling is not canonical. NOCScheduler owns appearance through Tailwind and semantic tokens.

## 9.3 Component recipes

Use:

- `class-variance-authority` for controlled component variants;
- `clsx` for conditional class composition;
- `tailwind-merge` to resolve utility conflicts.

This is especially important for Light/Dark parity and consistent component sizes/states.

## 9.4 Icons

Use Lucide React as the baseline icon set.

Rules:

- one icon grammar across the product;
- consistent stroke and optical sizing;
- avoid mixing unrelated icon libraries on normal product surfaces.

## 9.5 Motion

Use Motion selectively for:

- panel/sheet transitions;
- row insertion/removal;
- state changes;
- subtle spatial continuity;
- command palette/dialog transitions.

Respect `prefers-reduced-motion`.

Animation must never delay an operational action.

## 9.6 Feedback

Use an accessible toast layer such as Sonner for non-blocking feedback.

Use inline feedback for validation and state that requires continued attention.

Do not use toast as the only evidence of critical mutation.

## 9.7 Command palette

A `cmdk`-style command palette may be used as a P1 productivity accelerator for desktop keyboard users.

It may expose:

- navigation;
- employee search;
- jump to date/period;
- allowed quick actions.

Permission checks still apply to actions.

## 9.8 Mobile sheet/drawer

Use an accessible drawer primitive such as Vaul where a bottom-sheet interaction is appropriate.

Mobile must not simply reuse oversized desktop modal dimensions.

## 9.9 Large schedule/data surfaces

Use TanStack Virtual for very large rows/columns where DOM volume would cause interaction jank.

Virtualization must preserve:

- keyboard navigation;
- sticky header behavior;
- selection clarity;
- scroll restoration;
- touch usability.

## 9.10 Tables

Use TanStack Table for headless sorting/filtering/column behavior where table semantics are appropriate.

Do not force mobile to render desktop tables when PRD-12 requires recomposition into list/detail or cards.

## 9.11 Drag and drop

Use dnd-kit for schedule interactions that genuinely benefit from drag/drop.

Every drag interaction must also have a non-drag accessible alternative.

## 9.12 Date/time UI

Use React Day Picker or purpose-built components for date selection.

Business time calculations must use a Temporal-compatible abstraction rather than relying on ad-hoc browser `Date` arithmetic for cross-midnight logic.

`Asia/Jakarta` handling must be explicit in scheduling/payroll tests.

## 9.13 Charts

Use Recharts for bounded reporting visualizations.

Charts must always preserve an accessible textual/table interpretation for important operational/financial data.

---

# 10. Form Architecture

Baseline:

- simple forms may use native controlled/uncontrolled React patterns;
- complex forms use React Hook Form;
- Zod defines canonical payload validation contracts where reusable;
- `@hookform/resolvers` connects complex form validation to Zod.

Server validation always runs again.

Use optimistic local UX only for low-risk changes.

High-risk operations such as publish/finalize/lock must show explicit server-confirmed completion.

---

# 11. Backend Node.js Architecture

## 11.1 Node.js runtime

Use an actively supported Node.js LTS/runtime supported by the selected Firebase managed environment.

Application server code is JavaScript ESM.

## 11.2 Express application

Express is the baseline HTTP framework because it is simple, mature, and maps cleanly to Firebase HTTPS functions.

Canonical request pipeline:

```text
Request
→ correlation/request ID
→ security headers
→ body/size policy
→ auth token verification
→ optional App Check verification
→ Zod shape validation
→ capability authorization
→ application command/query
→ domain service
→ Firestore transaction/repository
→ audit/notification policy
→ structured response/log
```

Route handlers remain thin.

Do not implement payroll formulas or schedule invariants directly in Express route files.

## 11.3 Same-origin API

Production frontend should call API through the Firebase Hosting origin:

```text
/api/v1/*
```

Firebase Hosting rewrites `/api/**` to the managed Node.js function.

Benefits:

- simpler browser policy;
- fewer CORS problems;
- stable client API base;
- easier local proxy parity.

CORS should not be opened broadly by default.

## 11.4 Validation

Zod validates:

- route params;
- query params;
- request body;
- environment/config where applicable;
- external structured payloads;
- shared API response contracts where valuable.

Business validation remains separate from shape validation.

---

# 12. API Contract Rebaseline

PRD-15 endpoint semantics remain canonical.

The implementation changes from Next.js Route Handlers to Express/Node routes.

Example:

```text
POST /api/v1/schedule-periods/:id/validate
POST /api/v1/schedule-periods/:id/publish
POST /api/v1/requests/:id/approve
POST /api/v1/payroll-periods/:id/calculate
POST /api/v1/payroll-periods/:id/finalize
POST /api/v1/payroll-periods/:id/lock
POST /api/v1/payroll-periods/:id/unlock
```

Required API properties remain:

- explicit commands for dangerous transitions;
- machine-readable errors;
- correlation IDs;
- idempotency where duplicate submission is dangerous;
- `expectedVersion` optimistic concurrency;
- pagination/filtering/sorting contracts;
- authorization at every protected entry;
- deterministic response shape.

---

# 13. Authentication and Authorization Rebaseline

## 13.1 Firebase Authentication

Firebase Authentication remains canonical.

The browser signs in using Firebase client SDK.

The Node API verifies Firebase ID tokens through Firebase Admin SDK.

## 13.2 Application authorization

Firebase authentication identity does not replace NOCScheduler authorization.

Application capabilities remain server-side business policy, e.g.:

```text
schedule.read
schedule.manage
schedule.publish
request.approve
payroll.calculate
payroll.finalize
payroll.lock
payroll.unlock
compensation.manage
access.manage
```

Roles/capabilities/scopes remain in application data and are checked at request time.

## 13.3 App Check

Production should evaluate Firebase App Check as an additional abuse-resistance signal for browser-to-backend traffic.

App Check is defense in depth, not authorization.

## 13.4 XSS and token safety

Because SPA code runs in the browser, XSS prevention is a critical authentication control.

Mandatory controls include:

- strict CSP compatible with the selected build/runtime;
- no unsafe HTML rendering without sanitization;
- dependency review;
- no secrets in Vite-exposed environment variables;
- trusted URL/deep-link validation;
- output encoding through React defaults;
- security regression tests.

---

# 14. Firestore Architecture

Cloud Firestore remains canonical persistence.

Canonical collection families from PRD-21 remain valid, including:

```text
users
employees
teams
roles
permissions
userRoles
shiftTypes
shiftTypeVersions
schedulePeriods
scheduleVersions
shiftAssignments
requests
workforceExceptions
replacementAssignments
shiftSwapRequests
overtimeRecords
employeeSalaryVersions
shiftIncentiveVersions
payrollPeriods
payrollRecords
payrollRevisions
payrollItems
payrollAdjustments
holidays
systemSettings
notifications
auditEvents
idempotencyKeys
```

## 14.1 Firestore invariants

Because Firestore does not provide SQL foreign keys/unique constraints, critical invariants use combinations of:

- deterministic document IDs;
- reservation/index documents;
- transactions;
- `rowVersion` optimistic concurrency;
- create-only immutable records;
- effective-date domain checks;
- snapshot values;
- append-oriented revisions;
- regression tests.

## 14.2 Direct client access

High-risk business collections remain server-write-only.

Direct browser reads may be opened only when:

- they provide a clear UX/performance benefit;
- Firestore Security Rules can express the authorization safely;
- emulator rule tests exist;
- the direct read does not create a second business-logic implementation.

TanStack Query against the HTTP API remains the default data-access pattern for core application features.

---

# 15. Performance Architecture

Performance work should focus on actual user-perceived latency and interaction smoothness.

Frontend requirements:

- route-level lazy loading;
- avoid giant shared bundles;
- virtualize large schedule/list surfaces;
- cache server state intentionally;
- prevent duplicate requests;
- prefetch likely next views selectively;
- use skeletons only when content cannot be shown immediately;
- minimize layout shift;
- keep animation on compositor-friendly properties where practical;
- profile schedule grid interactions on realistic data sizes.

Backend requirements:

- use concrete Firestore indexes;
- avoid N+1 read patterns;
- use bounded query limits;
- aggregate/projection documents only when justified by measured read cost/latency;
- keep serverless cold-start impact observable;
- avoid loading large optional modules in every request path.

---

# 16. PWA and Offline Policy

NOCScheduler may use `vite-plugin-pwa` as a P1 enhancement for installability and application-shell resilience.

However:

- critical schedule/payroll data must not silently display stale cached truth;
- API mutation must never be queued/replayed blindly by a service worker;
- offline state must be clearly visible;
- cached business data requires explicit freshness semantics;
- network-first behavior is preferred for critical operational screens.

PWA is not an MVP blocker.

---

# 17. Notifications and Realtime

PRD-18 remains canonical.

Baseline application awareness can use:

- TanStack Query invalidation/refetch;
- controlled polling where justified;
- Firestore realtime listeners only for bounded read surfaces that benefit materially.

Do not subscribe the entire application to broad Firestore collections.

Realtime must not create a bypass around server-side authorization or canonical API commands.

---

# 18. Logging and Observability

Use structured logging through Pino in the Node API.

Every request should have a correlation/request ID.

High-value fields may include:

```text
requestId
correlationId
userId/actorId when safe
route
method
status
latencyMs
commandName
resourceType
resourceId
errorCode
runtimeRevision
```

Never log:

- passwords;
- Firebase ID tokens;
- private keys;
- secret values;
- sensitive request payloads without redaction.

Audit events remain separate from application logs.

---

# 19. Security Middleware and Backend Dependencies

Baseline backend dependency direction:

- `express` — HTTP routing;
- `firebase-admin` — privileged Firebase access;
- `firebase-functions` — managed function integration;
- `zod` — runtime contracts;
- `helmet` — secure HTTP header defaults where compatible with Hosting/CSP strategy;
- `compression` — response compression where the managed edge/runtime does not already make it redundant;
- `pino` + HTTP integration — structured logging;
- `ulid` or equivalent — sortable/correlation identifiers where application-generated IDs are needed.

CORS middleware is allowed for local development or explicitly approved external origins but should not default to `*` in production.

Rate limiting must account for serverless multi-instance behavior; do not treat per-process in-memory rate limiting as a strong global security control. Prefer managed platform controls, authentication, App Check, bounded expensive endpoints, and a shared-state limiter only if real abuse risk requires it.

---

# 20. Testing and Quality Dependency Baseline

## 20.1 Unit/domain

Use Vitest for:

- scheduling rules;
- payroll formulas;
- effective-date logic;
- permission decisions;
- API contract helpers;
- concurrency/idempotency helpers;
- date/time edge cases.

## 20.2 Component tests

Use Testing Library for behavior-focused component tests.

Avoid snapshot-heavy tests that only freeze markup.

## 20.3 Network mocking

Use MSW when browser/component tests need realistic HTTP contract mocking without duplicating fetch internals.

## 20.4 Firebase integration tests

Use Firebase Local Emulator Suite for:

- Auth verification flows;
- Firestore repository integration;
- security rules;
- transactions;
- deterministic document-key invariants;
- immutable/create-only behavior;
- concurrency regression.

## 20.5 E2E

Use Playwright for critical integrated flows:

- login;
- dashboard;
- schedule visibility;
- schedule editing/publish;
- requests/approval;
- payroll lifecycle;
- roles/access guardrails;
- reports;
- notifications;
- responsive mobile behavior;
- Light/Dark visual parity.

## 20.6 Accessibility

Use axe-based automation plus manual keyboard/focus/touch verification.

## 20.7 Visual regression

Use Playwright screenshot assertions for high-value stable surfaces and PRD-13 alignment gates.

Visual tests must cover representative desktop/mobile and Light/Dark targets.

---

# 21. Code Quality and Developer Experience Dependencies

Recommended development dependencies:

- ESLint;
- React/React Hooks lint rules;
- JSX accessibility lint rules;
- Prettier;
- Tailwind-aware formatting support where compatible;
- `lint-staged` + Git hook tooling for targeted pre-commit checks;
- `knip` for unused files/exports/dependency detection;
- bundle visualizer for periodic bundle audits;
- `concurrently` or equivalent for coordinated local Vite/API/emulator processes.

Quality commands should conceptually include:

```text
pnpm lint
pnpm format:check
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm check:deadcode
```

Not every expensive suite must run on every local save, but merge/release gates must be explicit.

---

# 22. Environment and Configuration

## 22.1 Frontend environment

Vite-exposed environment variables are browser-visible.

Never place server secrets in variables exposed to the Vite bundle.

Firebase web configuration is client configuration, not a server credential, but it should still be centrally managed per environment.

## 22.2 Backend secrets

Use managed Firebase/Google Cloud secret/environment facilities for confidential values.

Never commit service-account JSON.

Production managed runtime should use application-default identity/IAM where available.

## 22.3 Local safety

Use a demo/local Firebase project with emulators for normal development and CI.

Accidental non-emulated writes to production must be made difficult by configuration and environment separation.

---

# 23. Firebase Hosting and API Deployment

Canonical production flow:

```text
GitHub revision
→ install from pinned pnpm lockfile
→ lint/test/build gates
→ Vite production build
→ deploy static assets to Firebase Hosting
→ deploy Node API to Firebase Cloud Functions 2nd gen
→ deploy Firestore rules/indexes when changed
→ post-deploy smoke checks
```

Firebase Hosting should provide:

- HTTPS;
- immutable hashed asset caching;
- SPA fallback;
- controlled security headers;
- `/api/**` rewrite to managed Node API.

Application rollback and data recovery are separate operations.

Never restore Firestore merely to undo a bad frontend/API release when business data is still correct.

---

# 24. Backup and Recovery

PRD-20 recovery principles remain required, translated to Firebase/Firestore capabilities.

Requirements include:

- defined backup/export policy appropriate to Firestore;
- periodic restore validation to an isolated environment/project;
- documented RPO/RTO targets;
- immutable release identification by Git SHA;
- runbooks for bad deployment, auth outage, Firestore issue, accidental business mutation, and secret compromise;
- audit/history protection independent of ordinary runtime logs.

---

# 25. Dependencies Explicitly Rejected as Baseline

Do not introduce these without a real requirement:

- Next.js;
- TypeScript as application source language;
- PostgreSQL;
- Drizzle ORM;
- Prisma ORM;
- Docker as a normal local requirement;
- Redux as default application state;
- GraphQL merely for fashion;
- tRPC tied to framework assumptions;
- microservices;
- Kafka;
- Kubernetes;
- Redis solely because caching exists;
- broad client-side Firestore writes to payroll/schedule/access collections;
- multiple overlapping UI component suites with inconsistent visual grammar.

---

# 26. UX Quality Requirements Added by the Rebaseline

The framework migration must improve, not regress, UX.

Implementation should explicitly support:

1. fast application-shell load;
2. route-level loading boundaries without full-page refresh;
3. optimistic UX only for safe operations;
4. server-confirmed feedback for dangerous commands;
5. virtualized high-density schedule surfaces when data size warrants it;
6. smooth horizontal/vertical schedule navigation without scroll-snap fighting user intent;
7. one-hand mobile actions and bottom sheets where appropriate;
8. keyboard-first desktop navigation for power users;
9. command palette as optional productivity accelerator;
10. precise skeleton/loading/error/empty states;
11. predictable back/forward behavior through URL state;
12. consistent focus restoration after dialogs/sheets;
13. reduced-motion support;
14. no theme flash where practical;
15. Light/Dark parity using one component structure;
16. no arbitrary page-specific styling that bypasses semantic tokens;
17. no full-page reload after routine data mutation;
18. persistent user preferences only when they provide real recurring value.

---

# 27. Logic Reliability Requirements Added by the Rebaseline

Because the codebase uses JavaScript rather than TypeScript source, reliability must be intentional.

Required safeguards:

- pure domain modules;
- JSDoc for high-value structures and public module contracts;
- runtime Zod schemas at every untrusted boundary;
- deterministic test fixtures;
- exhaustive business-state tests for payroll/schedule transitions;
- explicit error codes instead of string parsing;
- no hidden implicit timezone conversion;
- no floating-point IDR calculations;
- immutable input/output style for calculation helpers where practical;
- idempotency for retry-sensitive commands;
- explicit `expectedVersion` concurrency checks;
- repository adapters that isolate Firestore details from business logic;
- shared API contracts between web and Node packages where safe;
- no duplicated payroll/scheduling formulas in UI.

---

# 28. Migration Rules From the Previous Next.js Baseline

When implementation begins or existing Next.js artifacts are encountered:

## Remove/replace

```text
next
next.config.*
app/ or pages/ framework routing assumptions
Server Components
Server Actions
Route Handlers
Next-specific middleware
Next-specific image/font/navigation APIs
NextAuth/Better Auth remnants if any
```

## Replace with

```text
Vite
React Router
React client components
Node.js Express routes
Firebase Authentication
Firebase Hosting
Firebase Cloud Functions managed Node runtime
TanStack Query
Tailwind CSS
```

Business/domain modules should be migrated without rewriting rules unless tests expose an existing defect.

---

# 29. Definition of Done for Platform Foundation

The platform rebaseline is considered implemented when all of the following are true:

- source application uses `.js/.jsx`, not Next.js framework structure;
- Vite builds the frontend successfully;
- Tailwind + semantic token foundation supports Light/Dark parity;
- React Router owns navigation;
- Node.js API exposes `/api/v1` contract;
- Firebase Auth login can be verified by the Node API;
- Firestore emulator-backed repositories work;
- high-risk mutation flows are server-authoritative;
- shared Zod/API contracts exist where appropriate;
- TanStack Query is wired as canonical server-state layer;
- schedule workspace architecture can support virtualization and dnd-kit without coupling domain logic to UI;
- Vitest domain tests pass;
- Firebase emulator integration tests pass;
- Playwright smoke flow passes on desktop and mobile viewport;
- Light and Dark theme smoke screenshots pass;
- ESLint/build quality gates pass;
- no production Docker/PostgreSQL/Next.js dependency remains;
- Firebase Hosting + managed Node API deployment path is documented;
- no secrets are exposed in Vite client configuration.

---

# 30. Final Architecture Statement

The canonical NOCScheduler architecture is:

> **A modern internal React SPA written in JavaScript/JSX, built with Vite and styled through Tailwind CSS using a strict semantic design system; backed by a server-authoritative JavaScript/Node.js HTTP API running on Firebase-managed infrastructure; using Firebase Authentication, Cloud Firestore, Admin SDK, and Emulator Suite; with TanStack data tooling, accessible headless UI primitives, robust validation, deterministic business-domain tests, and first-class desktop/mobile Light/Dark UX.**

This architecture intentionally optimizes for:

- owner simplicity;
- modern UX;
- fast development;
- clear frontend/backend boundaries;
- strong business-rule integrity;
- low infrastructure maintenance;
- high visual quality;
- testability;
- future extensibility without premature infrastructure complexity.