# PRD-19 — QA, Testing & Acceptance Criteria

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — QA, Testing & Acceptance Criteria  
> **Document ID:** PRD-19  
> **Status:** Draft — Quality & Release Gate Source of Truth  
> **Depends On:** PRD-01 through PRD-18  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **QA strategy, automated testing layers, manual acceptance, regression policy, test-data strategy, browser/device matrix, visual regression, accessibility verification, security testing, performance testing, CI quality gates, flaky-test policy, defect severity, release criteria, dan Definition of Release Ready** untuk NOCScheduler.

PRD-19 menjadi source of truth untuk menjawab:

> **“Bagaimana kita membuktikan bahwa NOCScheduler benar secara business logic, aman, stabil, cepat, visually polished, accessible, dan siap dipakai operasional sebelum perubahan dirilis?”**

Testing tidak boleh hanya membuktikan bahwa halaman dapat dibuka.

NOCScheduler mengelola data yang memiliki dampak operasional dan finansial. Karena itu quality assurance harus membuktikan minimal:

- schedule tidak menghasilkan state yang salah,
- cross-midnight shift tidak salah tanggal,
- exception/replacement tidak menciptakan double work state,
- payroll tidak menghitung dua kali atau menggunakan tarif salah,
- historical payroll tidak drift,
- authorization tidak dapat dilewati dari direct request,
- audit evidence tetap tercatat,
- UI desktop dan mobile sama-sama usable,
- Light dan Dark Mode sama-sama polished,
- critical flow tetap bekerja pada browser target,
- regression penting ditangkap sebelum production.

---

# 2. Quality Vision

Target NOCScheduler bukan sekadar:

> **“tests pass.”**

Targetnya adalah:

> **Correct business behavior + trusted historical data + secure mutation + polished UX + predictable releases.**

Sebuah build tidak dianggap berkualitas jika hanya salah satu dimensi berikut yang terpenuhi.

```text
Business Correctness
+ Data Integrity
+ Authorization & Security
+ API Contract Stability
+ UI/UX Correctness
+ Responsive Fidelity
+ Visual Quality
+ Accessibility
+ Performance
+ Operational Reliability
```

---

# 3. Core QA Principles

## QA-P01 — Test the Rule Close to the Rule

Business rule harus terutama diuji pada layer tempat rule tersebut hidup.

Contoh:

`one employee, one primary work state per work_date`

harus memiliki domain/database test.

Jangan hanya mengandalkan satu Playwright test yang mengklik calendar.

---

## QA-P02 — E2E Proves Integration, Not Every Permutation

E2E digunakan untuk membuktikan bahwa:

- authentication,
- authorization,
- UI,
- API,
- domain service,
- database,
- audit,

terhubung secara benar.

E2E tidak boleh menjadi tempat seluruh combinatorial business logic diuji karena suite akan menjadi lambat dan rapuh.

---

## QA-P03 — Critical Financial Logic Requires Deterministic Regression Tests

Payroll formula, rate selection, manual adjustment, finalization, locking, recalculation, dan historical snapshot harus memiliki deterministic regression tests.

Input sama harus menghasilkan output sama.

---

## QA-P04 — Database Constraints Are Tested Contracts

Constraint penting harus memiliki integration/database contract test.

Contoh:

- duplicate primary assignment ditolak,
- duplicate payroll record ditolak,
- invalid foreign key ditolak,
- overlapping effective compensation version ditolak atau dicegah service/DB policy,
- historical referenced data tidak cascade-delete.

---

## QA-P05 — Security Must Be Tested From an Adversarial Client

Security test tidak boleh hanya memeriksa apakah tombol tersembunyi.

Test harus mencoba:

- crafted HTTP request,
- resource ID milik employee lain,
- missing/expired session,
- modified actor ID,
- stale expectedVersion,
- reused idempotency key,
- invalid origin/CSRF context,
- unauthorized command endpoint.

---

## QA-P06 — Desktop and Mobile Are Separate Acceptance Targets

Flow yang lolos desktop belum otomatis lolos mobile.

Critical flow P0/P1 harus memiliki acceptance desktop dan mobile.

---

## QA-P07 — Light and Dark Are Separate Visual Targets

Light default tidak berarti Dark Mode boleh untested.

Critical page/surface harus memiliki visual coverage untuk kedua theme.

---

## QA-P08 — Test States, Not Only Happy Paths

Setiap critical surface harus diuji terhadap state relevan:

- populated,
- empty,
- loading,
- validation error,
- server error,
- permission denied,
- stale/concurrency conflict,
- dirty/outdated,
- finalized,
- locked.

---

## QA-P09 — Flaky Tests Are Defects

Test flaky bukan sesuatu yang boleh dibiasakan.

Repeated retry yang menyembunyikan race condition tidak dianggap solusi.

---

## QA-P10 — Release Confidence Comes From Multiple Independent Signals

Tidak ada satu metric tunggal seperti coverage percentage yang dapat membuktikan readiness.

Release membutuhkan kombinasi:

- passing automated suites,
- required visual acceptance,
- required manual exploratory checks,
- migration verification,
- security gate,
- no unresolved release-blocking defect.

---

# 4. Testing Pyramid / Layer Model

Recommended testing layers:

```text
               Manual Exploratory / UAT
                       ▲
                Visual Acceptance
                       ▲
                     E2E
                       ▲
          API / Integration / Database
                       ▲
             Domain / Unit / Contract
                       ▲
               Static Quality Gates
```

Jumlah test ideal lebih banyak pada layer bawah daripada E2E.

---

# 5. Static Quality Gates

## 5.1 TypeScript

Project wajib menggunakan strict TypeScript sesuai PRD-14.

CI harus gagal pada type error.

Dilarang menormalkan `any` atau unsafe cast sebagai cara rutin menghindari typing problem.

---

## 5.2 Lint

Lint wajib memeriksa minimal:

- correctness rule,
- React hook usage,
- dead/unreachable patterns bila tooling mendukung,
- import hygiene,
- unsafe anti-pattern yang sudah disepakati.

Warning yang sengaja diizinkan harus documented dan tidak terus bertambah tanpa review.

---

## 5.3 Formatting

Formatting harus deterministic.

CI dapat memverifikasi repository sudah formatted tanpa mengubah file secara otomatis di production pipeline.

---

## 5.4 Build Gate

Production build harus berhasil sebelum merge/release.

Build error, invalid environment schema, server/client boundary error, atau static rendering error adalah blocking.

---

# 6. Unit & Domain Logic Testing

Baseline tool: **Vitest**.

Unit/domain test diprioritaskan untuk pure atau near-pure business logic.

## 6.1 Scheduling Domain

Wajib memiliki coverage untuk minimal:

- work_date mengikuti tanggal mulai shift,
- cross-midnight start/end calculation,
- S1/S2/S3 configurable times,
- OFF berbeda dari Unassigned,
- one primary state per employee/work_date,
- overlap detection berdasarkan datetime interval,
- minimum rest validation,
- consecutive shift/night rules bila aktif,
- severity Error/Warning/Info,
- warning override behavior,
- coverage calculation,
- draft vs published behavior,
- validation preview result,
- schedule revision semantics.

---

## 6.2 Exception Domain

Wajib menguji:

- lifecycle DRAFT/PENDING/APPROVED/REJECTED/CANCELLED/SUPERSEDED,
- leave/sick/permission/training/business duty,
- replacement relation,
- shift swap atomic result,
- overtime tidak menjadi primary work state,
- approved exception mengubah effective operational state secara benar,
- original dan replacement tidak double-count incentive secara default,
- retroactive correction behavior.

---

## 6.3 Payroll Domain

Payroll regression suite adalah P0.

Minimum tests:

- base salary selection berdasarkan effective date,
- S1 incentive default 0,
- S2/S3 incentive rate selection,
- rate change di tengah periode,
- cross-midnight assignment dihitung sekali,
- unpublished draft tidak payable,
- approved exception menggugurkan shift incentive bila shift tidak dikerjakan sesuai rule,
- replacement source attribution,
- manual positive adjustment,
- manual deduction,
- recalculation mempertahankan manual adjustment,
- missing base salary blocking,
- missing incentive configuration blocking,
- integer IDR arithmetic,
- deterministic calculation,
- OPEN → CALCULATED → FINALIZED → LOCKED transition,
- dirty/outdated state setelah eligible source berubah,
- locked payroll immutable,
- unlock reason/permission path,
- historical payroll tidak berubah akibat future rate update.

---

## 6.4 Authorization Domain

Test capability service minimal:

- deny by default,
- SELF/TEAM/ALL scope,
- NOC Member baseline,
- Scheduler/Supervisor baseline,
- Administrator baseline,
- mutation permission terpisah dari read,
- no self privilege escalation,
- last administrator guard,
- disabled user denied,
- payroll unlock dedicated permission.

---

## 6.5 Notification Policy

Minimum domain tests:

- recipient resolution,
- actor suppression untuk routine own action,
- schedule change recipient,
- request approval/rejection recipient,
- replacement/swap recipients,
- coverage warning targeting,
- payroll notification lifecycle,
- grouping,
- deduplication,
- staleness/resolution,
- deep-link generation.

---

# 7. Database & Repository Integration Testing

Database test harus menggunakan PostgreSQL behavior yang representatif dengan production.

SQLite substitute tidak boleh digunakan untuk membuktikan PostgreSQL-specific integrity rule.

## 7.1 Required Database Contracts

Wajib menguji:

- foreign keys,
- unique constraints,
- indexes yang critical bila query plan menjadi concern,
- transaction rollback,
- optimistic concurrency,
- schedule publication atomicity,
- swap atomicity,
- payroll calculate/finalize/lock atomicity,
- audit event durability pada high-risk transaction,
- effective-dated version persistence,
- historical references,
- no destructive cascade pada critical historical data.

---

## 7.2 Transaction Failure Injection

Critical transaction harus memiliki test yang mensimulasikan kegagalan di tengah flow bila practical.

Contoh:

```text
Payroll revision created
→ payroll items partially generated
→ injected failure
```

Expected:

```text
transaction rollback
→ no partial payroll revision/item state
```

---

# 8. API Contract Testing

API tests harus mengacu PRD-15.

## 8.1 Schema Tests

Test minimal:

- valid payload accepted,
- malformed payload rejected,
- unknown/unsafe fields tidak mass-assigned,
- invalid enum rejected,
- invalid money representation rejected,
- invalid workDate rejected,
- filter/sort allowlist enforced.

---

## 8.2 Error Contract

Stable error code harus diuji.

Minimal categories:

- unauthenticated,
- forbidden,
- validation failed,
- business rule conflict,
- concurrency conflict,
- not found,
- idempotency conflict,
- locked resource,
- internal error fallback.

Frontend tidak boleh membutuhkan parsing message string untuk menentukan behavior.

---

## 8.3 Idempotency

Critical command harus memiliki contract test:

```text
same idempotency key + same payload
→ same business outcome
→ no duplicate side effect
```

Different payload dengan key yang sama harus ditolak sesuai contract.

---

## 8.4 Optimistic Concurrency

Test:

```text
Client A reads version 4
Client B mutates → version 5
Client A sends expectedVersion 4
```

Expected:

`CONCURRENCY_CONFLICT`, bukan silent overwrite.

---

# 9. Authentication & Security Testing

Security QA mengikuti PRD-16.

## 9.1 Authentication Tests

Minimum:

- valid login,
- invalid login,
- disabled account,
- expired session,
- logout/session revocation,
- malformed session,
- secure authentication error behavior.

---

## 9.2 Authorization Matrix Tests

Setiap high-risk command wajib diuji minimal terhadap:

- allowed actor,
- authenticated but forbidden actor,
- unauthenticated request.

High-risk commands termasuk:

- publish schedule,
- correction published schedule,
- approve/reject request,
- salary mutation,
- incentive mutation,
- payroll calculate,
- payroll adjustment,
- finalize,
- lock,
- unlock,
- access/role change.

---

## 9.3 Object-Level Authorization

Test harus mencoba mengganti resource ID langsung.

Contoh self-service request:

User A tidak boleh mengganti payload/URL agar request dibuat seolah milik User B kecuali memiliki permission `ALL` yang sah.

---

## 9.4 CSRF / Origin / Request Integrity

Protected cookie-authenticated mutation harus diuji terhadap origin yang tidak dipercaya sesuai implementation strategy.

Security control production tidak boleh disable untuk membuat test lewat.

---

## 9.5 XSS / Injection

User-controlled text seperti note/reason harus diuji dengan payload berbahaya dan tetap dirender sebagai inert text.

Database query harus diuji dengan malformed search/filter input untuk memastikan parameterization/allowlist bekerja.

---

## 9.6 Security Headers

Deployment test harus memeriksa critical security headers yang diwajibkan PRD-16.

---

# 10. Component & Interaction Testing

Testing Library digunakan bila component behavior cukup kompleks untuk layak diuji terisolasi.

Prioritas component tests:

- Select/Combobox keyboard behavior,
- Dialog focus management,
- Drawer/Bottom Sheet close behavior,
- Segmented control,
- validation summary,
- schedule cell state,
- bulk selection state,
- payroll breakdown expansion,
- notification unread/read behavior,
- permission-aware action rendering,
- locked/read-only presentation.

Component test tidak menggantikan browser E2E untuk layout/focus behavior critical.

---

# 11. End-to-End Testing

Baseline tool: **Playwright**.

Critical E2E harus menggunakan real application boundary dan test database.

Mocking boleh digunakan untuk isolated error simulation, tetapi happy-path critical flow harus melewati backend nyata.

## 11.1 P0 E2E Flows

### E2E-01 — Login and Personal Schedule

```text
Login
→ Dashboard
→ My Schedule
→ open assignment detail
```

Validasi role/session dan jadwal personal.

### E2E-02 — Create and Publish Schedule

```text
Scheduler login
→ Manage Schedule
→ edit draft
→ validate
→ review warning/error
→ publish
→ published schedule visible to member
→ audit/history available
```

### E2E-03 — Cross-Midnight Shift

Shift 3 pada tanggal X harus tetap tampil/terhitung sebagai `work_date = X` walau selesai X+1.

### E2E-04 — Request Approval

```text
Member creates request
→ Supervisor sees pending
→ approve
→ effective schedule updates
→ member notification appears
```

### E2E-05 — Replacement / Shift Swap

Verifikasi atomic source/result dan affected employees.

### E2E-06 — Payroll Calculation

```text
Published schedule
→ configured salary/incentive
→ calculate payroll
→ review employee breakdown
→ component quantity/rate/source dates correct
```

### E2E-07 — Payroll Finalize and Lock

```text
CALCULATED
→ FINALIZED
→ LOCKED
→ normal mutation rejected
```

### E2E-08 — Payroll Historical Stability

Setelah payroll locked, ubah future salary/incentive configuration dan pastikan locked historical payroll tidak berubah.

### E2E-09 — Permission Boundary

Member mencoba direct protected route/API mutation dan ditolak.

### E2E-10 — Notification Deep Link

Notification membuka source/context yang benar dan mempertahankan authorization.

---

# 12. Responsive Functional QA

Critical flows wajib diuji pada responsive composition yang berbeda.

Minimum functional viewport set:

- 390×844 representative mobile,
- 768×1024 tablet/adaptive,
- 1280×800 compact desktop,
- 1440×900 canonical desktop.

Tambahan visual viewport mengikuti PRD-12/13.

## Mobile-specific acceptance

Wajib memeriksa:

- bottom navigation tidak menutup content,
- safe-area benar,
- sticky CTA tidak tertutup keyboard,
- form active field tetap terlihat,
- bottom sheet scroll/focus benar,
- no page-level horizontal overflow,
- schedule horizontal surface tidak mengunci vertical scroll,
- one-hand primary action reachable,
- touch target layak,
- orientation change tidak merusak state penting.

---

# 13. Browser Matrix

Baseline release browser matrix:

### Desktop

- Chromium-based current stable,
- Firefox current stable,
- Safari/WebKit current stable.

### Mobile

- Mobile Chromium representative,
- Mobile Safari/WebKit representative.

Playwright projects minimal:

```text
chromium
firefox
webkit
mobile-chromium
mobile-webkit
```

Tidak semua test harus berjalan di semua project pada setiap commit jika runtime terlalu mahal.

Namun release gate critical E2E harus memiliki cross-engine confidence.

---

# 14. Visual Regression & Screenshot QA

Visual testing mengikuti PRD-13.

## 14.1 Automated Visual Regression

Gunakan Playwright screenshot assertions untuk stable critical surfaces.

Baseline screenshot targets:

- Dashboard,
- My Schedule,
- Team Schedule,
- Manage Schedule,
- Request detail,
- Employees,
- Payroll overview,
- Payroll detail,
- Reports,
- Notification Center,
- Settings,
- Login.

---

## 14.2 Required Visual Dimensions

Critical page harus memiliki representative coverage untuk:

- Light Mode,
- Dark Mode,
- desktop,
- mobile,
- realistic populated data.

State-specific screenshot ditambahkan untuk surface berisiko:

- empty,
- loading,
- error,
- validation warning,
- locked,
- permission denied.

---

## 14.3 Screenshot Stability

Visual test harus mengontrol:

- animation completion/reduced motion,
- deterministic fixtures,
- font readiness,
- current-time dependent content,
- random IDs/avatar values bila visible.

Jangan memperbesar threshold sampai visual regression kehilangan fungsi.

---

## 14.4 Manual Pixel Polish Review

Automated screenshot diff tidak menggantikan human review untuk:

- spatial hierarchy,
- optical alignment,
- perceived density,
- typography balance,
- motion feel,
- mobile ergonomics.

Critical UI milestone harus melewati screenshot review desktop + mobile.

---

# 15. Accessibility QA

Accessibility bukan test terakhir.

## 15.1 Automated

Gunakan axe-style automated checks pada critical pages/components.

Target minimal:

- no serious/critical automated violation pada release-critical flow,
- violations yang dikecualikan harus documented dan punya alasan.

---

## 15.2 Keyboard Manual QA

Wajib memeriksa:

- tab order,
- focus-visible,
- dialog focus trap,
- escape close bila appropriate,
- dropdown/combobox keyboard behavior,
- schedule keyboard navigation bila disediakan,
- no keyboard trap,
- action dapat dijangkau tanpa pointer untuk desktop-critical workflow.

---

## 15.3 Zoom & Reflow

Critical user flows harus tetap usable pada browser zoom sampai 200% sesuai visual/accessibility contract.

---

## 15.4 Reduced Motion

`prefers-reduced-motion` harus diuji agar animation non-essential berkurang tanpa kehilangan state communication.

---

# 16. Performance QA

Performance harus diukur pada representative realistic dataset, bukan database kosong.

## 16.1 Dataset Profiles

Minimal fixture profiles:

- Small: 10 employees × 1 month,
- Normal: 30 employees × 12 months history,
- Stress: 100 employees × multi-year representative history untuk query/pagination benchmark.

Stress dataset bukan klaim expected production size; digunakan untuk mendeteksi desain query buruk.

---

## 16.2 Performance Acceptance Direction

Exact production SLO dapat difinalisasi PRD-20, tetapi baseline QA target:

- normal navigation terasa responsive,
- schedule grid interaction tidak janky pada target normal dataset,
- monthly payroll read tidak melakukan N+1 query pathological,
- report pagination/filter tidak load seluruh history ke browser,
- dashboard tidak melakukan dozens of redundant client requests,
- large table/list memakai pagination/virtualization bila dibutuhkan.

---

## 16.3 Regression Budget

Performance-critical route/query dapat memiliki benchmark budget.

Perubahan signifikan yang memperburuk response/query/render time harus ditinjau sebelum merge.

Jangan mengejar microbenchmark yang tidak berkorelasi dengan user experience.

---

# 17. Test Data & Fixture Strategy

## 17.1 Deterministic Seed

Automated suites harus menggunakan deterministic seed/fixture.

Fixture tidak boleh bergantung pada manual production-like database yang berubah sendiri.

---

## 17.2 Canonical Personas

Minimum test actors:

- `member-a`,
- `member-b`,
- `scheduler`,
- `admin`,
- `disabled-user`.

Permission fixture harus eksplisit.

---

## 17.3 Canonical Scheduling Fixtures

Harus tersedia fixture untuk:

- normal S1/S2/S3 month,
- cross-midnight S3,
- OFF,
- Unassigned,
- under-coverage,
- warning override,
- leave/sick,
- replacement,
- swap,
- overtime.

---

## 17.4 Canonical Payroll Fixtures

Harus tersedia:

- normal salary,
- S2/S3 rate,
- rate change mid-period,
- manual earning,
- manual deduction,
- missing configuration,
- dirty payroll,
- finalized payroll,
- locked historical payroll.

Golden expected values harus explicit dan reviewable.

---

## 17.5 Time Control

Test yang bergantung waktu harus menggunakan controlled clock/time abstraction.

Jangan membuat test flaky berdasarkan waktu mesin CI.

Timezone default fixture: `Asia/Jakarta`.

---

# 18. Test Isolation & Database Lifecycle

Tests harus independen dan dapat dijalankan ulang.

Recommended approaches:

- isolated test database/schema per suite/worker bila practical,
- transaction rollback untuk integration tests yang cocok,
- deterministic reset/seed untuk E2E,
- unique fixture IDs bila parallel execution digunakan.

Test tidak boleh bergantung pada execution order kecuali suite secara eksplisit serial karena satu business flow.

---

# 19. Flaky Test Policy

## 19.1 Definition

Test dianggap flaky jika dengan code/input yang sama menghasilkan pass/fail non-deterministic.

---

## 19.2 Rules

- Retry boleh membantu diagnosis tetapi tidak boleh menyembunyikan flake permanen.
- Flaky critical test harus diperbaiki sebelum release.
- Quarantine hanya temporary, punya issue/owner/reason.
- Jangan gunakan arbitrary sleep untuk sinkronisasi jika event/state dapat ditunggu secara deterministic.
- Visual flakes harus dicari penyebabnya: animation, font, clock, random data, layout instability.

---

# 20. Test Coverage Policy

Code coverage adalah signal, bukan goal tunggal.

Baseline:

- critical domain modules harus memiliki high meaningful branch coverage,
- payroll/scheduling/authorization tidak boleh memiliki branch bisnis penting tanpa test,
- repository-wide percentage tidak boleh mendorong meaningless tests.

Coverage regression pada critical module harus dibahas dalam review.

Mutation testing dapat dievaluasi post-MVP untuk payroll/domain rules bila memberi value.

---

# 21. Defect Severity

Gunakan severity lintas functional + visual + security.

## P0 — Release Blocker

Contoh:

- payroll salah nominal,
- unauthorized payroll/schedule mutation,
- historical data corruption,
- schedule publish partial,
- login/authentication broken untuk semua user,
- app unusable pada target platform,
- critical data loss,
- page-level overflow yang menutup critical CTA pada mobile,
- production secret exposure.

## P1 — Critical

Contoh:

- major workflow gagal tanpa workaround aman,
- incorrect coverage/effective schedule,
- notification salah recipient untuk event sensitif operasional,
- significant desktop/mobile layout break,
- Dark Mode unreadable pada critical page,
- concurrency guard tidak bekerja.

## P2 — Major

Contoh:

- secondary flow broken,
- visual inconsistency jelas,
- export formatting issue tetapi angka benar,
- non-critical accessibility violation,
- performance regression terasa tetapi workflow tetap dapat digunakan.

## P3 — Minor

Contoh:

- cosmetic polish kecil,
- wording typo,
- alignment kecil pada non-repeated/non-critical decorative surface.

Catatan: repeated alignment defect dapat naik severity sesuai PRD-13.

---

# 22. CI Pipeline Quality Gates

Recommended PR pipeline:

```text
Install (frozen lockfile)
→ Static / dependency sanity
→ Format check
→ Lint
→ Typecheck
→ Unit/domain tests
→ Integration/database tests
→ API/authz contract tests
→ Build
→ Critical E2E Chromium
→ Accessibility smoke
→ Visual smoke / changed critical surfaces
```

Release/main pipeline dapat memperluas ke:

```text
Cross-browser E2E
+ broader visual regression
+ migration verification
+ security checks
+ performance smoke
```

Exact GitHub Actions workflow ditentukan saat implementation.

---

# 23. Pull Request Quality Gate

PR yang mengubah behavior critical harus menyertakan test yang sesuai.

Examples:

- payroll rule changed → payroll regression updated,
- permission changed → authorization matrix updated,
- schedule validation changed → domain/API tests updated,
- shared component changed → component/visual regression reviewed,
- schema changed → migration + DB contract updated.

`No test because change is small` bukan default justification untuk critical domain.

---

# 24. Migration QA

Setiap migration wajib diverifikasi terhadap:

- fresh database migration from zero/baseline,
- upgrade path dari previous schema,
- existing representative data,
- rollback/recovery plan jika migration destructive/high-risk,
- application compatibility selama deployment sequence bila relevant.

Data backfill harus memiliki validation query/test untuk memastikan row yang seharusnya terisi benar-benar terisi.

---

# 25. Export QA

CSV/XLSX export harus diuji untuk:

- angka sesuai report canonical,
- applied filters sesuai UI,
- timezone/date benar,
- money numeric formatting benar,
- long text,
- Unicode/name Indonesia,
- formula injection defense,
- deterministic column semantics,
- no accidental hidden sensitive technical field.

---

# 26. Notification QA

Selain domain policy test, E2E/integration harus memverifikasi:

- unread count,
- mark read tidak resolve source,
- deep link,
- dedup/grouping,
- stale/resolved behavior,
- permission tetap berlaku setelah deep-link,
- actor tidak menerima routine duplicate notification,
- notification failure tidak membatalkan canonical transaction bila delivery asynchronous/non-critical.

---

# 27. Audit & Historical QA

Critical mutation harus diuji menghasilkan audit evidence yang benar.

Minimum assertions:

- event type,
- actor,
- subject/resource,
- occurred_at,
- before/after relevant fields,
- reason saat mandatory,
- correlation_id untuk multi-record operation.

Audit tidak boleh mengandung password/token/secret fixture.

---

# 28. Manual Exploratory QA

Automation tidak menggantikan exploratory testing.

Sebelum major release, lakukan scenario-driven manual exploration pada area:

- schedule bulk editing,
- long month/employee matrix,
- mobile one-hand navigation,
- virtual keyboard forms,
- complex request/replacement flow,
- payroll drill-down trustworthiness,
- Light/Dark visual consistency,
- navigation state preservation,
- concurrent browser sessions.

Exploratory QA harus mencoba perilaku yang tidak tercakup scripted happy path.

---

# 29. User Acceptance Testing

Karena produk internal NOC, pre-production acceptance idealnya melibatkan representative user:

- NOC Member,
- Scheduler/Supervisor,
- Administrator/payroll-capable actor.

UAT fokus pada:

- apakah workflow masuk akal,
- apakah informasi mudah ditemukan,
- apakah jadwal mudah disusun,
- apakah warning dapat dipahami,
- apakah payroll dapat dijelaskan,
- apakah mobile nyaman digunakan,
- apakah terminology cocok dengan operasi NOC nyata.

Feedback UAT tidak otomatis mengubah business rule; perubahan rule harus kembali ke source PRD yang relevan.

---

# 30. Release Candidate Acceptance Matrix

Release candidate minimal harus membuktikan:

| Area | Required |
|---|---|
| Typecheck | PASS |
| Lint | PASS |
| Build | PASS |
| Unit/domain critical | PASS |
| Database/integration | PASS |
| API contract | PASS |
| Authorization/security critical | PASS |
| Scheduling regression | PASS |
| Payroll regression | PASS |
| Critical E2E | PASS |
| Desktop acceptance | PASS |
| Mobile acceptance | PASS |
| Light visual acceptance | PASS |
| Dark visual acceptance | PASS |
| Accessibility critical flow | PASS |
| Migration verification | PASS bila schema berubah |
| Critical security checks | PASS |
| P0 defects | 0 open |
| P1 defects | 0 open untuk production release kecuali explicit exceptional decision |

---

# 31. Definition of Feature Done

Sebuah feature belum Done sampai:

1. acceptance criteria feature terpenuhi,
2. business/domain tests ditambahkan,
3. API/integration tests ditambahkan bila relevant,
4. permission behavior diuji,
5. audit behavior diuji bila mutation critical,
6. loading/error/empty state ditangani,
7. desktop diuji,
8. mobile diuji,
9. Light Mode diuji,
10. Dark Mode diuji,
11. accessibility dasar diuji,
12. visual polish mengikuti PRD-13,
13. no blocking regression,
14. documentation/PRD contract diperbarui jika semantics berubah.

---

# 32. Definition of Release Ready

Build dianggap **Release Ready** hanya jika:

1. seluruh required CI gate hijau,
2. deterministic critical tests hijau tanpa unresolved flake,
3. critical E2E hijau,
4. release browser matrix memiliki confidence yang cukup,
5. payroll regression hijau,
6. scheduling regression hijau,
7. authorization regression hijau,
8. database contract hijau,
9. migration sudah diuji jika ada,
10. no P0 defect,
11. no unresolved P1 untuk production release normal,
12. critical desktop visual acceptance approved,
13. critical mobile visual acceptance approved,
14. Light/Dark parity approved,
15. accessibility critical path tidak memiliki blocker,
16. security gate tidak menemukan release-blocking issue,
17. backup/rollback/deployment readiness PRD-20 terpenuhi,
18. test fixtures dan test results dapat direproduksi,
19. release notes/migration note tersedia bila diperlukan,
20. product owner/authorized internal stakeholder menerima release scope.

---

# 33. Canonical Critical Regression Matrix

## REG-01 — Cross-Midnight Work Date

S3 31 Aug 23:00 → 1 Sep tetap masuk `work_date = 31 Aug` dan payroll Agustus.

## REG-02 — OFF vs Unassigned

OFF explicit tidak boleh tampil/terhitung sebagai missing schedule.

## REG-03 — Duplicate Primary State

Employee/work_date tidak boleh memiliki dua primary state canonical.

## REG-04 — Draft Is Not Payable

Draft shift tidak menghasilkan incentive.

## REG-05 — Published Is Payable Source

Published eligible shift menjadi source payroll.

## REG-06 — Effective Rate

Assignment memakai rate yang berlaku pada work_date.

## REG-07 — Historical Rate Stability

Future rate change tidak mengubah historical locked payroll.

## REG-08 — Replacement No Double Incentive

Original absent employee dan replacement tidak sama-sama mendapat incentive tanpa explicit rule.

## REG-09 — Recalculation Preserves Manual Adjustment

Generated item boleh direbuild; manual item tetap.

## REG-10 — Locked Payroll Immutable

Normal mutation terhadap locked payroll ditolak.

## REG-11 — Authorization Direct API

UI hidden dan direct crafted request menghasilkan authorization yang sama.

## REG-12 — Concurrency

Stale expectedVersion tidak overwrite latest data.

## REG-13 — Idempotency

Double-submit command tidak menggandakan effect.

## REG-14 — Audit Evidence

High-risk successful mutation memiliki audit evidence durable.

## REG-15 — Notification Source

Notification deep-link menunjuk canonical source yang benar.

---

# 34. QA Business Rules

## QA-001
Semua critical business rule harus memiliki automated regression coverage.

## QA-002
Payroll calculation suite adalah release-blocking.

## QA-003
Scheduling core-rule suite adalah release-blocking.

## QA-004
Authorization high-risk suite adalah release-blocking.

## QA-005
Type errors memblokir merge/release.

## QA-006
Production build failure memblokir merge/release.

## QA-007
Database migration harus versioned dan diuji.

## QA-008
Critical DB invariant tidak boleh hanya diuji melalui UI.

## QA-009
High-risk command harus diuji transactional.

## QA-010
High-risk command dengan idempotency harus memiliki duplicate-submit test.

## QA-011
Mutable critical resource harus memiliki stale-version test.

## QA-012
Draft schedule tidak boleh menjadi payroll source.

## QA-013
Cross-midnight behavior harus memiliki regression test.

## QA-014
OFF dan Unassigned harus memiliki regression test terpisah.

## QA-015
Compensation effective dating harus memiliki boundary-date tests.

## QA-016
Payroll historical stability harus diuji setelah config berubah.

## QA-017
Locked payroll mutation harus diuji ditolak.

## QA-018
Manual adjustment persistence across recalculation harus diuji.

## QA-019
Replacement/swap harus memiliki atomicity tests.

## QA-020
Exception approval harus memiliki effective-state tests.

## QA-021
Permission test harus mencakup allowed, forbidden, dan unauthenticated actor.

## QA-022
Self-service endpoint harus memiliki object-level authorization tests.

## QA-023
Disabled user tidak boleh lolos protected request.

## QA-024
Last administrator guard harus diuji.

## QA-025
Security tidak boleh bergantung pada hidden UI.

## QA-026
User-controlled text harus memiliki XSS-safe rendering test.

## QA-027
Filter/sort input harus memiliki allowlist tests.

## QA-028
Critical security headers harus diverifikasi pada deployment target.

## QA-029
Audit serializer tidak boleh menyimpan secret.

## QA-030
High-risk mutation harus menghasilkan expected audit event.

## QA-031
Notification recipient resolution harus diuji.

## QA-032
Notification dedup/grouping harus diuji.

## QA-033
Notification deep-link harus diuji.

## QA-034
Read notification tidak boleh dianggap source resolved.

## QA-035
Report critical metrics harus reconcile dengan canonical source.

## QA-036
Payroll report total harus reconcile dengan employee payroll records.

## QA-037
Export harus menggunakan filter yang sama dengan report view.

## QA-038
CSV/XLSX formula injection defense harus diuji.

## QA-039
Critical desktop flows harus memiliki browser E2E coverage.

## QA-040
Critical mobile flows harus memiliki mobile E2E/acceptance coverage.

## QA-041
Page-level accidental horizontal overflow adalah blocking visual defect pada critical flow.

## QA-042
Light and Dark critical pages harus diuji independen.

## QA-043
Visual regression harus menggunakan deterministic fixture.

## QA-044
Shared component visual change harus regression-check consumers yang relevan.

## QA-045
Loading/empty/error state harus diuji untuk critical surfaces.

## QA-046
Virtual keyboard tidak boleh menutup critical CTA.

## QA-047
Bottom navigation/safe-area collision harus diuji mobile.

## QA-048
No keyboard trap pada critical desktop workflow.

## QA-049
Critical flow harus usable pada 200% zoom.

## QA-050
Reduced-motion behavior harus diuji.

## QA-051
Flaky release-blocking test harus diperbaiki atau release dihentikan.

## QA-052
Arbitrary sleeps tidak boleh menjadi default synchronization strategy.

## QA-053
Automated retry tidak boleh digunakan untuk menyembunyikan defect deterministic.

## QA-054
Test fixture harus deterministic dan timezone-aware.

## QA-055
Current-time dependent test harus menggunakan controlled time abstraction.

## QA-056
Test order dependency dilarang kecuali flow serial eksplisit.

## QA-057
P0 defect selalu memblokir production release.

## QA-058
P1 defect memblokir normal production release kecuali exceptional documented decision.

## QA-059
Feature belum Done jika mobile atau Dark Mode belum memenuhi acceptance yang relevan.

## QA-060
Release Ready membutuhkan technical, functional, security, visual, accessibility, dan operational evidence secara bersamaan.

---

# 35. Critical Acceptance Test Matrix

| Test | Scenario | Expected |
|---|---|---|
| TST-01 | Valid member login | Dashboard tampil sesuai user |
| TST-02 | Disabled user login/session | Access ditolak |
| TST-03 | Member direct schedule publish API | 403/forbidden contract |
| TST-04 | Scheduler creates draft | Draft tersimpan |
| TST-05 | Publish invalid schedule | Blocking validation mencegah publish |
| TST-06 | Publish valid schedule | Atomic published version + audit |
| TST-07 | S3 crosses midnight | Single assignment, correct work_date |
| TST-08 | Duplicate primary state | Rejected |
| TST-09 | Member submits leave | Pending request correct owner |
| TST-10 | Member crafts another employee ID | Rejected |
| TST-11 | Supervisor approves request | Effective state updated |
| TST-12 | Shift swap | Atomic two-sided outcome |
| TST-13 | Replacement | Correct coverage and incentive source |
| TST-14 | Calculate payroll | Deterministic expected THP |
| TST-15 | Missing salary config | Blocking error, not Rp0 silently |
| TST-16 | Mid-period incentive change | Correct per-date rates |
| TST-17 | Recalculate payroll | Manual adjustment preserved |
| TST-18 | Finalize payroll | Correct lifecycle state |
| TST-19 | Lock payroll | Immutable normal workflow |
| TST-20 | Future config changed | Locked historical payroll unchanged |
| TST-21 | Stale expectedVersion | Concurrency conflict |
| TST-22 | Duplicate idempotency request | No duplicate effect |
| TST-23 | Schedule changed notification | Correct affected recipient/deep-link |
| TST-24 | Repeated coverage warning | Grouped/deduplicated |
| TST-25 | Report S3 quantity drill-down | Source dates reconcile |
| TST-26 | Payroll report total | Reconciles employee payroll |
| TST-27 | XLSX/CSV hostile formula text | Safely escaped/handled |
| TST-28 | Mobile critical schedule flow | No overflow/collision, usable touch flow |
| TST-29 | Dark Mode payroll/detail | Readable and hierarchy preserved |
| TST-30 | High-risk mutation audit | Actor/before/after/reason/correlation correct |

---

# 36. Recommended Test File Organization

Conceptual structure:

```text
src/
  modules/
    schedule/
      __tests__/
    payroll/
      __tests__/
    authorization/
      __tests__/
    notifications/
      __tests__/

tests/
  integration/
  api/
  security/
  e2e/
  visual/
  accessibility/
  fixtures/
  helpers/
```

Exact path dapat mengikuti final application structure, tetapi domain tests harus tetap dekat dengan ownership boundary.

---

# 37. Recommended Implementation Phases

## QA-F0 — Foundation

- Vitest config,
- test database strategy,
- deterministic seed,
- static gates,
- basic CI.

## QA-F1 — Core Domain Protection

- scheduling regression,
- payroll regression,
- authorization,
- database contracts,
- API contracts.

## QA-F2 — Product Flow Protection

- Playwright critical E2E,
- mobile projects,
- accessibility smoke,
- audit/notification flow.

## QA-F3 — High-Fidelity & Release Hardening

- visual regression,
- cross-browser,
- performance baseline,
- migration gates,
- expanded security tests,
- release dashboard/reporting.

---

# 38. Final Quality Contract

NOCScheduler tidak boleh menggunakan pola:

> **“deploy dulu, nanti user yang menemukan bug.”**

Quality strategy harus membuat regression penting gagal **sebelum** perubahan mencapai operasional.

Urutan kepercayaan yang diinginkan:

```text
Business Rule
→ Automated Regression
→ Integration Contract
→ E2E Proof
→ Visual/Accessibility Acceptance
→ Security Verification
→ Release Gate
→ Production
```

PRD-19 bersama PRD-20 menjadi final release-control layer di atas seluruh product, business, design, architecture, API, security, reporting, dan notification contract NOCScheduler.
