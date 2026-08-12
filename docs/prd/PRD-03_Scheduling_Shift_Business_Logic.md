# PRD-03 — Scheduling & Shift Business Logic

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Business Logic  
> **Document ID:** PRD-03  
> **Status:** Draft — Scheduling Logic Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements; PRD-02 — Feature Specification  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Purpose

Dokumen ini mendefinisikan **aturan bisnis inti scheduling dan shifting** untuk NOCScheduler.

PRD-03 menjadi source of truth untuk menjawab pertanyaan:

> **“Bagaimana sistem menentukan, menyimpan, memvalidasi, menampilkan, mengubah, dan mempublikasikan jadwal kerja NOC?”**

Dokumen ini sengaja tidak membahas formula payroll secara penuh. Dampak jadwal terhadap insentif dan payroll hanya didefinisikan sampai batas kontrak data; formula finansial final berada pada **PRD-04 — Payroll, Salary & Incentive Logic**.

Aturan dalam dokumen ini harus menjadi acuan untuk:

- backend validation,
- database constraints,
- schedule editor,
- conflict detection,
- dashboard `Now on Duty`,
- reporting,
- payroll input,
- audit trail,
- automated tests,
- acceptance test.

---

## 2. Scheduling Principles

### SP-01 — Schedule Is a Business Record

Jadwal bukan sekadar event kalender. Setiap assignment merupakan record operasional yang dapat memengaruhi:

- siapa yang bekerja,
- coverage tim,
- histori operasional,
- insentif,
- payroll.

Karena itu perubahan assignment harus diperlakukan sebagai perubahan business data.

### SP-02 — One Employee, One Primary Work State per Date

Pada satu **work date**, seorang employee secara default hanya boleh memiliki satu primary work state:

- Shift 1,
- Shift 2,
- Shift 3,
- OFF,
- Leave/Exception tertentu.

Assignment tambahan seperti overtime hanya diperbolehkan melalui domain exception/overtime dan tidak boleh disamakan dengan primary shift reguler.

### SP-03 — Assignment Date Follows Shift Start Date

Tanggal suatu shift ditentukan oleh **tanggal ketika shift dimulai**.

Contoh:

- Shift 3 dimulai 12 Agustus 2026 pukul 23:00
- Shift 3 selesai 13 Agustus 2026 pukul 07:00

Maka assignment tersebut tetap memiliki:

`work_date = 2026-08-12`

Rule ini wajib dipakai secara konsisten oleh scheduling, laporan, dashboard, payroll, dan audit.

### SP-04 — Cross-Midnight Is First-Class

Shift yang melewati tengah malam harus didukung tanpa workaround manual.

Sistem tidak boleh memecah satu shift reguler lintas tengah malam menjadi dua assignment hanya untuk alasan penyimpanan data.

### SP-05 — Configured Shift Definition Is Reusable

Shift type didefinisikan sebagai konfigurasi reusable, bukan hardcoded di kalender.

Baseline produk memiliki tiga shift:

- Shift 1 / Pagi
- Shift 2 / Siang
- Shift 3 / Malam

Nama, waktu, warna visual, urutan, dan properti lain dapat dikonfigurasi sesuai permission.

### SP-06 — Historical Schedule Must Remain Explainable

Jika definisi jam Shift 3 berubah bulan depan, schedule historis harus tetap dapat menjelaskan jam yang berlaku saat assignment dibuat/dipublish.

Karena itu assignment published harus menyimpan snapshot informasi shift yang relevan atau menunjuk ke versioned/effective-dated shift configuration.

### SP-07 — Draft Is Editable, Published Is Controlled

Draft schedule dapat diedit secara fleksibel oleh actor yang berhak.

Published schedule adalah jadwal operasional resmi. Perubahan terhadap jadwal published diperbolehkan, tetapi harus:

- tervalidasi,
- tercatat di audit trail,
- memiliki actor,
- memiliki timestamp,
- mempertahankan before/after,
- memicu notification jika kebijakan notification aktif.

### SP-08 — Warning Is Not Always Blocking

Tidak semua kondisi aneh harus diblokir.

Validation dibagi menjadi:

- **Error / Blocking** — operasi tidak boleh dilanjutkan.
- **Warning / Overrideable** — boleh dilanjutkan oleh actor yang memiliki permission dengan reason jika diperlukan.
- **Info** — hanya memberi konteks.

### SP-09 — Bulk Operation Must Behave Like Many Valid Single Operations

Bulk assignment tidak boleh melewati rule yang berlaku pada assignment individual.

Setiap target dalam bulk operation harus divalidasi dan hasilnya harus jelas.

### SP-10 — No Silent Mutation

Sistem tidak boleh diam-diam mengubah shift user, memindahkan assignment, atau memperbaiki konflik tanpa persetujuan actor.

Automatic suggestion boleh diberikan; automatic publication tidak diperbolehkan pada baseline.

---

# 3. Core Scheduling Terminology

## 3.1 Employee

Anggota NOC yang dapat memiliki assignment jadwal.

Employee memiliki minimal status:

- Active
- Inactive

Inactive employee tidak boleh menerima assignment baru untuk tanggal efektif setelah status nonaktif, kecuali mekanisme historical correction yang memiliki permission khusus.

---

## 3.2 Shift Type

Template definisi shift kerja.

Minimum properties:

- `id`
- `code`
- `name`
- `short_name`
- `start_time`
- `end_time`
- `crosses_midnight`
- `display_order`
- `is_active`
- visual token/color identifier
- effective period/version reference

Contoh konseptual:

| Code | Name | Start | End | Cross Midnight |
|---|---|---:|---:|---|
| S1 | Shift 1 / Pagi | configurable | configurable | No |
| S2 | Shift 2 / Siang | configurable | configurable | No/Configurable |
| S3 | Shift 3 / Malam | configurable | configurable | Yes pada konfigurasi umum |

Jam pada tabel di atas **bukan nominal final** dan harus ditentukan dari Settings.

---

## 3.3 Work Date

Tanggal bisnis yang menjadi anchor suatu primary assignment.

Untuk shift lintas tengah malam, `work_date` tetap mengikuti local date ketika shift dimulai.

---

## 3.4 Shift Assignment

Record yang menghubungkan employee dengan shift pada suatu work date.

Minimum conceptual fields:

- employee
- work date
- shift type / shift version
- actual start datetime derived/snapshotted
- actual end datetime derived/snapshotted
- assignment status
- schedule version
- source
- note optional
- created by
- created at
- updated by
- updated at

---

## 3.5 OFF

Primary work state yang menyatakan employee tidak dijadwalkan bekerja pada work date tersebut.

OFF bukan absence dan bukan data kosong.

Perbedaan penting:

- **OFF** = secara eksplisit tidak bekerja.
- **Unassigned** = belum ada keputusan jadwal.

UI, validation, dan reporting harus membedakan keduanya.

---

## 3.6 Unassigned

Belum ada primary work state pada suatu employee/work date.

Unassigned pada schedule draft diperbolehkan.

Pada schedule yang akan dipublish, sistem dapat memberi warning atau blocking berdasarkan kelengkapan periode dan policy organisasi.

---

## 3.7 Schedule Period

Rentang tanggal yang digunakan untuk penyusunan dan publication jadwal.

Baseline direkomendasikan mendukung:

- monthly period sebagai workflow utama,
- custom date range untuk kebutuhan koreksi atau operasi khusus.

Periode kalender bulanan bukan berarti aturan payroll harus selalu identik; hubungan dengan payroll period didefinisikan di PRD-04.

---

## 3.8 Schedule Version

Representasi state schedule pada periode tertentu.

Minimum states:

- Draft
- Published
- Archived/Superseded secara internal bila diperlukan

Implementation dapat menggunakan immutable publication version atau versioned change history selama historical reconstruction tetap dapat dilakukan.

---

# 4. Time & Date Rules

## 4.1 Default Timezone

Timezone default aplikasi:

`Asia/Jakarta`

Semua business rule schedule harus dievaluasi menggunakan timezone operasional yang dikonfigurasi, bukan timezone browser secara implisit.

Timestamp audit tetap dapat disimpan dalam UTC secara teknis, tetapi business date diturunkan dari timezone operasional.

---

## 4.2 Shift Datetime Construction

Untuk suatu assignment:

`start_at = work_date + configured start_time`

Jika `end_time > start_time` dan shift tidak crosses midnight:

`end_at = work_date + configured end_time`

Jika shift crosses midnight:

`end_at = work_date + 1 day + configured end_time`

Durasi harus dihitung dari datetime, bukan sekadar pengurangan jam string.

---

## 4.3 Invalid Shift Duration

Sistem harus menolak konfigurasi shift yang menghasilkan:

- durasi <= 0,
- durasi tidak masuk akal melebihi batas maksimum yang ditetapkan sistem,
- ambiguity cross-midnight yang tidak dapat ditentukan.

Batas maksimum final dapat menjadi configurable system guardrail; baseline rekomendasi maksimal 24 jam untuk satu regular shift.

---

## 4.4 Current Shift / Now on Duty

Seorang employee dianggap `Now on Duty` berdasarkan jadwal jika:

`current_time >= assignment.start_at`

AND

`current_time < assignment.end_at`

serta assignment merupakan assignment aktif/published yang valid.

Boundary rule:

- tepat di `start_at` → sudah on duty,
- tepat di `end_at` → sudah tidak on duty pada assignment tersebut.

Ini menghindari double counting pada pergantian shift yang berbatasan langsung.

---

## 4.5 Display of Cross-Midnight Shift

UI harus menjelaskan shift lintas tanggal secara eksplisit.

Contoh:

`12 Aug, 23:00 → 13 Aug, 07:00`

atau format compact yang tetap tidak ambigu.

Jangan hanya menampilkan `23:00–07:00` pada konteks yang berpotensi membingungkan.

---

# 5. Primary Work State Logic

## 5.1 Allowed Primary States

Baseline:

- `SHIFT`
- `OFF`
- `LEAVE_EXCEPTION`
- `UNASSIGNED` sebagai absence of primary state, bukan persisted assignment wajib

Jenis exception final diperluas di PRD-05.

---

## 5.2 Uniqueness Rule

Untuk kombinasi:

`employee_id + work_date`

hanya boleh terdapat satu active primary work state.

Tidak boleh ada:

- Shift 1 + Shift 2 sebagai dua primary assignment pada tanggal yang sama,
- Shift 3 + OFF,
- Leave + regular shift,

kecuali workflow exception khusus secara eksplisit mendefinisikan replacement/overtime dan bukan primary duplicate.

Rule ini harus ditegakkan server-side.

---

## 5.3 Changing Primary State

Mengubah:

`S1 → S2`

bukan membuat assignment kedua; secara bisnis merupakan replacement terhadap primary state yang sama.

Pada draft, replacement dapat dilakukan langsung.

Pada published schedule, replacement harus menghasilkan audit history before/after.

---

# 6. Shift Configuration Rules

## 6.1 Required Baseline Shift Types

Sistem harus dapat beroperasi dengan minimal tiga shift aktif:

- S1 — Pagi
- S2 — Siang
- S3 — Malam

Naming dapat diubah tetapi stable identifier/code direkomendasikan tidak berubah sembarangan setelah dipakai historical data.

---

## 6.2 Active vs Inactive Shift Type

Shift type dapat dinonaktifkan untuk assignment baru.

Inactive shift:

- tidak muncul sebagai opsi default pada assignment baru,
- tetap dapat ditampilkan pada historical schedule,
- tidak boleh dihapus secara hard delete bila sudah direferensikan historical record.

---

## 6.3 Effective Dating

Perubahan jam shift yang memiliki dampak historical sebaiknya memiliki `effective_from` dan, bila diperlukan, `effective_to`.

Contoh:

- sampai 31 Aug: S3 = 23:00–07:00
- mulai 1 Sep: S3 = 22:00–06:00

Schedule Agustus tetap menggunakan definisi lama.

---

## 6.4 Deleting Shift Type

Hard delete hanya diperbolehkan jika shift type belum pernah dipakai dan policy mengizinkan.

Jika sudah digunakan:

- gunakan inactive/archive,
- historical rendering harus tetap berfungsi.

---

# 7. Schedule Lifecycle

## 7.1 Draft Creation

Scheduler dapat membuat draft untuk suatu period.

Draft dapat berasal dari:

- blank schedule,
- copy previous period,
- template,
- rotation helper,
- duplicated custom range.

Draft tidak dianggap jadwal resmi sampai dipublish.

---

## 7.2 Draft Editing

Allowed operations:

- assign shift,
- assign OFF,
- clear assignment menjadi Unassigned,
- bulk assignment,
- replace shift,
- copy pattern,
- edit note,
- apply template,
- undo/redo secara UI jika implementasi mendukung.

Setiap perubahan draft tetap harus mengikuti blocking validation.

---

## 7.3 Draft Visibility

Baseline recommendation:

- scheduler/admin dapat melihat draft sesuai permission,
- regular NOC member hanya melihat published schedule sebagai sumber jadwal resmi,
- preview draft ke member dapat menjadi permission/feature terpisah di masa depan.

Tujuannya mencegah user mengira draft sebagai jadwal final.

---

## 7.4 Pre-Publish Validation

Sebelum publish, sistem harus menjalankan validation terhadap seluruh target period.

Minimal memeriksa:

- duplicate primary state,
- invalid/inactive employee assignment,
- invalid shift definition,
- overlapping real datetime,
- rest period warning/rule,
- unassigned employee/date,
- coverage requirement jika diaktifkan,
- unresolved blocking exception,
- effective-date mismatch.

Hasil validation harus dikelompokkan berdasarkan severity.

---

## 7.5 Publish

Publish mengubah schedule menjadi sumber jadwal resmi untuk scope period/version terkait.

Publish harus:

- dilakukan oleh actor yang berhak,
- atomik secara bisnis,
- gagal seluruhnya jika ada blocking error,
- mencatat actor dan timestamp,
- menghasilkan immutable trace/version,
- memicu notification policy,
- membuat assignment eligible sebagai input downstream payroll.

---

## 7.6 Republish / Published Change

Setelah schedule published, perubahan tetap boleh dilakukan karena operasional NOC bersifat dinamis.

Namun perubahan published harus menggunakan controlled edit workflow.

Minimum requirements:

- before value,
- after value,
- actor,
- timestamp,
- affected employee,
- affected work date,
- reason optional/required sesuai severity,
- notification state,
- payroll impact awareness jika period sudah masuk payroll processing.

---

## 7.7 Historical Reconstruction

Sistem harus mampu menjelaskan setidaknya:

- jadwal yang saat ini berlaku,
- siapa terakhir mengubah assignment,
- apa nilai sebelumnya,
- kapan perubahan terjadi.

Jika full schedule version reconstruction diterapkan, lebih baik; minimum audit requirement tetap wajib.

---

# 8. Assignment Operations

## 8.1 Single Assignment

Scheduler memilih:

- employee,
- work date,
- desired primary state.

Server kemudian menjalankan validation dan menyimpan hasil jika valid.

---

## 8.2 Bulk Assignment

Bulk assignment dapat menargetkan:

- banyak employee pada satu tanggal,
- satu employee pada banyak tanggal,
- matrix employee × dates,
- selected cells.

Sistem harus menampilkan scope sebelum perubahan besar dijalankan.

---

## 8.3 Bulk Result Semantics

Untuk operasi draft, direkomendasikan transaction atomik untuk satu logical action ketika aman.

Jika partial apply didukung, UI wajib menampilkan secara jelas:

- success count,
- skipped count,
- failed count,
- reason per failure.

Baseline yang lebih aman untuk operasi publish-sensitive adalah **all-or-nothing** ketika terdapat blocking error.

---

## 8.4 Clear Assignment

`Clear` berbeda dari `Set OFF`.

- Clear → kembali `Unassigned`.
- OFF → keputusan eksplisit bahwa employee tidak dijadwalkan bekerja.

UI tidak boleh menggunakan dua action tersebut sebagai sinonim.

---

## 8.5 Copy Previous Period

Copy schedule harus membuat assignment baru untuk target period, bukan mereferensikan record source secara mutable.

Copy harus:

- mempertahankan pola primary states,
- memetakan tanggal secara deterministik,
- menjalankan validation target,
- tidak menyalin audit metadata actor lama sebagai actor assignment baru,
- tidak otomatis publish.

---

## 8.6 Copy Week / Date Range

Untuk range yang memiliki panjang sama, mapping dilakukan berdasarkan positional day offset.

Contoh:

Source: 1–7 Aug
Target: 8–14 Aug

Day 1 source → Day 1 target, dst.

Sistem harus preview target range sebelum apply jika operasi memengaruhi banyak assignment.

---

## 8.7 Template Application

Template menyimpan **pattern**, bukan historical assignment.

Template dapat berisi contoh:

- S1, S1, S1, OFF, S2, S2, OFF

Template tidak boleh menyimpan nominal payroll sebagai bagian scheduling pattern.

Saat diterapkan, pattern di-expand menjadi target assignment lalu divalidasi menggunakan rule saat target date berlaku.

---

## 8.8 Rotation Helper

Rotation helper adalah alat bantu penyusunan jadwal.

Contoh conceptual rotation:

`S1 → S1 → S2 → S2 → S3 → S3 → OFF`

Rotation helper:

- boleh menghasilkan suggestion/draft,
- harus memperhatikan target start date,
- harus tetap melewati validation,
- tidak boleh auto-publish.

---

# 9. Conflict Detection

## 9.1 Conflict Categories

Conflict engine minimal mengenali:

1. duplicate primary state,
2. datetime overlap,
3. insufficient rest,
4. inactive employee,
5. employee outside active employment period,
6. invalid shift version,
7. leave/exception collision,
8. coverage deficiency jika rule aktif,
9. unassigned required date,
10. published change with locked downstream impact.

---

## 9.2 Duplicate Primary State

**Severity:** Blocking

Employee tidak boleh mempunyai dua primary states pada work date sama.

---

## 9.3 Real Datetime Overlap

Walaupun assignment mempunyai work date berbeda, actual datetime dapat overlap.

Contoh:

- 12 Aug S3: 23:00–07:00
- 13 Aug S1: 06:00–14:00

Terdapat overlap 06:00–07:00.

**Default severity:** Blocking untuk regular shifts.

Override hanya boleh tersedia melalui exception/overtime rule yang eksplisit, bukan bypass umum.

---

## 9.4 Insufficient Rest Between Shifts

Rest dihitung:

`next.start_at - previous.end_at`

Sistem harus memiliki configurable minimum rest threshold.

Baseline behavior:

- jika threshold belum dikonfigurasi → sistem tetap dapat mendeteksi short turnaround dan menampilkan warning berdasarkan default product guardrail,
- jika organization rule menetapkan hard minimum → severity dapat Blocking,
- actor dengan override permission dapat melanjutkan hanya jika policy mengizinkan dan reason dicatat.

Nilai minimum jam final tidak di-hardcode di PRD ini karena harus menjadi konfigurasi organisasi.

---

## 9.5 Consecutive Work Days

Sistem harus mampu menghitung streak hari kerja berturut-turut berdasarkan primary work state.

Threshold maksimum consecutive work days bersifat configurable.

Default severity direkomendasikan Warning kecuali organization policy menetapkannya Blocking.

---

## 9.6 Consecutive Night Shifts

Karena Shift 3 dapat memiliki dampak fatigue lebih tinggi, sistem harus dapat menghitung consecutive night-shift streak.

Threshold bersifat configurable.

Baseline severity: Warning.

---

## 9.7 Rapid Rotation Warning

Perubahan urutan shift yang terlalu cepat dapat diberi warning jika pattern berpotensi tidak ideal, contohnya:

`S3 → S1`

Keputusan blocking tetap mengikuti actual datetime overlap dan minimum rest rule, bukan sekadar label shift.

---

# 10. Coverage Logic

## 10.1 Coverage Definition

Coverage adalah jumlah employee yang dijadwalkan pada suatu shift atau interval operasional.

Baseline summary dapat dihitung per shift type per work date.

---

## 10.2 Minimum Coverage

Settings dapat memiliki minimum required headcount per shift.

Contoh conceptual:

- S1 minimum: configurable
- S2 minimum: configurable
- S3 minimum: configurable

Tidak ada angka fixed di PRD ini.

---

## 10.3 Coverage Severity

Policy configurable:

- disabled,
- informational,
- warning,
- blocking publish.

Baseline recommendation: warning terlebih dahulu sampai organisasi menetapkan hard coverage policy.

---

## 10.4 Coverage and OFF/Leave

OFF dan Leave tidak dihitung sebagai active coverage.

Employee hanya dihitung jika memiliki qualifying active work assignment pada shift tersebut.

---

## 10.5 Live Coverage

`Now on Duty` menggunakan actual datetime interval, bukan hanya work date.

Ini penting untuk Shift 3 yang melewati tengah malam.

---

# 11. Employee Active Period Rules

## 11.1 Employment Effective Date

Employee dapat memiliki:

- active_from
- inactive_from / employment_end

Assignment baru di luar active employment period harus ditolak.

---

## 11.2 Deactivating Employee with Future Schedule

Jika employee dinonaktifkan sementara memiliki future published assignments, sistem harus memberi warning kuat dan meminta penyelesaian.

Pilihan workflow dapat berupa:

- cancel future assignments,
- reassign kemudian deactivate,
- schedule deactivation effective after last assignment.

Sistem tidak boleh diam-diam menghapus future assignment.

---

# 12. Schedule Change Rules

## 12.1 Draft Change

Draft edit tidak memerlukan end-user notification karena belum dianggap official schedule, kecuali preview collaboration diaktifkan di masa depan.

---

## 12.2 Published Change

Setiap perubahan published assignment yang memengaruhi user harus dianggap meaningful change.

Contoh:

- S1 → S2
- S3 → OFF
- OFF → S1
- work date reassignment
- shift time berubah karena effective config correction

Meaningful change harus masuk change history.

---

## 12.3 Reason Requirement

Reason wajib untuk perubahan published apabila:

- perubahan dilakukan sangat dekat dengan waktu shift menurut configurable threshold,
- actor melakukan override warning,
- perubahan berpotensi memengaruhi payroll yang sedang/final diproses,
- admin melakukan historical correction.

Untuk edit rutin jauh sebelum pelaksanaan, reason dapat optional sesuai policy.

---

## 12.4 Late Schedule Change

Sistem harus memiliki configurable `late_change_window`.

Jika perubahan terjadi dalam window tersebut sebelum shift start:

- tampilkan warning,
- tandai sebagai late change,
- prioritaskan notification,
- reason dapat diwajibkan.

Tidak ada threshold jam fixed pada PRD ini.

---

# 13. Payroll Boundary Contract

PRD-03 tidak menghitung uang, tetapi mendefinisikan data schedule yang eligible untuk payroll.

## 13.1 Eligible Schedule Source

Baseline:

- hanya assignment yang official/published dan memenuhi policy payroll yang menjadi sumber perhitungan,
- draft tidak pernah dihitung sebagai payroll final.

---

## 13.2 Schedule Snapshot for Payroll

Ketika payroll period dihitung/finalized, payroll harus menggunakan schedule state/snapshot yang dapat direkonstruksi.

Perubahan schedule setelah payroll lock tidak boleh diam-diam mengubah payroll locked.

Sistem harus menggunakan explicit adjustment/reopen workflow sesuai PRD-04.

---

## 13.3 Shift Incentive Eligibility Hook

Assignment harus membawa informasi yang cukup untuk menentukan:

- shift type/version,
- work date,
- status,
- whether eligible for incentive berdasarkan rule PRD-04.

Scheduling tidak menyimpan hasil nominal insentif sebagai source of truth utama.

---

# 14. OFF, Leave, Overtime & Exceptions Boundary

Detail domain berada di PRD-05, tetapi scheduling harus menyediakan hook sejak awal.

## 14.1 OFF

OFF adalah planned non-working day.

Tidak menghasilkan regular shift coverage atau regular shift incentive.

---

## 14.2 Leave

Leave menggantikan atau memblokir primary regular shift sesuai jenis leave dan policy.

Leave approved tidak boleh coexist diam-diam dengan regular primary shift.

---

## 14.3 Overtime

Overtime bukan primary shift kedua secara default.

Overtime harus menjadi separate record/exception yang dapat berelasi dengan regular assignment.

---

## 14.4 Shift Swap

Swap yang disetujui harus menghasilkan perubahan assignment eksplisit untuk seluruh pihak terkait, bukan sekadar label request selesai.

Semua resulting assignments harus divalidasi ulang.

---

# 15. Fairness & Distribution Logic

## 15.1 Purpose

Fairness insight membantu scheduler melihat distribusi shift yang berpotensi tidak seimbang.

Fitur ini bersifat decision support, bukan automatic authority.

---

## 15.2 Metrics

Sistem minimal dapat menghitung per employee dalam selected period:

- jumlah S1,
- jumlah S2,
- jumlah S3,
- jumlah OFF,
- total scheduled work days,
- consecutive work day max,
- consecutive S3 max.

---

## 15.3 Fairness Does Not Mean Equal in All Cases

Sistem tidak boleh menganggap jumlah shift harus selalu persis sama untuk semua employee karena bisa terdapat:

- leave,
- employee join/exit,
- operational need,
- availability,
- role specialization,
- approved exception.

Karena itu fairness engine baseline hanya menghasilkan insight/warning, bukan blocking rule.

---

# 16. Validation Severity Model

## 16.1 BLOCKING_ERROR

Operasi harus gagal.

Contoh:

- duplicate primary state,
- real shift overlap,
- assignment kepada inactive employee,
- invalid shift configuration,
- permission denied.

---

## 16.2 WARNING

Operasi dapat dilanjutkan sesuai permission/policy.

Contoh:

- rest terlalu pendek,
- coverage kurang,
- terlalu banyak consecutive night shifts,
- late change.

---

## 16.3 INFO

Tidak membutuhkan confirmation.

Contoh:

- employee mendapat S3 lebih banyak dari team median,
- selected period memiliki public holiday,
- schedule copied from prior period.

---

## 16.4 Override

Warning yang di-override harus dapat menyimpan:

- warning code,
- actor,
- timestamp,
- optional/required reason,
- affected assignment(s).

Blocking error tidak boleh diubah menjadi sukses hanya lewat client-side bypass.

---

# 17. Concurrency & Data Integrity

## 17.1 Concurrent Editing

Dua scheduler dapat membuka schedule yang sama.

Sistem harus mencegah silent last-write-wins pada perubahan yang saling menimpa.

Recommended approaches:

- optimistic concurrency/version number,
- updated_at conflict check,
- revision token.

Jika data berubah sejak user membuka editor, sistem harus memberi tahu dan meminta refresh/reconcile.

---

## 17.2 Server Is Source of Truth

Client-side validation hanya untuk UX.

Semua critical rule harus divalidasi lagi di server.

---

## 17.3 Transaction Boundary

Publish, swap execution, dan multi-assignment operation yang saling tergantung harus transactional secara bisnis.

Tidak boleh terjadi kondisi setengah swap atau setengah publish yang meninggalkan schedule inconsistent.

---

# 18. Audit Contract

Setiap meaningful scheduling mutation minimal mencatat:

- event type,
- actor,
- timestamp,
- employee impacted,
- work date,
- before state,
- after state,
- source/workflow,
- reason jika tersedia,
- schedule version/publication context.

Contoh event types:

- `SCHEDULE_CREATED`
- `SHIFT_ASSIGNED`
- `SHIFT_CHANGED`
- `SHIFT_REMOVED`
- `OFF_ASSIGNED`
- `SCHEDULE_PUBLISHED`
- `PUBLISHED_SCHEDULE_CHANGED`
- `WARNING_OVERRIDDEN`
- `SCHEDULE_COPIED`
- `TEMPLATE_APPLIED`

Detail storage dan UI audit berada di PRD-09.

---

# 19. Notification Contract

Scheduling menghasilkan notification event, sedangkan delivery channel dibahas pada PRD-18.

Minimum events:

- schedule published,
- user's published shift changed,
- user's published shift removed,
- user's OFF changed menjadi work shift,
- late schedule change,
- approved swap resulting assignment.

Notification tidak boleh menjadi satu-satunya sumber kebenaran. Schedule page tetap authoritative.

---

# 20. UI Behavior Contract for Scheduling

PRD UI final berada di PRD-10/12/13, tetapi business logic membutuhkan behavior contract berikut.

## 20.1 State Must Be Visually Distinguishable

User harus dapat membedakan:

- S1,
- S2,
- S3,
- OFF,
- Leave/Exception,
- Unassigned,
- Draft vs Published.

Warna tidak boleh menjadi satu-satunya pembeda; gunakan text/icon/label yang sesuai.

---

## 20.2 Conflict Must Point to Exact Target

Error tidak boleh hanya berkata:

`Schedule invalid.`

Minimal harus menjelaskan:

- employee,
- date,
- conflicting assignments/rule,
- severity,
- suggested next action jika ada.

---

## 20.3 Bulk Edit Preview

Operasi besar harus menunjukkan jumlah target sebelum apply.

Contoh:

`Apply Shift 2 to 18 selected cells?`

Published bulk changes harus memiliki confirmation lebih kuat dibanding draft.

---

## 20.4 Mobile Editing Scope

Mobile harus sangat baik untuk consumption dan quick correction.

Complex matrix bulk scheduling boleh diprioritaskan untuk desktop selama mobile tetap dapat melakukan operasi penting yang dibutuhkan saat urgent.

---

# 21. Recommended Default Scheduling Settings

Semua nilai berikut **harus configurable** dan bukan hardcoded domain law.

Minimum settings:

- operational timezone,
- shift definitions,
- shift active status,
- minimum rest duration,
- maximum consecutive work days warning,
- maximum consecutive S3 warning,
- minimum coverage per shift,
- coverage severity,
- late schedule change window,
- published edit reason policy,
- schedule publication notification policy.

Jika suatu setting belum ditentukan organisasi, sistem harus menggunakan documented safe product default.

---

# 22. Edge Cases

## EC-01 — Shift 3 Crosses Month Boundary

31 Aug S3 dimulai 31 Aug dan selesai 1 Sep.

Rule:

- work date = 31 Aug,
- assignment termasuk schedule date 31 Aug,
- payroll attribution baseline mengikuti work date kecuali PRD-04 menentukan rule eksplisit berbeda.

---

## EC-02 — Shift 3 Crosses Year Boundary

31 Dec S3 → 1 Jan.

Tetap menggunakan work date 31 Dec.

---

## EC-03 — Consecutive Cross-Midnight to Morning Shift

S3 berakhir 07:00, S1 berikutnya mulai 07:00.

Tidak overlap secara interval karena end boundary exclusive, tetapi rest = 0.

Hasil ditentukan minimum rest rule dan secara default harus minimal Warning/Blocking sesuai policy.

---

## EC-04 — Same Employee Assigned Two Shifts Same Date

Blocking meskipun jam shift tidak overlap.

Alasan: primary work state uniqueness.

Jika organisasi membutuhkan split-shift di masa depan, itu harus menjadi explicit feature/domain baru.

---

## EC-05 — Assignment Date Is Cleared

Clear menghasilkan Unassigned, bukan OFF.

---

## EC-06 — Shift Configuration Changes After Draft Created

Draft harus divalidasi ulang terhadap effective shift version target.

UI harus memberi notice jika definition berubah sejak draft dibuat.

---

## EC-07 — Shift Configuration Changes After Publish

Historical published assignment tidak boleh diam-diam berubah waktu.

Perubahan jam baru berlaku berdasarkan effective date/version.

Historical correction membutuhkan explicit privileged workflow.

---

## EC-08 — Employee Deactivated Mid-Month

Past assignment tetap terlihat.

Future assignment setelah effective inactive date harus diselesaikan secara eksplisit.

---

## EC-09 — Publish Contains Unassigned Cells

Behavior bergantung publication completeness policy:

- warning jika unassigned diizinkan,
- blocking jika period diwajibkan complete.

OFF harus dianggap complete decision, bukan unassigned.

---

## EC-10 — Copy February to March

Copy tidak boleh mengasumsikan jumlah tanggal identik.

Untuk monthly copy, implementation harus menggunakan explicit mapping strategy dan preview.

Recommended baseline: weekday/sequence-based helper atau copy range yang dipilih user, bukan silent day-number mapping yang menghilangkan tanggal.

---

## EC-11 — Editing Locked Payroll Period Schedule

Schedule historical mungkin tetap perlu dikoreksi, tetapi perubahan tidak boleh otomatis mengubah locked payroll.

UI harus menampilkan payroll-impact warning dan mengikuti reopen/adjustment policy PRD-04.

---

## EC-12 — Browser Timezone Different from Operations

Semua work date dan `Now on Duty` tetap mengikuti operational timezone aplikasi.

Browser timezone hanya boleh memengaruhi display bila produk secara eksplisit mendukung timezone conversion.

---

# 23. Business Rule IDs

Agar implementation dan automated tests dapat merujuk aturan dengan stabil, gunakan ID berikut.

| Rule ID | Rule |
|---|---|
| SCH-001 | Work date mengikuti tanggal shift dimulai |
| SCH-002 | Shift lintas tengah malam adalah satu assignment |
| SCH-003 | Satu employee hanya memiliki satu primary work state per work date |
| SCH-004 | OFF berbeda dari Unassigned |
| SCH-005 | Draft bukan jadwal official |
| SCH-006 | Published schedule adalah official schedule source |
| SCH-007 | Published mutation wajib audited |
| SCH-008 | Shift type inactive tidak dapat dipakai assignment baru |
| SCH-009 | Historical assignment mempertahankan historical shift definition |
| SCH-010 | Real datetime overlap regular shift adalah blocking |
| SCH-011 | Rest gap harus dapat divalidasi |
| SCH-012 | Coverage harus dapat dihitung per shift/date |
| SCH-013 | Bulk edit tidak boleh bypass validation |
| SCH-014 | Copy/template menghasilkan draft assignment baru |
| SCH-015 | Rotation helper tidak boleh auto-publish |
| SCH-016 | Inactive employee tidak dapat menerima future assignment baru |
| SCH-017 | Publish harus gagal jika ada blocking error |
| SCH-018 | Publish harus menghasilkan audit/version trace |
| SCH-019 | Now on Duty menggunakan actual datetime interval |
| SCH-020 | End boundary bersifat exclusive untuk live duty calculation |
| SCH-021 | Draft tidak eligible untuk payroll final |
| SCH-022 | Locked payroll tidak berubah diam-diam karena schedule edit |
| SCH-023 | Critical validation wajib server-side |
| SCH-024 | Concurrent conflicting edit tidak boleh silent overwrite |
| SCH-025 | Swap execution harus atomic dan tervalidasi |
| SCH-026 | Warning override harus tercatat |
| SCH-027 | Hard delete historical shift type dilarang |
| SCH-028 | Schedule changes yang meaningful menghasilkan notification event |
| SCH-029 | Browser timezone tidak menentukan business work date |
| SCH-030 | No silent automatic schedule mutation |

---

# 24. Minimum Acceptance Criteria

Scheduling domain dianggap memenuhi baseline PRD-03 jika seluruh kondisi berikut terpenuhi.

## 24.1 Core Shift

- [ ] Tiga shift baseline dapat dikonfigurasi.
- [ ] Shift lintas tengah malam bekerja dengan benar.
- [ ] Assignment mempunyai deterministic start/end datetime.
- [ ] Work date mengikuti shift start date.

## 24.2 Assignment

- [ ] Scheduler dapat assign S1/S2/S3/OFF.
- [ ] Clear berbeda dari OFF.
- [ ] Duplicate primary state ditolak.
- [ ] Assignment employee inactive ditolak.
- [ ] Real datetime overlap dideteksi.

## 24.3 Draft & Publish

- [ ] Draft dapat dibuat dan diedit.
- [ ] Draft tidak tampil sebagai official schedule untuk regular member.
- [ ] Pre-publish validation tersedia.
- [ ] Blocking error mencegah publish.
- [ ] Publish mencatat actor dan timestamp.
- [ ] Published changes menghasilkan history.

## 24.4 Bulk Productivity

- [ ] Multi-cell assignment tersedia pada workflow desktop.
- [ ] Bulk action menjalankan validation yang sama dengan single edit.
- [ ] Copy schedule tersedia.
- [ ] Template/rotation architecture dapat didukung tanpa merusak model data.

## 24.5 Operational Safety

- [ ] Minimum rest validation dapat dikonfigurasi.
- [ ] Coverage dapat dihitung.
- [ ] Consecutive work/night metrics dapat dihitung.
- [ ] Warning dan blocking error dibedakan.
- [ ] Override dapat diaudit jika policy mengizinkan.

## 24.6 Historical Integrity

- [ ] Jam historical shift tidak berubah akibat config baru.
- [ ] Inactive shift type tetap dapat dirender pada history.
- [ ] Published schedule change mempunyai before/after.
- [ ] Schedule yang sudah terkait locked payroll tidak mengubah payroll secara silent.

## 24.7 Live Experience

- [ ] Now on Duty benar untuk shift normal.
- [ ] Now on Duty benar saat melewati tengah malam.
- [ ] Employee tidak double-counted pada exact end boundary.
- [ ] Timezone bisnis konsisten.

---

# 25. Required Automated Test Matrix

PRD-19 akan mendefinisikan QA secara penuh, tetapi scheduling engine wajib memiliki contract tests berikut sejak awal implementasi.

## Date/Time Tests

1. normal same-day shift,
2. cross-midnight shift,
3. month-boundary cross-midnight,
4. year-boundary cross-midnight,
5. exact start boundary,
6. exact end boundary,
7. browser timezone mismatch.

## Assignment Tests

8. create S1,
9. replace S1 → S2,
10. set OFF,
11. clear to Unassigned,
12. duplicate same-date primary state blocked,
13. inactive employee blocked.

## Conflict Tests

14. actual datetime overlap same work date,
15. actual datetime overlap across work dates,
16. insufficient rest warning/block,
17. consecutive work day threshold,
18. consecutive night threshold.

## Lifecycle Tests

19. draft editable,
20. invalid draft cannot publish,
21. valid draft publish succeeds,
22. published change is audited,
23. publication notification event emitted,
24. draft not used as payroll-final source.

## Bulk Tests

25. bulk assignment valid,
26. bulk assignment with one conflict,
27. copy range mapping,
28. template application validation,
29. rotation suggestion does not auto-publish.

## Historical Tests

30. shift config effective-date change,
31. old published assignment keeps old time,
32. deactivated shift still renders historically,
33. locked payroll schedule edit does not recalculate silently.

## Concurrency Tests

34. stale editor update detected,
35. simultaneous conflicting changes cannot silently overwrite.

---

# 26. Implementation Guidance — Non-Binding

Bagian ini bukan final technical architecture, tetapi memberikan guardrail agar implementation tidak melawan business model.

### Recommended Entity Separation

Hindari menyimpan schedule sebagai satu JSON blob bulanan tanpa entity-level identity.

Direkomendasikan memisahkan konsep:

- shift definition/version,
- schedule period/version,
- employee assignment,
- audit event,
- exception/overtime.

### Recommended Derived vs Snapshotted Data

Data yang boleh derived jika deterministik:

- duration,
- shift count,
- coverage count.

Data historical penting yang perlu snapshot/versioning:

- effective shift times,
- published assignment state,
- downstream payroll source state.

### Recommended Constraints

Gunakan database/server guard terhadap uniqueness primary assignment.

Jangan mengandalkan kalender UI untuk mencegah duplicate.

Detail schema final berada di PRD-08.

---

# 27. Decisions Explicitly Deferred

Hal berikut sengaja belum dikunci di PRD-03 karena menjadi domain dokumen berikutnya:

- nominal insentif setiap shift → PRD-04,
- formula Take Home Pay → PRD-04,
- overtime compensation → PRD-04/05,
- leave types dan approval flow → PRD-05,
- permission matrix final → PRD-07,
- database schema final → PRD-08,
- audit UI/storage strategy → PRD-09,
- exact UI calendar interaction → PRD-10/12,
- technology stack → PRD-14.

---

# 28. Product Decisions Locked by PRD-03

Setelah dokumen ini diterima, keputusan berikut dianggap baseline contract NOCScheduler:

1. **Tiga shift merupakan baseline configurable shift system.**
2. **Work date mengikuti tanggal mulai shift.**
3. **Shift malam lintas tengah malam tetap satu assignment.**
4. **Satu employee memiliki maksimum satu primary work state per work date.**
5. **OFF dan Unassigned adalah dua state yang berbeda secara bisnis.**
6. **Draft tidak sama dengan official schedule.**
7. **Published schedule menjadi sumber jadwal resmi.**
8. **Published schedule boleh dikoreksi, tetapi wajib audited.**
9. **Shift config harus mendukung historical/effective versioning.**
10. **Actual datetime overlap regular shift adalah invalid.**
11. **Minimum rest dan coverage merupakan configurable operational rules.**
12. **Bulk scheduling wajib mengikuti validation yang sama dengan single edit.**
13. **Copy/template/rotation menghasilkan draft, tidak auto-publish.**
14. **Now on Duty dihitung dari actual datetime, bukan hanya tanggal kalender.**
15. **Scheduling dan payroll dipisahkan domainnya tetapi terhubung melalui published historical assignment.**
16. **Schedule edit tidak boleh diam-diam mengubah payroll yang sudah locked.**
17. **Critical validation wajib terjadi server-side.**
18. **Concurrent conflicting edits tidak boleh silently overwrite.**
19. **Meaningful published changes harus dapat menghasilkan notification event.**
20. **Tidak ada silent automatic mutation terhadap jadwal user.**

---

## 29. Definition of Done for PRD-03

PRD-03 dianggap selesai secara product-design jika:

- scheduling terminology konsisten,
- date/time semantics tidak ambigu,
- cross-midnight behavior jelas,
- assignment uniqueness jelas,
- draft/published lifecycle jelas,
- conflict categories jelas,
- warning/blocking behavior jelas,
- coverage contract jelas,
- historical integrity dijaga,
- payroll boundary contract jelas,
- edge case utama tercakup,
- acceptance criteria dapat diterjemahkan menjadi automated tests.

Dokumen selanjutnya yang paling dekat dependency-nya adalah:

> **PRD-04 — Payroll, Salary & Incentive Logic**

PRD-04 akan menentukan bagaimana published schedule diubah menjadi komponen finansial yang deterministic, explainable, historical, dan aman terhadap perubahan konfigurasi masa depan.
