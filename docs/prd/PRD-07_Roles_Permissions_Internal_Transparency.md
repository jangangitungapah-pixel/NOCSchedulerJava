# PRD-07 — Roles, Permissions & Internal Transparency

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Authorization & Access Control  
> **Document ID:** PRD-07  
> **Status:** Draft — Authorization Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements; PRD-02 — Feature Specification; PRD-03 — Scheduling & Shift Business Logic; PRD-04 — Payroll, Salary & Incentive Logic; PRD-05 — Attendance, Leave, Overtime & Schedule Exception Logic; PRD-06 — Information Architecture, Navigation & Page Structure  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **role, permission, scope, authorization rule, internal transparency policy, separation of duties, dan mutation control** untuk NOCScheduler.

PRD-07 menjadi source of truth untuk menjawab:

> **“Siapa boleh melihat apa, siapa boleh mengubah apa, siapa boleh menyetujui apa, dan bagaimana sistem memastikan transparansi internal tidak berubah menjadi akses mutation tanpa kontrol?”**

NOCScheduler dibuat khusus untuk penggunaan internal NOC dan tidak memiliki requirement kerahasiaan antaranggota untuk data operasional maupun laporan payroll sebagaimana arah produk saat ini.

Karena itu, baseline produk menggunakan prinsip:

> **Read broadly, mutate narrowly.**

Artinya:

- informasi operasional dapat dilihat secara luas oleh user internal yang aktif,
- jadwal tim dapat dilihat seluruh user,
- payroll internal dapat dilihat seluruh user sesuai requirement transparansi,
- tetapi perubahan jadwal, salary, incentive, payroll, settings, dan access rights hanya dapat dilakukan oleh actor yang memiliki permission eksplisit.

Dokumen ini harus menjadi acuan untuk:

- backend authorization,
- route protection,
- API authorization,
- database/service mutation guards,
- UI action visibility,
- role management,
- access settings,
- request approval,
- payroll lifecycle control,
- audit trail,
- automated authorization tests,
- security acceptance tests.

---

# 2. Authorization Principles

## AP-01 — Authentication Is Not Authorization

User yang berhasil login belum tentu boleh melakukan seluruh action.

Authentication hanya menjawab:

> “Siapa user ini?”

Authorization menjawab:

> “Apa yang boleh dilakukan user ini terhadap resource tersebut?”

Keduanya tidak boleh dicampur.

---

## AP-02 — Internal Transparency Is the Default Read Model

Baseline NOCScheduler menggunakan transparansi internal.

Seluruh user internal aktif secara default dapat melihat informasi operasional yang relevan, termasuk:

- jadwal sendiri,
- jadwal seluruh tim,
- siapa yang sedang bertugas,
- data profil kerja employee yang non-secret,
- ringkasan shift,
- laporan payroll internal,
- payroll detail antaranggota sesuai requirement produk.

Transparansi ini adalah keputusan produk, bukan kebetulan implementasi.

Jika organisasi di masa depan ingin membatasi payroll visibility, perubahan tersebut harus menjadi product policy baru dan tidak boleh dilakukan dengan patch UI ad-hoc.

---

## AP-03 — Visibility Does Not Grant Mutation

Kemampuan melihat salary/payroll orang lain **tidak pernah** berarti user boleh:

- mengubah base salary,
- mengubah incentive rate,
- menambah adjustment,
- menghitung ulang payroll,
- finalize payroll,
- lock/unlock payroll,
- mengubah jadwal employee lain,
- approve request.

Read permission dan mutation permission harus selalu terpisah.

---

## AP-04 — Server-Side Authorization Is Mandatory

Frontend boleh:

- menyembunyikan menu,
- menyembunyikan tombol,
- disable action,
- menampilkan permission-aware UI.

Namun frontend **bukan security boundary**.

Setiap mutation dan read yang memiliki restriction harus diverifikasi kembali di server/backend.

Direct URL, crafted API request, atau manipulasi client state tidak boleh melewati authorization.

---

## AP-05 — Deny by Default

Jika suatu action tidak memiliki permission mapping yang jelas, default behavior adalah:

`DENY`

Bukan `ALLOW`.

Permission baru harus ditambahkan secara eksplisit.

---

## AP-06 — Permission Before Role Name

Business logic tidak boleh bergantung pada pola seperti:

```text
if role == "ADMIN"
```

untuk setiap action.

Gunakan permission/capability seperti:

```text
schedule.publish
payroll.finalize
compensation.manage
```

Role berfungsi sebagai bundle permission.

Dengan demikian, role baru dapat dibuat tanpa menulis ulang business logic utama.

---

## AP-07 — Scope Matters

Permission dapat memiliki scope.

Contoh:

- `SELF`
- `TEAM`
- `ALL`

Contoh:

`request.create:SELF`

berbeda dari:

`request.create:ALL`

Baseline satu tim NOC dapat menggunakan scope `ALL` untuk banyak read operation, tetapi konsep scope harus tersedia di authorization model.

---

## AP-08 — Least Privilege for Mutation

User hanya diberikan mutation permission yang benar-benar diperlukan untuk pekerjaannya.

Scheduler tidak otomatis mendapat permission payroll hanya karena dapat mengelola jadwal.

Payroll admin tidak otomatis mendapat permission mengubah access rights.

---

## AP-09 — High-Risk Actions Require Stronger Control

Action berikut dikategorikan high-risk:

- publish schedule,
- retroactive published schedule correction,
- salary change,
- incentive change,
- payroll adjustment,
- payroll finalization,
- payroll lock,
- payroll unlock,
- permission/role modification,
- destructive/archive operation yang berdampak historical.

Action tersebut membutuhkan permission khusus dan audit trail.

---

## AP-10 — No Silent Privilege Escalation

User tidak boleh memperoleh permission baru secara otomatis akibat:

- perubahan jabatan biasa,
- perubahan employee profile,
- membuka halaman tertentu,
- menjadi requester/approver pada record tertentu,
- mengubah client payload.

Semua privilege change harus explicit dan auditable.

---

## AP-11 — Access Changes Are Audited

Perubahan:

- role,
- permission,
- account status,
- access scope,

harus menyimpan:

- actor,
- target user,
- before,
- after,
- timestamp,
- reason bila diperlukan.

---

## AP-12 — Historical Read Must Survive Role Changes

Jika employee menjadi inactive, historical data tidak boleh hilang.

User yang memiliki permission historical read tetap dapat melihat:

- schedule lama,
- payroll lama,
- request lama,
- audit record,

sesuai policy.

---

# 3. Core Authorization Terminology

## 3.1 User Account

Identity yang digunakan untuk login.

Minimum status:

- `ACTIVE`
- `INACTIVE`
- `SUSPENDED` bila diperlukan

User inactive/suspended tidak dapat membuat session baru.

---

## 3.2 Employee

Business profile anggota NOC.

User account dan employee sebaiknya dipisahkan secara konseptual.

Alasan:

- employee historical harus tetap ada setelah login account dinonaktifkan,
- tidak semua perubahan employee harus dianggap perubahan security identity,
- account dapat ditutup tanpa menghapus record kerja/payroll.

---

## 3.3 Role

Named bundle dari permission.

Baseline system roles:

1. `NOC_MEMBER`
2. `SCHEDULER_SUPERVISOR`
3. `ADMINISTRATOR`

Role tambahan boleh dibuat kemudian bila dibutuhkan.

---

## 3.4 Permission

Capability atomik yang mengizinkan suatu action.

Format rekomendasi:

```text
<domain>.<action>
```

Contoh:

```text
schedule.view_team
schedule.manage
schedule.publish
payroll.calculate
payroll.finalize
access.manage
```

---

## 3.5 Scope

Batas resource terhadap permission.

Baseline:

- `SELF`
- `TEAM`
- `ALL`

Jika hanya ada satu NOC team pada MVP, `TEAM` dan `ALL` dapat terlihat sama secara praktis, tetapi model tetap harus mampu membedakannya untuk skalabilitas.

---

## 3.6 Actor

User/account yang melakukan suatu action.

Audit record harus menyimpan actor identity, bukan hanya nama display.

---

# 4. Baseline Roles

# 4.1 NOC Member

Role default anggota NOC.

Tujuan utama:

- konsumsi informasi,
- melihat jadwal,
- melihat tim,
- melihat payroll,
- membuat request pribadi,
- melihat status request,
- menggunakan fitur personal.

### Allowed Baseline

- login/logout,
- view dashboard,
- view own schedule,
- view team schedule,
- view now on duty,
- view employee directory,
- view employee operational profile,
- view payroll overview,
- view monthly payroll,
- view payroll detail seluruh internal NOC sesuai transparency policy,
- view reports yang ditetapkan internal-readable,
- create self request,
- create self shift swap request,
- cancel own pending request sesuai rule,
- view own notifications,
- manage own profile preference yang diizinkan,
- switch theme.

### Not Allowed Baseline

- edit employee core records,
- edit other employee schedule,
- create/publish schedule,
- approve request,
- create replacement for others kecuali melalui request flow yang diizinkan,
- edit salary,
- edit incentive,
- calculate/finalize/lock payroll,
- manual payroll adjustment,
- edit settings,
- manage roles/access.

---

# 4.2 Scheduler / Supervisor

Role operasional scheduling.

Mewarisi read capability NOC Member dan memperoleh mutation scheduling capability.

### Primary Responsibilities

- create/edit schedule draft,
- bulk assignment,
- resolve scheduling warning,
- publish schedule,
- perform controlled published correction,
- review team coverage,
- review/approve operational request,
- manage replacement,
- manage shift swap,
- record approved operational exception,
- view relevant audit information.

### Explicit Boundary

Scheduler/Supervisor **tidak otomatis** boleh:

- mengubah base salary,
- mengubah incentive rate,
- menambah payroll adjustment,
- finalize/lock payroll,
- mengubah user role,
- mengubah security/access settings.

Jika organisasi ingin satu orang memegang dua responsibility, berikan permission tambahan secara eksplisit atau role gabungan—jangan melemahkan boundary role Scheduler.

---

# 4.3 Administrator

Role administrasi tertinggi baseline aplikasi.

### Primary Responsibilities

- employee management,
- compensation management,
- incentive configuration,
- payroll management,
- schedule management,
- system settings,
- holiday settings,
- audit access,
- role/access management,
- operational correction.

Administrator memiliki mutation capability luas, tetapi tetap tunduk pada:

- validation,
- audit trail,
- lifecycle state,
- payroll lock protection,
- explicit unlock workflow,
- concurrency protection.

`Administrator` tidak boleh menjadi bypass universal terhadap seluruh business rule.

---

# 5. Recommended Permission Catalog

Permission catalog berikut menjadi baseline implementation contract.

## 5.1 Authentication & Profile

```text
auth.login
auth.logout
profile.view_self
profile.edit_self_preferences
```

---

## 5.2 Dashboard

```text
dashboard.view
```

---

## 5.3 Schedule Read

```text
schedule.view_self
schedule.view_team
schedule.view_history
schedule.view_draft
```

`view_draft` hanya untuk actor scheduling/admin baseline.

---

## 5.4 Schedule Mutation

```text
schedule.create_draft
schedule.manage
schedule.bulk_manage
schedule.validate
schedule.publish
schedule.correct_published
schedule.override_warning
schedule.archive_period
```

`override_warning` tidak boleh bypass blocking error.

---

## 5.5 Request & Exception

```text
request.create_self
request.create_for_others
request.view_self
request.view_all
request.cancel_self
request.approve
request.reject
request.manage_exception
request.manage_replacement
request.manage_swap
request.retroactive_correction
```

---

## 5.6 Employee

```text
employee.view
employee.create
employee.edit
employee.activate
employee.deactivate
employee.view_history
```

Hard delete employee historical tidak direkomendasikan sebagai normal permission.

---

## 5.7 Compensation

```text
compensation.view
compensation.manage_salary
compensation.manage_incentive
compensation.view_history
```

Baseline transparency membuat `compensation.view` dapat dimiliki seluruh user bila salary/payroll memang transparan.

Mutation tetap restricted.

---

## 5.8 Payroll Read

```text
payroll.view
payroll.view_detail
payroll.view_history
```

Baseline seluruh NOC Member memiliki ketiganya untuk internal payroll transparency.

---

## 5.9 Payroll Mutation

```text
payroll.calculate
payroll.recalculate
payroll.adjust
payroll.finalize
payroll.lock
payroll.unlock
payroll.correct_historical
```

`payroll.unlock` dan `payroll.correct_historical` adalah high-risk permission.

---

## 5.10 Reports

```text
report.view
report.export
```

Export dapat dipisahkan dari view agar organisasi dapat mengontrol distribusi file jika diperlukan.

---

## 5.11 Activity / Audit

```text
audit.view_operational
audit.view_security
```

Security audit dapat lebih ketat daripada operational audit.

---

## 5.12 Settings

```text
settings.general.manage
settings.shift.manage
settings.payroll.manage
settings.holiday.manage
settings.notification.manage
```

Compensation dan access menggunakan domain permission khusus agar tidak tersamarkan di satu permission `settings.manage` yang terlalu luas.

---

## 5.13 Access Management

```text
access.view
access.manage_role
access.assign_role
access.manage_account_status
```

Optional future granular permission:

```text
access.manage_permission_bundle
```

---

# 6. Baseline Role Permission Matrix

Legend:

- `✓` = allowed baseline
- `—` = denied baseline
- `C` = conditional / scoped

| Capability | NOC Member | Scheduler / Supervisor | Administrator |
|---|---:|---:|---:|
| View Dashboard | ✓ | ✓ | ✓ |
| View Own Schedule | ✓ | ✓ | ✓ |
| View Team Schedule | ✓ | ✓ | ✓ |
| View Published History | ✓ | ✓ | ✓ |
| View Draft Schedule | — | ✓ | ✓ |
| Create/Edit Draft | — | ✓ | ✓ |
| Bulk Schedule | — | ✓ | ✓ |
| Publish Schedule | — | ✓ | ✓ |
| Correct Published Schedule | — | ✓ | ✓ |
| Override Warning | — | C | ✓ |
| Create Own Request | ✓ | ✓ | ✓ |
| View All Requests | — | ✓ | ✓ |
| Approve/Reject Request | — | ✓ | ✓ |
| Retroactive Exception Correction | — | C | ✓ |
| View Employee Directory | ✓ | ✓ | ✓ |
| Edit Employee | — | — | ✓ |
| View Compensation/Payroll | ✓ | ✓ | ✓ |
| Manage Base Salary | — | — | ✓ |
| Manage Shift Incentive | — | — | ✓ |
| Calculate Payroll | — | — | ✓ |
| Add Payroll Adjustment | — | — | ✓ |
| Finalize Payroll | — | — | ✓ |
| Lock Payroll | — | — | ✓ |
| Unlock Payroll | — | — | C |
| View Reports | ✓ | ✓ | ✓ |
| Export Reports | C | ✓ | ✓ |
| View Operational Audit | —/C | ✓ | ✓ |
| View Security Audit | — | — | ✓ |
| Manage General Settings | — | — | ✓ |
| Manage Shift Settings | — | C | ✓ |
| Manage Payroll Settings | — | — | ✓ |
| Manage User Roles/Access | — | — | ✓ |

Matrix ini adalah baseline product policy dan dapat dipertajam pada implementation, tetapi perubahan yang melemahkan separation of duties harus diperlakukan sebagai keputusan produk.

---

# 7. Internal Payroll Transparency Policy

## 7.1 Baseline Rule

Sesuai requirement produk, payroll tidak dianggap rahasia antaruser internal NOC.

Karena itu seluruh user aktif baseline boleh melihat:

- payroll list bulanan,
- base salary yang digunakan pada payroll,
- shift count,
- incentive breakdown,
- adjustment yang memang ditetapkan visible,
- calculated take home pay,
- historical payroll.

---

## 7.2 Mutation Remains Restricted

Transparansi payroll tidak memberi permission mutation.

NOC Member dan Scheduler tidak dapat mengubah angka finansial hanya karena dapat membacanya.

---

## 7.3 Sensitive Security Data Remains Private

Internal transparency tidak mencakup:

- password hash,
- session/token,
- authentication secret,
- recovery credential,
- infrastructure secret,
- private API key,
- security metadata yang tidak perlu diketahui user umum.

Produk transparan bukan berarti security boundary dihapus.

---

## 7.4 Adjustment Visibility

Jika adjustment memiliki note yang bersifat operasional, baseline dapat ditampilkan.

Jika kelak terdapat adjustment dengan informasi HR sensitif, sistem harus menyediakan category/policy khusus daripada menyembunyikan semua payroll secara global.

---

# 8. Schedule Authorization Rules

## 8.1 Published Schedule Is Readable by All Active Users

Seluruh user aktif dapat melihat published team schedule.

---

## 8.2 Draft Schedule Is Restricted

Draft schedule hanya dapat dilihat oleh actor dengan:

`schedule.view_draft`

Tujuannya mencegah anggota menganggap draft sebagai jadwal resmi.

---

## 8.3 Schedule Mutation Requires Explicit Permission

Create/edit assignment membutuhkan:

`schedule.manage`

Bulk operation membutuhkan:

`schedule.bulk_manage`

Publish membutuhkan:

`schedule.publish`

---

## 8.4 Published Correction Is Separate

Permission mengedit draft tidak otomatis memberi permission mengoreksi published schedule.

Published correction menggunakan:

`schedule.correct_published`

Perubahan harus tetap mengikuti PRD-03:

- validation,
- actor,
- timestamp,
- before/after,
- notification policy,
- payroll impact awareness.

---

## 8.5 Blocking Errors Cannot Be Overridden

`schedule.override_warning` hanya berlaku untuk warning yang memang overrideable.

Permission apapun tidak boleh mengubah blocking validation menjadi valid secara diam-diam.

---

# 9. Request & Approval Authorization

## 9.1 Self Request

NOC Member dapat membuat request untuk dirinya sendiri dengan:

`request.create_self`

Client tidak boleh mengizinkan user mengganti `employee_id` target ke user lain melalui payload manipulation.

Backend harus resolve target dari authenticated identity untuk self-scoped operation.

---

## 9.2 Request for Other Employee

Hanya actor dengan:

`request.create_for_others`

boleh membuat request/exception atas nama employee lain.

Use case:

- supervisor mencatat emergency leave,
- admin melakukan historical correction.

---

## 9.3 Approval

Approval membutuhkan:

`request.approve`

Reject membutuhkan permission setara atau `request.reject` jika dipisah.

---

## 9.4 Self-Approval Guard

Baseline recommendation:

> Requester tidak boleh approve request miliknya sendiri.

Jika actor memiliki role Administrator dan emergency override diperlukan, gunakan explicit override flow dengan:

- special permission atau admin policy,
- reason wajib,
- audit trail.

Jangan membuat self-approval normal hanya karena actor adalah admin.

---

## 9.5 Shift Swap Requires Authorization for Both Sides

User dapat mengusulkan swap hanya untuk shift miliknya.

Swap tidak efektif sampai:

- counterpart acceptance tersedia jika policy mengharuskan,
- approver yang berhak menyetujui,
- seluruh validation PRD-05 lolos.

Permission tidak boleh membuat invalid swap menjadi valid.

---

# 10. Payroll Authorization Rules

## 10.1 Payroll Read

Baseline seluruh active internal user memiliki:

```text
payroll.view
payroll.view_detail
payroll.view_history
```

---

## 10.2 Calculation

Menjalankan calculation membutuhkan:

`payroll.calculate`

Recalculation dapat menggunakan permission terpisah:

`payroll.recalculate`

atau digabung pada MVP jika implementasi ingin sederhana.

---

## 10.3 Adjustment

Manual adjustment membutuhkan:

`payroll.adjust`

Permission ini high-risk karena dapat mengubah THP.

Setiap adjustment tetap wajib menyimpan reason dan audit metadata sesuai PRD-04.

---

## 10.4 Finalization

Finalization membutuhkan:

`payroll.finalize`

Actor tidak boleh finalize payroll yang masih:

- dirty,
- incomplete,
- memiliki blocking error.

Authorization tidak bypass lifecycle validity.

---

## 10.5 Lock

Lock membutuhkan:

`payroll.lock`

Lock adalah explicit action.

---

## 10.6 Unlock

Unlock membutuhkan:

`payroll.unlock`

Unlock harus dianggap exceptional.

Minimum controls:

- permission khusus,
- reason wajib,
- actor,
- timestamp,
- audit event,
- warning bahwa historical payroll akan dibuka kembali untuk mutation.

---

## 10.7 Recommended Separation of Duties

Pada organisasi yang lebih besar, direkomendasikan memisahkan:

- actor yang menghitung payroll,
- actor yang finalize,
- actor yang unlock.

Untuk MVP internal kecil, satu Administrator boleh memegang capability tersebut, tetapi permission tetap dibuat terpisah agar separation dapat diterapkan tanpa refactor besar.

---

# 11. Compensation Authorization

## 11.1 Base Salary Management

Mengubah base salary membutuhkan:

`compensation.manage_salary`

Perubahan wajib effective-dated dan auditable.

---

## 11.2 Incentive Management

Mengubah shift incentive membutuhkan:

`compensation.manage_incentive`

Scheduler tidak otomatis mendapat capability ini.

---

## 11.3 Historical Configuration

View historical compensation dapat diberikan luas sesuai transparency policy, tetapi mutation historical harus melalui correction workflow jika diizinkan.

---

# 12. Employee & Account Authorization

## 12.1 Employee Read

Seluruh active internal user baseline memiliki `employee.view` untuk directory dan operational profile.

---

## 12.2 Employee Mutation

Create/edit/deactivate employee baseline Administrator only.

Deactivation tidak boleh menghapus historical schedule/payroll.

---

## 12.3 Account Status

Mengaktifkan/nonaktifkan account security membutuhkan:

`access.manage_account_status`

Employee active status dan login account status harus dapat dibedakan.

---

# 13. Access Management Rules

## 13.1 Access Settings

Canonical page sesuai PRD-06:

`/settings/access`

Hanya user dengan `access.view` dapat membuka halaman.

Mutation membutuhkan permission terkait.

---

## 13.2 Role Assignment

Mengubah role user membutuhkan:

`access.assign_role`

Mutation harus menyimpan before/after.

---

## 13.3 Role Definition

Jika custom roles didukung, membuat atau mengubah role membutuhkan:

`access.manage_role`

Untuk MVP, predefined roles lebih aman dan sederhana.

---

## 13.4 Self-Privilege Escalation

Sistem harus mencegah user menaikkan privilege dirinya sendiri melalui payload atau UI manipulation tanpa authority yang benar.

Baseline safe rule:

- role/access mutation selalu dievaluasi dari permission actor **sebelum mutation**,
- target role tidak boleh memiliki capability di luar grant boundary actor jika granular delegation diterapkan,
- perubahan access menghasilkan security audit event.

---

## 13.5 Last Administrator Guard

Sistem tidak boleh membiarkan operasi normal menghasilkan kondisi tanpa administrator aktif yang dapat mengelola access.

Contoh blocking:

- menonaktifkan satu-satunya Administrator,
- menghapus role Administrator terakhir dari dirinya sendiri,
- menonaktifkan account admin terakhir.

Harus ada minimal satu active account dengan administrative access yang cukup untuk recovery operasional.

---

# 14. Navigation & UI Permission Behavior

## 14.1 Hide Unauthorized Management Pages

Menu management yang tidak dapat digunakan user sebaiknya tidak ditampilkan.

Contoh NOC Member tidak perlu melihat:

- Manage Schedule,
- Access Settings,
- Payroll processing action.

---

## 14.2 Do Not Hide Transparent Read Data

Karena team schedule/payroll memang transparent, jangan menyembunyikannya hanya karena user bukan admin.

---

## 14.3 Action-Level Authorization

Pada halaman yang sama, action dapat berbeda berdasarkan permission.

Contoh Monthly Payroll:

NOC Member:

- view list,
- open detail.

Administrator:

- view,
- calculate,
- adjust,
- finalize,
- lock.

Gunakan satu canonical page; jangan duplikasi halaman hanya berdasarkan role.

---

## 14.4 Unauthorized Direct Route

Jika authenticated user membuka route tanpa permission:

- tampilkan 403/Access Denied yang jelas,
- jangan redirect diam-diam ke halaman lain tanpa penjelasan,
- jangan bocorkan data restricted dalam response awal.

---

## 14.5 Disabled vs Hidden

Gunakan **hidden** untuk action yang memang tidak relevan karena user tidak punya permission.

Gunakan **disabled** bila user biasanya memiliki action tersebut tetapi saat ini terhalang lifecycle/state.

Contoh:

- NOC Member tidak punya `Finalize Payroll` → hidden.
- Admin punya permission tapi payroll masih dirty → button visible disabled dengan explanation.

Ini membedakan authorization dengan business-state validation.

---

# 15. Authorization Evaluation Model

Rekomendasi evaluation conceptual:

```text
ALLOW when:
1. authenticated user is active
2. permission exists
3. requested scope includes target resource
4. resource state allows operation
5. domain validation passes
6. no explicit security guard blocks action
```

Authorization dan domain validation adalah dua langkah berbeda.

Contoh:

Admin mungkin memiliki `payroll.finalize`, tetapi finalize tetap gagal bila payroll dirty.

---

# 16. Scope Evaluation

## 16.1 SELF

Resource harus terkait employee/user milik actor.

Contoh:

- create own request,
- cancel own request,
- edit own preferences.

---

## 16.2 TEAM

Resource berada pada NOC team yang sama dengan actor.

Useful jika aplikasi kelak memiliki beberapa NOC group/site.

---

## 16.3 ALL

Actor dapat melakukan action terhadap seluruh resource dalam installation/application scope.

Biasanya hanya administrative capability.

---

# 17. Account Lifecycle & Authorization

## 17.1 Active

User dapat login dan authorization dievaluasi normal.

---

## 17.2 Inactive

User tidak boleh login baru.

Existing session harus dicabut atau menjadi invalid sesuai session policy.

Historical actor reference tetap tersedia.

---

## 17.3 Employee Inactive but Account Active

Baseline tidak direkomendasikan kecuali ada use case khusus.

Jika terjadi, mutation operational sebaiknya dibatasi secara eksplisit.

---

# 18. Audit Requirements

High-risk authorization event minimal mencatat:

- actor user ID,
- target resource/user,
- permission/action,
- before,
- after,
- timestamp,
- request correlation ID bila tersedia,
- reason jika required,
- success/failure untuk security-sensitive event bila policy mengaktifkan.

Audit detail penuh didefinisikan di PRD-09.

---

# 19. Security Guardrails

## 19.1 Never Trust Role from Client

Client tidak boleh mengirim role lalu backend mempercayainya.

Role/permission harus di-resolve dari authenticated server-side identity/session.

---

## 19.2 Never Trust Target Employee for Self-Scoped Action

Untuk `SELF` operation, backend harus memastikan target memang actor-associated employee.

---

## 19.3 Permission Cache Must Be Invalidatable

Jika implementation menggunakan cache permission/session claim, perubahan role harus dapat efektif tanpa menunggu terlalu lama.

High-risk access revocation sebaiknya mem-invalidasi active session/token sesuai security architecture.

---

## 19.4 Backend Must Protect Bulk APIs

Bulk API tidak boleh memeriksa permission hanya sekali lalu mengabaikan scope masing-masing target.

Semua target harus berada dalam scope yang diizinkan.

---

## 19.5 Export Is an Authorization Action

Export data bukan sekadar UI utility.

Jika export membutuhkan permission, backend harus mengecek `report.export` atau permission domain yang sesuai.

---

# 20. Failure Behavior

## 20.1 Unauthenticated

Return equivalent:

`401 Unauthorized`

UI mengarahkan ke login.

---

## 20.2 Authenticated but Forbidden

Return equivalent:

`403 Forbidden`

UI menampilkan access denied.

---

## 20.3 Invalid Business State

Jangan gunakan 403 untuk state validation.

Contoh:

Admin memiliki permission finalize tetapi payroll dirty.

Itu adalah validation/conflict domain, bukan authorization failure.

---

# 21. Permission Change Workflow

Baseline flow:

1. Authorized admin membuka Access Settings.
2. Pilih user.
3. Lihat current role/permissions.
4. Pilih role baru atau capability yang diperbolehkan.
5. UI menampilkan impact summary.
6. Confirm perubahan.
7. Backend revalidates actor authority.
8. Persist change atomically.
9. Create security audit event.
10. Invalidate permission/session cache jika diperlukan.
11. UI merefresh effective capability.

Role change yang menghilangkan permission user harus efektif segera atau dalam batas session policy yang eksplisit.

---

# 22. Default Role Assignment

Ketika employee/user baru dibuat:

- default role: `NOC_MEMBER`,
- jangan default ke Scheduler atau Administrator,
- privilege escalation harus action terpisah.

Ini mengikuti deny-by-default dan least privilege.

---

# 23. Bootstrap Administrator

Karena sistem membutuhkan administrator pertama, deployment/bootstrap harus menyediakan mekanisme aman untuk membuat initial admin.

Contoh pendekatan final dapat berupa:

- seed environment-controlled admin,
- setup command,
- first-run provisioning yang hanya tersedia sebelum initial setup selesai.

Mechanism final didefinisikan pada Technical Architecture / Deployment PRD.

Setelah initial admin tersedia, public self-registration admin tidak diperbolehkan.

---

# 24. Future Custom Role Model

MVP direkomendasikan mulai dengan tiga predefined roles.

Future enhancement dapat menyediakan custom role seperti:

- Payroll Manager,
- Read-only Auditor,
- Shift Coordinator,
- Team Lead.

Namun custom roles harus tetap menggunakan permission catalog yang sama.

Jangan membuat business logic khusus per nama role baru.

---

# 25. Business Rules Registry

Rule ID berikut harus dapat dipakai sebagai referensi test/implementation.

- `AUTHZ-001` — Authenticated user tidak otomatis memiliki mutation rights.
- `AUTHZ-002` — Deny by default untuk permission yang tidak dimiliki.
- `AUTHZ-003` — Published team schedule readable oleh active internal users.
- `AUTHZ-004` — Draft schedule restricted ke `schedule.view_draft`.
- `AUTHZ-005` — Schedule mutation membutuhkan explicit permission.
- `AUTHZ-006` — Publish membutuhkan `schedule.publish`.
- `AUTHZ-007` — Published correction membutuhkan permission terpisah.
- `AUTHZ-008` — Override permission tidak bypass blocking validation.
- `AUTHZ-009` — Self request target harus resolved/validated terhadap actor.
- `AUTHZ-010` — Request approval membutuhkan explicit permission.
- `AUTHZ-011` — Normal self-approval request dilarang.
- `AUTHZ-012` — Payroll read transparent untuk internal active users sesuai baseline policy.
- `AUTHZ-013` — Payroll mutation terpisah dari payroll read.
- `AUTHZ-014` — Manual adjustment membutuhkan `payroll.adjust`.
- `AUTHZ-015` — Finalize membutuhkan `payroll.finalize` + valid lifecycle.
- `AUTHZ-016` — Lock membutuhkan `payroll.lock`.
- `AUTHZ-017` — Unlock membutuhkan high-risk `payroll.unlock` + reason + audit.
- `AUTHZ-018` — Salary mutation membutuhkan `compensation.manage_salary`.
- `AUTHZ-019` — Incentive mutation membutuhkan `compensation.manage_incentive`.
- `AUTHZ-020` — Scheduler tidak otomatis memiliki compensation/payroll mutation.
- `AUTHZ-021` — Access mutation membutuhkan dedicated access permission.
- `AUTHZ-022` — Role changes selalu auditable.
- `AUTHZ-023` — Client-provided role/permission tidak dipercaya.
- `AUTHZ-024` — Unauthorized direct URL/API tetap ditolak server-side.
- `AUTHZ-025` — User inactive tidak dapat membuat session baru.
- `AUTHZ-026` — Historical actor reference tidak dihapus saat account inactive.
- `AUTHZ-027` — Default new user role adalah NOC Member.
- `AUTHZ-028` — Last active administrator tidak boleh dihapus/dinonaktifkan melalui normal workflow.
- `AUTHZ-029` — Hidden UI bukan security enforcement.
- `AUTHZ-030` — Disabled action karena lifecycle dibedakan dari hidden action karena permission.
- `AUTHZ-031` — Bulk mutation wajib memvalidasi scope seluruh target.
- `AUTHZ-032` — Export dapat memiliki permission terpisah dari view.
- `AUTHZ-033` — Access revocation harus dapat menginvalidasi effective authorization secara tepat waktu.
- `AUTHZ-034` — Administrator tetap tunduk pada domain validation dan historical lock.
- `AUTHZ-035` — Employee deactivation tidak menghapus historical schedule/payroll.
- `AUTHZ-036` — Security secrets tidak termasuk internal transparency.
- `AUTHZ-037` — Custom role future harus berbasis permission catalog, bukan hardcoded branching.
- `AUTHZ-038` — Permission check dan domain validation harus dipisahkan.
- `AUTHZ-039` — Self privilege escalation melalui payload/manipulasi client harus ditolak.
- `AUTHZ-040` — High-risk mutation wajib meninggalkan audit trail.

---

# 26. Authorization Acceptance Test Matrix

| Case | Actor | Action | Expected |
|---|---|---|---|
| Member views team schedule | NOC Member | Read | Allow |
| Member views another employee payroll | NOC Member | Read | Allow per transparency policy |
| Member edits another schedule | NOC Member | Mutation | Deny |
| Member crafts API to publish schedule | NOC Member | Mutation | 403 |
| Scheduler edits draft | Scheduler | Mutation | Allow |
| Scheduler publishes valid schedule | Scheduler | Mutation | Allow |
| Scheduler publishes schedule with blocking conflict | Scheduler | Mutation | Deny by validation |
| Scheduler changes salary | Scheduler | Mutation | 403 |
| Scheduler approves another member request | Scheduler | Approval | Allow |
| Scheduler approves own request | Scheduler | Approval | Deny baseline |
| Admin changes base salary | Administrator | Mutation | Allow + audit |
| Admin calculates payroll | Administrator | Mutation | Allow |
| Admin finalizes dirty payroll | Administrator | Mutation | Deny by lifecycle validation |
| Admin locks finalized payroll | Administrator | Mutation | Allow + audit |
| Admin without unlock capability attempts unlock | Administrator/custom | Mutation | 403 |
| Authorized unlock | Authorized Admin | Mutation | Allow only with reason + audit |
| Member manually changes client role to admin | NOC Member | Crafted Request | Deny |
| Direct URL to settings/access | NOC Member | Read | 403 |
| Last admin deactivates own admin account | Administrator | Mutation | Blocking guard |
| Inactive account logs in | Inactive User | Authentication | Deny |
| Role revoked during active session | Any | Subsequent protected action | New permission state enforced according to invalidation policy |

---

# 27. Non-Functional Requirements

## 27.1 Performance

Permission evaluation harus cukup ringan untuk diterapkan pada setiap protected request.

Tidak boleh menghilangkan authorization hanya demi performance.

---

## 27.2 Consistency

Action yang sama melalui UI, API, bulk endpoint, atau future mobile client harus menghasilkan authorization decision yang konsisten.

---

## 27.3 Testability

Permission evaluator harus dapat diuji secara deterministic.

Business rule ID `AUTHZ-*` harus dapat dijadikan contract tests.

---

## 27.4 Explainability

Untuk internal debugging/admin, sistem harus dapat menjelaskan secara aman mengapa action ditolak:

- permission missing,
- scope mismatch,
- account inactive,
- lifecycle invalid,

namun error ke end-user tidak boleh membocorkan security detail yang tidak perlu.

---

# 28. MVP Scope

MVP wajib memiliki:

- authenticated users,
- predefined three roles,
- permission-based backend guards,
- read transparency schedule/payroll,
- schedule mutation restriction,
- request approval restriction,
- compensation mutation restriction,
- payroll lifecycle permissions,
- access management restriction,
- audit event untuk high-risk mutation,
- inactive account handling,
- last-administrator protection,
- route/action permission awareness.

---

# 29. Post-MVP Enhancements

Future enhancement:

- custom roles,
- permission bundle editor,
- site/team scoped access,
- read-only auditor role,
- temporary delegated permission,
- approval delegation,
- dual-approval untuk high-risk payroll correction,
- richer security event viewer,
- session/device management,
- policy-based export restriction.

Fitur tersebut tidak boleh mengubah prinsip dasar deny-by-default dan backend enforcement.

---

# 30. Relationship to Other PRDs

### PRD-03 — Scheduling

PRD-07 menentukan **siapa** yang boleh menjalankan scheduling action. PRD-03 menentukan apakah scheduling action tersebut valid secara bisnis.

### PRD-04 — Payroll

PRD-07 menentukan siapa yang boleh calculate/finalize/lock/unlock. PRD-04 menentukan lifecycle dan hasil perhitungannya.

### PRD-05 — Exceptions

PRD-07 menentukan siapa yang boleh create/approve/correct exception. PRD-05 menentukan dampak exception pada operational state dan payroll.

### PRD-06 — Navigation

PRD-06 menentukan lokasi halaman. PRD-07 menentukan visibility/action pada halaman tersebut.

### PRD-08 — Data Model

PRD-08 harus menyediakan entity/relationship yang cukup untuk:

- users,
- employees,
- roles,
- permissions,
- assignments,
- audit references,
- historical access changes.

### PRD-09 — Audit Trail

PRD-09 akan memperdalam storage, retention, query, rendering, dan immutability audit event.

---

# 31. Final Product Contract

NOCScheduler menggunakan model akses internal yang **transparan untuk membaca namun ketat untuk mengubah**.

Kontrak utama:

1. Semua anggota NOC aktif dapat memahami jadwal tim tanpa hambatan permission yang tidak perlu.
2. Payroll internal dapat dibaca antaranggota sesuai requirement transparansi produk.
3. Hak melihat tidak pernah memberi hak mengubah.
4. Scheduler memiliki kekuatan operasional scheduling, bukan kekuatan finansial secara otomatis.
5. Administrator memiliki capability luas tetapi tetap tunduk pada validation, lifecycle, lock, dan audit.
6. Permission harus ditegakkan server-side.
7. Role adalah bundle permission, bukan hardcoded business logic.
8. High-risk action wajib auditable.
9. Privilege escalation tanpa authorization harus mustahil melalui normal maupun crafted client flow.
10. Historical data dan actor reference tetap dapat dijelaskan walaupun role/account berubah.

Dengan kontrak ini, NOCScheduler dapat tetap terasa terbuka dan nyaman untuk tim internal tanpa mengorbankan integritas jadwal, payroll, dan konfigurasi sistem.
