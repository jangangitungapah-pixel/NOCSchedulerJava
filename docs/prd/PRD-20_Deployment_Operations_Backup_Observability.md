# PRD-20 — Deployment, Operations, Backup & Observability

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Deployment, Operations, Backup & Observability  
> **Document ID:** PRD-20  
> **Status:** Draft — Production Operations Source of Truth  
> **Depends On:** PRD-01 through PRD-19  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **production topology, environment strategy, CI/CD, release flow, deployment safety, database migration execution, rollback policy, backup, restore, disaster recovery, RPO/RTO, health checks, structured logging, metrics, alerting, incident response, secret operations, retention, capacity awareness, maintenance, dan operational readiness** untuk NOCScheduler.

PRD-20 menjadi source of truth untuk menjawab:

> **“Bagaimana NOCScheduler dirilis, dijalankan, dipantau, dipulihkan, dan dioperasikan dengan aman sehingga gangguan tidak berubah menjadi kehilangan data, payroll corruption, atau jadwal yang tidak dapat dipercaya?”**

Dokumen ini menyelesaikan operational layer dari arsitektur yang telah ditetapkan oleh:

- PRD-14 — Technical Architecture & Technology Stack,
- PRD-15 — API & Backend Contract,
- PRD-16 — Authentication, Security & Data Integrity,
- PRD-19 — QA, Testing & Acceptance Criteria.

---

# 2. Operations Vision

NOCScheduler harus **simple to run, hard to break silently, and recoverable by design**.

Target operasional:

```text
Predictable Release
+ Reproducible Deployment
+ Safe Migration
+ Observable Runtime
+ Fast Detection
+ Controlled Rollback
+ Tested Backup
+ Proven Restore
+ Historical Integrity
```

Operational simplicity lebih penting daripada infrastruktur yang terlihat canggih.

MVP tidak membutuhkan microservice cluster, Kubernetes, Kafka, service mesh, atau multi-region active-active kecuali requirement nyata muncul kemudian.

---

# 3. Core Operations Principles

## OPS-P01 — One Production Truth

Production environment harus memiliki satu canonical application state dan satu canonical PostgreSQL primary data source.

Read replica/cache boleh ditambahkan kemudian tetapi tidak boleh menjadi tempat mutation business truth.

---

## OPS-P02 — Immutable Releases

Satu release harus dapat diidentifikasi secara stabil melalui minimal:

- Git commit SHA,
- build/release identifier,
- deployment timestamp,
- migration/schema version.

Production tidak boleh diubah dengan manual file editing atau patch langsung pada server.

---

## OPS-P03 — Build Once, Promote Intentionally

Artifact atau source revision yang lolos quality gate harus menjadi revision yang dipromosikan ke environment berikutnya.

Jangan membangun ulang source berbeda secara diam-diam untuk production setelah staging acceptance.

Jika platform melakukan build per environment, commit SHA, lockfile, runtime version, dan build configuration harus tetap identik kecuali environment-specific configuration yang memang diperlukan.

---

## OPS-P04 — Database Changes Are Releases

Migration bukan side effect kecil deployment.

Setiap schema change harus:

- version-controlled,
- direview,
- diuji,
- memiliki deployment order,
- memiliki compatibility analysis,
- memiliki recovery plan.

---

## OPS-P05 — Rollback Application Before Restoring Data

Jika release code bermasalah tetapi data masih benar, prioritaskan application rollback.

Database restore tidak boleh digunakan sebagai tombol undo deployment biasa karena restore dapat menghilangkan business mutation valid yang terjadi setelah backup point.

---

## OPS-P06 — Backup Is Not Proven Until Restore Works

Backup job yang sukses belum membuktikan recoverability.

Restore drill wajib dilakukan secara berkala pada environment terisolasi.

---

## OPS-P07 — Logs Explain, Metrics Detect, Audit Proves

Tiga sistem ini berbeda:

- **Logs** menjelaskan runtime behavior/error,
- **Metrics** mendeteksi trend dan kondisi abnormal,
- **Audit** membuktikan business mutation.

Application log tidak boleh menggantikan audit trail PRD-09.

---

## OPS-P08 — Alerts Must Be Actionable

Jangan membuat alert hanya karena metric dapat diukur.

Alert harus menjelaskan minimal:

- apa yang salah,
- environment,
- severity,
- waktu kejadian,
- signal utama,
- runbook atau next action.

---

## OPS-P09 — Fail Safe for Critical Mutation

Jika dependency yang diperlukan untuk menjaga consistency tidak tersedia, mutation kritis harus fail closed.

Contoh:

- database unavailable,
- transaction gagal,
- required audit persistence gagal,
- authorization dependency gagal.

Jangan menerima payroll lock atau schedule publish dalam keadaan consistency tidak dapat dijamin.

---

## OPS-P10 — Recovery Procedures Are Documentation, Not Tribal Knowledge

Deployment, rollback, restore, incident response, secret rotation, dan migration recovery harus terdokumentasi sebagai runbook di repository atau operational documentation resmi.

---

# 4. Baseline Production Topology

Recommended logical topology:

```text
Users
  ↓ HTTPS
Managed Application Runtime / Load Balancer
  ↓
NOCScheduler Next.js Modular Monolith
  ├─ Server Components
  ├─ Route Handlers / API
  ├─ Better Auth
  ├─ Authorization
  ├─ Domain Services
  ├─ Query Services
  ├─ Audit / Notification Policy
  └─ Health / Observability
        ↓
Managed PostgreSQL
  ├─ transactional data
  ├─ audit records
  ├─ notification records
  └─ migration history
```

Optional future additions:

```text
Outbox → Background Worker
Object Storage → generated export archive
Read Replica → reporting scale
External Notification Adapter
```

Tidak wajib pada MVP.

---

# 5. Hosting & Runtime Requirements

Production application runtime harus mendukung:

- Node.js runtime compatible dengan selected Next.js release,
- HTTPS/TLS termination,
- secure environment secrets,
- zero/minimal-downtime deployment capability,
- immutable deployment/revision history,
- rollback ke previous healthy revision,
- application logs,
- health checks,
- autoscaling atau resource scaling yang memadai,
- custom domain bila diperlukan.

## 5.1 Avoid Unnecessary Edge Execution

Business mutation yang membutuhkan:

- PostgreSQL transaction,
- auth session resolution,
- payroll calculation,
- schedule publication,
- audit write,

harus menggunakan runtime yang mendukung dependency dan transactional semantics secara reliable.

Edge runtime tidak menjadi requirement baseline.

---

# 6. Environment Strategy

Canonical environments:

## 6.1 Local Development

Purpose:

- developer implementation,
- local database,
- unit/integration tests,
- local visual development.

Data production tidak boleh dicopy ke local secara mentah.

---

## 6.2 Test / CI

Purpose:

- automated test suites,
- ephemeral/isolated PostgreSQL,
- migration verification,
- API/security testing.

Test data bersifat synthetic/deterministic.

---

## 6.3 Preview Environment

Recommended untuk PR/branch bila platform mendukung.

Purpose:

- UI review,
- stakeholder review,
- responsive QA,
- visual QA.

Preview tidak boleh terhubung ke production database.

---

## 6.4 Staging

Long-lived staging direkomendasikan untuk release candidate.

Harus menyerupai production pada:

- runtime class,
- database engine/version family,
- auth configuration pattern,
- build mode,
- security headers,
- migration flow.

Staging menggunakan credential dan database terpisah.

---

## 6.5 Production

Production hanya menerima release yang memenuhi PRD-19 Definition of Release Ready.

Direct ad-hoc deployment dari developer machine dilarang sebagai workflow normal.

---

# 7. Environment Isolation

Setiap environment harus memiliki separation minimal untuk:

- database,
- Better Auth secret,
- application secret,
- session/cookie context,
- external integration key,
- logging/monitoring environment tag,
- deployment credential.

Production secret tidak boleh tersedia pada preview PR yang tidak dipercaya.

---

# 8. CI/CD Pipeline

Recommended CI flow:

```text
Checkout exact commit
→ pnpm frozen install
→ format check
→ lint
→ TypeScript typecheck
→ unit/domain tests
→ integration/database tests
→ API/authz/security contract tests
→ production build
→ critical Playwright E2E
→ accessibility smoke
→ visual regression required set
→ migration verification
→ release artifact/revision eligible
```

Production release flow:

```text
Release Candidate
→ Staging deploy
→ staging migration if required
→ smoke / critical acceptance
→ release approval
→ production migration strategy
→ production deploy
→ post-deploy health verification
→ business smoke tests
→ monitor elevated window
```

---

# 9. Branch & Release Policy

Baseline:

- `main` adalah releasable integration branch,
- protected branch recommended,
- required CI checks sebelum merge,
- production deploy berasal dari known commit pada `main` atau release tag,
- deployment record menyimpan commit SHA.

Hotfix tetap harus melalui version control dan minimum required safety checks.

Emergency tidak membenarkan perubahan production yang tidak dapat ditelusuri.

---

# 10. Deployment Safety

## 10.1 Pre-Deploy Checklist

Minimal:

- CI green,
- release blocker = 0,
- migration reviewed bila ada,
- environment schema valid,
- backup/recovery state healthy,
- known deployment owner,
- rollback target diketahui.

---

## 10.2 Post-Deploy Verification

Minimal verifikasi:

- app readiness healthy,
- database connectivity healthy,
- login bekerja,
- Dashboard dapat dibaca,
- My Schedule dapat dibaca,
- protected API authorization bekerja,
- schedule mutation smoke bila aman,
- payroll read smoke,
- error rate tidak meningkat abnormal,
- current release identifier benar.

Critical destructive/high-risk mutation tidak perlu dijalankan sembarangan di production sebagai smoke test; gunakan safe read/synthetic health strategy.

---

# 11. Database Migration Operations

## 11.1 Migration Is a Separate Controlled Step

Migration harus dijalankan oleh controlled deployment job/command dengan credential yang sesuai.

Application runtime database user tidak harus memiliki DDL privilege.

---

## 11.2 Migration Compatibility

Prefer **expand → migrate/backfill → contract**.

Contoh:

```text
Release A:
add nullable/new structure

Backfill:
populate data safely

Release B:
read/write new structure

Release C:
remove old structure setelah terbukti tidak dipakai
```

Hindari migration yang membuat previous application revision langsung tidak kompatibel jika dapat dihindari.

---

## 11.3 Destructive Migration Guard

Migration berikut membutuhkan explicit review + recovery plan:

- DROP table/column,
- bulk delete,
- money type conversion,
- rewrite effective-date history,
- payroll table transformation,
- audit history mutation,
- large backfill,
- adding NOT NULL pada populated table,
- enum/state removal.

Backup/snapshot sebelum destructive migration harus tersedia bila risiko data loss ada.

---

## 11.4 Migration Failure

Jika migration gagal:

1. jangan lanjut deploy application yang membutuhkan schema baru,
2. capture error/correlation,
3. evaluasi partial transaction state,
4. rollback transaction bila migration transactional,
5. gunakan forward-fix migration bila schema sudah berubah sebagian secara sah,
6. restore hanya bila data corruption benar-benar terjadi dan procedure disetujui.

---

# 12. Application Rollback

Application runtime harus menyimpan previous known-good revisions sehingga rollback dapat dilakukan tanpa rebuild manual.

Rollback criteria contoh:

- P0/P1 regression production,
- sustained server error spike,
- login failure widespread,
- critical scheduling read/write failure,
- payroll calculation behavior salah,
- authorization regression,
- severe mobile/desktop operational blocker.

Rollback tidak otomatis mengembalikan database schema.

Compatibility migration harus dirancang untuk memungkinkan previous application revision tetap berjalan selama rollback window bila feasible.

---

# 13. Database Rollback Policy

Down migration otomatis bukan default production recovery mechanism.

Prefer:

1. stop harmful application behavior,
2. app rollback,
3. forward-fix schema/data,
4. targeted correction,
5. full database restore hanya untuk disaster/data corruption yang memenuhi recovery criteria.

Alasan: full restore dapat menghapus valid schedule/request/payroll mutation yang terjadi setelah recovery point.

---

# 14. Backup Strategy

Production PostgreSQL wajib memiliki backup strategy yang mendukung point-in-time recovery atau equivalent capability.

Minimum baseline target:

- continuous/PITR-capable backup where provider supports,
- automated daily backup,
- backup encryption at rest,
- access restricted to operational administrator/service,
- backup health monitored,
- restore procedure documented.

## 14.1 Backup Retention Baseline

Recommended minimum:

- PITR window: **>= 7 days**,
- daily recovery points: **>= 30 days**,
- monthly archival recovery point: **>= 12 months** jika biaya/storage memungkinkan dan retention policy organisasi tidak menentukan lain.

Retention final dapat disesuaikan setelah data-volume/cost review, tetapi tidak boleh diubah tanpa operational decision yang terdokumentasi.

---

# 15. Recovery Objectives

Baseline operational objectives untuk production:

## 15.1 RPO — Recovery Point Objective

Target:

> **RPO <= 15 minutes** untuk canonical production database.

Artinya desain backup/PITR harus menargetkan kehilangan data maksimal sekitar 15 menit pada database disaster scenario.

## 15.2 RTO — Recovery Time Objective

Target:

> **RTO <= 2 hours** untuk pemulihan service production pada database/runtime disaster yang dapat direcover dengan prosedur standar.

RPO/RTO adalah target engineering, bukan jaminan kontraktual SLA eksternal.

Jika provider/infrastruktur yang dipilih tidak dapat memenuhi target ini, gap harus diterima secara eksplisit sebelum go-live.

---

# 16. Restore Procedure

Restore harus dilakukan ke environment terisolasi terlebih dahulu bila incident memungkinkan.

Canonical restore flow:

```text
Declare recovery point
→ protect current evidence
→ create isolated restore
→ verify schema/migration version
→ run integrity checks
→ verify critical employee/schedule/payroll samples
→ verify audit history
→ verify auth/access records
→ approve recovery
→ cut over / replace production data source
→ post-recovery smoke
→ incident documentation
```

Integrity verification minimal:

- employee count/sample,
- latest published schedule,
- schedule period/version references,
- payroll locked historical sample,
- compensation effective versions,
- role/permission records,
- audit event continuity.

---

# 17. Restore Drill

Backup restore drill wajib minimal **quarterly** setelah production aktif.

Drill harus mencatat:

- backup point yang dipakai,
- waktu mulai/selesai,
- actual recovery duration,
- data integrity result,
- issue/runbook gap,
- remediation owner.

Failure restore drill adalah operational defect dan harus ditindaklanjuti.

---

# 18. Application Data Recovery Guardrails

Tidak semua kesalahan user membutuhkan database restore.

Contoh:

- salah assign shift → controlled schedule correction,
- salah salary effective date → compensation correction/revision,
- salah payroll adjustment → payroll revision/correction flow,
- role salah → access correction + audit.

Database restore hanya untuk failure class seperti:

- widespread accidental deletion,
- storage corruption,
- unrecoverable migration corruption,
- provider/database disaster,
- severe malicious modification yang tidak praktis dikoreksi granular.

---

# 19. Health Check Contract

Recommended health surfaces:

## 19.1 Liveness

Conceptual endpoint:

`GET /api/health/live`

Menjawab apakah process/application runtime hidup.

Tidak perlu melakukan expensive dependency check setiap request.

---

## 19.2 Readiness

Conceptual endpoint:

`GET /api/health/ready`

Minimal mengevaluasi dependency kritis yang diperlukan untuk melayani request, terutama database connectivity.

Response tidak boleh membocorkan:

- connection string,
- host credential,
- secret,
- stack trace internal.

---

## 19.3 Deep Health

Deep diagnostic boleh tersedia untuk authenticated operator atau monitoring system, bukan public sensitive endpoint.

Dapat mencakup:

- database latency,
- migration compatibility,
- background worker state future,
- queue/outbox backlog future.

---

# 20. Structured Logging

Production menggunakan structured logs.

Recommended common fields:

```text
timestamp
level
environment
release_id
service
request_id
correlation_id
route
method
status_code
duration_ms
actor_id (when safe/relevant)
error_code
```

Business sensitive payload tidak dicatat mentah.

---

# 21. Logging Hygiene

Dilarang mencatat:

- password,
- session token,
- raw cookie,
- API secret,
- private key,
- database connection string,
- Better Auth secret,
- raw authorization header.

Salary/payroll values tidak perlu masuk generic request log kecuali diagnostic event yang benar-benar memerlukan dan policy mengizinkan; audit/business record tetap canonical.

Log user-provided text harus disanitasi/structured agar tidak merusak log parsing.

---

# 22. Correlation & Request Identity

Setiap HTTP request harus memiliki `request_id`.

Multi-step business operation menggunakan `correlation_id` sesuai PRD-09/15.

Contoh publish schedule:

```text
request_id: one HTTP request
correlation_id: business publish operation
```

Correlation membantu menghubungkan:

- API log,
- domain event,
- audit event,
- notification generation,
- operational error.

---

# 23. Metrics

Minimum production metrics/signals:

## Application

- request count,
- error count/rate,
- response latency,
- status code distribution,
- active release.

## Database

- connectivity,
- connection usage/pool pressure,
- query latency trend,
- transaction failure,
- storage trend.

## Authentication

- login success/failure trend,
- rate-limited auth attempts,
- invalid/expired session trend.

## Business Operations

Recommended operational counters without exposing sensitive detail:

- schedule publish success/failure,
- payroll calculate success/failure,
- payroll finalize/lock failure,
- request approval failure,
- notification generation failure,
- export failure.

Metrics tidak menggantikan report business PRD-17.

---

# 24. Performance Signals

Track latency secara terpisah untuk flow berat seperti:

- schedule period load,
- schedule validation,
- publish,
- payroll calculate,
- payroll report,
- activity history query,
- export generation.

Performance regression harus dibandingkan dengan dataset representatif, bukan database kosong.

---

# 25. Alerting Model

Alert severity:

## SEV-1 — Critical

Contoh:

- production unavailable,
- widespread database failure,
- suspected data corruption,
- unauthorized high-risk mutation evidence,
- payroll integrity failure,
- backup/recovery failure menjelang recovery need.

Requires immediate operator attention.

## SEV-2 — High

Contoh:

- elevated 5xx sustained,
- authentication widespread failure,
- schedule publish failure sustained,
- payroll processing failure,
- database pool near exhaustion.

## SEV-3 — Warning

Contoh:

- latency degradation,
- storage trend risk,
- unusual auth failure spike,
- failed scheduled backup with previous healthy recovery point.

## SEV-4 — Informational

Contoh:

- deployment completed,
- dependency maintenance notice,
- non-critical job retry.

---

# 26. Alert Noise Control

Alerts harus:

- deduplicated,
- grouped by incident/signature,
- memiliki threshold/duration agar transient spike tidak selalu page operator,
- auto-resolve bila signal pulih bila tooling mendukung,
- tetap menyimpan incident history.

Repeated identical error tidak boleh menghasilkan ratusan independent urgent alerts.

---

# 27. Availability & Reliability Targets

NOCScheduler adalah internal operational system.

Baseline engineering objective:

- production tersedia selama kebutuhan operasional utama,
- planned maintenance dikomunikasikan,
- release tidak dilakukan sembarangan saat periode payroll/finalization kritis jika dapat dihindari,
- recovery process tersedia untuk outage besar.

Formal external SLA tidak ditetapkan dalam PRD ini.

---

# 28. Maintenance Window Awareness

Perubahan berisiko tinggi seperti:

- destructive migration,
- major runtime upgrade,
- auth migration,
- database major version upgrade,

sebaiknya dilakukan pada maintenance window yang diketahui tim.

Hindari maintenance berisiko tepat sebelum:

- shift transition penting,
- schedule publication deadline,
- payroll finalization/lock window.

---

# 29. Incident Response Lifecycle

Canonical incident flow:

```text
Detect
→ Triage
→ Classify Severity
→ Contain
→ Restore Service
→ Verify Data Integrity
→ Communicate
→ Root Cause Analysis
→ Corrective Action
→ Close
```

Service restoration lebih dulu daripada mencari blame.

---

# 30. Incident Roles

Untuk tim kecil, role dapat dirangkap tetapi responsibility harus jelas:

- **Incident Lead** — koordinasi dan keputusan,
- **Technical Responder** — diagnosis/fix,
- **Data Integrity Owner** — memverifikasi schedule/payroll/history,
- **Communicator** — update user/stakeholder bila diperlukan.

P0/SEV-1 incident tidak boleh dianggap selesai hanya karena UI kembali terbuka; data integrity harus diverifikasi.

---

# 31. Incident Communication

Internal incident update minimal menjelaskan:

- apa yang terdampak,
- kapan mulai,
- apakah mutation perlu dihentikan,
- apakah data integrity diketahui aman/tidak,
- workaround jika ada,
- status recovery.

Jangan menyebarkan secret atau sensitive raw diagnostic ke channel umum.

---

# 32. Post-Incident Review

SEV-1 dan material SEV-2 membutuhkan post-incident review.

Minimum:

- timeline,
- trigger,
- root cause,
- detection gap,
- response effectiveness,
- customer/user impact,
- data integrity result,
- corrective action,
- owner,
- due date.

Review harus fokus pada system/process improvement.

---

# 33. Secret Management Operations

Production secrets disimpan melalui secure secret/environment management platform.

Secret harus:

- tidak berada di Git,
- tidak berada di client bundle,
- memiliki least-privilege access,
- dapat dirotasi,
- berbeda antarenvironment.

Secret inventory minimal mencatat jenis secret dan owner tanpa menyimpan plaintext value di dokumentasi.

---

# 34. Secret Rotation

Runbook rotation harus tersedia untuk minimal:

- Better Auth secret/session-related key bila mekanisme mendukung,
- database credential,
- deployment token,
- external integration key future.

Jika secret diduga bocor:

1. revoke/rotate,
2. invalidate dependent access bila relevan,
3. inspect logs/audit,
4. verify no unauthorized mutation,
5. document incident.

---

# 35. Database Credential Separation

Recommended roles:

## Application Runtime Role

- read/write application tables,
- no superuser,
- no normal DDL privilege.

## Migration Role

- schema change privilege,
- digunakan hanya deployment migration process,
- credential lebih terbatas distribusinya.

## Backup/Operations Role

Jika provider/architecture membutuhkan, gunakan access khusus sesuai least privilege.

---

# 36. Configuration Validation

Environment config harus divalidasi saat startup/build sesuai jenis value.

Production tidak boleh berjalan dengan silent fallback untuk critical configuration seperti:

- database URL,
- auth secret,
- canonical base URL,
- trusted origin,
- encryption/security configuration yang required.

Fail fast lebih aman daripada berjalan dalam configuration yang tidak diketahui.

---

# 37. Data Retention Operations

Retention harus membedakan:

- canonical historical business data,
- audit history,
- notification history,
- application logs,
- metrics,
- backup.

Historical schedule/payroll/audit tidak boleh dihapus hanya untuk menghemat log storage.

Log/metrics retention dapat lebih pendek karena sifatnya operational telemetry.

Exact retention ditentukan berdasarkan volume, biaya, dan policy organisasi.

---

# 38. Audit Durability

High-risk mutation dan audit evidence harus berada dalam consistency model yang mencegah successful mutation tanpa trace sebagaimana PRD-09/16.

Operational log outage tidak boleh otomatis menghapus canonical audit record.

Jika external log sink gagal, application dapat menggunakan retry/buffering/tooling provider tanpa menjadikan generic log sink bagian transaction business utama.

---

# 39. Background Job Operations

MVP tidak wajib memiliki worker terpisah.

Jika background worker ditambahkan untuk:

- external notification,
- exports,
- scheduled jobs,
- outbox,

maka wajib memiliki:

- idempotent job handling,
- retry policy,
- dead-letter/failure visibility equivalent,
- correlation ID,
- backlog metric,
- safe replay semantics.

---

# 40. Capacity & Scaling

Scale berdasarkan evidence.

Observe:

- employee count,
- schedule assignment volume,
- audit event growth,
- payroll history growth,
- report query latency,
- concurrent users,
- database connection pressure.

Scaling order recommended:

```text
Optimize query/index
→ tune connection/runtime
→ scale app instances
→ scale database resources
→ introduce cache/read model
→ background heavy work
→ advanced architecture only if needed
```

Jangan lompat langsung ke distributed system.

---

# 41. Database Performance Operations

Operations harus memiliki visibility terhadap:

- slow query trends,
- missing/index misuse evidence,
- long transaction,
- lock contention,
- connection saturation,
- storage growth.

Payroll/report optimization tidak boleh mengorbankan consistency untuk sekadar mengejar benchmark.

---

# 42. Time & Timezone Operations

Infrastructure timezone tidak boleh mengubah business semantics.

Rules:

- business timezone canonical = `Asia/Jakarta`,
- audit timestamp dapat UTC,
- `work_date` tidak berasal dari server local timezone secara implicit,
- scheduled job future harus mengkonversi explicit timezone,
- backup timestamps harus unambiguous.

---

# 43. Deployment During Payroll/Schedule Critical Windows

Release berisiko tinggi harus dihindari ketika tim sedang:

- publish jadwal bulanan,
- melakukan mass correction,
- calculate payroll final,
- finalize payroll,
- lock payroll.

Low-risk patch dapat tetap dilakukan berdasarkan severity/need, tetapi release owner harus memahami operational context.

---

# 44. Feature Flags

Feature flag diperbolehkan untuk:

- staged rollout,
- incomplete but hidden infrastructure,
- risky UX capability,
- future integration.

Feature flag tidak boleh menjadi cara permanen menghindari migration cleanup atau authorization design.

High-risk permission tidak boleh hanya dilindungi client-side feature flag.

---

# 45. Release Notes

Setiap material production release sebaiknya memiliki concise release note:

- release ID/commit,
- tanggal,
- user-visible change,
- migration yes/no,
- known limitation,
- rollback consideration bila ada.

Internal user tidak membutuhkan changelog teknis penuh, tetapi perubahan workflow penting harus dapat diketahui.

---

# 46. Dependency & Runtime Upgrade Operations

Upgrade major/minor penting pada:

- Next.js,
- React,
- PostgreSQL,
- Better Auth,
- Drizzle,
- Zod,
- Playwright,

harus dianggap controlled maintenance/change.

Harus melewati relevant regression/security tests dan migration compatibility review.

Jangan melakukan blind auto-upgrade production dependencies.

---

# 47. Production Access

Administrative production infrastructure access harus least privilege.

Recommended:

- named accounts,
- MFA pada infrastructure/provider account bila tersedia,
- avoid shared credential,
- log/audit infrastructure access bila provider mendukung,
- emergency credential disimpan aman.

Database GUI/direct query access production harus dibatasi dan bukan workflow normal untuk business mutation.

---

# 48. Manual Data Fix Policy

Direct SQL update terhadap production business data dilarang sebagai workflow rutin.

Jika exceptional data repair benar-benar diperlukan:

- incident/ticket/reference harus ada,
- backup/recovery awareness,
- query direview,
- affected scope diketahui,
- transaction digunakan,
- before/after evidence disimpan,
- audit/business correction dibuat bila domain membutuhkan,
- post-fix validation dilakukan.

Prefer application-level correction command jika tersedia.

---

# 49. Disaster Scenarios

Runbook minimal harus mempertimbangkan:

1. application deployment failure,
2. database unavailable,
3. accidental destructive migration,
4. widespread accidental data deletion,
5. credential/secret leak,
6. auth service/session failure,
7. corrupted payroll calculation release,
8. corrupted schedule mutation release,
9. monitoring/logging outage,
10. provider outage.

---

# 50. Payroll Corruption Response

Jika release diduga menghasilkan payroll salah:

1. stop/freeze payroll mutation bila diperlukan,
2. identify affected release/time range,
3. identify affected payroll periods/records,
4. preserve current data/evidence,
5. rollback faulty application,
6. compare canonical source + revisions,
7. recalculate only through controlled domain workflow,
8. never overwrite locked historical payroll silently,
9. audit correction,
10. notify relevant internal actor.

---

# 51. Schedule Corruption Response

Jika release menghasilkan schedule mutation salah:

1. disable/freeze problematic mutation,
2. preserve audit/revision evidence,
3. rollback application if appropriate,
4. identify affected employee/work dates,
5. use controlled schedule correction/revision,
6. evaluate downstream payroll dirty impact,
7. notify affected employee if published schedule changed.

---

# 52. Operational Dashboards

Minimum operator dashboard should surface:

- production status,
- active release,
- request/error rate,
- response latency,
- database health,
- recent deployment,
- failed critical operations,
- backup health,
- latest restore drill status/age,
- alert state.

Business dashboard dalam aplikasi tetap berbeda dari operator dashboard.

---

# 53. Production Readiness Review

Sebelum initial go-live, review wajib memeriksa:

## Application

- production build works,
- env schema valid,
- secure headers configured,
- domain smoke healthy.

## Database

- migration successful,
- runtime role least privilege,
- indexes/constraints present,
- backup enabled.

## Authentication & Security

- production secret unique,
- trusted origin correct,
- cookie/session policy production-ready,
- rate limit/security baseline enabled.

## Operations

- health checks available,
- logs available,
- metrics/alerts configured,
- rollback known,
- restore tested,
- incident contact/owner known.

## Product Integrity

- schedule core flow accepted,
- payroll core flow accepted,
- historical/audit verification passed,
- desktop/mobile critical flow passed.

---

# 54. Go-Live Checklist

Production go-live minimum:

- [ ] PRD-19 Release Ready satisfied
- [ ] Production DB created and access restricted
- [ ] Migrations applied successfully
- [ ] Backup/PITR enabled
- [ ] Restore test completed successfully
- [ ] RPO/RTO capability reviewed
- [ ] Production secrets configured
- [ ] Better Auth production config verified
- [ ] Domain/trusted origins verified
- [ ] HTTPS enabled
- [ ] Security headers verified
- [ ] Health checks healthy
- [ ] Logging operational
- [ ] Monitoring/alerting operational
- [ ] Application rollback path tested
- [ ] Incident runbook available
- [ ] Operator access known
- [ ] Release identifier visible in operations tooling
- [ ] Core business smoke passed
- [ ] No P0/P1 unresolved defect

---

# 55. Operational Definition of Done

Operational capability dianggap Done jika:

1. environment terisolasi,
2. deployment reproducible,
3. commit/release traceable,
4. migration versioned,
5. migration failure behavior diketahui,
6. rollback tersedia,
7. database backup otomatis,
8. recovery target didefinisikan,
9. restore telah dibuktikan,
10. health checks tersedia,
11. logs structured,
12. secrets tidak bocor ke logs/source,
13. metrics tersedia,
14. alerts actionable,
15. incident severity jelas,
16. runbook tersedia,
17. production access least privilege,
18. manual SQL fix terkontrol,
19. schedule/payroll corruption runbook tersedia,
20. release window mempertimbangkan operasi NOC,
21. staging/release verification tersedia,
22. backup retention diketahui,
23. restore drill cadence diketahui,
24. active release dapat diidentifikasi,
25. operational owner dapat merespons incident.

---

# 56. Canonical Operations Rules

- **OPS-001** — Production deploy hanya dari known version-controlled revision.
- **OPS-002** — Production revision harus traceable ke commit SHA.
- **OPS-003** — Direct manual file patch production dilarang.
- **OPS-004** — `main` harus melewati required quality gates sebelum release.
- **OPS-005** — Production dan staging database harus terpisah.
- **OPS-006** — Preview environment tidak boleh menggunakan production DB.
- **OPS-007** — Production secret harus berbeda dari non-production.
- **OPS-008** — Production runtime DB role tidak boleh superuser.
- **OPS-009** — Migration harus version-controlled.
- **OPS-010** — Production migration tidak menggunakan uncontrolled schema push sebagai workflow normal.
- **OPS-011** — Destructive migration membutuhkan explicit recovery plan.
- **OPS-012** — Application rollback tidak otomatis melakukan DB rollback.
- **OPS-013** — Full DB restore bukan deployment rollback biasa.
- **OPS-014** — Backup production wajib otomatis.
- **OPS-015** — Backup harus encrypted/restricted sesuai provider capability.
- **OPS-016** — Backup health harus dapat dipantau.
- **OPS-017** — Restore procedure wajib terdokumentasi.
- **OPS-018** — Restore drill dilakukan minimal quarterly.
- **OPS-019** — Target RPO production <= 15 menit.
- **OPS-020** — Target RTO production <= 2 jam.
- **OPS-021** — Health endpoint tidak membocorkan secret.
- **OPS-022** — Liveness dan readiness memiliki semantics berbeda.
- **OPS-023** — Structured log wajib memiliki environment/release context.
- **OPS-024** — Password/token/cookie/secret tidak boleh masuk log.
- **OPS-025** — Request ID harus tersedia untuk request production.
- **OPS-026** — Business multi-step operation menggunakan correlation ID bila relevan.
- **OPS-027** — Audit trail tidak digantikan application logs.
- **OPS-028** — Metrics tidak menggantikan business reports.
- **OPS-029** — Critical alert harus actionable.
- **OPS-030** — Repeated alert wajib memiliki noise-control strategy.
- **OPS-031** — SEV-1 membutuhkan immediate operational response.
- **OPS-032** — SEV-1 resolution membutuhkan data integrity verification.
- **OPS-033** — Material incident membutuhkan documented timeline.
- **OPS-034** — Production secrets disimpan di secure secret manager/environment system.
- **OPS-035** — Secret yang diduga bocor harus dirotasi/revoke.
- **OPS-036** — Production infrastructure account menggunakan least privilege.
- **OPS-037** — Direct production SQL mutation bukan normal business workflow.
- **OPS-038** — Exceptional manual data fix harus meninggalkan evidence.
- **OPS-039** — Release berisiko tinggi mempertimbangkan schedule/payroll critical window.
- **OPS-040** — Production config critical harus fail fast jika invalid.
- **OPS-041** — Business timezone tetap Asia/Jakarta terlepas infra timezone.
- **OPS-042** — Backup timestamp/recovery point harus unambiguous.
- **OPS-043** — Background job future harus idempotent/retry-safe.
- **OPS-044** — Queue/outbox future harus observable.
- **OPS-045** — Scaling dilakukan berdasarkan evidence.
- **OPS-046** — Slow query/database pressure harus observable.
- **OPS-047** — Application deployment harus memiliki post-deploy verification.
- **OPS-048** — Production release identifier harus dapat ditemukan operator.
- **OPS-049** — Rollback target harus diketahui sebelum high-risk release.
- **OPS-050** — Migration failure tidak boleh diteruskan dengan incompatible app deployment.
- **OPS-051** — Backup restore harus memverifikasi schedule/payroll/audit integrity sample.
- **OPS-052** — Locked payroll tidak boleh silently diperbaiki melalui raw restore/correction flow.
- **OPS-053** — Schedule corruption recovery harus mengevaluasi payroll impact.
- **OPS-054** — Monitoring outage tidak boleh dianggap sama dengan application outage tanpa evidence.
- **OPS-055** — Operational telemetry retention dipisahkan dari historical business retention.
- **OPS-056** — Git repository adalah source of truth deployment code/config templates, bukan plaintext secret.
- **OPS-057** — Dependency/runtime upgrade penting harus controlled and tested.
- **OPS-058** — Preview/staging user data harus synthetic atau sanitized.
- **OPS-059** — Go-live membutuhkan proven restore, bukan hanya configured backup.
- **OPS-060** — PRD-20 operational readiness adalah bagian dari Release Ready production.

---

# 57. Operational Acceptance Tests

| ID | Scenario | Expected |
|---|---|---|
| OPR-T01 | Deploy known commit | release ID = expected commit |
| OPR-T02 | Invalid production env | startup/deploy fails safely |
| OPR-T03 | DB unavailable | readiness fails; critical mutation unavailable |
| OPR-T04 | Liveness without DB | process status semantics remain distinct |
| OPR-T05 | Failed migration | incompatible application not promoted |
| OPR-T06 | App regression | previous known-good revision can be restored |
| OPR-T07 | Backup job | recovery point exists and is monitored |
| OPR-T08 | Isolated restore | database restores successfully |
| OPR-T09 | Restored schedule sample | published history reconstructs correctly |
| OPR-T10 | Restored payroll sample | locked payroll remains correct |
| OPR-T11 | Restored audit sample | audit continuity/evidence available |
| OPR-T12 | Secret in error input | secret not present in logs |
| OPR-T13 | HTTP request | request_id available |
| OPR-T14 | Publish schedule | correlation across operational/audit signals works |
| OPR-T15 | Error spike | alert fires according to policy |
| OPR-T16 | Error resolves | alert resolves/deduplicates appropriately |
| OPR-T17 | Production DB role | cannot perform unauthorized DDL |
| OPR-T18 | Preview build | cannot connect to production DB |
| OPR-T19 | Rollback after compatible migration | previous revision remains functional |
| OPR-T20 | Stale production release | operator can identify active version |
| OPR-T21 | Backup retention | required recovery range available |
| OPR-T22 | Quarterly restore drill | duration/result documented |
| OPR-T23 | Manual repair simulation | evidence + verification process followed |
| OPR-T24 | Payroll corruption simulation | mutation frozen, impacted scope identifiable |
| OPR-T25 | Schedule corruption simulation | corrections preserve revision/audit history |
| OPR-T26 | Auth secret rotation runbook | rotation path documented/tested safely |
| OPR-T27 | Health endpoint public probe | no secret/internal stack leakage |
| OPR-T28 | Production smoke | login/dashboard/schedule/payroll reads healthy |
| OPR-T29 | High-risk release checklist | rollback + recovery state reviewed |
| OPR-T30 | Go-live review | all mandatory operational gates satisfied |

---

# 58. Implementation Phases

## OPS-F0 — Deployment Foundation

- environment schema,
- CI quality gate,
- staging/production separation,
- immutable release identification,
- migration pipeline,
- basic rollback.

## OPS-F1 — Backup & Observability

- automated database backup/PITR,
- structured logs,
- request/correlation IDs,
- health checks,
- basic metrics,
- critical alerts.

## OPS-F2 — Operational Reliability

- restore drill automation/runbook,
- incident playbooks,
- advanced DB observability,
- deployment windows,
- release notes,
- secret rotation runbooks.

## OPS-F3 — Scale & Advanced Operations

Only if justified:

- worker/outbox operations,
- async export observability,
- read replica,
- advanced tracing,
- more sophisticated SLO/error budget,
- multi-region/disaster topology.

---

# 59. Final Production Contract

NOCScheduler production dinyatakan operationally ready hanya jika:

```text
Code is traceable
+ Release is reproducible
+ Migration is controlled
+ Rollback is possible
+ Backup is automatic
+ Restore is proven
+ RPO/RTO are understood
+ Runtime is observable
+ Alerts are actionable
+ Secrets are protected
+ Incidents have runbooks
+ Schedule/payroll integrity can be verified after failure
```

Tujuan akhirnya bukan membuat production tidak pernah gagal.

Tujuannya adalah memastikan bahwa ketika sesuatu gagal:

> **kita cepat tahu, dampaknya dapat dibatasi, data dapat dipercaya, dan service dapat dipulihkan dengan prosedur yang sudah dibuktikan.**

---

# 60. PRD Series Completion

Dengan PRD-20, rangkaian baseline product specification NOCScheduler PRD-01 sampai PRD-20 lengkap mencakup:

- product scope,
- features,
- scheduling,
- payroll,
- operational exception,
- information architecture,
- roles/permissions,
- data architecture,
- audit/history,
- UI/UX,
- design system,
- responsive/mobile,
- visual quality,
- technical architecture,
- API/backend,
- authentication/security,
- reporting,
- notifications,
- QA/testing,
- deployment/operations.

PRD-01 through PRD-20 bersama-sama menjadi baseline implementation contract untuk tahap engineering NOCScheduler berikutnya.