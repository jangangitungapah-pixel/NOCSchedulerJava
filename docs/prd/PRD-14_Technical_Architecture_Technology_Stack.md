# PRD-14 — Technical Architecture & Technology Stack

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Technical Architecture & Technology Stack  
> **Document ID:** PRD-14  
> **Status:** Draft — Technical Architecture Source of Truth  
> **Depends On:** PRD-01 through PRD-13  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **arsitektur teknis, technology stack, runtime boundaries, code organization, data-access strategy, authentication architecture, authorization enforcement, validation, client/server state management, styling architecture, testing strategy, caching, background processing, observability, configuration, migration strategy, dan deployment constraints** untuk NOCScheduler.

PRD-14 menjadi source of truth untuk menjawab:

> **“Dengan teknologi dan struktur apa NOCScheduler harus dibangun agar business logic tetap aman, UI tetap premium dan cepat, serta codebase tetap mudah dikembangkan tanpa over-engineering?”**

Dokumen ini tidak menggantikan:

- **PRD-15 — API & Backend Contract**, yang akan menetapkan endpoint, request/response, error contract, pagination, filtering, dan idempotency API secara rinci.
- **PRD-16 — Authentication, Security & Data Integrity**, yang akan memperdalam security control.
- **PRD-19 — QA, Testing & Acceptance Criteria**, yang akan memperdalam test coverage dan release gates.
- **PRD-20 — Deployment, Backup, Observability & Operations**, yang akan menetapkan topology production, backup/restore, monitoring, release, dan rollback secara detail.

---

# 2. Architecture Decision Summary

## 2.1 Recommended Baseline Stack

| Layer | Recommended Technology |
|---|---|
| Language | TypeScript — strict mode |
| Full-stack Framework | Next.js 16+ App Router |
| UI Runtime | React supported by selected Next.js release |
| Database | PostgreSQL |
| ORM / SQL Toolkit | Drizzle ORM |
| Migration Tool | Drizzle Kit + reviewed SQL migrations |
| Authentication | Better Auth |
| Authorization | NOCScheduler custom permission/capability service |
| Runtime Validation | Zod 4 |
| Client Server-State | TanStack Query |
| Local UI State | React state/context; focused store only when justified |
| Forms | React Hook Form + Zod resolver where form complexity warrants it |
| Styling | Tailwind CSS + semantic CSS design tokens |
| Accessible UI Primitives | Radix-style headless primitives / equivalent accessible primitives |
| Motion | Motion for React, selectively |
| Date/Time | Temporal-compatible abstraction with explicit timezone handling |
| Unit / Logic Tests | Vitest |
| Component Tests | Vitest + Testing Library where useful |
| E2E / Browser Tests | Playwright |
| Visual Regression | Playwright screenshot assertions |
| Accessibility Testing | Automated axe-style checks + manual keyboard QA |
| Package Manager | pnpm |
| Runtime Topology | Modular monolith |
| Primary Deployment Unit | One web application + PostgreSQL |

Exact dependency patch/minor versions should be pinned in the lockfile when project setup is created and upgraded intentionally through controlled dependency updates.

---

# 3. Architecture Principles

## TA-P01 — Modular Monolith First

NOCScheduler should start as **one deployable full-stack application** with strong internal module boundaries.

Do not start with:

- microservices,
- service mesh,
- distributed transactions,
- multiple independently deployed backend services,
- message broker infrastructure that has no current operational need.

The application is internal NOC software with tightly related scheduling, exception, payroll, employee, and audit domains. A modular monolith gives better transactional integrity and lower operational complexity.

Modules must still be designed so they could be extracted later if scale or organization boundaries genuinely require it.

---

## TA-P02 — Domain Logic Must Not Live in UI Components

Rules such as:

- one primary work state per date,
- cross-midnight shift handling,
- incentive eligibility,
- payroll locking,
- request approval,
- permission enforcement,

must live in server-side domain/service logic.

React components may present validation but must not be the only implementation of business rules.

---

## TA-P03 — Server Is the Final Authority

Client-side state is optimistic/user-facing state.

The server remains authoritative for:

- authorization,
- validation,
- schedule publication,
- payroll calculation,
- exception approval,
- compensation mutation,
- audit generation,
- concurrency checks.

---

## TA-P04 — Strong Consistency for Critical Writes

Operations involving money, schedule publication, shift swap, role changes, and payroll lifecycle must prefer transactional consistency over eventual consistency.

A successful response must not represent a half-applied business operation.

---

## TA-P05 — Type Safety Across Boundaries

Types should flow from:

- database schema,
- domain models,
- validation schemas,
- API contracts,
- UI data models.

However TypeScript compile-time types must never replace runtime validation of untrusted input.

---

## TA-P06 — Historical Integrity Is Architectural

Effective dating, immutable revisions, payroll snapshots, schedule versions, and audit evidence are not optional implementation details.

Architecture must make historical correctness easy and destructive overwrite difficult.

---

## TA-P07 — Design System Is Infrastructure

UI tokens and shared components are part of platform architecture.

Pages must not invent ad-hoc:

- input styling,
- spacing systems,
- color values,
- modal implementations,
- animation curves,
- dark-mode overrides.

---

## TA-P08 — Progressive Complexity

Do not introduce Redis, Kafka, WebSocket infrastructure, queue clusters, or multi-region topology until an actual requirement justifies them.

Architecture must leave clean extension points without paying full complexity cost on day one.

---

# 4. Application Architecture

## 4.1 High-Level Runtime

```text
Browser
  ↓
Next.js Application
  ├─ Server Components
  ├─ Client Components
  ├─ Route Handlers / API
  ├─ Authentication
  ├─ Authorization
  ├─ Domain Services
  ├─ Query Services
  ├─ Audit Service
  └─ Database Layer
        ↓
    PostgreSQL
```

Optional later:

```text
PostgreSQL Outbox
  ↓
Background Worker
  ├─ notifications
  ├─ scheduled jobs
  ├─ export generation
  └─ external integrations
```

---

## 4.2 Next.js App Router

Use App Router as the routing and rendering foundation.

Recommended responsibilities:

### Server Components

Use for:

- initial page reads,
- permission-aware page composition,
- server-rendered summaries,
- non-interactive data presentation,
- minimizing unnecessary client JavaScript.

### Client Components

Use only where browser interactivity is required:

- schedule grid editing,
- drag/select/bulk interactions,
- bottom sheets,
- complex filters,
- command palette,
- interactive payroll drill-down,
- theme switcher,
- animations,
- local optimistic UI.

Do not add `use client` high in the tree without necessity.

---

# 5. Server Boundary & Backend Architecture

## 5.1 Canonical Layering

Recommended backend flow:

```text
HTTP / Server Entry
  ↓
Input Validation
  ↓
Authentication
  ↓
Authorization
  ↓
Application Command / Query
  ↓
Domain Service
  ↓
Repository / Database
  ↓
Audit / Outbox in transaction where required
```

No route handler should directly contain large payroll or scheduling rule implementations.

---

## 5.2 Commands and Queries

Separate conceptual responsibilities:

### Commands

Mutate state.

Examples:

- assign shift,
- publish schedule,
- approve leave,
- create replacement,
- calculate payroll,
- finalize payroll,
- lock payroll,
- update incentive rate.

### Queries

Read state.

Examples:

- get team schedule,
- get now-on-duty,
- get payroll breakdown,
- get audit history.

CQRS infrastructure is **not required**. This is a code-organization principle, not a separate platform.

---

## 5.3 Route Handlers as Canonical HTTP API

Interactive client operations should use typed Route Handlers as the canonical HTTP boundary.

Benefits:

- clear request/response contracts,
- easier E2E/API testing,
- easier future integration,
- explicit authorization boundary,
- easier observability.

PRD-15 will define exact endpoints.

---

## 5.4 Server Components May Call Query Services Directly

Server-rendered pages do not need to make internal HTTP calls back into the same application.

Server Components may call query/application services directly as long as:

- authentication context is resolved,
- authorization is enforced,
- the same domain/query rules are reused,
- no security control exists only in the HTTP handler.

---

## 5.5 Server Actions

Server Actions may be used selectively for tightly scoped UI forms if they provide clear value.

They must not become a parallel unstructured backend.

High-value domain operations should still route through shared command/application services.

If an operation already has a canonical API contract, Server Actions must not implement separate business logic.

---

# 6. Database Architecture

## 6.1 Database Choice — PostgreSQL

PostgreSQL is the baseline relational database.

Required capabilities include:

- transactions,
- foreign keys,
- unique constraints,
- indexes,
- robust date/timestamp types,
- locking/concurrency primitives,
- JSON support for bounded metadata/audit snapshots,
- reliable migration tooling.

---

## 6.2 ORM — Drizzle ORM

Drizzle is recommended because the application benefits from:

- explicit relational schema,
- close mapping to SQL,
- type-safe query construction,
- transaction support,
- migration generation,
- ability to inspect/review generated SQL.

ORM usage must not hide important database behavior.

For complex constraints or optimized queries, explicit SQL is allowed when documented and tested.

---

## 6.3 Migration Strategy

Use codebase-first schema management.

Flow:

```text
Schema change
→ generate migration
→ review SQL
→ test on local/test database
→ commit migration
→ apply through deployment process
```

Direct `push`-style schema synchronization must not be the normal production migration path.

Production schema changes require versioned migration files.

---

## 6.4 Migration Safety

Potentially destructive migrations require explicit review.

Examples:

- dropping column,
- changing nullable → required,
- changing money type,
- deleting historical tables,
- modifying effective-date constraints,
- large backfills.

Use expand/migrate/contract strategy where zero-downtime or data safety warrants it.

---

# 7. Authentication Architecture

## 7.1 Better Auth

Better Auth is the recommended authentication framework.

Baseline authentication method:

- internal email/login identifier + password.

Future compatible options:

- SSO,
- passkey,
- external identity provider,
- 2FA.

These are not all required for MVP.

---

## 7.2 Authentication vs Authorization

Better Auth handles:

- identity,
- credentials,
- session lifecycle,
- authentication security primitives.

NOCScheduler's own authorization layer handles:

- roles,
- permission codes,
- scopes,
- schedule mutation access,
- payroll privileges,
- compensation privileges,
- settings privileges.

Do not encode business permission logic inside authentication provider configuration.

---

## 7.3 Session Model

Prefer secure cookie-backed server sessions.

Critical mutation must resolve the current server session and current permission state at request time.

Do not trust permission claims supplied by client payload.

---

# 8. Authorization Service

Create a centralized capability API conceptually similar to:

```text
can(actor, permission, resourceContext)
requirePermission(actor, permission, resourceContext)
```

Examples:

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

Route/UI visibility may consume the same capability model, but backend enforcement is mandatory.

---

# 9. Runtime Validation

## 9.1 Zod 4

Use Zod as baseline runtime schema validator.

Validate:

- API request body,
- URL/search params,
- environment configuration,
- form payloads where useful,
- imported/exported structured data,
- external integration payloads.

---

## 9.2 Validation Layers

Different validation responsibilities must remain distinct:

```text
Shape Validation
  → Is payload structurally valid?

Authorization
  → May actor perform this action?

Business Validation
  → Is action valid under scheduling/payroll rules?

Database Constraint
  → Can persisted state violate invariant?
```

Do not flatten all errors into `400 Bad Request` without classification.

---

# 10. State Management Strategy

## 10.1 Server State — TanStack Query

Use TanStack Query for interactive client-side server state where caching/refetch/invalidation is valuable.

Examples:

- schedule workspace,
- requests list,
- employee directory filters,
- payroll list/detail,
- notifications,
- activity history.

After successful mutation, invalidate or update the precise affected query keys.

Do not globally refetch everything after every mutation.

---

## 10.2 Server Components for Initial Read

Initial route content can be loaded server-side and passed/hydrated into client workspaces where beneficial.

Avoid forcing every page into client-side fetching just because TanStack Query exists.

---

## 10.3 Local UI State

Use React state/context for local interaction state by default.

Examples:

- selected cell,
- open sheet,
- current bulk mode,
- temporary filters,
- draft UI-only selection.

Introduce a dedicated client store only when state genuinely spans complex sibling trees or persistence boundaries.

Do not introduce Redux-style global state by default.

---

## 10.4 URL as State

Shareable and navigational state should live in URL/search params when practical:

- period,
- employee filter,
- schedule view,
- request status,
- report filters.

This supports deep links and back/forward navigation.

---

# 11. Forms

Use native React form primitives for simple forms.

Use React Hook Form when form complexity justifies it, especially:

- settings,
- employee profile,
- compensation configuration,
- long request forms,
- validation-heavy workflows.

Forms must integrate with canonical Zod schemas when appropriate.

Server remains final validation authority.

---

# 12. Styling & Design System Implementation

## 12.1 Tailwind CSS + Semantic CSS Variables

Tailwind should be used as a styling engine, not as the design system itself.

Design tokens from PRD-11 remain canonical.

Recommended layers:

```text
Foundation palette
  ↓
Semantic CSS variables
  ↓
Theme mapping (Light / Dark)
  ↓
Tailwind utilities / component recipes
  ↓
UI components
```

Example semantic concepts:

```text
--surface-canvas
--surface-base
--surface-raised
--text-primary
--text-secondary
--border-subtle
--action-primary
--status-danger
--shift-s1
--shift-s2
--shift-s3
```

Do not scatter raw palette values across page files.

---

## 12.2 Theme Strategy

Default theme: `light`.

Support:

- `light`,
- `dark`,
- optionally `system` as user preference behavior.

Component structure must remain identical across themes.

Avoid page-specific dark-mode patches.

Theme preference should be applied early enough to prevent visible theme flash.

---

## 12.3 Accessible Primitives

Use accessible headless primitives for complex behavior such as:

- dialog,
- popover,
- dropdown menu,
- tooltip,
- tabs,
- focus trapping,
- roving focus,
- select/combobox foundations.

Styling remains NOCScheduler-owned.

Do not ship the default visual appearance of a third-party component library as the product design.

---

# 13. Motion Architecture

Use Motion for React only where it improves spatial understanding or interaction feedback.

Good uses:

- drawer/sheet entrance,
- inspector transition,
- selected surface transitions,
- schedule context movement,
- expanding payroll breakdown,
- command palette,
- controlled list insertion/removal.

Prefer CSS transitions for simple hover/focus/pressed states.

All animation must respect reduced-motion preference.

Motion must not delay business completion or block input unnecessarily.

---

# 14. Date, Time & Timezone Architecture

Date/time is a critical domain concern.

Requirements:

- default operational timezone is `Asia/Jakarta`,
- `work_date` is a business date, not UTC date,
- cross-midnight shift uses explicit start/end datetime construction,
- audit timestamps can be stored in UTC,
- payroll period uses business dates,
- browser timezone must never silently redefine work date.

Introduce a central date/time module.

Application code must not repeatedly implement ad-hoc parsing such as:

```text
new Date(string)
```

without explicit timezone semantics.

Prefer Temporal-compatible APIs/abstraction. If runtime support is not universally reliable at implementation time, use a well-tested polyfill/adapter behind the same application-level time module.

---

# 15. Money Architecture

All IDR amounts must use integer rupiah or explicit fixed precision representation.

Baseline TypeScript domain representation:

```text
MoneyIDR = integer rupiah
```

Do not use floating-point arithmetic for salary, incentive, deduction, or THP.

Formatting belongs to presentation helpers; financial math belongs to domain helpers.

---

# 16. Realtime Strategy

Realtime transport is **not required for MVP correctness**.

Baseline:

- mutation returns fresh authoritative state,
- precise query invalidation,
- refetch on focus for appropriate datasets,
- optional lightweight polling for notification indicators.

Future:

- Server-Sent Events for one-way update streams,
- WebSocket only if true bidirectional realtime interaction becomes necessary.

Schedule and payroll correctness must never depend on a realtime connection being alive.

---

# 17. Background Jobs & Outbox

Not every operation needs a worker on day one.

However architecture should provide an extension point for asynchronous side effects.

Recommended future-safe pattern:

```text
Business transaction
  ├─ canonical data write
  ├─ audit evidence
  └─ outbox event

Worker
  └─ performs notification/integration/export side effect
```

Candidate asynchronous tasks:

- bulk notifications,
- email/WhatsApp integration later,
- expensive report generation,
- scheduled reminders,
- cleanup jobs.

Audit evidence for high-risk writes should remain transactionally reliable and not depend solely on an unreliable background task.

---

# 18. Caching Strategy

## 18.1 Principle

Cache derived/read-heavy data, not business truth blindly.

Good cache candidates:

- dashboard summaries,
- employee directory,
- historical reports,
- static configuration that rarely changes.

High-care datasets:

- current schedule draft,
- published correction state,
- pending approval state,
- payroll dirty/finalized/locked state,
- permissions.

---

## 18.2 Cache Invalidation

Mutation must know which read models become stale.

Example:

```text
Publish schedule
→ invalidate schedule period
→ invalidate team schedule
→ invalidate employee schedules
→ invalidate dashboard coverage
→ mark/invalidate payroll source state if applicable
```

Do not rely only on TTL for critical state freshness.

---

# 19. Concurrency Architecture

Use optimistic concurrency for records where stale writes are dangerous.

Candidates:

- schedule draft/version,
- published correction,
- request approval,
- compensation settings,
- payroll revision,
- payroll lifecycle,
- role/permission mutation.

Request may carry:

```text
expected_version
```

or equivalent revision token.

If current state has changed, server returns a conflict rather than silently overwriting newer data.

---

# 20. Transaction Boundaries

Must be transactional:

- publish schedule,
- atomic shift swap,
- replacement activation where multiple records change,
- payroll calculation persistence per employee/revision,
- payroll finalization,
- payroll lock/unlock,
- role/permission bundle updates,
- critical setting version rollover.

Audit metadata that is required for the operation should be persisted in the same transaction or through a durability mechanism with equivalent guarantees.

---

# 21. Recommended Codebase Structure

Baseline single-repository structure:

```text
/
├─ docs/
│  └─ prd/
├─ drizzle/
│  └─ migrations/
├─ public/
├─ scripts/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  ├─ (app)/
│  │  ├─ api/
│  │  └─ layout.tsx
│  │
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layout/
│  │  └─ domain/
│  │
│  ├─ features/
│  │  ├─ dashboard/
│  │  ├─ schedule/
│  │  ├─ requests/
│  │  ├─ employees/
│  │  ├─ payroll/
│  │  ├─ reports/
│  │  ├─ settings/
│  │  └─ activity/
│  │
│  ├─ server/
│  │  ├─ auth/
│  │  ├─ authorization/
│  │  ├─ commands/
│  │  ├─ queries/
│  │  ├─ services/
│  │  ├─ audit/
│  │  └─ db/
│  │
│  ├─ db/
│  │  ├─ schema/
│  │  ├─ relations/
│  │  └─ index.ts
│  │
│  ├─ domain/
│  │  ├─ scheduling/
│  │  ├─ workforce/
│  │  ├─ compensation/
│  │  ├─ payroll/
│  │  └─ shared/
│  │
│  ├─ lib/
│  │  ├─ time/
│  │  ├─ money/
│  │  ├─ validation/
│  │  ├─ query/
│  │  └─ utilities/
│  │
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ themes.css
│  │  └─ globals.css
│  │
│  └─ types/
│
├─ tests/
│  ├─ contracts/
│  ├─ integration/
│  ├─ e2e/
│  └─ visual/
│
├─ package.json
├─ pnpm-lock.yaml
├─ drizzle.config.ts
├─ next.config.ts
├─ playwright.config.ts
└─ vitest.config.ts
```

This is directional. Implementation may adjust names while preserving boundaries.

---

# 22. Feature Module Structure

A feature should colocate UI-specific code where useful.

Example:

```text
features/schedule/
├─ components/
├─ hooks/
├─ queries/
├─ mutations/
├─ schemas/
├─ view-models/
└─ utils/
```

Server business logic must not be duplicated inside feature hooks.

---

# 23. Domain Layer

Pure or mostly-pure business logic should be isolated where feasible.

Examples:

```text
constructShiftInterval()
validateRestPeriod()
resolveEffectiveShiftState()
calculateShiftIncentive()
calculatePayrollTotals()
resolveEffectiveSalary()
```

These functions should be easy to unit test without rendering React or starting an HTTP server.

---

# 24. API Error Architecture

PRD-15 will define exact payloads, but technical architecture requires distinct categories:

```text
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
VALIDATION_ERROR
BUSINESS_RULE_ERROR
CONFLICT_ERROR
NOT_FOUND
LOCKED_RESOURCE
INTERNAL_ERROR
```

Frontend should receive structured error data suitable for:

- field errors,
- inline business warnings,
- conflict recovery,
- permission explanation,
- generic failure fallback.

Do not expose raw stack traces to clients.

---

# 25. Testing Architecture

## 25.1 Unit / Domain Tests — Vitest

Critical pure logic requires unit coverage.

Priority targets:

- scheduling rules `SCH-*`,
- payroll rules `PAY-*`,
- exception rules `EXC-*`,
- authorization rules `AUTHZ-*`,
- audit rules `AUD-*`,
- date/time utilities,
- money utilities.

---

## 25.2 Integration Tests

Test against a real PostgreSQL-compatible test database for behavior involving:

- transactions,
- uniqueness,
- effective dating,
- locking/concurrency,
- migrations,
- query behavior.

Do not mock away database invariants that are part of the contract.

---

## 25.3 Component Tests

Use for high-value reusable components and interaction states.

Examples:

- Date Picker,
- Schedule Cell,
- Shift Selector,
- Payroll Breakdown,
- Bottom Sheet,
- Permission-aware action group.

---

## 25.4 E2E — Playwright

Critical workflows:

- login,
- view schedule,
- create/publish schedule,
- submit/approve exception,
- calculate/finalize/lock payroll,
- permission denial,
- theme switching,
- mobile navigation.

---

## 25.5 Visual Regression

Critical pages require screenshot baselines aligned with PRD-13.

Test at representative desktop/mobile viewport and Light/Dark themes.

Visual regression must not replace human polish review.

---

# 26. Performance Architecture

## 26.1 Client Bundle Discipline

Keep large interactive libraries out of server-only pages.

Use code splitting/dynamic loading for heavy tools such as:

- advanced schedule workspace,
- chart/report visualizations,
- export preview,
- large command surfaces.

---

## 26.2 Large Lists / Grids

Schedule matrix and large report tables must avoid rendering unbounded DOM nodes.

Use:

- pagination,
- windowing/virtualization where justified,
- date range limiting,
- server-side filtering,
- incremental loading.

Virtualization must not break keyboard navigation or accessibility.

---

## 26.3 Avoid Premature Client Rendering

Static or read-heavy pages should use server rendering where practical.

Do not make the entire application a single client-side shell.

---

# 27. Observability Foundation

Even before PRD-20 implementation, code must support structured observability.

Every request/high-risk action should be traceable with identifiers such as:

- request ID,
- correlation ID,
- actor ID where safe,
- domain operation,
- result status,
- duration.

Application logs must not contain:

- passwords,
- session secrets,
- raw tokens,
- unnecessary payroll payload dumps.

Audit trail remains separate from application logs.

---

# 28. Environment Configuration

Validate environment variables at application startup.

Conceptual groups:

```text
DATABASE_URL
AUTH_SECRET / auth config
APP_BASE_URL
LOG_LEVEL
optional observability config
optional integration secrets
```

Never read arbitrary environment variables throughout random components.

Centralize configuration in a typed server config module.

Secrets must never be exposed through client bundles.

---

# 29. Package Management

Use `pnpm` with committed lockfile.

Requirements:

- deterministic installs,
- CI uses frozen lockfile,
- dependency upgrades are intentional,
- major upgrades require migration review,
- avoid duplicate libraries for the same problem.

Example anti-pattern:

```text
three date libraries
+ two modal systems
+ two form libraries
+ multiple icon families
```

---

# 30. Dependency Policy

A dependency should be added only when it provides clear value over a small internal implementation.

Evaluate:

- maintenance health,
- accessibility,
- bundle cost,
- server/client compatibility,
- TypeScript quality,
- license,
- ability to theme,
- lock-in risk.

Do not adopt a full visual component kit that prevents implementation of PRD-10 through PRD-13 fidelity.

---

# 31. Security Architecture Baseline

Until PRD-16 expands this domain, baseline requirements include:

- secure session cookies,
- server-side authorization,
- password hashing through auth framework-supported secure method,
- CSRF-safe patterns,
- output escaping/XSS awareness,
- input validation,
- parameterized SQL through ORM/query layer,
- rate limiting for authentication-sensitive endpoints,
- secret management,
- no sensitive data in logs,
- safe error responses.

---

# 32. Repository & Development Workflow

Recommended baseline branches/workflow:

- `main` remains deployable/stable,
- feature/fix branches for implementation work,
- PR or controlled commit workflow,
- migrations committed with code changes,
- tests/lint/typecheck/build required before merge/release.

Exact CI/CD policy is defined in PRD-19 and PRD-20.

---

# 33. Recommended Quality Commands

Initial project setup should provide standard scripts conceptually equivalent to:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm test:visual
pnpm build
```

Optional:

```text
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Naming can change, but one-command quality gates must exist.

---

# 34. Architecture Decisions Explicitly Rejected for MVP

Do **not** start with:

- microservices,
- GraphQL solely for trendiness,
- Kubernetes requirement,
- event sourcing as the only data model,
- Redis as mandatory source of truth,
- realtime WebSocket dependency for basic correctness,
- client-only SPA architecture,
- Firebase-style document database for canonical payroll/schedule data,
- business logic embedded in UI components,
- serverless edge runtime for every domain operation regardless of database needs,
- multiple duplicate UI libraries.

These may be reconsidered only with an actual requirement.

---

# 35. Future Extension Paths

Architecture must remain compatible with future additions such as:

- SSO / enterprise identity,
- 2FA/passkey,
- notification workers,
- WhatsApp/email integration,
- server-sent realtime events,
- dedicated reporting worker,
- object storage for generated exports,
- read replica for heavy reporting,
- Redis for bounded cache/queue needs,
- mobile PWA enhancements,
- external API consumers.

None are required to launch core scheduling/payroll MVP.

---

# 36. Technical Architecture Business Rules

## ARCH-001
NOCScheduler must start as a modular monolith unless a documented requirement justifies service extraction.

## ARCH-002
Business-critical logic must execute server-side.

## ARCH-003
PostgreSQL is the canonical persistent database.

## ARCH-004
Database migrations must be version-controlled.

## ARCH-005
Production schema changes must not rely on unreviewed direct schema push.

## ARCH-006
Authentication and authorization must remain separate concerns.

## ARCH-007
Client-supplied permission claims must never be trusted.

## ARCH-008
All external/untrusted payloads must receive runtime validation.

## ARCH-009
Money must not use binary floating-point arithmetic.

## ARCH-010
Business dates must use explicit operational timezone semantics.

## ARCH-011
Cross-midnight shift logic must use shared central date/time utilities.

## ARCH-012
High-risk writes must use explicit transaction boundaries.

## ARCH-013
Stale concurrent writes must not silently overwrite current state.

## ARCH-014
Audit evidence for critical actions must be durable.

## ARCH-015
Server Components must not bypass authorization/service rules.

## ARCH-016
Route Handlers must not contain duplicated domain logic.

## ARCH-017
Server Actions, if used, must delegate to shared application/domain services.

## ARCH-018
TanStack Query cache must not become source of truth.

## ARCH-019
Critical state changes must explicitly invalidate affected read models.

## ARCH-020
Realtime connectivity must not be required for scheduling/payroll correctness.

## ARCH-021
Design tokens must be implemented centrally.

## ARCH-022
Light/Dark variants must share component structure.

## ARCH-023
Third-party UI primitives must remain fully themeable by NOCScheduler.

## ARCH-024
Heavy client-only dependencies must be code-split where feasible.

## ARCH-025
Page-level code must not introduce ad-hoc duplicated shared components.

## ARCH-026
Unit tests must cover pure business rules independently of React.

## ARCH-027
Database invariants must have integration tests against a real relational test database.

## ARCH-028
Critical user journeys must have Playwright E2E coverage.

## ARCH-029
Critical visual pages must support screenshot regression testing.

## ARCH-030
Environment configuration must be centrally validated.

## ARCH-031
Secrets must never enter client bundles.

## ARCH-032
Application logs and audit trail must remain separate systems/concepts.

## ARCH-033
Sensitive credentials/tokens must not be logged.

## ARCH-034
Dependency versions must be lockfile-controlled.

## ARCH-035
Multiple libraries solving the same foundation concern require explicit justification.

## ARCH-036
Schedule publication must be transactionally consistent.

## ARCH-037
Shift swap must be atomic.

## ARCH-038
Payroll calculate/finalize/lock operations must preserve revision integrity.

## ARCH-039
Locked payroll must not be recomputed as a side effect of cache/job processing.

## ARCH-040
Historical records must never depend only on current mutable configuration.

## ARCH-041
Derived dashboard data may be cached but must be rebuildable from canonical records.

## ARCH-042
Client optimistic updates must have rollback/reconciliation behavior on server rejection.

## ARCH-043
Authorization checks must occur close to server mutation/read boundaries and may be repeated defensively in services for high-risk operations.

## ARCH-044
Database access from client-side code is forbidden.

## ARCH-045
ORM schema must reflect PRD-08 relational boundaries rather than flattening domains into generic JSON records.

## ARCH-046
Accessibility behavior of complex primitives must not be sacrificed for custom styling.

## ARCH-047
Motion must respect reduced-motion preference.

## ARCH-048
Mobile and desktop must consume the same canonical domain/API semantics.

## ARCH-049
API error responses must be structured and must not expose internal stack traces.

## ARCH-050
Architecture changes that violate a previous PRD business invariant require explicit PRD revision rather than silent implementation drift.

---

# 37. Architecture Acceptance Checklist

Before feature development begins, project setup should demonstrate:

- [ ] Next.js App Router application boots successfully.
- [ ] TypeScript strict mode enabled.
- [ ] PostgreSQL connectivity established.
- [ ] Drizzle schema and migration flow working.
- [ ] Better Auth session flow working.
- [ ] Authorization service skeleton exists.
- [ ] Zod environment validation exists.
- [ ] Semantic Light/Dark theme token system exists.
- [ ] Shared UI primitive layer exists.
- [ ] TanStack Query provider/conventions established for interactive server state.
- [ ] Central time module exists.
- [ ] Central money helpers exist.
- [ ] Audit/correlation conventions defined.
- [ ] Vitest executes domain tests.
- [ ] Playwright executes at least one desktop and one mobile browser flow.
- [ ] Lint/typecheck/test/build scripts exist.
- [ ] Database migrations are committed rather than generated ad hoc in production.
- [ ] No business-critical code depends solely on client validation.
- [ ] No raw database secret is exposed client-side.
- [ ] Folder/domain boundaries are understandable without tribal knowledge.

---

# 38. Technical Definition of Done

A technical feature is not complete until:

1. it follows domain boundaries,
2. input is runtime-validated,
3. authorization is enforced server-side,
4. business rules reuse canonical services,
5. transactions are used where required,
6. audit evidence is created where required,
7. optimistic concurrency is respected where relevant,
8. cache invalidation is correct,
9. errors are structured,
10. TypeScript passes without unsafe shortcuts becoming normal practice,
11. unit/integration tests cover relevant logic,
12. E2E covers critical user behavior,
13. Light/Dark component implementation uses shared tokens,
14. desktop/mobile semantics remain consistent,
15. no sensitive information leaks to logs/client,
16. migration implications are reviewed,
17. performance impact is reasonable,
18. historical data integrity is preserved,
19. no duplicated implementation bypasses shared service rules,
20. implementation does not contradict PRD-01 through PRD-13.

---

# 39. Recommended Implementation Order After Documentation Phase

When coding begins, architecture should be established in this order:

```text
1. Project bootstrap
2. TypeScript / lint / formatting / quality scripts
3. Design-token foundation
4. Database + Drizzle migration foundation
5. Authentication
6. Authorization skeleton
7. Shared validation / time / money libraries
8. Audit infrastructure
9. Core employee + shift configuration domain
10. Scheduling domain
11. Exception domain
12. Payroll domain
13. Application shell + navigation
14. Feature UI implementation
15. Reporting / notification extensions
16. Full visual polish and regression gates
```

This sequence avoids building beautiful screens on top of unstable domain infrastructure while still establishing the visual foundation early enough to prevent style drift.

---

# 40. Final Technical Direction

NOCScheduler should be engineered as:

> **A TypeScript-first, Next.js modular monolith backed by PostgreSQL, with explicit domain services, strong transactional integrity, Drizzle-managed relational data, Better Auth identity/session handling, capability-based authorization, Zod runtime validation, TanStack Query for interactive server state, semantic-token-driven Tailwind styling, premium accessible UI primitives, controlled Motion animations, and Vitest + Playwright quality gates.**

The architecture must optimize for:

```text
Correctness
+ Historical Trust
+ Developer Clarity
+ UI Fidelity
+ Mobile/Desktop Parity
+ Operational Simplicity
+ Testability
+ Controlled Extensibility
```

The system should be sophisticated where the business requires sophistication—**scheduling, payroll, audit, permission, historical data, and UI quality**—while remaining intentionally simple in infrastructure until scale proves otherwise.
