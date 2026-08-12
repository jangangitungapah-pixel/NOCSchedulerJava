# PRD-15 — API & Backend Contract

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — API & Backend Contract  
> **Document ID:** PRD-15  
> **Status:** Draft — API Contract Source of Truth  
> **Depends On:** PRD-01 through PRD-14  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **canonical HTTP API contract, endpoint semantics, request/response shape, validation behavior, error taxonomy, pagination, filtering, sorting, idempotency, optimistic concurrency, mutation safety, transaction boundary, authorization contract, versioning, dan observability metadata** untuk backend NOCScheduler.

PRD-15 menjadi source of truth untuk menjawab:

> **“Bagaimana frontend dan client lain berkomunikasi dengan backend secara konsisten, aman, dapat diuji, dan sulit disalahgunakan tanpa menduplikasi business logic?”**

Dokumen ini mengimplementasikan arsitektur dari PRD-14:

```text
HTTP / Server Entry
  ↓
Shape Validation
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
Audit / Outbox when required
```

Route Handler tidak boleh menjadi tempat business logic scheduling/payroll ditulis secara langsung.

---

# 2. API Contract Principles

## API-P01 — Server Is Authoritative

Client dapat melakukan optimistic UI dan pre-validation, tetapi server adalah final authority untuk:

- authorization,
- business validation,
- schedule publication,
- request approval,
- replacement/swap,
- compensation mutation,
- payroll calculation,
- payroll finalization,
- payroll lock/unlock,
- historical correction.

Client payload tidak boleh menentukan fakta yang sebenarnya harus dihitung atau diverifikasi server.

---

## API-P02 — Explicit Commands for High-Risk Operations

High-risk business action tidak boleh disamarkan sebagai generic PATCH.

Gunakan explicit command endpoint seperti:

```text
POST /api/v1/schedule-periods/:id/validate
POST /api/v1/schedule-periods/:id/publish
POST /api/v1/requests/:id/approve
POST /api/v1/payroll-periods/:id/calculate
POST /api/v1/payroll-periods/:id/finalize
POST /api/v1/payroll-periods/:id/lock
POST /api/v1/payroll-periods/:id/unlock
```

Tujuannya:

- semantics jelas,
- authorization mudah dipetakan,
- audit event mudah diberi nama,
- idempotency dapat diterapkan,
- transaction boundary jelas.

---

## API-P03 — Resource CRUD Only Where CRUD Is Honest

CRUD digunakan untuk resource yang memang bersifat CRUD, seperti:

- employee profile,
- holiday,
- notification preference,
- draft assignment,
- draft settings tertentu.

Business state transition seperti `approve`, `publish`, `finalize`, atau `lock` tidak boleh disederhanakan menjadi generic status PATCH bila action tersebut memiliki rule bisnis sendiri.

---

## API-P04 — Runtime Validation Is Mandatory

Seluruh untrusted input harus divalidasi dengan canonical runtime schema.

Baseline implementation:

- Zod 4,
- schema reusable antara form/client bila aman,
- server tetap menjalankan validation ulang.

Validation TypeScript compile-time tidak cukup.

---

## API-P05 — Authorization Is Checked at Every Protected Entry

Tidak ada endpoint protected yang hanya mengandalkan menu/button hidden di UI.

Setiap request harus menyelesaikan:

1. actor/session,
2. permission/capability,
3. resource scope,
4. business state.

Backend default adalah **deny by default**.

---

## API-P06 — High-Risk Mutations Are Transactional

Action yang secara bisnis harus atomic wajib berada dalam database transaction atau equivalent strongly consistent boundary.

Minimal:

- publish schedule,
- shift swap,
- replacement approval yang mengubah effective coverage,
- salary/incentive effective-version mutation,
- payroll calculate/recalculate,
- payroll finalize,
- payroll lock/unlock,
- role/permission mutation,
- audit evidence untuk high-risk action.

Successful HTTP response tidak boleh mewakili half-applied business operation.

---

## API-P07 — Idempotency Where Duplicate Submission Is Dangerous

Command yang bisa menghasilkan duplicate financial/state effect harus mendukung idempotency.

Contoh:

- publish,
- approve request,
- create swap/replacement,
- calculate payroll,
- finalize,
- lock,
- unlock,
- create payroll adjustment,
- export generation bila asynchronous.

Repeated request dengan key dan payload yang sama harus mengembalikan hasil bisnis yang sama tanpa menggandakan effect.

---

## API-P08 — Concurrency Is Explicit

Resource mutable yang berisiko concurrent edit harus memiliki version/revision token.

Client tidak boleh silently overwrite state yang telah berubah setelah dibaca.

Baseline strategy:

- response mengandung `version`,
- mutation mengirim `expectedVersion`,
- mismatch menghasilkan concurrency error.

HTTP `If-Match`/ETag dapat digunakan kemudian, tetapi application-level `expectedVersion` tetap menjadi canonical business contract pada baseline.

---

## API-P09 — Validation Preview and Mutation Are Separate

Workflow kompleks harus dapat melakukan validation tanpa mutation.

Contoh:

```text
POST /schedule-periods/:id/validate
```

menghasilkan:

- blocking errors,
- warnings,
- info,
- affected employees/dates,
- coverage issue.

Endpoint `publish` tetap menjalankan validation ulang dalam transaction. Preview tidak menjadi jaminan state tidak berubah sesudahnya.

---

## API-P10 — Errors Must Be Machine-Readable and Human-Useful

Frontend tidak boleh mengandalkan parsing string error.

Setiap error memiliki stable `code` dan optional structured `details`.

Human-readable message tetap tersedia untuk UX/fallback.

---

# 3. Base URL & Versioning

## 3.1 Canonical API Prefix

NOCScheduler-owned application API:

```text
/api/v1
```

Contoh:

```text
GET /api/v1/employees
GET /api/v1/schedule-periods/2026-08
POST /api/v1/payroll-periods/2026-08/calculate
```

Authentication framework routes dapat menggunakan namespace sendiri, misalnya:

```text
/api/auth/*
```

Route auth provider tidak menjadi bagian `/api/v1` kecuali adapter implementation membutuhkan facade khusus.

---

## 3.2 Versioning Strategy

`v1` adalah compatibility boundary HTTP, bukan version setiap entity.

Breaking API change membutuhkan:

- version baru, atau
- controlled migration dengan backward compatibility.

Non-breaking addition seperti field optional baru diperbolehkan dalam `v1`.

Client harus mengabaikan unknown response field yang tidak relevan.

---

# 4. HTTP Semantics

Baseline method usage:

| Method | Purpose |
|---|---|
| `GET` | read/query |
| `POST` | create resource atau execute explicit command |
| `PATCH` | partial mutable resource update |
| `PUT` | full replacement hanya jika benar-benar diperlukan |
| `DELETE` | remove draft/orphan atau archive action yang semantics-nya aman |

Untuk historical business record, prefer archive/deactivate command daripada destructive DELETE.

---

# 5. Common Request Contract

## 5.1 Content Type

Default:

```text
Content-Type: application/json
Accept: application/json
```

File export/download dapat menggunakan content type sesuai format.

---

## 5.2 Request Correlation

Client boleh mengirim:

```text
X-Request-Id
```

Jika tidak tersedia, server menghasilkan request ID.

Server mengembalikan:

```text
X-Request-Id: <id>
```

Request ID digunakan untuk:

- logs,
- troubleshooting,
- error correlation.

Business operation multi-step tetap dapat memiliki `correlationId` terpisah pada audit layer.

---

## 5.3 Idempotency Header

Untuk command yang mendukung idempotency:

```text
Idempotency-Key: <opaque-unique-key>
```

Rules:

- key scoped ke actor + endpoint/action,
- key memiliki retention window yang cukup,
- same key + same payload → replay result,
- same key + different payload → `IDEMPOTENCY_KEY_REUSED` error,
- key tidak boleh menjadi authorization bypass.

Client direkomendasikan membuat UUID/ULID random untuk setiap deliberate command submission.

---

## 5.4 Expected Version

Mutable command body dapat mengandung:

```json
{
  "expectedVersion": 12
}
```

Jika current version bukan `12`, server mengembalikan conflict/precondition response dan current version bila aman.

Client kemudian harus refresh/reconcile state; tidak boleh auto-overwrite tanpa awareness.

---

# 6. Common Success Response

## 6.1 Single Resource

```json
{
  "data": {
    "id": "...",
    "version": 4
  }
}
```

---

## 6.2 List Resource

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

`page` hanya muncul bila pagination relevan.

---

## 6.3 Command Result

Command dapat mengembalikan resource/business result:

```json
{
  "data": {
    "status": "PUBLISHED",
    "version": 8,
    "publishedAt": "2026-08-12T12:30:00Z"
  }
}
```

Jangan mengembalikan hanya `{ "success": true }` untuk action yang menghasilkan state baru yang berguna bagi client.

---

# 7. Error Contract

## 7.1 Canonical Shape

```json
{
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Schedule contains blocking conflicts.",
    "requestId": "req_...",
    "details": []
  }
}
```

Optional fields:

```text
field
path
resourceId
currentVersion
expectedVersion
retryable
validation
```

---

## 7.2 HTTP Status Mapping

| HTTP | Meaning |
|---:|---|
| `400` | malformed request / invalid transport semantics |
| `401` | unauthenticated / invalid session |
| `403` | authenticated but not authorized |
| `404` | resource not found or intentionally concealed |
| `409` | state conflict / duplicate / concurrency conflict |
| `412` | precondition/version mismatch when precondition semantics are used |
| `422` | structurally valid payload but business/field validation failed |
| `429` | rate limited |
| `500` | unexpected server failure |
| `503` | required dependency temporarily unavailable |

Do not return `200` with embedded error objects for failed business commands.

---

## 7.3 Stable Error Codes

Baseline global codes:

```text
INVALID_REQUEST
VALIDATION_FAILED
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
STALE_VERSION
IDEMPOTENCY_KEY_REUSED
RATE_LIMITED
INTERNAL_ERROR
SERVICE_UNAVAILABLE
```

Domain codes may include:

```text
SCHEDULE_BLOCKING_CONFLICT
SCHEDULE_PERIOD_ALREADY_PUBLISHED
SCHEDULE_ASSIGNMENT_OVERLAP
SCHEDULE_INCOMPLETE
REQUEST_ALREADY_RESOLVED
SELF_APPROVAL_NOT_ALLOWED
REPLACEMENT_INVALID
SHIFT_SWAP_CONFLICT
COMPENSATION_VERSION_OVERLAP
PAYROLL_MISSING_BASE_SALARY
PAYROLL_MISSING_INCENTIVE_RATE
PAYROLL_DIRTY
PAYROLL_ALREADY_LOCKED
PAYROLL_LOCKED
PAYROLL_UNLOCK_REASON_REQUIRED
LAST_ADMIN_GUARD
```

Code names harus stabil dan dapat digunakan test/client branching.

---

# 8. Validation Contract

## 8.1 Field Validation Detail

Contoh:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid.",
    "requestId": "req_123",
    "details": [
      {
        "path": "effectiveFrom",
        "code": "INVALID_DATE",
        "message": "Effective date is required."
      }
    ]
  }
}
```

---

## 8.2 Business Validation Finding

Schedule/payroll validation yang bersifat preview menggunakan object:

```json
{
  "severity": "ERROR",
  "code": "MINIMUM_REST_VIOLATION",
  "message": "Rest period is below configured minimum.",
  "employeeId": "emp_...",
  "workDate": "2026-08-14",
  "resourceId": "assignment_...",
  "overrideable": false,
  "context": {}
}
```

Allowed severity:

```text
ERROR
WARNING
INFO
```

`ERROR` berarti blocking.

`WARNING` dapat memerlukan explicit override/reason sesuai permission.

---

## 8.3 Mutation Revalidates

Client tidak boleh mengirim hasil validation preview sebagai bukti valid.

Server command selalu load source terbaru dan menjalankan critical validation ulang.

---

# 9. Pagination

## 9.1 Cursor Pagination Default

Untuk potentially growing collections gunakan cursor pagination:

```text
?limit=50&cursor=<opaque>
```

Default `limit`: 25–50 sesuai endpoint.

Maximum baseline: `100`.

Cursor harus opaque bagi client.

Cocok untuk:

- activity history,
- notifications,
- large employee lists,
- requests,
- audit events.

---

## 9.2 Period-Based Resources

Schedule/payroll yang naturally period-scoped dapat menggunakan explicit period query tanpa cursor jika dataset bounded.

Contoh:

```text
GET /schedule-periods/2026-08
GET /payroll-periods/2026-08/records
```

Jangan menambahkan pagination pada collection kecil hanya demi konsistensi kosmetik.

---

# 10. Filtering & Sorting

## 10.1 Explicit Filter Parameters

Endpoint mendefinisikan filter allow-list.

Contoh:

```text
GET /requests?status=PENDING&type=SHIFT_SWAP&employeeId=emp_123
```

Dilarang membuat generic arbitrary filtering syntax yang secara implisit membuka field database.

---

## 10.2 Sorting

Gunakan allow-listed sort key:

```text
?sort=occurredAt:desc
```

Invalid sort key menghasilkan validation error, bukan diteruskan ke SQL secara dinamis.

---

## 10.3 Date Range

Gunakan business date ISO:

```text
from=2026-08-01
to=2026-08-31
```

Date range semantics harus terdokumentasi per endpoint.

---

# 11. Date, Time & Money Contract

## 11.1 Business Dates

Gunakan ISO `YYYY-MM-DD`:

```text
2026-08-12
```

`workDate` tidak boleh dikirim sebagai UTC midnight timestamp.

---

## 11.2 Absolute Timestamp

Gunakan ISO 8601 dengan offset/UTC:

```text
2026-08-12T12:30:00Z
```

Backend menyimpan/audit timestamp secara absolute.

---

## 11.3 Time-of-Day

Shift configuration dapat menggunakan local time string:

```text
23:00
07:00
```

Timezone diselesaikan melalui operational timezone + work date.

---

## 11.4 Money

IDR dikirim sebagai integer rupiah:

```json
{
  "amount": 75000,
  "currency": "IDR"
}
```

Tidak boleh menggunakan floating point decimal sebagai implicit money representation.

---

# 12. Authentication & Current User API

Better Auth menangani session/authentication routes.

NOCScheduler menyediakan projection current user:

## `GET /api/v1/me`

Returns:

- user identity,
- employee identity,
- display profile,
- role summaries,
- effective capabilities relevant to UI,
- preferences yang aman.

Client boleh menggunakan capability projection untuk UI visibility tetapi server tetap melakukan authorization ulang pada mutation.

---

# 13. Dashboard API

## `GET /api/v1/dashboard`

Returns one composite read model optimized untuk home screen:

- personal shift today,
- next shift,
- now on duty,
- current coverage summary,
- recent schedule changes,
- monthly personal summary,
- pending relevant requests,
- payroll attention indicator sesuai permission.

Dashboard endpoint adalah read projection, bukan source of truth.

Query parameters optional:

```text
date
period
```

Default operational date ditentukan server dari `Asia/Jakarta`, bukan browser timezone.

---

# 14. Employee API

## `GET /api/v1/employees`

Filters:

- `status`
- `search`
- `role`
- `limit`
- `cursor`
- allow-listed `sort`

Returns employee summary untuk directory/table.

---

## `POST /api/v1/employees`

Creates employee record.

Permission:

```text
employee.manage
```

Potential fields:

- displayName,
- employeeCode,
- email/contact metadata yang termasuk scope produk,
- activeFrom,
- status,
- optional initial account linkage.

Creation account/login dapat tetap menjadi separate authorization-aware operation.

---

## `GET /api/v1/employees/:employeeId`

Returns canonical employee profile.

---

## `PATCH /api/v1/employees/:employeeId`

Requires:

- permission,
- `expectedVersion`.

Historical-sensitive status change tidak boleh merusak historical schedule/payroll.

---

## `GET /api/v1/employees/:employeeId/schedule-summary`

Period-scoped schedule projection.

---

## `GET /api/v1/employees/:employeeId/payroll-summary`

Period/history projection sesuai transparency policy PRD-07.

---

# 15. Access Control API

## `GET /api/v1/access/roles`

Returns role definitions + permission summaries.

---

## `GET /api/v1/access/permissions`

Returns registered capability catalog for authorized administrator UI.

---

## `POST /api/v1/access/roles`

Creates role bundle.

---

## `PATCH /api/v1/access/roles/:roleId`

Updates role metadata/permission mapping with concurrency guard.

---

## `POST /api/v1/access/users/:userId/roles`

Assigns effective role/scope.

Body conceptual:

```json
{
  "roleId": "role_scheduler",
  "scope": "ALL",
  "effectiveFrom": "2026-08-12",
  "reason": "Assigned as scheduler"
}
```

Must enforce:

- `access.manage`,
- last-admin guard,
- audit event.

---

## `DELETE /api/v1/access/users/:userId/roles/:userRoleId`

Removes/deactivates assignment only if policy permits and last-admin guard remains satisfied.

---

# 16. Shift Configuration API

## `GET /api/v1/shifts`

Returns active + optionally historical shift identities.

Query:

```text
?includeInactive=true
```

---

## `POST /api/v1/shifts`

Creates stable shift identity.

---

## `GET /api/v1/shifts/:shiftId/versions`

Returns effective-dated definitions.

---

## `POST /api/v1/shifts/:shiftId/versions`

Creates new effective version.

Body conceptual:

```json
{
  "name": "Shift 3 / Malam",
  "shortName": "S3",
  "startTime": "23:00",
  "endTime": "07:00",
  "crossesMidnight": true,
  "effectiveFrom": "2026-09-01",
  "expectedVersion": 4
}
```

Backend rejects ambiguous/overlapping effective version.

---

# 17. Schedule Period API

## `GET /api/v1/schedule-periods`

Returns schedule period summaries:

- period,
- status,
- completion,
- current version,
- validation summary,
- publishedAt,
- updatedAt.

---

## `POST /api/v1/schedule-periods`

Creates schedule period/draft.

Can specify creation mode:

```text
BLANK
COPY_PREVIOUS
TEMPLATE
```

Advanced rotation generation remains explicit strategy.

---

## `GET /api/v1/schedule-periods/:periodId`

Returns workspace projection:

- employees,
- work dates,
- assignments,
- OFF/unassigned distinction,
- exceptions/effective state projection,
- coverage summary,
- schedule version,
- validation indicators.

Projection may be optimized for UI but must expose stable IDs/version tokens.

---

# 18. Schedule Assignment API

## `PUT /api/v1/schedule-periods/:periodId/assignments/:employeeId/:workDate`

Upserts one draft primary work state.

Body examples:

```json
{
  "type": "SHIFT",
  "shiftId": "shift_s2",
  "expectedScheduleVersion": 14
}
```

or:

```json
{
  "type": "OFF",
  "expectedScheduleVersion": 14
}
```

Clear to unassigned uses explicit command/body, not ambiguous `shiftId: null` unless schema clearly names the intent.

---

## `DELETE /api/v1/schedule-periods/:periodId/assignments/:employeeId/:workDate`

Allowed only where deleting a draft primary state means return to `UNASSIGNED`.

Published historical assignment is not destructively deleted through this endpoint.

---

## `POST /api/v1/schedule-periods/:periodId/assignments/bulk`

Performs bulk operation.

Body conceptual:

```json
{
  "targets": [
    { "employeeId": "emp_1", "workDate": "2026-08-01" },
    { "employeeId": "emp_2", "workDate": "2026-08-01" }
  ],
  "operation": {
    "type": "ASSIGN_SHIFT",
    "shiftId": "shift_s3"
  },
  "expectedScheduleVersion": 14
}
```

Bulk operation must behave like many valid single operations.

Default transaction policy for one submitted bulk command:

- atomic when operation semantics require coherent schedule edit,
- otherwise explicit per-target outcome only if product workflow intentionally supports partial success.

For MVP, prefer **atomic bulk mutation** to avoid ambiguous half-applied schedule changes.

---

# 19. Schedule Validation & Publish API

## `POST /api/v1/schedule-periods/:periodId/validate`

Read-like command because validation can be expensive and accepts options.

Returns:

```json
{
  "data": {
    "scheduleVersion": 14,
    "valid": false,
    "summary": {
      "errors": 2,
      "warnings": 4,
      "info": 1
    },
    "findings": []
  }
}
```

No persisted schedule mutation.

---

## `POST /api/v1/schedule-periods/:periodId/publish`

Requires:

- `schedule.publish`,
- `Idempotency-Key`,
- `expectedVersion`,
- no blocking validation,
- override reason for overrideable warning when policy requires.

Server revalidates inside command.

Result includes:

- new published version,
- publication timestamp,
- warning override summary,
- notification/outbox status if relevant.

---

## `POST /api/v1/schedule-periods/:periodId/corrections`

Explicit published-schedule correction command.

Body includes:

- employee,
- work date,
- before expected state/version,
- proposed state,
- reason,
- expected period/version.

Must return payroll impact awareness if period intersects calculated payroll.

---

# 20. Requests & Exception API

## `GET /api/v1/requests`

Filters:

- status,
- type,
- employeeId,
- from/to,
- needsReplacement,
- payrollImpact,
- cursor/limit.

---

## `POST /api/v1/requests`

Creates self or authorized request.

Types baseline:

```text
LEAVE
SICK
PERMISSION
TRAINING
BUSINESS_DUTY
SCHEDULE_CHANGE
SHIFT_SWAP
REPLACEMENT
OVERTIME
```

Schema is discriminated by `type`.

Client-supplied employee/requester identity must be checked against permission/scope.

---

## `GET /api/v1/requests/:requestId`

Returns request detail + planned assignment + proposed/effective state + audit timeline summary.

---

## `POST /api/v1/requests/:requestId/approve`

Requires:

- `request.approve`,
- idempotency key,
- expectedVersion,
- self-approval guard,
- full business revalidation.

Approval may atomically create/update:

- exception,
- replacement,
- swap relation,
- effective operational projection source,
- audit event,
- payroll dirty marker/outbox.

---

## `POST /api/v1/requests/:requestId/reject`

Requires reason when policy requires.

---

## `POST /api/v1/requests/:requestId/cancel`

Requester/admin cancellation according to lifecycle rules.

---

# 21. Shift Swap API

Shift swap may be created via generic request type but execution is a dedicated atomic command.

## `POST /api/v1/shift-swaps/:swapId/execute`

Requirements:

- swap approved/eligible,
- both assignments still match expected state,
- both employees valid,
- overlap/rest/coverage rules pass,
- operation atomic,
- one correlation ID across both assignment changes,
- payroll freshness updated where required.

If either side is stale or invalid, entire swap fails.

---

# 22. Overtime & Replacement API

Canonical resources may remain under request/exception module while exposing query-friendly endpoints.

## `GET /api/v1/overtime`

## `GET /api/v1/replacements`

Direct create endpoints are allowed only for authorized administrative records where request workflow is intentionally bypassed.

Such action requires stronger permission + reason + audit.

---

# 23. Compensation API

## `GET /api/v1/compensation/employees/:employeeId/salary-versions`

Returns effective salary history.

---

## `POST /api/v1/compensation/employees/:employeeId/salary-versions`

Creates salary version.

Body:

```json
{
  "amount": 5000000,
  "currency": "IDR",
  "effectiveFrom": "2026-09-01",
  "reason": "Annual salary adjustment",
  "expectedVersion": 3
}
```

Must detect overlapping effective range.

Historical used version cannot be destructively overwritten.

---

## `GET /api/v1/compensation/shifts/:shiftId/incentive-versions`

---

## `POST /api/v1/compensation/shifts/:shiftId/incentive-versions`

Creates effective incentive rate.

Body uses integer IDR.

If rate affects already calculated unlocked payroll, server returns impact metadata and downstream payroll becomes dirty according to PRD-04.

---

# 24. Payroll Period API

## `GET /api/v1/payroll-periods`

Filters/status/history.

---

## `GET /api/v1/payroll-periods/:periodId`

Returns period summary:

- lifecycle status,
- source freshness,
- employee counts,
- totals,
- blocking issues,
- calculated/finalized/locked metadata.

---

## `GET /api/v1/payroll-periods/:periodId/records`

Returns payroll employee rows.

Allow filters:

- employee,
- status,
- dirty,
- missing config.

---

## `GET /api/v1/payroll-periods/:periodId/records/:employeeId`

Returns detailed explainable payroll:

- base salary,
- shift counts,
- incentive segments,
- adjustments,
- deductions,
- THP,
- calculation revision,
- source traceability,
- lifecycle metadata.

---

# 25. Payroll Calculation API

## `POST /api/v1/payroll-periods/:periodId/calculate`

Requires:

- `payroll.calculate`,
- idempotency key,
- expected period version,
- unlocked state.

Optional scope:

```json
{
  "scope": "ALL",
  "expectedVersion": 8
}
```

or explicit employee subset for correction/review workflow.

Calculation is idempotent with same source revision.

Response includes:

- calculation revision,
- records calculated,
- blocking/incomplete records,
- new dirty/fresh state,
- totals summary.

Missing base salary/incentive config must not silently use zero.

---

## `POST /api/v1/payroll-periods/:periodId/recalculate`

May be same application command as calculate but explicit endpoint improves audit semantics.

Recalculation:

- replaces/version generated components,
- preserves valid manual adjustments,
- creates new payroll revision,
- does not mutate locked period.

---

# 26. Payroll Adjustment API

## `POST /api/v1/payroll-periods/:periodId/records/:employeeId/adjustments`

Body:

```json
{
  "direction": "EARNING",
  "category": "BONUS",
  "amount": 100000,
  "reason": "Special operational bonus",
  "expectedVersion": 6
}
```

Requirements:

- permission,
- reason,
- integer amount > 0,
- unlocked lifecycle,
- audit event,
- no ambiguous negative input.

---

## `PATCH /api/v1/payroll-periods/:periodId/records/:employeeId/adjustments/:adjustmentId`

Allowed only before lock and with expected version.

---

## `DELETE /api/v1/payroll-periods/:periodId/records/:employeeId/adjustments/:adjustmentId`

Deletion is controlled removal with audit evidence, not silent database erase of historical locked item.

---

# 27. Payroll Lifecycle API

## `POST /api/v1/payroll-periods/:periodId/finalize`

Requires:

- `payroll.finalize`,
- idempotency key,
- expectedVersion,
- no dirty calculation,
- no blocking errors.

---

## `POST /api/v1/payroll-periods/:periodId/lock`

Requires:

- `payroll.lock`,
- idempotency key,
- finalized state,
- expectedVersion.

Result contains immutable lock metadata.

---

## `POST /api/v1/payroll-periods/:periodId/unlock`

Exceptional command.

Requires:

- `payroll.unlock`,
- idempotency key,
- reason mandatory,
- expectedVersion,
- stronger audit severity.

Unlock does not erase historical locked revision; subsequent calculation creates new revision/history.

---

# 28. Reports API

## `GET /api/v1/reports/schedule`

## `GET /api/v1/reports/payroll`

## `GET /api/v1/reports/employees`

Report endpoints accept explicit filters/period and return structured data projection.

Large export generation may use:

```text
POST /api/v1/exports
GET  /api/v1/exports/:exportId
```

If export becomes asynchronous, job state:

```text
QUEUED
PROCESSING
READY
FAILED
EXPIRED
```

Direct download URL must be short-lived/authorized where applicable.

---

# 29. Activity & Audit API

## `GET /api/v1/activity`

Human-readable business history projection.

Filters:

- actor,
- employee,
- domain,
- eventType,
- severity,
- date range,
- cursor.

---

## `GET /api/v1/activity/:eventId`

Returns detail appropriate for UI:

- title,
- actor,
- occurredAt,
- effective date where relevant,
- before/after human projection,
- reason,
- correlated operation,
- affected resources.

Raw security-sensitive payload never exposed blindly.

---

## `GET /api/v1/audit/events`

Optional administrator/investigation endpoint for more structured audit data.

Permission stronger than normal Activity History if raw structured detail contains sensitive operational metadata.

---

# 30. Notification API

## `GET /api/v1/notifications`

Cursor-paginated.

Filters:

- unread,
- type.

---

## `POST /api/v1/notifications/:notificationId/read`

Idempotent.

---

## `POST /api/v1/notifications/read-all`

Idempotent and scoped to current user.

---

# 31. Settings API

Settings endpoint harus mengikuti domain, bukan satu generic unrestricted key/value API.

Recommended:

```text
GET/PATCH /api/v1/settings/general
GET/PATCH /api/v1/settings/payroll
GET/PATCH /api/v1/settings/notifications
GET      /api/v1/settings/holidays
POST     /api/v1/settings/holidays
PATCH    /api/v1/settings/holidays/:holidayId
```

Shift, compensation, dan access settings tetap memakai domain API sendiri karena historical/effective integrity lebih kompleks.

Generic endpoint seperti:

```text
PATCH /settings/:key
```

untuk arbitrary key harus dihindari sebagai public application contract.

---

# 32. Holiday API

## `GET /api/v1/holidays`

Period/date range filter.

## `POST /api/v1/holidays`

## `PATCH /api/v1/holidays/:holidayId`

## `DELETE /api/v1/holidays/:holidayId`

Delete hanya jika safe; historical-referenced holiday lebih baik diarchive/inactivate.

Holiday tidak otomatis berarti OFF sesuai PRD-05.

---

# 33. Query Projection vs Canonical Resource

API boleh memiliki read models optimized untuk UI.

Contoh:

- dashboard,
- schedule workspace,
- team schedule,
- payroll overview.

Read projection boleh denormalized.

Mutation tetap harus mengacu pada canonical stable IDs/version.

Client tidak boleh mengirim seluruh read projection kembali sebagai update payload.

---

# 34. Partial Update Rules

PATCH body harus menggunakan explicit optional fields.

Semantics null harus jelas:

- omitted = unchanged,
- `null` = clear value hanya jika field nullable/clearable.

Jangan menggunakan truthy/falsy parsing yang membuat `0`, `false`, atau empty string tertukar dengan omitted.

---

# 35. Atomicity & Transaction Contract

## 35.1 Schedule Publish

Transaction minimal menjamin:

- source version validated,
- publication state/version persisted,
- required audit event persisted atau durable outbox committed,
- no half publication.

---

## 35.2 Shift Swap

Kedua sisi swap + audit/correlation diperlakukan satu business transaction.

---

## 35.3 Payroll Calculation

Per employee calculation harus atomik.

Bulk monthly calculation dapat memproses employee secara controlled units, tetapi API harus membedakan:

- successfully calculated,
- incomplete/blocking,
- failed internal.

Tidak boleh ada record half-written yang terlihat calculated/final.

---

## 35.4 Payroll Lock

Lock state + immutable revision pointer + audit evidence harus committed secara konsisten.

---

# 36. Concurrency Contract

## 36.1 Stale Mutation Response

Example:

```json
{
  "error": {
    "code": "STALE_VERSION",
    "message": "This record changed after you opened it.",
    "requestId": "req_...",
    "expectedVersion": 8,
    "currentVersion": 9,
    "retryable": true
  }
}
```

Frontend should:

1. stop automatic overwrite,
2. fetch latest state,
3. show conflict/review UI when user input could be lost.

---

## 36.2 No Last-Write-Wins for Critical State

Do not use silent last-write-wins for:

- schedule publish/correction,
- request approval,
- compensation effective version,
- payroll lifecycle,
- role/access assignment.

---

# 37. Idempotency Contract

Idempotency storage records conceptually:

- actor,
- action/route,
- key,
- normalized payload hash,
- response/result reference,
- createdAt,
- expiresAt.

Do not store secrets unnecessarily in idempotency payload.

If first request is still processing, duplicate request should return deterministic in-progress/conflict behavior rather than execute again.

---

# 38. Caching Contract

## 38.1 Mutations Are Never Served from Cache

All command endpoints execute against authoritative state.

---

## 38.2 Sensitive/Personal Read Responses

Do not assume public/shared caching.

Cache behavior must respect authenticated user context.

---

## 38.3 Client Query Invalidation

Mutation response should provide enough resource IDs/version to invalidate precise TanStack Query keys.

Examples:

Schedule correction invalidates:

- relevant period schedule,
- employee schedule summary,
- dashboard shift projection,
- team coverage,
- affected payroll freshness when relevant.

Avoid `invalidate everything` as normal pattern.

---

# 39. Rate Limiting & Abuse Guard

Detailed security policy belongs PRD-16, but API must support per-route guardrails.

Priority rate limit candidates:

- login/auth attempt,
- password reset if implemented,
- expensive report/export,
- payroll calculate,
- validation loops,
- mass notification command,
- access mutation.

Internal application does not mean unlimited expensive requests.

---

# 40. Audit Integration Contract

High-risk mutation must produce audit event with:

- event type,
- actor,
- subject/resource,
- before snapshot where relevant,
- after snapshot,
- reason where required,
- request ID,
- correlation ID,
- occurredAt.

Audit failure policy for high-risk mutation:

- mutation fails, or
- transaction commits durable outbox that guarantees audit emission.

Successful high-risk mutation without trace is prohibited.

---

# 41. Observability Contract

Every API request should expose internal observability context:

- request ID,
- route,
- method,
- actor ID when authenticated and safe to log,
- status code,
- duration,
- error code,
- correlation ID for business command if present.

Logs must not contain:

- password,
- session token,
- auth secret,
- raw credential,
- unnecessary sensitive payload.

---

# 42. API Performance Targets

These are product engineering targets, not absolute guarantees.

Normal internal read request target:

```text
p95 server processing < 500 ms
```

Interactive mutation target excluding deliberate heavy calculation:

```text
p95 server processing < 800 ms
```

Heavy operations seperti monthly payroll calculation/export may exceed this and should provide explicit progress/result semantics if synchronous execution becomes poor UX.

Dashboard and schedule read models should be optimized to avoid obvious N+1 behavior.

---

# 43. API Documentation & Schema Ownership

Canonical API schemas should live near domain/application code and be reusable for:

- runtime validation,
- TypeScript type inference,
- tests,
- generated API documentation if adopted.

OpenAPI generation is recommended if it can derive from canonical schemas without maintaining a second manually divergent source of truth.

Do not hand-maintain two conflicting contract definitions.

---

# 44. Security Boundary Notes

PRD-16 will define details, but PRD-15 requires:

- secure session resolution,
- authorization server-side,
- CSRF strategy appropriate to cookie-based auth,
- origin/host validation where required,
- content-type enforcement,
- payload size limits,
- safe error disclosure,
- no SQL/ORM internal error leaked to client.

---

# 45. API Evolution Rules

Non-breaking changes:

- add optional response field,
- add new endpoint,
- add optional request parameter with safe default,
- add new enum value only if existing clients tolerate unknown values.

Potential breaking changes:

- remove/rename field,
- change meaning/type,
- make optional field required,
- change status transition semantics,
- repurpose stable error code.

Breaking changes require explicit migration/version decision.

---

# 46. Canonical Permission Mapping

Minimum mapping examples:

| API Action | Capability |
|---|---|
| read team schedule | `schedule.read` |
| edit draft schedule | `schedule.manage` |
| publish schedule | `schedule.publish` |
| published correction | `schedule.correct` or stronger manage capability |
| create own request | `request.create:SELF` |
| approve request | `request.approve` |
| manage employees | `employee.manage` |
| manage compensation | `compensation.manage` |
| calculate payroll | `payroll.calculate` |
| adjust payroll | `payroll.adjust` |
| finalize payroll | `payroll.finalize` |
| lock payroll | `payroll.lock` |
| unlock payroll | `payroll.unlock` |
| manage access | `access.manage` |
| view audit detail | `audit.read` |

Final permission registry remains PRD-07 source of truth.

---

# 47. Canonical Endpoint Registry — MVP

Minimum MVP-oriented endpoint groups:

```text
/api/v1/me
/api/v1/dashboard

/api/v1/employees
/api/v1/employees/:employeeId

/api/v1/access/roles
/api/v1/access/permissions
/api/v1/access/users/:userId/roles

/api/v1/shifts
/api/v1/shifts/:shiftId/versions

/api/v1/schedule-periods
/api/v1/schedule-periods/:periodId
/api/v1/schedule-periods/:periodId/assignments/...
/api/v1/schedule-periods/:periodId/validate
/api/v1/schedule-periods/:periodId/publish
/api/v1/schedule-periods/:periodId/corrections

/api/v1/requests
/api/v1/requests/:requestId
/api/v1/requests/:requestId/approve
/api/v1/requests/:requestId/reject
/api/v1/requests/:requestId/cancel

/api/v1/compensation/employees/:employeeId/salary-versions
/api/v1/compensation/shifts/:shiftId/incentive-versions

/api/v1/payroll-periods
/api/v1/payroll-periods/:periodId
/api/v1/payroll-periods/:periodId/records
/api/v1/payroll-periods/:periodId/records/:employeeId
/api/v1/payroll-periods/:periodId/calculate
/api/v1/payroll-periods/:periodId/recalculate
/api/v1/payroll-periods/:periodId/finalize
/api/v1/payroll-periods/:periodId/lock
/api/v1/payroll-periods/:periodId/unlock
/api/v1/payroll-periods/:periodId/records/:employeeId/adjustments

/api/v1/reports/*
/api/v1/activity
/api/v1/activity/:eventId
/api/v1/notifications
/api/v1/settings/*
/api/v1/holidays
```

Exact file-system Route Handler structure may differ while preserving canonical HTTP contract.

---

# 48. API Business Rules

The following rules are contract-level requirements.

- **API-001** — All NOCScheduler application endpoints use `/api/v1` baseline prefix.
- **API-002** — Authentication framework routes remain separate from application domain API.
- **API-003** — Protected endpoint must resolve server-side session.
- **API-004** — Protected action must enforce server-side capability/scope.
- **API-005** — Untrusted input must pass runtime validation.
- **API-006** — Client cannot bypass business validation through crafted payload.
- **API-007** — High-risk state transition uses explicit command semantics.
- **API-008** — Successful high-risk mutation must be transactionally consistent.
- **API-009** — High-risk mutation must leave durable audit evidence.
- **API-010** — Published schedule cannot be destructively deleted through draft endpoint.
- **API-011** — Draft assignment and published correction are separate mutation semantics.
- **API-012** — Schedule publish reruns validation on server.
- **API-013** — Validation preview is not authority for later publish.
- **API-014** — Bulk schedule mutation validates every target.
- **API-015** — MVP bulk schedule mutation prefers atomic behavior.
- **API-016** — Shift swap execution is atomic across both sides.
- **API-017** — Self-approval guard cannot be bypassed by client employee/requester IDs.
- **API-018** — Compensation effective versions must not overlap ambiguously.
- **API-019** — Money uses integer IDR or explicit fixed precision, never binary float semantics.
- **API-020** — Work date uses business date, not browser/UTC-derived date.
- **API-021** — Draft schedule never becomes payroll source through API flag.
- **API-022** — Payroll calculation must reject missing required salary/rate configuration.
- **API-023** — Payroll recalculation preserves valid manual adjustments.
- **API-024** — Locked payroll rejects normal mutation/recalculation.
- **API-025** — Payroll unlock requires dedicated capability and reason.
- **API-026** — Locked payroll history is not erased after unlock/recalculation.
- **API-027** — Critical mutation uses optimistic concurrency/version guard.
- **API-028** — Stale version must not silently use last-write-wins.
- **API-029** — Dangerous duplicate command supports idempotency.
- **API-030** — Same idempotency key with different payload is rejected.
- **API-031** — Error response contains stable machine-readable code.
- **API-032** — Client must not need to parse error message text for logic.
- **API-033** — Authorization failure is not flattened into generic validation failure.
- **API-034** — Business validation may use structured ERROR/WARNING/INFO findings.
- **API-035** — `UNASSIGNED` and `OFF` remain distinct API states.
- **API-036** — Cross-midnight assignment remains one schedule/payroll source record.
- **API-037** — API read projection may be denormalized but mutation targets canonical IDs.
- **API-038** — Generic unrestricted settings key mutation is prohibited.
- **API-039** — Historical source resource is not hard-deleted when referenced.
- **API-040** — Cursor is opaque to client.
- **API-041** — Filtering/sorting uses allow-listed fields.
- **API-042** — Raw database/ORM errors are never leaked to client.
- **API-043** — Request ID is returned/correlatable for errors and diagnostics.
- **API-044** — High-risk operation can expose business correlation ID where useful.
- **API-045** — API logging excludes credentials/secrets/session tokens.
- **API-046** — Mutation response returns useful resulting state/version when available.
- **API-047** — Successful response does not contain hidden embedded error object.
- **API-048** — HTTP status codes preserve authentication/authorization/conflict distinctions.
- **API-049** — Same command with unchanged deterministic inputs must not duplicate generated business records.
- **API-050** — Every MVP endpoint group has contract tests before production readiness.
- **API-051** — Server Component direct query path must enforce the same authorization/domain rules as HTTP API.
- **API-052** — Server Action must reuse canonical command/domain services and must not create shadow business logic.
- **API-053** — Current browser timezone cannot redefine business work date.
- **API-054** — Update payload omission vs explicit null semantics must be deterministic.
- **API-055** — Numeric zero/false values cannot be lost due to truthy/falsy parsing.
- **API-056** — Sensitive read response cannot be publicly/shared cached.
- **API-057** — Client cache invalidation should target affected resources instead of global refresh by default.
- **API-058** — Export/download authorization must be verified at retrieval time.
- **API-059** — API contract changes must be reviewed for backward compatibility.
- **API-060** — PRD-15 does not override business rules from PRD-03/04/05/07; API must express and enforce them.

---

# 49. Critical Contract Test Matrix

| Test | Expected Result |
|---|---|
| unauthenticated protected GET | 401 |
| authenticated but missing capability | 403 |
| malformed JSON/body | 400 |
| valid shape, invalid business state | 422/409 with stable code |
| stale schedule edit | rejected with `STALE_VERSION` |
| duplicate publish with same idempotency key | no second publication effect |
| same idempotency key different payload | rejected |
| publish with blocking schedule validation | rejected |
| publish after validation preview but source changed | revalidation detects current state |
| bulk assignment one invalid target | atomic failure in MVP |
| published shift destructive DELETE attempt | rejected |
| Shift 3 cross-midnight API projection | one assignment/work date |
| shift swap one side stale | entire swap rejected |
| request self-approval | rejected |
| salary version overlap | rejected |
| incentive version overlap | rejected |
| payroll missing salary | calculation incomplete/blocking, not Rp0 |
| payroll missing incentive rate | calculation blocking |
| duplicate calculate idempotent request | no duplicate generated items |
| recalculation | manual adjustments preserved |
| finalization with dirty payroll | rejected |
| normal mutation on locked payroll | rejected |
| unlock without reason | rejected |
| unlock without capability | 403 |
| access change removes last administrator | rejected |
| audit-required mutation | durable audit evidence exists |
| list invalid sort field | validation error |
| cursor pagination replay | stable continuation semantics |
| `amount = 0` allowed field | zero not treated as omitted |
| explicit nullable clear | follows documented null semantics |
| internal DB exception | generic safe 500, request ID available |

---

# 50. API Definition of Done

An API endpoint/command is not Done until:

1. canonical route and HTTP method are defined,
2. request schema exists,
3. response schema exists,
4. authentication requirement is explicit,
5. permission/scope mapping is explicit,
6. business validation path is implemented,
7. database transaction boundary is correct,
8. concurrency strategy is defined where mutable,
9. idempotency is implemented where duplicate submission is dangerous,
10. audit behavior is defined where required,
11. safe error codes are defined,
12. request ID/correlation is available,
13. unit/domain tests cover business rule,
14. API integration tests cover status + schema,
15. authorization tests cover allowed/denied actor,
16. concurrency test exists for critical mutation,
17. idempotency test exists where applicable,
18. historical integrity is verified,
19. no secret/sensitive debug payload is exposed,
20. frontend/client can complete intended flow without undocumented assumptions.

---

# 51. Recommended Implementation Order

1. Common API response/error utilities.
2. Request/session context + request ID.
3. Authorization middleware/helper.
4. Zod schema conventions.
5. Error-code registry.
6. Idempotency service.
7. Concurrency/version helpers.
8. `/me` + dashboard reads.
9. Employee APIs.
10. Shift configuration APIs.
11. Schedule period/assignment APIs.
12. Validation + publish/correction commands.
13. Request/exception/swap APIs.
14. Compensation APIs.
15. Payroll read/calculate/recalculate APIs.
16. Payroll lifecycle + adjustment APIs.
17. Activity/audit APIs.
18. Notifications/settings/holidays.
19. Reports/export APIs.
20. Cross-domain integration/contract test suite.

---

# 52. Final Contract

NOCScheduler API must remain:

> **Explicit enough to understand, strict enough to protect business data, deterministic enough to test, and simple enough that the frontend never has to guess what the backend means.**

The API is not merely transport plumbing. It is the externally observable contract of the business system.

For every critical operation, the backend must be able to answer:

```text
Who performed the action?
Were they allowed?
Was the input valid?
Was the business state valid?
Was the source version current?
Could duplicate submission occur safely?
Did the transaction complete atomically?
What changed?
Was the audit evidence recorded?
What resulting state/version should the client render?
```

If those questions cannot be answered deterministically, the API contract is incomplete.
