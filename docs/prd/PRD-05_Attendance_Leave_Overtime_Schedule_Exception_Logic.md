# PRD-05 — Attendance, Leave, Overtime & Schedule Exception Logic

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Business Logic  
> **Document ID:** PRD-05  
> **Status:** Draft — Workforce Exception Logic Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements; PRD-02 — Feature Specification; PRD-03 — Scheduling & Shift Business Logic; PRD-04 — Payroll, Salary & Incentive Logic  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Purpose

Dokumen ini mendefinisikan aturan bisnis untuk seluruh kondisi yang membuat realitas operasional berbeda dari jadwal shift reguler.

PRD-05 menjadi source of truth untuk menjawab pertanyaan:

> **“Apa yang terjadi ketika seorang NOC tidak mengikuti shift regulernya, membutuhkan pengganti, bertukar shift, cuti, sakit, izin, training, dinas, bekerja lembur, atau terkena exception operasional lain?”**

Dokumen ini juga menentukan bagaimana exception tersebut:

- berhubungan dengan published schedule,
- memengaruhi status kerja per `work_date`,
- memengaruhi coverage,
- memengaruhi eligibility insentif shift,
- memengaruhi payroll freshness,
- membutuhkan approval,
- dicatat dalam audit trail,
- ditampilkan kepada user,
- ditangani jika dibuat secara retroaktif.

PRD-05 tidak mengubah prinsip PRD-03 bahwa satu employee hanya memiliki satu **primary work state** pada satu `work_date`. Overtime, replacement, swap, dan exception lain harus dimodelkan secara eksplisit, bukan dengan membuat duplicate primary shift secara diam-diam.

---

# 2. Core Principles

## EP-01 — Planned Schedule and Operational Reality Are Different Layers

Published schedule merepresentasikan rencana kerja resmi.

Exception merepresentasikan fakta atau perubahan operasional terhadap rencana tersebut.

Sistem tidak boleh kehilangan salah satu layer.

Contoh:

- Planned: Budi — Shift 3
- Exception: Sick
- Replacement: Andi covers Budi's Shift 3

Historical view harus tetap dapat menjelaskan ketiganya.

---

## EP-02 — Never Rewrite History Silently

Exception tidak boleh menghapus jejak assignment original.

Jika shift Budi digantikan Andi, sistem harus tetap mampu menjelaskan:

- siapa awalnya dijadwalkan,
- siapa tidak dapat bekerja,
- siapa menggantikan,
- siapa menyetujui,
- kapan perubahan terjadi.

---

## EP-03 — One Primary Work State Still Applies

Untuk satu employee dan satu `work_date`, tetap berlaku satu primary work state.

Exception tidak boleh menciptakan kondisi seperti:

- regular Shift 2 + OFF sebagai dua state aktif,
- Shift 3 + Sick sebagai dua primary states,
- Leave + Shift 1 tanpa treatment yang eksplisit.

Exception harus mengubah atau meng-overlay eligibility/status assignment secara terkontrol.

---

## EP-04 — Overtime Is Not a Primary Shift

Overtime adalah record tambahan terhadap pekerjaan normal atau approved extra work.

Overtime tidak boleh digunakan sebagai workaround untuk memberikan dua primary shift kepada satu employee pada tanggal yang sama.

---

## EP-05 — Exception Must Be Explainable

Setiap exception yang memengaruhi jadwal, coverage, atau payroll harus memiliki sumber yang dapat ditelusuri.

Minimum metadata:

- employee,
- exception type,
- date/range,
- affected assignment jika ada,
- status,
- actor/requester,
- reason/note sesuai policy,
- approver bila diperlukan,
- timestamp,
- payroll treatment snapshot/reference bila relevan.

---

## EP-06 — No Attendance Assumption

NOCScheduler tidak boleh menyimpulkan bahwa seseorang hadir hanya karena memiliki published shift.

Sebelum attendance tracking aktual diimplementasikan, sistem membedakan:

- **scheduled**,
- **exception recorded**,
- **actual attendance unknown**.

Label UI dan payroll harus jujur terhadap sumber data tersebut.

---

## EP-07 — Approval Is a State Transition, Not a Boolean

Request yang membutuhkan approval harus memiliki lifecycle yang jelas.

Tidak cukup hanya menyimpan `approved = true/false`.

Minimal states:

- `DRAFT` jika draft request didukung,
- `PENDING`,
- `APPROVED`,
- `REJECTED`,
- `CANCELLED`,
- `SUPERSEDED` bila diganti oleh record koreksi baru.

---

## EP-08 — Payroll Impact Must Be Explicit

Exception tidak boleh otomatis menghasilkan earning atau deduction tanpa rule yang jelas.

Setiap exception type harus mempunyai payroll treatment yang eksplisit, misalnya:

- tidak memengaruhi base salary,
- membuat regular shift non-incentive-eligible,
- menghasilkan overtime earning,
- menghasilkan manual review requirement.

---

## EP-09 — Approved Operational Changes Affect Coverage

Coverage harus mencerminkan operational assignment yang berlaku, bukan hanya planned assignment original.

Jika Budi sakit dan Andi menggantikan:

- Budi tidak dihitung sebagai available coverage,
- Andi dihitung sebagai coverage bila replacement efektif dan valid.

---

## EP-10 — Retroactive Change Is Allowed Only with Awareness

Exception dapat perlu dimasukkan setelah tanggal kejadian.

Retroactive correction diperbolehkan sesuai permission, tetapi harus:

- memiliki actor,
- reason,
- timestamp,
- audit trail,
- payroll impact awareness,
- tidak mengubah payroll `LOCKED` secara otomatis.

---

# 3. Core Terminology

## 3.1 Schedule Exception

Record yang menyatakan kondisi operasional khusus terhadap satu employee pada satu tanggal atau rentang tanggal.

Contoh:

- Leave
- Sick
- Permission
- Training
- Business Duty
- Unavailable
- Emergency Leave

Exception dapat terkait langsung dengan assignment tertentu atau berlaku terhadap date range sebelum assignment dibuat.

---

## 3.2 Attendance Status

Status aktual kehadiran jika modul attendance kelak diaktifkan.

Baseline PRD-05 **tidak mewajibkan punch-in/punch-out**.

Architecture harus tetap menyediakan ruang untuk status seperti:

- Present
- Absent
- Late
- Early Leave
- Excused

namun payroll tidak boleh menggunakan status tersebut sebelum data aktual tersedia dan rule diaktifkan.

---

## 3.3 Leave Request

Permohonan agar employee tidak menjalankan regular work state pada tanggal tertentu karena leave category yang berlaku.

---

## 3.4 Overtime Record

Record pekerjaan tambahan yang dilakukan di luar primary shift normal atau tambahan durasi terhadap shift yang disetujui.

Minimum conceptual fields:

- employee,
- work date,
- related assignment optional,
- start datetime,
- end datetime,
- duration minutes,
- status,
- reason,
- approver,
- payroll policy reference,
- generated payroll amount/reference jika sudah dihitung.

---

## 3.5 Replacement Assignment

Record yang menyatakan employee pengganti mengambil coverage untuk assignment milik employee lain.

Replacement harus memiliki hubungan dengan assignment/coverage yang digantikan.

---

## 3.6 Shift Swap

Pertukaran assignment antara dua employee.

Swap bukan dua edit independen. Secara bisnis swap harus diproses sebagai satu transaksi/logical operation agar tidak meninggalkan kondisi setengah jadi.

---

## 3.7 Public Holiday

Tanggal kalender yang ditandai sebagai hari libur operasional/nasional sesuai konfigurasi organisasi.

Public holiday **tidak otomatis berarti NOC berhenti bekerja**, karena NOC dapat tetap menjalankan shift 24/7.

---

## 3.8 Availability

Informasi bahwa employee tersedia atau tidak tersedia untuk scheduling pada date/range tertentu.

Availability berbeda dari published schedule dan berbeda dari approved leave.

Contoh:

- unavailable preference sebelum schedule dibuat,
- approved leave setelah schedule dibuat.

---

# 4. Exception Type Model

Sistem harus mendukung exception type yang configurable tetapi memiliki stable system category.

Minimum baseline categories:

| Code | Category | Purpose | Priority |
|---|---|---|---|
| LEAVE | Leave | Cuti terencana | P1 |
| SICK | Sick | Sakit | P1 |
| PERMISSION | Permission | Izin | P1 |
| TRAINING | Training | Training resmi | P1 |
| BUSINESS_DUTY | Business Duty | Dinas/tugas perusahaan | P1 |
| EMERGENCY | Emergency | Kondisi darurat | P1 |
| UNAVAILABLE | Availability | Tidak tersedia untuk scheduling | P1 |
| OVERTIME | Overtime | Kerja tambahan | P1 |
| REPLACEMENT | Replacement | Menggantikan shift orang lain | P1 |
| SWAP | Shift Swap | Pertukaran shift | P1 |

Nama tampilan dapat dikonfigurasi, tetapi system category tidak boleh bergantung pada label UI.

---

# 5. Exception Configuration

Setiap exception type dapat memiliki konfigurasi berikut:

- display name,
- short label,
- active/inactive,
- requires approval,
- reason required,
- attachment allowed/required future,
- allowed request lead time,
- allowed retroactive window,
- affects coverage,
- removes regular shift eligibility,
- preserves base salary by default,
- incentive treatment,
- notification policy,
- color/status token,
- effective dates.

Perubahan konfigurasi harus effective-dated jika dapat memengaruhi historical payroll atau eligibility.

---

# 6. Request Lifecycle

## 6.1 PENDING

Request sudah diajukan tetapi belum menjadi operational truth jika policy membutuhkan approval.

PENDING request:

- tidak boleh diam-diam mengubah published schedule,
- dapat ditampilkan sebagai pending indicator,
- dapat memicu scheduler awareness.

---

## 6.2 APPROVED

APPROVED berarti request resmi berlaku.

Approval harus:

- dilakukan actor berhak,
- mencatat approver,
- mencatat timestamp,
- menjalankan conflict validation,
- memperbarui operational projection,
- menandai payroll dirty jika source payroll terkait sudah dihitung.

---

## 6.3 REJECTED

Rejected request tidak memengaruhi operational schedule atau payroll.

Reason rejection direkomendasikan wajib untuk transparansi internal.

---

## 6.4 CANCELLED

Requester atau actor berhak dapat membatalkan request sesuai lifecycle policy.

Approved exception yang sudah efektif tidak boleh sekadar dihapus; cancellation/correction harus tetap meninggalkan history.

---

## 6.5 SUPERSEDED

Digunakan ketika record lama digantikan oleh koreksi baru.

Record superseded tetap dipertahankan untuk audit.

---

# 7. Leave, Sick, Permission, Training & Business Duty

## 7.1 Full-Day / Work-Date Baseline

Untuk baseline implementasi, exception operasional direkomendasikan berbasis `work_date` penuh.

Contoh:

- employee dijadwalkan Shift 2 pada 12 Aug,
- approved Sick untuk `work_date = 12 Aug`,
- regular Shift 2 menjadi tidak eligible sebagai worked shift untuk payroll incentive kecuali policy menyatakan lain.

Partial-day exception dapat ditambahkan setelah attendance/time tracking tersedia.

---

## 7.2 Date Range

Request dapat mencakup beberapa tanggal.

Sistem harus mengevaluasi setiap `work_date` secara individual agar:

- assignment yang terkena dapat diketahui,
- OFF day tidak salah dianggap missed shift,
- payroll impact dapat dijelaskan,
- conflict per hari dapat ditampilkan.

---

## 7.3 Exception on OFF Day

Approved leave pada tanggal yang sudah OFF:

- tidak boleh membuat shift count,
- tidak menghasilkan shift incentive,
- dapat disimpan sebagai leave record bila policy organisasi membutuhkan,
- harus ditampilkan tanpa menyiratkan ada shift yang dibatalkan.

---

## 7.4 Exception on Unassigned Day

Request dapat dibuat sebelum schedule final jika policy mengizinkan.

Approved exception pada unassigned date harus menjadi constraint bagi scheduler sehingga shift reguler baru tidak dapat diberikan tanpa explicit override/correction.

---

## 7.5 Exception on Published Shift

Jika approved exception mengenai published shift:

- original assignment tetap historical,
- operational status assignment menjadi excused/non-working sesuai type,
- coverage harus dihitung ulang,
- regular shift incentive eligibility harus dievaluasi ulang,
- scheduler harus mendapat awareness jika coverage turun.

---

## 7.6 Default Payroll Treatment

Baseline aman untuk LEAVE/SICK/PERMISSION/TRAINING/BUSINESS_DUTY/EMERGENCY:

- **tidak otomatis mengurangi base salary**, karena NOCScheduler bukan payroll statutory engine,
- regular shift yang tidak dijalankan **tidak menghasilkan shift incentive** secara default,
- deduction hanya boleh terjadi melalui configured rule yang eksplisit atau manual adjustment dengan audit,
- jika organisasi ingin exception tertentu tetap mendapat shift incentive, rule tersebut harus dikonfigurasi eksplisit dan effective-dated.

---

# 8. Public Holiday Logic

## 8.1 Holiday Does Not Equal OFF

Karena NOC dapat bekerja 24/7, public holiday tidak otomatis membuat seluruh employee OFF.

Published shift pada public holiday tetap valid.

---

## 8.2 Holiday Metadata

Minimum fields:

- date,
- name,
- holiday type,
- active status,
- notes optional,
- source/config actor.

---

## 8.3 Holiday Compensation

Jika organisasi memberikan insentif tambahan pada hari libur, rule tersebut harus menjadi compensation policy terpisah.

PRD-05 hanya memastikan holiday dapat menjadi input eligible untuk payroll rule.

Tidak boleh otomatis memberikan bonus hanya karena tanggal ditandai holiday jika compensation policy belum dikonfigurasi.

---

# 9. Availability / Unavailability

## 9.1 Availability Is a Scheduling Constraint

Availability digunakan terutama sebelum schedule dipublish.

Contoh:

- employee menyatakan tidak tersedia tanggal 20 Aug,
- scheduler melihat warning/blocking ketika mencoba assign shift pada tanggal tersebut.

---

## 9.2 Preference vs Hard Constraint

Availability dapat memiliki severity:

- `PREFERENCE` — warning,
- `HARD_UNAVAILABLE` — blocking kecuali actor memiliki override permission.

---

## 9.3 Availability Does Not Automatically Pay or Deduct

Availability sendiri tidak memiliki payroll effect sampai berubah menjadi approved operational exception atau actual assignment outcome.

---

# 10. Replacement Logic

## 10.1 Replacement Purpose

Replacement digunakan ketika employee lain mengambil coverage untuk shift yang sebelumnya dimiliki employee original.

Contoh:

- Budi scheduled S3
- Budi sick
- Andi approved replacement untuk S3 tersebut

---

## 10.2 Atomic Operational Result

Replacement approval harus menghasilkan state konsisten:

- original employee marked non-working/excused pada assignment terkait,
- replacement employee menjadi operational worker untuk coverage,
- source relationship tetap tersimpan.

Sistem tidak boleh meninggalkan kondisi sementara di mana keduanya dianggap eligible untuk shift incentive yang sama tanpa rule khusus.

---

## 10.3 Replacement Validation

Sebelum approve replacement, sistem minimal memeriksa:

- replacement employee active,
- tidak memiliki overlapping real datetime,
- tidak melanggar blocking rest rule,
- tidak memiliki approved leave/unavailability conflict,
- affected shift masih valid,
- replacement belum menutup assignment tersebut melalui record lain.

Warning seperti fairness/consecutive night dapat tetap ditampilkan sesuai PRD-03.

---

## 10.4 Payroll Treatment for Replacement

Default rule:

- original employee tidak mendapat shift incentive untuk shift yang tidak dijalankan,
- replacement employee mendapat shift incentive sesuai shift/rate yang benar-benar di-cover,
- assignment source harus dapat ditelusuri sebagai replacement,
- tidak boleh double count.

Base salary original/replacement tidak otomatis berubah hanya karena replacement.

---

# 11. Shift Swap Logic

## 11.1 Swap Definition

Swap adalah pertukaran assignment antara dua employee.

Contoh:

- Budi: 12 Aug S2
- Andi: 13 Aug S3

Approved swap:

- Budi: 13 Aug S3
- Andi: 12 Aug S2

---

## 11.2 Swap Must Be Atomic

Swap harus dieksekusi sebagai satu business transaction.

Jika salah satu sisi gagal validation, seluruh swap gagal.

Tidak boleh terjadi kondisi hanya satu assignment yang berubah.

---

## 11.3 Swap Validation

Minimum validation:

- kedua assignment published dan valid,
- kedua employee active,
- tidak ada datetime overlap setelah swap,
- rest rule diperiksa untuk keduanya,
- leave/unavailability diperiksa,
- coverage tidak menjadi invalid,
- payroll locked period awareness diperiksa,
- affected shift effective version valid.

---

## 11.4 Swap Approval

Baseline workflow:

1. requester mengajukan swap,
2. counterpart menerima/menyetujui partisipasi jika policy mengharuskan,
3. scheduler/supervisor memberi final approval jika policy mengharuskan,
4. system menjalankan final validation,
5. swap diterapkan atomik,
6. audit dan notification dibuat.

Organisasi dapat menyederhanakan approval chain melalui Settings.

---

## 11.5 Payroll Treatment for Swap

Payroll mengikuti assignment operational setelah swap.

Artinya employee yang akhirnya menjalankan S3 memperoleh S3 incentive sesuai work date dan effective rate.

Original planned ownership tidak boleh menjadi sumber incentive setelah swap approved.

---

# 12. Overtime Logic

## 12.1 Overtime Must Be Explicit

Overtime tidak boleh disimpulkan hanya karena:

- shift lintas tengah malam,
- employee memiliki long shift,
- ada gap jadwal,
- user tetap login setelah shift.

Harus ada approved overtime record atau sumber actual attendance yang sah di masa depan.

---

## 12.2 Overtime Time Range

Overtime harus memiliki actual/approved datetime range.

System harus menghitung:

```text
Duration Minutes = end_at - start_at
```

Durasi tidak boleh hanya berupa angka bebas tanpa time range kecuali migration/manual correction workflow khusus.

---

## 12.3 Overtime Overlap

Overtime dapat bersinggungan dengan regular shift hanya jika policy memang mendefinisikan overtime sebagai extension terhadap shift tersebut.

Overtime yang sepenuhnya berada di dalam regular shift tanpa special reason harus menghasilkan warning/blocking karena berpotensi double pay.

---

## 12.4 Overtime Payroll Policy

PRD-05 menentukan eligibility dan quantity overtime; nominal final harus berasal dari configured compensation policy.

Supported policy architecture dapat mengakomodasi:

- fixed amount per approved overtime occurrence,
- amount per hour,
- amount per minute,
- multiplier terhadap configured base rate,
- manual reviewed amount.

Tidak ada policy yang boleh diasumsikan aktif secara default.

Jika overtime approved tetapi tidak ada compensation policy yang valid:

- operational record tetap dapat disimpan,
- payroll calculation harus memberi warning/blocking sesuai configuration,
- sistem tidak boleh diam-diam memberi Rp0 jika overtime ditandai payable.

---

## 12.5 Overtime and Shift Incentive

Regular shift incentive dan overtime earning adalah dua component berbeda.

Overtime tidak otomatis menggandakan Shift 2/Shift 3 count.

---

# 13. Operational Projection

Untuk menampilkan jadwal aktual operasional, sistem harus mampu membentuk **operational projection** dari:

```text
Published Schedule
+ Approved Exceptions
+ Approved Replacement/Swap
+ Approved Overtime
```

Projection bukan destructive rewrite terhadap historical source.

Minimum output per employee/work date:

- planned state,
- effective operational state,
- exception status,
- replacement/swapped indicator,
- payroll eligibility indicator bila user berhak melihat.

---

# 14. Coverage Integration

## 14.1 Planned Coverage

Coverage berdasarkan published schedule sebelum exception.

---

## 14.2 Effective Coverage

Coverage berdasarkan operational projection setelah approved exception.

Dashboard/Now on Duty sebaiknya menggunakan effective operational state apabila exception/replacement tersedia.

---

## 14.3 Coverage Warning

Approval leave/sick/swap/replacement yang membuat coverage di bawah threshold harus:

- menampilkan warning,
- dapat menjadi blocking jika coverage policy mengharuskan,
- memberi context shift/date yang terdampak.

Emergency override dapat diperbolehkan dengan permission + reason.

---

# 15. Payroll Integration

## 15.1 Source Priority

Untuk shift incentive, source eligibility ditentukan dengan urutan konseptual:

1. published assignment ada,
2. approved operational exception diperiksa,
3. replacement/swap ownership diperiksa,
4. final payable worker ditentukan,
5. rate berdasarkan shift identity + `work_date` ditentukan,
6. payroll item dibuat.

---

## 15.2 No Double Incentive

Satu regular shift occurrence tidak boleh menghasilkan dua regular shift incentive kepada dua employee hanya karena terdapat original + replacement records.

Jika organisasi memang memiliki special compensation untuk original employee, komponen tersebut harus menjadi rule terpisah dan bukan duplicate regular shift incentive.

---

## 15.3 Dirty Payroll Trigger

Jika payroll period sudah `CALCULATED`, perubahan berikut harus menandai payroll terkait dirty/outdated:

- exception approved/rejected/cancelled yang mengubah eligibility,
- replacement approved/cancelled,
- shift swap approved/cancelled,
- overtime approved/changed/cancelled,
- holiday classification berubah dan memengaruhi compensation rule,
- exception payroll treatment configuration berubah efektif pada period tersebut.

---

## 15.4 Finalized Payroll

Jika payroll `FINALIZED` tetapi belum `LOCKED`, source exception correction harus menghasilkan strong warning dan memerlukan recalculation/re-finalization.

---

## 15.5 Locked Payroll

Jika payroll `LOCKED`:

- exception historical masih dapat dikoreksi jika permission mengizinkan,
- locked payroll tidak boleh berubah otomatis,
- sistem harus menunjukkan mismatch/correction awareness,
- perubahan finansial harus melalui unlock/correction workflow sesuai PRD-04.

---

# 16. Conflict Validation

Sistem minimal harus mendeteksi:

### Blocking

- duplicate primary state,
- approved leave + operational regular shift tanpa replacement semantics,
- replacement employee overlap,
- swap yang menghasilkan datetime overlap,
- overtime duration <= 0,
- overtime end <= start,
- inactive employee menjadi replacement baru,
- exception type inactive digunakan untuk request baru,
- effective-date mismatch,
- same request applied twice,
- replacement terhadap assignment yang sudah superseded.

### Warning / Configurable

- minimum rest violation,
- excessive consecutive shifts,
- consecutive night shifts,
- low coverage,
- retroactive request,
- overtime unusually long,
- request terlalu dekat dengan shift start,
- exception pada payroll period yang sudah calculated/finalized.

---

# 17. Retroactive Correction

## 17.1 Allowed Use Cases

Contoh:

- sick baru dicatat setelah shift lewat,
- replacement ternyata berbeda dari record awal,
- overtime duration perlu dikoreksi,
- request salah kategori.

---

## 17.2 Retroactive Requirements

Retroactive mutation harus memiliki:

- permission yang sesuai,
- reason wajib,
- before/after,
- actor,
- timestamp,
- affected work date,
- payroll impact detection.

---

## 17.3 No Hard Delete Historical Exception

Exception yang sudah approved dan memengaruhi historical schedule/payroll tidak boleh di-hard-delete melalui normal workflow.

Gunakan:

- cancel,
- supersede,
- correction version.

---

# 18. Notification Logic

Minimum events yang layak menghasilkan in-app notification:

- leave/exception request submitted,
- request approved,
- request rejected,
- request cancelled,
- replacement assigned,
- shift swap requested,
- counterpart response,
- shift swap approved/rejected,
- overtime approved/rejected,
- published schedule affected by exception,
- scheduler coverage warning requiring attention.

Notification tidak menjadi source of truth. Source tetap business record terkait.

---

# 19. Audit Requirements

Perubahan berikut wajib audit:

- create request,
- approve,
- reject,
- cancel,
- supersede,
- retroactive correction,
- replacement assignment,
- swap execution,
- overtime mutation,
- exception configuration change,
- override blocking/warning rule jika override diperbolehkan.

Audit minimal mencatat:

- event type,
- actor,
- target employee(s),
- work date/date range,
- before,
- after,
- reason,
- timestamp,
- source request/reference.

---

# 20. Permission Boundary

Detailed role matrix berada di PRD-07, tetapi PRD-05 menetapkan capability boundary berikut:

### NOC Member

Dapat sesuai policy:

- membuat request sendiri,
- melihat status request,
- menerima/menolak counterpart swap,
- melihat exception tim yang memang transparan secara internal.

Tidak otomatis boleh:

- approve request sendiri,
- membuat payroll-affecting correction untuk orang lain,
- override conflict,
- edit approved historical exception.

### Scheduler / Supervisor

Dapat sesuai permission:

- review request,
- approve/reject,
- assign replacement,
- approve swap,
- melihat coverage impact,
- melakukan operational correction.

### Administrator

Dapat sesuai permission:

- configure exception types,
- configure policy,
- perform exceptional correction,
- manage payroll treatment settings,
- audit history.

---

# 21. MVP / Priority Recommendation

## P0 — Foundation Compatibility

Harus tersedia sejak data model awal walaupun UI belum seluruhnya aktif:

- exception entity model,
- effective status/lifecycle,
- audit compatibility,
- payroll extension point,
- operational projection capability.

## P1 — Recommended First Operational Release

- Leave
- Sick
- Permission
- Training / Business Duty
- Availability
- Replacement
- Shift Swap
- Overtime
- Approval workflow
- Coverage impact
- Payroll dirty integration
- Notifications in-app

## P2 — Enhancement

- partial-day leave,
- attachments,
- multi-step custom approval chain,
- overtime advanced formula,
- recurring availability,
- automatic replacement suggestions,
- balance/quota tracking,
- calendar holiday import.

## P3 — Future

- biometric attendance,
- GPS attendance,
- external HRIS sync,
- statutory payroll integration,
- WhatsApp/Telegram approval integration.

---

# 22. Business Rule Registry

Rules berikut harus dapat diterjemahkan menjadi backend contract tests.

### EXC-001
Planned schedule dan operational exception harus disimpan sebagai layer berbeda.

### EXC-002
Approved exception tidak boleh menghapus original assignment history.

### EXC-003
Satu employee tetap hanya memiliki satu primary work state per `work_date`.

### EXC-004
Overtime bukan primary shift.

### EXC-005
PENDING request tidak mengubah operational truth jika approval diwajibkan.

### EXC-006
APPROVED request harus mencatat approver dan timestamp.

### EXC-007
Rejected request tidak memengaruhi schedule/payroll.

### EXC-008
Approved historical exception tidak boleh hard-delete melalui normal workflow.

### EXC-009
Leave/Sick/Permission default tidak mengurangi base salary secara otomatis.

### EXC-010
Regular shift yang tidak dijalankan karena approved non-working exception default tidak mendapat shift incentive.

### EXC-011
OFF tidak menjadi shift hanya karena ada leave record.

### EXC-012
Approved exception pada unassigned date menjadi scheduling constraint sesuai policy.

### EXC-013
Public holiday tidak otomatis membuat NOC OFF.

### EXC-014
Public holiday tidak otomatis menghasilkan bonus tanpa compensation rule.

### EXC-015
Availability preference bukan operational exception yang payable.

### EXC-016
Hard unavailable harus memblokir assignment baru kecuali override permission berlaku.

### EXC-017
Replacement harus mereferensikan coverage/assignment yang digantikan.

### EXC-018
Original dan replacement tidak boleh sama-sama mendapat regular shift incentive untuk satu shift occurrence secara default.

### EXC-019
Replacement employee harus lolos datetime overlap validation.

### EXC-020
Replacement employee yang inactive tidak boleh menerima replacement baru.

### EXC-021
Shift swap harus atomik.

### EXC-022
Jika satu sisi swap gagal validation, seluruh swap gagal.

### EXC-023
Payroll incentive setelah approved swap mengikuti employee yang menjadi operational worker.

### EXC-024
Overtime harus memiliki explicit approved record atau source actual attendance yang sah.

### EXC-025
Overtime duration dihitung dari datetime range.

### EXC-026
Overtime tidak menambah regular shift count.

### EXC-027
Payable overtime tanpa compensation policy valid tidak boleh diam-diam dihitung Rp0.

### EXC-028
Approved exception harus memengaruhi effective coverage jika type memengaruhi availability.

### EXC-029
Now on Duty harus menggunakan operational projection jika approved exception/replacement tersedia.

### EXC-030
Payroll yang sudah calculated harus dirty jika eligible exception berubah.

### EXC-031
Payroll locked tidak boleh berubah otomatis akibat historical exception correction.

### EXC-032
Retroactive correction membutuhkan reason dan audit.

### EXC-033
Exception type inactive tidak boleh dipakai untuk request baru.

### EXC-034
Exception historical tetap dapat dirender walaupun type sekarang inactive.

### EXC-035
Exception payroll treatment yang berubah harus effective-dated jika berdampak historical.

### EXC-036
Exception date range harus dievaluasi per work date.

### EXC-037
Approved leave pada OFF day tidak menghasilkan incentive.

### EXC-038
Swap/correction yang menyentuh finalized payroll harus menghasilkan strong payroll impact awareness.

### EXC-039
Notification bukan source of truth; business record tetap authoritative.

### EXC-040
Manual override atas warning/blocking yang diperbolehkan harus menyimpan actor dan reason.

### EXC-041
Approval tidak boleh mengandalkan client-side validation saja.

### EXC-042
Concurrent approval terhadap request yang sama tidak boleh menghasilkan duplicate mutation.

### EXC-043
Replacement terhadap assignment superseded harus ditolak atau dire-resolve secara eksplisit.

### EXC-044
Actual attendance tidak boleh diasumsikan dari published schedule.

### EXC-045
Base salary deduction akibat absence harus memerlukan explicit configured rule atau manual audited adjustment.

### EXC-046
Generated overtime earning dan regular shift incentive harus menjadi payroll component terpisah.

### EXC-047
Correction terhadap approved exception harus mempertahankan before/after history.

### EXC-048
Coverage calculation harus dapat membedakan planned coverage dan effective coverage.

### EXC-049
Exception tidak boleh membuat cross-midnight shift dihitung dua kali.

### EXC-050
Work date untuk exception terhadap shift reguler harus mengikuti work date assignment, bukan tanggal kalender ketika cross-midnight shift selesai.

---

# 23. Critical Acceptance Test Matrix

| Scenario | Expected Result |
|---|---|
| Employee S3 approved Sick | S3 tetap historical, employee tidak eligible regular S3 incentive secara default |
| S3 cross-midnight + Sick | exception mengikuti work date tanggal shift dimulai; tidak double count |
| Sick + replacement | original non-working, replacement menjadi effective coverage |
| Replacement employee punya overlapping shift | approval blocked |
| Replacement approved | incentive regular pindah ke effective replacement worker |
| Leave pada OFF day | tidak menghasilkan incentive atau shift count |
| Leave pada Unassigned future date | menjadi scheduling constraint sesuai policy |
| Pending leave | belum mengubah published operational truth |
| Approved leave setelah payroll calculated | payroll terkait dirty |
| Approved leave setelah payroll locked | payroll tidak berubah otomatis; correction awareness muncul |
| Swap valid | dua assignment berubah atomik |
| Swap satu sisi conflict | tidak ada assignment yang berubah |
| Swap menghasilkan S3 untuk employee baru | S3 incentive mengikuti employee baru setelah approval |
| Overtime tanpa approved record | tidak dihitung sebagai overtime earning |
| Approved payable overtime tanpa rate policy | payroll warning/blocking; tidak silent Rp0 |
| Public holiday dengan regular shift | shift tetap valid |
| Public holiday tanpa holiday pay policy | tidak ada bonus otomatis |
| Retroactive sick correction | reason + audit wajib; payroll impact diperiksa |
| Concurrent approval request sama | hanya satu effective transition/mutation |
| Exception type dinonaktifkan | historical tetap render; request baru tidak dapat memakai type tersebut |

---

# 24. Non-Functional Requirements

## 24.1 Atomicity

Approval swap/replacement dan mutation yang mencakup beberapa records harus atomic secara bisnis.

## 24.2 Idempotency

Retry request/approval akibat network issue tidak boleh menggandakan exception, overtime item, replacement, atau payroll effect.

## 24.3 Concurrency Safety

Backend harus mencegah lost update pada request yang sedang direview oleh dua actor sekaligus.

## 24.4 Traceability

Operational projection dan payroll harus dapat ditelusuri ke exception/source record pembentuknya.

## 24.5 Performance

Calendar/team schedule harus dapat memuat operational projection periode bulanan untuk jumlah employee internal NOC secara responsif tanpa per-row query pattern yang buruk.

---

# 25. UX Contract for Future UI PRD

PRD-10/12 akan menentukan visual detail, tetapi business layer membutuhkan UI mampu membedakan dengan jelas:

- Planned Shift
- Effective Shift
- Pending Request
- Approved Exception
- Replacement
- Swapped Shift
- Overtime
- OFF
- Unassigned

User tidak boleh harus menebak apakah badge berwarna tertentu berarti shift resmi, request pending, atau exception approved.

Critical action harus memperlihatkan impact sebelum confirm, terutama:

- approve leave yang menurunkan coverage,
- assign replacement,
- approve swap,
- edit historical exception,
- approve overtime,
- mutation yang menyentuh calculated/finalized payroll.

---

# 26. Data Model Handoff

PRD-08 harus mengakomodasi minimal entity/concept:

- `ExceptionType`
- `ScheduleException`
- `ExceptionRequest`
- `RequestApprovalEvent`
- `AvailabilityRecord`
- `ReplacementAssignment`
- `ShiftSwapRequest`
- `ShiftSwapParticipant`
- `OvertimeRecord`
- `Holiday`
- `OperationalAssignmentProjection` sebagai computed/materialized concept bila diperlukan
- audit references
- payroll source references

Hard implementation shape belum dikunci di PRD-05; relational details ditentukan pada PRD-08.

---

# 27. API Handoff

PRD-15 harus menyediakan contract untuk minimal capability:

- create/cancel exception request,
- approve/reject request,
- list requests,
- get request detail/history,
- create replacement,
- create/respond/approve shift swap,
- create/approve overtime,
- manage availability,
- manage holiday,
- retrieve effective operational schedule,
- retrieve coverage impact,
- retrieve payroll impact/freshness.

Semua critical mutation wajib memiliki server-side authorization dan validation.

---

# 28. Out of Scope for PRD-05 Baseline

Belum menjadi requirement wajib:

- biometric fingerprint,
- facial recognition,
- GPS attendance,
- geofencing,
- automatic lateness deduction,
- statutory leave entitlement calculation,
- government payroll compliance,
- medical document verification,
- external HRIS synchronization,
- employee performance scoring.

Fitur tersebut dapat ditambahkan kemudian tanpa merusak model exception dasar.

---

# 29. Definition of Done — PRD-05

PRD-05 dianggap terpenuhi pada implementasi ketika:

1. exception tidak menghapus planned schedule history,
2. request memiliki lifecycle yang dapat diaudit,
3. leave/sick/permission dapat memengaruhi effective operational state,
4. replacement dapat mengalihkan coverage secara aman,
5. shift swap berjalan atomik,
6. overtime dimodelkan sebagai record tambahan, bukan duplicate shift,
7. coverage planned vs effective dapat dibedakan,
8. payroll tidak double count original + replacement,
9. payroll dirty ketika exception eligibility berubah,
10. payroll locked tidak berubah otomatis,
11. retroactive correction tercatat,
12. public holiday tidak otomatis membuat shift OFF,
13. critical validations dijalankan server-side,
14. historical exception tetap explainable,
15. seluruh critical business rules memiliki automated tests.

---

# 30. Relationship to Next PRDs

Setelah PRD-05, product/business foundation utama sudah mencakup:

- product scope,
- feature inventory,
- scheduling logic,
- payroll logic,
- operational exception logic.

Dokumen berikutnya direkomendasikan:

**PRD-06 — Information Architecture, Navigation & Page Structure**

PRD-06 akan mengubah seluruh domain bisnis yang sudah didefinisikan menjadi struktur aplikasi yang jelas: halaman apa saja yang ada, grouping sidebar/navigation, hierarchy, entry points, quick actions, mobile navigation, dan relationship antarhalaman.
