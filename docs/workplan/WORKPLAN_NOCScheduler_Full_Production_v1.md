# NOCScheduler — Master Workplan: Project Setup to Final Production

> **Document Type:** Master Execution Workplan  
> **Workplan ID:** WORKPLAN-NOCSCHEDULER-V1  
> **Status:** Approved Execution Baseline  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Created:** 2026-08-13  
> **Product PRD Set:** PRD-01 through PRD-22  
> **Canonical Platform Source:** PRD-22 — TypeScript, TSX, Node.js, Vite, Tailwind & Firebase Managed Platform Rebaseline  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Theme Requirement:** Light + Dark parity  
> **Target:** Desktop Web + Mobile Web with equal product priority

---

# 1. Purpose

Dokumen ini adalah **master workplan eksekusi** NOCScheduler dari repository yang baru memiliki dokumentasi/PRD sampai aplikasi benar-benar siap, deployed, dipakai, dipantau, dan dinyatakan **Final Production Ready**.

Workplan ini menjawab:

> **“Apa urutan kerja yang harus dilakukan, dependency antarphase apa, kapan sebuah phase dianggap selesai, dan gate apa yang harus dilewati sebelum masuk production?”**

Workplan tidak menggantikan detail requirement pada PRD. Jika ada konflik requirement produk/business, PRD terkait tetap menjadi source of truth. Untuk konflik platform/stack, **PRD-22 selalu menang**.

Workplan ini sengaja disusun berdasarkan **dependency dan risiko domain**, bukan sekadar urutan halaman.

---

# 2. Canonical Technology Baseline

Seluruh implementation phase menggunakan baseline berikut:

```text
Frontend
  TypeScript / TSX — strict mode
  React
  Vite
  React Router
  Tailwind CSS
  semantic CSS design tokens
  TanStack Query
  TanStack Table
  TanStack Virtual
  React Hook Form
  Zod
  accessible headless UI primitives
  Motion
  dnd-kit

Backend
  TypeScript — strict mode
  Node.js
  Express
  /api/v1
  Firebase managed Node runtime

Managed Platform
  Firebase Hosting
  Firebase Authentication
  Firebase Admin SDK
  Cloud Firestore
  Firebase Local Emulator Suite

Quality
  TypeScript typecheck
  ESLint
  Vitest
  Testing Library
  MSW
  Firebase Emulator integration tests
  Playwright
  axe-based accessibility checks
  visual regression
```

First-party React source menggunakan `.tsx`. First-party non-React source menggunakan `.ts`. CSS tetap digunakan untuk global style, Tailwind entry, design token, theme mapping, dan kebutuhan stylesheet yang memang tepat berada di CSS.

---

# 3. Delivery Principles

## WP-P01 — Business Rule Before Decorative UI

Scheduling, payroll, authorization, effective dating, concurrency, dan historical integrity tidak boleh didefinisikan hanya dari behavior komponen UI.

## WP-P02 — Vertical Slices After Foundation

Setelah foundation stabil, fitur dikerjakan sebagai vertical slice:

```text
contract
→ domain rule
→ repository
→ API
→ frontend query/form
→ UI state
→ automated test
→ desktop/mobile QA
→ Light/Dark QA
```

## WP-P03 — No Phase Is Done With Broken Quality Gates

Phase tidak dapat dianggap selesai jika test/gate yang terkait masih gagal.

## WP-P04 — Desktop and Mobile Are Separate Acceptance Targets

Setiap fitur P0/P1 harus diuji dan diterima secara terpisah pada desktop dan mobile.

## WP-P05 — Light and Dark Are Separate Visual Targets

Light adalah default. Dark tetap first-class dan tidak boleh menjadi skin setengah jadi.

## WP-P06 — Historical and Financial Features Require Stronger Gates

Payroll, salary, incentive, schedule publication, access-control mutation, dan historical correction membutuhkan deterministic regression, authorization test, transaction/concurrency test, dan audit verification.

## WP-P07 — Production Is a Phase, Not a Build Command

Aplikasi belum production-ready hanya karena `build` sukses. Production readiness membutuhkan security, backup/restore, observability, UAT, rollback, smoke test, dan launch validation.

## WP-P08 — P0/P1 Before Optional Expansion

Production V1 diprioritaskan untuk requirement P0 dan P1 serta seluruh security/data/QA/operational requirement yang diperlukan untuk menjalankan sistem dengan aman. P2/P3 yang tidak menjadi dependency production dipelihara sebagai post-V1 backlog kecuali secara eksplisit dinaikkan prioritas.

---

# 4. Global Definition of Done

Sebuah implementation task hanya dapat ditandai **Done** jika seluruh hal yang relevan berikut terpenuhi:

- requirement PRD terkait terpenuhi;
- TypeScript typecheck bersih;
- lint bersih;
- unit/domain tests relevan lulus;
- API/integration/emulator tests relevan lulus;
- build sukses;
- tidak memperkenalkan `any` sembarangan pada domain kritis;
- tidak menduplikasi business rule di UI;
- loading, empty, error, permission denied, dan success state tersedia jika relevan;
- responsive desktop/mobile diperiksa;
- Light/Dark diperiksa;
- keyboard/focus behavior diperiksa;
- audit dibuat untuk mutation yang wajib diaudit;
- regression existing feature tetap hijau;
- tidak ada secret atau credential masuk source control;
- documentation/config terkait diperbarui bila contract berubah.

---

# 5. Global Quality Gate Commands

Nama script final dapat menyesuaikan implementation, tetapi repository harus memiliki logical gates berikut:

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm check:deadcode
```

Untuk phase tertentu dapat ditambahkan:

```text
pnpm test:rules
pnpm test:visual
pnpm test:a11y
pnpm test:security
pnpm test:performance
```

Tidak semua suite harus dijalankan setiap save lokal, tetapi release/production gate harus menjalankan semua suite yang diwajibkan PRD-19.

---

# 6. Phase Map

| Phase | Name | Primary Outcome |
|---|---|---|
| WP-F00 | Repository & Toolchain Bootstrap | Repo siap development modern |
| WP-F01 | Workspace & Application Scaffold | Monorepo web/api/packages hidup |
| WP-F02 | Quality, CI & Developer Safety Foundation | Typecheck/lint/test/build otomatis |
| WP-F03 | Design System & Responsive Foundation | UI grammar, theme, shell primitives siap |
| WP-F04 | Firebase Platform & Emulator Foundation | Auth/Firestore/API managed platform siap |
| WP-F05 | Shared Contracts & Domain Kernel | Type-safe contract/domain core siap |
| WP-F06 | Authentication, Identity & Authorization | Login dan access enforcement aman |
| WP-F07 | Employee, Team & Core Settings | Master operational data siap |
| WP-F08 | Shift Configuration & Scheduling Domain | Rule scheduling dan shift definitions siap |
| WP-F09 | Application Shell & Dashboard | First useful logged-in experience |
| WP-F10 | Schedule Consumption | My/Team Schedule production-grade |
| WP-F11 | Schedule Management & Publication | Scheduler dapat membuat/publish jadwal |
| WP-F12 | Workforce Exceptions & Requests | Leave/sick/replacement/swap/overtime workflows |
| WP-F13 | Compensation Configuration | Salary/incentive effective dating siap |
| WP-F14 | Payroll Engine & Lifecycle | Calculation hingga locking aman |
| WP-F15 | Payroll UI & Explainability | Review/detail/transparent payroll UX |
| WP-F16 | Audit, History & Notifications | Awareness dan traceability lengkap |
| WP-F17 | Reporting, Analytics & Export | Operational intelligence siap |
| WP-F18 | Cross-Product UI/UX Polish | Full visual/responsive consistency |
| WP-F19 | Security & Data Integrity Hardening | Adversarial/security gate lulus |
| WP-F20 | Performance & Reliability Hardening | Realistic workload tetap cepat/stabil |
| WP-F21 | Production Operations Foundation | Deploy, logging, backup, rollback siap |
| WP-F22 | Staging, Seed & End-to-End Rehearsal | Production-like environment tervalidasi |
| WP-F23 | User Acceptance Testing | User/business acceptance diperoleh |
| WP-F24 | Production Launch | Sistem live dengan controlled rollout |
| WP-F25 | Post-Launch Stabilization | Defect/risk awal diselesaikan |
| WP-F26 | Final Production Sign-Off | V1 dinyatakan benar-benar finish |

---

# 7. WP-F00 — Repository & Toolchain Bootstrap

## Goal

Mengubah repo dokumentasi menjadi repository development yang reproducible.

## Deliverables

- Node.js runtime policy;
- pnpm package manager;
- `.nvmrc`/equivalent runtime declaration bila dipilih;
- root `package.json`;
- `pnpm-workspace.yaml`;
- `.gitignore`;
- `.editorconfig`;
- Prettier baseline;
- ESLint baseline;
- root TypeScript config strategy;
- repository scripts naming convention;
- environment example files tanpa secret;
- developer README bootstrap section.

## Tasks

- tetapkan Node LTS yang supported Firebase runtime;
- aktifkan Corepack/pnpm workflow;
- buat workspace root;
- buat strict TypeScript base config;
- buat lint/format baseline;
- tentukan package naming dan import alias convention;
- tetapkan `.ts`/`.tsx` sebagai first-party source standard;
- larang commit credential/service-account JSON;
- dokumentasikan local prerequisites termasuk Java/Firebase Emulator requirement bila dibutuhkan oleh toolchain saat implementation.

## Exit Gate

- fresh clone dapat melakukan install dependency;
- `pnpm typecheck` dapat dijalankan walaupun source masih minimal;
- `pnpm lint` dapat dijalankan;
- config tidak mengandung secret;
- semua path/package convention terdokumentasi.

---

# 8. WP-F01 — Workspace & Application Scaffold

## Goal

Membentuk struktur application canonical PRD-22.

## Target Structure

```text
apps/
  web/
  api/
packages/
  domain/
  contracts/
  ui/
docs/
  prd/
  workplan/
```

## Web Scaffold

- React + Vite + TSX;
- React Router;
- Tailwind CSS;
- app bootstrap;
- route error boundary;
- global providers skeleton;
- TanStack Query provider;
- theme provider;
- basic app shell placeholder.

## API Scaffold

- Node.js + TypeScript;
- Express application;
- `/api/v1` root;
- health/readiness endpoint;
- canonical error response shell;
- request/correlation ID middleware;
- structured logging shell;
- environment validation shell.

## Package Scaffold

- `packages/domain` tidak boleh bergantung React/Tailwind;
- `packages/contracts` untuk shared schemas/types;
- `packages/ui` untuk primitives/patterns/token helpers.

## Exit Gate

- web dev server berjalan;
- API local server/function berjalan;
- web dapat memanggil API health endpoint;
- production Vite build sukses;
- package boundary tidak circular.

---

# 9. WP-F02 — Quality, CI & Developer Safety Foundation

## Goal

Membuat quality gates sebelum feature code bertambah besar.

## Deliverables

- Vitest config;
- Testing Library config;
- MSW test infrastructure;
- Playwright baseline;
- axe integration baseline;
- dead-code/dependency check;
- CI workflow;
- required quality command set;
- test fixture convention;
- coverage strategy tanpa mengejar angka palsu.

## CI Baseline

Minimum merge gate:

```text
typecheck
lint
format check
unit tests
build
```

Setelah emulator/E2E tersedia, CI diperluas dengan integration dan smoke E2E.

## Exit Gate

- intentionally broken type fails CI;
- intentionally broken lint fails CI;
- failing unit test fails CI;
- broken Vite/API build fails CI;
- Playwright minimal smoke dapat berjalan pada CI-capable environment.

---

# 10. WP-F03 — Design System & Responsive Foundation

## PRD Focus

PRD-10, PRD-11, PRD-12, PRD-13.

## Goal

Membuat satu visual grammar sebelum halaman feature berkembang sendiri-sendiri.

## Foundation

- semantic color tokens;
- Light theme;
- Dark theme parity;
- typography scale;
- spacing scale;
- radius;
- border/elevation;
- focus ring;
- motion tokens;
- z-index/layer model;
- responsive breakpoint policy;
- safe-area utilities;
- reduced-motion behavior.

## Core UI Primitives

Minimal:

- Button;
- IconButton;
- Input;
- Textarea;
- Select/Combobox;
- Checkbox/Radio/Switch;
- FormField;
- Badge/Status;
- Tooltip;
- Dropdown Menu;
- Popover;
- Dialog;
- Sheet/Drawer;
- Tabs;
- Toast;
- Skeleton;
- Empty State;
- Error State;
- Loading State;
- Table primitives;
- Pagination;
- Date controls;
- Page/Section header;
- Toolbar;
- Card/Surface primitives.

## App Shell Foundation

- desktop sidebar/navigation;
- compact/tablet behavior;
- mobile navigation model;
- top utility bar/account entry;
- content width/density rules;
- page shell;
- theme switcher.

## Exit Gate

- primitive showcase/story page tersedia untuk QA;
- seluruh primitive memiliki Light/Dark state;
- keyboard/focus basic QA lulus;
- mobile touch target basic QA lulus;
- tidak ada raw page-specific palette sebagai design-system shortcut.

---

# 11. WP-F04 — Firebase Platform & Emulator Foundation

## Goal

Menyiapkan managed infrastructure sebelum feature persistence bergantung padanya.

## Deliverables

- Firebase project config structure;
- Firebase Hosting config;
- Cloud Functions 2nd gen/managed Node API config;
- Firestore config;
- Firestore rules baseline fail-closed;
- Firestore indexes file;
- Auth Emulator;
- Firestore Emulator;
- Emulator UI;
- local demo project convention;
- Admin SDK initialization;
- client Firebase initialization;
- emulator-safe environment separation;
- deterministic emulator reset/seed mechanism.

## Security Baseline

- server credentials tidak pernah masuk browser;
- service account JSON tidak committed;
- production identity menggunakan managed credential/IAM;
- direct client writes ke business-critical collections ditolak baseline.

## Exit Gate

- web login SDK dapat terhubung emulator;
- API dapat menggunakan Admin SDK emulator;
- Firestore read/write integration test berjalan;
- fail-closed rules test berjalan;
- accidental production write dari default local config dibuat sulit.

---

# 12. WP-F05 — Shared Contracts & Domain Kernel

## Goal

Membentuk language business yang type-safe sebelum domain feature besar dibangun.

## Deliverables

- stable identifier types;
- business date contract;
- timestamp contract;
- money/IDR contract;
- common API envelope;
- error-code taxonomy;
- pagination/filter contracts;
- optimistic version contract;
- idempotency contract;
- audit metadata contract;
- timezone helper/Temporal abstraction.

## Domain Kernel

- `BusinessDate` semantics;
- Asia/Jakarta conversion rules;
- integer IDR helpers;
- invariant error model;
- lifecycle/state modeling pattern;
- domain result/error pattern;
- deterministic clock/test clock abstraction where needed.

## Exit Gate

- cross-midnight date helper tests;
- money helper tests;
- serialization round-trip tests;
- invalid external payload ditolak Zod;
- no business-domain dependency on React/Express/Firebase SDK.

---

# 13. WP-F06 — Authentication, Identity & Authorization

## PRD Focus

PRD-07, PRD-16, PRD-22.

## Goal

User dapat login, tetapi mutation hanya dapat dilakukan sesuai capability dan scope.

## Deliverables

- login;
- logout;
- session/token refresh awareness;
- Firebase ID token verification middleware;
- active/inactive account enforcement;
- user ↔ employee linkage;
- application role/capability model;
- authorization service;
- route/action guards;
- last-administrator protection;
- account disable flow;
- authorization audit events.

## Required Tests

- valid login;
- invalid login;
- expired/missing token;
- disabled user;
- direct API request tanpa permission;
- user mencoba actor/resource ID milik user lain;
- permission UI hidden tetapi API tetap authoritative;
- role/access mutation audit.

## Exit Gate

Authentication dan authorization test lulus dari UI dan adversarial HTTP path.

---

# 14. WP-F07 — Employee, Team & Core Settings

## Goal

Menyediakan master data yang dibutuhkan scheduling dan payroll.

## Deliverables

- employee directory;
- employee detail;
- add/edit employee;
- activate/deactivate;
- team/grouping baseline;
- general settings;
- holiday configuration baseline;
- permission-aware settings navigation;
- searchable/filterable employee list;
- historical identity preservation.

## UI Acceptance

- desktop dense table/list;
- mobile recomposed list/detail;
- form controls konsisten dengan design system;
- empty/loading/error/permission state.

## Exit Gate

Employee inactive tidak menghapus historical references dan tidak dapat login/beroperasi sesuai policy.

---

# 15. WP-F08 — Shift Configuration & Scheduling Domain

## PRD Focus

PRD-03 dan data requirements terkait.

## Goal

Mengunci rule scheduling sebelum calendar editor menjadi kompleks.

## Deliverables

- Shift 1/2/3 baseline;
- configurable shift name/code;
- start/end time;
- cross-midnight handling;
- shift version/effective model bila diperlukan;
- work-date attribution;
- schedule period;
- schedule version;
- assignment domain;
- one primary work state invariant;
- draft/published lifecycle;
- conflict/warning model;
- coverage calculation contract;
- deterministic Firestore ID/invariant strategy.

## Required Tests

- normal shift;
- cross-midnight shift;
- duplicate primary state rejected;
- inactive shift behavior;
- effective version selection;
- draft vs published behavior;
- timezone boundary;
- stale version/concurrency rejection.

## Exit Gate

Scheduling rules dapat diuji penuh tanpa browser.

---

# 16. WP-F09 — Application Shell & Dashboard

## Goal

Membuat first useful end-to-end product experience.

## Deliverables

- authenticated app shell;
- role-aware navigation;
- Dashboard route;
- Personal Shift Today;
- Next Shift;
- Now on Duty;
- latest relevant changes/awareness placeholder integration;
- current month shift summary where data is available;
- responsive desktop/mobile dashboard.

## UX Gate

Dalam beberapa detik setelah login user harus dapat memahami:

- shift hari ini;
- jam shift;
- shift berikutnya;
- rekan/anggota aktif;
- perubahan penting yang relevan.

## Exit Gate

Dashboard P0 lulus E2E desktop + mobile dan Light + Dark smoke.

---

# 17. WP-F10 — Schedule Consumption

## Goal

Member dapat melihat jadwal sendiri dan tim dengan cepat dan nyaman.

## Deliverables

- My Schedule;
- Team Schedule;
- today/week/month navigation sesuai PRD;
- date/period URL state;
- shift visual grammar;
- published-state clarity;
- change indicators;
- loading/error/empty state;
- mobile schedule composition;
- large-data virtualization jika dibutuhkan berdasarkan profiling.

## Special QA

- tidak ada horizontal overflow accidental;
- horizontal schedule scroll jika memang diperlukan harus smooth dan tidak melawan touch intent;
- sticky headers tidak collision;
- current-date visibility jelas;
- cross-midnight shift tidak tampil sebagai dua shift salah.

## Exit Gate

Consumption flow nyaman tanpa menggunakan Schedule Management editor.

---

# 18. WP-F11 — Schedule Management & Publication

## Goal

Scheduler dapat membuat jadwal secara efisien, memvalidasi, dan mempublikasikannya dengan aman.

## Deliverables

- management workspace;
- assignment create/edit/remove;
- bulk assignment;
- copy schedule/pattern;
- selection model;
- drag/drop bila benar-benar meningkatkan UX;
- non-drag accessible alternative;
- validation preview;
- conflict/warning panel;
- coverage visibility;
- draft state;
- publish command;
- publish confirmation/review;
- optimistic concurrency;
- idempotency publish;
- audit event;
- published version history.

## Required Tests

- unauthorized scheduler action rejected;
- duplicate/invalid assignment rejected;
- stale editor publish rejected;
- repeated idempotent publish tidak menggandakan effect;
- publish transaction tidak menghasilkan half-applied state;
- audit correlation benar.

## Exit Gate

Scheduler dapat membangun satu periode jadwal dari kosong sampai published tanpa manual DB operation.

---

# 19. WP-F12 — Workforce Exceptions & Requests

## PRD Focus

PRD-05.

## Goal

Menangani realitas operasional tanpa merusak planned schedule/history.

## Scope

- leave;
- sick;
- permission;
- training/duty exception bila requirement aktif;
- replacement;
- shift swap;
- overtime;
- request submission;
- approval/reject;
- effective coverage;
- payroll-impact flags;
- retroactive correction safeguards.

## Required Tests

- exception tidak membuat duplicate primary work state;
- original planned assignment tetap dapat direkonstruksi;
- replacement actor/source dapat ditelusuri;
- approval permission enforced;
- overtime tidak disamakan dengan primary shift;
- payroll dirty/freshness state terpicu sesuai contract.

## Exit Gate

Planned schedule dan operational reality dapat dijelaskan bersamaan.

---

# 20. WP-F13 — Compensation Configuration

## Goal

Menyiapkan input financial payroll yang historical-safe.

## Deliverables

- base salary configuration;
- salary effective versions;
- Shift 2 incentive;
- Shift 3 incentive;
- incentive effective versions;
- optional compensation settings defined by PRD;
- overlap guard;
- reason/history;
- permission restriction;
- audit trail.

## Required Tests

- correct effective rate selection;
- overlap rejected;
- historical version tidak overwritten;
- unauthorized mutation rejected;
- integer IDR only;
- edit current/future config tidak mengubah historical snapshot.

## Exit Gate

Payroll engine dapat meminta compensation untuk tanggal/periode secara deterministic.

---

# 21. WP-F14 — Payroll Engine & Lifecycle

## PRD Focus

PRD-04.

## Goal

Menghasilkan payroll deterministic dan historical-safe.

## Deliverables

- payroll period;
- source-data resolution;
- published-schedule eligibility;
- work-date attribution;
- salary snapshot;
- incentive quantity/rate snapshot;
- overtime/approved exception integration jika aktif;
- manual positive/negative adjustment;
- calculation revision;
- recalculation;
- freshness/dirty state;
- finalize;
- lock;
- unlock policy;
- optimistic concurrency;
- idempotent dangerous commands;
- audit correlation.

## Deterministic Regression Matrix

Harus mencakup minimal:

- no-shift employee;
- mixed S1/S2/S3;
- cross-month night shift;
- changed incentive mid-period jika rule memungkinkan;
- salary effective change;
- exception replacement impact;
- overtime impact;
- positive/negative adjustment;
- recalculate;
- finalize;
- lock;
- historical locked period after config changes.

## Exit Gate

Input fixture yang sama selalu menghasilkan result yang sama dan locked historical payroll tidak drift.

---

# 22. WP-F15 — Payroll UI & Explainability

## Goal

Membuat payroll dapat dipahami manusia, bukan hanya benar secara engine.

## Deliverables

- Payroll Overview;
- Monthly Payroll;
- Employee Payroll Detail;
- status lifecycle;
- explainable breakdown;
- quantity × rate display;
- adjustment reason;
- revision awareness;
- finalize/lock controls sesuai permission;
- warning ketika data dirty/outdated;
- historical period browsing;
- responsive mobile consumption;
- dense desktop review workspace.

## UX Acceptance

User harus dapat menjawab:

- total berasal dari mana;
- berapa jumlah setiap shift;
- tarif mana yang digunakan;
- adjustment apa yang berlaku;
- revision mana yang sedang dilihat;
- apakah payroll final/locked.

## Exit Gate

Payroll bukan black box dan high-risk action memiliki deliberate confirmation.

---

# 23. WP-F16 — Audit, History & Notifications

## Goal

Memberikan traceability dan awareness tanpa spam.

## Audit/History Deliverables

- append-oriented audit service;
- actor attribution;
- before/after where required;
- reason;
- correlation ID;
- schedule history;
- compensation history;
- payroll revision history;
- access-change history;
- user-facing Activity/History UI.

## Notification Deliverables

- Notification Center;
- unread/read state;
- grouping/dedupe;
- deep link;
- relevant schedule change notification;
- request status notification;
- payroll available/final/locked notification;
- coverage warning where applicable;
- preference baseline;
- actor self-notification suppression for routine actions.

## Exit Gate

Critical change dapat dijelaskan dan notification selalu menunjuk canonical source, bukan menjadi source of truth sendiri.

---

# 24. WP-F17 — Reporting, Analytics & Export

## Goal

Membuat data operasional dapat digunakan untuk keputusan dan rekonsiliasi.

## Deliverables

- monthly shift summary;
- shift distribution;
- planned vs effective distinction;
- employee monthly summary;
- payroll report;
- payroll drill-down;
- coverage report;
- exception/overtime summary;
- comparison period where P1 scope requires;
- filter/group/sort;
- URL-shareable report state where practical;
- CSV export;
- Excel export if required/approved;
- print behavior;
- charts only where they improve comprehension.

## Rule

Reporting tidak menghitung alternate payroll truth. Semua financial report harus berasal dari canonical payroll revision/record.

## Exit Gate

Setiap metric penting dapat ditelusuri ke source record/detail.

---

# 25. WP-F18 — Cross-Product UI/UX Polish

## Goal

Melakukan dedicated polish pass setelah seluruh main domain tersedia.

## Review Scope

Setiap page/surface P0/P1 diperiksa untuk:

- alignment;
- typography;
- spacing rhythm;
- component consistency;
- density;
- whitespace mati;
- icon optical alignment;
- table alignment;
- schedule cell alignment;
- modal/sheet sizing;
- sticky collisions;
- touch reachability;
- keyboard flow;
- focus restoration;
- empty/loading/error state;
- motion quality;
- reduced motion;
- Light/Dark parity;
- desktop/mobile independent approval.

## Screenshot Matrix

Minimum representative visual regression:

```text
Desktop Light
Desktop Dark
Mobile Light
Mobile Dark
```

untuk high-value surfaces:

- login;
- dashboard;
- My Schedule;
- Team Schedule;
- Schedule Management;
- Employees;
- Payroll Overview;
- Payroll Detail;
- Reports;
- Settings;
- Activity/Notifications.

## Exit Gate

Tidak ada halaman P0/P1 yang terlihat berasal dari design system berbeda atau memiliki unresolved high-severity visual defect.

---

# 26. WP-F19 — Security & Data Integrity Hardening

## Goal

Menguji aplikasi sebagai attacker/abusive client, bukan hanya normal user.

## Security Scope

- broken access control;
- BOLA/IDOR;
- missing/expired token;
- privilege escalation;
- actor ID spoofing;
- input validation bypass;
- XSS;
- unsafe URL/deep link;
- CSP/security headers;
- secret leakage;
- Firestore direct access rules;
- App Check evaluation/enablement where appropriate;
- request body size limits;
- expensive endpoint abuse controls;
- idempotency replay;
- stale version overwrite;
- audit bypass;
- payroll mutation protection;
- schedule publish protection;
- last-admin protection;
- dependency vulnerability review.

## Exit Gate

No known Critical/High security defect. Medium defects memiliki documented decision sebelum launch.

---

# 27. WP-F20 — Performance & Reliability Hardening

## Goal

Menguji data dan usage pattern realistis.

## Performance Scenarios

- large monthly Team Schedule;
- Schedule Management dengan realistic employee/date count;
- employee directory;
- payroll period list;
- report filtering;
- Notification Center;
- audit history;
- concurrent API requests;
- serverless cold start awareness.

## Actions

- profile bundle;
- lazy load routes;
- inspect duplicate requests;
- optimize query keys/cache invalidation;
- add Firestore indexes berdasarkan real query;
- eliminate N+1 read patterns;
- virtualize only measured large surfaces;
- verify no layout jank;
- review animation performance;
- confirm retry/error behavior.

## Reliability

- network error recovery;
- server error recovery;
- offline/degraded awareness;
- duplicate submit resistance;
- partial dependency outage behavior;
- fail-closed critical mutation.

## Exit Gate

Critical workflows tetap responsif pada representative production-like dataset dan tidak menghasilkan correctness tradeoff demi speed.

---

# 28. WP-F21 — Production Operations Foundation

## PRD Focus

PRD-20.

## Goal

Menyiapkan aplikasi supaya aman untuk dioperasikan, bukan hanya dikembangkan.

## Environments

- local/emulator;
- CI/test;
- staging;
- production.

## Deployment

- Firebase Hosting deployment;
- managed Node API deployment;
- Firestore rules deployment;
- Firestore indexes deployment;
- secret/environment management;
- immutable Git SHA/release identification;
- deployment order;
- rollback procedure.

## Observability

- structured API logs;
- request/correlation IDs;
- runtime revision;
- error monitoring signal;
- latency/error metrics;
- actionable alerts for critical failure;
- operational dashboard where useful.

## Backup/Recovery

- Firestore backup/export policy;
- restore procedure;
- isolated restore drill;
- RPO/RTO documented;
- secret rotation runbook;
- auth outage runbook;
- bad deployment runbook;
- accidental data mutation runbook.

## Exit Gate

A rollback dan restore drill sudah pernah dilakukan sebelum production launch.

---

# 29. WP-F22 — Staging, Seed & End-to-End Rehearsal

## Goal

Menjalankan sistem production-like secara menyeluruh sebelum user acceptance.

## Deliverables

- staging Firebase project/environment;
- deterministic realistic seed;
- representative roles;
- representative schedules;
- exception cases;
- compensation versions;
- payroll history;
- notifications/audit fixtures;
- production-like build configuration;
- deploy rehearsal;
- smoke tests.

## Full Journey Rehearsal

Minimal:

```text
Admin creates/configures employee
→ shift configuration ready
→ scheduler creates period
→ scheduler assigns schedule
→ validates conflicts
→ publishes
→ member sees schedule
→ exception/request occurs
→ approval/replacement applied
→ payroll period calculated
→ payroll reviewed
→ finalized/locked
→ report generated
→ audit/history explains changes
→ notifications deep-link correctly
```

## Exit Gate

Tidak ada manual Firestore console patch yang diperlukan untuk menyelesaikan main product journey.

---

# 30. WP-F23 — User Acceptance Testing

## Goal

Membuktikan bahwa sistem cocok dengan real operational workflow, bukan hanya developer expectation.

## UAT Actors

- NOC Member;
- Scheduler/Supervisor;
- Administrator.

## UAT Areas

- login/access;
- today awareness;
- schedule consumption;
- schedule creation/editing;
- conflict handling;
- publish;
- request/exception;
- compensation configuration;
- payroll review;
- payroll explainability;
- reports;
- notification/history;
- mobile one-hand usability;
- desktop productivity.

## Defect Classification

- Blocker;
- Critical;
- Major;
- Minor;
- Cosmetic.

Production launch diblokir oleh unresolved Blocker/Critical dan oleh Major defect yang menyentuh correctness/security/core workflow kecuali ada explicit accepted mitigation.

## Exit Gate

UAT sign-off tercatat dan seluruh launch-blocking defect ditutup.

---

# 31. WP-F24 — Production Launch

## Goal

Membawa sistem ke production secara controlled dan reversible.

## Pre-Launch Checklist

- production Firebase project configured;
- domain/Hosting configuration correct;
- Auth provider configured;
- production Firestore rules verified;
- indexes ready;
- secrets configured;
- production admin bootstrap procedure verified;
- backup active;
- alert/log visibility ready;
- final CI full suite green;
- final build from intended commit SHA;
- release notes prepared;
- rollback target known;
- smoke script ready.

## Deployment Order

Urutan exact mengikuti compatibility analysis, tetapi secara umum:

1. backward-compatible data/index/rules prerequisites;
2. managed API revision;
3. Hosting web revision;
4. post-deploy smoke;
5. critical business journey smoke;
6. logs/metrics verification.

## Production Smoke

- login;
- authorized API call;
- dashboard;
- schedule read;
- controlled safe write test bila memungkinkan;
- payroll read;
- notification/history read;
- mobile route navigation;
- Dark Mode smoke;
- no obvious console/runtime errors.

## Exit Gate

Production live, smoke green, observability normal, rollback tidak diperlukan.

---

# 32. WP-F25 — Post-Launch Stabilization

## Goal

Menangkap defect yang hanya muncul di real production usage.

## Activities

- review error logs;
- review latency;
- review Firestore query/read patterns;
- review permission denial anomalies;
- review failed mutation patterns;
- review schedule/payroll discrepancies;
- collect user friction feedback;
- fix high-priority visual/mobile issues;
- verify backup continues running;
- verify notification behavior tidak spam;
- dependency/security patch if required.

## Rule

Jangan melakukan random feature expansion selama stabilization jika belum ada confidence pada correctness production core.

## Exit Gate

Tidak ada unresolved production Blocker/Critical, dan core workflows menunjukkan operational stability.

---

# 33. WP-F26 — Final Production Sign-Off

## Goal

Menentukan secara eksplisit kapan NOCScheduler V1 benar-benar dianggap **FINISH / FINAL PRODUCTION**.

## Product Completion Gate

- seluruh P0 selesai;
- seluruh P1 yang ditetapkan sebagai V1 scope selesai;
- deferred P2/P3 terdokumentasi sebagai non-blocking backlog;
- scheduling end-to-end berjalan;
- workforce exception flow berjalan sesuai scope;
- payroll deterministic dan explainable;
- employee/access/settings operational;
- reporting minimum production scope berjalan;
- notifications/audit/history berjalan.

## Engineering Gate

- TypeScript strict typecheck green;
- lint green;
- unit tests green;
- integration/emulator tests green;
- E2E green;
- visual regression required set green;
- build green;
- dead-code/dependency audit acceptable;
- no known Critical/High security issue;
- no launch-blocking performance defect.

## UX Gate

- desktop accepted;
- mobile accepted;
- Light accepted;
- Dark accepted;
- accessibility critical paths accepted;
- no unresolved major alignment/component consistency defect;
- loading/empty/error/permission states complete.

## Data Gate

- historical schedule integrity verified;
- historical compensation integrity verified;
- locked payroll stability verified;
- concurrency behavior verified;
- idempotency behavior verified;
- audit evidence verified.

## Operations Gate

- production deploy reproducible;
- rollback documented/tested;
- backup active;
- restore tested;
- logging/metrics available;
- alerts actionable;
- secrets managed;
- incident runbooks available;
- production admin/recovery ownership understood.

## Final State

Jika seluruh gate di atas terpenuhi:

```text
NOCScheduler V1
Status: FINAL PRODUCTION
```

Setelah titik ini, perubahan baru masuk melalui maintenance, bugfix, security patch, atau roadmap V1.x/V2 dan tidak lagi dianggap bagian dari initial production build.

---

# 34. Dependency Graph

High-level dependency:

```text
F00 Repository Bootstrap
 ↓
F01 Workspace Scaffold
 ↓
F02 Quality Foundation
 ├───────────────┐
 ↓               ↓
F03 Design       F04 Firebase
 System           Platform
 └──────┬────────┘
        ↓
F05 Contracts / Domain Kernel
        ↓
F06 Auth / Authorization
        ↓
F07 Employees / Settings
        ↓
F08 Scheduling Domain
        ↓
F09 Dashboard
        ↓
F10 Schedule Consumption
        ↓
F11 Schedule Management
        ↓
F12 Exceptions / Requests
        ↓
F13 Compensation
        ↓
F14 Payroll Engine
        ↓
F15 Payroll UI
        ↓
F16 Audit / Notifications
        ↓
F17 Reporting
        ↓
F18 UI/UX Polish
        ↓
F19 Security Hardening
        ↓
F20 Performance / Reliability
        ↓
F21 Production Operations
        ↓
F22 Staging Rehearsal
        ↓
F23 UAT
        ↓
F24 Production Launch
        ↓
F25 Stabilization
        ↓
F26 Final Production Sign-Off
```

Beberapa phase dapat overlap secara terbatas setelah dependency kontraknya stabil, tetapi **tidak boleh melompati gate bisnis/data kritis** hanya agar UI terlihat cepat selesai.

---

# 35. Parallelization Rules

Parallel work diperbolehkan bila tidak menciptakan duplicate source of truth.

## Aman diparalelkan

- design primitives dan Firebase emulator foundation setelah scaffold;
- component visual work dengan domain contracts yang sudah locked;
- reporting UI exploration setelah report contract locked;
- desktop/mobile visual QA oleh stream berbeda;
- documentation/runbook dengan implementation yang contract-nya stabil.

## Tidak aman diparalelkan tanpa contract lock

- payroll UI sebelum payroll engine contract stabil;
- schedule editor sebelum assignment/conflict lifecycle stabil;
- access UI sebelum capability semantics stabil;
- report calculation sebagai implementation kedua dari payroll/scheduling logic;
- direct Firestore client flow sebelum security rule/auth model stabil.

---

# 36. Phase Status Convention

Setiap phase menggunakan salah satu status:

```text
NOT_STARTED
AUDIT
IN_PROGRESS
IMPLEMENTED
QA_REQUIRED
QA_FAILED
ACCEPTED
BLOCKED
SUPERSEDED
```

`IMPLEMENTED` bukan berarti `ACCEPTED`.

Phase hanya `ACCEPTED` setelah exit gate phase terpenuhi.

---

# 37. Task ID Convention

Recommended format:

```text
WP-F11-01
WP-F11-02
WP-F11-03
```

Contoh:

```text
WP-F11-01 Schedule Management shell
WP-F11-02 Assignment interaction
WP-F11-03 Conflict validation UX
WP-F11-04 Publish command
WP-F11-05 Desktop visual QA
WP-F11-06 Mobile visual QA
WP-F11-07 Regression and acceptance
```

Task dapat dipecah lagi jika implementation terlalu besar, tetapi phase ID tidak berubah.

---

# 38. Definition of Ready for a Phase

Sebelum suatu phase dimulai:

- PRD dependency sudah dibaca;
- prerequisite phase accepted atau contract dependency locked;
- target behavior diketahui;
- existing implementation telah diaudit jika bukan greenfield;
- data/API contract yang diperlukan tidak ambigu;
- test strategy diketahui;
- UI target desktop/mobile diketahui jika phase memiliki UI;
- tidak ada architecture decision unresolved yang mengubah fondasi phase.

---

# 39. Definition of Release Candidate

Build dapat disebut **Release Candidate** hanya jika:

- seluruh V1 feature phase F00–F17 accepted;
- polish F18 accepted;
- security F19 accepted;
- performance/reliability F20 accepted;
- operations F21 accepted;
- staging rehearsal F22 accepted;
- UAT F23 accepted;
- full quality gate green pada commit candidate;
- known issues terdokumentasi dan tidak launch-blocking.

---

# 40. Out of Initial Production Critical Path

Hal berikut boleh berada setelah V1 jika tetap P2/P3 dan tidak dibutuhkan untuk requirement operasional saat launch:

- advanced smart scheduling assistance;
- optional external calendar sync;
- advanced external notification adapters;
- speculative realtime everywhere;
- advanced analytics beyond defined production reports;
- unnecessary PWA/offline mutation capability;
- microservices;
- Redis/Kafka/Kubernetes;
- public SaaS/multi-tenancy;
- unrelated HRIS functionality.

Deferred tidak berarti dilupakan. Semua harus tetap berada pada roadmap/backlog dengan alasan prioritas yang jelas.

---

# 41. Workplan Governance

Workplan ini harus diperbarui jika:

- PRD baru mengubah V1 scope;
- business logic berubah;
- platform architecture berubah;
- Firebase deployment topology berubah secara material;
- production requirement baru ditemukan;
- phase dependency berubah;
- sebuah phase dipecah/merge karena implementation reality.

Perubahan workplan tidak boleh diam-diam menghapus requirement PRD.

---

# 42. Recommended First Execution Sequence

Urutan awal yang harus langsung dikerjakan setelah workplan diterima:

```text
WP-F00 Repository & Toolchain Bootstrap
→ WP-F01 Workspace & Application Scaffold
→ WP-F02 Quality/CI Foundation
→ WP-F03 Design System Foundation
→ WP-F04 Firebase Platform Foundation
→ WP-F05 Shared Contracts & Domain Kernel
```

Setelah F05 accepted, development mulai masuk ke vertical product slices.

---

# 43. Final Principle

Target proyek bukan sekadar menghasilkan banyak `.tsx` file.

Target akhirnya adalah:

> **NOCScheduler yang business logic-nya benar, payroll-nya dapat dipercaya, jadwalnya historical-safe, authorization-nya tidak dapat dilewati dari client, UI-nya modern dan konsisten, mobile/desktop sama-sama matang, Light/Dark sama-sama polished, testable, observable, recoverable, dan dapat dioperasikan di production tanpa ketergantungan pada manual database surgery.**

Workplan dianggap selesai hanya ketika **WP-F26 — Final Production Sign-Off** berstatus `ACCEPTED`.
