# PRD-17 — Reporting, Analytics & Export

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Reporting, Analytics & Export  
> **Document ID:** PRD-17  
> **Status:** Draft — Reporting & Analytics Source of Truth  
> **Depends On:** PRD-01 through PRD-16  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **reporting model, analytics, metric definitions, report catalog, filtering, grouping, drill-down, historical comparison, fairness analysis, coverage reporting, payroll reporting, export behavior, print behavior, data freshness, access control, mobile/desktop presentation, dan reporting quality standard** untuk NOCScheduler.

PRD-17 menjadi source of truth untuk menjawab:

> **“Bagaimana data jadwal, exception, employee, payroll, dan histori diubah menjadi laporan yang cepat dipahami, dapat dipercaya, dapat ditelusuri ke sumbernya, dan berguna untuk keputusan operasional NOC?”**

Reporting tidak boleh menciptakan business truth baru yang berbeda dari canonical domain record.

Canonical source tetap berasal dari:

- published schedule dan schedule revisions,
- effective operational state,
- approved exception/replacement/overtime,
- employee record,
- compensation version,
- payroll record/revision/item,
- audit/business history.

Report hanyalah **projection, aggregation, comparison, dan presentation layer** terhadap data tersebut.

---

# 2. Reporting Vision

NOCScheduler harus menyediakan reporting yang terasa seperti **operational intelligence workspace**, bukan sekadar tabel export.

User harus dapat menjawab pertanyaan seperti:

- Berapa kali setiap NOC mendapat Shift 1, 2, dan 3 bulan ini?
- Apakah distribusi Shift 2 dan Shift 3 cukup seimbang?
- Siapa yang paling banyak mendapat Shift 3?
- Berapa total insentif shift per orang?
- Berapa total payroll internal bulan ini?
- Mengapa THP seseorang sebesar nilai tertentu?
- Hari/shift mana yang coverage-nya paling rendah?
- Berapa banyak leave, sick, replacement, dan overtime?
- Bagaimana perbandingan bulan ini dengan bulan lalu?
- Apakah sebuah angka pada dashboard sama dengan detail sumbernya?

Target experience:

> **Summary first → insight → filter → drill-down → source record.**

User tidak boleh dipaksa mengunduh spreadsheet hanya untuk memahami kondisi operasional dasar.

---

# 3. Core Reporting Principles

## RPT-P01 — Report Is a Projection, Not a Second Source of Truth

Report tidak boleh menyimpan angka bisnis independen yang kemudian berbeda dari source record.

Contoh:

```text
Payroll Report THP
=
PayrollRecord.current/final revision THP
```

Bukan hasil kalkulasi alternatif di frontend.

Derived cache/materialized view diperbolehkan untuk performa selama dapat direbuild dari source of truth.

---

## RPT-P02 — Every Important Number Must Be Explainable

Metric yang berdampak operasional atau finansial harus dapat ditelusuri.

Contoh:

> Shift 3 = 7

User harus dapat membuka detail 7 work date pembentuk angka tersebut.

Contoh:

> Shift 3 Incentive = Rp525.000

User harus dapat melihat quantity, applicable rate, dan source assignment/payroll item.

---

## RPT-P03 — Never Mix Planned and Effective Data Silently

Report schedule harus membedakan:

- planned schedule,
- effective operational state.

Jika Budi dijadwalkan Shift 3 tetapi sakit dan digantikan Andi, report tidak boleh mencampur kedua fakta tanpa label.

Baseline reporting operasional sebaiknya menyediakan pilihan:

- `Planned`
- `Effective`

atau menampilkan keduanya bila konteks membutuhkan.

---

## RPT-P04 — Payroll Reporting Uses Payroll Truth

Laporan payroll tidak boleh menghitung ulang THP secara independen dari payroll engine.

Gunakan payroll revision yang sesuai state:

- current calculated revision untuk review,
- finalized/locked revision untuk laporan final.

Locked historical payroll selalu mempertahankan angka snapshot-nya.

---

## RPT-P05 — Work Date Remains Canonical

Semua report shift mengikuti `work_date` sebagaimana PRD-03 dan PRD-04.

Cross-midnight shift tetap dihitung satu kali pada tanggal mulai shift.

---

## RPT-P06 — Empty Is Not Zero Unless Semantically True

Report harus membedakan:

- `0` — nilai benar-benar nol,
- `N/A` — metric tidak berlaku,
- `Missing` — data/config tidak tersedia,
- `Unassigned` — belum ada schedule state,
- `No result` — filter tidak menemukan data.

Jangan menyamakan semua keadaan menjadi angka nol.

---

## RPT-P07 — Comparison Must Use Comparable Scope

Perbandingan antarperiode harus menggunakan scope yang jelas.

Contoh:

- calendar month vs calendar month,
- employee set yang sama atau diberi awareness jika berubah,
- planned vs planned,
- effective vs effective,
- locked payroll vs locked payroll.

Jangan membandingkan dua metric dengan definisi berbeda tanpa label.

---

## RPT-P08 — Fairness Is an Insight, Not a Verdict

Fairness reporting membantu melihat distribusi shift, tetapi tidak boleh memberi label moral otomatis seperti `adil/tidak adil` tanpa policy organisasi.

Sistem boleh menunjukkan:

- distribusi,
- deviasi,
- ranking,
- range,
-平均との差/average difference,
- concentration.

Keputusan operasional tetap pada manusia.

---

## RPT-P09 — Charts Must Improve Understanding

Chart hanya digunakan jika lebih cepat dipahami daripada tabel.

Jangan menggunakan chart sebagai dekorasi.

Tabel tetap menjadi representasi utama untuk data yang membutuhkan presisi tinggi.

---

## RPT-P10 — Mobile and Desktop Are Equal Reporting Experiences

Desktop mengoptimalkan:

- comparison,
- dense tables,
- side-by-side analysis,
- export,
- large datasets.

Mobile mengoptimalkan:

- key summary,
- focused filters,
- drill-down,
- employee/month detail,
- review cepat.

Mobile tidak boleh hanya menampilkan versi tabel desktop yang dipaksa menyempit.

---

# 4. Reporting Domains

Reporting dibagi menjadi lima domain utama:

1. **Schedule & Shift Reporting**
2. **Coverage & Operational Reporting**
3. **Employee Monthly Reporting**
4. **Payroll & Compensation Reporting**
5. **Management / Cross-Domain Analytics**

Supporting capability:

- filtering,
- comparison,
- export,
- print,
- drill-down,
- saved view future extension.

---

# 5. Canonical Report Catalog

## RPT-01 — Shift Distribution Report

**Priority:** P0

Purpose:

Menampilkan distribusi Shift 1, Shift 2, Shift 3, OFF, dan exception relevan untuk setiap employee pada periode tertentu.

Minimum columns:

| Employee | S1 | S2 | S3 | OFF | Exceptions | Total Scheduled |
|---|---:|---:|---:|---:|---:|---:|

Optional additions:

- overtime count/hours,
- replacement count,
- total incentive-bearing shifts,
- percentage distribution.

### Drill-down

Klik quantity harus membuka source work dates.

Contoh:

`S3 = 7 → 2, 5, 9, 13, 18, 23, 29 Aug`

---

## RPT-02 — Shift Fairness / Distribution Insight

**Priority:** P1

Purpose:

Membantu scheduler mengevaluasi apakah distribusi shift tertentu terlalu terkonsentrasi pada sebagian anggota.

Baseline metrics:

- S2 count per employee,
- S3 count per employee,
- combined S2+S3 count,
- minimum,
- maximum,
- mean/average,
- median bila berguna,
- range,
- deviation from team average.

Optional future metrics:

- rolling 3-month distribution,
- weighted undesirable-shift score,
- employee availability-aware comparison.

### Guardrail

Jangan menggunakan fairness score tunggal sebagai auto-judgement kecuali organisasi secara eksplisit menetapkan formula tersebut.

---

## RPT-03 — Team Coverage Report

**Priority:** P0

Purpose:

Menampilkan coverage per shift/per tanggal.

Minimum dimensions:

- work date,
- shift,
- planned headcount,
- effective headcount,
- minimum required coverage jika policy aktif,
- coverage status.

Status conceptual:

- Healthy
- Warning
- Under-covered
- Not configured

### Drill-down

Coverage cell → daftar employee planned/effective + exception/replacement context.

---

## RPT-04 — Coverage Risk / Under-Coverage Report

**Priority:** P1

Menampilkan tanggal/shift yang:

- di bawah minimum coverage,
- memiliki banyak unavailable employee,
- membutuhkan replacement,
- memiliki unresolved request yang berpotensi memengaruhi coverage.

Report harus membedakan actual/effective issue dengan future risk.

---

## RPT-05 — Employee Monthly Summary

**Priority:** P0

Satu halaman/record ringkasan bulanan per employee.

Minimum sections:

### Schedule Summary

- total S1,
- total S2,
- total S3,
- OFF,
- total scheduled shifts.

### Exception Summary

Jika tersedia:

- leave,
- sick,
- permission,
- training,
- business duty,
- replacement,
- shift swap,
- overtime.

### Payroll Summary

- base salary,
- S2 incentive,
- S3 incentive,
- overtime earning jika aktif,
- adjustments,
- deductions,
- calculated/final THP,
- payroll status.

### Navigation

Harus dapat drill-down ke:

- employee schedule,
- request/exception detail,
- payroll detail.

---

## RPT-06 — Monthly Payroll Report

**Priority:** P0

Core table:

| Employee | S1 | S2 | S3 | Base Salary | S2 Incentive | S3 Incentive | Other Earnings | Deductions | THP | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|

### Requirements

- angka berasal dari payroll record/revision canonical,
- status payroll terlihat jelas,
- dirty/outdated record tidak boleh terlihat seperti final,
- finalized/locked state harus distinguishable,
- total team tersedia,
- drill-down employee tersedia.

---

## RPT-07 — Payroll Component Report

**Priority:** P1

Memungkinkan analisis komponen payroll antaremployee.

Dimensions:

- employee,
- component type,
- quantity,
- rate,
- amount,
- payroll period,
- source type.

Use cases:

- total Shift 3 incentive seluruh tim,
- total adjustment bulan tertentu,
- total deductions,
- overtime earning total.

---

## RPT-08 — Payroll Period Comparison

**Priority:** P1

Membandingkan dua atau lebih payroll period.

Minimum comparison:

- total payroll,
- average THP,
- total shift incentive,
- S2 incentive,
- S3 incentive,
- adjustment,
- deductions.

Per-employee comparison dapat ditampilkan melalui drill-down.

### Guardrail

Comparison harus menunjukkan jika employee population berubah signifikan sehingga total tidak dibaca sebagai like-for-like comparison.

---

## RPT-09 — Exception & Leave Report

**Priority:** P1

Menampilkan volume dan distribusi exception.

Dimensions:

- type,
- employee,
- date,
- status,
- approval state,
- replacement state,
- payroll impact.

Metrics:

- total leave,
- sick count,
- permission count,
- pending requests,
- replacement frequency,
- approved/rejected ratio bila berguna.

---

## RPT-10 — Overtime Report

**Priority:** P1 bila overtime feature aktif

Minimum data:

- employee,
- date,
- duration/quantity,
- approval state,
- payable/non-payable state,
- applicable rate/policy,
- generated amount,
- payroll period.

Overtime report tidak boleh mencampur regular shift count.

---

## RPT-11 — Replacement & Shift Swap Report

**Priority:** P2

Insight:

- employee paling sering membutuhkan replacement,
- employee paling sering menjadi replacement,
- shift swap volume,
- approval turnaround,
- affected shift type.

Tujuan utama adalah operational awareness, bukan performance judgement otomatis.

---

## RPT-12 — Schedule Change Report

**Priority:** P1

Menampilkan perubahan published schedule dalam periode.

Minimum data:

- affected employee,
- work date,
- before state,
- after state,
- actor,
- changed at,
- reason bila tersedia,
- payroll impact awareness.

Sumber utamanya berasal dari business history/audit + schedule revision.

---

## RPT-13 — Employee Shift History

**Priority:** P1

Historical trend per employee lintas bulan.

Contoh:

| Month | S1 | S2 | S3 | OFF | Leave | Incentive |
|---|---:|---:|---:|---:|---:|---:|

Dapat digunakan untuk:

- melihat pola shift jangka menengah,
- mendukung fairness review,
- memahami perubahan insentif.

---

## RPT-14 — Team Monthly Operational Summary

**Priority:** P1

Executive/summary view satu bulan.

Minimum:

- total scheduled shifts,
- total effective shifts,
- total S1/S2/S3,
- total leave/sick,
- total replacements,
- total overtime,
- under-coverage count,
- total shift incentive,
- total payroll jika user memiliki visibility.

---

# 6. Dashboard Analytics Contract

Dashboard bukan full reporting page, tetapi dapat menampilkan concise operational analytics.

## 6.1 Personal Dashboard Metrics

Baseline:

- shift today,
- next shift,
- S1/S2/S3 count current month,
- estimated/current shift incentive,
- relevant request count.

---

## 6.2 Scheduler Dashboard Metrics

Additional:

- pending requests,
- current/future coverage warning,
- unpublished schedule state,
- unassigned count,
- distribution summary.

---

## 6.3 Payroll/Admin Dashboard Metrics

Additional:

- current payroll period status,
- payroll record count,
- dirty/incomplete payroll count,
- total payroll after calculation,
- blocking configuration issue count.

### Rule

Dashboard numbers harus menggunakan query/aggregation yang sama definisinya dengan report canonical.

---

# 7. Metric Dictionary

Metric dictionary wajib tersedia di code/documentation supaya istilah tidak berubah antarhalaman.

## 7.1 Scheduled Shift Count

Jumlah published primary `SHIFT` assignment dalam selected work-date range.

Tidak termasuk:

- OFF,
- Unassigned,
- overtime.

---

## 7.2 Effective Shift Count

Jumlah shift yang secara operational projection tetap dianggap dijalankan setelah approved exception/replacement treatment.

Definition final mengikuti PRD-05.

---

## 7.3 Shift 2 Count

Jumlah eligible Shift 2 assignment berdasarkan selected data mode.

UI harus menjelaskan apakah metric adalah:

- planned,
- effective,
- payroll-eligible.

---

## 7.4 Shift 3 Count

Sama seperti Shift 2, tetapi untuk Shift 3.

Cross-midnight tetap satu count berdasarkan `work_date`.

---

## 7.5 Coverage

Jumlah employee yang memenuhi effective/planned coverage untuk shift/date tertentu.

Jika minimum coverage belum dikonfigurasi, status tidak boleh disebut `Healthy` hanya berdasarkan asumsi.

---

## 7.6 Shift Incentive Total

Jumlah canonical payroll/generated incentive amount untuk scope report.

Untuk finalized/locked report, gunakan revision final/locked.

---

## 7.7 Team Payroll Total

```text
SUM(canonical payroll THP for records in selected period/scope)
```

UI harus menunjukkan status period bila sebagian record belum final.

---

## 7.8 Average THP

```text
Team Payroll Total / Included Payroll Record Count
```

Jangan memasukkan employee yang tidak memiliki eligible payroll record sebagai implicit zero kecuali metric secara eksplisit mendefinisikannya.

---

## 7.9 Under-Coverage Count

Jumlah shift/date slot dengan effective coverage di bawah configured minimum.

Tidak berlaku jika minimum coverage tidak dikonfigurasi.

---

## 7.10 Distribution Range

```text
max(metric per employee) - min(metric per employee)
```

Contoh: range Shift 3 count.

Ini hanya insight distribusi, bukan fairness judgement final.

---

# 8. Data Mode: Planned vs Effective vs Payroll

Beberapa report dapat memiliki tiga mode data:

## Planned

Berdasarkan published planned schedule.

## Effective

Berdasarkan schedule + approved operational exception/replacement.

## Payroll

Berdasarkan payroll eligibility/source yang digunakan payroll engine.

Tidak semua report membutuhkan ketiga mode.

Jika report menyediakan selector mode, default harus sesuai konteks:

- Schedule report → Effective atau Planned dengan label jelas,
- Coverage → Effective,
- Payroll report → Payroll canonical.

---

# 9. Period & Date Range Contract

## 9.1 Default Period

Default reporting period:

- current calendar month untuk schedule/operational report,
- selected payroll period untuk payroll report.

---

## 9.2 Supported Ranges

Baseline:

- current month,
- previous month,
- specific month,
- custom date range untuk operational report.

Future:

- quarter,
- rolling 3 months,
- year-to-date,
- yearly.

---

## 9.3 Date Semantics

Date range menggunakan business date di `Asia/Jakarta` sebagai default.

Browser timezone tidak boleh menggeser inclusion work date.

---

# 10. Filtering Contract

Report filter baseline:

- period/date range,
- employee,
- shift type,
- employee status,
- request/exception type,
- payroll status,
- planned/effective mode,
- coverage status.

Filter harus:

- predictable,
- removable satu per satu,
- resettable,
- URL-shareable bila relevan,
- tidak menghilang ketika drill-down lalu kembali.

---

# 11. Sorting & Grouping

## 11.1 Sorting

Sort hanya pada allow-listed metric/column.

Common:

- employee name,
- S1/S2/S3 count,
- incentive total,
- THP,
- date,
- coverage,
- status.

---

## 11.2 Grouping

Supported conceptual grouping:

- by employee,
- by date,
- by shift,
- by report period,
- by exception type.

UI tidak perlu menyediakan semua grouping di semua report.

---

# 12. Drill-Down Contract

Setiap aggregate penting harus memiliki jalur ke detail sumber jika feasible.

Canonical pattern:

```text
Summary Metric
→ Aggregated Rows
→ Employee/Date Detail
→ Source Record
```

Examples:

```text
S3 Count 7
→ seven work dates
→ shift detail
→ schedule revision/history
```

```text
THP Rp6.125.000
→ payroll components
→ S3 incentive component
→ source work dates + rate snapshot
```

```text
Under Coverage 2
→ affected dates/shifts
→ planned/effective employee list
→ exception/replacement detail
```

---

# 13. Historical Comparison

## 13.1 Month-over-Month

Baseline comparison:

- current vs previous month,
- user-selected month A vs month B.

Metrics can include:

- S2 count,
- S3 count,
- total incentive,
- total payroll,
- leave/sick,
- overtime,
- under-coverage.

---

## 13.2 Visual Comparison

Good patterns:

- value + delta,
- side-by-side compact bars,
- line/bar trend where multiple periods exist,
- comparison table.

Do not use misleading axis truncation for decorative impact.

---

## 13.3 Population Change Awareness

Jika team membership berubah antarperiod:

UI harus dapat menunjukkan:

> `12 employees this month · 10 employees previous month`

agar total tidak dibaca tanpa konteks.

---

# 14. Chart Standards

## 14.1 Allowed Baseline Charts

Gunakan chart sederhana:

- bar chart,
- stacked bar bila meaning jelas,
- line chart untuk trend,
- compact area/sparkline untuk secondary trend,
- donut hanya untuk distribution sederhana dengan sedikit kategori.

Avoid:

- 3D charts,
- gauge dekoratif,
- excessive pie chart,
- radar chart tanpa alasan kuat,
- chart dengan terlalu banyak warna kategorikal.

---

## 14.2 Accessible Charts

Chart wajib memiliki:

- text/table equivalent atau accessible summary,
- tooltip yang readable,
- label yang cukup,
- tidak bergantung pada warna saja,
- keyboard/focus support bila interaktif.

---

## 14.3 Semantic Colors

Chart menggunakan semantic/design-system token.

Shift S1/S2/S3 boleh menggunakan canonical shift colors dari PRD-11.

Status danger/warning/success tidak boleh dipakai sebagai warna dekoratif yang mengubah semantics.

---

# 15. Desktop Reporting Experience

Desktop reporting harus mengoptimalkan density dan comparison.

Canonical composition:

```text
Compact Page Header
  Title
  Period
  Primary Export action

Filter Bar
  Period
  Employee
  Shift
  Mode
  More filters

Summary Strip
  3–6 key metrics

Primary Visualization / Insight

Dense Report Table

Contextual Drill-down / Drawer
```

Rules:

- jangan membuat setiap metric menjadi giant card,
- table harus memanfaatkan width dengan baik,
- numeric columns align konsisten,
- sticky header diperbolehkan,
- horizontal scroll hanya pada report surface, bukan seluruh page.

---

# 16. Mobile Reporting Experience

Mobile reporting tidak boleh memaksa desktop table menjadi miniature.

Canonical flow:

```text
Compact Header
→ Period control
→ Key metrics
→ Insight chart if useful
→ Summary list
→ Tap row
→ Full detail / bottom sheet
```

## 16.1 Mobile Filter

Gunakan:

- compact filter chips untuk active filters,
- filter button membuka bottom sheet/full-screen filter,
- sticky apply/reset area bila filter kompleks.

---

## 16.2 Mobile Payroll Report

Row dapat menjadi compact employee summary:

```text
Budi
S2 6 · S3 7
THP Rp6.125.000
LOCKED
```

Tap → payroll detail.

---

## 16.3 Mobile Shift Distribution

Gunakan list/rank/compact bars per employee daripada wide table.

User tetap dapat berpindah metric:

- S1,
- S2,
- S3,
- combined incentive shift.

---

# 17. Export Strategy

## 17.1 Supported Formats

Baseline recommended:

- CSV,
- XLSX,
- print-friendly HTML.

PDF dapat ditambahkan jika operational need jelas.

---

## 17.2 Export Must Match Report Scope

Export harus membawa filter/scope aktif.

Metadata export minimum:

- report name,
- generated at,
- timezone,
- selected period,
- active filters,
- data mode bila planned/effective,
- payroll status/revision context bila finansial.

---

## 17.3 CSV

CSV cocok untuk interoperability dan raw analysis.

Requirements:

- UTF-8,
- consistent header,
- stable column semantics,
- formula injection protection untuk user-controlled cell,
- locale formatting tidak boleh membuat numeric machine-readability rusak.

Direkomendasikan menyimpan numeric amount sebagai angka rupiah, bukan string `Rp ...` pada machine-oriented export.

---

## 17.4 XLSX

XLSX cocok untuk business-friendly export.

Recommended features:

- frozen header,
- readable column width,
- numeric money format,
- date format yang jelas,
- autofilter,
- optional summary sheet + detail sheet.

Jangan memasukkan macro.

---

## 17.5 PDF / Print

Jika digunakan:

- layout harus print-specific,
- navigation chrome disembunyikan,
- page break dikontrol,
- table header diulang bila multi-page memungkinkan,
- Light print surface digunakan walaupun app sedang Dark Mode,
- source/status metadata tetap terlihat.

---

# 18. Export Security & Integrity

Export mematuhi PRD-07 dan PRD-16.

Requirements:

- authorization dicek server-side,
- generated export tidak memberi data melebihi scope actor,
- filename disanitasi,
- user-controlled content tidak dieksekusi sebagai spreadsheet formula,
- temporary file tidak public indefinitely,
- export generation event dapat diaudit bila mengandung payroll/sensitive operational dataset.

---

# 19. Export Filename Convention

Recommended:

```text
nocscheduler_<report>_<period>_<generated-date>.<ext>
```

Example:

```text
nocscheduler_monthly-payroll_2026-08_2026-09-01.xlsx
```

Avoid employee-sensitive information berlebihan di filename jika tidak diperlukan.

---

# 20. Data Freshness

## 20.1 Live/Current Operational Reports

Report seperti coverage dan current shift summary harus mencerminkan canonical source terbaru dengan latency yang wajar.

Jika menggunakan cache:

- cache harus invalidated ketika source berubah,
- UI tidak boleh diam-diam menampilkan snapshot lama sebagai current.

---

## 20.2 Payroll Report Freshness

Payroll report harus menunjukkan:

- calculation status,
- calculated at,
- dirty/outdated state,
- finalized/locked state.

Dirty payroll tidak boleh kehilangan warning hanya karena report table sedang menampilkan total.

---

## 20.3 Historical Locked Report

Locked payroll dan historical schedule revision tidak perlu dipaksa menjadi live-derived.

Snapshot historical justru harus dipertahankan.

---

# 21. Performance Strategy

Reporting query tidak boleh mengorbankan transactional correctness.

Recommended progression:

1. query canonical relational data dengan index yang tepat,
2. optimized query/projection,
3. cache query result bila perlu,
4. materialized summary/read model bila dataset benar-benar membutuhkannya.

Jangan membuat data warehouse/microservice analytics pada MVP tanpa kebutuhan nyata.

---

# 22. Large Dataset Behavior

Untuk collection besar:

- server-side filtering,
- cursor pagination atau bounded pagination sesuai report,
- virtualization untuk table panjang bila dibutuhkan,
- lazy drill-down,
- export terpisah dari browser rendering.

UI tidak boleh mencoba render puluhan ribu row sekaligus hanya karena export dapat menghasilkan data sebanyak itu.

---

# 23. Analytics Read Models

Read model/materialized projection diperbolehkan untuk:

- monthly shift counts,
- coverage summary,
- payroll summary,
- dashboard counters,
- distribution trend.

Rules:

- dapat direbuild,
- bukan source of truth,
- mempunyai freshness semantics,
- tidak menerima mutation business langsung.

---

# 24. Reporting API Direction

PRD-15 menjadi source utama API contract.

Canonical direction:

```text
GET /api/v1/reports/schedule
GET /api/v1/reports/coverage
GET /api/v1/reports/employees
GET /api/v1/reports/payroll
GET /api/v1/reports/exceptions
GET /api/v1/reports/overtime
```

Potential query params:

```text
period
from
to
employeeId
shiftTypeId
mode
status
sort
cursor
limit
```

Export commands dapat menggunakan:

```text
POST /api/v1/exports
GET  /api/v1/exports/:id
```

atau synchronous download bila dataset kecil.

Exact contract tetap mengikuti PRD-15 implementation rules.

---

# 25. Report Access & Transparency

Baseline mengikuti PRD-07:

- internal operational data broadly readable,
- payroll transparency broadly readable sesuai current product requirement,
- mutation tidak diberikan melalui report.

Report/export permission dapat dipisah:

```text
report.read
report.export
payroll.read
payroll.export
```

Hal ini memungkinkan organisasi di masa depan membatasi export tanpa harus mengubah visibility halaman.

---

# 26. Report Empty / Error States

## 26.1 No Data Yet

Contoh:

> Belum ada schedule published untuk Agustus 2026.

CTA sesuai permission:

- View Schedule Management
- Change Period

---

## 26.2 No Filter Result

> Tidak ada employee yang cocok dengan filter ini.

CTA:

- Clear Filters

---

## 26.3 Incomplete Payroll

Jangan tampilkan seolah report final.

Tampilkan:

- incomplete count,
- blocking reason summary,
- dirty record count.

---

## 26.4 Report Error

Error state harus mempertahankan filter/context dan menyediakan retry.

---

# 27. Reporting UX Quality Rules

- Key metric maksimal beberapa item yang benar-benar berguna.
- Jangan membuat 12 KPI card sama besar.
- Angka besar menggunakan tabular numeral jika tersedia.
- IDR harus mudah dipindai.
- Positive/negative delta tidak selalu berarti good/bad; semantic color dipakai hanya jika meaning jelas.
- Long employee name tidak boleh merusak row geometry.
- Tooltip tidak boleh menjadi satu-satunya tempat definisi metric penting.
- Report title dan active period selalu terlihat jelas.
- Filter aktif terlihat tanpa membuka panel lagi.
- Drill-down harus mempertahankan filter dan scroll context.

---

# 28. Fairness Analytics Detail

## 28.1 Baseline Distribution Table

Example:

| Employee | S2 | S3 | S2+S3 | Team Avg | Difference |
|---|---:|---:|---:|---:|---:|

---

## 28.2 Contextual Exclusions

Jika employee:

- join mid-month,
- inactive mid-month,
- long leave,
- unavailable substantial portion,

fairness comparison harus memberi awareness.

Jangan membandingkan raw count seolah exposure opportunity identik.

Advanced normalized metric dapat ditambahkan kemudian.

---

## 28.3 No Automatic Punitive Interpretation

Report tidak boleh menghasilkan label seperti:

- `lazy`,
- `underperforming`,
- `unfair employee`.

NOCScheduler adalah scheduling/payroll tool, bukan performance surveillance engine.

---

# 29. Payroll Reporting Detail

## 29.1 Payroll State Awareness

Report harus visually differentiate:

- OPEN,
- CALCULATED,
- DIRTY/OUTDATED,
- FINALIZED,
- LOCKED.

---

## 29.2 Revision Awareness

Jika payroll recalculated:

user yang memiliki permission/history visibility harus dapat melihat bahwa current value berasal dari revision tertentu.

---

## 29.3 Money Reconciliation

Untuk satu payroll record:

```text
Base Salary
+ S2 Incentive
+ S3 Incentive
+ Other Earnings
+ Positive Adjustments
- Deductions
= THP
```

Breakdown amount harus reconcile tepat ke total.

Tidak boleh ada rounding mismatch tersembunyi.

---

## 29.4 Team Reconciliation

Team payroll total harus sama dengan sum included employee payroll records pada scope yang sama.

Jika ada excluded/incomplete record, UI harus menunjukkan count tersebut.

---

# 30. Coverage Reporting Detail

## 30.1 Planned Coverage

Menggunakan published planned assignments.

---

## 30.2 Effective Coverage

Menggunakan operational projection setelah approved exception/replacement.

---

## 30.3 Minimum Coverage

Jika configured:

```text
coverage_gap = effective_headcount - minimum_required
```

Status:

- positive/zero sesuai policy → covered,
- negative → under-covered.

---

## 30.4 No Configured Minimum

Jika minimum coverage belum diatur:

report hanya menampilkan headcount.

Jangan membuat artificial green status.

---

# 31. Scheduled Export / Delivery — Future

Future optional feature:

- monthly payroll report generation,
- monthly shift report generation,
- email/internal notification delivery.

Tidak wajib MVP.

Jika ditambahkan, generated report harus tetap menggunakan same canonical reporting service dan permission model.

---

# 32. Saved Report Views — Future

User dapat menyimpan kombinasi:

- report type,
- filters,
- grouping,
- columns,
- sorting.

Saved view tidak menyimpan copy business data.

---

# 33. Report Favorites — Future

Personal preference untuk shortcut report tertentu dapat ditambahkan tanpa mengubah report semantics.

---

# 34. Analytics Anti-Patterns

Dilarang:

- menghitung THP ulang di frontend,
- chart tanpa label period,
- metric tanpa definisi,
- planned/effective data dicampur,
- total employee berubah tapi comparison tidak memberi awareness,
- chart 3D,
- excessive KPI cards,
- red/green untuk metric yang tidak inherently good/bad,
- silently replacing missing value dengan zero,
- export berbeda scope dari report aktif tanpa warning,
- hardcoded shift name untuk analytics logic,
- historical report membaca current rate untuk merekonstruksi masa lalu,
- page-level horizontal overflow,
- mobile table dengan puluhan kolom diperkecil paksa.

---

# 35. Reporting Business Rules

## RPT-001

Report wajib membaca canonical domain source atau rebuildable read model.

## RPT-002

Report tidak boleh menjadi source mutation business.

## RPT-003

Payroll report wajib menggunakan canonical payroll revision.

## RPT-004

Locked payroll report wajib mempertahankan historical snapshot.

## RPT-005

Cross-midnight shift dihitung satu kali berdasarkan work date.

## RPT-006

OFF tidak dihitung sebagai shift.

## RPT-007

Unassigned tidak boleh diperlakukan sebagai OFF.

## RPT-008

Planned dan effective state tidak boleh dicampur tanpa label.

## RPT-009

Aggregate penting harus dapat ditelusuri ke source bila feasible.

## RPT-010

Metric definition harus konsisten antar dashboard/report/export.

## RPT-011

Missing data tidak boleh diam-diam menjadi zero.

## RPT-012

Payroll dirty state harus terlihat pada report.

## RPT-013

Finalized dan locked payroll harus distinguishable.

## RPT-014

Team payroll total harus reconcile dengan included record.

## RPT-015

Payroll breakdown harus reconcile tepat ke THP.

## RPT-016

Shift incentive total menggunakan payroll source untuk laporan finansial.

## RPT-017

Schedule distribution dapat memakai planned/effective mode sesuai label.

## RPT-018

Coverage default menggunakan effective operational state untuk current operation.

## RPT-019

Coverage health tidak boleh ditentukan jika minimum tidak dikonfigurasi.

## RPT-020

Fairness insight tidak boleh menjadi automatic disciplinary verdict.

## RPT-021

Employee availability context harus dipertimbangkan pada advanced fairness analysis.

## RPT-022

Comparison harus menjelaskan period scope.

## RPT-023

Comparison harus memberi awareness jika population berubah.

## RPT-024

Browser timezone tidak boleh menggeser business-date report.

## RPT-025

Report filter yang shareable sebaiknya hidup di URL.

## RPT-026

Filter/sort API harus allow-listed.

## RPT-027

Dashboard metric harus menggunakan definisi yang sama dengan report canonical.

## RPT-028

Derived cache harus rebuildable.

## RPT-029

Cache tidak boleh menjadi source of truth.

## RPT-030

Stale current report tidak boleh ditampilkan tanpa freshness awareness jika stale bermakna.

## RPT-031

Historical locked report tidak boleh direcompute dari current mutable config.

## RPT-032

Export wajib menerapkan authorization server-side.

## RPT-033

Export scope harus konsisten dengan requested filter.

## RPT-034

Export payroll tidak boleh membocorkan data di luar actor scope.

## RPT-035

CSV/XLSX harus memiliki formula injection defense.

## RPT-036

Export filename harus sanitized.

## RPT-037

Temporary export tidak boleh public tanpa batas waktu.

## RPT-038

Export high-value dataset dapat menghasilkan audit event.

## RPT-039

XLSX tidak boleh membawa macro.

## RPT-040

Machine-readable numeric export tidak boleh merusak amount menjadi locale text-only.

## RPT-041

Charts tidak boleh menggantikan precision table bila detail angka penting.

## RPT-042

Chart tidak boleh bergantung pada warna saja.

## RPT-043

Chart axis tidak boleh dimanipulasi untuk menciptakan kesan menyesatkan.

## RPT-044

Mobile report harus menggunakan adaptive composition.

## RPT-045

Desktop report harus mempertahankan dense but calm hierarchy.

## RPT-046

Report page tidak boleh memiliki accidental horizontal overflow.

## RPT-047

Large datasets harus menggunakan server-side/filter/pagination strategy.

## RPT-048

Browser tidak boleh diwajibkan render seluruh dataset hanya untuk export.

## RPT-049

Drill-down harus mempertahankan user context bila memungkinkan.

## RPT-050

No-data dan zero-result adalah state berbeda.

## RPT-051

Report error tidak boleh menghapus active filter/context tanpa perlu.

## RPT-052

Employee inactive tetap dapat muncul pada historical report yang relevan.

## RPT-053

Shift rename tidak boleh merusak historical analytics.

## RPT-054

Incentive rate baru tidak boleh mengubah locked historical report.

## RPT-055

Overtime tidak boleh masuk regular shift count.

## RPT-056

Replacement tidak boleh menyebabkan double effective coverage.

## RPT-057

Replacement/payroll treatment harus mengikuti canonical exception logic.

## RPT-058

Report API tetap mengikuti error, auth, pagination, dan observability contract PRD-15.

## RPT-059

Reporting UI wajib mengikuti PRD-10 sampai PRD-13.

## RPT-060

Critical reporting calculations wajib memiliki automated reconciliation tests.

---

# 36. Critical Reporting Test Matrix

| ID | Scenario | Expected |
|---|---|---|
| REP-T01 | S3 cross-midnight | counted once on work date |
| REP-T02 | OFF | not counted as shift |
| REP-T03 | Unassigned | shown separately, not OFF |
| REP-T04 | Sick without replacement | planned/effective differ correctly |
| REP-T05 | Sick with replacement | effective coverage counts replacement only |
| REP-T06 | Shift swap | distribution reflects effective canonical state |
| REP-T07 | Overtime | not added to regular shift count |
| REP-T08 | Incentive rate changes mid-month | financial report matches payroll segmented rates |
| REP-T09 | Payroll dirty | report visibly marks outdated state |
| REP-T10 | Payroll locked | historical amount remains stable |
| REP-T11 | Salary changed later | locked historical THP unchanged |
| REP-T12 | Team payroll total | equals included employee THP sum |
| REP-T13 | Missing payroll record | excluded/incomplete clearly indicated |
| REP-T14 | Minimum coverage absent | no false healthy status |
| REP-T15 | Under coverage | affected shift/date drill-down correct |
| REP-T16 | Employee join mid-period | fairness report shows exposure context |
| REP-T17 | Employee inactive historical | remains in historical report |
| REP-T18 | Filter + drill-down + back | filter/context preserved |
| REP-T19 | Export with filters | file scope matches report scope |
| REP-T20 | Malicious spreadsheet text | exported safely against formula injection |
| REP-T21 | Unauthorized export | rejected server-side |
| REP-T22 | Planned/effective switch | metric changes without ambiguity |
| REP-T23 | Mobile payroll | compact summary + drill-down usable |
| REP-T24 | 360px viewport | no page overflow |
| REP-T25 | Dark Mode | report/chart/table parity maintained |
| REP-T26 | No data | correct no-data state |
| REP-T27 | Zero-result filters | separate clear-filter state |
| REP-T28 | Cached report after source mutation | invalidated/refreshed correctly |
| REP-T29 | Historical rate rename/change | report still reconstructable |
| REP-T30 | Chart vs table | values reconcile exactly |

---

# 37. Reporting Acceptance Criteria

PRD-17 dianggap terpenuhi ketika:

- shift distribution dapat dilihat per employee/per period,
- coverage dapat dibaca planned/effective,
- employee monthly summary tersedia,
- monthly payroll report reconcile ke payroll engine,
- aggregate dapat didrill-down,
- period/filter/sort konsisten,
- mobile dan desktop sama-sama usable,
- Light/Dark parity terpenuhi,
- export CSV/XLSX aman dan scope-aware,
- historical locked result tidak drift,
- report tidak mencampur missing dan zero,
- fairness insight tidak menghasilkan judgement otomatis,
- critical report calculation memiliki automated tests.

---

# 38. Reporting Definition of Done

Sebuah report belum dianggap selesai sampai:

1. metric definition terdokumentasi,
2. canonical source jelas,
3. planned/effective/payroll mode jelas,
4. filter behavior jelas,
5. sorting allow-list jelas,
6. aggregate reconcile ke detail,
7. drill-down tersedia untuk metric penting,
8. no-data state benar,
9. zero-result state benar,
10. loading state polished,
11. error state mempertahankan context,
12. desktop QA lulus,
13. mobile QA lulus,
14. 360px QA lulus,
15. Light Mode QA lulus,
16. Dark Mode QA lulus,
17. accessibility baseline lulus,
18. timezone/business-date tests lulus,
19. cross-midnight tests lulus,
20. export authorization lulus,
21. export scope reconciliation lulus,
22. spreadsheet injection defense lulus,
23. historical integrity test lulus,
24. payroll reconciliation lulus,
25. cache/read-model freshness test lulus jika caching digunakan.

---

# 39. MVP Reporting Scope

Recommended P0 MVP:

- Shift Distribution Report,
- Team Coverage Report,
- Employee Monthly Summary,
- Monthly Payroll Report,
- payroll employee drill-down,
- schedule/source drill-down,
- basic filters,
- CSV export,
- XLSX export,
- print-friendly payroll view,
- current/previous month selection,
- mobile responsive report experience.

---

# 40. Post-MVP Reporting Scope

Recommended next:

- fairness distribution insight,
- coverage risk report,
- exception report,
- overtime report,
- payroll period comparison,
- employee historical trend,
- team monthly operational summary,
- saved report views,
- scheduled export/delivery,
- richer chart/trend analytics.

---

# 41. Relationship to Other PRDs

PRD-17 depends on:

- PRD-03 for shift/work-date semantics,
- PRD-04 for payroll truth,
- PRD-05 for effective operational state,
- PRD-07 for visibility/export permission,
- PRD-08 for canonical data and read-model boundaries,
- PRD-09 for historical drill-down,
- PRD-10 through PRD-13 for reporting UX/visual quality,
- PRD-14 for technical/query architecture,
- PRD-15 for API contract,
- PRD-16 for secure export and data integrity.

PRD-17 menjadi input utama untuk:

- PRD-18 — Notifications,
- PRD-19 — QA, Testing & Acceptance Criteria,
- PRD-20 — Deployment, Backup, Observability & Operations.

---

# 42. Final Reporting Principle

NOCScheduler reporting harus mengikuti satu prinsip sederhana:

> **See the summary, understand the reason, reach the source.**

Report yang cantik tetapi tidak dapat menjelaskan angkanya dianggap gagal.

Report yang sangat akurat tetapi hanya dapat dipahami setelah export ke spreadsheet juga dianggap gagal.

Target akhir adalah reporting yang:

- cepat,
- cantik,
- padat,
- mobile-friendly,
- desktop-powerful,
- historically correct,
- financially reconcilable,
- dan cukup jelas untuk dipercaya tanpa menebak-nebak.
