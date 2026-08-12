# PRD-09 — Audit Trail & Historical Data

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Audit Trail & Historical Data  
> **Document ID:** PRD-09  
> **Status:** Draft — Audit & History Source of Truth  
> **Depends On:** PRD-01 through PRD-08  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **audit trail, business history, historical reconstruction, event taxonomy, before/after capture, actor attribution, reason policy, correlation, retention, access, redaction, dan user-facing historical experience** untuk NOCScheduler.

PRD-09 menjadi source of truth untuk menjawab:

> **“Siapa melakukan apa, kapan perubahan terjadi, apa nilai sebelumnya, apa nilai sesudahnya, mengapa perubahan dilakukan, record lain apa yang ikut terdampak, dan bagaimana NOCScheduler tetap dapat menjelaskan kondisi historis secara benar?”**

Dokumen ini harus menjadi acuan untuk:

- audit event service,
- business history timeline,
- schedule revision history,
- exception/request history,
- compensation history,
- payroll revision history,
- role/permission history,
- settings history,
- database design,
- API contract,
- UI Activity History,
- security investigation,
- operational troubleshooting,
- automated contract tests,
- historical regression tests.

Audit trail bukan pengganti canonical business data. Schedule version, compensation version, payroll revision, request state, dan record historis lain tetap harus dimodelkan sebagai business record sesuai PRD-08.

Audit trail berfungsi untuk **menjelaskan perubahan terhadap business record tersebut**, bukan menjadi satu-satunya tempat menyimpan fakta bisnis.

---

# 2. Core Principles

## AH-P01 — History Is a Product Feature

Histori bukan sekadar log developer.

User yang berhak harus dapat menjawab pertanyaan seperti:

- siapa mengubah shift saya,
- kapan perubahan terjadi,
- shift sebelumnya apa,
- siapa menyetujui request,
- kapan salary berubah,
- nominal lama dan baru berapa,
- payroll dihitung ulang berapa kali,
- siapa melakukan finalization atau lock,
- siapa mengubah role atau permission.

Karena itu histori harus dirancang sebagai bagian dari UX dan business model.

---

## AH-P02 — Business History and Audit Trail Are Related but Different

NOCScheduler membedakan:

### Business History

Representasi perubahan yang mudah dipahami manusia.

Contoh:

> **Schedule changed**  
> Budi — 12 Aug 2026  
> Shift 2 → Shift 3  
> Changed by Arief · 11 Aug 2026 18:45

### Audit Event

Record sistem yang lebih lengkap dan terstruktur.

Contoh conceptual data:

```text
event_type: schedule.assignment.changed
actor_id: ...
subject_type: employee
subject_id: ...
resource_type: shift_assignment
resource_id: ...
before: {...}
after: {...}
reason: "Emergency coverage"
correlation_id: ...
occurred_at: ...
```

Business History boleh dibentuk dari audit event + canonical business data, tetapi tidak boleh menghilangkan audit evidence yang diperlukan.

---

## AH-P03 — Append-Oriented Audit

Audit event penting bersifat append-oriented.

Workflow aplikasi normal tidak boleh:

- mengedit event lama,
- mengganti actor event lama,
- mengganti timestamp event lama,
- menghapus event untuk menyembunyikan perubahan.

Jika audit event salah akibat bug atau migration, correction harus dilakukan melalui controlled administrative process dan meninggalkan jejak koreksi.

---

## AH-P04 — No Silent Mutation

Setiap perubahan signifikan terhadap jadwal, exception, compensation, payroll, access, atau konfigurasi harus menghasilkan audit evidence.

Jika mutation berhasil tetapi audit event wajib gagal ditulis, transaksi high-risk harus diperlakukan sebagai gagal atau menggunakan mekanisme durable event/outbox yang menjamin audit akhirnya tetap tercatat.

Implementasi final ditentukan PRD technical architecture, tetapi **tidak boleh ada successful high-risk mutation tanpa trace**.

---

## AH-P05 — Historical Facts Must Remain Reconstructable

Audit trail tidak boleh bergantung pada current display value untuk menjelaskan masa lalu.

Contoh:

- Employee mengganti nama,
- Shift 3 mengganti label,
- incentive rate berubah,
- role di-rename.

Historical event harus tetap dapat menjelaskan nilai yang berlaku saat event terjadi melalui snapshot, stable identifier, atau version reference.

---

## AH-P06 — Actor Attribution Is Mandatory

Perubahan harus dapat diatribusikan kepada actor.

Actor dapat berupa:

- human user,
- system process,
- migration/backfill,
- scheduled job,
- integration di masa depan.

Event tidak boleh sekadar memiliki `updated_at` tanpa menjelaskan siapa atau proses apa yang menyebabkan perubahan penting.

---

## AH-P07 — Reason Is Required When Context Matters

Tidak semua perubahan membutuhkan alasan manual.

Contoh perubahan biasa:

- membuat draft schedule,
- memperbarui display preference.

Namun reason wajib untuk high-risk atau exceptional action, termasuk baseline:

- retroactive published schedule correction,
- override warning tertentu,
- payroll manual adjustment,
- payroll unlock,
- retroactive compensation correction,
- permission escalation tertentu,
- administrative correction terhadap historical record.

Reason harus disimpan sebagai data terpisah, bukan hanya tercampur di free-form technical log.

---

## AH-P08 — Audit Is Not a Secret Debug Dump

Audit event tidak boleh menyimpan informasi sensitif yang tidak perlu seperti:

- plaintext password,
- password hash,
- session token,
- API secret,
- raw authentication credential,
- secret environment variable.

Jika payload mutation mengandung field sensitif, audit serializer harus melakukan redaction/allow-list.

---

## AH-P09 — Correlate Multi-Step Operations

Satu business action dapat menghasilkan banyak perubahan record.

Contoh `Publish Schedule` dapat:

- membuat schedule version,
- mengubah assignment state,
- menghasilkan notification,
- menandai downstream payroll source berubah.

Semua event terkait harus dapat dihubungkan menggunakan `correlation_id` atau equivalent identifier.

---

## AH-P10 — Time Must Be Unambiguous

Audit timestamp disimpan sebagai absolute timestamp, direkomendasikan UTC.

UI menampilkan dalam timezone aplikasi, baseline:

`Asia/Jakarta`

Jika historical view menampilkan business date dan event timestamp sekaligus, keduanya tidak boleh dicampur.

Contoh:

- Work Date: `12 Aug 2026`
- Changed At: `11 Aug 2026 18:45 WIB`

---

## AH-P11 — Current State and Historical State Are Different Queries

Current record menjawab:

> “Sekarang nilainya apa?”

History menjawab:

> “Bagaimana kita sampai ke nilai ini?”

Historical reconstruction menjawab:

> “Apa yang diketahui/berlaku pada titik waktu atau revision tertentu?”

Ketiga kebutuhan ini tidak boleh dipaksa menggunakan satu query/view yang ambigu.

---

## AH-P12 — Locked Payroll History Has Strongest Integrity

Payroll `LOCKED` adalah historical business record dengan proteksi tertinggi.

Audit event setelah lock boleh menunjukkan bahwa source schedule atau configuration dikoreksi, tetapi locked payroll tidak boleh berubah diam-diam.

Jika unlock dilakukan:

- reason wajib,
- actor wajib,
- event unlock wajib,
- previous lock metadata harus dipertahankan,
- recalculation berikutnya menghasilkan revision baru.

---

# 3. Historical Layers

NOCScheduler memiliki beberapa layer historical yang saling melengkapi.

## 3.1 Canonical Business History

Record versi/revision yang menjadi fakta bisnis.

Contoh:

- `shift_type_versions`
- `schedule_versions`
- `employee_salary_versions`
- `shift_incentive_versions`
- `payroll_revisions`
- request state/history bila dimodelkan terpisah

Record ini digunakan engine untuk perhitungan dan reconstruction.

---

## 3.2 Audit Event History

Event append-oriented yang menjelaskan mutation atau state transition.

Contoh:

- salary version created,
- schedule published,
- request approved,
- payroll recalculated,
- permission assigned.

---

## 3.3 User-Facing Timeline

Projection yang mengubah event teknis menjadi timeline yang mudah dibaca.

Contoh:

```text
12 Aug 2026
18:45 — Arief changed Budi's Shift 2 to Shift 3 for 13 Aug.
18:47 — Schedule version 4 published.
18:47 — Budi was notified about the schedule change.
```

Timeline boleh menggabungkan beberapa audit event ke satu presentation group jika masih akurat.

---

## 3.4 Historical Snapshot

Nilai tertentu yang disimpan untuk mencegah drift.

Contoh:

- payroll rate snapshot,
- salary amount snapshot,
- shift label/time snapshot pada published revision,
- before/after payload pada audit event.

Snapshot bukan alasan untuk menduplikasi seluruh database secara liar. Hanya nilai yang diperlukan untuk explainability dan integrity yang harus disimpan.

---

# 4. Audit Event Model

## 4.1 Recommended `audit_events`

Minimum conceptual fields:

- `id`
- `event_type`
- `event_version`
- `domain`
- `action`
- `severity`
- `actor_type`
- `actor_user_id` nullable
- `actor_label_snapshot`
- `subject_type` nullable
- `subject_id` nullable
- `subject_label_snapshot` nullable
- `resource_type`
- `resource_id`
- `resource_version_id` nullable
- `parent_resource_type` nullable
- `parent_resource_id` nullable
- `before_data` nullable
- `after_data` nullable
- `changed_fields` nullable
- `reason` nullable
- `reason_code` nullable
- `correlation_id`
- `request_id` / trace identifier nullable
- `source`
- `occurred_at`
- `business_date` nullable
- `metadata` nullable
- integrity fields if implementation uses them

---

## 4.2 Event ID

Audit event harus memiliki stable unique identifier.

ID final dapat UUID/ULID atau database-native identifier sesuai PRD-14.

ID tidak boleh bergantung pada display order UI.

---

## 4.3 Event Type Naming

Gunakan stable machine-readable naming convention.

Recommended format:

```text
<domain>.<resource>.<action>
```

Contoh:

```text
schedule.assignment.created
schedule.assignment.changed
schedule.period.published
exception.request.approved
exception.replacement.created
compensation.salary.changed
compensation.incentive.changed
payroll.record.calculated
payroll.record.finalized
payroll.record.locked
payroll.record.unlocked
access.role.assigned
access.permission.changed
employee.profile.updated
settings.general.changed
```

Event type adalah contract. Rename sembarangan setelah production harus dihindari.

---

## 4.4 Event Version

Event schema dapat berkembang.

Karena itu setiap event direkomendasikan memiliki `event_version`.

Contoh:

```text
event_type = schedule.assignment.changed
event_version = 1
```

Consumer historical tidak boleh mengasumsikan semua event selamanya memiliki payload identik.

---

## 4.5 Domain

Recommended domain values:

- `IDENTITY`
- `EMPLOYEE`
- `ACCESS`
- `SCHEDULE`
- `EXCEPTION`
- `COMPENSATION`
- `PAYROLL`
- `SETTINGS`
- `NOTIFICATION`
- `SYSTEM`

---

## 4.6 Action

Recommended action vocabulary:

- `CREATE`
- `UPDATE`
- `DELETE` untuk permitted non-historical object
- `ARCHIVE`
- `ACTIVATE`
- `DEACTIVATE`
- `PUBLISH`
- `APPROVE`
- `REJECT`
- `CANCEL`
- `CALCULATE`
- `FINALIZE`
- `LOCK`
- `UNLOCK`
- `ASSIGN`
- `REVOKE`
- `OVERRIDE`
- `CORRECT`

Action vocabulary harus cukup stabil agar filtering UI tidak bergantung pada parsing message text.

---

# 5. Actor Model

## 5.1 Human User

Jika mutation berasal dari user yang login:

- `actor_type = USER`
- simpan stable user reference,
- simpan actor display snapshot jika diperlukan untuk historical display.

Jika user kemudian dinonaktifkan atau berganti nama, event lama tetap dapat ditampilkan.

---

## 5.2 System Actor

Untuk automation internal:

`actor_type = SYSTEM`

Contoh:

- automatic payroll dirty marking,
- scheduled notification dispatch,
- maintenance process.

System event harus mempunyai source/process label yang jelas.

---

## 5.3 Migration / Backfill Actor

Migration atau data import yang memengaruhi business record harus distinguishable.

Contoh:

`actor_type = MIGRATION`

Metadata minimal:

- migration identifier,
- deployment/version jika tersedia,
- timestamp.

Jangan berpura-pura migration dilakukan oleh administrator manusia tertentu jika tidak benar.

---

## 5.4 Impersonation Future Guardrail

Jika aplikasi di masa depan mendukung impersonation/support mode, audit harus menyimpan:

- effective actor,
- original actor.

Baseline MVP tidak membutuhkan impersonation.

---

# 6. Subject and Resource Model

## 6.1 Resource

Resource adalah record utama yang berubah.

Contoh:

- shift assignment,
- payroll record,
- salary version,
- role assignment.

---

## 6.2 Subject

Subject adalah pihak bisnis utama yang terdampak.

Sering kali berupa employee.

Contoh:

- Resource: `shift_assignment`
- Subject: `employee/Budi`

Ini mempermudah query:

> “Tampilkan semua perubahan yang pernah berdampak ke Budi.”

---

## 6.3 Parent Resource

Event detail boleh mereferensikan parent context.

Contoh:

- assignment belongs to schedule period,
- payroll item belongs to payroll record,
- request belongs to employee/work date.

Parent reference mempermudah contextual history tanpa denormalisasi berlebihan.

---

# 7. Before / After Capture

## 7.1 When Before/After Is Required

Before/after wajib untuk perubahan state penting seperti:

- published assignment correction,
- salary change,
- incentive rate change,
- payroll manual adjustment update,
- role/permission change,
- high-impact settings change.

Create event dapat memiliki:

- `before = null`
- `after = created snapshot`

Delete/archive event dapat memiliki:

- `before = previous snapshot`
- `after = null` atau archived snapshot sesuai model.

---

## 7.2 Changed Fields

Sistem direkomendasikan menyimpan daftar field yang berubah.

Contoh:

```text
changed_fields = ["shift_type_version_id", "start_at", "end_at"]
```

UI dapat menggunakannya untuk menampilkan diff compact.

---

## 7.3 Allow-Listed Snapshot

Before/after payload harus menggunakan allow-list field per event/resource.

Jangan serialisasi object ORM lengkap secara otomatis.

Tujuan:

- menghindari secret leakage,
- menghindari payload raksasa,
- menjaga event schema stabil,
- membuat histori mudah dibaca.

---

## 7.4 Human-Readable Diff

UI tidak boleh menampilkan JSON mentah sebagai pengalaman default.

Contoh presentation:

```text
Shift
Shift 2 → Shift 3

Time
15:00–23:00 → 23:00–07:00
```

Raw structured detail dapat tersedia untuk admin/debug context jika permission mengizinkan.

---

# 8. Reason Policy

## 8.1 Optional Reason

Reason boleh optional untuk routine operation yang sudah jelas dari action.

Contoh:

- create draft schedule,
- normal profile edit.

---

## 8.2 Required Reason

Reason wajib minimal untuk:

1. retroactive published schedule correction,
2. warning override yang memiliki operational risk,
3. payroll manual earning/deduction,
4. payroll unlock,
5. retroactive salary/incentive correction,
6. access escalation yang dikategorikan high-risk,
7. historical administrative correction,
8. forced cancellation/reversal jika workflow mendukung.

---

## 8.3 Reason Code + Note

Untuk action tertentu direkomendasikan kombinasi:

- structured `reason_code`,
- optional/required free-text `reason`.

Contoh:

```text
reason_code = EMERGENCY_COVERAGE
reason = "Budi sakit mendadak"
```

Structured code memudahkan reporting; free-text memberi konteks manusia.

---

# 9. Correlation and Causality

## 9.1 Correlation ID

Setiap top-level mutation request direkomendasikan memiliki correlation ID.

Semua audit event downstream yang berasal dari action yang sama membawa ID tersebut.

---

## 9.2 Example — Schedule Publish

Satu click `Publish` dapat menghasilkan:

```text
schedule.period.published
schedule.assignment.activated x N
notification.schedule.queued x N
payroll.source.changed x affected periods, if applicable
```

Event tersebut memiliki correlation ID sama.

User-facing Activity History dapat menampilkan satu group:

> **Schedule August 2026 published**  
> 31 assignments activated · 10 employees notified

---

## 9.3 Causation Reference

Jika satu event secara langsung dipicu event lain, implementation boleh menyimpan `causation_event_id`.

Contoh:

- schedule correction → payroll marked dirty.

Ini enhancement yang sangat direkomendasikan untuk debugging, tetapi correlation ID adalah baseline yang lebih penting.

---

# 10. Schedule History

## 10.1 Draft History

Draft schedule dapat memiliki lighter audit density dibanding published schedule.

Baseline wajib mencatat minimal:

- draft created,
- bulk operation signifikan,
- draft deleted/archived jika diperbolehkan,
- publish.

Fine-grained setiap cell draft edit boleh disimpan bila implementasi efisien, tetapi tidak wajib menjadi user-facing global activity noise.

---

## 10.2 Published Schedule History

Published schedule memiliki audit requirement lebih kuat.

Wajib mencatat:

- publish,
- republish/new revision,
- assignment correction,
- employee affected,
- work date,
- before shift/state,
- after shift/state,
- actor,
- timestamp,
- reason jika correction retroactive/exceptional,
- validation override jika ada,
- correlation.

---

## 10.3 Assignment Timeline

Dari employee/date context, sistem harus dapat menampilkan timeline seperti:

```text
10 Aug 09:00 — Scheduled Shift 2 by Scheduler A
11 Aug 18:45 — Changed Shift 2 → Shift 3 by Scheduler B
11 Aug 18:47 — Schedule revision published
12 Aug 20:10 — Sick exception approved
12 Aug 20:15 — Replacement assigned to Andi
```

Planned history dan operational exception harus dapat dibaca dalam satu chronology tanpa kehilangan domain separation.

---

## 10.4 Schedule Reconstruction

Historical reconstruction harus dapat menjawab:

- schedule version apa yang dipublish,
- assignment apa yang terdapat pada revision tersebut,
- perubahan apa yang terjadi setelahnya,
- current effective operational projection apa.

Audit event membantu menjelaskan transition, tetapi schedule version tetap canonical source untuk reconstruction.

---

# 11. Exception and Request History

## 11.1 State Transitions

Setiap transition wajib tercatat:

```text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED
APPROVED → SUPERSEDED
```

Minimum audit detail:

- request,
- requester,
- affected employee/date,
- old state,
- new state,
- actor/approver,
- timestamp,
- reason/approval note bila relevan.

---

## 11.2 Replacement History

Replacement event harus dapat menjelaskan:

- original employee,
- original assignment,
- replacement employee,
- effective date/shift,
- actor,
- source request/exception,
- approval.

---

## 11.3 Shift Swap History

Shift swap adalah atomic business operation.

Audit harus merepresentasikan satu parent swap event dan perubahan assignment terkait dalam correlation yang sama.

Jangan membuat histori terlihat seperti dua edit independen jika sebenarnya satu swap atomic.

---

## 11.4 Overtime History

Wajib mencatat minimal:

- employee,
- date/time or duration,
- source/request,
- status transition,
- approved duration,
- payroll eligibility/treatment reference jika berlaku.

Perubahan approved overtime yang memengaruhi payroll harus memicu payroll freshness awareness sesuai PRD-04/05.

---

# 12. Compensation History

## 12.1 Salary History

Setiap salary version wajib memiliki historical visibility.

User yang memiliki access sesuai policy dapat melihat:

- effective from,
- effective to,
- amount,
- created by,
- created at,
- superseded by/version relation bila ada,
- reason untuk retroactive correction.

---

## 12.2 Incentive History

Untuk setiap shift incentive:

- shift identity,
- rate,
- effective range,
- actor,
- timestamp,
- change reason jika diperlukan.

UI harus membedakan:

> “rate configuration changed”

dari:

> “historical payroll amount changed”.

Yang pertama tidak otomatis menyebabkan yang kedua.

---

## 12.3 No Destructive Overwrite

Salary/incentive history yang sudah menjadi source historical tidak boleh ditimpa agar timeline terlihat lebih sederhana.

Correction harus membentuk version atau explicit correction flow sesuai data model.

---

# 13. Payroll History

## 13.1 Calculation History

Setiap calculation/recalculation wajib mencatat:

- payroll period,
- employee or bulk scope,
- revision generated,
- actor,
- timestamp,
- previous revision reference jika ada,
- source freshness state,
- calculation result status.

---

## 13.2 Revision History

Payroll detail harus dapat menunjukkan revision chronology.

Contoh:

```text
Revision 1 — Calculated 30 Aug
Revision 2 — Recalculated 31 Aug after schedule correction
Revision 3 — Finalized 1 Sep
Revision 3 — Locked 1 Sep
```

Finalization/lock tidak selalu harus menciptakan calculation revision baru jika angka tidak berubah; state transition tetap harus diaudit.

---

## 13.3 Manual Adjustment History

Setiap manual adjustment wajib mencatat:

- type,
- amount,
- reason,
- actor,
- created_at,
- any allowed modification before lock,
- before/after jika changed,
- deletion/cancellation event jika policy mengizinkan.

Adjustment tidak boleh hilang dari history hanya karena kemudian dibatalkan.

---

## 13.4 Finalization History

Wajib mencatat:

- finalized by,
- finalized at,
- revision finalized,
- relevant validation state.

Jika finalization dibatalkan melalui exceptional workflow, reversal harus diaudit.

---

## 13.5 Lock History

Wajib mencatat:

- lock actor,
- lock timestamp,
- locked revision,
- source snapshot/reference.

---

## 13.6 Unlock History

Unlock adalah high-risk event.

Wajib memiliki:

- actor,
- timestamp,
- reason,
- previous lock metadata,
- affected payroll period/records,
- authorization context if useful,
- correlation ID.

Unlock history tidak boleh dihapus setelah payroll dikunci ulang.

---

## 13.7 Locked Historical Stability

Jika setelah payroll locked terjadi:

- schedule correction,
- salary correction,
- incentive correction,
- exception correction,

maka history harus dapat menunjukkan source berubah setelah lock, tetapi locked revision tetap menunjukkan hasil saat dikunci.

---

# 14. Access and Permission History

## 14.1 Role Assignment

Wajib audit:

- role assigned,
- role revoked,
- scope changed,
- effective date changed,
- actor,
- target user,
- reason jika policy mengharuskan.

---

## 14.2 Role Definition Change

Jika role bundle berubah:

- permission added,
- permission removed,
- role archived,

perubahan harus dapat ditelusuri.

---

## 14.3 Permission Definition Change

Permission code adalah technical/product contract.

Perubahan permission definition yang tersedia di production harus audited sebagai administrative/system change.

---

## 14.4 High-Risk Access Escalation

Grant permission seperti:

- payroll unlock,
- compensation manage,
- access manage,

harus memiliki visibility lebih tinggi di Activity History dan direkomendasikan reason wajib.

---

## 14.5 Last Administrator Guard Events

Jika sistem menolak action karena akan menghilangkan administrator aktif terakhir, rejected attempt dapat dicatat sebagai security/administrative event bila dianggap bernilai untuk investigation.

Tidak semua rejected authorization request perlu menjadi global user-facing event.

---

# 15. Employee History

## 15.1 Employment Status

Perubahan:

- Active → Inactive,
- Inactive → Active,
- join/effective date,
- termination/inactive effective date,

wajib historical jika memengaruhi schedule/payroll eligibility.

---

## 15.2 Profile Changes

Perubahan non-critical seperti display name dapat diaudit dengan severity lebih rendah.

Historical business view tidak perlu menampilkan setiap cosmetic edit sebagai global activity utama.

---

## 15.3 Account vs Employee

User account dan employee business identity terpisah.

Menonaktifkan login tidak boleh menghapus employee historical timeline.

---

# 16. Settings History

## 16.1 Audited Settings

Minimal high-impact settings berikut wajib audit:

- timezone,
- schedule policy,
- minimum rest configuration,
- coverage rule,
- consecutive shift rule jika aktif,
- payroll period/cutoff policy,
- overtime policy,
- holiday policy,
- notification policy jika berdampak operational awareness.

---

## 16.2 Before/After Settings

Settings mutation harus menyimpan nilai before/after yang relevan.

Jangan hanya menyimpan:

> “Settings updated”.

Audit harus menjelaskan apa yang berubah.

---

## 16.3 Effective-Date Settings

Jika setting berlaku mulai tanggal tertentu, history harus membedakan:

- event ketika config dibuat,
- effective date ketika config mulai berlaku.

---

# 17. Notification History

Notification delivery log berbeda dari audit utama, tetapi event penting dapat dihubungkan.

Contoh:

- schedule changed,
- notification queued,
- notification delivered/read.

Tidak semua `read notification` perlu muncul pada Activity History global.

Notification history terutama membantu menjawab:

> “Apakah user diberi tahu tentang perubahan jadwal ini?”

---

# 18. Severity Model

Recommended severity:

## INFO

Routine event.

Contoh:

- draft created,
- profile updated.

## NOTICE

Business-significant event.

Contoh:

- schedule published,
- request approved.

## WARNING

Exceptional or override event.

Contoh:

- warning override,
- retroactive correction.

## CRITICAL

High-risk administrative/financial event.

Contoh:

- payroll unlock,
- high-risk access escalation,
- integrity correction.

Severity membantu filtering dan UI emphasis, bukan menentukan authorization sendirian.

---

# 19. Activity History UX

## 19.1 Canonical Page

Sesuai PRD-06:

`/activity`

Detail optional:

`/activity/:eventId`

---

## 19.2 Default Activity Feed

Desktop recommended columns/content:

- Time
- Actor
- Action
- Subject
- Resource/context
- Summary
- Severity

Mobile menggunakan timeline/card compact.

---

## 19.3 Filters

Minimum recommended filters:

- date range,
- actor,
- employee/subject,
- domain,
- action,
- severity.

Advanced:

- resource type,
- payroll period,
- schedule period,
- correlation ID,
- high-risk only.

---

## 19.4 Search

Search dapat mencakup:

- employee name,
- actor name,
- event summary,
- resource reference,
- reason.

Search terhadap raw JSON tidak menjadi UX baseline.

---

## 19.5 Event Detail

Event detail direkomendasikan menampilkan:

```text
Header
  Event summary
  Severity
  Timestamp

Actor
  Who performed this action

Affected Context
  Employee / Schedule / Payroll / Request

Change
  Before → After

Reason
  Reason code + note

Related Events
  Same correlation/business operation

Technical Metadata
  Only when permission allows / collapsed by default
```

---

## 19.6 Human-Readable Summary

Summary tidak boleh hanya berupa event code.

Buruk:

`payroll.record.state_updated`

Baik:

> Arief locked August 2026 payroll for Budi.

Event code tetap tersedia sebagai metadata.

---

# 20. Contextual History UX

Global Activity History bukan satu-satunya tempat melihat histori.

## 20.1 Employee Detail

Employee detail dapat memiliki History tab/timeline untuk:

- schedule changes,
- exceptions,
- compensation changes,
- payroll transitions,
- employment/access events sesuai permission.

---

## 20.2 Schedule Cell / Assignment

Inspector dapat memiliki `History` section yang menunjukkan perubahan terhadap employee/work date tersebut.

---

## 20.3 Request Detail

Request detail menampilkan lifecycle timeline.

---

## 20.4 Payroll Detail

Payroll detail menampilkan:

- calculation revision history,
- adjustment history,
- finalization,
- lock/unlock.

---

## 20.5 Settings

High-impact settings dapat memiliki `View History` link untuk configuration key/domain terkait.

---

# 21. Access to Audit Data

## 21.1 Transparency Baseline

Karena produk internal transparan, business history terkait schedule dan payroll dapat tersedia luas sesuai policy.

Namun raw audit metadata atau security-sensitive access event dapat memiliki restriction lebih ketat.

---

## 21.2 Permission Recommendation

Recommended capabilities:

```text
audit.read.business

audit.read.admin

audit.read.security
```

MVP dapat menyederhanakan menjadi dua level:

- business history,
- administrative audit.

Permission final tetap mengikuti PRD-07 capability model.

---

## 21.3 No Client-Side Security

Filter UI bukan access control.

Backend harus memastikan user tidak dapat mengambil restricted audit event hanya dengan mengubah query parameter.

---

# 22. Sensitive Data & Redaction

## 22.1 Never Audit Secrets

Tidak boleh menyimpan:

- password,
- password hash,
- auth token,
- reset token,
- secret key,
- session secret,
- raw credential.

---

## 22.2 Personal Data

Audit hanya menyimpan personal data yang memang diperlukan untuk explainability.

Jangan menyalin seluruh employee record ke setiap event.

---

## 22.3 Historical Labels

Display snapshot seperti employee name dapat disimpan untuk readability, tetapi stable ID tetap harus dipertahankan.

---

## 22.4 Redaction Policy

Audit serializer harus memiliki centralized redaction/allow-list policy.

Jangan mengandalkan developer mengingat satu per satu di setiap endpoint.

---

# 23. Retention & Deletion Policy

## 23.1 Baseline Retention

Karena audit terkait jadwal dan payroll memiliki nilai historical jangka panjang, baseline recommendation adalah **retention jangka panjang selama data bisnis terkait masih dipertahankan**.

Exact retention period final mengikuti kebijakan organisasi dan PRD deployment/security.

---

## 23.2 No Routine User Delete

Tidak ada tombol normal untuk menghapus audit event individual.

---

## 23.3 Data Purge Future Policy

Jika organisasi kelak membutuhkan retention/purge karena compliance atau storage policy:

- purge harus policy-driven,
- high-risk,
- authorization khusus,
- memiliki aggregate purge audit evidence jika memungkinkan,
- tidak boleh merusak referential integrity business record.

---

## 23.4 Employee Deactivation

Menonaktifkan employee/user tidak menghapus audit history.

Historical event tetap visible menggunakan stable reference/snapshot.

---

# 24. Integrity & Tamper Resistance

## 24.1 Application Guard

Normal application account tidak boleh memiliki workflow untuk update/delete audit events.

---

## 24.2 Database Permission Direction

Production deployment direkomendasikan membatasi database permission sehingga application path yang menulis audit hanya dapat insert melalui service/policy yang terkontrol.

Detail implementation ditentukan PRD-14/16.

---

## 24.3 Optional Hash Chaining

Cryptographic hash chaining/signature untuk audit event bukan requirement MVP.

Namun architecture tidak boleh menghalangi penambahan tamper-evidence di masa depan jika organisasi membutuhkannya.

---

## 24.4 Audit Failure Handling

High-risk mutation tidak boleh dianggap sukses jika mandatory audit evidence tidak dapat dijamin durable.

Pilihan implementation:

- same database transaction,
- transactional outbox,
- equivalent durable mechanism.

Tidak diperbolehkan model best-effort seperti:

> update payroll sukses → coba tulis audit → kalau gagal diabaikan.

---

# 25. Transaction Boundaries

## 25.1 Same Business Transaction

Audit event yang menjelaskan mutation wajib berada pada business transaction yang sama atau memiliki durability guarantee ekuivalen.

---

## 25.2 Bulk Operations

Bulk schedule assignment tidak harus membuat satu giant JSON event.

Recommended:

- one parent event untuk bulk action,
- child/detail events untuk affected assignments jika diperlukan,
- shared correlation ID.

---

## 25.3 Partial Failure

Jika bulk operation hanya sebagian berhasil berdasarkan product semantics, audit harus menjelaskan:

- targets requested,
- targets succeeded,
- targets failed,
- reason failure.

Jika business rule mengharuskan atomic, tidak boleh ada success audit untuk mutation yang akhirnya rollback.

---

# 26. Concurrency & Audit

Jika optimistic concurrency menolak stale mutation:

- canonical business record tidak berubah,
- success audit tidak dibuat.

Optional security/diagnostic event boleh mencatat conflict attempt tanpa membuat Activity History global berisik.

Audit event harus mereferensikan revision/version yang benar-benar berhasil diubah.

---

# 27. Failed and Rejected Actions

## 27.1 Not Every Failure Is Audit History

Validation error biasa seperti required field kosong tidak perlu masuk business audit.

---

## 27.2 Security-Relevant Failure

Event seperti berikut dapat masuk security audit:

- repeated forbidden mutation attempt,
- attempted payroll unlock without permission,
- attempted access escalation,
- suspicious authentication event jika security logging diintegrasikan.

Security audit visibility dapat lebih terbatas dari business activity.

---

# 28. Historical Reconstruction Rules

## 28.1 Reconstruct by Business Version

Untuk schedule/payroll/compensation, reconstruction harus mengutamakan versioned canonical record.

Audit digunakan untuk menjelaskan transition.

---

## 28.2 Reconstruct at a Point in Time

Future advanced capability dapat menjawab:

> “Apa state schedule yang diketahui sistem pada 11 Aug pukul 17:00?”

Untuk mendukung ini, event timestamp dan version timeline harus konsisten.

MVP minimal harus dapat merekonstruksi published revisions dan current history chain.

---

## 28.3 Effective Date vs Recorded Date

Historical UI harus dapat membedakan:

- kapan perubahan **direkam**,
- kapan perubahan **berlaku**.

Contoh:

> Salary Rp5.500.000 dibuat pada 20 Aug, efektif 1 Sep.

Jangan menampilkan seolah salary sudah berlaku sejak 20 Aug.

---

## 28.4 Retroactive Record

Jika pada 20 Aug dibuat correction yang efektif 10 Aug:

History harus menjelaskan kedua fakta:

- Recorded At: 20 Aug
- Effective From / Business Date: 10 Aug

Ini penting untuk investigasi payroll dan schedule.

---

# 29. Event Ordering

## 29.1 Primary Ordering

Activity timeline diurutkan berdasarkan `occurred_at`.

---

## 29.2 Same-Timestamp Events

Jika beberapa event memiliki timestamp identik, stable secondary ordering menggunakan event ID/sequence yang deterministic.

---

## 29.3 Business Date Grouping

UI boleh mengelompokkan berdasarkan business date untuk schedule context, tetapi tidak boleh mengubah chronological audit ordering secara ambigu.

---

# 30. Event Summary Generation

## 30.1 Structured Template

Human-readable summary direkomendasikan dibentuk dari structured event type + snapshot fields.

Jangan hanya menyimpan satu message string tanpa structured fields.

---

## 30.2 Historical Resilience

Summary lama harus tetap render meskipun current resource di-archive/inactive.

Gunakan actor/subject label snapshot bila diperlukan.

---

## 30.3 Localization

Event data harus language-neutral sebisa mungkin.

UI dapat merender summary Bahasa Indonesia atau bahasa lain berdasarkan localization layer.

Jangan menyimpan satu-satunya source sebagai sentence Bahasa Indonesia hardcoded di database.

---

# 31. Pagination & Performance

Activity history dapat tumbuh besar.

Backend harus mendukung:

- pagination/cursor,
- date range filter,
- indexed actor/domain/resource/subject filters,
- bounded query.

Jangan load seluruh audit history ke browser sekaligus.

Index final mengikuti PRD-08/14.

---

# 32. Export

Administrative user dapat memiliki export audit history jika dibutuhkan.

Recommended future formats:

- CSV,
- JSON structured export untuk investigation.

Export harus mengikuti permission dan redaction yang sama dengan API/UI.

Audit export tidak otomatis menjadi MVP requirement.

---

# 33. Observability vs Audit

Technical observability log dan business audit berbeda.

## Audit

Menjawab:

> “Siapa mengubah payroll ini?”

## Application Log

Menjawab:

> “Mengapa request API ini gagal?”

## Metrics

Menjawab:

> “Berapa banyak calculation yang gagal hari ini?”

Ketiganya boleh saling terhubung melalui request/correlation ID, tetapi jangan menggunakan application log sebagai satu-satunya audit trail.

---

# 34. MVP Audit Scope

## P0 — Mandatory

MVP wajib audit:

### Schedule

- schedule publish,
- published assignment correction,
- high-risk override.

### Requests / Exceptions

- request created/submitted,
- approved,
- rejected,
- cancelled,
- replacement assignment,
- shift swap,
- overtime approval jika aktif.

### Compensation

- salary version create/change,
- incentive version create/change.

### Payroll

- calculation/recalculation,
- adjustment create/change/cancel,
- finalize,
- lock,
- unlock.

### Access

- role assignment/revocation,
- high-risk permission change,
- user activate/deactivate.

### Settings

- high-impact scheduling/payroll settings.

---

## P1 — High Value

- full draft schedule operation grouping,
- notification delivery correlation,
- detailed employee profile history,
- security audit views,
- audit export.

---

## P2 — Enhancement

- point-in-time arbitrary reconstruction,
- cryptographic tamper evidence,
- external immutable audit sink,
- advanced anomaly detection.

---

# 35. Required Event Catalog — MVP Baseline

Minimum event types:

```text
employee.status.changed
employee.profile.updated

access.role.assigned
access.role.revoked
access.role.permissions_changed
access.user.activated
access.user.deactivated

schedule.draft.created
schedule.period.published
schedule.assignment.changed
schedule.assignment.override_applied

exception.request.submitted
exception.request.approved
exception.request.rejected
exception.request.cancelled
exception.replacement.created
exception.shift_swap.completed
exception.overtime.approved

compensation.salary.version_created
compensation.salary.corrected
compensation.incentive.version_created
compensation.incentive.corrected

payroll.record.calculated
payroll.record.recalculated
payroll.adjustment.created
payroll.adjustment.changed
payroll.adjustment.cancelled
payroll.record.finalized
payroll.record.locked
payroll.record.unlocked

settings.schedule.changed
settings.payroll.changed
settings.holiday.changed

system.migration.applied
```

Catalog boleh bertambah. Existing event semantics tidak boleh berubah diam-diam.

---

# 36. Business Rules

## AUD-001

Audit event high-risk harus append-oriented dan tidak dapat diedit melalui workflow normal.

## AUD-002

Successful high-risk mutation wajib memiliki durable audit evidence.

## AUD-003

Audit bukan canonical replacement untuk versioned business records.

## AUD-004

Every significant mutation must identify an actor type.

## AUD-005

Human mutation harus menyimpan stable actor reference bila tersedia.

## AUD-006

System/migration action tidak boleh disamarkan sebagai human actor.

## AUD-007

Published schedule correction wajib menyimpan before/after.

## AUD-008

Retroactive published schedule correction wajib reason.

## AUD-009

Salary correction wajib historical version/reference dan audit event.

## AUD-010

Incentive correction wajib historical version/reference dan audit event.

## AUD-011

Payroll manual adjustment wajib amount, actor, reason, dan history.

## AUD-012

Payroll finalization wajib audit event.

## AUD-013

Payroll lock wajib audit event.

## AUD-014

Payroll unlock wajib reason dan audit event.

## AUD-015

Locked payroll tidak boleh berubah karena source correction tanpa explicit unlock/revision workflow.

## AUD-016

Role assignment dan revocation wajib diaudit.

## AUD-017

High-risk permission change wajib before/after atau equivalent structured diff.

## AUD-018

Audit payload tidak boleh menyimpan password, token, atau secret.

## AUD-019

Before/after serialization menggunakan allow-list/redaction policy.

## AUD-020

Related events dalam satu business operation harus dapat dikorelasikan.

## AUD-021

Rollback transaction tidak boleh menghasilkan success audit untuk mutation yang tidak terjadi.

## AUD-022

Work date dan event timestamp harus disimpan sebagai konsep berbeda.

## AUD-023

UI harus menampilkan event timestamp dalam timezone aplikasi secara jelas.

## AUD-024

Historical event harus tetap readable jika actor/subject sekarang inactive.

## AUD-025

Employee deactivation tidak menghapus history.

## AUD-026

Compensation version lama tidak boleh destructive overwrite setelah direferensikan history.

## AUD-027

Audit UI tidak menampilkan raw JSON sebagai default experience.

## AUD-028

Event type harus machine-readable dan stabil.

## AUD-029

Event payload schema direkomendasikan versioned.

## AUD-030

Routine validation failure tidak wajib masuk business audit.

## AUD-031

Security-relevant denied action dapat masuk restricted security audit.

## AUD-032

Global Activity History harus mendukung filter date, actor, domain, dan subject.

## AUD-033

Contextual schedule history harus dapat difilter berdasarkan employee/work date.

## AUD-034

Payroll history harus menunjukkan calculation revision chronology.

## AUD-035

Request history harus menunjukkan setiap meaningful state transition.

## AUD-036

Shift swap harus dapat dipahami sebagai satu correlated business action.

## AUD-037

Bulk operation tidak boleh menghasilkan unbounded giant JSON event sebagai satu-satunya evidence.

## AUD-038

Settings high-impact wajib menyimpan nilai before/after yang relevan.

## AUD-039

Effective date dan recorded timestamp harus dapat dibedakan di historical UI.

## AUD-040

Retroactive correction harus menunjukkan tanggal pencatatan dan tanggal efektif/business date.

## AUD-041

History access harus tetap mengikuti backend authorization.

## AUD-042

Restricted audit metadata tidak boleh bocor melalui direct API query.

## AUD-043

Audit retention tidak boleh lebih pendek secara diam-diam daripada business record historical yang masih memerlukan explainability.

## AUD-044

Tidak ada normal user action untuk delete individual audit event.

## AUD-045

Cached activity projection bukan source of truth dan harus dapat direbuild.

## AUD-046

Current display name tidak boleh menjadi satu-satunya cara mengidentifikasi historical actor/subject.

## AUD-047

Event ordering harus deterministic.

## AUD-048

Audit failure untuk high-risk mutation tidak boleh diabaikan sebagai best-effort logging failure.

## AUD-049

Application logs tidak boleh dianggap pengganti business audit trail.

## AUD-050

Semua MVP domain yang memengaruhi jadwal, payroll, compensation, atau access harus memiliki minimum audit catalog sebelum production release.

---

# 37. Critical Acceptance Test Matrix

| ID | Scenario | Expected Result |
|---|---|---|
| AT-01 | Published Shift 2 diubah menjadi Shift 3 | Audit menyimpan employee, work date, before S2, after S3, actor, timestamp |
| AT-02 | Retroactive schedule correction tanpa reason | Mutation ditolak jika policy mewajibkan reason |
| AT-03 | Schedule correction transaction rollback | Tidak ada success audit event |
| AT-04 | Salary baru efektif bulan depan | History menunjukkan recorded date dan effective date berbeda |
| AT-05 | Incentive rate berubah | Old rate tetap visible di historical version/payroll snapshot |
| AT-06 | Payroll recalculated | Revision baru dan recalculation event tercatat |
| AT-07 | Manual deduction dibuat | Amount + reason + actor tercatat |
| AT-08 | Payroll locked | Lock actor/timestamp/revision tercatat |
| AT-09 | Payroll unlock tanpa reason | Ditolak |
| AT-10 | Payroll unlocked dan recalculated | Unlock + new revision chronology visible |
| AT-11 | Source schedule berubah setelah locked payroll | Source history berubah, locked amount tidak berubah |
| AT-12 | Role scheduler diberikan ke user | Role assignment event tercatat |
| AT-13 | High-risk permission dicabut | Before/after permission state dapat ditelusuri |
| AT-14 | Employee dinonaktifkan | Historical event lama tetap readable |
| AT-15 | Actor mengganti nama | Event lama tetap memiliki stable actor identity dan readable label |
| AT-16 | Mutation payload berisi password/token | Secret tidak muncul pada audit payload |
| AT-17 | Shift swap berhasil | Parent/correlated history menunjukkan dua sisi swap sebagai satu operation |
| AT-18 | Shift swap gagal atomic validation | Tidak ada success audit mutation |
| AT-19 | Request PENDING → APPROVED | Old/new state + approver tercatat |
| AT-20 | Request PENDING → REJECTED | Transition dan actor tercatat |
| AT-21 | Bulk publish menghasilkan banyak event | Seluruh event dapat di-group via correlation ID |
| AT-22 | User tanpa audit admin permission membuka restricted event | Backend mengembalikan forbidden |
| AT-23 | Activity feed difilter employee | Hanya relevant subject/resource events dikembalikan |
| AT-24 | Event dengan same timestamp | Ordering tetap deterministic |
| AT-25 | Audit UI membuka event diff | Human-readable before/after, bukan raw JSON default |
| AT-26 | Settings payroll berubah | Nilai before/after dan actor tercatat |
| AT-27 | Migration membuat historical data | Actor type tercatat sebagai migration/system, bukan human palsu |
| AT-28 | Audit write gagal pada payroll unlock | Unlock tidak dianggap sukses tanpa durable audit evidence |
| AT-29 | Cached activity projection dihapus | Dapat direbuild dari canonical audit/business history |
| AT-30 | Historical record direferensikan payroll lama | Archive/deactivate source tidak merusak historical display |

---

# 38. Non-Goals

PRD-09 tidak menetapkan:

- vendor logging platform,
- SIEM vendor,
- database engine final,
- exact hash/signature algorithm,
- exact retention years,
- observability stack,
- distributed tracing vendor,
- external immutable audit storage.

Hal tersebut ditentukan pada PRD technical architecture, security, dan operations.

---

# 39. Relationship to Other PRDs

## PRD-03 — Scheduling

Menentukan business events jadwal yang perlu dipertahankan.

PRD-09 menentukan bagaimana perubahan tersebut diaudit dan ditampilkan sebagai history.

## PRD-04 — Payroll

Menentukan calculation/revision/lock semantics.

PRD-09 menentukan chronology dan evidence setiap transition.

## PRD-05 — Exceptions

Menentukan state dan operational effect.

PRD-09 menentukan request/approval/replacement/swap history.

## PRD-07 — Authorization

Menentukan siapa boleh melakukan mutation/read.

PRD-09 mencatat mutation access yang signifikan dan membatasi visibility audit sensitif.

## PRD-08 — Data Model

Menentukan canonical versioned data dan append-oriented audit direction.

PRD-09 memperdalam event model, history query, retention, dan UX.

## PRD-10+ — UI/UX

Harus menggunakan history sebagai contextual product experience, bukan sekadar tabel log developer.

---

# 40. Final Product Contract

NOCScheduler dianggap memenuhi PRD-09 jika:

1. perubahan business-critical tidak dapat terjadi tanpa trace yang dapat dipercaya,
2. user dapat memahami perubahan jadwal dan request tanpa membaca JSON/log teknis,
3. salary dan incentive history tetap dapat dijelaskan setelah konfigurasi berubah,
4. payroll memiliki revision/finalization/lock/unlock chronology yang jelas,
5. perubahan role/permission penting dapat ditelusuri,
6. retroactive correction selalu membedakan waktu pencatatan dan tanggal efektif,
7. audit event tidak membocorkan credential/secret,
8. multi-record operation dapat dikelompokkan melalui correlation,
9. historical identity tetap readable walaupun user/employee sudah inactive,
10. locked payroll tetap historically stable,
11. audit access diverifikasi server-side,
12. Activity History memiliki filtering dan human-readable diff,
13. audit trail dan canonical business history tidak dicampur menjadi satu model yang ambigu,
14. high-risk mutation tidak menggunakan best-effort audit,
15. seluruh domain P0 mempunyai minimum audit coverage sebelum production.

---

# 41. Recommended Next Document

Dokumen berikutnya:

**PRD-10 — UI/UX, User Flow & Interaction Design**

PRD-10 menerjemahkan seluruh foundation PRD-01 sampai PRD-09 menjadi pengalaman penggunaan nyata: layout, interaction model, hierarchy, task flow, schedule editor behavior, payroll review flow, history interaction, desktop density, mobile one-hand operation, empty/error/loading states, dan interaction quality.