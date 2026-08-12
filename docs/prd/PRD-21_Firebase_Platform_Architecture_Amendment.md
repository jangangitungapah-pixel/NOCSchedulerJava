# PRD-21 — Firebase Platform Architecture Amendment

> **Product:** NOCScheduler  
> **Document Type:** Canonical Architecture Amendment  
> **Document ID:** PRD-21  
> **Status:** Approved Architecture Rebaseline  
> **Decision Date:** 2026-08-13  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR

---

# 1. Purpose and precedence

NOCScheduler is a small-scope internal application whose owner does not operate a dedicated application/database server. The platform is therefore rebaselined to a fully managed Firebase architecture before WP-F05 begins.

This document is a **canonical amendment**. Where platform-specific statements in PRD-08, PRD-14, PRD-15, PRD-16, PRD-19, PRD-20, or the master workplan conflict with this amendment, **PRD-21 wins**. Product behavior, scheduling rules, payroll rules, roles, audit expectations, UI/UX, historical correctness, and other non-platform requirements from PRD-01 through PRD-20 remain in force.

The abandoned PostgreSQL/Drizzle WP-F04 implementation is historical engineering work only and is not a production dependency.

---

# 2. Approved platform

The approved platform is:

```text
Browser
  → Next.js application
  → Firebase App Hosting managed runtime
  → Next.js server/API/domain services
  → Firebase Admin SDK
  → Cloud Firestore

Browser authentication
  → Firebase Authentication

Local development / CI
  → Firebase Local Emulator Suite
     ├─ Authentication emulator
     └─ Cloud Firestore emulator
```

Production deployment uses **Firebase App Hosting** for the Next.js application. Classic Firebase framework-aware Hosting is not the target because the application is dynamic/SSR-capable and App Hosting is the Firebase-native Next.js path.

---

# 3. Platform services

## 3.1 Firebase App Hosting

App Hosting is the production web/runtime platform.

Requirements:

- GitHub-backed deployment from the repository,
- Next.js runtime managed by Firebase/Google Cloud,
- CDN and managed HTTPS,
- environment configuration through App Hosting settings / `apphosting.yaml`,
- no self-managed VM, Docker host, Nginx, or application process supervisor,
- runtime secrets must use managed environment/secret facilities rather than committed credentials.

The small internal workload should start with cost-conscious autoscaling and zero minimum instances unless later operational evidence requires otherwise.

## 3.2 Firebase Authentication

Firebase Authentication replaces Better Auth.

F05 will define the exact sign-in providers and session strategy, but the architectural baseline is:

- Firebase Auth is the identity provider,
- Firebase UID is the stable authentication identity,
- application employee/profile/access data remains in Firestore,
- disabling an account must not delete employee or historical business records,
- server-side authorization remains mandatory even when client UI hides unavailable actions.

## 3.3 Cloud Firestore

Cloud Firestore replaces PostgreSQL/Drizzle as the canonical persistence layer.

The application does **not** treat Firestore as an unstructured JSON dump. Domain documents have explicit typed contracts, stable IDs, version fields, effective dates, snapshots, and indexes.

Authoritative high-risk mutations are executed by Next.js server/domain services through Firebase Admin SDK. Client-side Firestore access is fail-closed by default and is only opened deliberately by F05 security rules for read paths that genuinely benefit from direct client access.

## 3.4 Firebase Admin SDK

Firebase Admin SDK is the privileged server adapter used by App Hosting runtime and local emulator tests.

Requirements:

- use Application Default Credentials in Google-managed production runtime,
- never commit service-account JSON,
- server code is responsible for authorization and business invariants,
- Admin SDK bypasses Firestore Security Rules, therefore service-layer authorization and IAM are part of the security boundary.

## 3.5 Local Emulator Suite

Development and CI use Firebase Local Emulator Suite rather than Docker/PostgreSQL.

The default local project is `demo-nocscheduler`.

A `demo-*` project is intentionally used so accidental calls to a non-emulated product cannot mutate a live Firebase project or create billing usage.

Baseline emulators:

- Cloud Firestore: port 8080,
- Authentication: port 9099,
- Emulator UI: port 4000.

Java 21+ is the local/CI baseline for emulator compatibility.

---

# 4. Firestore data architecture

## 4.1 Canonical collections

Baseline top-level collections:

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

Top-level collections are preferred for the first implementation because the product needs cross-employee, cross-period, reporting, audit, and administrative queries. Subcollections may be introduced only when a bounded aggregate clearly benefits from them and query/index implications are reviewed.

## 4.2 Stable IDs and references

Documents use stable document IDs. Relationships are represented using explicit ID fields such as `employeeId`, `schedulePeriodId`, `scheduleVersionId`, `shiftTypeId`, and `payrollPeriodId`.

Firestore document references may be used internally where useful, but API/domain contracts should not require the browser to understand Firestore reference objects.

## 4.3 Historical data

Historical correctness remains non-negotiable even though relational foreign keys are no longer available.

The replacement mechanisms are:

- immutable/append-oriented historical documents,
- explicit version documents,
- effective date ranges,
- snapshot values for payroll/published history,
- server transactions,
- optimistic `rowVersion`,
- deterministic document IDs where uniqueness is required,
- `DocumentReference.create()`-style create-only writes for immutable facts,
- application invariant checks inside server transactions,
- audit events for high-risk mutation.

The absence of SQL foreign keys is **not** permission to destructively overwrite historical state.

## 4.4 Effective dating

Effective-dated entities keep the existing half-open interval semantics:

```text
[effectiveFrom, effectiveTo)
```

Examples:

- salary versions,
- shift definition versions,
- shift incentive versions,
- role/scope assignments where historical access changes must be retained.

Overlap checks are performed by the server/domain service, preferably inside the same transaction as the create/update operation when Firestore transaction semantics permit the required query/read set.

## 4.5 Concurrency

Documents subject to concurrent mutation include a positive integer `rowVersion`.

Mutation commands carry an expected version. Server transactions must reject stale versions and increment the version atomically on success.

High-risk commands such as schedule publish, request approval, payroll calculation/finalize/lock, and access changes additionally use idempotency/correlation records where required by PRD-15.

## 4.6 Money and business date

Existing domain rules remain unchanged:

- IDR is integer rupiah, never binary floating-point money,
- business dates use ISO `YYYY-MM-DD`,
- operational timezone is `Asia/Jakarta`,
- event/audit timestamps are absolute timestamps.

---

# 5. Security model

## 5.1 Server-authoritative mutation

Critical business mutation must flow through server code:

```text
UI
→ Next.js server/API entry
→ Firebase Auth token/session verification
→ capability + scope authorization
→ validation
→ domain command
→ Firestore transaction/batch
→ audit / notification policy
```

The browser must never be trusted to enforce payroll, scheduling, role, or historical integrity.

## 5.2 Firestore Security Rules

F04R starts **fail closed**: direct browser reads and writes are denied.

F05 may open selected authenticated read paths when there is a product/performance reason, but:

- rules must be covered by Emulator Suite tests,
- rules are not a substitute for server authorization,
- client writes to high-risk business collections remain prohibited unless explicitly proven safe,
- Admin SDK access is protected through server authorization + Google Cloud IAM because Admin SDK bypasses Firestore Rules.

## 5.3 Secrets

Never commit:

- Firebase service-account private keys,
- private credential JSON,
- session secrets,
- third-party secret API credentials.

Firebase web configuration/API keys are public application configuration, but production values are still managed through App Hosting environment configuration for consistency.

## 5.4 Audit

`auditEvents` is append-oriented. Normal user flows cannot edit/delete historical audit events. Server audit creation should use create-only semantics and correlation IDs for multi-document operations.

---

# 6. Transaction and uniqueness strategy

Firestore has transactions and atomic batched writes but does not provide SQL unique constraints/foreign keys. The application therefore uses explicit strategies per invariant.

Examples:

- employee code/email uniqueness: deterministic reservation/index document or transaction-checked canonical key,
- one primary work state per employee/work date/schedule version: deterministic assignment document key,
- one payroll record per employee/period: deterministic payroll record key,
- one published schedule head per period: transaction updates canonical period/head document while appending immutable version document,
- effective-range overlap: query + transaction/domain guard,
- historical record immutability: create-only document operation plus no normal update/delete command,
- payroll locked state: transaction checks lifecycle before every mutation.

Every critical invariant must have deterministic regression coverage before its owning phase is complete.

---

# 7. Query and index strategy

Firestore composite indexes are version-controlled in `firestore.indexes.json`.

Indexes are added from concrete product queries rather than speculative indexing. Baseline index families cover:

- schedule assignment by period/employee/work date,
- request by employee/status/time,
- payroll record by period/status/employee,
- notification by user/read/time,
- audit by entity/time.

Reporting phases may introduce denormalized read projections when necessary, but those projections remain rebuildable and cannot become an alternate payroll/schedule source of truth.

---

# 8. Development and testing

F04R acceptance requires:

- Firebase JS SDK and Admin SDK pinned,
- Firebase project configuration files committed,
- Emulator Suite configuration committed,
- deterministic emulator seed,
- Firestore rules tests,
- Admin SDK contract test,
- optimistic concurrency helper test,
- immutable create helper test,
- existing UI/unit/E2E regression retained,
- no Docker/PostgreSQL prerequisite.

The repository uses a demo Firebase project locally and does not require a real Firebase project until production integration/deployment configuration is performed.

---

# 9. Deployment model

Production target:

```text
GitHub main
→ Firebase App Hosting build/release
→ managed Next.js runtime on Firebase/Google Cloud
→ Firebase Authentication
→ Cloud Firestore
```

App Hosting requires a Firebase project and may require the Blaze pay-as-you-go plan. This is accepted for the managed-server architecture decision; cost controls should use conservative runtime scaling and Firebase/Google Cloud budget alerts during deployment hardening.

Backup/restore and operational requirements in PRD-20 remain required, but they must be implemented using Firebase/Google Cloud capabilities appropriate to Firestore/App Hosting instead of PostgreSQL PITR/migration procedures.

---

# 10. Workplan impact

The old WP-F04 PostgreSQL phase is superseded by **WP-F04R — Firebase Platform & Domain Foundation**.

WP-F05 changes from Better Auth/PostgreSQL-backed identity to:

- Firebase Authentication,
- Firebase session/token verification,
- Firestore-backed employee/access/settings data,
- server-side capability authorization,
- Firestore Security Rules tests,
- account disable/session revocation strategy,
- last-administrator protection,
- effective-dated settings/compensation stored in Firestore.

Later phases retain their product goals but replace SQL/migration terminology with Firestore transaction/index/rules/data-contract terminology.

---

# 11. Explicitly removed architecture

The following are no longer production requirements:

- PostgreSQL,
- Drizzle ORM,
- Drizzle Kit migrations,
- Docker as a development prerequisite,
- self-hosted application server,
- managed PostgreSQL staging/production,
- Better Auth,
- SQL foreign-key/unique/exclusion constraints as the persistence enforcement mechanism.

Their business invariants remain required and are reimplemented through Firebase-aware domain patterns described above.

---

# 12. Acceptance

PRD-21 is accepted when the repository has one coherent Firebase architecture, PostgreSQL/Drizzle runtime artifacts are removed, Firebase emulator tests are green, existing product regressions remain green, and WP-F05 can begin without depending on Docker or a self-managed server.
