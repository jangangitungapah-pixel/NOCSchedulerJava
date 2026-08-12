# PRD-18 — Notifications & Operational Awareness

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Notifications & Operational Awareness  
> **Document ID:** PRD-18  
> **Status:** Draft — Notification & Awareness Source of Truth  
> **Depends On:** PRD-01 through PRD-17  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **notification model, operational awareness, event-to-recipient policy, priority/severity, Notification Center, unread state, grouping, deduplication, delivery lifecycle, deep-link behavior, preferences, batching, quiet behavior, expiry/staleness, mobile/desktop UX, auditability, and future external-channel integration** untuk NOCScheduler.

PRD-18 menjadi source of truth untuk menjawab:

> **“Perubahan apa yang perlu diketahui user, siapa yang perlu diberi tahu, kapan informasi harus muncul, bagaimana mencegah spam, dan bagaimana notification membawa user langsung ke tindakan atau konteks yang benar?”**

Notification bukan canonical business data.

Canonical truth tetap berada pada:

- published schedule / schedule revision,
- request / exception record,
- replacement / shift swap,
- payroll period / payroll revision,
- employee / configuration record,
- audit / business history.

Notification adalah **derived awareness record** yang menunjuk ke canonical source.

---

# 2. Product Vision

NOCScheduler harus terasa **aware tanpa cerewet**.

Sistem harus membantu user mengetahui perubahan yang relevan tanpa membuat Notification Center menjadi tempat semua event dilempar begitu saja.

Target experience:

> **Important things surface early. Routine things stay quiet. Every notification has context.**

User harus dapat menjawab dengan cepat:

- Apakah jadwal saya berubah?
- Apakah schedule bulan depan sudah dipublish?
- Apakah request saya disetujui atau ditolak?
- Apakah saya diminta menjadi replacement?
- Apakah shift swap saya selesai?
- Apakah ada coverage issue yang butuh tindakan?
- Apakah payroll bulan ini sudah tersedia/final/locked?
- Apakah ada perubahan payroll yang perlu direview?

---

# 3. Core Notification Principles

## NTF-P01 — Notify for User Value, Not for Every Event

Tidak setiap audit event harus menghasilkan notification.

Contoh yang **tidak perlu** otomatis menghasilkan notification global:

- admin membuka halaman settings,
- draft schedule cell diedit berkali-kali,
- filter report berubah,
- employee list dibuka,
- system query refresh.

Notification hanya dibuat bila event memiliki nilai awareness, action, atau acknowledgement bagi recipient.

---

## NTF-P02 — Notification Is Derived From Canonical Business State

Notification tidak boleh menjadi satu-satunya bukti bahwa event terjadi.

Jika notification dihapus/expired, source record tetap ada.

Contoh:

`Schedule changed` notification harus menunjuk ke schedule assignment/revision canonical.

---

## NTF-P03 — Relevance Is Recipient-Specific

Event yang sama dapat menghasilkan recipient berbeda.

Contoh schedule change:

- affected employee → wajib tahu,
- replacement employee → wajib tahu bila relevan,
- scheduler/admin → mungkin tidak perlu notification personal jika dia actor-nya,
- seluruh tim → hanya jika perubahan memang team-wide.

---

## NTF-P04 — Do Not Notify the Actor About Their Own Routine Action

Secara default, actor yang baru saja melakukan action tidak perlu menerima notification bahwa action tersebut berhasil jika UI sudah memberi confirmation.

Pengecualian:

- asynchronous completion,
- delayed export,
- background process,
- high-risk operation yang membutuhkan durable confirmation.

---

## NTF-P05 — Deep Link Is Mandatory

Notification actionable harus membawa user ke source/context yang tepat.

Contoh:

- schedule changed → `/schedule/me?date=2026-08-18`
- request approved → `/schedule/requests/:requestId`
- payroll locked → `/payroll/:period/:employeeId`
- coverage warning → `/schedule/manage/:period?date=...`

User tidak boleh diarahkan hanya ke dashboard umum jika source spesifik tersedia.

---

## NTF-P06 — Severity and Urgency Are Different Concepts

Gunakan dua dimensi bila diperlukan:

### Severity

- `INFO`
- `NOTICE`
- `WARNING`
- `CRITICAL`

### Urgency / Action Requirement

- `PASSIVE`
- `ACTION_RECOMMENDED`
- `ACTION_REQUIRED`

Contoh:

Payroll locked = `NOTICE + PASSIVE`.

Coverage di bawah minimum untuk shift yang segera dimulai = `WARNING/CRITICAL + ACTION_REQUIRED`.

---

## NTF-P07 — No Notification Spam

Event berulang yang sama harus dapat:

- dideduplicate,
- digroup,
- dibatch,
- atau mengganti notification yang belum dibaca bila lebih tepat.

Contoh buruk:

> Coverage warning S3  
> Coverage warning S3  
> Coverage warning S3  
> Coverage warning S3

Contoh lebih baik:

> **4 coverage issues need attention**

---

## NTF-P08 — Stale Notifications Must Lose Urgency

Notification harus memahami relevansi waktu.

Contoh coverage warning untuk shift yang sudah selesai tidak boleh tetap tampil sebagai urgent active issue.

Notification boleh tetap ada di history tetapi statusnya menjadi resolved/stale.

---

## NTF-P09 — Read State Is Not Resolution State

`read/unread` hanya menyatakan apakah user sudah melihat notification.

Itu berbeda dari source business state.

Contoh:

- user membaca `Pending request needs approval`,
- request masih pending,

maka awareness source belum resolved.

---

## NTF-P10 — Mobile and Desktop Are Equal Notification Experiences

Desktop mengoptimalkan:

- notification popover,
- dense list,
- quick navigation,
- operational alerts.

Mobile mengoptimalkan:

- thumb-friendly Notification Center,
- clear unread grouping,
- fast deep-link,
- compact action summary.

---

# 4. Notification Architecture

Conceptual flow:

```text
Business Transaction
  ↓
Canonical State Change
  ↓
Audit / Domain Event
  ↓
Notification Policy
  ↓
Recipient Resolution
  ↓
Deduplication / Grouping
  ↓
Notification Record
  ↓
In-App Delivery
  ↓
Optional Future External Channels
```

Notification creation untuk high-value business event sebaiknya menggunakan durable post-transaction/outbox pattern jika background delivery dipakai.

Notification tidak boleh menyebabkan canonical mutation gagal hanya karena optional external channel gagal.

Namun source business action dan durable awareness event tidak boleh hilang diam-diam.

---

# 5. Conceptual Notification Entity

Minimum fields:

```text
id
recipient_user_id
type
category
severity
urgency
title
body
source_type
source_id
deep_link
group_key
fingerprint
created_at
available_at
read_at
archived_at
resolved_at
expires_at
metadata
```

Optional delivery fields:

```text
in_app_delivered_at
email_status
external_delivery_status
last_delivery_attempt_at
```

Notification payload tidak boleh menjadi snapshot besar dari seluruh source entity.

Simpan reference + minimal presentation metadata yang dibutuhkan.

---

# 6. Notification Categories

Canonical categories:

1. `SCHEDULE`
2. `REQUEST`
3. `COVERAGE`
4. `REPLACEMENT`
5. `SHIFT_SWAP`
6. `OVERTIME`
7. `PAYROLL`
8. `EMPLOYEE`
9. `SYSTEM`
10. `SECURITY` — limited/internal admin awareness where appropriate

Category digunakan untuk filtering dan preferences.

---

# 7. Canonical Notification Types

## 7.1 Schedule Notifications

### NTF-SCH-01 — Schedule Published

Recipients:

- employee yang memiliki assignment pada period,
- optionally team-wide active users jika policy organisasi memilih team awareness.

Content:

- period,
- publish timestamp,
- quick action `View Schedule`.

Grouping:

Satu notification per publish event/period, bukan satu notification per assignment.

Priority:

`NOTICE / PASSIVE`

---

### NTF-SCH-02 — Personal Published Schedule Changed

Recipients:

- affected employee.

Minimum content:

- work date,
- before state,
- after state,
- effective shift time if relevant,
- actor optional depending UX,
- reason if appropriate.

Example:

> **Jadwal 18 Aug berubah**  
> Shift 2 → Shift 3 · 23:00–07:00

Priority:

`WARNING / ACTION_RECOMMENDED` bila perubahan dekat dengan waktu shift.

`NOTICE / PASSIVE` bila masih jauh dan tidak membutuhkan respons.

---

### NTF-SCH-03 — Bulk Personal Changes

Jika satu publish/correction mengubah banyak tanggal untuk employee yang sama, notification dapat digroup:

> **3 jadwalmu berubah untuk September**

Tap → filtered changed-date list.

Jangan kirim tiga notification terpisah jika satu group lebih mudah dipahami.

---

## 7.2 Request Notifications

### NTF-REQ-01 — Request Submitted

Requester tidak membutuhkan in-app notification rutin jika submission langsung berhasil dan UI sudah confirmation.

Scheduler/approver dapat menerima:

> **Request baru perlu direview**

Priority:

`NOTICE / ACTION_RECOMMENDED`

---

### NTF-REQ-02 — Request Approved

Recipient:

- requester,
- affected replacement/swapped employee jika relevan.

Deep-link ke request detail.

---

### NTF-REQ-03 — Request Rejected

Recipient:

- requester.

Content harus menampilkan reason bila tersedia.

---

### NTF-REQ-04 — Request Cancelled / Superseded

Notification hanya dikirim ke actor yang secara operational perlu tahu.

---

## 7.3 Replacement Notifications

### NTF-REP-01 — Replacement Requested

Recipient:

- proposed replacement employee jika confirmation diperlukan,
- scheduler/approver bila workflow membutuhkan approval.

Content wajib menunjukkan:

- siapa yang digantikan,
- tanggal,
- shift,
- jam,
- reason/context.

---

### NTF-REP-02 — Replacement Confirmed / Approved

Recipients:

- original employee,
- replacement employee,
- scheduler if needed.

Notification harus menghindari ambiguity siapa yang sekarang expected bekerja.

---

### NTF-REP-03 — Replacement Cancelled / Changed

Affected employee wajib diberi tahu jika perubahan mengubah expected work state.

---

## 7.4 Shift Swap Notifications

### NTF-SWP-01 — Swap Proposal

Recipient:

- swap counterpart.

### NTF-SWP-02 — Swap Accepted / Approved

Recipients:

- both affected employees.

### NTF-SWP-03 — Swap Rejected / Cancelled

Recipients:

- affected participants as relevant.

Swap notification harus menunjuk ke satu correlated swap record, bukan dua assignment edit terpisah.

---

## 7.5 Coverage Notifications

### NTF-COV-01 — Future Coverage Warning

Recipients:

- Scheduler/Supervisor,
- Administrator only if configured/relevant.

Trigger:

Effective/planned coverage di bawah configured threshold atau future exception menyebabkan risk.

Priority bergantung proximity:

- jauh dari shift → `WARNING / ACTION_RECOMMENDED`
- shift dekat/segera → `CRITICAL / ACTION_REQUIRED`

---

### NTF-COV-02 — Coverage Restored

Jangan membuat notification baru secara default hanya untuk mengatakan issue resolved.

Lebih baik:

- mark original awareness as resolved,
- update grouped coverage item.

Explicit resolved notification hanya jika policy membutuhkan.

---

## 7.6 Overtime Notifications

### NTF-OT-01 — Overtime Approval Needed

Recipient:

- authorized approver.

### NTF-OT-02 — Overtime Approved / Rejected

Recipient:

- employee/requester.

Payroll impact boleh ditampilkan secara ringkas jika tersedia.

---

## 7.7 Payroll Notifications

### NTF-PAY-01 — Payroll Calculated / Available for Review

Recipients:

- actor/role yang bertanggung jawab review payroll.

Regular NOC Member tidak perlu menerima notification setiap kali recalculation internal terjadi.

---

### NTF-PAY-02 — Personal Payroll Finalized

Recipient:

- employee terkait.

Content:

- payroll period,
- THP summary,
- status `FINALIZED`,
- link ke payroll detail.

---

### NTF-PAY-03 — Personal Payroll Locked

Recipient:

- employee terkait.

Priority:

`NOTICE / PASSIVE`

---

### NTF-PAY-04 — Payroll Became Dirty / Outdated

Recipients:

- payroll-capable actor only.

Regular employee tidak perlu diberi notification teknis bahwa revision sedang dirty kecuali hasil yang sebelumnya ditampilkan berubah menjadi unavailable/under review.

---

### NTF-PAY-05 — Payroll Unlocked

Recipients:

- payroll-capable actor,
- affected employee optionally if policy requires transparency.

Because unlock is exceptional, event harus jelas dan link ke payroll history.

---

## 7.8 Compensation / Settings Awareness

Perubahan salary/incentive config tidak otomatis mengirim broadcast ke semua user.

Possible recipients:

- affected employee,
- payroll admin,
- administrator.

Notification hanya jika product policy membutuhkan awareness.

Audit trail tetap wajib walaupun notification tidak dibuat.

---

# 8. Notification Center

## 8.1 Route

Canonical route:

```text
/notifications
```

Notification popover/bell adalah quick view, bukan pengganti full page.

---

## 8.2 Notification Center Sections

Recommended grouping:

- `Needs Attention`
- `Recent`
- `Earlier`

Optional filters:

- All
- Unread
- Schedule
- Requests
- Payroll
- Coverage

Jangan membuat terlalu banyak tabs yang menghambat scanning.

---

## 8.3 Notification Item Anatomy

Minimum:

- icon/category indicator,
- title,
- concise body,
- relative time,
- unread indicator,
- severity/attention indicator if needed,
- source context,
- optional quick action,
- resolved/stale indication if applicable.

Whole item dapat menjadi deep-link target.

---

## 8.4 Bell Badge

Bell badge menunjukkan **unread count**, bukan total unresolved business tasks.

Jika unread sangat besar, UI dapat menggunakan capped display:

```text
9+
99+
```

Count harus update setelah mark read.

---

# 9. Read, Archive, Resolve & Delete Semantics

## 9.1 Unread

`read_at = null`

## 9.2 Read

User sudah membuka/menandai notification.

Mark read tidak mengubah source state.

## 9.3 Archived

Notification disembunyikan dari default recent view tetapi masih dapat dipertahankan sesuai retention.

## 9.4 Resolved

Source issue tidak lagi membutuhkan attention.

Contoh coverage issue sudah diperbaiki.

## 9.5 Delete

Baseline tidak membutuhkan user hard-delete notification.

Gunakan archive/retention cleanup.

---

# 10. Grouping & Deduplication

## 10.1 Fingerprint

Notification policy dapat membuat stable fingerprint berdasarkan:

```text
type + recipient + source + logical context
```

Repeated identical event dalam deduplication window tidak membuat duplicate item baru.

---

## 10.2 Group Key

Examples:

```text
schedule-change:{employeeId}:{period}
coverage:{workDate}:{shiftId}
pending-requests:{approverScope}
```

---

## 10.3 Group Update Behavior

Jika notification group masih unread dan event baru relevan muncul, sistem boleh:

- update counter,
- update summary,
- append child reference,
- move item ke top dengan updated timestamp.

Jangan menghapus historical audit evidence; grouping hanya presentation/awareness behavior.

---

# 11. Timing & Staleness

## 11.1 Immediate Events

Ideal immediate in-app awareness:

- personal schedule changed,
- replacement assignment changed,
- shift swap accepted/rejected,
- request approved/rejected,
- payroll finalized/locked.

---

## 11.2 Operational Warning Timing

Coverage warning harus mempertimbangkan proximity ke shift.

System boleh menaikkan urgency ketika start time mendekat.

Escalation tidak boleh menghasilkan notification spam; existing awareness dapat diperbarui.

---

## 11.3 Expiry

Notification informational dapat memiliki `expires_at` untuk keluar dari default recent view.

Business source tetap historical.

---

# 12. Notification Preferences

## 12.1 Baseline Preferences

User dapat mengatur optional in-app category preferences hanya untuk notification non-mandatory.

Mandatory operational/security awareness tidak boleh seluruhnya dimatikan jika organisasi menganggapnya kritis.

Suggested settings:

- schedule changes,
- schedule publish,
- request updates,
- payroll updates,
- coverage alerts for scheduler roles,
- external delivery channels future.

---

## 12.2 Mandatory vs Optional

Examples mandatory baseline:

- personal published schedule change,
- replacement assignment that changes expected duty,
- approved/rejected request,
- payroll final/locked awareness.

Examples optional:

- team schedule published announcement,
- low-priority report/export completion,
- informational team summary.

---

# 13. Quiet Hours & Shift-Aware Delivery

For in-app notifications, item dapat dibuat kapan saja karena tidak menghasilkan external interruption.

Untuk future push/email/chat integration:

- quiet hours harus dipertimbangkan,
- CRITICAL operational events dapat bypass quiet hours jika policy mengizinkan,
- low-priority notifications dapat dibatch/delay.

Default timezone: `Asia/Jakarta`.

Do not infer quiet-hour behavior from browser timezone.

---

# 14. Desktop UX

## 14.1 Bell Popover

Desktop bell membuka compact popover:

```text
Notifications
[Mark all read]

Needs Attention
  Coverage issue...

Recent
  Schedule changed...
  Request approved...

View all notifications
```

Popover tidak boleh terlalu lebar/tinggi hingga menjadi pseudo-page.

---

## 14.2 Notification Center Desktop

Recommended composition:

```text
Compact Page Header
Filter / Unread Toggle
Notification Feed
Optional contextual preview / source navigation
```

Dense but calm; jangan card per item dengan padding raksasa.

---

# 15. Mobile UX

## 15.1 Entry

Notification dapat diakses dari:

- header bell,
- More/navigation area,
- deep-link.

## 15.2 Mobile Notification Center

Requirements:

- compact full-width rows,
- clear unread indicator,
- touch target sufficient,
- relative time readable,
- body maksimal beberapa baris sebelum truncation,
- tap membuka canonical context,
- safe-area aware.

## 15.3 One-Hand Behavior

Frequent controls seperti:

- mark read,
- filter unread,
- open notification,

harus mudah dijangkau.

Critical action tidak boleh swipe-only.

---

# 16. Toast vs Notification

Toast dan Notification Center berbeda.

### Toast

Immediate feedback untuk action user.

Examples:

- Draft saved
- Request submitted
- Adjustment added

### Notification

Durable awareness terhadap business event yang penting setelah/di luar action tersebut.

Jangan membuat notification hanya karena setiap toast dianggap perlu disimpan.

---

# 17. Dashboard Awareness vs Notification Center

Dashboard dapat menampilkan operational awareness seperti:

- pending requests,
- coverage warnings,
- recent schedule changes,
- payroll attention.

Dashboard dan Notification Center harus menggunakan source/policy yang konsisten.

Namun dashboard card/counter tidak harus identik dengan unread notification count.

Example:

```text
Bell unread = 3
Pending requests = 5
```

Ini valid karena dua metric berbeda.

---

# 18. Deep-Link Contract

Notification deep-link harus:

1. menunjuk canonical route,
2. mempertahankan resource ID/context,
3. melakukan authorization server-side,
4. menangani resource archived/historical,
5. menampilkan graceful state jika source tidak lagi aktif.

Examples:

```text
/notifications/:id → redirect/open source
/schedule/me?date=2026-08-18
/schedule/requests/:requestId
/schedule/manage/2026-08?date=2026-08-18
/payroll/2026-08/:employeeId
/activity/:eventId
```

Notification tidak boleh menjadi authorization bypass ke resource.

---

# 19. API Contract Direction

Recommended endpoints:

```text
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
POST   /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all
POST   /api/v1/notifications/:id/archive
GET    /api/v1/notification-preferences
PUT    /api/v1/notification-preferences
```

Optional internal/admin endpoints tidak boleh expose generic notification creation ke regular client.

Business notification dibuat oleh server policy dari domain event, bukan client arbitrary payload.

---

# 20. Security & Authorization

- User hanya dapat mengubah read/archive/preferences untuk notification miliknya.
- Recipient tidak dipercaya dari client.
- Client tidak dapat membuat notification seolah-olah berasal dari system.
- Deep-link tetap melewati authorization canonical source.
- Notification body tidak boleh berisi secret/token.
- Security-sensitive details tidak boleh bocor melalui notification preview.
- External channel future harus mempertimbangkan data minimization.

---

# 21. Audit Relationship

Notification bukan audit trail.

Audit dapat mencatat:

- notification policy outcome untuk critical event bila diperlukan,
- external delivery failure yang signifikan,
- admin changes terhadap mandatory notification policy.

Read/unread event normal tidak perlu memenuhi audit log high-risk kecuali ada requirement khusus.

---

# 22. Delivery Reliability

## 22.1 In-App Baseline

P0 delivery channel adalah **in-app notification**.

External channel bukan dependency MVP.

## 22.2 Durable Generation

Critical business transaction harus menyediakan cara reliable menghasilkan notification setelah transaction commit.

Recommended future-compatible pattern:

```text
Business Transaction
+ Outbox Event
COMMIT
↓
Worker
↓
Notification records / external delivery
```

Pada MVP, synchronous notification creation di transaction dapat digunakan jika sederhana dan tidak menyebabkan coupling buruk.

## 22.3 Delivery Failure

External delivery failure tidak boleh membatalkan canonical business event setelah commit.

Retry policy harus bounded dan observable.

---

# 23. Future External Channels

Potential integrations:

- Email
- Web Push / PWA Push
- WhatsApp
- Telegram
- Slack / Teams

Semua dianggap **P2/P3**, bukan MVP requirement.

Rules:

- channel adapter terpisah dari notification policy,
- recipient mapping explicit,
- opt-in/policy configurable,
- retry bounded,
- delivery status observable,
- secrets disimpan server-side,
- no hard dependency of scheduling/payroll on external provider availability.

---

# 24. Notification Priority Matrix

| Event | Default Severity | Urgency | Recipient |
|---|---|---|---|
| Schedule published | NOTICE | PASSIVE | affected/team policy |
| Personal schedule changed | WARNING/NOTICE | ACTION_RECOMMENDED | affected employee |
| Request approved/rejected | NOTICE | PASSIVE | requester |
| Replacement assignment changed | WARNING | ACTION_RECOMMENDED | affected employees |
| Shift swap proposal | NOTICE | ACTION_RECOMMENDED | counterpart |
| Shift swap completed | NOTICE | PASSIVE | affected employees |
| Future coverage risk | WARNING | ACTION_RECOMMENDED | scheduler |
| Imminent under-coverage | CRITICAL | ACTION_REQUIRED | scheduler |
| Payroll calculated | NOTICE | ACTION_RECOMMENDED | payroll actor |
| Payroll finalized | NOTICE | PASSIVE | employee |
| Payroll locked | NOTICE | PASSIVE | employee |
| Payroll dirty/outdated | WARNING | ACTION_RECOMMENDED | payroll actor |
| Payroll unlocked | WARNING | ACTION_RECOMMENDED | payroll actor/affected policy |

---

# 25. Notification Business Rules

## NTF-001
Notification must always reference canonical business context when one exists.

## NTF-002
Audit events do not automatically become notifications.

## NTF-003
Notification recipients are resolved server-side.

## NTF-004
Client-supplied recipient IDs are never trusted for system notifications.

## NTF-005
Published personal schedule changes notify affected employees.

## NTF-006
Draft schedule edits do not notify employees.

## NTF-007
Schedule publish notification is grouped per period/event where possible.

## NTF-008
Multiple personal changes from one operation may be grouped.

## NTF-009
Cross-midnight shifts are described using the same work-date semantics as scheduling.

## NTF-010
OFF and Unassigned must not be described as the same state.

## NTF-011
Approved/rejected request results notify requester.

## NTF-012
Routine successful submission does not require duplicate self-notification.

## NTF-013
Replacement changes notify employees whose expected work state changes.

## NTF-014
Shift swap notifications point to the correlated swap record.

## NTF-015
Coverage warnings target operational actors, not every team member by default.

## NTF-016
Resolved coverage issue should update/resolve awareness rather than spam a new notification by default.

## NTF-017
Coverage urgency may increase as shift start approaches.

## NTF-018
Urgency escalation must not create uncontrolled duplicates.

## NTF-019
Payroll recalculation does not notify every employee by default.

## NTF-020
Payroll finalized/locked may notify affected employee.

## NTF-021
Payroll dirty/outdated targets payroll-capable actors.

## NTF-022
Payroll unlock awareness must be distinguishable from normal payroll update.

## NTF-023
Notification read state never changes canonical source state.

## NTF-024
Unread count is distinct from unresolved task count.

## NTF-025
Mark all read affects only recipient-owned notifications.

## NTF-026
Hard deletion is not required for normal user workflow.

## NTF-027
Notification grouping must not destroy audit/history evidence.

## NTF-028
Deduplication uses stable logical fingerprint.

## NTF-029
Notification Center must support unread filtering.

## NTF-030
Actionable notifications require deep-link.

## NTF-031
Deep-link authorization is enforced at destination.

## NTF-032
Historical/archived source must fail gracefully, not crash notification navigation.

## NTF-033
Bell badge reflects unread notifications.

## NTF-034
Notification Center is not the same as Activity History.

## NTF-035
Toast is not automatically persisted as notification.

## NTF-036
Notification items must display timestamp in application timezone semantics.

## NTF-037
External channel failure must not roll back committed canonical business action.

## NTF-038
External delivery retries are bounded.

## NTF-039
Notification payload must not contain credentials/secrets.

## NTF-040
User-controlled free text must be rendered safely.

## NTF-041
Mandatory operational notification types cannot be fully disabled by recipient preference unless policy allows.

## NTF-042
Optional categories can expose user preferences.

## NTF-043
Preferences cannot grant visibility to otherwise unauthorized source data.

## NTF-044
Mobile and desktop notification experience both require acceptance testing.

## NTF-045
Critical actions cannot be swipe-only on mobile.

## NTF-046
Notification list must handle long titles/body without page-level horizontal overflow.

## NTF-047
Unread indicator must be visually distinguishable in Light and Dark Mode.

## NTF-048
Resolved/stale notification must not retain false urgent styling.

## NTF-049
Notification generation must be idempotent where the same domain event may be retried.

## NTF-050
One domain event retry must not create duplicate recipient records.

## NTF-051
Background/outbox processing must use correlation/event identity.

## NTF-052
Notification query pagination is required for scalable history.

## NTF-053
Notification filtering parameters are allow-listed.

## NTF-054
Notification creation is not exposed as unrestricted regular-user API.

## NTF-055
Actor should not receive redundant routine notification for their own immediately confirmed action.

## NTF-056
Asynchronous completion may notify the initiating actor.

## NTF-057
Notification Center must preserve source truth terminology used elsewhere in product.

## NTF-058
Notification rendering must use semantic design-system tokens.

## NTF-059
Notification motion respects reduced-motion preference.

## NTF-060
Notification failures affecting critical operational awareness must be observable.

---

# 26. API Response Example

Conceptual notification item:

```json
{
  "id": "ntf_123",
  "type": "schedule.personal_changed",
  "category": "SCHEDULE",
  "severity": "WARNING",
  "urgency": "ACTION_RECOMMENDED",
  "title": "Jadwal 18 Aug berubah",
  "body": "Shift 2 → Shift 3 · 23:00–07:00",
  "createdAt": "2026-08-12T11:45:00Z",
  "readAt": null,
  "resolvedAt": null,
  "source": {
    "type": "shift_assignment",
    "id": "asg_123"
  },
  "deepLink": "/schedule/me?date=2026-08-18"
}
```

API presentation example does not define final TypeScript property naming; PRD-15 remains canonical HTTP conventions.

---

# 27. Empty, Loading & Error States

## Empty

> **Belum ada notifikasi**  
> Perubahan jadwal, request, dan payroll yang penting akan muncul di sini.

## No Unread

> **Semua sudah dibaca**

This is different from empty history.

## Loading

Use compact list skeleton matching notification geometry.

## Error

Explain failure and provide retry.

Do not show fake empty state when query failed.

---

# 28. Accessibility

Requirements:

- bell button has accessible label,
- unread count not communicated by color only,
- focus-visible supported,
- notification rows keyboard accessible,
- popover focus handling correct,
- severity uses text/icon semantics as well as color,
- time labels readable by assistive technology,
- reduced-motion supported.

---

# 29. Performance

Targets/behavior:

- unread count should be cheap to query,
- notification list paginated,
- opening bell must not fetch massive history,
- latest items can be cached briefly,
- stale cache must update after mark-read,
- bulk `read-all` should be one server command, not N requests.

Realtime websocket infrastructure is not required for MVP.

Near-real-time can use:

- refetch on focus,
- interval polling where justified,
- mutation-triggered invalidation.

Realtime transport may be added later if operational need proves it.

---

# 30. MVP Scope

## P0

- in-app Notification Center,
- unread/read state,
- bell unread count,
- personal schedule change notification,
- schedule published awareness,
- request approved/rejected,
- replacement / shift swap awareness,
- payroll finalized/locked awareness,
- deep-links,
- deduplication/idempotent generation,
- mobile + desktop UX,
- Light/Dark parity.

## P1

- scheduler pending-request awareness,
- coverage warnings,
- payroll dirty/review awareness,
- grouping/batching,
- notification preferences,
- resolved/stale awareness states.

## P2/P3

- email,
- push notification,
- WhatsApp,
- Telegram,
- Slack/Teams,
- quiet-hour delivery,
- escalation chains,
- digest notification.

---

# 31. Critical Test Matrix

| Test ID | Scenario | Expected |
|---|---|---|
| NOT-T01 | Publish draft schedule | One grouped publish notification, no per-cell spam |
| NOT-T02 | Edit published personal assignment | Affected employee receives clear before/after notification |
| NOT-T03 | Edit draft assignment | No employee notification |
| NOT-T04 | Same domain event retried | No duplicate notification |
| NOT-T05 | Three schedule changes one operation | Grouping allowed and source dates reachable |
| NOT-T06 | Request approved | Requester notified and deep-link correct |
| NOT-T07 | Request rejected | Reason visible if available |
| NOT-T08 | Replacement changes expected duty | Both affected actors receive appropriate awareness |
| NOT-T09 | Swap accepted | Both employees notified from same correlated swap |
| NOT-T10 | Coverage threshold breached | Scheduler notified, members not spammed |
| NOT-T11 | Coverage restored | Existing warning resolved without unnecessary duplicate |
| NOT-T12 | Payroll recalculated | Regular employee not spammed |
| NOT-T13 | Payroll finalized | Employee notified |
| NOT-T14 | Payroll locked | Employee notification opens exact period/detail |
| NOT-T15 | Payroll dirty | Payroll-capable actor notified |
| NOT-T16 | Payroll unlocked | Exceptional awareness visible |
| NOT-T17 | Mark notification read | Source business state unchanged |
| NOT-T18 | Mark all read | Only recipient records affected |
| NOT-T19 | Deep-link unauthorized source | Destination returns proper authorization state |
| NOT-T20 | Source archived | Notification opens graceful historical/archived state |
| NOT-T21 | Notification query fails | Error state, not fake empty |
| NOT-T22 | User has zero history | True empty state |
| NOT-T23 | User has history but zero unread | `Semua sudah dibaca` state |
| NOT-T24 | Long title/body mobile | No page overflow |
| NOT-T25 | Dark mode unread item | Readable and visually distinct |
| NOT-T26 | Reduced motion enabled | Motion minimized |
| NOT-T27 | External channel fails future | Canonical business event remains committed |
| NOT-T28 | Client attempts arbitrary recipient | Server rejects/ignores client-controlled recipient |
| NOT-T29 | Notification contains user note | Rendered as safe text |
| NOT-T30 | Bell popover opens | Keyboard/focus behavior valid |

---

# 32. Notification Definition of Done

Notification capability is Done when:

1. domain event mapping documented,
2. recipient policy server-side,
3. deep-link defined,
4. permission behavior validated,
5. duplicate generation prevented,
6. read state works,
7. unread count reconciles,
8. mark-all-read atomic enough for expected use,
9. grouping behavior tested,
10. stale/resolved behavior tested where applicable,
11. empty/no-unread/error states distinct,
12. desktop bell/popover polished,
13. desktop Notification Center polished,
14. mobile Notification Center polished,
15. Light/Dark parity approved,
16. long-content QA passed,
17. keyboard accessibility passed,
18. reduced-motion passed,
19. no secret/sensitive leakage,
20. notification generation is observable,
21. critical paths have automated tests,
22. notification terminology matches canonical business terminology,
23. deep-links preserve user context,
24. no page-level horizontal overflow,
25. notification does not become a second business source of truth.

---

# 33. Recommended Implementation Order

## NTF-F0 — Foundation

- notification schema,
- domain event identity,
- recipient policy abstraction,
- notification repository/query,
- read/unread API.

## NTF-F1 — Core Awareness

- schedule publish/change,
- request result,
- replacement/swap,
- payroll final/locked,
- bell unread count,
- Notification Center.

## NTF-F2 — Operational Intelligence

- coverage warnings,
- payroll dirty/review,
- grouping,
- resolution/staleness,
- preferences.

## NTF-F3 — External Delivery

Only when needed:

- outbox worker,
- email/push/chat adapters,
- retry/dead-letter strategy,
- quiet hours,
- digest/escalation.

---

# 34. Final Product Rule

NOCScheduler notification system must optimize for:

```text
Relevant
+ Timely
+ Explainable
+ Actionable
+ Non-Spammy
+ Deep-Linked
+ Permission-Safe
+ Mobile-Friendly
+ Historically Trustworthy
```

The system should never force users to constantly check every page manually just to discover an important change, and it should never create so much noise that important changes disappear inside the feed.
