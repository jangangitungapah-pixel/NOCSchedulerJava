# PRD-08 — Data Model & Database Architecture

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Data Model & Database Architecture  
> **Document ID:** PRD-08  
> **Status:** Draft — Data Architecture Source of Truth  
> **Depends On:** PRD-01 through PRD-07  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **conceptual data model, relational boundaries, entity ownership, historical strategy, effective dating, snapshot/versioning, data integrity constraints, deletion policy, concurrency control, indexing direction, dan database guardrail** untuk NOCScheduler.

PRD-08 menjadi source of truth untuk menjawab:

> **“Data apa yang harus disimpan NOCScheduler, bagaimana data saling berhubungan, dan bagaimana database menjaga jadwal, payroll, permission, serta histori tetap benar dari waktu ke waktu?”**

Dokumen ini sengaja belum menetapkan vendor database, ORM, migration framework, atau deployment topology final. Pilihan teknologi final ditentukan pada **PRD-14 — Technical Architecture & Technology Stack**.

Namun model aplikasi harus diasumsikan menggunakan **relational database dengan dukungan transaction, foreign key, unique constraint, index, dan strong consistency** sebagai baseline.

---

# 2. Data Architecture Principles

## DA-P01 — Relational First

Business-critical data harus dimodelkan sebagai entity dan relation yang eksplisit.

Jangan menyimpan seluruh schedule, payroll, employee profile, permission, atau compensation sebagai satu JSON blob besar.

JSON diperbolehkan untuk:

- audit before/after snapshot,
- non-critical extensible metadata,
- notification payload,
- cached rendering metadata,
- integration payload di masa depan.

JSON tidak boleh menggantikan relational integrity untuk data inti.

---

## DA-P02 — Historical Facts Are First-Class Data

Data historis bukan efek samping log.

Sistem harus dapat merekonstruksi:

- shift definition yang berlaku pada suatu tanggal,
- jadwal yang dipublish,
- perubahan jadwal setelah publish,
- exception yang berlaku,
- salary yang berlaku,
- incentive rate yang berlaku,
- payroll revision yang dihitung,
- payroll final/locked,
- permission/access changes yang penting.

---

## DA-P03 — Effective Dating Over Destructive Replacement

Konfigurasi yang berubah terhadap waktu harus menggunakan version/effective range.

Baseline interval:

```text
[effective_from, effective_to)
```

Artinya:

- `effective_from` inclusive,
- `effective_to` exclusive,
- `effective_to = NULL` berarti masih berlaku.

Contoh:

```text
Salary A: 2026-01-01 <= date < 2026-09-01
Salary B: 2026-09-01 <= date
```

---

## DA-P04 — Snapshot What Must Never Drift

Reference ke source record saja tidak selalu cukup.

Untuk data finansial dan published/locked business record, sistem harus menyimpan snapshot nilai penting yang benar-benar digunakan.

Contoh payroll item shift incentive menyimpan:

- source shift assignment id,
- shift identity/version,
- work date,
- rate snapshot,
- amount snapshot.

Jika konfigurasi sumber berubah, angka historis tidak ikut berubah.

---

## DA-P05 — Stable Identity, Mutable Presentation

Entity utama harus memiliki identifier stabil yang tidak bergantung pada nama tampilan.

Contoh:

- shift `S3` boleh berganti display name,
- role boleh berganti label,
- employee boleh berganti nama,

namun historical reference tetap menunjuk identity yang sama atau version yang tepat.

---

## DA-P06 — Business Date and Timestamp Are Different

Gunakan dua konsep berbeda:

- **business date** untuk `work_date`, payroll period, effective date,
- **timestamp** untuk created/updated/published/approved/locked events.

Business date mengikuti timezone operasional.

Audit timestamp direkomendasikan disimpan sebagai UTC dan dirender sesuai timezone aplikasi.

---

## DA-P07 — Money Is Never Binary Floating Point

Semua nominal IDR harus menggunakan:

- integer rupiah, atau
- fixed precision decimal.

Baseline direkomendasikan integer rupiah selama fractional currency tidak dibutuhkan.

Contoh:

```text
75000 = Rp75.000
```

---

## DA-P08 — Database Constraints Protect Invariants

Rule yang bisa dijaga database sebaiknya tidak hanya bergantung pada frontend.

Contoh:

- unique employee/work date primary assignment,
- unique payroll record per employee/period,
- unique role code,
- unique permission code,
- valid foreign keys,
- non-negative monetary rate jika rule mengharuskan,
- non-overlapping effective versions bila database mendukung constraint tersebut.

Business validation yang kompleks tetap dilakukan service layer.

---

## DA-P09 — No Hard Delete of Referenced Historical Data

Entity yang sudah direferensikan historical business record tidak boleh di-hard-delete melalui workflow normal.

Gunakan:

- inactive,
- archived,
- soft delete bila benar-benar diperlukan.

Hard delete hanya layak untuk data draft/orphan yang belum pernah menjadi historical source dan tidak memiliki reference penting.

---

## DA-P10 — Audit Is Append-Oriented

Audit record penting harus append-oriented.

User normal tidak boleh mengedit audit event lama.

---

## DA-P11 — Concurrency Must Be Explicit

Entity yang rawan concurrent mutation harus memiliki mekanisme optimistic concurrency atau equivalent guard.

Contoh:

- schedule draft,
- published correction,
- request approval,
- payroll recalculation,
- payroll lock/unlock,
- settings mutation.

---

## DA-P12 — Derived Data Is Not Source of Truth

Dashboard counters, monthly summaries, current coverage, dan total shift boleh dicache/materialize untuk performance.

Namun source of truth tetap berasal dari canonical business record.

Cache/materialized summary harus bisa direbuild.

---

# 3. Recommended Domain Boundaries

Data model dibagi menjadi domain berikut:

1. **Identity & Employee**
2. **Authorization**
3. **Shift Configuration**
4. **Scheduling**
5. **Workforce Exceptions**
6. **Compensation**
7. **Payroll**
8. **Settings & Calendar**
9. **Notifications**
10. **Audit & History**

Domain boleh menggunakan satu physical database pada MVP.

Pemisahan ini adalah **logical ownership boundary**, bukan requirement microservice.

---

# 4. Identity & Employee Model

## 4.1 `users`

Authentication principal aplikasi.

Recommended conceptual fields:

- `id`
- `email` / login identifier
- `password_hash` atau external auth reference
- `status`
- `last_login_at`
- `created_at`
- `updated_at`
- `disabled_at`
- `row_version`

Recommended status:

- `ACTIVE`
- `DISABLED`
- `INVITED` bila onboarding memakai invitation

### Constraints

- login identifier unique setelah normalization,
- disabled user tidak dapat membuat session baru,
- historical actor reference tetap valid walaupun user disabled.

---

## 4.2 `employees`

Representasi anggota NOC sebagai workforce entity.

Recommended fields:

- `id`
- `user_id` nullable/unique bila employee sudah memiliki account
- `employee_code` optional unique
- `display_name`
- `status`
- `join_date`
- `inactive_date` nullable
- `team_id` nullable/future-ready
- `job_title` optional
- `phone` optional
- `avatar_reference` optional
- `created_at`
- `updated_at`
- `row_version`

### Important Rule

`User` dan `Employee` bukan entity yang sama.

Alasannya:

- employee historical tetap harus ada walaupun account disabled,
- admin/service account di masa depan mungkin tidak merepresentasikan employee,
- account provisioning lifecycle dapat berbeda dari employment lifecycle.

---

## 4.3 `teams`

Baseline NOCScheduler hanya membutuhkan satu tim NOC, tetapi entity team direkomendasikan agar scope `TEAM` pada authorization tidak menjadi dead-end.

Fields minimum:

- `id`
- `code`
- `name`
- `is_active`

Pada MVP, satu default team boleh dibuat melalui seed.

---

# 5. Authorization Model

## 5.1 `roles`

Fields:

- `id`
- `code`
- `name`
- `description`
- `is_system_role`
- `is_active`
- timestamps

Baseline seeded role:

- `NOC_MEMBER`
- `SCHEDULER`
- `ADMINISTRATOR`

Business logic tidak boleh bergantung langsung pada role name.

---

## 5.2 `permissions`

Fields:

- `id`
- `code`
- `domain`
- `description`
- `risk_level` optional

Contoh code:

```text
schedule.read
schedule.manage
schedule.publish
request.create
request.approve
payroll.read
payroll.calculate
payroll.finalize
payroll.lock
payroll.unlock
compensation.manage
access.manage
```

Permission code harus stable dan unique.

---

## 5.3 `role_permissions`

Many-to-many mapping:

```text
role_id -> permission_id
```

Optional fields:

- default scope
- granted_at
- granted_by

---

## 5.4 `user_roles`

Mapping user ke role.

Fields minimum:

- `user_id`
- `role_id`
- `scope_type`
- `scope_reference_id` nullable
- `effective_from`
- `effective_to` nullable
- `granted_by`
- `created_at`

Dengan model ini, role assignment dapat berubah tanpa kehilangan histori.

---

## 5.5 Optional `user_permission_overrides`

Tidak wajib untuk MVP.

Jika kelak dibutuhkan, override harus eksplisit:

- `GRANT`
- `DENY`

dan tetap memiliki scope + effective range.

Baseline recommendation: hindari override sebelum ada kebutuhan nyata karena dapat membuat permission debugging rumit.

---

# 6. Shift Configuration Model

## 6.1 `shift_types`

Stable identity sebuah jenis shift.

Fields:

- `id`
- `code`
- `default_name`
- `is_active`
- `created_at`
- `archived_at`

Baseline:

- S1
- S2
- S3

---

## 6.2 `shift_type_versions`

Versioned configuration dari shift type.

Fields minimum:

- `id`
- `shift_type_id`
- `name`
- `short_name`
- `start_time`
- `end_time`
- `crosses_midnight`
- `display_order`
- `visual_token`
- `effective_from`
- `effective_to`
- `created_by`
- `created_at`

### Constraints

Untuk satu `shift_type_id`, effective range tidak boleh ambigu/overlap.

Published historical assignment harus dapat menunjuk shift version yang tepat.

---

# 7. Scheduling Model

## 7.1 `schedule_periods`

Container periode scheduling.

Fields minimum:

- `id`
- `period_code`
- `start_date`
- `end_date`
- `timezone`
- `status`
- timestamps

Example:

```text
2026-08
```

`period_code` tidak boleh menjadi satu-satunya identity karena custom date range dapat didukung.

---

## 7.2 `schedule_versions`

Representasi revision/version schedule untuk satu period.

Fields:

- `id`
- `schedule_period_id`
- `revision_number`
- `state`
- `based_on_version_id` nullable
- `created_by`
- `created_at`
- `published_by` nullable
- `published_at` nullable
- `publication_reason` nullable
- `row_version`

Recommended state:

- `DRAFT`
- `PUBLISHED`
- `SUPERSEDED`
- `ARCHIVED`

### Preferred Historical Strategy

Published version diperlakukan immutable secara historis.

Jika published schedule dikoreksi, sistem direkomendasikan membuat revision/version baru daripada menimpa data published lama tanpa trace.

UI tetap boleh menyebut workflow tersebut sebagai “Edit Published Schedule”.

---

## 7.3 `shift_assignments`

Primary work state untuk employee pada work date dalam suatu schedule version.

Fields minimum:

- `id`
- `schedule_version_id`
- `employee_id`
- `work_date`
- `primary_state`
- `shift_type_id` nullable
- `shift_type_version_id` nullable
- `start_at` nullable
- `end_at` nullable
- `source_type`
- `note` nullable
- `created_by`
- timestamps

Recommended `primary_state`:

- `SHIFT`
- `OFF`
- exception-derived state hanya jika model projection membutuhkannya

### Constraints

Within one schedule version:

```text
UNIQUE(schedule_version_id, employee_id, work_date)
```

Jika `primary_state = SHIFT`:

- shift reference wajib,
- start/end wajib valid.

Jika `primary_state = OFF`:

- shift reference harus null.

`UNASSIGNED` direkomendasikan direpresentasikan sebagai tidak adanya row, bukan assignment palsu, kecuali implementation memiliki alasan kuat.

---

## 7.4 Published Assignment Snapshot

Untuk assignment published, record harus menyimpan atau dapat merekonstruksi:

- shift identity,
- shift version,
- work date,
- calculated start/end datetime,
- original employee,
- schedule publication revision.

Jangan menghitung ulang historical start/end hanya dari current shift settings.

---

## 7.5 Schedule Templates

Optional post-MVP entities:

### `schedule_templates`

- id
- name
- description
- active flag

### `schedule_template_items`

- template id
- relative day/index
- target pattern/group
- primary state
- shift type

Template tidak menjadi historical source setelah diterapkan; hasil apply harus menjadi real assignment pada draft.

---

# 8. Workforce Exception Model

## 8.1 `workforce_exceptions`

Generic parent record untuk kondisi operasional non-normal.

Fields minimum:

- `id`
- `employee_id`
- `exception_type`
- `start_date`
- `end_date`
- `status`
- `reason`
- `requested_by`
- `approved_by` nullable
- `approved_at` nullable
- `cancelled_at` nullable
- `created_at`
- `updated_at`
- `row_version`

Types baseline:

- `LEAVE`
- `SICK`
- `PERMISSION`
- `TRAINING`
- `BUSINESS_DUTY`
- `UNAVAILABLE`
- `EMERGENCY`

Historical records tidak boleh hilang setelah employee kembali aktif.

---

## 8.2 `exception_assignment_links`

Link exception ke assignment yang terdampak.

Fields:

- `exception_id`
- `shift_assignment_id`
- `effect_type`

Contoh effect:

- `REPLACES_WORK_STATE`
- `NON_INCENTIVE_ELIGIBLE`
- `COVERAGE_REMOVAL`

Tidak semua behavior perlu disimpan sebagai string bebas; final enum ditentukan saat implementation.

---

## 8.3 `replacement_assignments`

Mencatat siapa menggantikan siapa.

Fields minimum:

- `id`
- `original_assignment_id`
- `original_employee_id`
- `replacement_employee_id`
- `replacement_start_at`
- `replacement_end_at`
- `status`
- `reason`
- `approved_by`
- timestamps

Replacement tidak boleh membuat original + replacement mendapatkan payable incentive ganda tanpa rule explicit.

---

## 8.4 `shift_swap_requests`

Untuk swap dua assignment.

Fields:

- `id`
- `requester_employee_id`
- `counterparty_employee_id`
- `requester_assignment_id`
- `counterparty_assignment_id`
- `status`
- `reason`
- approval metadata
- timestamps
- `row_version`

Approval harus dieksekusi secara transaction/atomic terhadap kedua assignment yang terdampak.

---

## 8.5 `overtime_records`

Overtime adalah supplementary work record, bukan primary shift.

Fields:

- `id`
- `employee_id`
- `work_date`
- `start_at`
- `end_at`
- `duration_minutes`
- `status`
- `reason`
- `related_assignment_id` nullable
- approval metadata
- timestamps

Jika overtime menjadi payable, payroll harus menyimpan rate snapshot yang digunakan.

---

# 9. Compensation Model

## 9.1 `employee_salary_versions`

Fields minimum:

- `id`
- `employee_id`
- `base_salary_amount`
- `currency`
- `effective_from`
- `effective_to`
- `reason` nullable
- `created_by`
- `created_at`

### Constraints

- amount >= 0,
- satu employee tidak boleh memiliki overlapping active effective range,
- historical version yang sudah digunakan payroll tidak boleh destructive overwrite.

---

## 9.2 `shift_incentive_versions`

Fields:

- `id`
- `shift_type_id`
- `amount`
- `currency`
- `is_incentive_enabled`
- `effective_from`
- `effective_to`
- `created_by`
- `created_at`

S1 dapat memiliki:

```text
is_incentive_enabled = false
```

S2/S3 dapat memiliki versioned amount.

---

## 9.3 Compensation Resolution Rule

Saat calculation:

```text
salary version = version valid untuk employee + relevant period policy
incentive version = version valid pada assignment.work_date
```

Resolved value kemudian disnapshot ke payroll revision/item.

---

# 10. Payroll Model

## 10.1 `payroll_periods`

Fields:

- `id`
- `period_code`
- `start_date`
- `end_date`
- `timezone`
- `status`
- `calculation_revision`
- `is_dirty`
- calculated/finalized/locked actor + timestamp fields
- `row_version`

State baseline:

- `OPEN`
- `CALCULATED`
- `FINALIZED`
- `LOCKED`

---

## 10.2 `payroll_records`

Satu employee pada satu payroll period.

Fields minimum:

- `id`
- `payroll_period_id`
- `employee_id`
- `status`
- `current_revision_id` nullable
- `is_dirty`
- `calculated_take_home_pay`
- timestamps
- `row_version`

Constraint:

```text
UNIQUE(payroll_period_id, employee_id)
```

---

## 10.3 `payroll_revisions`

Immutable/semi-immutable calculation result revision.

Fields:

- `id`
- `payroll_record_id`
- `revision_number`
- `source_fingerprint` optional
- `base_salary_snapshot`
- `gross_earnings`
- `total_positive_adjustment`
- `total_deduction`
- `calculated_take_home_pay`
- `calculated_by`
- `calculated_at`
- `finalized_by` nullable
- `finalized_at` nullable
- `locked_by` nullable
- `locked_at` nullable

Recalculation membuat revision baru atau atomic replacement yang tetap mempertahankan historical revision sesuai kebutuhan audit.

Baseline recommendation: retain revision history.

---

## 10.4 `payroll_items`

Detailed generated component pada payroll revision.

Fields minimum:

- `id`
- `payroll_revision_id`
- `component_type`
- `source_type`
- `source_reference_id` nullable
- `label_snapshot`
- `quantity`
- `rate_amount`
- `amount`
- `currency`
- `direction`
- `configuration_reference_id` nullable
- `metadata_snapshot` optional

Examples:

- Base Salary
- Shift 2 Incentive
- Shift 3 Incentive
- Overtime Earning

Generated item wajib terikat ke revision tertentu.

---

## 10.5 `payroll_adjustments`

Manual adjustment sebaiknya dipisahkan dari generated payroll item agar recalculation tidak menghapusnya.

Fields:

- `id`
- `payroll_record_id`
- `category`
- `direction`
- `amount`
- `currency`
- `reason`
- `status`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`
- `voided_at` nullable
- `voided_by` nullable

Saat revision dibuat, adjustment aktif disnapshot menjadi revision component/reference.

---

## 10.6 `payroll_item_sources`

Recommended relation untuk explainability jika satu payroll item berasal dari banyak shift.

Fields:

- `payroll_item_id`
- `source_type`
- `source_id`
- `work_date`
- `quantity_contribution`
- `rate_snapshot`
- `amount_contribution`

Dengan ini UI dapat menjelaskan:

> Shift 3 × 7 berasal dari tanggal 2, 5, 9, 13, 18, 23, 29.

---

## 10.7 Locked Payroll Integrity

Jika payroll revision sudah locked:

- jangan update generated items,
- jangan update snapshot,
- jangan cascade delete source,
- source correction hanya menandai adanya discrepancy/history,
- correction financial harus lewat explicit unlock/reopen/correction workflow.

---

# 11. Holiday & Settings Model

## 11.1 `holidays`

Fields:

- `id`
- `date`
- `name`
- `type`
- `is_active`
- optional payroll/scheduling policy reference

Public holiday tidak otomatis berarti OFF.

---

## 11.2 `system_settings`

Untuk low-risk non-historical configuration.

Fields possible:

- `key`
- `value`
- `value_type`
- `updated_by`
- `updated_at`
- `row_version`

Contoh:

- default theme policy,
- default timezone,
- UI defaults.

### Guardrail

Jangan masukkan salary, incentive, shift hours, payroll-lock semantics, atau permission ke generic settings key-value jika data tersebut memiliki domain entity sendiri.

---

## 11.3 Versioned Policy Configuration

Rule yang berdampak historical seperti:

- minimum rest,
- coverage target,
- overtime policy,
- payroll cutoff,

sebaiknya menggunakan versioned policy record jika/ketika rule tersebut aktif dan harus direkonstruksi secara historical.

---

# 12. Notification Model

## 12.1 `notifications`

Fields:

- `id`
- `user_id`
- `type`
- `title`
- `body`
- `target_route`
- `entity_type` nullable
- `entity_id` nullable
- `read_at` nullable
- `created_at`
- `payload` optional JSON

Notification bukan audit source.

Menghapus/expire notification tidak boleh menghapus business history.

---

# 13. Audit Model

## 13.1 `audit_events`

Append-oriented event log.

Fields minimum:

- `id`
- `occurred_at`
- `actor_user_id` nullable untuk system action
- `actor_type`
- `action`
- `entity_type`
- `entity_id`
- `parent_entity_type` nullable
- `parent_entity_id` nullable
- `reason` nullable
- `before_snapshot` nullable JSON
- `after_snapshot` nullable JSON
- `request_id` / correlation id optional
- `ip_address` optional according to privacy/security policy
- `user_agent` optional

High-risk mutation wajib menghasilkan audit event.

---

## 13.2 Audit Coverage Minimum

Audit wajib untuk:

- schedule publish,
- published schedule correction,
- request approval/rejection,
- replacement/swap approval,
- salary change,
- incentive change,
- payroll adjustment,
- payroll calculation/finalization/lock/unlock,
- role/permission changes,
- employee activation/inactivation,
- security-sensitive settings.

---

## 13.3 Audit Snapshot Policy

Audit JSON snapshot boleh menyimpan before/after untuk explainability.

Namun audit snapshot bukan satu-satunya storage historical untuk domain yang membutuhkan query/logic kuat.

Contoh salary tetap membutuhkan `employee_salary_versions` walaupun perubahan salary juga dicatat di audit.

---

# 14. Referential Integrity Rules

## 14.1 Default Foreign Key Policy

Gunakan foreign key untuk relation penting.

Recommended deletion semantics:

- `RESTRICT` untuk historical source,
- `SET NULL` hanya untuk optional actor/reference ketika memang aman,
- `CASCADE` hanya pada child yang benar-benar tidak memiliki makna independen.

---

## 14.2 Examples

Tidak boleh cascade-delete payroll karena employee diinactive-kan.

Tidak boleh cascade-delete historical assignment karena shift type diarchive-kan.

Boleh cascade-delete transient draft child jika parent draft benar-benar belum pernah dipublish dan policy mengizinkan.

---

# 15. Soft Delete & Archive Policy

## 15.1 Prefer Status/Archive

Untuk business entity, prefer:

- `is_active`,
- `status`,
- `archived_at`.

Jangan otomatis menambahkan `deleted_at` ke semua tabel tanpa semantics yang jelas.

---

## 15.2 Hard Delete Allowed

Hard delete hanya bila seluruh kondisi berikut terpenuhi:

1. record tidak memiliki historical business importance,
2. belum pernah direferensikan published/locked record,
3. tidak dibutuhkan audit/compliance internal,
4. permission mengizinkan,
5. operation tidak merusak referential integrity.

---

# 16. Effective Dating Rules

## 16.1 Canonical Range

Gunakan:

```text
effective_from DATE NOT NULL
effective_to   DATE NULL
```

Semantics:

```text
effective_from <= business_date
AND (effective_to IS NULL OR business_date < effective_to)
```

---

## 16.2 No Overlap

Untuk identity yang sama, dua version tidak boleh berlaku pada business date yang sama.

Applies to at least:

- shift type version,
- employee salary version,
- shift incentive version,
- future versioned policy.

---

## 16.3 Future Changes

Settings UI boleh membuat version yang efektif di masa depan.

Current version tidak boleh diedit destruktif hanya untuk menjadwalkan perubahan baru.

---

# 17. Concurrency & Transaction Rules

## 17.1 Optimistic Concurrency

Recommended field:

```text
row_version INTEGER/BIGINT
```

atau equivalent ETag/version mechanism.

Critical mutation harus membandingkan expected version.

Jika stale:

- reject mutation,
- kembalikan conflict,
- jangan silent overwrite.

---

## 17.2 Transaction Boundaries

Operation berikut harus transactionally safe:

- publish schedule,
- apply shift swap,
- approve replacement yang mengubah effective assignment,
- calculate payroll record,
- monthly calculation batch per defined unit of atomicity,
- finalize payroll,
- lock/unlock payroll,
- access/role mutation yang memiliki last-admin guard.

---

## 17.3 Idempotency

Operation yang rawan retry sebaiknya mendukung idempotency atau duplicate protection.

Contoh:

- payroll calculation request,
- schedule publish,
- approval action,
- notification generation.

---

# 18. Indexing Strategy

Final index bergantung pada query plan nyata, namun baseline index harus mendukung akses utama.

Recommended candidates:

### Scheduling

```text
shift_assignments(employee_id, work_date)
shift_assignments(work_date, shift_type_id)
schedule_versions(schedule_period_id, state)
```

### Exceptions

```text
workforce_exceptions(employee_id, start_date, end_date)
workforce_exceptions(status, exception_type)
replacement_assignments(original_assignment_id)
```

### Payroll

```text
payroll_records(payroll_period_id, employee_id) UNIQUE
payroll_records(employee_id, payroll_period_id)
payroll_items(payroll_revision_id, component_type)
```

### Effective Config

```text
employee_salary_versions(employee_id, effective_from)
shift_incentive_versions(shift_type_id, effective_from)
shift_type_versions(shift_type_id, effective_from)
```

### Audit

```text
audit_events(entity_type, entity_id, occurred_at)
audit_events(actor_user_id, occurred_at)
```

### Notifications

```text
notifications(user_id, read_at, created_at)
```

Index tidak boleh dibuat membabi buta; final architecture harus divalidasi dengan workload nyata.

---

# 19. Recommended Uniqueness & Integrity Constraints

Minimum conceptual constraints:

```text
users(normalized_login) UNIQUE
employees(employee_code) UNIQUE WHERE employee_code IS NOT NULL
roles(code) UNIQUE
permissions(code) UNIQUE
shift_types(code) UNIQUE
schedule_versions(schedule_period_id, revision_number) UNIQUE
shift_assignments(schedule_version_id, employee_id, work_date) UNIQUE
payroll_records(payroll_period_id, employee_id) UNIQUE
payroll_revisions(payroll_record_id, revision_number) UNIQUE
```

Additional range overlap constraint sangat direkomendasikan untuk effective-dated version jika database mendukungnya secara aman.

---

# 20. Derived Projection / Read Model

Untuk UX cepat, sistem boleh memiliki read model atau materialized projection seperti:

- `current_effective_schedule`,
- `now_on_duty_projection`,
- monthly employee shift summary,
- schedule coverage summary,
- payroll summary.

Projection harus:

- dapat direbuild,
- tidak menjadi satu-satunya source of truth,
- memiliki refresh strategy yang jelas,
- tidak mengubah historical business data.

Pada MVP kecil, projection dapat dihitung query-time terlebih dahulu sebelum menambah kompleksitas caching.

---

# 21. Conceptual Relationship Map

```text
User
 ├─ UserRole ─ Role ─ RolePermission ─ Permission
 └─ Employee
      ├─ EmployeeSalaryVersion
      ├─ ShiftAssignment
      │    ├─ ShiftTypeVersion ─ ShiftType
      │    └─ ScheduleVersion ─ SchedulePeriod
      ├─ WorkforceException
      ├─ OvertimeRecord
      ├─ ReplacementAssignment
      └─ PayrollRecord ─ PayrollPeriod
                         ├─ PayrollRevision
                         │    ├─ PayrollItem
                         │    └─ PayrollItemSource
                         └─ PayrollAdjustment

ShiftType
 ├─ ShiftTypeVersion
 └─ ShiftIncentiveVersion

All critical domains
 └─ AuditEvent
```

Relationship map ini konseptual dan bukan schema migration final.

---

# 22. Data Lifecycle Examples

## 22.1 Shift Definition Change

Awal:

```text
S3 Version 1
23:00–07:00
Effective: Jan 1 – Sep 1
```

Perubahan:

```text
S3 Version 2
22:00–06:00
Effective: Sep 1 onward
```

Assignment Agustus tetap reference Version 1.

Assignment September menggunakan Version 2.

---

## 22.2 Salary Change

```text
Employee A Salary V1
Rp5.000.000
Effective Jan 1 – Sep 1

Employee A Salary V2
Rp5.500.000
Effective Sep 1 onward
```

Payroll Agustus tidak berubah.

---

## 22.3 Published Schedule Correction

```text
Schedule Period Aug
Revision 1 -> Published

Correction dibuat
Revision 2 based_on Revision 1
Revision 2 -> Published
Revision 1 -> Superseded historical
```

Audit menjelaskan delta dan actor.

---

## 22.4 Payroll Recalculation

```text
Payroll Record Employee A / Aug
Revision 1 -> calculated
Schedule exception berubah -> record dirty
Revision 2 -> recalculated
Revision 2 -> finalized -> locked
```

Revision 1 tetap dapat disimpan sebagai historical calculation trail.

---

# 23. Data Security & Exposure Rules

Walaupun aplikasi transparan secara internal:

- credential/password hash tidak pernah dikirim ke client,
- session/token tidak disimpan sebagai plaintext business data,
- permission check dilakukan sebelum query/mutation restricted,
- API response hanya mengirim field yang dibutuhkan,
- audit/security metadata sensitif tidak otomatis exposed ke semua role,
- database credential dan secrets bukan bagian tabel settings umum.

Detail security final berada di PRD-16.

---

# 24. Migration & Seed Expectations

Saat project setup dibuat, migration awal harus dapat menghasilkan baseline minimal:

- authorization tables,
- user/employee tables,
- shift configuration tables,
- scheduling tables,
- compensation tables,
- payroll tables,
- exception tables,
- audit table,
- notification/settings tables yang masuk MVP.

Seed development/demo direkomendasikan menyediakan:

- 1 Administrator,
- sample NOC Members,
- S1/S2/S3,
- default team,
- sample schedule period,
- sample salary/incentive config.

Production seed tidak boleh membuat default password yang predictable.

---

# 25. Backup & Restore Data Expectations

PRD-08 tidak menetapkan provider backup, tetapi database architecture harus memungkinkan:

- point-in-time recovery bila platform mendukung,
- full backup,
- restore test,
- migration rollback strategy yang aman,
- preservation historical payroll/audit data.

Detail operasional ada di PRD-20.

---

# 26. Data Quality Guardrails

Sistem harus mendeteksi atau mencegah:

- employee tanpa identity yang dapat dibedakan,
- duplicate primary assignment pada version yang sama,
- overlapping salary version,
- overlapping incentive version,
- shift version tanpa valid duration,
- payroll record duplicate,
- orphan payroll item,
- orphan assignment terhadap employee/shift version,
- payroll locked yang masih dapat dimutasi normal,
- request approved tanpa approver metadata ketika approval diwajibkan,
- high-risk mutation tanpa audit event.

---

# 27. Database Business Rules

Rule identifiers berikut harus dipakai sebagai referensi implementation/test.

- **DATA-001** — User identity harus unique setelah normalization.
- **DATA-002** — Employee historical tidak dihapus hanya karena user account disabled.
- **DATA-003** — Role dan permission menggunakan stable unique code.
- **DATA-004** — Authorization assignment dapat memiliki effective date/scope.
- **DATA-005** — Shift type identity dipisahkan dari shift version.
- **DATA-006** — Shift version effective ranges tidak boleh overlap.
- **DATA-007** — Work date mengikuti tanggal mulai shift.
- **DATA-008** — Cross-midnight shift tetap satu assignment.
- **DATA-009** — Satu employee hanya memiliki satu primary assignment per work date dalam schedule version.
- **DATA-010** — Unassigned tidak boleh disamakan dengan OFF.
- **DATA-011** — Published schedule harus memiliki historical revision trace.
- **DATA-012** — Published historical assignment tidak bergantung pada current shift config.
- **DATA-013** — Exception tidak menghapus planned schedule source.
- **DATA-014** — Replacement menyimpan original dan replacement identity.
- **DATA-015** — Overtime bukan primary assignment.
- **DATA-016** — Salary disimpan sebagai effective-dated version.
- **DATA-017** — Salary effective ranges tidak boleh ambigu.
- **DATA-018** — Incentive disimpan sebagai effective-dated version.
- **DATA-019** — Incentive effective ranges tidak boleh ambigu.
- **DATA-020** — Semua nominal uang tidak menggunakan binary floating point.
- **DATA-021** — Satu employee hanya memiliki satu payroll record per payroll period.
- **DATA-022** — Payroll calculation harus menghasilkan revision yang dapat ditelusuri.
- **DATA-023** — Generated payroll item terikat pada payroll revision.
- **DATA-024** — Manual payroll adjustment tidak boleh hilang saat generated recalculation.
- **DATA-025** — Payroll item harus dapat ditelusuri ke source bila source tersedia.
- **DATA-026** — Locked payroll tidak boleh dimutasi workflow normal.
- **DATA-027** — Historical source yang direferensikan tidak boleh destructive cascade delete.
- **DATA-028** — Audit event high-risk bersifat append-oriented.
- **DATA-029** — Notification bukan historical source of truth.
- **DATA-030** — Generic system settings tidak boleh menggantikan domain entity penting.
- **DATA-031** — Critical concurrent mutation wajib stale-write protection.
- **DATA-032** — Shift swap harus transactionally atomic.
- **DATA-033** — Schedule publish harus transactionally consistent.
- **DATA-034** — Payroll calculate/finalize/lock harus transactionally safe.
- **DATA-035** — Derived projection harus dapat direbuild dari source of truth.
- **DATA-036** — Business date dan audit timestamp menggunakan semantics berbeda.
- **DATA-037** — Effective dating menggunakan consistent half-open interval semantics.
- **DATA-038** — Historical employee tetap dapat direferensikan payroll/report walaupun inactive.
- **DATA-039** — Role/access mutation yang high-risk harus memiliki actor + audit.
- **DATA-040** — Last Administrator Guard harus dapat ditegakkan secara transaction-safe.
- **DATA-041** — Foreign key digunakan untuk relation business-critical kecuali ada alasan eksplisit.
- **DATA-042** — Hard delete hanya untuk record yang aman secara historical dan referential.
- **DATA-043** — Payroll source correction tidak mengubah locked revision otomatis.
- **DATA-044** — Published schedule correction menghasilkan version/history yang reconstructable.
- **DATA-045** — Snapshot finansial harus menyimpan nilai yang benar-benar digunakan calculation.
- **DATA-046** — Stable identifiers tidak bergantung pada display label.
- **DATA-047** — Approval record wajib menyimpan state transition, bukan boolean tunggal.
- **DATA-048** — Cache/read model bukan canonical source of truth.
- **DATA-049** — Critical mutation retry tidak boleh menghasilkan duplicate business effect.
- **DATA-050** — Semua migration harus mempertahankan historical integrity sebagai acceptance requirement.

---

# 28. Critical Database Acceptance Tests

Minimal automated integration/contract tests:

| Test | Expected |
|---|---|
| Create duplicate role code | Rejected |
| Duplicate primary assignment same version/employee/date | Rejected |
| S3 cross-midnight save | One assignment, correct start/end |
| Overlapping salary version | Rejected |
| Overlapping incentive version | Rejected |
| Rename shift after historical assignment | Historical rendering remains correct |
| Change incentive after locked payroll | Locked amount unchanged |
| Disable employee | Historical schedule/payroll remains queryable |
| Recalculate payroll | New result does not duplicate generated items |
| Recalculate with manual adjustment | Manual adjustment preserved |
| Concurrent schedule stale edit | Conflict, no silent overwrite |
| Concurrent request approval | Only one valid transition wins |
| Shift swap partial failure | Entire swap rolled back |
| Publish schedule failure mid-operation | No half-published state |
| Lock payroll failure mid-operation | No partial lock state |
| Delete referenced shift type | Rejected/archive required |
| Delete referenced employee | Rejected/inactivate required |
| Audit high-risk mutation | Event created with actor/action/entity |
| Permission direct API bypass attempt | Mutation denied server-side |
| Last Administrator removal | Rejected when it would leave zero active admins |

---

# 29. ORM / Schema Design Guidance

Saat ORM dipilih nanti:

- jangan membiarkan ORM cascade default menentukan business deletion semantics,
- migration harus eksplisit,
- enum harus dipertimbangkan terhadap kebutuhan evolusi,
- unique/index names sebaiknya konsisten,
- transaction boundary jangan disembunyikan di UI layer,
- query historical harus bisa dilakukan tanpa raw JSON parsing sebagai requirement utama.

---

# 30. Open Decisions for PRD-14 / Implementation

Hal berikut sengaja belum dikunci di PRD-08:

1. PostgreSQL vs relational provider lain.
2. UUID vs UUIDv7 vs ULID vs database-generated integer IDs.
3. ORM/query builder.
4. Native database enum vs application enum.
5. Exclusion constraint implementation untuk effective range.
6. Materialized view vs normal query untuk dashboard projections.
7. Authentication/session table implementation.
8. Exact backup provider.
9. Exact row-version mechanism.
10. Exact migration tooling.

Keputusan tersebut tidak boleh mengubah business semantics yang sudah dikunci di PRD-01 sampai PRD-08.

---

# 31. Definition of Done — PRD-08

Data architecture dianggap memenuhi PRD-08 jika:

- seluruh domain penting memiliki entity ownership jelas,
- User dan Employee dipisahkan secara benar,
- role/permission model mendukung capability + scope,
- shift config menggunakan stable identity + version,
- schedule period/version/assignment dapat direkonstruksi historical,
- cross-midnight dan work-date semantics terjaga,
- exception tidak menghapus planned schedule,
- salary dan incentive effective-dated,
- payroll memiliki record + revision + item + adjustment separation,
- locked payroll immutable dari workflow normal,
- audit high-risk append-oriented,
- foreign key/deletion semantics aman,
- soft-delete/archive policy jelas,
- concurrency dan transaction requirement ditentukan,
- baseline indexing direction ditentukan,
- database constraints melindungi invariants penting,
- schema siap diterjemahkan menjadi migration pada PRD Technical Architecture.

---

# 32. Relationship to Next PRD

PRD-08 menjawab **bagaimana business data disusun dan dijaga**.

Dokumen berikutnya, **PRD-09 — Audit Trail & Historical Data**, akan memperdalam:

- taxonomy audit event,
- before/after representation,
- actor attribution,
- historical timeline,
- schedule history UX contract,
- payroll history UX contract,
- security/access history,
- correction vs mutation semantics,
- retention dan audit-query behavior.

PRD-09 tidak boleh mengganti entity model PRD-08 tanpa alasan dan migration impact yang terdokumentasi.
