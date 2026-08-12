# PRD-04 — Payroll, Salary & Incentive Logic

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Business Logic  
> **Document ID:** PRD-04  
> **Status:** Draft — Payroll Logic Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements; PRD-02 — Feature Specification; PRD-03 — Scheduling & Shift Business Logic  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Currency:** IDR  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Purpose

Dokumen ini mendefinisikan **aturan bisnis inti payroll, gaji pokok, insentif shift, adjustment, finalization, locking, dan historical payroll** untuk NOCScheduler.

PRD-04 menjadi source of truth untuk menjawab pertanyaan:

> **“Bagaimana jadwal kerja NOC diubah menjadi perhitungan penghasilan bulanan yang deterministik, transparan, dapat dijelaskan, dan tidak merusak histori?”**

Dokumen ini harus menjadi acuan untuk:

- payroll calculation engine,
- compensation settings,
- employee salary configuration,
- incentive configuration,
- payroll review,
- monthly payroll report,
- payroll detail per employee,
- historical payroll,
- audit trail,
- backend validation,
- database design,
- API contract,
- automated tests,
- acceptance tests.

PRD-04 tidak menggantikan sistem payroll legal/compliance perusahaan. NOCScheduler pada baseline berfungsi sebagai **internal operational compensation calculator** berdasarkan data yang dikelola di dalam aplikasi.

Jika komponen legal seperti pajak, BPJS, atau potongan statutory belum dimodelkan, nilai yang ditampilkan harus dipahami sebagai **internal calculated/estimated take home pay**, bukan klaim payroll statutory resmi.

---

# 2. Payroll Principles

## PP-01 — Explain Every Number

Setiap nominal pada payroll harus dapat ditelusuri ke sumbernya.

Contoh:

`Insentif Shift 3 = 7 shift × Rp75.000 = Rp525.000`

User tidak boleh hanya melihat total tanpa mengetahui komponen pembentuknya.

---

## PP-02 — Published Schedule Is the Baseline Source

Pada baseline produk, hanya **published schedule** yang dapat menjadi sumber shift reguler untuk payroll.

Draft schedule:

- tidak dihitung,
- tidak menambah insentif,
- tidak boleh memengaruhi payroll.

Hal ini mengikuti lifecycle scheduling pada PRD-03.

---

## PP-03 — Payroll Uses Work Date

Eligibility suatu shift terhadap payroll period mengikuti `work_date` assignment.

Untuk shift lintas tengah malam:

- Shift 3 mulai 31 Agustus pukul 23:00,
- selesai 1 September pukul 07:00,
- `work_date = 31 Agustus`,

maka shift tersebut masuk payroll period Agustus apabila period menggunakan kalender Agustus.

Shift tidak boleh dihitung dua kali hanya karena melewati tengah malam.

---

## PP-04 — Historical Payroll Must Be Stable

Perubahan nominal insentif, gaji pokok, nama shift, jam shift, atau konfigurasi baru tidak boleh mengubah payroll historical secara diam-diam.

Sistem harus menyimpan snapshot atau reference version yang cukup untuk merekonstruksi hasil lama.

---

## PP-05 — Effective Dating Over Hard Replacement

Konfigurasi finansial yang berubah terhadap waktu harus memiliki effective date.

Contoh:

- Shift 3 sampai 31 Agustus = Rp75.000,
- Shift 3 mulai 1 September = Rp90.000.

Assignment Agustus harus tetap memakai tarif Rp75.000.

---

## PP-06 — Deterministic Calculation

Dengan:

- schedule source yang sama,
- configuration version yang sama,
- manual adjustment yang sama,
- payroll period yang sama,

hasil perhitungan harus selalu sama.

---

## PP-07 — Money Must Not Use Floating Point

Nominal IDR harus disimpan dan dihitung menggunakan representasi integer rupiah atau decimal fixed precision.

Tidak boleh menggunakan floating-point binary untuk operasi uang.

Contoh:

`Rp75.000` disimpan sebagai `75000`, bukan `75000.0` yang bergantung pada floating-point arithmetic.

---

## PP-08 — Generated Components and Manual Components Are Different

Komponen hasil kalkulasi otomatis harus dapat dibedakan dari adjustment manual.

Contoh generated:

- base salary,
- Shift 2 incentive,
- Shift 3 incentive,
- overtime dari rule engine di masa depan.

Contoh manual:

- bonus khusus,
- koreksi nominal,
- potongan manual,
- reimbursement/earning tambahan jika scope mengizinkan.

Recalculation tidak boleh diam-diam menghapus manual adjustment yang valid.

---

## PP-09 — Final Payroll Is Controlled Business Data

Payroll yang sudah final bukan sekadar angka UI.

Finalization dan locking harus memiliki:

- actor,
- timestamp,
- state transition,
- audit trail,
- snapshot sumber perhitungan.

---

## PP-10 — Transparency Does Not Mean Mutation Rights

Sesuai arah produk internal NOC, payroll dapat dibuat transparan antaruser sesuai kebijakan role.

Namun hak melihat tidak memberikan hak:

- mengubah salary,
- mengubah incentive rate,
- menambah adjustment,
- melakukan recalculation,
- finalize,
- lock,
- unlock.

Permission final ditentukan di PRD-07.

---

# 3. Core Payroll Terminology

## 3.1 Payroll Period

Rentang business date yang menjadi scope perhitungan payroll.

Baseline utama:

- monthly calendar period.

Contoh:

`2026-08-01 → 2026-08-31`

Arsitektur harus memungkinkan custom payroll cutoff di masa depan tanpa mengubah prinsip bahwa assignment dipilih berdasarkan `work_date`.

Minimum conceptual fields:

- `id`
- `period_code`
- `start_date`
- `end_date`
- `timezone`
- `status`
- `created_at`
- `calculated_at`
- `finalized_at`
- `locked_at`
- actor references

---

## 3.2 Employee Compensation Profile

Konfigurasi finansial yang terkait dengan employee.

Minimal dapat menyimpan:

- base salary,
- effective date,
- employment/compensation status,
- optional note,
- created/updated by,
- audit reference.

Salary history tidak boleh ditimpa secara destruktif setelah sudah digunakan oleh payroll historical.

---

## 3.3 Shift Incentive Rule

Rule yang menentukan nilai insentif untuk suatu shift type/version.

Baseline requirement user:

- Shift 1 / Pagi: default incentive `Rp0`,
- Shift 2 / Siang: configurable incentive,
- Shift 3 / Malam: configurable incentive.

Nilai insentif tidak boleh bergantung pada nama tampilan shift semata.

Sistem harus menggunakan stable shift identifier/version.

---

## 3.4 Payroll Record

Hasil payroll untuk satu employee pada satu payroll period.

Minimum conceptual fields:

- employee,
- payroll period,
- status,
- base salary component,
- shift incentive components,
- positive adjustments,
- deductions,
- other generated components,
- gross/internal earnings,
- calculated take home pay,
- snapshot/version references,
- calculation revision,
- calculated at/by,
- finalized at/by,
- locked at/by.

---

## 3.5 Payroll Item / Component

Unit detail pembentuk payroll.

Minimum conceptual fields:

- component type,
- source type,
- source reference,
- label,
- quantity,
- rate,
- amount,
- sign/direction,
- generated/manual flag,
- note/reason,
- configuration snapshot reference.

Contoh:

| Component | Qty | Rate | Amount |
|---|---:|---:|---:|
| Base Salary | 1 | Rp5.000.000 | Rp5.000.000 |
| Shift 2 Incentive | 6 | Rp50.000 | Rp300.000 |
| Shift 3 Incentive | 7 | Rp75.000 | Rp525.000 |
| Manual Bonus | 1 | Rp100.000 | Rp100.000 |

---

# 4. Baseline Payroll Formula

## 4.1 Core Formula

Baseline internal calculation:

```text
Calculated Take Home Pay
= Base Salary
+ Shift Incentives
+ Other Eligible Earnings
+ Positive Adjustments
- Deductions
```

Where:

```text
Shift Incentives
= Shift 2 Incentive
+ Shift 3 Incentive
+ incentive-bearing shift type lain jika kelak dikonfigurasi
```

Untuk MVP, komponen minimum wajib:

```text
Calculated THP
= Base Salary
+ Shift 2 Incentive
+ Shift 3 Incentive
+ Manual Positive Adjustments
- Manual Deductions
```

---

## 4.2 Shift Incentive Formula

Untuk satu shift type:

```text
Shift Incentive Amount
= Eligible Shift Count × Applicable Incentive Rate
```

Contoh:

```text
Shift 2 = 6 × Rp50.000 = Rp300.000
Shift 3 = 7 × Rp75.000 = Rp525.000
```

Applicable rate harus ditentukan berdasarkan effective date pada `work_date` setiap assignment.

---

## 4.3 Total Shift Count

Jumlah shift harus berasal dari assignment published yang eligible dalam payroll period.

Sistem harus dapat menjelaskan minimal:

- total Shift 1,
- total Shift 2,
- total Shift 3,
- jumlah OFF,
- jumlah exception relevan jika PRD-05 sudah diterapkan.

Jumlah OFF tidak menghasilkan shift incentive.

Unassigned tidak menghasilkan shift incentive.

---

# 5. Payroll Source Eligibility

## 5.1 Eligible Regular Shift

Assignment reguler dapat dihitung jika seluruh kondisi berikut terpenuhi:

1. assignment berada pada published schedule,
2. employee sesuai dengan payroll record,
3. `work_date` berada dalam payroll period,
4. assignment tidak dibatalkan/superseded secara bisnis,
5. shift type/version valid secara historical,
6. tidak ada exception downstream yang membuat assignment menjadi non-payable sesuai PRD-05.

---

## 5.2 Draft Assignment

Draft assignment selalu non-payable.

Tidak boleh ada flag UI yang membuat draft ikut masuk payroll hanya karena terlihat di kalender scheduler.

---

## 5.3 OFF

OFF:

- bukan shift,
- quantity incentive = 0,
- tidak menambah Shift 1/2/3 count.

---

## 5.4 Unassigned

Unassigned:

- bukan shift,
- tidak memberi insentif,
- dapat menjadi warning ketika payroll dihitung jika policy mengharuskan schedule completeness.

Payroll engine tidak boleh mengasumsikan Unassigned = OFF.

---

## 5.5 Cross-Midnight Shift

Satu cross-midnight shift dihitung satu kali berdasarkan `work_date`.

Tidak boleh membuat:

- dua incentive records,
- dua shift counts,
- split payroll period secara otomatis,

hanya karena `end_at` berada di hari berikutnya.

---

# 6. Base Salary Logic

## 6.1 Base Salary Is Employee-Specific

Setiap employee dapat memiliki base salary berbeda.

Nilai harus dikelola melalui compensation settings dengan permission yang sesuai.

---

## 6.2 Effective-Dated Salary

Perubahan salary harus menghasilkan historical version.

Contoh:

| Effective From | Salary |
|---|---:|
| 1 Jan 2026 | Rp5.000.000 |
| 1 Sep 2026 | Rp5.500.000 |

Payroll Agustus tetap menggunakan nilai sebelumnya.

---

## 6.3 Salary Version Overlap

Untuk satu employee, dua salary version tidak boleh memiliki effective range yang ambigu pada business date yang sama.

Backend harus menolak overlapping effective range.

---

## 6.4 Mid-Period Salary Change

Perubahan salary di tengah payroll period memiliki konsekuensi finansial dan tidak boleh diputuskan diam-diam oleh engine.

Baseline recommendation:

- perubahan salary normal berlaku pada awal payroll period berikutnya,
- jika organisasi membutuhkan perubahan mid-period, treatment harus eksplisit.

Supported future/advanced policies:

1. prorate by calendar day,
2. prorate by configured workday,
3. segmented salary calculation,
4. manual adjustment.

Untuk MVP, jika mid-period salary change belum memiliki proration policy yang aktif, sistem harus memberi validation/warning dan meminta resolution yang eksplisit.

---

## 6.5 Missing Base Salary

Jika employee termasuk payroll period tetapi tidak memiliki base salary yang valid:

- payroll calculation tidak boleh diam-diam menggunakan `0`,
- record harus diberi blocking error atau explicit incomplete state,
- user harus memperbaiki compensation configuration atau secara sadar menetapkan nilai yang valid.

---

# 7. Shift Incentive Logic

## 7.1 Default Incentive Model

Baseline:

- S1 = tidak memiliki insentif tambahan,
- S2 = memiliki configurable incentive,
- S3 = memiliki configurable incentive.

Sistem tetap dirancang generik agar shift type lain dapat memiliki incentive rule di masa depan.

---

## 7.2 Incentive Is Attached to Shift Identity

Rule tidak boleh seperti:

```text
if name == "Shift 3" then ...
```

Gunakan stable shift type/version reference.

Ini mencegah rename UI merusak payroll.

---

## 7.3 Effective-Dated Incentive

Incentive rate harus memiliki effective date.

Contoh:

| Shift | Effective From | Rate |
|---|---|---:|
| S3 | 1 Jan 2026 | Rp75.000 |
| S3 | 1 Sep 2026 | Rp90.000 |

Shift dengan `work_date` 31 Agustus memakai Rp75.000.

Shift dengan `work_date` 1 September memakai Rp90.000.

---

## 7.4 Mid-Period Incentive Change

Berbeda dari base salary, incentive shift dapat secara deterministik menggunakan rate per assignment berdasarkan `work_date`.

Jika rate berubah pada tanggal 16:

- shift tanggal 1–15 menggunakan rate lama,
- shift tanggal 16–akhir period menggunakan rate baru.

Payroll breakdown harus dapat menampilkan dua rate segment jika keduanya digunakan.

Contoh:

```text
Shift 3 — 5 × Rp75.000
Shift 3 — 4 × Rp90.000
```

Jangan menggabungkan menjadi satu baris yang menghilangkan jejak rate historical apabila hal itu membuat hasil sulit dijelaskan.

---

## 7.5 Missing Incentive Configuration

Jika shift type ditandai incentive-bearing tetapi tidak memiliki valid rate pada work date:

- calculation harus menghasilkan blocking error,
- tidak boleh diam-diam memakai 0.

Jika shift type memang non-incentive:

- explicit rate `0` atau explicit `incentive_enabled = false` diperbolehkan.

---

## 7.6 Incentive Count Source Traceability

User harus dapat menelusuri jumlah shift ke assignment pembentuknya.

Contoh:

> Shift 3: 7 shift

Dapat diperluas untuk melihat:

- 2 Aug,
- 5 Aug,
- 9 Aug,
- 13 Aug,
- 18 Aug,
- 23 Aug,
- 29 Aug.

---

# 8. Attendance, Leave, Overtime & Exception Contract

## 8.1 Baseline MVP Source

Sebelum domain attendance/exception penuh tersedia, payroll menggunakan **published schedule sebagai baseline operational truth**.

Artinya sistem tidak otomatis mengetahui apakah seseorang:

- terlambat,
- tidak hadir,
- sakit,
- menggantikan orang lain,
- overtime,

kecuali data tersebut dimasukkan melalui fitur exception yang sesuai.

---

## 8.2 PRD-05 Integration

PRD-05 akan menentukan bagaimana:

- leave,
- sick leave,
- permission,
- replacement,
- overtime,
- shift swap,
- public holiday,
- schedule exception

memengaruhi payable shift dan komponen payroll.

PRD-04 menyediakan extension point tetapi tidak boleh mengarang attendance aktual tanpa record.

---

## 8.3 No Silent Assumption

Jika sistem belum memiliki attendance tracking, UI tidak boleh menyebut hasil sebagai `actual attendance payroll`.

Gunakan istilah yang jujur seperti:

- calculated payroll,
- schedule-based payroll,
- estimated THP,

sampai seluruh sumber actual payroll tersedia.

---

# 9. Manual Adjustments

## 9.1 Adjustment Types

Baseline mendukung:

- positive adjustment,
- deduction.

Optional predefined categories:

- bonus,
- correction,
- allowance,
- deduction,
- reimbursement,
- other.

Category final dapat dikonfigurasi di masa depan.

---

## 9.2 Required Adjustment Metadata

Setiap manual adjustment harus menyimpan minimal:

- employee,
- payroll period,
- type/category,
- amount,
- reason/note,
- actor,
- created_at,
- updated_at jika boleh diedit,
- audit reference.

Reason wajib untuk adjustment manual yang memengaruhi total.

---

## 9.3 Adjustment Sign

Sistem harus menggunakan model yang tidak ambigu.

Direkomendasikan menyimpan:

- direction/type (`EARNING` / `DEDUCTION`),
- positive absolute amount.

Hindari UI yang mengharuskan user menebak apakah deduction harus memasukkan angka negatif.

---

## 9.4 Recalculation Behavior

Recalculation generated payroll components:

- boleh mengganti generated base salary component,
- boleh mengganti generated incentive components,
- boleh mengganti generated overtime component bila kelak ada,
- **tidak boleh menghapus manual adjustment** secara diam-diam.

Jika adjustment sudah tidak relevan setelah perubahan sumber, reviewer harus mendapat awareness untuk meninjau ulang.

---

# 10. Payroll Lifecycle

## 10.1 States

Baseline payroll period/record lifecycle:

1. `OPEN`
2. `CALCULATED`
3. `FINALIZED`
4. `LOCKED`

Implementation dapat menyimpan status period dan record secara terpisah, tetapi behavior bisnis harus konsisten.

---

## 10.2 OPEN

Period tersedia untuk persiapan.

Allowed:

- schedule masih dapat berubah sesuai permission,
- compensation configuration dapat diperbaiki,
- adjustment dapat disiapkan,
- calculation dapat dijalankan.

---

## 10.3 CALCULATED

Engine sudah menghasilkan payroll dari source saat itu.

Status ini bukan jaminan final.

Sistem harus menyimpan:

- calculation revision,
- calculated_at,
- calculated_by,
- source freshness/dirty indicator.

---

## 10.4 Dirty / Recalculation Required

Jika source data berubah setelah calculation, payroll harus ditandai `dirty`, `outdated`, atau equivalent state yang jelas.

Contoh perubahan source:

- published schedule berubah,
- base salary effective record berubah,
- incentive rate berubah,
- eligible exception berubah.

User tidak boleh melihat hasil lama tanpa warning seolah-olah masih current.

---

## 10.5 FINALIZED

Finalized berarti reviewer yang berhak menyatakan hasil sudah siap dianggap final secara operasional.

Finalization harus gagal jika terdapat:

- blocking calculation error,
- missing salary,
- missing incentive configuration,
- unresolved required correction,
- dirty calculation.

Finalized payroll tetap harus dapat dilihat breakdown-nya.

---

## 10.6 LOCKED

Locked adalah state proteksi tertinggi untuk periode historical.

Pada state locked:

- generated component tidak boleh direcalculate normal,
- manual adjustment tidak boleh diedit normal,
- source change tidak boleh silently mutate payroll,
- record historical harus immutable dari workflow biasa.

Unlock hanya boleh dilakukan oleh permission khusus dan harus memiliki:

- reason wajib,
- actor,
- timestamp,
- audit trail,
- previous lock metadata.

Baseline recommendation: unlock adalah exceptional workflow, bukan tombol harian.

---

# 11. Payroll Calculation Workflow

## 11.1 Calculation Steps

Untuk setiap employee dalam payroll scope:

1. Resolve payroll period.
2. Resolve employee eligibility.
3. Resolve valid base salary version.
4. Load eligible published schedule assignments by `work_date`.
5. Resolve incentive rate per assignment.
6. Group incentive components by shift/rate version.
7. Apply eligible exception/overtime components jika domain tersedia.
8. Preserve/apply manual adjustments.
9. Calculate totals.
10. Validate breakdown.
11. Persist calculation revision + snapshots.
12. Mark result `CALCULATED`.

---

## 11.2 Calculation Must Be Idempotent

Menjalankan calculation dua kali dengan input yang tidak berubah harus menghasilkan hasil bisnis yang sama.

Engine tidak boleh menggandakan payroll item hanya karena endpoint dipanggil dua kali.

---

## 11.3 Generated Item Replacement

Recalculation direkomendasikan menggunakan strategi:

- generated items untuk revision lama diganti/versioned secara atomik,
- manual items dipertahankan,
- total baru dibuat dari revision yang konsisten.

Jangan melakukan append generated items tanpa cleanup/version boundary karena dapat menyebabkan double counting.

---

## 11.4 Atomicity

Calculation satu employee harus atomik.

Untuk bulk monthly calculation, sistem harus memberikan hasil jelas per employee dan tidak meninggalkan half-written record yang terlihat final.

Strategi transaksi final ditentukan pada Technical Architecture PRD.

---

# 12. Payroll Snapshot & Historical Integrity

## 12.1 Snapshot Requirement

Payroll revision yang disimpan harus cukup untuk menjelaskan:

- base salary yang digunakan,
- shift count,
- work dates pembentuk count,
- incentive rate yang digunakan,
- configuration/effective version,
- manual adjustment,
- total.

---

## 12.2 Source Reference + Snapshot

Direkomendasikan menggunakan kombinasi:

- reference ke source record,
- snapshot nilai finansial yang benar-benar digunakan.

Dengan demikian, source masih dapat ditelusuri tetapi hasil historical tidak bergantung pada source mutable.

---

## 12.3 No Historical Cascade

Mengubah salary/incentive setting baru tidak boleh melakukan cascade update ke payroll locked lama.

Jika user ingin historical correction, gunakan explicit correction/reopen workflow.

---

# 13. Employee Eligibility

## 13.1 Active Employee

Employee active pada payroll period dapat memiliki payroll record apabila memiliki compensation setup sesuai policy.

---

## 13.2 Employee Joined Mid-Period

Jika employee mulai aktif di tengah period, base salary treatment bergantung pada proration policy.

Sebelum policy proration tersedia:

- sistem harus memberi awareness,
- tidak boleh membuat asumsi tersembunyi,
- admin dapat menyelesaikan melalui approved manual adjustment atau configured policy.

---

## 13.3 Employee Inactive Mid-Period

Prinsip yang sama berlaku untuk employee yang berhenti aktif di tengah period.

Historical shift sebelum inactive date tetap dapat dipertahankan dan dihitung sesuai rule yang berlaku.

---

## 13.4 Inactive Historical Employee

Employee yang sekarang inactive tetap harus muncul pada historical payroll periode ketika dahulu masih eligible.

Inactive bukan alasan menghapus historical payroll.

---

# 14. Rounding Rules

## 14.1 IDR Baseline

Karena baseline currency adalah IDR dan nominal disimpan dalam rupiah integer, hasil komponen normal tidak memerlukan fractional rupiah.

---

## 14.2 Proration Future Rule

Jika proration menghasilkan pecahan rupiah, sistem harus memiliki satu rounding policy global yang eksplisit.

Contoh policy yang dapat dipilih kemudian:

- round half up ke rupiah terdekat,
- floor,
- ceil.

Policy tidak boleh berbeda diam-diam antarendpoint.

---

# 15. Payroll Totals

## 15.1 Required Totals

Minimal setiap payroll record menampilkan:

- Base Salary
- Shift 1 Count
- Shift 2 Count
- Shift 3 Count
- Shift 2 Incentive
- Shift 3 Incentive
- Other Earnings
- Positive Adjustments
- Deductions
- Calculated Take Home Pay

Jika Shift 1 incentive = 0, amount dapat tidak ditonjolkan tetapi count tetap berguna untuk reporting.

---

## 15.2 Formula Consistency

UI total, export, API, report, dan detail payroll harus menggunakan calculation result yang sama.

Tidak boleh ada formula duplikat berbeda antara frontend dan backend.

Backend payroll engine adalah source of truth perhitungan.

---

# 16. Monthly Payroll Report Logic

## 16.1 Minimum Columns

Baseline monthly report:

| Employee | S1 | S2 | S3 | Base Salary | S2 Incentive | S3 Incentive | Adjustments | Deductions | THP |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|

---

## 16.2 Drill Down

Setiap employee row harus dapat menuju detail payroll yang menjelaskan komponennya.

---

## 16.3 Period Totals

Actor yang berhak dapat melihat aggregate:

- total base salary,
- total shift incentives,
- total adjustments,
- total deductions,
- total calculated THP seluruh NOC.

---

## 16.4 Export Consistency

CSV/XLSX/PDF/print report apabila tersedia harus memakai revision payroll yang sama dengan UI.

Export tidak boleh menghitung ulang formula sendiri di client.

---

# 17. Payroll Change Awareness

## 17.1 Schedule Change Before Lock

Jika published schedule diubah pada period yang payroll-nya sudah calculated tetapi belum locked:

- payroll ditandai dirty,
- system menunjukkan employee terdampak,
- recalculation diperlukan sebelum finalization.

---

## 17.2 Schedule Change After Lock

Jika historical schedule dikoreksi setelah payroll locked:

- locked payroll tidak berubah otomatis,
- system harus memberi payroll impact warning,
- correction harus melalui exceptional payroll correction workflow jika memang diperlukan.

---

## 17.3 Compensation Change Before Lock

Perubahan salary/rate yang effective terhadap period calculated harus menandai payroll terdampak sebagai dirty jika payroll belum locked.

---

## 17.4 Compensation Change After Lock

Locked payroll tetap immutable sampai explicit unlock/correction dilakukan.

---

# 18. Validation Severity

## 18.1 Blocking Error

Contoh:

- missing base salary,
- incentive-bearing shift tanpa rate,
- invalid effective date overlap,
- duplicate payroll record employee-period,
- calculation source tidak konsisten,
- attempt normal edit pada locked payroll.

---

## 18.2 Warning

Contoh:

- employee memiliki Unassigned work dates,
- unusually high shift incentive count,
- mid-period employment change tanpa proration automation,
- large manual adjustment,
- payroll calculated tetapi schedule berubah sesudahnya.

Warning tertentu dapat membutuhkan acknowledgement atau reason.

---

## 18.3 Info

Contoh:

- employee tidak memiliki Shift 2/3 pada period,
- tidak ada adjustment,
- payroll sama dengan revision sebelumnya.

---

# 19. Concurrency & Integrity

## 19.1 No Duplicate Employee Payroll

Untuk kombinasi:

`employee_id + payroll_period_id`

hanya boleh ada satu logical current payroll record.

Revision dapat banyak, tetapi tidak boleh ada dua current payroll yang ambigu.

---

## 19.2 Concurrent Recalculation

Dua calculation request bersamaan tidak boleh menghasilkan double component atau corrupt total.

Gunakan transaction/locking/version guard pada implementation.

---

## 19.3 Stale Update Protection

Jika reviewer sedang membuka payroll dan data berubah di server, save/finalize harus mendeteksi stale revision.

Silent overwrite tidak diperbolehkan.

---

# 20. Audit Requirements

Perubahan berikut wajib diaudit:

- base salary create/change/inactivate,
- incentive rate create/change/inactivate,
- payroll calculation,
- recalculation,
- manual adjustment create/update/delete,
- finalization,
- lock,
- unlock,
- correction,
- payroll configuration change.

Minimum audit data:

- actor,
- timestamp,
- action,
- entity,
- before,
- after,
- reason bila relevan,
- payroll period,
- affected employee bila relevan.

Detail audit architecture berada pada PRD-09.

---

# 21. Security & Permission Boundary

Server-side authorization wajib untuk mutation payroll.

Minimum conceptual capabilities:

- `payroll.view`
- `payroll.calculate`
- `payroll.adjust`
- `payroll.finalize`
- `payroll.lock`
- `payroll.unlock`
- `salary.view`
- `salary.manage`
- `incentive.manage`

Nama permission final ditentukan pada PRD-07/technical implementation.

Frontend hiding bukan security boundary.

---

# 22. Configuration Requirements

Settings harus memungkinkan actor yang berhak mengelola minimal:

## Compensation

- employee base salary,
- effective date,
- notes/history.

## Incentive

- Shift 2 incentive,
- Shift 3 incentive,
- effective date,
- enable/disable incentive status.

## Payroll

- payroll period/cutoff policy,
- rounding policy jika diperlukan,
- proration policy jika kelak diaktifkan,
- allowed adjustment categories bila digunakan.

Critical setting change harus memiliki preview/confirmation dan audit trail.

---

# 23. Recommended Payroll UX Contract

Walaupun detail visual berada pada PRD UI/UX, business logic membutuhkan beberapa UX contract.

## 23.1 Payroll Overview

User harus dapat membedakan dengan jelas:

- not calculated,
- calculated,
- outdated/dirty,
- finalized,
- locked,
- error.

---

## 23.2 Employee Breakdown

Detail employee harus menjawab:

1. Berapa gaji pokok?
2. Berapa kali S1/S2/S3?
3. Tarif insentif apa yang dipakai?
4. Tanggal shift mana yang dihitung?
5. Ada adjustment apa?
6. Ada deduction apa?
7. Total akhirnya berasal dari mana?

---

## 23.3 Recalculation Preview

Jika memungkinkan, sebelum recalculation yang mengubah hasil signifikan, UI menampilkan impact summary.

Contoh:

```text
3 employee terdampak
Total THP berubah +Rp425.000
```

Ini merupakan enhancement bernilai tinggi untuk mengurangi kesalahan operasional.

---

# 24. Business Rules Catalogue

Rule ID berikut menjadi kontrak awal untuk implementasi dan automated test.

### PAY-001
Draft schedule tidak pernah menghasilkan shift incentive.

### PAY-002
Hanya eligible published assignment yang menjadi source shift payroll baseline.

### PAY-003
Shift lintas tengah malam dihitung berdasarkan `work_date` tanggal mulai.

### PAY-004
Satu assignment reguler hanya dihitung satu kali.

### PAY-005
OFF tidak menghasilkan shift incentive.

### PAY-006
Unassigned tidak menghasilkan shift incentive dan tidak boleh dianggap OFF.

### PAY-007
S1 default tidak memiliki incentive tambahan.

### PAY-008
S2 incentive configurable.

### PAY-009
S3 incentive configurable.

### PAY-010
Incentive rule menggunakan stable shift identity/version, bukan display name.

### PAY-011
Incentive rate dipilih berdasarkan effective date pada assignment work date.

### PAY-012
Perubahan incentive rate tidak mengubah locked historical payroll.

### PAY-013
Base salary bersifat employee-specific.

### PAY-014
Base salary harus effective-dated/versioned.

### PAY-015
Missing required base salary adalah blocking error.

### PAY-016
Overlapping salary effective range tidak diperbolehkan.

### PAY-017
Missing incentive rate pada incentive-bearing shift adalah blocking error.

### PAY-018
Money calculation tidak menggunakan floating point binary.

### PAY-019
Generated component harus dapat dibedakan dari manual adjustment.

### PAY-020
Manual adjustment membutuhkan reason.

### PAY-021
Recalculation tidak boleh silently menghapus manual adjustment.

### PAY-022
Calculation dengan input yang sama harus deterministik dan idempotent.

### PAY-023
Payroll yang source-nya berubah setelah calculate harus ditandai dirty jika belum locked.

### PAY-024
Dirty payroll tidak boleh finalized tanpa recalculation/resolution.

### PAY-025
Finalization memerlukan zero blocking error.

### PAY-026
Locked payroll immutable melalui normal workflow.

### PAY-027
Unlock membutuhkan permission khusus dan reason.

### PAY-028
Schedule correction setelah payroll lock tidak mengubah payroll secara otomatis.

### PAY-029
Compensation change setelah payroll lock tidak mengubah payroll secara otomatis.

### PAY-030
Employee inactive tetap muncul pada historical payroll yang relevan.

### PAY-031
Frontend dan export tidak boleh memiliki formula payroll independen dari backend source of truth.

### PAY-032
Payroll breakdown harus dapat menjelaskan quantity × rate untuk incentive.

### PAY-033
Mid-period incentive rate change dapat menghasilkan beberapa rate segment dalam satu payroll.

### PAY-034
Mid-period salary change tidak boleh memiliki treatment tersembunyi.

### PAY-035
Duplicate logical payroll record untuk employee-period tidak diperbolehkan.

### PAY-036
Concurrent calculation tidak boleh menyebabkan double counting.

### PAY-037
Stale payroll revision tidak boleh silently overwrite revision lebih baru.

### PAY-038
Setiap calculation revision harus menyimpan trace/snapshot yang cukup untuk historical explanation.

### PAY-039
Payroll total harus berasal dari komponen yang dapat direkonsiliasi.

### PAY-040
Transparency of payroll data tidak memberikan mutation permission.

---

# 25. Acceptance Criteria — Payroll Engine

Payroll engine dianggap memenuhi baseline jika:

- [ ] dapat menghitung gaji pokok per employee,
- [ ] dapat menghitung jumlah S1/S2/S3 dari published schedule,
- [ ] dapat menghitung insentif S2,
- [ ] dapat menghitung insentif S3,
- [ ] shift malam cross-midnight tidak double counted,
- [ ] effective-dated incentive bekerja,
- [ ] historical rate tetap dapat dijelaskan,
- [ ] salary employee berbeda dapat dihitung dengan benar,
- [ ] missing salary menghasilkan error yang jelas,
- [ ] manual positive adjustment dapat ditambahkan,
- [ ] deduction dapat ditambahkan,
- [ ] adjustment memiliki reason dan actor,
- [ ] recalculation deterministik,
- [ ] recalculation tidak menduplikasi generated items,
- [ ] recalculation tidak menghapus adjustment manual,
- [ ] perubahan source membuat calculated payroll menjadi dirty,
- [ ] dirty payroll tidak dapat finalized tanpa resolution,
- [ ] payroll dapat finalized,
- [ ] payroll dapat locked,
- [ ] locked payroll tidak berubah oleh setting baru,
- [ ] unlock/correction diaudit,
- [ ] monthly report menggunakan calculation revision yang sama,
- [ ] employee detail dapat menelusuri shift pembentuk incentive,
- [ ] seluruh money calculation aman dari floating-point error.

---

# 26. Test Matrix — Critical Scenarios

## T-PAY-01 — Normal Month

Employee memiliki:

- salary valid,
- beberapa S1,
- beberapa S2,
- beberapa S3.

Expected:

- count benar,
- incentive benar,
- total benar.

---

## T-PAY-02 — Cross-Midnight End of Month

S3 mulai 31 Agustus dan selesai 1 September.

Expected:

- masuk Agustus,
- dihitung satu kali.

---

## T-PAY-03 — Draft vs Published

Assignment hanya ada di draft.

Expected:

- incentive = 0 dari assignment tersebut.

Setelah publish:

- assignment menjadi eligible.

---

## T-PAY-04 — Incentive Rate Change Mid-Month

Rate S3 berubah 16 Agustus.

Expected:

- work date sebelum 16 memakai rate lama,
- work date mulai 16 memakai rate baru,
- breakdown menunjukkan segment yang dapat dijelaskan.

---

## T-PAY-05 — Incentive Rate Change Next Month

Payroll Agustus sudah locked.

Rate September berubah.

Expected:

- payroll Agustus tidak berubah.

---

## T-PAY-06 — Missing Salary

Employee memiliki shift tetapi tidak memiliki salary version valid.

Expected:

- calculation incomplete/blocking,
- tidak diam-diam salary 0.

---

## T-PAY-07 — Manual Bonus

Tambah bonus Rp200.000.

Expected:

- total naik Rp200.000,
- reason tercatat,
- recalculation mempertahankan bonus.

---

## T-PAY-08 — Manual Deduction

Tambah deduction Rp150.000.

Expected:

- total turun Rp150.000,
- reason tercatat.

---

## T-PAY-09 — Schedule Changed After Calculation

S2 employee diubah menjadi S3 sebelum payroll lock.

Expected:

- payroll menjadi dirty,
- recalculation memperbarui count dan incentive,
- finalization ditolak selama dirty.

---

## T-PAY-10 — Schedule Changed After Lock

Historical schedule dikoreksi setelah payroll locked.

Expected:

- locked payroll tidak berubah,
- payroll impact warning/audit tersedia,
- correction memerlukan workflow eksplisit.

---

## T-PAY-11 — Repeated Calculation

Calculation dijalankan dua kali tanpa perubahan input.

Expected:

- tidak ada double component,
- total sama.

---

## T-PAY-12 — Employee Inactive

Employee sudah inactive sekarang tetapi memiliki payroll historical.

Expected:

- historical payroll tetap dapat dibaca lengkap.

---

## T-PAY-13 — Concurrent Calculation

Dua request calculate berjalan hampir bersamaan.

Expected:

- satu consistent current revision,
- tidak ada duplicate items/double total.

---

## T-PAY-14 — Overlapping Salary Version

Admin mencoba membuat salary version dengan effective range yang overlap.

Expected:

- server menolak.

---

# 27. Out of Scope for PRD-04

Detail berikut sengaja dipisahkan:

- leave/sick/permission detailed logic → PRD-05,
- shift swap/replacement detailed logic → PRD-05,
- overtime eligibility formula → PRD-05,
- page hierarchy/navigation → PRD-06,
- final role/permission matrix → PRD-07,
- database schema final → PRD-08,
- audit storage architecture → PRD-09,
- UI interaction details → PRD-10 onward,
- API endpoint contract → PRD-15,
- security implementation → PRD-16,
- export/report visual specification → PRD-17,
- automated quality gates → PRD-19.

---

# 28. Open Configuration Decisions for Later PRDs

Beberapa keputusan sengaja dibuat configurable agar tidak mengunci organisasi terlalu dini:

1. Apakah payroll period selalu kalender bulanan atau memiliki cutoff khusus?
2. Apakah gaji pokok diprorata untuk join/leave mid-month?
3. Jika prorata, menggunakan calendar day atau configured workday?
4. Apakah overtime memiliki rate tetap, multiplier, atau manual amount?
5. Apakah public holiday memberi komponen tambahan?
6. Apakah leave tertentu tetap dianggap payable?
7. Apakah replacement shift mengalihkan incentive otomatis?
8. Apakah payroll dapat dibuka kembali setelah lock dan siapa yang berhak?
9. Apakah seluruh NOC dapat melihat full payroll seluruh employee atau hanya summary tertentu?

Pertanyaan ini tidak menghalangi fondasi implementation karena data model dan lifecycle sudah dirancang untuk mengakomodasinya.

---

# 29. Implementation Guidance

Walaupun detail technical architecture belum ditentukan, payroll engine sebaiknya mengikuti separation berikut:

```text
Published Schedule
        │
        ▼
Payroll Source Resolver
        │
        ├── Salary Version Resolver
        ├── Incentive Version Resolver
        ├── Exception/Overtime Resolver
        └── Manual Adjustment Resolver
        │
        ▼
Payroll Calculation Engine
        │
        ▼
Payroll Revision + Breakdown
        │
        ├── Overview
        ├── Employee Detail
        ├── Reports
        └── Export
```

Business formula tidak boleh tersebar di React component atau report renderer.

---

# 30. Definition of Done — PRD-04

PRD-04 dianggap menjadi kontrak payroll yang cukup untuk melanjutkan desain sistem jika:

1. sumber schedule yang eligible sudah jelas,
2. work-date behavior sudah jelas,
3. base salary versioning sudah jelas,
4. S2/S3 incentive logic sudah jelas,
5. effective dating sudah jelas,
6. cross-midnight behavior sudah jelas,
7. adjustment behavior sudah jelas,
8. recalculation behavior sudah jelas,
9. dirty/finalized/locked lifecycle sudah jelas,
10. historical integrity sudah jelas,
11. audit boundary sudah jelas,
12. extension point PRD-05 sudah jelas,
13. critical business rules dapat diterjemahkan menjadi automated tests.

---

## Related Documents

- PRD-01 — Product Vision, Scope & Requirements
- PRD-02 — Feature Specification
- PRD-03 — Scheduling & Shift Business Logic
- PRD-05 — Attendance, Leave, Overtime & Schedule Exception Logic *(next)*
- PRD-07 — Roles, Permissions & Internal Transparency
- PRD-08 — Data Model & Database Architecture
- PRD-09 — Audit Trail & Historical Data
- PRD-17 — Reporting, Analytics & Export
- PRD-19 — QA, Testing & Acceptance Criteria
