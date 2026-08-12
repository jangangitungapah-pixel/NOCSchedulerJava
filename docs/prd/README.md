# NOCScheduler PRD Index & Canonical Reading Order

> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Last Architecture Rebaseline:** 2026-08-13  
> **Highest-Precedence Platform Document:** PRD-22

---

## Critical instruction for implementation agents

Before generating architecture, scaffolding, dependencies, deployment configuration, API runtime, authentication integration, database access, tests, or frontend code, read:

1. the product/business PRD relevant to the feature;
2. **PRD-22 — TypeScript, TSX, Node.js, Vite, Tailwind & Firebase Managed Platform Rebaseline**;
3. any other referenced PRD for the feature.

Do **not** infer the active platform from older Next.js/PostgreSQL wording that may remain as historical context in legacy documents.

When platform statements conflict, **PRD-22 wins**.

---

# Canonical platform in one screen

```text
Frontend
  TypeScript / TSX
  React
  Vite
  React Router
  Tailwind CSS
  TanStack Query / Table / Virtual
  React Hook Form + Zod
  accessible headless UI primitives
  Motion / dnd-kit / modern UX utilities where justified

Backend
  TypeScript
  Node.js
  Express HTTP API
  /api/v1
  Firebase managed Node runtime

Managed platform
  Firebase Hosting
  Firebase Authentication
  Firebase Admin SDK
  Cloud Firestore
  Firebase Local Emulator Suite

Quality
  Vitest
  Testing Library
  MSW
  Playwright
  axe-based accessibility checks
  ESLint / formatting / dead-code and bundle checks
```

The application is **not a Java/JVM application** despite the repository name `NOCSchedulerJava`. “Java” in the repository name must not be interpreted as a requirement for Java language, Spring Boot, Maven, or Gradle.

The active application source language is **TypeScript**. React source uses **`.tsx`** and non-React source uses **`.ts`**.

---

# PRD status matrix

| Document | Current role | Platform impact |
|---|---|---|
| PRD-01 Product Vision, Scope & Requirements | Canonical product truth | Retained |
| PRD-02 Feature Specification | Canonical feature truth | Retained |
| PRD-03 Scheduling & Shift Business Logic | Canonical scheduling rules | Retained; implement in TypeScript domain/server modules |
| PRD-04 Payroll, Salary & Incentive Logic | Canonical payroll rules | Retained; server-authoritative TypeScript implementation |
| PRD-05 Attendance, Leave, Overtime & Exceptions | Canonical workforce exception rules | Retained |
| PRD-06 IA, Navigation & Page Structure | Canonical route/IA semantics | Retained; implement with React Router |
| PRD-07 Roles, Permissions & Transparency | Canonical authorization policy | Retained; enforce in Node API |
| PRD-08 Data Model & Database Architecture | Canonical domain-data requirements | SQL/relational implementation assumptions superseded by PRD-22 |
| PRD-09 Audit Trail & Historical Data | Canonical audit/history rules | Retained |
| PRD-10 UI/UX, User Flow & Interaction Design | Canonical UX truth | Fully retained |
| PRD-11 Design System & Component Specification | Canonical visual/component truth | Fully retained; implemented with Tailwind semantic tokens |
| PRD-12 Responsive & Mobile Experience | Canonical responsive truth | Fully retained |
| PRD-13 UI Polish & Visual Quality Standard | Canonical visual quality gate | Fully retained |
| PRD-14 Technical Architecture & Technology Stack | Legacy architecture reference | Framework/runtime baseline superseded by PRD-22 |
| PRD-15 API & Backend Contract | Canonical API behavior | Next/Route Handler implementation wording superseded; use Node/Express |
| PRD-16 Authentication, Security & Data Integrity | Canonical security requirements | Better Auth/Next.js implementation wording superseded; use Firebase Auth + Node verification |
| PRD-17 Reporting, Analytics & Export | Canonical reporting requirements | Retained |
| PRD-18 Notifications & Operational Awareness | Canonical notification requirements | Retained |
| PRD-19 QA, Testing & Acceptance Criteria | Canonical QA requirements | Tooling/runtime specifics superseded by PRD-22 |
| PRD-20 Deployment, Operations, Backup & Observability | Canonical operational objectives | Next.js/PostgreSQL topology superseded by Firebase Hosting + managed Node + Firestore |
| PRD-21 Firebase Platform Architecture Amendment | Historical amendment | Superseded by PRD-22 |
| PRD-22 TypeScript, TSX, Node.js, Vite, Tailwind & Firebase Platform Rebaseline | **Highest-precedence platform source of truth** | Active |

---

# Reading order by implementation area

## Product or feature discovery

```text
PRD-01
→ PRD-02
→ relevant business PRD
→ PRD-22
```

## Scheduling

```text
PRD-03
→ PRD-05 when exceptions are involved
→ PRD-07 for permission
→ PRD-08/09 for history/data semantics
→ PRD-15 for API behavior
→ PRD-22 for implementation platform
```

## Payroll

```text
PRD-04
→ PRD-05 when overtime/exception affects payroll
→ PRD-07
→ PRD-08/09
→ PRD-15/16
→ PRD-22
```

## Frontend/UI

```text
PRD-06
→ PRD-10
→ PRD-11
→ PRD-12
→ PRD-13
→ PRD-22
```

## Backend/API/security

```text
PRD-07
→ PRD-08
→ PRD-09
→ PRD-15
→ PRD-16
→ PRD-22
```

## Reporting/notifications

```text
PRD-17 or PRD-18
→ relevant business/data PRD
→ PRD-15
→ PRD-22
```

## QA/release/deployment

```text
PRD-19
→ PRD-20
→ PRD-22
```

---

# Framework and platform prohibitions

Unless a future approved PRD explicitly changes the decision, implementation must not reintroduce these as baseline dependencies:

- Next.js;
- Next.js App Router;
- Server Components;
- Server Actions;
- Next.js Route Handlers;
- plain JavaScript/JSX as the default first-party application source language;
- PostgreSQL;
- Drizzle ORM/Drizzle Kit;
- Prisma;
- Better Auth;
- Docker as a normal development prerequisite;
- self-managed production VM/server;
- Redux as a default global server-state store.

---

# Business rules must survive framework changes

A framework migration never authorizes changes to core business invariants.

Examples that remain mandatory:

- one employee / one primary work state per work date;
- cross-midnight shift correctness;
- published schedule rules;
- effective-dated salary/incentive configuration;
- deterministic payroll;
- historical snapshot integrity;
- payroll locking;
- append-oriented audit evidence;
- optimistic concurrency;
- idempotency for dangerous commands;
- server-side authorization;
- internal transparency policy;
- Light/Dark theme parity;
- first-class desktop/mobile UX;
- strict visual alignment and polish gates.

---

# Dependency rule

Dependencies are allowed when they reduce real implementation risk or improve maintainability, performance, accessibility, or UX.

Do not install libraries merely to make the dependency list look modern.

Every dependency must have a clear responsibility, remain replaceable behind application-owned abstractions where appropriate, and must not create a second source of business truth.

For the detailed approved dependency direction, see **PRD-22**.