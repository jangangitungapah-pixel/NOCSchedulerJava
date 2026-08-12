# PRD-01 — Product Vision, Scope & Requirements

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document  
> **Document ID:** PRD-01  
> **Status:** Draft — Source of Truth for Product Foundation  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme Direction:** Light-first, dark-mode ready  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Executive Summary

NOCScheduler adalah aplikasi web full-stack internal untuk membantu tim Network Operations Center (NOC) mengetahui, mengelola, dan mengevaluasi jadwal kerja berbasis sistem shifting secara terpusat.

Sistem kerja utama dibagi menjadi tiga shift:

- Shift 1 / Pagi
- Shift 2 / Siang
- Shift 3 / Malam

Selain fungsi scheduling, aplikasi juga berfungsi sebagai pusat perhitungan kompensasi bulanan NOC. Sistem dapat menghitung gaji pokok, jumlah shift, insentif Shift 2, insentif Shift 3, penyesuaian lain yang diperbolehkan, dan menghasilkan estimasi maupun hasil Take Home Pay per periode payroll.

Seluruh konfigurasi utama seperti jam shift, nilai insentif, gaji pokok, aturan payroll, dan parameter operasional lainnya harus dapat dikelola melalui aplikasi tanpa perlu mengubah source code.

NOCScheduler dibangun untuk penggunaan internal. Transparansi data antaranggota tim diperbolehkan sesuai kebutuhan organisasi, tetapi hak melihat data tetap dipisahkan dari hak mengubah data. Data yang berpengaruh terhadap jadwal dan payroll harus memiliki histori yang dapat ditelusuri.

Tujuan akhirnya adalah menjadikan NOCScheduler sebagai **single source of truth** untuk:

1. siapa bekerja pada shift apa,
2. bagaimana distribusi shift dalam satu periode,
3. berapa insentif yang diperoleh,
4. berapa estimasi atau hasil payroll bulanan,
5. perubahan apa yang pernah terjadi terhadap jadwal dan konfigurasi penting.

---

## 2. Background

Pengelolaan jadwal kerja shifting biasanya berkembang dari spreadsheet, grup chat, tabel manual, atau file yang disalin ulang setiap periode. Cara tersebut cukup sederhana pada skala kecil, tetapi mulai menimbulkan masalah ketika:

- jumlah anggota NOC bertambah,
- perubahan jadwal terjadi berkali-kali,
- jadwal harus dilihat dari perangkat mobile,
- ada perbedaan insentif antarshift,
- perhitungan payroll bergantung pada jumlah shift aktual,
- perlu mengetahui histori perubahan,
- data harus dicari kembali beberapa bulan kemudian,
- satu perubahan aturan berpotensi mengubah perhitungan periode lama jika data tidak disimpan dengan benar.

NOCScheduler dirancang untuk menghilangkan ketergantungan terhadap proses manual tersebut dan menyediakan pengalaman operasional yang lebih cepat, konsisten, dapat diaudit, dan mudah digunakan.

---

## 3. Problem Statement

### 3.1 Masalah Jadwal

Tim NOC membutuhkan cara yang cepat untuk mengetahui:

- shift hari ini,
- shift berikutnya,
- siapa rekan satu shift,
- jadwal satu minggu,
- jadwal satu bulan,
- perubahan jadwal terbaru,
- siapa yang sedang bertugas pada waktu tertentu.

Tanpa sistem terpusat, informasi ini mudah tersebar dan berpotensi tidak sinkron.

### 3.2 Masalah Penyusunan Jadwal

Scheduler atau administrator membutuhkan mekanisme yang efisien untuk:

- menetapkan shift ke banyak anggota,
- melakukan perubahan jadwal,
- menyalin pola jadwal,
- menghindari assignment yang tidak masuk akal,
- mempublikasikan jadwal,
- membedakan jadwal draft dengan jadwal yang sudah berlaku.

Scheduling tidak boleh bergantung pada input satu per satu jika pola yang sama dapat dikerjakan secara massal.

### 3.3 Masalah Perhitungan Insentif dan Payroll

Shift tertentu memiliki insentif tambahan. Jika perhitungan dilakukan manual, muncul risiko:

- salah menghitung jumlah Shift 2,
- salah menghitung jumlah Shift 3,
- menggunakan nominal insentif yang salah,
- perubahan tarif baru memengaruhi laporan lama,
- sulit menjelaskan asal suatu nominal payroll.

Sistem harus dapat menghasilkan perhitungan yang deterministik dan dapat dijelaskan.

### 3.4 Masalah Histori

Perubahan jadwal dan konfigurasi payroll memiliki dampak operasional dan finansial. Sistem harus dapat menjawab pertanyaan seperti:

- siapa yang mengubah jadwal,
- kapan jadwal diubah,
- jadwal sebelumnya apa,
- kapan nilai insentif berubah,
- konfigurasi apa yang digunakan ketika payroll bulan tertentu dihitung.

### 3.5 Masalah Mobile Accessibility

NOC bekerja dengan pola operasional yang tidak selalu bergantung pada desktop. Informasi jadwal harus dapat dipahami dalam beberapa detik melalui ponsel tanpa harus membuka spreadsheet lebar atau melakukan zoom horizontal berlebihan.

---

## 4. Product Vision

> **Membuat pusat scheduling dan payroll internal NOC yang modern, cepat, transparan, dapat dipercaya, dan cukup sederhana untuk digunakan setiap hari tanpa mengorbankan kemampuan administrasi yang kuat.**

NOCScheduler bukan hanya kalender shift. Produk ini harus berkembang menjadi **operational workspace internal NOC** yang menghubungkan jadwal kerja, data karyawan, insentif, payroll, laporan, dan histori operasional dalam satu aplikasi.

---

## 5. Product Mission

NOCScheduler harus membantu setiap anggota NOC menjawab pertanyaan paling penting dengan usaha seminimal mungkin:

> **“Hari ini saya shift apa, bersama siapa, dan bagaimana jadwal tersebut memengaruhi perhitungan penghasilan saya?”**

Untuk administrator atau scheduler:

> **“Bagaimana cara menyusun, mengubah, mempublikasikan, dan mengevaluasi jadwal seluruh tim dengan cepat tanpa kehilangan kontrol serta histori?”**

---

## 6. Product Goals

### G-01 — Schedule Visibility

Setiap user dapat mengetahui jadwal kerja dirinya dan tim dengan cepat dari desktop maupun mobile.

### G-02 — Centralized Scheduling

Seluruh jadwal yang berlaku memiliki satu sumber data resmi di dalam aplikasi.

### G-03 — Efficient Schedule Management

Administrator atau scheduler dapat mengelola jadwal banyak orang tanpa proses berulang yang tidak diperlukan.

### G-04 — Configurable Shift System

Jam dan parameter Shift 1, Shift 2, dan Shift 3 dapat dikonfigurasi tanpa perubahan source code.

### G-05 — Configurable Compensation

Gaji pokok, insentif shift, serta parameter payroll yang diizinkan dapat dikelola dari aplikasi.

### G-06 — Explainable Payroll

Setiap hasil payroll dapat dijelaskan melalui komponen pembentuk nilainya.

### G-07 — Historical Integrity

Perubahan konfigurasi hari ini tidak boleh secara diam-diam mengubah hasil historis periode lama.

### G-08 — Internal Transparency

Informasi yang memang ditetapkan transparan untuk internal dapat dilihat anggota NOC tanpa menciptakan silo data yang tidak diperlukan.

### G-09 — Controlled Mutation

Hak melihat data tidak otomatis memberikan hak mengubah data.

### G-10 — Mobile-first Consumption

Pengalaman melihat jadwal, notifikasi perubahan, ringkasan shift, dan ringkasan payroll harus sangat baik di mobile.

### G-11 — Desktop Productivity

Desktop harus menyediakan pengalaman padat dan efisien untuk scheduling, payroll, reporting, dan settings.

### G-12 — Auditability

Perubahan penting harus meninggalkan jejak yang dapat ditelusuri.

---

## 7. Non-Goals

Pada fase awal, NOCScheduler **bukan** ditujukan sebagai:

- sistem HRIS perusahaan lengkap,
- aplikasi rekrutmen,
- sistem performance appraisal,
- sistem akuntansi general ledger,
- sistem payroll legal/compliance nasional yang menggantikan software payroll perusahaan,
- sistem monitoring jaringan,
- sistem trouble ticketing NOC,
- sistem absensi biometrik,
- platform publik atau multi-tenant SaaS,
- aplikasi untuk menyimpan dokumen HR sensitif yang tidak berkaitan dengan scheduling/payroll internal.

Fitur tersebut hanya boleh ditambahkan apabila memiliki hubungan kuat dengan kebutuhan operasional NOC dan disetujui sebagai perluasan scope.

---

## 8. Target Users

### 8.1 NOC Member

Pengguna operasional sehari-hari.

Kebutuhan utama:

- melihat shift hari ini,
- melihat jadwal berikutnya,
- melihat jadwal tim,
- mengetahui siapa yang sedang bertugas,
- melihat ringkasan jumlah shift,
- melihat estimasi/hasil perhitungan bulanan,
- menerima informasi ketika jadwal berubah,
- melihat histori relevan.

### 8.2 Scheduler / Supervisor

Pengguna yang bertanggung jawab mengatur jadwal.

Kebutuhan utama:

- melihat coverage tim,
- membuat jadwal,
- melakukan bulk assignment,
- mengubah assignment,
- menggunakan template/pola,
- mendeteksi konflik,
- mempublikasikan jadwal,
- memantau perubahan,
- mengevaluasi distribusi shift.

### 8.3 Administrator

Pengguna yang memiliki kontrol konfigurasi lebih luas.

Kebutuhan utama:

- mengelola data user/karyawan,
- mengelola konfigurasi shift,
- mengelola gaji pokok,
- mengelola nilai insentif,
- mengelola payroll,
- mengelola settings,
- melihat audit trail,
- mengelola parameter sistem.

> Detail role dan permission akan didefinisikan pada **PRD-07 — Roles, Permissions & Internal Transparency**.

---

## 9. Product Principles

### P-01 — Schedule First

Jadwal adalah informasi terpenting dalam aplikasi. Setelah login, user tidak boleh kesulitan mengetahui shift hari ini dan shift berikutnya.

### P-02 — One Source of Truth

Jadwal resmi, aturan shift, dan data payroll tidak boleh bergantung pada file eksternal yang berbeda-beda sebagai sumber kebenaran utama.

### P-03 — Transparent by Design

Produk didesain untuk internal NOC dengan tingkat transparansi tinggi sesuai kebutuhan organisasi.

### P-04 — Permission Is Not Privacy

Data boleh terlihat luas, tetapi kemampuan mengubah data tetap harus dibatasi berdasarkan role/permission.

### P-05 — Payroll Must Be Deterministic

Input dan konfigurasi yang sama harus menghasilkan hasil perhitungan yang sama.

### P-06 — Historical Data Must Stay Historically Correct

Perubahan konfigurasi baru tidak boleh mengubah fakta historis.

### P-07 — Configuration Over Hardcoding

Jam shift, label shift, nominal insentif, aturan periode, dan parameter operasional yang wajar harus dikonfigurasi melalui aplikasi.

### P-08 — Bulk Over Repetition

Jika suatu operasi dapat dilakukan terhadap banyak anggota sekaligus, sistem harus menyediakan mekanisme massal yang aman.

### P-09 — Mobile for Consumption, Desktop for Power

Mobile diprioritaskan untuk konsumsi informasi dan quick actions. Desktop diprioritaskan untuk workflow administrasi yang kompleks.

### P-10 — Dense but Calm

UI boleh padat informasi, tetapi tidak boleh terasa semrawut. Whitespace digunakan untuk struktur, bukan sebagai dekorasi berlebihan.

### P-11 — Explain Every Number

Nominal payroll atau insentif harus dapat dilacak ke komponen sumbernya.

### P-12 — Audit What Matters

Perubahan yang memengaruhi jadwal, hak akses, kompensasi, atau payroll harus dapat ditelusuri.

### P-13 — Safe Defaults

Sistem harus menghindari tindakan berisiko melalui default yang aman, validation, preview, dan confirmation pada perubahan signifikan.

### P-14 — Fast Everyday Use

Aplikasi harus terasa ringan untuk aktivitas yang dilakukan berulang setiap hari.

---

## 10. Core Product Domains

NOCScheduler dibagi menjadi domain utama berikut.

### 10.1 Identity & Access

- User account
- Employee profile
- Role
- Permission
- Authentication
- Session

### 10.2 Scheduling

- Shift types
- Schedule periods
- Shift assignments
- Draft schedule
- Published schedule
- Schedule changes
- Schedule templates
- Bulk operations
- Conflict detection

### 10.3 Workforce Availability

Domain untuk mengakomodasi kondisi ketika seorang anggota tidak mengikuti jadwal reguler.

Contoh:

- cuti,
- sakit,
- izin,
- training,
- dinas,
- unavailable,
- replacement,
- shift swap,
- overtime.

Tidak seluruh fitur harus masuk MVP, tetapi arsitektur produk harus siap mengakomodasinya.

### 10.4 Compensation

- Base salary
- Shift incentive
- Overtime component
- Bonus
- Deduction
- Adjustment

### 10.5 Payroll

- Payroll period
- Payroll calculation
- Payroll review
- Payroll breakdown
- Payroll finalization
- Payroll lock
- Historical payroll

### 10.6 Reporting

- Shift report
- Employee monthly summary
- Payroll report
- Shift distribution
- Export

### 10.7 Configuration

- Shift settings
- Payroll settings
- Employee compensation settings
- Holiday settings
- System settings

### 10.8 Audit & History

- Schedule history
- Compensation history
- Payroll history
- Configuration changes
- Actor and timestamp

### 10.9 Notification

- Schedule published
- Schedule changed
- Request status changed
- Payroll available
- Important system information

---

## 11. Recommended Application Modules / Pages

Daftar berikut adalah rekomendasi tingkat produk. Detail information architecture akan ditentukan pada PRD-06.

### 11.1 Dashboard

Ringkasan operasional personal dan tim.

Minimal menampilkan:

- shift user hari ini,
- shift berikutnya,
- rekan satu shift,
- siapa yang sedang bertugas,
- perubahan jadwal terbaru,
- ringkasan shift bulan berjalan,
- estimasi komponen insentif bulan berjalan apabila diperbolehkan.

### 11.2 My Schedule

Jadwal personal dalam tampilan yang optimal untuk mobile maupun desktop.

### 11.3 Team Schedule

Kalender/timeline seluruh anggota NOC.

### 11.4 Schedule Management

Workspace khusus administrator/scheduler untuk membuat dan mengubah assignment.

### 11.5 Schedule Requests

Menampung workflow seperti:

- shift swap,
- request perubahan,
- replacement,
- availability exception.

Dapat menjadi fitur setelah MVP apabila belum dibutuhkan sejak awal.

### 11.6 Employees

Pengelolaan anggota NOC dan informasi operasional yang relevan.

### 11.7 Payroll Overview

Ringkasan periode payroll dan status perhitungan.

### 11.8 Monthly Payroll

Daftar hasil payroll per bulan untuk seluruh anggota.

### 11.9 Employee Payroll Detail

Breakdown payroll seorang anggota pada periode tertentu.

### 11.10 Reports

Laporan shift, distribusi, payroll, dan rekap bulanan.

### 11.11 Activity / Audit History

Histori perubahan penting.

### 11.12 Settings

Pusat konfigurasi aplikasi.

Subdomain potensial:

- General
- Shift Configuration
- Payroll Configuration
- Incentives
- Holidays
- Roles & Access
- Notification

---

## 12. MVP Scope

MVP harus cukup untuk menggantikan pengelolaan jadwal dan kalkulasi dasar insentif/payroll yang sebelumnya dilakukan manual.

### 12.1 MVP — Authentication & User

- Login
- Logout
- Session management
- User profile
- Role dasar
- Active/inactive employee

### 12.2 MVP — Employee Management

- Daftar employee
- Tambah employee
- Edit employee
- Nonaktifkan employee
- Set gaji pokok
- Set tanggal efektif konfigurasi kompensasi

### 12.3 MVP — Shift Configuration

Mendukung minimal tiga shift:

- Shift 1 / Pagi
- Shift 2 / Siang
- Shift 3 / Malam

Setiap shift minimal memiliki:

- nama,
- kode,
- waktu mulai,
- waktu selesai,
- status aktif,
- urutan tampilan,
- aturan insentif terkait.

### 12.4 MVP — Schedule Management

- Kalender jadwal
- Assignment employee ke shift
- Edit assignment
- Delete/cancel assignment sesuai aturan
- Bulk assignment
- Copy schedule dari periode lain
- Draft schedule
- Publish schedule
- Validasi konflik dasar
- Histori perubahan assignment penting

### 12.5 MVP — Schedule Consumption

- My Schedule
- Team Schedule
- Today view
- Weekly view
- Monthly view
- Mobile-friendly schedule

### 12.6 MVP — Incentive Configuration

- Nilai insentif Shift 2 dapat diatur
- Nilai insentif Shift 3 dapat diatur
- Mendukung effective date
- Histori konfigurasi disimpan

Shift 1 secara default dapat bernilai tanpa insentif tambahan, tetapi sistem tidak boleh mendesain logika secara rapuh sehingga mustahil dikembangkan nanti.

### 12.7 MVP — Payroll

- Payroll period bulanan
- Base salary per employee
- Rekap jumlah shift per tipe
- Perhitungan insentif
- Payroll breakdown
- Take Home Pay
- Manual adjustment yang terkontrol
- Payroll status
- Finalize/lock payroll
- Riwayat payroll

### 12.8 MVP — Reports

- Rekap shift bulanan
- Payroll bulanan
- Employee payroll detail
- Basic export CSV/Excel bila implementasinya memungkinkan tanpa menghambat core MVP

### 12.9 MVP — Settings

- General settings
- Shift settings
- Incentive settings
- Payroll settings dasar

### 12.10 MVP — Audit

Minimal mencatat perubahan terhadap:

- schedule assignment,
- salary configuration,
- incentive configuration,
- payroll finalization,
- critical settings.

---

## 13. Post-MVP / Future Scope

Fitur berikut direkomendasikan tetapi tidak wajib menghambat MVP.

### 13.1 Shift Swap

Anggota dapat mengajukan pertukaran shift dengan workflow approval.

### 13.2 Leave / Sick / Permission

Mencatat ketidakhadiran atau pengecualian terhadap jadwal reguler.

### 13.3 Overtime Management

Pencatatan dan perhitungan overtime yang lebih terstruktur.

### 13.4 Public Holiday Engine

Kalender hari libur dan kemungkinan aturan kompensasi khusus.

### 13.5 Coverage Requirement

Mendefinisikan kebutuhan minimal orang per shift dan memberi warning ketika tidak terpenuhi.

### 13.6 Fairness Analytics

Analisis distribusi Shift 2/3 untuk membantu mengetahui apakah pembagian shift relatif seimbang.

### 13.7 Smart Schedule Assistance

Rekomendasi assignment berdasarkan pola, availability, konflik, dan pemerataan.

Fitur ini bersifat assistant, bukan pengambil keputusan final.

### 13.8 Calendar Export / Sync

Sinkronisasi atau export jadwal ke kalender eksternal.

### 13.9 PWA / Installable Web App

Membuat aplikasi lebih nyaman digunakan layaknya aplikasi mobile.

### 13.10 Notification Integration

Potensi integrasi:

- Email
- WhatsApp
- Telegram

Implementasi tergantung kebutuhan dan infrastruktur internal.

### 13.11 Advanced Analytics

- Shift distribution trend
- Incentive trend
- Payroll trend
- Coverage trend
- Overtime trend

---

## 14. Functional Requirements — High Level

### FR-001 — User Authentication

Sistem harus mengharuskan user melakukan autentikasi sebelum mengakses data internal.

### FR-002 — Employee Directory

Sistem harus menyediakan daftar anggota NOC aktif dan historis sesuai permission.

### FR-003 — Three Shift Baseline

Sistem harus mendukung tiga tipe shift utama sebagai baseline produk.

### FR-004 — Configurable Shift Time

Administrator harus dapat mengatur waktu mulai dan selesai shift.

### FR-005 — Cross-Midnight Shift

Sistem harus mampu merepresentasikan shift yang selesai pada tanggal berikutnya.

### FR-006 — Schedule Assignment

User dengan permission harus dapat menetapkan employee ke shift pada tanggal tertentu.

### FR-007 — Bulk Scheduling

Sistem harus menyediakan cara melakukan assignment terhadap lebih dari satu employee/tanggal secara efisien.

### FR-008 — Schedule Draft

Perubahan jadwal dapat disiapkan sebagai draft sebelum menjadi jadwal resmi apabila workflow publish digunakan.

### FR-009 — Schedule Publish

User berwenang dapat mempublikasikan jadwal sehingga jelas mana schedule yang resmi.

### FR-010 — Personal Schedule View

Setiap user dapat melihat jadwal personal dengan cepat.

### FR-011 — Team Schedule View

User dapat melihat jadwal anggota NOC lain sesuai kebijakan transparansi internal.

### FR-012 — Current Duty Visibility

Sistem harus dapat membantu user mengetahui siapa yang sedang berada pada shift aktif.

### FR-013 — Base Salary Configuration

Gaji pokok harus dapat dikonfigurasi per employee dengan mekanisme effective date atau histori yang ekuivalen.

### FR-014 — Shift 2 Incentive

Insentif Shift 2 harus dapat dikonfigurasi.

### FR-015 — Shift 3 Incentive

Insentif Shift 3 harus dapat dikonfigurasi.

### FR-016 — Incentive Effective Date

Perubahan nominal insentif harus mendukung waktu mulai berlaku.

### FR-017 — Payroll Period

Sistem harus memiliki konsep periode payroll, minimal bulanan.

### FR-018 — Payroll Calculation

Sistem harus dapat menghitung payroll berdasarkan konfigurasi dan data periode terkait.

### FR-019 — Payroll Breakdown

Hasil payroll harus menampilkan komponen pembentuk nilai.

### FR-020 — Manual Adjustment

User berwenang dapat menambahkan adjustment apabila diperlukan, dengan alasan dan histori.

### FR-021 — Payroll Finalization

Payroll dapat memiliki status final/locked untuk menjaga integritas periode selesai.

### FR-022 — Historical Integrity

Payroll periode lama tidak boleh berubah otomatis akibat perubahan konfigurasi baru.

### FR-023 — Audit Trail

Perubahan penting harus dicatat dengan actor dan waktu kejadian.

### FR-024 — Search & Filter

Daftar dengan volume data signifikan harus menyediakan pencarian dan filter yang relevan.

### FR-025 — Responsive UI

Core workflow harus dapat digunakan pada desktop dan mobile.

### FR-026 — Light/Dark Theme Capability

Arsitektur UI harus memungkinkan light dan dark mode dengan light sebagai default.

### FR-027 — Settings Management

Parameter operasional yang ditentukan configurable harus dapat dikelola melalui Settings.

### FR-028 — Validation

Sistem harus menolak atau memperingatkan assignment dan konfigurasi yang tidak valid.

### FR-029 — Explainable Calculation

User harus dapat mengetahui sumber nilai jumlah shift, insentif, adjustment, dan THP.

### FR-030 — Data Export

Sistem sebaiknya mendukung export laporan utama dalam format yang dapat diproses kembali.

---

## 15. Non-Functional Requirements

### NFR-001 — Performance

Interaksi utama seperti membuka dashboard, jadwal personal, dan jadwal tim harus terasa responsif pada koneksi internal normal.

### NFR-002 — Mobile Usability

Jadwal harian dan informasi inti tidak boleh membutuhkan horizontal scrolling yang berlebihan untuk dipahami.

### NFR-003 — Desktop Density

Desktop harus memanfaatkan ruang secara efisien untuk scheduling dan reporting tanpa whitespace dekoratif yang berlebihan.

### NFR-004 — Consistency

Komponen yang memiliki fungsi sama harus memiliki tampilan dan perilaku konsisten di seluruh aplikasi.

### NFR-005 — Accessibility

UI harus memiliki focus state, keyboard usability yang wajar, contrast memadai, label form yang jelas, dan target sentuh yang layak.

### NFR-006 — Data Integrity

Operasi yang berhubungan dengan jadwal dan payroll harus menggunakan validasi server-side dan transaksi database jika diperlukan.

### NFR-007 — Security

Permission harus ditegakkan di backend, bukan hanya dengan menyembunyikan tombol pada frontend.

### NFR-008 — Auditability

Perubahan kritis harus dapat ditelusuri setelah kejadian.

### NFR-009 — Maintainability

Business logic utama tidak boleh tersebar secara acak di komponen UI.

### NFR-010 — Testability

Scheduling dan payroll logic harus dapat diuji tanpa bergantung penuh pada UI.

### NFR-011 — Timezone Correctness

Seluruh tanggal dan waktu operasional harus memiliki aturan timezone eksplisit. Baseline produk menggunakan `Asia/Jakarta` kecuali dikonfigurasi lain.

### NFR-012 — Historical Stability

Perubahan master configuration harus menggunakan snapshot, effective dating, versioning, atau strategi lain yang menjaga kebenaran data historis.

### NFR-013 — Recoverability

Database production harus memiliki mekanisme backup dan proses restore yang terdokumentasi sebelum sistem dianggap production-ready.

### NFR-014 — Observability

Error penting pada backend dan proses payroll harus dapat dicatat agar troubleshooting tidak bergantung pada laporan user saja.

### NFR-015 — Browser Support

Aplikasi harus memprioritaskan browser evergreen modern pada desktop dan mobile.

---

## 16. Data Transparency Policy — Product Level

NOCScheduler dibangun dengan prinsip transparansi internal.

Baseline requirement:

- jadwal tim dapat dilihat seluruh user internal,
- identitas anggota dan shift dapat dilihat sesuai kebutuhan operasional,
- informasi payroll dapat dibuat transparan sesuai keputusan organisasi,
- transparansi tidak memberikan write access,
- perubahan data sensitif secara operasional tetap memerlukan permission.

Karena user menyatakan tidak membutuhkan kerahasiaan antaruser, produk tidak akan mengasumsikan model payroll privat seperti aplikasi HR konvensional.

Namun detail granular mengenai data mana yang terlihat oleh role tertentu tetap harus dibuat eksplisit pada PRD-07 agar implementasi tidak ambigu.

---

## 17. Scheduling Product Rules — Baseline

Detail final akan ditentukan pada PRD-03.

Baseline produk:

1. Satu employee dapat memiliki assignment pada tanggal tertentu sesuai aturan shift.
2. Sistem harus memahami bahwa shift malam dapat melewati tengah malam.
3. Schedule memiliki histori perubahan.
4. Schedule dapat memiliki konsep draft dan published.
5. Sistem harus dapat memberi warning terhadap konflik.
6. Operasi massal harus tersedia untuk penyusunan jadwal.
7. User biasa tidak boleh mengubah jadwal resmi tanpa permission.
8. Perubahan terhadap jadwal published harus dapat ditelusuri.
9. Schedule lama tidak boleh hilang hanya karena employee dinonaktifkan.
10. Timezone operasional harus eksplisit.

---

## 18. Payroll Product Rules — Baseline

Detail final akan ditentukan pada PRD-04.

Baseline produk:

1. Payroll memiliki periode.
2. Gaji pokok dapat berbeda antaremployee.
3. Shift 2 dapat menghasilkan insentif.
4. Shift 3 dapat menghasilkan insentif.
5. Nilai insentif configurable.
6. Perubahan nilai insentif harus memiliki effective date atau snapshot ekuivalen.
7. Payroll memiliki breakdown.
8. Adjustment manual harus menyimpan alasan.
9. Payroll final dapat dikunci.
10. Payroll historis tidak boleh berubah otomatis akibat perubahan settings baru.
11. Semua komponen angka harus menggunakan aturan pembulatan yang konsisten.
12. Sistem harus dapat menjelaskan formula dan input yang digunakan.

Formula konseptual awal:

```text
Take Home Pay
= Base Salary
+ Shift Incentives
+ Overtime (jika digunakan)
+ Bonus / Positive Adjustment
- Deduction / Negative Adjustment
```

Formula tersebut **belum merupakan kontrak final**. Detail calculation engine akan dikunci pada PRD-04.

---

## 19. Product States — Recommended Baseline

### 19.1 Employee

Contoh state:

- Active
- Inactive

Deletion permanen terhadap employee historis sebaiknya dihindari.

### 19.2 Schedule

Contoh state:

- Draft
- Published
- Superseded / Historical jika versioning diperlukan

### 19.3 Payroll

Contoh state:

- Draft
- Calculated
- Reviewed
- Finalized / Locked

State final akan diselaraskan dengan workflow pada PRD terkait.

---

## 20. Assumptions

PRD ini menggunakan asumsi awal berikut:

1. Aplikasi digunakan untuk satu organisasi/tim NOC internal.
2. Tidak diperlukan multi-tenancy pada fase awal.
3. Sistem shift utama terdiri dari tiga shift.
4. Shift 2 dan Shift 3 memiliki insentif tambahan sesuai konfigurasi.
5. Gaji pokok dapat berbeda per employee.
6. Periode payroll utama adalah bulanan.
7. Seluruh user memiliki akun individual.
8. Aplikasi diakses melalui browser desktop dan mobile.
9. Light mode adalah tema default.
10. Indonesia adalah konteks operasional utama.
11. `Asia/Jakarta` menjadi baseline timezone sampai requirements berikutnya menetapkan lain.
12. Transparansi data internal lebih tinggi dibanding sistem HR umum.
13. Hak perubahan data tetap dibatasi.
14. Data historis bernilai penting dan tidak boleh direkonstruksi hanya dari current settings.

Jika salah satu asumsi berubah, PRD terkait harus diperbarui secara eksplisit.

---

## 21. Constraints

### 21.1 Internal-only

Produk tidak perlu mengoptimalkan onboarding publik, self-signup publik, billing SaaS, atau tenant isolation.

### 21.2 Configurable Business Rules

Hindari menanam nominal gaji, nilai insentif, dan jam shift langsung di source code.

### 21.3 Historical Integrity

Arsitektur yang hanya menyimpan current value tanpa histori tidak diterima untuk configuration yang memengaruhi payroll.

### 21.4 Mobile Space

Tabel desktop tidak boleh sekadar diperkecil menjadi tabel mobile yang sulit digunakan.

### 21.5 Payroll Accuracy

Perubahan UI tidak boleh mengubah hasil calculation engine.

---

## 22. Success Metrics

Karena produk bersifat internal, success metric lebih berorientasi operasional dibanding growth metric.

### SM-01 — Schedule Discoverability

Mayoritas user dapat mengetahui shift hari ini tanpa perlu mencari informasi dari kanal lain.

### SM-02 — Single Source Adoption

Jadwal resmi tidak lagi memerlukan multiple source of truth yang saling bersaing.

### SM-03 — Scheduling Efficiency

Waktu yang diperlukan untuk membuat jadwal bulanan turun dibanding proses manual sebelumnya.

### SM-04 — Payroll Reconciliation

Perbedaan antara hasil sistem dan hasil perhitungan manual yang benar dapat ditekan hingga tidak ada untuk rule yang sudah dikonfigurasi.

### SM-05 — Traceability

Perubahan jadwal/payroll penting dapat dijelaskan melalui histori sistem.

### SM-06 — Mobile Utility

Core information dapat dikonsumsi dengan nyaman pada layar mobile tanpa desktop dependency.

### SM-07 — Low Operational Friction

Aktivitas harian user biasa tidak membutuhkan training teknis yang signifikan.

---

## 23. Acceptance Criteria for Product Foundation

PRD-01 dianggap terpenuhi apabila seluruh PRD berikutnya tetap konsisten dengan ketentuan berikut:

- [ ] NOCScheduler tetap berfokus pada scheduling dan payroll internal NOC.
- [ ] Sistem mendukung baseline tiga shift.
- [ ] Shift 2 dan Shift 3 mendukung insentif configurable.
- [ ] Base salary configurable per employee.
- [ ] Jadwal dapat dilihat individual dan tim.
- [ ] Scheduling menyediakan workflow yang efisien untuk banyak employee.
- [ ] Payroll memiliki breakdown yang dapat dijelaskan.
- [ ] Perubahan configuration baru tidak merusak payroll historis.
- [ ] Hak lihat dan hak edit dipisahkan.
- [ ] Produk mobile-friendly untuk aktivitas konsumsi jadwal.
- [ ] Desktop mendukung administrative power workflows.
- [ ] Data kritis memiliki audit trail.
- [ ] Light mode menjadi default dan arsitektur siap dark mode.
- [ ] Timezone memiliki aturan eksplisit.
- [ ] Business rules configurable tidak di-hardcode ke UI.

---

## 24. Risks & Mitigations

### R-01 — Payroll berubah setelah settings diedit

**Risk:** Current settings digunakan untuk menghitung ulang periode lama.

**Mitigation:** Effective dating, snapshots, versioning, dan payroll locking.

### R-02 — Jadwal terlalu mudah diubah

**Risk:** User tanpa hak mengubah jadwal resmi.

**Mitigation:** Backend permission enforcement dan audit log.

### R-03 — Kalender menjadi rumit pada mobile

**Risk:** Desktop calendar dipaksa masuk ke layar kecil.

**Mitigation:** Mobile-specific schedule presentation dan responsive interaction design.

### R-04 — Scheduling lambat karena input repetitif

**Risk:** Administrator harus memasukkan assignment satu per satu.

**Mitigation:** Bulk assignment, copy period, templates, dan quick edit.

### R-05 — Business logic bercampur dengan UI

**Risk:** Refactor tampilan mengubah payroll/scheduling behavior.

**Mitigation:** Dedicated domain/service layer dan contract tests.

### R-06 — Histori tidak dapat dipercaya

**Risk:** Record lama ditimpa oleh edit master data.

**Mitigation:** Immutable history pada event penting dan controlled mutation.

### R-07 — Transparansi disalahartikan sebagai full access

**Risk:** Semua user memperoleh kemampuan edit karena data tidak bersifat rahasia.

**Mitigation:** Pisahkan visibility policy dari mutation permission.

---

## 25. Product Decisions Locked by PRD-01

Keputusan berikut dianggap baseline sampai direvisi secara eksplisit:

1. Nama produk kerja: **NOCScheduler**.
2. Produk adalah aplikasi web full-stack internal NOC.
3. Sistem menggunakan tiga shift utama.
4. Shift 2 dan Shift 3 mendukung insentif.
5. Gaji pokok dan insentif configurable.
6. Produk memiliki fungsi payroll bulanan.
7. Produk transparan secara internal sesuai policy organisasi.
8. Write permission tetap dikontrol.
9. Produk membutuhkan historical integrity.
10. Jadwal dan payroll adalah dua domain inti yang harus dipisahkan secara logis tetapi saling terhubung.
11. Mobile dan desktop sama-sama first-class experience dengan prioritas workflow berbeda.
12. Light theme menjadi default.
13. Data historis tidak boleh dihitung ulang menggunakan konfigurasi masa kini tanpa tindakan eksplisit.
14. Produk dirancang sebagai single source of truth untuk schedule dan payroll internal.

---

## 26. Decisions Deferred to Later PRDs

PRD-01 sengaja tidak mengunci detail berikut:

### PRD-02 — Feature Specification

- feature-by-feature behavior,
- detail actions,
- empty/error/loading states,
- prioritization lengkap.

### PRD-03 — Scheduling & Shift Business Logic

- exact schedule constraints,
- conflict rules,
- rest rules,
- cross-midnight attribution,
- publish/version semantics.

### PRD-04 — Payroll, Salary & Incentive Logic

- exact formulas,
- rounding,
- cutoff,
- effective dating rules,
- adjustment rules,
- finalization behavior.

### PRD-05 — Attendance, Leave, Overtime & Exceptions

- leave types,
- overtime rules,
- replacement,
- swap workflow.

### PRD-06 — Information Architecture

- final navigation,
- page hierarchy,
- URL structure.

### PRD-07 — Roles & Permissions

- exact role matrix,
- field/action permission.

### PRD-08 — Data Model

- schema,
- entities,
- relations,
- indexes,
- snapshots.

### PRD-10 onward

- UI/UX,
- design system,
- responsive behavior,
- UI polish,
- technical stack,
- APIs,
- security,
- reporting,
- notifications,
- QA,
- deployment.

---

## 27. Recommended Delivery Philosophy

Pengembangan sebaiknya mengikuti urutan domain, bukan sekadar halaman.

Urutan konseptual:

```text
Product Rules
   ↓
Data Model
   ↓
Scheduling Engine
   ↓
Payroll Engine
   ↓
API Contracts
   ↓
User Workflows
   ↓
UI
   ↓
Polish & QA
```

Walaupun frontend dapat mulai lebih awal untuk eksplorasi, implementasi production tidak boleh menjadikan tampilan sebagai sumber definisi business logic.

---

## 28. Definition of Product Done

NOCScheduler secara produk dianggap berhasil mencapai versi matang ketika:

1. anggota NOC selalu dapat mengetahui jadwal resmi dengan cepat,
2. scheduler dapat membuat jadwal tim secara efisien,
3. sistem mampu menangani perubahan jadwal tanpa kehilangan histori,
4. perhitungan payroll dapat dijelaskan sampai level komponen,
5. payroll periode lama tetap konsisten setelah konfigurasi baru diterapkan,
6. aplikasi nyaman digunakan pada desktop dan mobile,
7. administrator dapat mengelola parameter operasional tanpa edit code,
8. hak akses dapat ditegakkan secara konsisten,
9. laporan bulanan dapat digunakan sebagai referensi operasional,
10. sistem memiliki quality gates yang mencegah regression terhadap scheduling dan payroll.

---

## 29. Next Document

Dokumen berikutnya yang harus dibuat:

> **PRD-02 — Feature Specification**

PRD-02 akan menerjemahkan product foundation ini menjadi spesifikasi fitur lengkap, termasuk prioritas MVP, post-MVP, actor, action, state, expected behavior, edge cases utama, serta hubungan antarfitur.

---

## 30. Revision Notes

### v1.0 — Initial Product Foundation

- Menetapkan product vision NOCScheduler.
- Menetapkan scheduling dan payroll sebagai core domains.
- Menetapkan tiga shift sebagai baseline.
- Menetapkan Shift 2 dan Shift 3 sebagai shift dengan configurable incentive.
- Menetapkan internal transparency dengan controlled mutation.
- Menetapkan historical integrity sebagai requirement inti.
- Menetapkan light-first, responsive web experience.
- Menetapkan roadmap dokumentasi menuju PRD-02 dan PRD lanjutan.
