# PRD-06 — Information Architecture, Navigation & Page Structure

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Information Architecture  
> **Document ID:** PRD-06  
> **Status:** Draft — Information Architecture Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements; PRD-02 — Feature Specification; PRD-03 — Scheduling & Shift Business Logic; PRD-04 — Payroll, Salary & Incentive Logic; PRD-05 — Attendance, Leave, Overtime & Schedule Exception Logic  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Purpose

Dokumen ini mendefinisikan **information architecture, navigation model, page hierarchy, route structure, contextual navigation, entry points, dan relationship antarhalaman** pada NOCScheduler.

PRD-06 menjadi source of truth untuk menjawab:

> **“Halaman apa saja yang ada di NOCScheduler, bagaimana user berpindah antarhalaman, dan di mana setiap pekerjaan seharusnya dilakukan?”**

Dokumen ini tidak menetapkan detail visual final seperti spacing, typography, color token, component styling, atau microinteraction. Hal tersebut akan ditentukan di PRD UI/UX, Design System, Responsive, dan UI Polish.

Namun PRD-06 menetapkan struktur yang wajib dihormati oleh UI agar aplikasi:

- mudah dipahami tanpa training panjang,
- cepat digunakan setiap hari,
- tidak memiliki halaman duplikatif,
- tidak menyembunyikan fungsi penting terlalu dalam,
- tetap efisien pada desktop,
- tetap sederhana pada mobile,
- scalable ketika fitur bertambah.

---

# 2. IA Principles

## IA-P01 — Organize by User Job, Not Database Entity

Navigation utama harus mengikuti pekerjaan yang ingin dilakukan user.

Contoh yang baik:

- Dashboard
- Schedule
- Team
- Payroll
- Reports

Bukan:

- ShiftAssignment
- PayrollRecord
- CompensationProfile
- ScheduleVersion

Nama teknis entity hanya digunakan pada implementation layer.

---

## IA-P02 — Schedule Is the Primary Product Axis

Jadwal adalah domain paling sering digunakan.

Semua user harus dapat mencapai jadwal pribadi atau jadwal tim dengan maksimal satu navigational action dari area utama aplikasi.

---

## IA-P03 — Consumption and Management Are Different Modes

Melihat jadwal dan menyusun jadwal memiliki kebutuhan berbeda.

Karena itu:

- `My Schedule` dan `Team Schedule` dioptimalkan untuk konsumsi,
- `Schedule Management` dioptimalkan untuk operasi admin/scheduler.

Jangan memaksa member biasa menggunakan editor jadwal hanya untuk melihat jadwal.

---

## IA-P04 — Role-Aware, Not Role-Fragmented

Navigation dapat berubah berdasarkan permission, tetapi aplikasi tidak boleh terasa seperti tiga produk berbeda.

Semua role menggunakan mental model yang konsisten.

Contoh:

- semua role mengenal `Schedule`,
- Scheduler/Admin mendapat subpage tambahan `Manage Schedule`,
- member tidak melihat action yang tidak dapat digunakannya.

---

## IA-P05 — Transparency Should Reduce Navigation Depth

Karena produk bersifat internal dan transparan, data tim seperti schedule dan payroll yang memang diperbolehkan tidak perlu disembunyikan di banyak layer permission-centric navigation.

Permission tetap diterapkan pada action/mutation.

---

## IA-P06 — Mobile Navigation Must Prioritize Daily Tasks

Mobile bukan versi sidebar desktop yang diperkecil.

Bottom navigation harus fokus pada pekerjaan yang paling sering dilakukan:

- Home
- Schedule
- Team
- Payroll
- More

Administrative tools yang kompleks masuk melalui `More` atau context entry point.

---

## IA-P07 — Desktop Must Optimize Power Workflows

Desktop harus memberikan akses cepat ke:

- schedule management,
- employees,
- payroll processing,
- reports,
- settings.

Sidebar boleh lebih lengkap daripada mobile navigation.

---

## IA-P08 — One Canonical Page per Responsibility

Satu pekerjaan utama harus memiliki satu halaman canonical.

Contoh:

- employee salary configuration tidak boleh diedit dari tiga halaman berbeda dengan behavior berbeda,
- payroll finalization memiliki satu canonical payroll management flow,
- shift settings memiliki satu canonical settings location.

Page lain boleh menyediakan shortcut/deep-link ke canonical location.

---

## IA-P09 — Context Before Configuration

User harus dapat melihat context operasional tanpa masuk ke Settings.

Settings hanya untuk konfigurasi sistem, bukan sebagai tempat menyimpan workflow harian.

---

## IA-P10 — Historical Views Stay Reachable

Historical schedule, payroll, request, dan audit tidak boleh hilang hanya karena record sudah tidak aktif.

History harus memiliki route atau filter yang dapat dicapai secara jelas.

---

# 3. Top-Level Product Areas

NOCScheduler menggunakan enam area informasi utama:

1. **Home**
2. **Schedule**
3. **Team**
4. **Payroll**
5. **Reports**
6. **Administration**

Area tambahan global:

- Notifications
- Search / Command Palette
- User/Profile Menu

---

# 4. Recommended Desktop Navigation

## 4.1 Desktop Sidebar Structure

Rekomendasi canonical sidebar:

```text
NOCScheduler

OVERVIEW
  Dashboard

SCHEDULE
  My Schedule
  Team Schedule
  Manage Schedule        [permission]
  Requests

PEOPLE
  Employees              [permission-aware]

PAYROLL
  Payroll Overview
  Monthly Payroll

REPORTS
  Reports

SYSTEM
  Activity History       [permission-aware]
  Settings               [permission-aware]
```

Global controls di shell:

```text
Search / Command Palette
Notifications
Theme Switcher
User Menu
```

---

## 4.2 Sidebar Grouping Rules

Sidebar tidak boleh memiliki terlalu banyak divider/group.

Rekomendasi maksimal:

- Overview
- Schedule
- People
- Payroll
- Reports
- System

Group yang hanya memiliki satu item masih diperbolehkan jika mental modelnya penting, tetapi visual treatment harus compact.

---

## 4.3 Sidebar Behavior

Desktop sidebar harus mendukung:

- expanded state,
- collapsed icon-only state,
- persistent selection selama session jika feasible,
- tooltip pada icon-only state,
- active route indicator,
- badge untuk pending request atau notification jika relevan.

Collapsed sidebar tidak boleh mengubah route behavior.

---

## 4.4 Permission-Aware Sidebar

Jika user tidak memiliki permission terhadap halaman admin:

- item dapat disembunyikan,
- jangan tampilkan disabled item yang hanya menambah noise kecuali ada alasan edukasi yang kuat.

Direct URL tetap harus divalidasi server-side/backend authorization.

UI hide bukan security boundary.

---

# 5. Recommended Mobile Navigation

## 5.1 Bottom Navigation

Canonical mobile bottom navigation:

1. **Home**
2. **Schedule**
3. **Team**
4. **Payroll**
5. **More**

Tujuan utamanya adalah memungkinkan aktivitas paling umum dilakukan dengan satu tangan.

---

## 5.2 Home

Route utama:

`/dashboard`

Home menampilkan:

- shift hari ini,
- next shift,
- now on duty,
- recent change,
- monthly personal summary.

---

## 5.3 Schedule

Mobile Schedule default membuka `My Schedule`.

Dari halaman ini tersedia segmented/tab context:

- My Schedule
- Team Schedule

Admin/scheduler dapat memiliki shortcut ke Manage Schedule, tetapi editor penuh tidak harus menjadi pengalaman utama mobile.

---

## 5.4 Team

Team membuka directory/people view yang dioptimalkan untuk melihat:

- anggota NOC,
- status operasional,
- current/next shift,
- shortcut employee detail.

Jika product testing menunjukkan Team Schedule lebih sering digunakan daripada directory, tab Team dapat membuka Team Schedule dan directory menjadi secondary view. Keputusan final boleh divalidasi lewat UX test, tetapi route canonical tetap berbeda.

---

## 5.5 Payroll

Mobile Payroll membuka ringkasan payroll bulan aktif/current selection.

User dapat berpindah ke:

- monthly payroll list,
- employee payroll detail,
- historical month.

---

## 5.6 More

`More` berisi item yang lebih jarang dipakai:

- Requests
- Reports
- Employees jika memiliki permission
- Manage Schedule jika permission dan mobile workflow diaktifkan
- Activity History
- Settings
- Profile
- Theme
- Logout

`More` tidak boleh menjadi dumping ground. Maksimal dua level navigasi dianjurkan.

---

# 6. Global Route Map

Route berikut adalah rekomendasi canonical URL structure.

```text
/
/login

/dashboard

/schedule
/schedule/me
/schedule/team
/schedule/manage
/schedule/manage/:period
/schedule/requests
/schedule/requests/:requestId

/employees
/employees/:employeeId
/employees/:employeeId/schedule
/employees/:employeeId/payroll

/payroll
/payroll/:period
/payroll/:period/:employeeId

/reports
/reports/schedule
/reports/payroll
/reports/employees

/activity
/activity/:eventId

/settings
/settings/general
/settings/shifts
/settings/payroll
/settings/compensation
/settings/holidays
/settings/access
/settings/notifications

/profile
/notifications
```

Implementation boleh menggunakan nesting berbeda berdasarkan framework, tetapi canonical mental model dan URL semantics harus setara.

---

# 7. Authentication & Entry Routes

## 7.1 Login

**Route:** `/login`

Purpose:

- authentication,
- session restoration entry,
- clear error state.

Tidak boleh memiliki sidebar application shell.

---

## 7.2 Root Route

**Route:** `/`

Behavior:

- authenticated → redirect `/dashboard`,
- unauthenticated → redirect `/login`.

---

## 7.3 Post-Login Destination

Default:

`/dashboard`

Future enhancement boleh mengembalikan user ke intended deep link setelah login apabila aman.

---

# 8. Dashboard

## 8.1 Route

`/dashboard`

## 8.2 Responsibility

Dashboard bukan laporan lengkap. Dashboard adalah **operational landing page**.

Pertanyaan yang harus dijawab:

1. Hari ini saya shift apa?
2. Shift berikutnya kapan?
3. Siapa yang sedang bertugas?
4. Ada perubahan jadwal penting?
5. Bagaimana ringkasan shift saya bulan ini?

---

## 8.3 Recommended Sections

Urutan informasi:

1. Personal Shift Today
2. Next Shift
3. Now on Duty
4. Recent Schedule Changes
5. Monthly Personal Summary
6. Relevant pending requests / alerts

Admin/scheduler dapat memperoleh tambahan:

- coverage warning,
- unpublished schedule notice,
- pending request count,
- payroll attention count.

---

## 8.4 Dashboard Actions

Quick actions berbasis permission:

- View My Schedule
- View Team Schedule
- Submit Request
- Manage Schedule
- Review Requests
- Review Payroll

Dashboard tidak boleh menggandakan full editor atau full report.

---

# 9. Schedule Area

## 9.1 Schedule Landing

**Route:** `/schedule`

Behavior default:

- regular member → redirect `/schedule/me`,
- scheduler/admin juga default `/schedule/me` kecuali future preference menentukan lain.

---

## 9.2 My Schedule

**Route:** `/schedule/me`

Responsibility:

- melihat jadwal personal,
- melihat today/next shift,
- melihat monthly/weekly schedule,
- melihat exception terkait,
- melihat perubahan terbaru,
- memulai request dari tanggal/shift tertentu.

Recommended views:

- Month
- Week
- Agenda/List

Mobile default direkomendasikan agenda/compact calendar hybrid.

Desktop dapat menggunakan calendar grid yang lebih kaya.

---

## 9.3 Team Schedule

**Route:** `/schedule/team`

Responsibility:

- melihat jadwal seluruh NOC,
- mengetahui coverage,
- mengetahui rekan satu shift,
- melihat effective operational state ketika exception aktif.

Recommended controls:

- date range/month selector,
- filter employee,
- filter shift,
- show planned/effective state,
- jump to today.

Regular member adalah read-only.

Admin action yang mengubah assignment harus mengarah ke Manage Schedule atau membuka controlled editing context yang tetap menggunakan logic canonical Manage Schedule.

---

## 9.4 Manage Schedule

**Route:** `/schedule/manage`

**Detail:** `/schedule/manage/:period`

Actors:

- Scheduler
- Administrator
- role lain sesuai permission PRD-07.

Responsibility:

- create draft,
- bulk assign,
- copy previous period,
- apply template,
- edit primary state,
- review validation,
- check coverage,
- publish,
- controlled published correction.

### Page Structure Recommendation

```text
Page Header
  Period selector
  Schedule state: Draft / Published
  Validation summary
  Primary actions

Toolbar
  Employee filter
  Shift filter
  Bulk mode
  Copy / Template
  View options

Schedule Workspace
  Employee x Date matrix / equivalent editor

Context / Inspector
  Selected employee/date
  Current assignment
  Exception
  Validation
  Notes

Footer/Sticky Action Area when needed
  Save draft
  Validate
  Publish
```

UI final ditentukan di PRD-10/11.

---

## 9.5 Period Management

Manage Schedule landing dapat menampilkan period cards/table:

- month,
- status,
- completion,
- validation state,
- last updated,
- published at,
- actions.

Tujuannya agar user tidak harus menebak apakah bulan tertentu sudah memiliki schedule.

---

# 10. Requests & Exceptions Area

## 10.1 Requests List

**Route:** `/schedule/requests`

Canonical location untuk:

- leave,
- sick,
- permission,
- schedule change request,
- shift swap,
- replacement request,
- overtime request/record bila workflow request digunakan.

---

## 10.2 Request Tabs / Filters

Recommended filters:

- Pending
- Approved
- Rejected
- Cancelled
- All

Additional filters:

- request type,
- employee,
- date range,
- payroll impact,
- needs replacement.

---

## 10.3 Request Detail

**Route:** `/schedule/requests/:requestId`

Detail harus menampilkan:

- requester,
- type,
- affected date/shift,
- planned assignment,
- proposed/effective state,
- replacement/swapped employee bila relevan,
- reason/note,
- status,
- approver,
- timestamps,
- validation warnings,
- payroll impact summary,
- audit events.

Approval action dilakukan di halaman/detail context yang sama atau drawer canonical.

---

## 10.4 Deep Link from Schedule

Dari My Schedule atau Team Schedule:

`Shift cell → Request action`

Request form harus menerima prefilled context:

- employee,
- work date,
- assignment.

User tidak boleh dipaksa memilih ulang informasi yang sudah diketahui sistem.

---

# 11. Team / Employee Area

## 11.1 Employee List

**Route:** `/employees`

Regular member visibility mengikuti transparency policy.

Recommended information:

- employee name,
- status,
- current shift,
- next shift,
- role/team metadata yang relevan,
- contact/internal identifier jika diperbolehkan.

Admin-only metadata tidak harus terlihat ke regular member.

---

## 11.2 Employee Detail

**Route:** `/employees/:employeeId`

Page responsibility:

- employee identity summary,
- current operational status,
- schedule summary,
- monthly shift counts,
- relevant payroll summary sesuai transparency policy,
- employment status,
- context actions sesuai permission.

Recommended tabs:

1. Overview
2. Schedule
3. Payroll
4. History / Activity jika permission

Jangan membuat employee detail menjadi form editing raksasa.

Editable administration fields dapat menggunakan explicit `Edit Employee` action/modal/page.

---

## 11.3 Employee Schedule

**Route:** `/employees/:employeeId/schedule`

Canonical employee-scoped view terhadap schedule.

Boleh menggunakan komponen yang sama dengan My Schedule, tetapi context employee berbeda.

---

## 11.4 Employee Payroll

**Route:** `/employees/:employeeId/payroll`

Menampilkan payroll history employee lintas periode.

Detail periode tetap deep-link ke canonical payroll detail:

`/payroll/:period/:employeeId`

---

# 12. Payroll Area

## 12.1 Payroll Landing / Overview

**Route:** `/payroll`

Responsibility:

- current payroll period summary,
- latest finalized/locked period,
- employee payroll count,
- calculation status,
- dirty/outdated count,
- blocking issue count,
- shortcut ke historical period.

Regular member dapat melihat payroll sesuai transparency model; action processing hanya muncul untuk role berhak.

---

## 12.2 Monthly Payroll

**Route:** `/payroll/:period`

Contoh:

`/payroll/2026-08`

Recommended columns:

- employee,
- base salary,
- S1 count,
- S2 count,
- S3 count,
- S2 incentive,
- S3 incentive,
- other earnings,
- deductions,
- calculated THP,
- status,
- freshness/dirty indicator.

Primary admin actions:

- Calculate
- Recalculate
- Review Errors
- Finalize
- Lock
- Export

Actions harus mengikuti lifecycle PRD-04.

---

## 12.3 Employee Payroll Detail

**Route:** `/payroll/:period/:employeeId`

Responsibility:

- explain every number,
- show source assignments,
- show rate segments,
- show adjustments,
- show exception/overtime contribution,
- show calculation revision,
- show finalization/lock metadata.

Recommended sections:

1. Summary
2. Base Salary
3. Shift Counts
4. Incentives
5. Overtime / Other Earnings
6. Adjustments / Deductions
7. Source Timeline
8. Calculation History / Audit

---

## 12.4 Payroll Historical Navigation

Month switcher harus memungkinkan berpindah antarperiode tanpa kembali ke landing.

Historical period harus jelas statusnya:

- Open
- Calculated
- Finalized
- Locked

---

# 13. Reports Area

## 13.1 Reports Landing

**Route:** `/reports`

Reports adalah kumpulan laporan formal/analytical, bukan tempat workflow transaksi.

Recommended report catalog:

- Schedule Report
- Payroll Report
- Employee Monthly Summary
- Shift Distribution
- Coverage Report
- Exception/Overtime Report

---

## 13.2 Schedule Report

**Route:** `/reports/schedule`

Filters:

- period,
- employee,
- shift,
- planned/effective,
- exception.

---

## 13.3 Payroll Report

**Route:** `/reports/payroll`

Filters:

- period,
- employee,
- payroll status,
- component.

Export capability mengikuti PRD-17.

---

## 13.4 Employee Report

**Route:** `/reports/employees`

Dapat menampilkan:

- shift distribution,
- night shift count,
- exception count,
- overtime count,
- monthly compensation summary.

Tujuannya operasional, bukan performance appraisal HR.

---

# 14. Activity History

## 14.1 Route

`/activity`

Detail:

`/activity/:eventId`

---

## 14.2 Responsibility

Activity History menjadi user-facing audit explorer untuk actor yang memiliki permission.

Event examples:

- schedule published,
- assignment changed,
- request approved,
- salary changed,
- incentive rate changed,
- payroll recalculated,
- payroll finalized,
- payroll locked,
- role/access changed.

---

## 14.3 Filters

Recommended:

- date range,
- actor,
- employee,
- domain,
- action,
- affected entity.

Audit detail harus mendukung before/after bila tersedia.

---

# 15. Settings Architecture

Settings harus dibagi berdasarkan domain, bukan satu halaman panjang.

## 15.1 Settings Landing

**Route:** `/settings`

Menampilkan section navigation dan ringkasan konfigurasi.

---

## 15.2 General Settings

**Route:** `/settings/general`

Contoh:

- organization/display name,
- operational timezone,
- locale,
- default schedule period behavior,
- generic system preference.

Timezone adalah high-impact configuration dan membutuhkan warning/audit jika berubah setelah sistem memiliki historical data.

---

## 15.3 Shift Settings

**Route:** `/settings/shifts`

Canonical configuration untuk:

- Shift 1,
- Shift 2,
- Shift 3,
- name/code,
- start/end time,
- active state,
- display order,
- effective date,
- relevant operational rules.

Historical version tidak boleh dihapus dari UI hanya karena inactive.

---

## 15.4 Payroll Settings

**Route:** `/settings/payroll`

Configuration:

- payroll period policy,
- lifecycle defaults,
- rounding policy bila digunakan,
- payroll operational parameters.

Tidak digunakan untuk employee-specific salary.

---

## 15.5 Compensation Settings

**Route:** `/settings/compensation`

Canonical location untuk:

- incentive rates,
- overtime rates/policies,
- global earning/deduction categories,
- effective-dated compensation configuration.

Employee-specific base salary dapat diakses dari employee admin context tetapi underlying canonical data contract tetap sama.

---

## 15.6 Holiday Settings

**Route:** `/settings/holidays`

Menampilkan:

- holiday dates,
- holiday labels,
- operational treatment,
- effective payroll/OT policy link bila ada.

Holiday tidak otomatis berarti OFF sesuai PRD-05.

---

## 15.7 Access Settings

**Route:** `/settings/access`

Canonical location untuk:

- roles,
- permissions,
- user access mapping,
- account activation state.

Detail final mengikuti PRD-07.

---

## 15.8 Notification Settings

**Route:** `/settings/notifications`

Configuration tingkat sistem/user sesuai scope PRD-18.

Contoh:

- schedule published,
- schedule changed,
- request status,
- payroll availability.

---

# 16. User Profile

## 16.1 Route

`/profile`

Purpose:

- personal account details,
- user-facing preferences,
- theme preference,
- session/account information,
- personal notification preferences bila tersedia.

Profile bukan lokasi untuk mengubah salary atau role sendiri.

---

# 17. Notifications

## 17.1 Route

`/notifications`

Notification center accessible dari global header/app shell.

---

## 17.2 Notification Types

Baseline:

- schedule published,
- schedule changed,
- request submitted,
- request approved/rejected,
- replacement assigned,
- payroll calculated/finalized/available,
- admin attention events.

---

## 17.3 Deep Link Requirement

Setiap notification harus mengarah ke context yang relevan.

Contoh:

```text
Schedule changed → /schedule/me?date=2026-08-14
Request approved → /schedule/requests/:requestId
Payroll finalized → /payroll/2026-08/:employeeId
```

Notification yang hanya membuka dashboard tanpa context harus dihindari jika destination spesifik tersedia.

---

# 18. Global Search & Command Palette

## 18.1 Priority

P1 / High Value.

## 18.2 Purpose

Mempercepat desktop power user.

Potential searchable objects:

- employee,
- schedule period,
- payroll period,
- request,
- settings page,
- report.

Potential commands:

- Go to My Schedule
- Go to Team Schedule
- Manage current month
- Open current payroll
- Create request
- Toggle theme

Command harus permission-aware.

---

# 19. Breadcrumb Strategy

Breadcrumb tidak wajib pada halaman top-level.

Recommended:

- Dashboard → no breadcrumb
- My Schedule → no breadcrumb
- Team Schedule → no breadcrumb
- Employee detail → `Employees / Arief Rahmadi`
- Payroll detail → `Payroll / Aug 2026 / Employee`
- Request detail → `Requests / #REQ-001`
- Settings detail → `Settings / Shift Settings`

Pada mobile, breadcrumb panjang dapat diganti dengan back navigation + compact context title.

---

# 20. Page Header Contract

Setiap page canonical menggunakan pola header konsisten:

```text
Title
Optional short contextual description
Context/status
Primary action
Secondary actions
```

Contoh:

```text
Monthly Payroll
August 2026
Status: Calculated · 2 records outdated
[Recalculate] [Finalize] [...]
```

Hindari hero header besar yang membuang vertical space pada application pages.

---

# 21. Contextual Actions

Actions harus muncul sedekat mungkin dengan data yang dipengaruhi.

Examples:

- schedule cell → Change Shift / Create Request,
- employee row → View Employee,
- payroll row → View Breakdown,
- request row → Review,
- validation issue → Jump to affected cell.

Global action hanya untuk aktivitas global.

---

# 22. Modal, Drawer, Page Decision Rules

## 22.1 Use Modal When

- task singkat,
- user perlu tetap melihat context parent,
- maksimal beberapa field/action,
- tidak membutuhkan navigasi dalam.

Examples:

- confirm publish,
- add manual adjustment,
- quick shift change,
- approve/reject request.

---

## 22.2 Use Drawer / Side Panel When

- detail contextual,
- workspace utama perlu tetap terlihat,
- selected item dapat berganti cepat.

Examples:

- schedule cell inspector,
- employee quick detail,
- validation issue detail.

---

## 22.3 Use Full Page When

- workflow kompleks,
- memiliki banyak section,
- perlu deep link,
- perlu history,
- perlu URL state.

Examples:

- schedule management,
- employee detail,
- payroll detail,
- settings domain,
- request detail.

---

# 23. Navigation State & URL State

Filter penting yang layak dibagikan/deep-linked sebaiknya dapat direpresentasikan pada URL.

Examples:

```text
/schedule/team?month=2026-08&shift=S3
/payroll/2026-08?status=dirty
/activity?domain=schedule&employee=123
```

Transient UI state seperti modal animation tidak perlu masuk URL.

---

# 24. Back Navigation Rules

Back action harus predictable.

Jika user membuka detail dari list:

- browser back kembali ke list dengan filter/scroll state bila feasible.

Jika user membuka deep link langsung:

- page tetap valid tanpa parent navigation history.

Jangan bergantung pada browser history untuk menentukan apakah suatu page dapat dirender.

---

# 25. Empty, Loading & Error Information Architecture

Setiap page harus mendefinisikan minimal state:

- loading,
- empty,
- partial data,
- error,
- permission denied,
- not found.

Empty state harus relevan dengan domain.

Examples:

- No schedule yet → `Schedule belum dipublish untuk periode ini.`
- No payroll → `Payroll periode ini belum dihitung.`
- No requests → `Belum ada request.`

Jangan menggunakan generic `No data` untuk seluruh aplikasi.

---

# 26. Role-Oriented Navigation Expectations

## 26.1 NOC Member

Primary routes:

- Dashboard
- My Schedule
- Team Schedule
- Requests
- Employees/Team directory jika transparansi mengizinkan
- Payroll
- Reports read-only sesuai policy
- Profile
- Notifications

Tidak melihat admin mutation tools.

---

## 26.2 Scheduler / Supervisor

Mendapat tambahan:

- Manage Schedule
- schedule validation
- publish workflow
- request review sesuai permission
- coverage/fairness reporting

---

## 26.3 Administrator

Mendapat tambahan:

- Employees administration
- Payroll processing
- Activity History
- Settings
- Access management
- advanced reports

Detail permission final tetap milik PRD-07.

---

# 27. Cross-Page Workflow Maps

## 27.1 Daily Member Flow

```text
Login
  ↓
Dashboard
  ↓
See Today Shift
  ├─→ View My Schedule
  ├─→ View Team Schedule
  └─→ Submit Request if needed
```

---

## 27.2 Schedule Creation Flow

```text
Manage Schedule
  ↓
Select/Create Period
  ↓
Create Draft
  ↓
Assign / Bulk Assign / Copy / Template
  ↓
Validate
  ↓
Resolve Errors/Warnings
  ↓
Publish
  ↓
Team Schedule becomes official
  ↓
Notifications
```

---

## 27.3 Leave / Sick Flow

```text
My Schedule or Requests
  ↓
Create Request
  ↓
Pending
  ↓
Reviewer opens Request Detail
  ↓
Approve / Reject
  ↓
Operational State Updated
  ↓
Coverage Updated
  ↓
Payroll marked dirty if applicable
```

---

## 27.4 Shift Replacement Flow

```text
Affected Shift
  ↓
Create Exception / Need Replacement
  ↓
Select Replacement
  ↓
Validation
  ↓
Approval
  ↓
Effective Coverage Updated
  ↓
Payroll Eligibility Updated
```

---

## 27.5 Payroll Processing Flow

```text
Payroll Overview
  ↓
Open Period
  ↓
Calculate
  ↓
Review Blocking Errors
  ↓
Open Employee Breakdown if needed
  ↓
Recalculate
  ↓
Finalize
  ↓
Lock
  ↓
Historical Payroll
```

---

## 27.6 Payroll Investigation Flow

```text
Monthly Payroll
  ↓
Employee Row
  ↓
Payroll Detail
  ↓
Incentive Component
  ↓
Source Shift Dates
  ↓
Schedule / Exception Source
  ↓
Audit if required
```

---

# 28. Desktop Workspace Density Guidance

Walaupun styling final belum ditentukan, IA desktop harus mendukung high-density operation.

Rules:

- jangan memecah satu workflow menjadi banyak page bila workspace tunggal lebih efisien,
- gunakan side inspector untuk selected schedule cell,
- gunakan sticky toolbar pada data-heavy pages,
- filter dan primary action tetap reachable saat scroll panjang,
- full-width data workspace diperbolehkan,
- card tidak wajib digunakan untuk setiap informasi.

Schedule Management dan Monthly Payroll terutama harus diperlakukan sebagai **workspaces**, bukan marketing-style pages.

---

# 29. Mobile Information Priority

Mobile hierarchy harus memprioritaskan:

1. Today / Current state
2. Next action
3. Schedule
4. Team / coverage
5. Request status
6. Payroll summary
7. History / settings

Administrative detail tidak boleh mendorong daily-use information terlalu dalam.

---

# 30. Responsive Page Transformation Rules

Contoh transformasi konseptual:

| Desktop | Mobile |
|---|---|
| Sidebar | Bottom navigation + More |
| Wide schedule grid | Compact calendar / agenda + horizontal context when needed |
| Persistent inspector | Bottom sheet / full-screen detail |
| Payroll table | Employee rows/cards + drill-down |
| Multi-column filters | Filter sheet |
| Breadcrumb | Back button + compact title |
| Inline secondary panel | Drawer / stacked section |

Responsive behavior detail akan dikunci pada PRD-12.

---

# 31. Naming Standards

User-facing naming baseline:

- Dashboard
- My Schedule
- Team Schedule
- Manage Schedule
- Requests
- Employees
- Payroll
- Reports
- Activity History
- Settings

Hindari campuran istilah yang merujuk hal sama.

Contoh yang tidak diinginkan:

- `Roster` di satu halaman,
- `Schedule` di halaman lain,
- `Shift Plan` di menu lain,

kecuali memang memiliki arti bisnis berbeda yang terdokumentasi.

Locale Bahasa Indonesia penuh dapat diputuskan pada UX copy system, tetapi internal naming model harus konsisten.

---

# 32. Canonical Page Registry

| Page ID | Page | Route | Primary Actor | Type |
|---|---|---|---|---|
| PAGE-001 | Login | `/login` | All | Auth |
| PAGE-002 | Dashboard | `/dashboard` | All | Operational |
| PAGE-003 | My Schedule | `/schedule/me` | All | Operational |
| PAGE-004 | Team Schedule | `/schedule/team` | All | Operational |
| PAGE-005 | Manage Schedule | `/schedule/manage/:period?` | Scheduler/Admin | Workspace |
| PAGE-006 | Requests | `/schedule/requests` | All | Workflow |
| PAGE-007 | Request Detail | `/schedule/requests/:requestId` | All/Reviewer | Detail |
| PAGE-008 | Employees | `/employees` | Permission-aware | Directory/Admin |
| PAGE-009 | Employee Detail | `/employees/:employeeId` | Permission-aware | Detail |
| PAGE-010 | Employee Schedule | `/employees/:employeeId/schedule` | Permission-aware | Detail |
| PAGE-011 | Employee Payroll History | `/employees/:employeeId/payroll` | Permission-aware | Detail |
| PAGE-012 | Payroll Overview | `/payroll` | Permission-aware | Operational |
| PAGE-013 | Monthly Payroll | `/payroll/:period` | Permission-aware | Workspace |
| PAGE-014 | Employee Payroll Detail | `/payroll/:period/:employeeId` | Permission-aware | Detail |
| PAGE-015 | Reports | `/reports` | Permission-aware | Catalog |
| PAGE-016 | Schedule Report | `/reports/schedule` | Permission-aware | Report |
| PAGE-017 | Payroll Report | `/reports/payroll` | Permission-aware | Report |
| PAGE-018 | Employee Report | `/reports/employees` | Permission-aware | Report |
| PAGE-019 | Activity History | `/activity` | Admin/Auditor | Audit |
| PAGE-020 | Activity Detail | `/activity/:eventId` | Admin/Auditor | Detail |
| PAGE-021 | Settings | `/settings` | Admin | Settings |
| PAGE-022 | General Settings | `/settings/general` | Admin | Settings |
| PAGE-023 | Shift Settings | `/settings/shifts` | Admin | Settings |
| PAGE-024 | Payroll Settings | `/settings/payroll` | Admin | Settings |
| PAGE-025 | Compensation Settings | `/settings/compensation` | Admin | Settings |
| PAGE-026 | Holiday Settings | `/settings/holidays` | Admin | Settings |
| PAGE-027 | Access Settings | `/settings/access` | Admin | Settings |
| PAGE-028 | Notification Settings | `/settings/notifications` | Admin | Settings |
| PAGE-029 | Profile | `/profile` | All | Personal |
| PAGE-030 | Notifications | `/notifications` | All | Personal/Operational |

---

# 33. Navigation Business Rules

Rules berikut dapat dijadikan contract/acceptance reference.

### NAV-001
Authenticated root harus mengarah ke Dashboard.

### NAV-002
Unauthenticated protected route harus mengarah ke authentication flow.

### NAV-003
Regular member harus dapat mencapai My Schedule dalam maksimal satu primary navigation action.

### NAV-004
Team Schedule harus reachable tanpa masuk Manage Schedule.

### NAV-005
Manage Schedule hanya ditampilkan kepada actor dengan permission yang relevan.

### NAV-006
UI navigation visibility tidak menggantikan backend authorization.

### NAV-007
Mobile primary navigation maksimal lima destination utama pada baseline.

### NAV-008
Mobile Schedule default membuka My Schedule.

### NAV-009
Administrative pages boleh dipindahkan ke More pada mobile.

### NAV-010
Settings tidak boleh menjadi lokasi workflow scheduling harian.

### NAV-011
Payroll employee detail harus deep-linkable.

### NAV-012
Request detail harus deep-linkable.

### NAV-013
Notification harus deep-link ke context spesifik bila tersedia.

### NAV-014
Historical employee tetap dapat direferensikan dari historical payroll/audit meskipun inactive.

### NAV-015
Back navigation dari detail sebaiknya mempertahankan filter/list context bila feasible.

### NAV-016
Page harus dapat dibuka melalui direct URL tanpa bergantung pada navigation history.

### NAV-017
Permission denied harus dibedakan dari not found jika security policy mengizinkan.

### NAV-018
One canonical responsibility rule harus dipertahankan agar workflow tidak terduplikasi.

### NAV-019
Global search/command palette harus permission-aware.

### NAV-020
Schedule cell/request/payroll source links harus memungkinkan navigasi antar-domain secara kontekstual.

### NAV-021
Dashboard tidak boleh menjadi duplikasi full report atau full editor.

### NAV-022
Reports tidak boleh menjadi tempat mutation terhadap source transactional data.

### NAV-023
Manage Schedule harus mempertahankan selected period pada URL atau state yang dapat direkonstruksi.

### NAV-024
Monthly Payroll harus mengidentifikasi payroll period secara eksplisit pada URL.

### NAV-025
Employee-scoped schedule/payroll page harus mempertahankan canonical employee identity.

### NAV-026
Settings domain penting harus memiliki route terpisah, bukan satu mega-form.

### NAV-027
Mobile More tidak boleh memiliki lebih dari satu level nested menu tanpa alasan kuat.

### NAV-028
Page header harus menampilkan title yang konsisten dengan navigation label/domain.

### NAV-029
Status kritis seperti Draft, Published, Dirty, Finalized, Locked harus terlihat di page context, bukan hanya tersembunyi di detail modal.

### NAV-030
Route dan page label harus menggunakan terminologi bisnis yang konsisten.

---

# 34. Acceptance Criteria

PRD-06 dianggap terpenuhi jika:

1. seluruh feature domain PRD-02 memiliki lokasi canonical,
2. scheduling lifecycle PRD-03 memiliki navigation flow jelas,
3. payroll lifecycle PRD-04 memiliki page hierarchy jelas,
4. exception workflow PRD-05 terhubung ke schedule dan payroll,
5. regular member dapat melihat jadwal personal dan tim tanpa mengakses editor admin,
6. scheduler dapat mencapai Manage Schedule dengan cepat di desktop,
7. payroll detail dapat menjelaskan sumber perhitungan melalui deep link,
8. desktop dan mobile memiliki navigation model berbeda tetapi mental model konsisten,
9. route dapat digunakan untuk deep linking,
10. admin settings tidak bercampur dengan workflow harian,
11. role/permission memengaruhi visibility/action tanpa memecah IA menjadi aplikasi berbeda,
12. historical record tetap reachable,
13. canonical page responsibility tidak duplikatif,
14. page state seperti Draft/Published/Dirty/Locked dapat diberi context yang jelas,
15. struktur siap menjadi dasar PRD-10 UI/UX dan PRD-12 Responsive.

---

# 35. MVP Page Scope

## MVP Critical

- Login
- Dashboard
- My Schedule
- Team Schedule
- Manage Schedule
- Requests
- Employees
- Employee Detail
- Payroll Overview
- Monthly Payroll
- Employee Payroll Detail
- Settings — General
- Settings — Shifts
- Settings — Payroll
- Settings — Compensation
- Settings — Access
- Profile

## Strongly Recommended in First Operational Release

- Activity History
- Notifications
- Holiday Settings
- Schedule Report
- Payroll Report

## Post-MVP / Enhancement

- Global Search / Command Palette
- advanced employee reports
- advanced coverage analytics
- saved filters/views
- customizable dashboard modules

---

# 36. Open Decisions for Later PRDs

PRD-06 sengaja meninggalkan beberapa keputusan untuk dokumen berikutnya:

1. Detail role/permission → PRD-07.
2. Final database entities/routes relationship → PRD-08.
3. Audit event taxonomy → PRD-09.
4. Exact UI composition → PRD-10.
5. Component/design tokens → PRD-11.
6. Exact mobile interactions → PRD-12.
7. UI density/polish gates → PRD-13.
8. Frontend router/framework implementation → PRD-14.
9. API endpoint contract → PRD-15.
10. Report export behavior → PRD-17.
11. Notification channels/preferences → PRD-18.

---

# 37. Final Product Navigation Recommendation

## Desktop

```text
Dashboard

Schedule
  My Schedule
  Team Schedule
  Manage Schedule
  Requests

People
  Employees

Payroll
  Payroll Overview
  Monthly Payroll

Reports

System
  Activity History
  Settings
```

Global:

```text
Search
Notifications
Theme
Profile
```

## Mobile

```text
Home | Schedule | Team | Payroll | More
```

`More` menyediakan entry point ke Requests, Reports, admin tools, Settings, Profile, dan fungsi yang lebih jarang digunakan.

---

# 38. Final Principle

Information architecture NOCScheduler harus membuat aplikasi terasa seperti satu operational workspace yang kohesif.

User tidak seharusnya berpikir:

> “Data shift ini ada di menu apa?”

Mental model yang diinginkan adalah:

> “Saya ingin melihat jadwal → Schedule.”  
> “Saya ingin mengatur jadwal → Manage Schedule.”  
> “Saya ingin tahu siapa yang bekerja → Team.”  
> “Saya ingin memeriksa penghasilan → Payroll.”  
> “Saya ingin mengubah aturan sistem → Settings.”

Jika struktur aplikasi dapat dipahami dengan logika tersebut tanpa penjelasan tambahan, maka information architecture telah memenuhi tujuan utamanya.
