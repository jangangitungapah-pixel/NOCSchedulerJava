# PRD-02 — Feature Specification

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document  
> **Document ID:** PRD-02  
> **Status:** Draft — Feature Source of Truth  
> **Depends On:** PRD-01 — Product Vision, Scope & Requirements  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

## 1. Purpose

Dokumen ini mendefinisikan **fitur yang harus tersedia di NOCScheduler**, tujuan setiap fitur, pengguna yang berinteraksi dengannya, state utama, dependency, prioritas implementasi, serta acceptance requirement tingkat produk.

PRD-02 tidak menetapkan formula bisnis secara rinci. Aturan detail mengenai scheduling, konflik shift, payroll, insentif, historical snapshot, overtime, leave, dan exception akan diperdalam pada PRD logic terkait.

Dokumen ini menjadi source of truth untuk menjawab pertanyaan:

> **“Apa saja yang dapat dilakukan pengguna di NOCScheduler?”**

---

## 2. Product Context

NOCScheduler adalah aplikasi web full-stack internal untuk mengelola jadwal kerja NOC berbasis tiga shift:

- **Shift 1 / Pagi**
- **Shift 2 / Siang**
- **Shift 3 / Malam**

Aplikasi juga menghubungkan jadwal tersebut dengan komponen kompensasi seperti gaji pokok dan insentif shift sehingga anggota NOC dapat mengetahui estimasi maupun hasil payroll bulanannya secara transparan.

Produk harus mengutamakan:

- kecepatan mengetahui jadwal,
- kemudahan menyusun jadwal,
- transparansi internal,
- kontrol hak perubahan,
- payroll yang dapat dijelaskan,
- historical integrity,
- pengalaman mobile yang sangat baik untuk konsumsi informasi,
- pengalaman desktop yang efisien untuk pekerjaan administratif.

---

## 3. Feature Priority Model

Setiap fitur menggunakan klasifikasi berikut.

### P0 — Core / MVP Critical

Fitur yang wajib tersedia agar NOCScheduler dapat digunakan sebagai sistem scheduling dan payroll internal yang layak.

Tanpa fitur P0, produk belum dianggap siap dipakai operasional.

### P1 — High Value

Fitur yang sangat direkomendasikan setelah fondasi P0 stabil dan memberikan peningkatan signifikan pada produktivitas atau reliability.

### P2 — Enhancement

Fitur yang meningkatkan kenyamanan, insight, automation, atau pengalaman penggunaan tetapi tidak memblokir operasional dasar.

### P3 — Future / Optional Integration

Fitur yang hanya dibutuhkan apabila organisasi memutuskan memperluas scope produk.

---

## 4. Primary Actors

### 4.1 NOC Member

Pengguna utama untuk konsumsi jadwal dan informasi payroll.

Kebutuhan utama:

- mengetahui shift hari ini,
- melihat jadwal personal,
- melihat jadwal tim,
- mengetahui siapa yang sedang bertugas,
- mengetahui perubahan jadwal,
- melihat jumlah shift dan insentif,
- melihat payroll bulanan,
- mengajukan request yang diperbolehkan.

### 4.2 Scheduler / Supervisor

Pengguna operasional yang bertanggung jawab menyusun atau mengelola jadwal.

Kebutuhan utama:

- membuat jadwal,
- melakukan assignment,
- bulk edit,
- mengecek coverage,
- menangani conflict,
- publish jadwal,
- melihat request,
- mengevaluasi distribusi shift.

### 4.3 Administrator

Pengguna dengan akses konfigurasi lebih luas.

Kebutuhan utama:

- employee management,
- user/access management,
- shift settings,
- salary settings,
- incentive settings,
- payroll management,
- report,
- audit trail,
- system configuration.

> Detail hak akses final ditentukan pada PRD-07 — Roles, Permissions & Internal Transparency.

---

# 5. Feature Domain — Authentication & Session

## F-AUTH-01 — Login

**Priority:** P0  
**Actors:** Semua user

User harus dapat masuk menggunakan akun internal yang valid.

### Requirements

- Login screen sederhana dan cepat.
- Validasi credential dilakukan server-side.
- Pesan error tidak membocorkan informasi keamanan berlebihan.
- Setelah login berhasil, user diarahkan ke halaman default berdasarkan konteks produk, dengan Dashboard sebagai default awal.
- Session harus persisten sesuai kebijakan sistem.

### Acceptance

- User valid dapat login.
- Credential tidak valid ditolak.
- User nonaktif tidak dapat menggunakan aplikasi.
- Session invalid/expired mengarahkan user kembali ke login secara aman.

---

## F-AUTH-02 — Logout

**Priority:** P0

User dapat mengakhiri session aktif dari menu account/profile.

---

## F-AUTH-03 — Account Session Awareness

**Priority:** P1

Sistem dapat menampilkan sesi login yang relevan atau minimal memberikan kontrol untuk mengakhiri session aktif sesuai kebutuhan keamanan internal.

---

# 6. Feature Domain — Dashboard

## F-DASH-01 — Personal Shift Today

**Priority:** P0  
**Actors:** NOC Member, Scheduler, Administrator

Dashboard harus langsung menjawab:

> **“Hari ini saya shift apa?”**

### Minimum Information

- nama shift,
- waktu mulai,
- waktu selesai,
- tanggal,
- status hari tersebut,
- rekan satu shift,
- indikator jika ada perubahan terbaru.

Jika user tidak memiliki shift, UI harus menunjukkan kondisi tersebut dengan jelas tanpa terlihat seperti error.

---

## F-DASH-02 — Next Shift

**Priority:** P0

Menampilkan assignment shift user berikutnya setelah shift saat ini/hari ini.

Informasi minimal:

- tanggal,
- nama shift,
- jam,
- countdown relatif opsional sebagai enhancement UI.

---

## F-DASH-03 — Now on Duty

**Priority:** P0

Menampilkan anggota NOC yang berdasarkan jadwal sedang bertugas pada waktu saat ini.

### Purpose

Memudahkan anggota NOC mengetahui siapa yang menjadi tim aktif tanpa membuka kalender penuh.

### Information

- employee,
- shift,
- waktu shift,
- status assignment.

---

## F-DASH-04 — Current Coverage Summary

**Priority:** P1

Menampilkan coverage tim saat ini atau shift terdekat.

Contoh:

- Shift 1: 4 NOC
- Shift 2: 3 NOC
- Shift 3: 3 NOC

Jika kelak terdapat minimum coverage rule, dashboard dapat memberi indicator warning ketika coverage tidak memenuhi kebutuhan.

---

## F-DASH-05 — Monthly Personal Shift Summary

**Priority:** P0

Menampilkan ringkasan bulan berjalan:

- total hari terjadwal,
- jumlah Shift 1,
- jumlah Shift 2,
- jumlah Shift 3,
- leave/exception jika sudah didukung,
- estimasi insentif shift.

---

## F-DASH-06 — Recent Schedule Changes

**Priority:** P1

Menampilkan perubahan jadwal terbaru yang relevan bagi user.

Contoh:

- jadwal tanggal 18 berubah Shift 2 → Shift 3,
- schedule bulan berikutnya telah dipublish.

---

## F-DASH-07 — Quick Actions

**Priority:** P1

Quick action berdasarkan permission, misalnya:

- View My Schedule
- View Team Schedule
- Create Schedule
- Review Requests
- View Payroll

Action yang tidak dimiliki user tidak ditampilkan sebagai tombol aktif.

---

# 7. Feature Domain — My Schedule

## F-MYS-01 — Personal Calendar

**Priority:** P0

User dapat melihat jadwal personal dalam periode yang mudah dinavigasi.

### Required Views

- bulan,
- minggu atau agenda mobile-friendly,
- fokus hari ini.

### Each Assignment

Minimal dapat menunjukkan:

- shift,
- waktu,
- status,
- exception jika ada,
- tanda jika assignment mengalami perubahan setelah publish.

---

## F-MYS-02 — Schedule Detail

**Priority:** P0

User dapat membuka detail assignment untuk melihat:

- tanggal,
- shift,
- jam efektif,
- rekan satu shift,
- status jadwal,
- catatan jika tersedia,
- histori perubahan yang relevan.

---

## F-MYS-03 — Personal Monthly Summary

**Priority:** P0

Pada periode yang dipilih, user dapat melihat statistik jumlah shift secara ringkas.

---

## F-MYS-04 — Jump to Today

**Priority:** P0

Calendar harus memiliki cara cepat kembali ke tanggal hari ini.

---

## F-MYS-05 — Historical Schedule Browse

**Priority:** P1

User dapat melihat jadwal periode sebelumnya tanpa data lama berubah mengikuti konfigurasi baru.

---

# 8. Feature Domain — Team Schedule

## F-TEAM-01 — Team Calendar

**Priority:** P0

Semua user yang memiliki view permission dapat melihat jadwal seluruh NOC.

### Goals

- mengetahui siapa bekerja kapan,
- mengetahui partner shift,
- melihat komposisi tim,
- membantu koordinasi internal.

### Desktop Direction

Dense schedule grid/timeline yang tetap mudah dipindai.

### Mobile Direction

Tidak memaksakan tabel desktop diperkecil. Gunakan pattern yang tetap readable dan touch-friendly.

---

## F-TEAM-02 — Filter Team Schedule

**Priority:** P0

Filter minimal:

- employee,
- shift,
- tanggal/periode.

P1 dapat menambahkan:

- status,
- team/group,
- exception type.

---

## F-TEAM-03 — Employee Focus

**Priority:** P1

User dapat memilih satu employee dan menyorot seluruh assignment employee tersebut tanpa kehilangan konteks kalender tim.

---

## F-TEAM-04 — Shift Focus

**Priority:** P1

User dapat memfilter/menyorot Shift 1, Shift 2, atau Shift 3.

---

## F-TEAM-05 — Coverage Indicator

**Priority:** P1

Pada setiap tanggal/shift, scheduler dapat melihat jumlah orang terjadwal.

Jika minimum staffing rule sudah diaktifkan, sistem dapat memberi status:

- healthy,
- warning,
- under-covered,
- over-assigned apabila relevan.

---

# 9. Feature Domain — Schedule Management

## F-SCH-01 — Schedule Workspace

**Priority:** P0  
**Actors:** Scheduler, Administrator

Workspace utama untuk menyusun jadwal.

Harus memungkinkan user melakukan assignment tanpa berpindah halaman secara berlebihan.

---

## F-SCH-02 — Create Schedule Period

**Priority:** P0

Scheduler dapat memulai periode jadwal baru.

Contoh periode:

- September 2026.

Schedule baru harus memiliki state yang jelas, minimal:

- Draft
- Published

State tambahan dapat muncul dari PRD logic jika diperlukan.

---

## F-SCH-03 — Assign Shift

**Priority:** P0

Scheduler dapat menentukan employee + tanggal + shift.

Sistem harus melakukan validasi sebelum assignment disimpan.

Detail validation ditentukan PRD-03.

---

## F-SCH-04 — Edit Assignment

**Priority:** P0

Assignment dapat diubah sesuai permission.

Perubahan terhadap published schedule harus masuk audit history.

---

## F-SCH-05 — Remove Assignment

**Priority:** P0

Assignment dapat dihapus/dibatalkan dengan confirmation yang proporsional.

Published assignment yang dihapus tetap harus meninggalkan history.

---

## F-SCH-06 — Bulk Assignment

**Priority:** P0

Scheduler harus dapat menerapkan shift ke banyak employee/tanggal sekaligus.

Contoh:

- assign Shift 1 kepada tiga employee untuk beberapa tanggal,
- set hari tertentu sebagai off,
- menerapkan pola kerja ke rentang tanggal.

Bulk operation harus menampilkan validation outcome dengan jelas.

---

## F-SCH-07 — Multi-cell Editing

**Priority:** P1

Pada desktop, scheduler dapat memilih beberapa cell/range kalender lalu menerapkan action secara massal.

Tujuan: mengurangi repetitive clicking.

---

## F-SCH-08 — Copy Previous Schedule

**Priority:** P0

Scheduler dapat menggunakan periode sebelumnya sebagai titik awal periode baru.

Copy harus menghasilkan draft baru, bukan mengubah jadwal sumber.

---

## F-SCH-09 — Schedule Template

**Priority:** P1

Scheduler dapat menyimpan pola jadwal yang sering dipakai.

Contoh:

- pola rotasi 3 shift,
- kelompok A/B/C,
- pola mingguan tertentu.

Template adalah alat bantu assignment, bukan historical schedule.

---

## F-SCH-10 — Schedule Rotation Helper

**Priority:** P2

Sistem membantu menghasilkan draft berdasarkan pola rotasi yang dikonfigurasi.

Hasil generator **selalu berupa draft yang dapat direview**, bukan publish otomatis.

---

## F-SCH-11 — Conflict Detection

**Priority:** P0

Sistem harus mendeteksi assignment yang berpotensi tidak valid atau tidak masuk akal.

Kategori konflik detail ditentukan PRD-03.

UI minimal membedakan:

- blocking error,
- warning,
- informational notice.

---

## F-SCH-12 — Validation Summary

**Priority:** P0

Sebelum publish, scheduler dapat melihat ringkasan masalah schedule.

Contoh:

- 2 employee belum memiliki assignment,
- 1 konflik,
- 3 coverage warning.

---

## F-SCH-13 — Publish Schedule

**Priority:** P0

Draft schedule dapat dipublish oleh user berwenang.

### Publish Flow

Minimal:

1. validation,
2. preview summary,
3. confirmation,
4. publish,
5. audit log,
6. notification event jika notification feature aktif.

---

## F-SCH-14 — Edit Published Schedule

**Priority:** P0

Published schedule tetap dapat diperbaiki oleh user berwenang, karena perubahan operasional dapat terjadi.

Namun perubahan harus:

- tervalidasi,
- meninggalkan histori before/after,
- menyimpan actor dan timestamp,
- menandai perubahan yang relevan kepada user terdampak.

---

## F-SCH-15 — Schedule Change Reason

**Priority:** P1

Untuk perubahan tertentu pada jadwal yang sudah dipublish, sistem dapat meminta alasan perubahan.

Contoh:

- swap,
- employee unavailable,
- operational adjustment,
- correction.

---

## F-SCH-16 — Schedule Version Awareness

**Priority:** P1

Sistem dapat menunjukkan bahwa schedule pernah mengalami perubahan setelah publish tanpa mengharuskan user memahami teknis versioning.

---

## F-SCH-17 — Fairness Insight

**Priority:** P1

Scheduler dapat melihat distribusi jumlah Shift 2 dan Shift 3 per employee dalam periode tertentu.

Tujuan:

- membantu evaluasi pemerataan shift,
- bukan otomatis menentukan bahwa pembagian tertentu “adil”.

Sistem hanya menyediakan data/indikator; keputusan operasional tetap manusia.

---

# 10. Feature Domain — Schedule Requests & Swap

## F-REQ-01 — Shift Swap Request

**Priority:** P1

User dapat mengajukan pertukaran shift dengan employee lain apabila policy mengizinkan.

State minimum:

- Pending
- Approved
- Rejected
- Cancelled

Jika organisasi menginginkan acceptance dari employee tujuan sebelum supervisor approval, detail workflow ditentukan PRD-05.

---

## F-REQ-02 — Schedule Change Request

**Priority:** P1

User dapat mengajukan perubahan jadwal tanpa harus mengubah schedule secara langsung.

---

## F-REQ-03 — Request Inbox

**Priority:** P1

Scheduler/Admin memiliki daftar request yang perlu ditindaklanjuti.

Minimum features:

- filter state,
- detail request,
- approve/reject,
- reason/comment,
- link ke assignment terkait.

---

## F-REQ-04 — Request History

**Priority:** P1

User dapat melihat status dan histori request yang pernah diajukan.

---

# 11. Feature Domain — Employee Management

## F-EMP-01 — Employee Directory

**Priority:** P0

Menampilkan seluruh anggota NOC yang terdaftar.

Minimum data visual:

- nama,
- status aktif,
- role/functional role yang relevan,
- informasi identitas internal secukupnya.

---

## F-EMP-02 — Employee Detail

**Priority:** P0

Halaman detail employee dapat menjadi pusat informasi terkait:

- profile,
- schedule summary,
- compensation configuration sesuai permission,
- payroll summary,
- employment status,
- history relevan.

---

## F-EMP-03 — Create Employee

**Priority:** P0

Administrator dapat menambahkan employee/user sesuai model akun yang ditentukan kemudian.

---

## F-EMP-04 — Edit Employee

**Priority:** P0

Data employee dapat diperbarui tanpa menghapus histori jadwal/payroll lama.

---

## F-EMP-05 — Deactivate Employee

**Priority:** P0

Employee yang tidak lagi aktif sebaiknya dinonaktifkan, bukan dihapus permanen jika sudah memiliki historical data.

---

## F-EMP-06 — Employee Schedule Snapshot

**Priority:** P1

Dari halaman employee, user dapat melihat ringkasan jadwal bulan berjalan dan akses cepat ke schedule detail.

---

## F-EMP-07 — Employee Compensation Snapshot

**Priority:** P1

Untuk user yang memiliki permission, halaman employee dapat menampilkan konfigurasi gaji yang sedang efektif dan histori perubahan.

---

# 12. Feature Domain — Shift Configuration

## F-SHIFT-01 — Shift Definitions

**Priority:** P0

Administrator dapat mengelola definisi Shift 1, Shift 2, dan Shift 3.

Minimum configurable fields:

- display name,
- short label/code,
- start time,
- end time,
- active state,
- display metadata yang aman dikonfigurasi.

---

## F-SHIFT-02 — Overnight Shift Support

**Priority:** P0

Sistem harus mendukung shift yang dimulai pada satu tanggal dan berakhir pada tanggal berikutnya.

Detail date attribution ditetapkan PRD-03.

---

## F-SHIFT-03 — Shift Visual Identity

**Priority:** P0

Setiap shift memiliki visual identifier konsisten pada calendar, badges, reports, dan payroll breakdown.

Visual identity tidak boleh menjadi satu-satunya cara membedakan shift; label teks tetap diperlukan untuk accessibility.

---

## F-SHIFT-04 — Effective Configuration

**Priority:** P1

Perubahan signifikan terhadap definisi shift sebaiknya memiliki tanggal efektif agar data historis tetap benar.

---

# 13. Feature Domain — Compensation Settings

## F-COMP-01 — Base Salary per Employee

**Priority:** P0

Administrator dapat menetapkan gaji pokok employee.

Perubahan salary harus mendukung historical integrity.

---

## F-COMP-02 — Shift 2 Incentive

**Priority:** P0

Administrator dapat mengatur nominal/aturan dasar insentif Shift 2.

---

## F-COMP-03 — Shift 3 Incentive

**Priority:** P0

Administrator dapat mengatur nominal/aturan dasar insentif Shift 3.

---

## F-COMP-04 — Effective Dating

**Priority:** P0

Perubahan nominal salary/insentif tidak boleh diam-diam mengubah periode historis.

Konfigurasi baru harus memiliki mekanisme tanggal efektif atau snapshot yang menjamin hasil historis konsisten.

---

## F-COMP-05 — Compensation History

**Priority:** P1

Administrator dapat melihat histori perubahan komponen kompensasi employee/configuration.

---

## F-COMP-06 — Bonus / Deduction / Adjustment Type

**Priority:** P1

Sistem dapat mengakomodasi komponen manual di luar salary dan incentive utama.

Contoh:

- bonus,
- deduction,
- correction,
- reimbursement-like adjustment apabila scope organisasi mengizinkan.

Jenis dan formula detail ditentukan PRD-04.

---

# 14. Feature Domain — Payroll

## F-PAY-01 — Payroll Period

**Priority:** P0

Payroll dikelola berdasarkan periode yang jelas, umumnya bulanan.

Contoh:

- August 2026.

---

## F-PAY-02 — Payroll Overview

**Priority:** P0

Halaman payroll menampilkan ringkasan seluruh employee untuk periode terpilih.

Minimum columns/information:

- employee,
- base salary,
- count Shift 1,
- count Shift 2,
- count Shift 3,
- shift incentive,
- adjustment jika ada,
- Take Home Pay/total final sesuai scope formula.

---

## F-PAY-03 — Payroll Calculation

**Priority:** P0

Sistem dapat menghasilkan payroll berdasarkan data sumber yang valid untuk periode tersebut.

Perhitungan harus deterministik.

Formula rinci ditentukan PRD-04.

---

## F-PAY-04 — Employee Payroll Detail

**Priority:** P0

User dapat membuka breakdown payroll employee.

Minimum breakdown:

- base salary,
- Shift 1 count,
- Shift 2 count,
- Shift 2 incentive,
- Shift 3 count,
- Shift 3 incentive,
- adjustment,
- total.

Informasi harus cukup untuk menjelaskan dari mana angka berasal.

---

## F-PAY-05 — Source Traceability

**Priority:** P0

Komponen payroll yang berasal dari jadwal harus dapat ditelusuri ke source record atau daftar assignment yang membentuknya.

Tujuan:

> user tidak hanya melihat angka, tetapi dapat memahami asal angka tersebut.

---

## F-PAY-06 — Payroll Recalculation

**Priority:** P0

Payroll draft dapat dihitung ulang ketika source data masih diperbolehkan berubah.

Recalculation tidak boleh digunakan untuk diam-diam memodifikasi payroll final/locked.

---

## F-PAY-07 — Manual Adjustment

**Priority:** P1

User berwenang dapat menambahkan adjustment dengan:

- type,
- nominal,
- reason,
- actor,
- timestamp.

---

## F-PAY-08 — Payroll Review

**Priority:** P0

Sebelum payroll difinalisasi, administrator dapat memeriksa summary dan detail setiap employee.

---

## F-PAY-09 — Finalize Payroll

**Priority:** P0

Payroll dapat difinalisasi setelah review.

Finalization menghasilkan historical record yang stabil.

---

## F-PAY-10 — Payroll Lock

**Priority:** P0

Payroll final dapat dikunci untuk mencegah perubahan tidak sengaja.

Perubahan setelah lock, jika diizinkan sama sekali, harus menggunakan workflow khusus yang sangat eksplisit dan diaudit.

---

## F-PAY-11 — Payroll Status

**Priority:** P0

Minimum status yang direkomendasikan:

- Draft
- Calculated / Ready for Review
- Finalized
- Locked

Penamaan final akan ditentukan bersama PRD-04.

---

## F-PAY-12 — Payroll Comparison

**Priority:** P2

Administrator/user dapat membandingkan payroll bulan berjalan dengan bulan sebelumnya.

Contoh insight:

- perubahan jumlah Shift 3,
- perubahan incentive,
- perubahan THP.

---

## F-PAY-13 — Personal Payroll View

**Priority:** P0

NOC Member dapat melihat payroll dirinya sendiri dengan breakdown lengkap.

Karena produk menggunakan prinsip internal transparency, visibilitas payroll orang lain akan dikunci final pada PRD-07 sesuai kebijakan organisasi.

---

# 15. Feature Domain — Leave, Availability & Exceptions

## F-EXC-01 — Availability Exception Model

**Priority:** P1

Sistem harus siap menangani kondisi selain regular shift.

Contoh:

- Leave
- Sick
- Permission
- Training
- Business Assignment
- Unavailable
- Replacement

---

## F-EXC-02 — Leave / Unavailable Request

**Priority:** P1

User dapat mengajukan status unavailable/cuti apabila feature tersebut diaktifkan.

---

## F-EXC-03 — Exception on Calendar

**Priority:** P1

Exception harus terlihat jelas pada My Schedule dan Team Schedule serta tidak disamakan dengan regular shift.

---

## F-EXC-04 — Overtime Record

**Priority:** P1

Sistem dapat mencatat overtime sebagai record terpisah dari regular shift.

Dampak payroll ditentukan PRD-04 dan PRD-05.

---

# 16. Feature Domain — Reporting

## F-REP-01 — Monthly Shift Report

**Priority:** P0

Report periode bulanan yang menunjukkan distribusi shift per employee.

Minimum:

- employee,
- Shift 1 count,
- Shift 2 count,
- Shift 3 count,
- total assigned shift.

---

## F-REP-02 — Monthly Payroll Report

**Priority:** P0

Menampilkan payroll seluruh employee dalam satu periode.

Minimum:

- employee,
- base salary,
- incentive,
- adjustments,
- total payroll/THP.

---

## F-REP-03 — Employee Monthly Report

**Priority:** P1

Ringkasan satu employee dalam satu periode:

- schedule,
- shift distribution,
- exception,
- incentive,
- payroll summary.

---

## F-REP-04 — Shift Distribution / Fairness Report

**Priority:** P1

Report untuk membandingkan distribusi Shift 2 dan Shift 3 antaranggota.

Sistem tidak menyatakan fairness secara absolut; hanya menyediakan insight yang membantu evaluasi manusia.

---

## F-REP-05 — Export CSV

**Priority:** P1

Report utama dapat diekspor ke CSV.

---

## F-REP-06 — Export Spreadsheet

**Priority:** P1

Export format spreadsheet seperti XLSX direkomendasikan untuk penggunaan internal.

---

## F-REP-07 — Print/PDF Friendly Report

**Priority:** P2

Report penting memiliki print view yang layak. Export PDF dapat ditambahkan jika memang diperlukan organisasi.

---

# 17. Feature Domain — Notifications

## F-NOTIF-01 — In-app Notification Center

**Priority:** P1

Sistem memiliki notification center internal.

---

## F-NOTIF-02 — Schedule Published Notification

**Priority:** P1

User dapat diberi tahu ketika schedule periode baru dipublish.

---

## F-NOTIF-03 — Personal Schedule Changed

**Priority:** P1

User diberi tahu ketika assignment personal pada published schedule berubah.

---

## F-NOTIF-04 — Request Status Notification

**Priority:** P1

User menerima update ketika request approved/rejected/cancelled.

---

## F-NOTIF-05 — Payroll Available

**Priority:** P1

User menerima notifikasi ketika payroll periode tertentu tersedia/final sesuai policy.

---

## F-NOTIF-06 — Mark as Read

**Priority:** P1

Notification dapat ditandai read/unread.

---

## F-NOTIF-07 — External Notification Integration

**Priority:** P3

Integrasi opsional:

- Email
- Telegram
- WhatsApp

Tidak menjadi dependency MVP.

---

# 18. Feature Domain — Audit & History

## F-AUD-01 — Audit Log

**Priority:** P0

Perubahan penting harus tercatat.

Minimum event categories:

- schedule change,
- publish,
- employee changes,
- compensation changes,
- incentive configuration changes,
- payroll changes,
- settings changes,
- role/permission changes.

---

## F-AUD-02 — Audit Detail

**Priority:** P0

Record audit minimal menyimpan:

- actor,
- timestamp,
- action,
- affected entity,
- before value jika relevan,
- after value jika relevan,
- reason jika diwajibkan.

---

## F-AUD-03 — Audit Filter

**Priority:** P1

Audit history dapat difilter berdasarkan:

- date,
- actor,
- entity/domain,
- action type.

---

## F-AUD-04 — Schedule History

**Priority:** P0

User berwenang dapat melihat perubahan assignment published.

---

## F-AUD-05 — Payroll History

**Priority:** P0

Payroll periode lama harus tetap dapat dibuka dalam kondisi historisnya.

---

# 19. Feature Domain — Settings

## F-SET-01 — General Settings

**Priority:** P0

Konfigurasi aplikasi umum.

Contoh:

- organization/team display name,
- timezone,
- locale,
- date formatting yang relevan,
- operational defaults.

Timezone default adalah `Asia/Jakarta`.

---

## F-SET-02 — Shift Settings

**Priority:** P0

Mengelola definisi Shift 1, Shift 2, Shift 3.

---

## F-SET-03 — Payroll Settings

**Priority:** P0

Mengelola parameter payroll yang memang dirancang configurable.

Formula final ditentukan PRD-04.

---

## F-SET-04 — Incentive Settings

**Priority:** P0

Mengelola insentif Shift 2 dan Shift 3 beserta effective date/historical requirement.

---

## F-SET-05 — User & Access Settings

**Priority:** P0

Administrator dapat mengelola status user dan role/permission sesuai PRD-07.

---

## F-SET-06 — Holiday Calendar

**Priority:** P1

Administrator dapat mengelola hari libur yang relevan terhadap scheduling/payroll.

Dampak business logic ditentukan PRD-03/04/05.

---

## F-SET-07 — Feature Configuration

**Priority:** P2

Feature tertentu dapat diaktifkan/nonaktifkan apabila ada kebutuhan implementasi modular, misalnya:

- requests,
- overtime,
- external notification integration.

Tidak semua fitur perlu menjadi toggle jika toggle menambah kompleksitas tanpa manfaat.

---

# 20. Feature Domain — Search, Filter & Productivity

## F-PROD-01 — Global Search

**Priority:** P2

Search lintas domain untuk menemukan employee, periode schedule, payroll, atau halaman penting.

---

## F-PROD-02 — Persistent Useful Filters

**Priority:** P1

Pada halaman data-heavy, filter yang relevan dapat dipertahankan selama session atau sesuai UX yang ditentukan.

---

## F-PROD-03 — Keyboard Productivity

**Priority:** P2

Desktop scheduler dapat memperoleh keyboard shortcut untuk action berulang jika tidak mengganggu accessibility.

---

## F-PROD-04 — Undo for Safe Local Actions

**Priority:** P2

Untuk operasi UI tertentu yang aman, sistem dapat menyediakan undo singkat.

Untuk tindakan finansial/publish/finalize, sistem tetap menggunakan validation/confirmation dan tidak mengandalkan undo temporer.

---

# 21. Feature Domain — Mobile Experience

## F-MOB-01 — Mobile Schedule Home

**Priority:** P0

Mobile harus langsung memprioritaskan:

- shift hari ini,
- shift berikutnya,
- rekan satu shift,
- perubahan penting.

---

## F-MOB-02 — Mobile Team Schedule

**Priority:** P0

Team schedule tetap mudah digunakan tanpa memaksa user melakukan zoom pada tabel desktop.

---

## F-MOB-03 — One-hand Navigation

**Priority:** P0

Primary navigation dan action sehari-hari harus dapat dijangkau dengan nyaman pada perangkat mobile.

---

## F-MOB-04 — Bottom Sheet / Drawer Interaction

**Priority:** P1

Detail assignment, filter, atau quick action dapat menggunakan bottom sheet/drawer ketika lebih cocok daripada modal desktop.

---

## F-MOB-05 — Mobile Payroll Breakdown

**Priority:** P0

Payroll personal harus dapat dibaca jelas di layar kecil tanpa horizontal scrolling yang tidak perlu.

---

# 22. Feature Domain — Desktop Productivity

## F-DESK-01 — Dense Schedule Grid

**Priority:** P0

Desktop schedule harus mampu menampilkan banyak employee dan tanggal dengan density tinggi tetapi tetap jelas.

---

## F-DESK-02 — Sticky Context

**Priority:** P1

Pada grid besar, elemen seperti employee identity/date context dapat dibuat sticky jika membantu orientasi.

---

## F-DESK-03 — Multi-select

**Priority:** P1

Workspace desktop mendukung selection banyak assignment/cell untuk bulk actions.

---

## F-DESK-04 — Contextual Editing

**Priority:** P1

Editing menggunakan popover/drawer/modal sesuai kompleksitas tanpa membuat user kehilangan konteks grid utama.

---

# 23. Feature Domain — States & Feedback

## F-STATE-01 — Loading State

**Priority:** P0

Semua halaman utama memiliki loading state yang tidak menyebabkan layout shift berlebihan.

---

## F-STATE-02 — Empty State

**Priority:** P0

Empty state menjelaskan kondisi, bukan hanya menampilkan halaman kosong.

Contoh:

- belum ada schedule bulan ini,
- belum ada payroll,
- tidak ada request pending.

---

## F-STATE-03 — Error State

**Priority:** P0

Error state harus actionable dan membedakan error validation, permission, network, dan server jika relevan.

---

## F-STATE-04 — Success Feedback

**Priority:** P0

Action seperti save, publish, approve, atau finalize memberikan feedback yang jelas.

---

## F-STATE-05 — Unsaved Changes Protection

**Priority:** P1

Untuk form/workspace kompleks, sistem harus mencegah kehilangan perubahan yang belum disimpan ketika user berpindah konteks secara tidak sengaja.

---

# 24. Recommended Application Pages

Struktur final akan ditentukan PRD-06, tetapi feature requirements saat ini mengindikasikan halaman berikut.

## 24.1 Overview

### Dashboard

- Personal Shift Today
- Next Shift
- Now on Duty
- Current Coverage
- Monthly Shift Summary
- Recent Changes
- Quick Actions

---

## 24.2 Schedule

### My Schedule

Jadwal personal.

### Team Schedule

Jadwal seluruh tim.

### Schedule Management

Workspace scheduler/admin.

### Requests

Swap/change/leave-related requests.

---

## 24.3 People

### Employees

Directory seluruh anggota.

### Employee Detail

Profile + schedule + compensation/payroll context sesuai permission.

---

## 24.4 Payroll

### Payroll Overview

Daftar payroll per periode.

### Monthly Payroll

Detail periode tertentu.

### Employee Payroll Detail

Breakdown individual.

---

## 24.5 Reports

### Shift Report

Distribusi shift.

### Payroll Report

Payroll lintas employee.

### Employee Report

Ringkasan individual.

### Distribution Insight

Insight pemerataan shift.

---

## 24.6 System

### Notifications

Notification center.

### Activity / Audit History

Histori perubahan penting.

### Settings

Subpage yang direkomendasikan:

- General
- Shift Configuration
- Payroll Configuration
- Incentives
- Employees / Compensation
- User & Access
- Holidays
- Optional Feature Settings

---

# 25. Feature Dependency Map

## Scheduling Core

`Employee → Shift Definition → Schedule Period → Assignment → Validation → Publish → History`

## Payroll Core

`Employee Salary + Published/Eligible Shift Data + Incentive Configuration + Adjustment → Payroll Calculation → Review → Finalize → Lock`

## Request Flow

`Employee Assignment → Request → Validation/Approval → Schedule Update → Audit → Notification`

## Reporting

`Historical Schedule + Payroll Data → Aggregation → Report → Export`

---

# 26. MVP Definition

NOCScheduler dapat dianggap memiliki **MVP operasional** ketika minimal memenuhi fitur berikut.

## Identity

- Login
- Logout
- User active/inactive
- Basic role separation

## Employee

- Employee directory
- Employee detail
- Create/edit/deactivate

## Shift

- Shift 1/2/3 definition
- Start/end time
- Overnight support

## Scheduling

- My Schedule
- Team Schedule
- Schedule workspace
- Create period
- Assignment
- Bulk assignment
- Edit/remove
- Copy previous schedule
- Conflict validation dasar
- Draft/published state
- Publish
- Edit published schedule with audit

## Dashboard

- Shift today
- Next shift
- Now on Duty
- Monthly personal summary

## Compensation

- Base salary
- Shift 2 incentive
- Shift 3 incentive
- Historical/effective configuration protection

## Payroll

- Monthly period
- Calculation
- Employee breakdown
- Source traceability
- Review
- Finalize
- Lock
- Personal payroll view

## Reports

- Monthly shift report
- Monthly payroll report

## System

- General settings
- Shift settings
- Compensation/payroll settings
- User/access settings
- Audit log

## UX Baseline

- Responsive
- Mobile schedule usable
- Desktop schedule dense and usable
- Loading/empty/error/success states
- Light theme default
- Dark-mode architecture ready; exact delivery timing defined by UI PRD

---

# 27. Recommended P1 Release

Setelah MVP stabil, prioritas berikut memberikan value terbesar:

1. Shift Swap / Schedule Request
2. Leave & Availability Exception
3. Overtime
4. Schedule Templates
5. Coverage Indicator
6. Fairness / Shift Distribution Insight
7. Notification Center
8. Compensation History UI
9. XLSX Export
10. Sticky schedule headers / richer desktop multi-select
11. Holiday Calendar
12. Payroll Manual Adjustment
13. Employee monthly report

---

# 28. Future Enhancements

Fitur berikut tidak menjadi komitmen MVP tetapi arsitektur tidak boleh menutup kemungkinan implementasinya.

## 28.1 Smart Schedule Draft Assistant

Sistem dapat membantu membuat draft jadwal berdasarkan:

- pola rotasi,
- availability,
- coverage,
- distribusi shift.

Fitur tidak boleh melakukan publish otomatis.

---

## 28.2 Schedule Fairness Recommendation

Sistem dapat memberi rekomendasi berdasarkan distribusi historis.

Recommendation hanya advisory dan tidak menggantikan keputusan scheduler.

---

## 28.3 PWA / Installable Web App

Aplikasi dapat ditingkatkan menjadi installable PWA jika kebutuhan mobile internal mendukung.

---

## 28.4 External Notification

- Email
- Telegram
- WhatsApp

---

## 28.5 SSO / Enterprise Identity

Jika organisasi membutuhkan integrasi identity provider di masa depan.

---

## 28.6 Attendance Integration

Integrasi ke attendance system dapat dipertimbangkan, tetapi NOCScheduler tidak menjadi biometric attendance product secara default.

---

# 29. Product Guardrails

## GR-01 — No Silent Payroll Mutation

Tidak boleh ada perubahan konfigurasi yang diam-diam mengubah hasil payroll historis.

## GR-02 — No Silent Published Schedule Mutation

Perubahan published schedule harus dapat ditelusuri.

## GR-03 — No Destructive Employee Delete

Employee dengan historical data tidak boleh hilang hanya karena sudah nonaktif.

## GR-04 — No Automatic Publish from Generator

Template, copy, rotation helper, atau smart assistant hanya menghasilkan draft.

## GR-05 — View Permission Is Separate from Mutation Permission

Transparansi internal tidak berarti semua user dapat mengubah data.

## GR-06 — Explain Financial Numbers

Payroll/insentif harus memiliki breakdown yang cukup untuk dipahami manusia.

## GR-07 — Configuration Must Respect Effective Time

Perubahan aturan yang sensitif terhadap waktu harus mempertahankan kebenaran historis.

## GR-08 — Mobile Must Not Be Shrunk Desktop

Mobile memiliki interaction model sendiri yang sesuai layar kecil.

## GR-09 — Bulk Operations Must Be Safe

Bulk action wajib memiliki validation dan result summary.

## GR-10 — Critical Actions Need Deliberate Confirmation

Publish, finalize, lock, destructive update, atau perubahan konfigurasi finansial memerlukan confirmation yang sesuai tingkat risiko.

---

# 30. Cross-Feature Acceptance Requirements

Seluruh fitur utama harus memenuhi prinsip berikut.

### CF-01 — Permission Awareness

Backend harus menjadi source of truth authorization. UI hanya mencerminkan permission, bukan menjadi satu-satunya pengaman.

### CF-02 — Auditability

Perubahan penting dapat ditelusuri.

### CF-03 — Historical Integrity

Data historis tidak berubah karena konfigurasi hari ini.

### CF-04 — Responsive UX

Core use case dapat diselesaikan dari desktop dan mobile sesuai tujuan masing-masing form factor.

### CF-05 — Clear State

User dapat memahami apakah data:

- draft,
- published,
- pending,
- finalized,
- locked,
- inactive,
- atau status penting lainnya.

### CF-06 — Predictable Feedback

Save/action selalu memberikan feedback sukses atau error yang jelas.

### CF-07 — Search/Filter Where Density Requires It

Daftar yang dapat membesar harus memiliki filter/search yang sesuai.

### CF-08 — No Accidental Data Loss

Workflow kompleks melindungi user dari kehilangan perubahan yang belum disimpan.

### CF-09 — Timezone Consistency

Tanggal dan waktu menggunakan aturan timezone sistem yang konsisten. Baseline default: `Asia/Jakarta`.

### CF-10 — Accessibility Baseline

State penting tidak boleh dikomunikasikan hanya menggunakan warna.

---

# 31. Feature Success Indicators

Metric detail dapat ditentukan kemudian, tetapi fitur seharusnya mengarah ke outcome berikut.

## Scheduling

- User dapat menemukan shift hari ini dengan sangat cepat.
- Scheduler dapat membuat jadwal satu periode tanpa input repetitif ekstrem.
- Perubahan published schedule dapat ditelusuri.
- Konflik dasar diketahui sebelum publish.

## Payroll

- Jumlah Shift 2 dan Shift 3 dapat ditelusuri dari source schedule.
- Payroll dapat dijelaskan per komponen.
- Payroll periode lama tetap stabil setelah configuration change.

## Usability

- Mobile tidak membutuhkan spreadsheet-like zoom untuk penggunaan harian.
- Desktop mampu menampilkan informasi padat tanpa kehilangan hierarchy.
- Action penting tidak tersembunyi dalam navigation yang tidak jelas.

## Reliability

- Tidak ada destructive operation penting tanpa guardrail.
- Audit event tersedia untuk mutation kritis.

---

# 32. Out of Scope for PRD-02

Dokumen ini **tidak** menetapkan secara final:

- formula exact payroll,
- jumlah jam minimum antarshift,
- aturan conflict exact,
- cara menghitung shift overnight terhadap tanggal payroll,
- prorate salary,
- overtime formula,
- holiday compensation formula,
- leave entitlement,
- database schema,
- endpoint API,
- framework/technology stack,
- detail visual component,
- exact navigation placement,
- exact role matrix.

Topik tersebut akan ditangani oleh PRD khusus berikutnya.

---

# 33. Dependencies on Future PRDs

## PRD-03 — Scheduling & Shift Business Logic

Mengunci:

- assignment rules,
- overnight semantics,
- conflicts,
- coverage,
- publish behavior,
- schedule state transitions,
- rotation/template logic.

## PRD-04 — Payroll, Salary & Incentive Logic

Mengunci:

- formula,
- eligible shift,
- incentive calculation,
- adjustments,
- payroll states,
- finalize/lock semantics,
- historical snapshot.

## PRD-05 — Attendance, Leave, Overtime & Schedule Exception

Mengunci request dan exception flow.

## PRD-06 — Information Architecture

Mengunci navigation dan page hierarchy.

## PRD-07 — Roles & Permissions

Mengunci actor authorization.

## PRD-08 — Data Model

Mengunci entity relationship dan persistence model.

## PRD-10 sampai PRD-13

Mengunci UI/UX, design system, mobile responsive behavior, dan visual polish.

---

# 34. Final Feature Principles

NOCScheduler harus membuat hal berikut terasa sederhana meskipun logic di belakangnya kompleks:

1. **Melihat jadwal.**
2. **Mengetahui siapa yang sedang bertugas.**
3. **Menyusun jadwal banyak orang.**
4. **Mengubah jadwal tanpa kehilangan histori.**
5. **Mengetahui jumlah setiap jenis shift.**
6. **Memahami insentif yang diperoleh.**
7. **Memahami dari mana payroll berasal.**
8. **Menjaga data bulan lalu tetap benar.**
9. **Mengetahui siapa yang mengubah sesuatu.**
10. **Melakukan semua pekerjaan sehari-hari dengan sesedikit mungkin friction.**

Produk harus terasa seperti **workspace operasional NOC modern**, bukan spreadsheet yang dipindahkan ke browser.

---

# 35. Document Status

**PRD-02 Status:** Draft — Ready for downstream logic specification.

Dokumen berikutnya yang direkomendasikan:

> **PRD-03 — Scheduling & Shift Business Logic**

PRD-03 akan menerjemahkan feature scheduling pada dokumen ini menjadi aturan deterministik mengenai shift, assignment, konflik, periode, overnight shift, coverage, schedule states, edit published schedule, template, copy, dan publish flow.
