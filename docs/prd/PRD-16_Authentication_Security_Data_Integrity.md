# PRD-16 — Authentication, Security & Data Integrity

> **Architecture Amendment:** Platform-specific persistence, authentication, hosting, deployment, and database assumptions in this document are superseded where they conflict with **PRD-21 — Firebase Platform Architecture Amendment**. Product/business requirements remain canonical.

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Authentication, Security & Data Integrity  
> **Document ID:** PRD-16  
> **Status:** Draft — Security Source of Truth  
> **Depends On:** PRD-01 through PRD-15  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **authentication security, session security, authorization enforcement, CSRF protection, XSS prevention, Content Security Policy, input validation, injection prevention, rate limiting, account lifecycle, password handling, secret management, secure headers, logging hygiene, dependency/supply-chain security, data integrity, concurrency protection, high-risk mutation safeguards, recovery controls, dan security verification baseline** untuk NOCScheduler.

PRD-16 menjadi source of truth untuk menjawab:

> **“Bagaimana NOCScheduler memastikan bahwa hanya actor yang sah dapat mengakses dan mengubah data, request tidak dapat dipalsukan atau dimanipulasi, data historis dan payroll tidak rusak, serta aplikasi tetap aman tanpa membuat workflow internal menjadi menyusahkan?”**

Dokumen ini memperdalam:

- PRD-07 — Roles, Permissions & Internal Transparency,
- PRD-08 — Data Model & Database Architecture,
- PRD-09 — Audit Trail & Historical Data,
- PRD-14 — Technical Architecture & Technology Stack,
- PRD-15 — API & Backend Contract.

Security pada NOCScheduler bukan alasan untuk mengurangi transparansi internal yang memang menjadi keputusan produk. Fokus security adalah:

1. memastikan user benar-benar terautentikasi,
2. memastikan mutation hanya dilakukan actor yang berhak,
3. mencegah request palsu/manipulasi client,
4. menjaga data scheduling dan payroll tetap benar,
5. menjaga credential, session, dan secret tidak bocor,
6. menyediakan evidence ketika sesuatu berubah atau gagal.

---

# 2. Security Baseline

## 2.1 Verification Baseline

NOCScheduler menggunakan baseline berikut sebagai rujukan engineering security:

- OWASP Application Security Verification Standard (ASVS) 5.0.0,
- OWASP Top 10:2025,
- OWASP Cheat Sheet Series yang relevan,
- security guidance resmi Better Auth,
- security guidance resmi Next.js untuk deployment yang digunakan.

PRD ini tidak mengklaim sertifikasi formal ASVS. Tujuannya adalah menggunakan standar tersebut sebagai checklist verifikasi dan arah secure-by-design.

---

## 2.2 Primary Threat Areas

NOCScheduler harus secara eksplisit mempertimbangkan minimal:

- broken access control,
- authentication failure,
- session theft,
- privilege escalation,
- CSRF,
- XSS,
- injection,
- insecure direct object reference / BOLA,
- security misconfiguration,
- secret leakage,
- vulnerable dependencies,
- unsafe logging,
- replay/duplicate mutation,
- concurrent overwrite,
- historical data corruption,
- payroll manipulation,
- unauthorized schedule publication,
- audit bypass,
- malicious or malformed export/import content bila fitur tersedia.

---

# 3. Core Security Principles

## SEC-P01 — Server Is the Trust Boundary

Browser dan client payload dianggap untrusted.

Client tidak boleh dipercaya untuk menentukan:

- user identity,
- permission,
- employee scope,
- salary value yang berlaku,
- incentive rate yang berlaku,
- payroll status,
- locked/unlocked state,
- schedule publication state,
- request approval state,
- audit actor.

Semua fakta tersebut harus diverifikasi server-side.

---

## SEC-P02 — Deny by Default

Jika permission, scope, atau state transition tidak dapat ditentukan dengan jelas, action harus ditolak.

Tidak boleh ada fallback seperti:

```text
unknown permission => allow
```

---

## SEC-P03 — Read Broadly, Mutate Narrowly

Transparansi internal tetap dipertahankan sesuai PRD-07.

Namun mutation harus menggunakan capability/permission eksplisit.

Read visibility tidak pernah menyiratkan mutation privilege.

---

## SEC-P04 — Defense in Depth

Security control tidak boleh bergantung pada satu lapisan saja.

Contoh mutation protected harus melewati kombinasi:

```text
Valid Session
+ Origin/CSRF Protection
+ Runtime Input Validation
+ Authorization
+ Business Validation
+ Database Constraints
+ Concurrency Guard
+ Audit Evidence
```

---

## SEC-P05 — Historical Integrity Is Security

Mengubah payroll atau jadwal historis secara tidak sah adalah security incident walaupun tidak ada credential yang bocor.

Historical integrity harus dilindungi oleh:

- versioning,
- immutable/controlled revisions,
- effective dating,
- payroll snapshots,
- audit trail,
- lock state,
- permission guards.

---

## SEC-P06 — No Security by UI

Hidden button, disabled menu, atau route yang tidak ditampilkan bukan kontrol security.

Direct URL dan crafted HTTP request tetap harus menghasilkan authorization decision yang benar.

---

## SEC-P07 — Fail Closed for High-Risk Operations

Publish schedule, compensation mutation, payroll finalization/lock/unlock, dan access-control mutation harus gagal jika komponen security kritis tidak tersedia.

Contoh:

- permission service gagal,
- required audit write gagal,
- expectedVersion tidak cocok,
- transaction gagal.

Jangan melanjutkan mutation dalam degraded security state.

---

## SEC-P08 — Least Privilege

Human account, database account, CI token, deployment credential, dan integration secret hanya diberikan capability minimum yang diperlukan.

---

## SEC-P09 — Secrets Never Belong in Source Code

Credential dan secret tidak boleh:

- hardcoded,
- committed ke Git,
- dikirim ke browser bundle,
- dimasukkan ke public runtime config,
- ditulis ke log.

---

## SEC-P10 — Security Controls Must Remain Usable

Security yang terlalu mengganggu akan mendorong workaround.

Kontrol harus kuat tetapi UX tetap jelas:

- error dapat dipahami,
- session expiry tidak merusak draft tanpa warning bila dapat dicegah,
- confirmation hanya untuk action yang memang berisiko,
- permission denied menjelaskan bahwa action tidak tersedia tanpa membocorkan detail sensitif.

---

# 4. Authentication Architecture

## 4.1 Authentication Provider

Baseline authentication menggunakan **Better Auth** sesuai PRD-14.

Baseline login:

- internal email/login identifier,
- password.

Future-compatible:

- SSO/OIDC,
- passkey,
- 2FA/MFA.

Penambahan metode baru tidak boleh mengganti authorization model NOCScheduler.

---

## 4.2 Authentication Is Separate from Employee Identity

`User` adalah authentication principal.

`Employee` adalah business identity.

Disabling login account tidak boleh menghapus historical employee data.

---

## 4.3 Login Response

Login failure tidak boleh membocorkan secara tidak perlu apakah:

- email ada,
- account disabled,
- password salah.

UI boleh memberikan message generik seperti credential tidak valid, sementara server log internal dapat mencatat classification yang lebih spesifik tanpa menyimpan password.

---

## 4.4 Disabled Account

User berstatus disabled:

- tidak dapat membuat session baru,
- active session sebaiknya direvoke sesuai policy,
- tidak kehilangan historical audit attribution,
- employee record tidak otomatis dihapus.

---

# 5. Password Security

## 5.1 Password Storage

Password tidak pernah disimpan plaintext atau reversible encryption.

Gunakan password hashing yang disediakan/configured oleh Better Auth dengan memory-hard/adaptive algorithm yang memenuhi baseline security saat implementasi.

Jika default Better Auth digunakan, implementation harus memverifikasi parameter aktual saat project setup dan upgrade dependency.

---

## 5.2 Password Policy

Baseline UX policy:

- izinkan passphrase panjang,
- jangan memaksa pola artificial seperti wajib simbol tertentu jika tidak memberi manfaat nyata,
- jangan silently truncate password,
- gunakan minimum length yang layak,
- beri maximum length untuk mencegah abuse tanpa terlalu membatasi passphrase.

Recommended initial product baseline:

- minimum 12 characters untuk password lokal baru,
- maximum minimal 128 characters kecuali hashing/provider mempunyai batas berbeda yang harus dipertimbangkan eksplisit.

Policy final dapat diperketat berdasarkan lingkungan organisasi.

---

## 5.3 Password Change

Password change harus:

- memerlukan session valid,
- memerlukan current password atau equivalent strong re-authentication bila sesuai flow,
- menghasilkan audit security event,
- menawarkan/rekomendasikan revocation session lain.

---

## 5.4 Password Reset

Jika reset flow diaktifkan:

- token harus random dan short-lived,
- one-time use,
- disimpan/ditangani secara aman,
- response tidak membocorkan apakah account ada,
- reset sukses harus menginvalidate token,
- session lama dapat direvoke sesuai policy.

MVP internal boleh menggunakan controlled admin-assisted reset bila email delivery belum tersedia, tetapi admin tidak boleh mengetahui password baru user.

---

# 6. Session Security

## 6.1 Session Storage

Prefer database-backed/session mechanism dari Better Auth.

Session token tidak boleh disimpan di `localStorage` sebagai baseline browser auth.

---

## 6.2 Session Cookie

Production session cookie wajib:

- `HttpOnly`,
- `Secure`,
- appropriate `SameSite`,
- scoped sesempit mungkin,
- tidak menggunakan broad domain cookie tanpa kebutuhan nyata.

Host-only cookie lebih disukai bila deployment hanya satu host.

---

## 6.3 Session Expiration

Session memiliki finite lifetime.

Exact expiration dan idle/update behavior ditetapkan saat implementation berdasarkan Better Auth configuration dan operasional internal.

Requirement:

- tidak indefinite,
- expired session ditolak server-side,
- UI menangani expiry dengan jelas,
- high-risk action tidak boleh memakai stale client permission state.

---

## 6.4 Session Revocation

System harus mendukung revocation session untuk:

- logout,
- account disable,
- suspected compromise,
- password reset/change sesuai policy,
- admin security response.

User dapat diberikan kemampuan melihat dan revoke session perangkat lain sebagai P1 security feature.

---

## 6.5 Permission Freshness

Permission untuk critical mutation harus dievaluasi dari current server-side authorization state.

Jangan mengandalkan permission snapshot yang ditanam ke browser pada saat login dan berlaku tanpa batas.

---

# 7. CSRF & Origin Security

## 7.1 Better Auth Security Checks Stay Enabled

Production tidak boleh mengaktifkan configuration yang menonaktifkan CSRF/origin validation hanya untuk mempermudah integration.

`disableCSRFCheck` dan `disableOriginCheck` dilarang pada normal production configuration.

Exception harus melalui explicit security review.

---

## 7.2 Trusted Origins

`trustedOrigins` harus explicit allowlist.

Jangan menggunakan wildcard broad yang tidak dibutuhkan.

Development origin dipisahkan dari production configuration.

---

## 7.3 State-Changing GET Is Forbidden

NOCScheduler-owned endpoint `GET` harus read-only.

State-changing operation wajib menggunakan POST/PUT/PATCH/DELETE sesuai semantics API.

Exception protocol callback milik auth provider harus mengikuti security mechanism provider.

---

## 7.4 Application API CSRF Defense

Untuk cookie-authenticated `/api/v1` mutation:

- validate expected origin/site context,
- reject untrusted browser origins,
- require JSON/non-simple request pattern where practical,
- preserve SameSite cookie defense-in-depth,
- introduce explicit CSRF token mechanism apabila deployment pattern membutuhkan protection tambahan.

Jangan berasumsi `SameSite` sendirian menyelesaikan seluruh CSRF risk.

---

# 8. Authorization & Access Control Security

## 8.1 Central Capability Service

Authorization menggunakan canonical service:

```text
can(actor, permission, context)
requirePermission(actor, permission, context)
```

Business route tidak boleh membuat authorization sendiri dengan role-name comparison adhoc.

---

## 8.2 Object-Level Authorization

Endpoint yang menerima resource ID wajib memverifikasi bahwa actor berhak terhadap resource tersebut.

Contoh:

```text
/payroll-records/:id
/requests/:id
/employees/:id
```

Tidak cukup hanya memverifikasi user sudah login.

---

## 8.3 Self-Service Identity Binding

Untuk self-service operation, subject identity harus berasal dari server session bila action memang `SELF`.

Client tidak boleh mengganti `employeeId` untuk membuat request atas nama orang lain kecuali actor mempunyai explicit permission `ALL`/delegated capability.

---

## 8.4 Privilege Escalation Guard

Role/permission mutation harus:

- membutuhkan `access.manage` atau permission lebih granular,
- mencegah user tanpa authority memberi dirinya permission baru,
- menjaga last-administrator invariant,
- menghasilkan audit event.

---

## 8.5 High-Risk Permission Split

Permission berikut harus tetap terpisah:

- `schedule.manage`,
- `schedule.publish`,
- `request.approve`,
- `compensation.manage`,
- `payroll.calculate`,
- `payroll.adjust`,
- `payroll.finalize`,
- `payroll.lock`,
- `payroll.unlock`,
- `access.manage`.

Jangan membuat satu `admin=true` menjadi bypass semua rule bisnis.

---

# 9. Input Validation & Injection Prevention

## 9.1 Runtime Validation

Semua external/untrusted input wajib melewati Zod atau canonical validator sebelum masuk application command/query.

Termasuk:

- path params,
- query params,
- JSON body,
- form payload,
- import file metadata,
- export filters,
- integration payload di masa depan.

---

## 9.2 Allowlist Over Blocklist

Untuk enum, sort field, filter operator, status, permission code, dan state transition gunakan allowlist.

Jangan menerima arbitrary database column/order expression dari client.

---

## 9.3 SQL Injection

Database access harus menggunakan parameterized query / safe ORM binding.

Raw SQL diperbolehkan hanya bila:

- parameterized,
- reviewed,
- tested,
- tidak menggabungkan untrusted input ke query string secara langsung.

---

## 9.4 Mass Assignment

Jangan map seluruh request object langsung ke database update.

Update employee, payroll, role, atau settings harus mengambil field allowlist yang memang editable.

Fields seperti berikut tidak boleh dikontrol bebas client:

- `createdBy`,
- `approvedBy`,
- `lockedBy`,
- `publishedBy`,
- audit timestamps,
- calculated totals,
- permission-derived scope.

---

# 10. XSS & Output Safety

## 10.1 React Escaping Is Baseline, Not Excuse

Default React text rendering digunakan untuk user-generated text.

Hindari `dangerouslySetInnerHTML`.

Jika rich HTML benar-benar diperlukan di masa depan, gunakan trusted sanitizer dengan explicit allowlist.

---

## 10.2 Free-Text Fields

Notes/reason/comment harus diperlakukan sebagai text, bukan executable markup.

Rendering audit `before/after` juga tidak boleh menginterpretasikan value sebagai HTML.

---

## 10.3 URL Safety

URL redirect/callback/deep-link yang menerima input harus divalidasi.

Jangan memungkinkan open redirect ke arbitrary external origin.

---

# 11. Content Security Policy & Security Headers

## 11.1 CSP

Production harus memiliki Content Security Policy yang sesuai arsitektur Next.js dan third-party resources yang benar-benar digunakan.

Goal:

- membatasi script source,
- membatasi connect/image/font source,
- mencegah framing melalui `frame-ancestors`,
- mengurangi blast radius XSS/code injection.

Strict nonce/hash-based CSP dapat digunakan jika sesuai rendering/deployment strategy.

CSP harus diuji; jangan membuat policy yang terlihat strict tetapi penuh wildcard/`unsafe-*` tanpa alasan.

---

## 11.2 Required Security Header Baseline

Production web responses harus mengevaluasi dan menggunakan minimal:

- `Content-Security-Policy`,
- `X-Content-Type-Options: nosniff`,
- `Referrer-Policy`,
- anti-framing melalui CSP `frame-ancestors` dan optional compatibility header,
- `Strict-Transport-Security` setelah HTTPS deployment stabil,
- appropriate `Permissions-Policy`.

Legacy `X-XSS-Protection` tidak dijadikan primary control.

---

## 11.3 HTTPS

Production authentication dan application traffic wajib HTTPS.

Secure cookie tidak boleh diturunkan hanya agar HTTP production dapat bekerja.

---

# 12. Rate Limiting & Abuse Protection

## 12.1 Authentication Rate Limit

Better Auth rate limiting harus aktif pada production dan dikonfigurasi sesuai deployment/proxy.

Sensitive route seperti sign-in/reset/2FA future harus memiliki stricter threshold daripada generic endpoint.

---

## 12.2 Application Rate Limit

NOCScheduler `/api/v1` membutuhkan abuse guard terutama untuk:

- expensive report/export,
- search,
- validation preview yang berat,
- payroll calculation,
- repeated high-risk command,
- notification/export generation.

Internal app bukan alasan meniadakan abuse protection.

---

## 12.3 Proxy/IP Trust

Jika rate limiting menggunakan IP dari proxy header:

- hanya trusted proxy/load balancer header yang boleh dipercaya,
- arbitrary client `X-Forwarded-For` tidak boleh menjadi source identity tanpa trusted proxy configuration.

---

# 13. High-Risk Mutation Security

## 13.1 Explicit Command Endpoints

Action seperti berikut tetap memakai explicit command endpoint sesuai PRD-15:

- publish schedule,
- approve/reject request,
- calculate/recalculate payroll,
- finalize payroll,
- lock payroll,
- unlock payroll.

---

## 13.2 Idempotency

High-risk command yang rentan duplicate submission wajib mendukung `Idempotency-Key` atau equivalent canonical mechanism.

Same key + same payload:

- tidak boleh menghasilkan duplicate business effect.

Same key + different payload:

- harus ditolak sebagai idempotency conflict.

---

## 13.3 Optimistic Concurrency

Mutation kritis wajib menggunakan `expectedVersion`/revision guard.

Stale update menghasilkan explicit conflict.

Silent last-write-wins dilarang untuk:

- schedule publication/correction,
- request approval,
- compensation version,
- payroll lifecycle,
- role/access mutation.

---

## 13.4 Re-Authentication / Step-Up Future Hook

Architecture harus menyediakan extension point untuk meminta re-authentication/MFA pada action sangat sensitif jika organisasi membutuhkannya, misalnya:

- payroll unlock,
- access-admin mutation,
- security-sensitive account action.

MFA tidak wajib pada MVP kecuali deployment policy mensyaratkannya.

---

# 14. Payroll & Compensation Integrity

## 14.1 Money Is Server-Calculated

Client tidak boleh mengirim final THP sebagai fakta yang dipercaya server.

Server menghitung:

- base salary component,
- shift incentive,
- generated overtime component bila tersedia,
- total payroll.

Client hanya dapat mengirim authorized manual adjustment payload sesuai permission.

---

## 14.2 Locked Payroll

Payroll `LOCKED` immutable dari normal workflow.

Mutation attempt harus ditolak server-side walaupun client mengirim payload valid.

Unlock:

- dedicated permission,
- mandatory reason,
- audit event,
- concurrency guard,
- exceptional workflow.

---

## 14.3 Salary/Incentive Effective Dating

Server harus mencegah ambiguous overlapping effective version.

Perubahan current config tidak boleh cascade mutate locked historical payroll.

---

## 14.4 Manual Adjustment

Manual adjustment membutuhkan:

- permission,
- employee/period scope valid,
- amount validation,
- category/direction,
- mandatory reason,
- actor dari session,
- audit event.

---

# 15. Schedule Integrity

## 15.1 One Primary State

Database/service guard harus mempertahankan satu primary work state per employee/work date sesuai PRD-03.

---

## 15.2 Publish Atomicity

Schedule publish harus transactionally menghasilkan consistent state.

Tidak boleh terjadi:

- sebagian assignment published,
- sebagian masih draft,
- audit tidak tercatat tetapi publish sukses.

---

## 15.3 Published Correction

Correction terhadap published schedule membutuhkan:

- permission,
- expected version,
- validation ulang,
- before/after history,
- actor,
- reason bila rule memerlukan,
- payroll impact awareness.

---

# 16. Database Security & Integrity

## 16.1 Application Database User

Runtime app database credential harus mengikuti least privilege.

Jangan menggunakan superuser database untuk normal application runtime.

Migration credential dapat memiliki privilege berbeda dari runtime credential.

---

## 16.2 Constraints

Critical invariant dijaga berlapis melalui database constraint jika practical:

- foreign key,
- unique constraint,
- not-null,
- check constraint,
- effective-range guard,
- uniqueness employee/period record.

---

## 16.3 Destructive Cascades

Cascade delete terhadap historical payroll, audit, schedule version, compensation version, atau referenced employee data dilarang kecuali benar-benar intentional dan dibuktikan aman.

Default historical delete strategy:

- inactive,
- archive,
- soft delete bila relevan.

---

## 16.4 Transaction Isolation

Critical operation harus diuji terhadap concurrent execution.

Gunakan transaction/locking semantics yang cukup kuat untuk mencegah duplicate or impossible state.

Exact PostgreSQL isolation/locking strategy ditentukan saat implementation per use case.

---

# 17. Audit & Security Logging

## 17.1 Audit Evidence

High-risk mutation wajib menghasilkan business audit event sesuai PRD-09.

Audit minimum:

- actor,
- action/event type,
- resource,
- subject bila relevan,
- timestamp,
- before/after,
- reason bila wajib,
- correlation ID.

---

## 17.2 Security Logging

Security-relevant events yang perlu dicatat antara lain:

- repeated login failure,
- rate limit hit,
- account disabled login attempt,
- authorization denial pada high-risk action,
- payroll unlock,
- role/permission change,
- suspicious malformed request pattern,
- unexpected origin rejection,
- security configuration failure.

---

## 17.3 Never Log Secrets

Log dan audit tidak boleh memuat plaintext:

- password,
- session token,
- access token,
- API key,
- database connection string,
- private key,
- Better Auth secret,
- raw cookie header.

Jika session correlation diperlukan, gunakan safe derived identifier yang tidak dapat digunakan untuk mengambil alih session.

---

## 17.4 Log Injection

User-controlled content yang masuk log harus disanitasi/structured sehingga newline/control character tidak dapat memalsukan log event baru.

Prefer structured logging.

---

# 18. Secret Management

## 18.1 Secret Categories

Minimal:

- Better Auth secret(s),
- database credentials,
- deployment credentials,
- external integration keys,
- email/notification provider secret future,
- encryption keys future.

---

## 18.2 Storage

Production secret harus disimpan melalui platform secret/environment management yang sesuai.

`.env` lokal boleh digunakan untuk local development tetapi:

- tidak committed,
- `.env.example` hanya berisi placeholder/non-secret names,
- repo harus memiliki ignore rules.

---

## 18.3 Rotation

Critical secret harus mempunyai documented rotation procedure.

Better Auth secret rotation harus menggunakan mechanism yang tidak memutus seluruh active encrypted state secara tidak perlu ketika supported.

---

# 19. Supply Chain & Dependency Security

## 19.1 Lockfile

`pnpm-lock.yaml` wajib committed.

CI/build harus menggunakan reproducible/frozen lockfile behavior.

---

## 19.2 Dependency Review

Dependency baru harus dievaluasi untuk:

- necessity,
- maintenance activity,
- permission/runtime scope,
- transitive dependency impact,
- bundle impact,
- security history bila relevan.

Jangan menambah library besar untuk fungsi kecil tanpa kebutuhan jelas.

---

## 19.3 Vulnerability Monitoring

CI atau scheduled process harus memiliki dependency vulnerability scanning/advisory awareness.

Critical/high vulnerability yang reachable tidak boleh diabaikan tanpa documented risk decision.

---

## 19.4 CI Token Permissions

GitHub Actions/workflow token harus minimum permission.

Default workflow tidak boleh mendapatkan repository write permission jika hanya membutuhkan read/test/build.

Secrets tidak diberikan ke untrusted fork code path tanpa explicit safe design.

---

# 20. Environment & Configuration Security

## 20.1 Environment Validation

Environment variables divalidasi saat startup/build sesuai kategori.

Production harus fail fast jika critical config hilang.

---

## 20.2 Environment Separation

Development, test, staging, dan production harus memiliki:

- database terpisah,
- secret terpisah,
- environment identity jelas.

Test tidak boleh menunjuk production database.

---

## 20.3 Debug Mode

Production tidak boleh menampilkan:

- stack trace internal kepada end user,
- SQL query error detail,
- environment variable dump,
- auth provider internal secret detail.

Correlation/request ID boleh ditampilkan untuk support.

---

# 21. Error Handling & Exceptional Conditions

## 21.1 Safe Error Responses

Client-facing error menggunakan stable code dari PRD-15.

Internal detail masuk observability/logging, bukan response publik.

---

## 21.2 No Partial Success for Atomic Action

High-risk transaction gagal → keseluruhan operation gagal.

Jangan mengembalikan `200 OK` jika audit/critical write belum durable.

---

## 21.3 Retry Safety

Transient retry tidak boleh menggandakan effect.

Gunakan:

- idempotency,
- transaction,
- unique constraints,
- revision guards.

---

# 22. File Export / Import Security

## 22.1 Export

Export report harus:

- require authentication/authorization,
- menggunakan server-calculated source,
- escape spreadsheet formula injection bila CSV/XLSX menerima user-controlled text,
- menggunakan safe filename,
- tidak mengekspor field internal/secret secara accidental.

---

## 22.2 Import Future

Jika import jadwal/employee ditambahkan:

- file type/size allowlist,
- parse server-side,
- schema validation,
- preview sebelum commit,
- no executable macro processing,
- atomic/controlled application,
- audit source import.

Import tidak masuk MVP kecuali dibutuhkan kemudian.

---

# 23. Browser & Client Security

## 23.1 No Sensitive Data in Persistent Browser Storage

Jangan menyimpan:

- session token,
- password,
- Better Auth secret,
- database secret,
- privileged API credential

ke localStorage/sessionStorage.

UI preference seperti theme boleh disimpan.

---

## 23.2 Cache Awareness

Sensitive operational pages harus mengevaluasi browser/proxy cache behavior.

Server responses yang berisi user/session-specific data tidak boleh secara accidental menjadi shared public cache.

---

## 23.3 Clipboard

Copy payroll/salary boleh tersedia karena transparansi internal, tetapi jangan auto-copy sensitive values tanpa user action.

---

# 24. Account Lifecycle

## 24.1 Provisioning

Account creation membutuhkan authorized actor atau controlled bootstrap process.

Self-public signup tidak diperlukan untuk aplikasi internal.

---

## 24.2 Deactivation

Employee/user offboarding workflow harus mencakup:

- disable authentication account,
- revoke active sessions,
- preserve historical attribution,
- remove future access roles/effective grants,
- preserve payroll/schedule history.

---

## 24.3 Last Administrator Guard

System tidak boleh membiarkan semua administrator/capability access manager hilang melalui normal mutation.

At least one recoverable privileged admin path harus tetap tersedia.

---

# 25. Security UX

## 25.1 Authentication Errors

Login error jelas tetapi tidak overshare.

---

## 25.2 Permission Denied

UI menjelaskan action tidak diizinkan tanpa menampilkan internal permission implementation yang tidak perlu.

Debug/admin environment boleh memiliki diagnostic detail terpisah.

---

## 25.3 Session Expiry

Jika session expire saat user sedang bekerja:

- beri message jelas,
- arahkan login ulang,
- preserve non-sensitive local draft UI bila aman dan feasible,
- setelah login, jangan otomatis replay high-risk mutation tanpa user intent baru.

---

## 25.4 Security Confirmation

Confirmation dialog hanya digunakan bila benar-benar berisiko, misalnya:

- publish schedule,
- payroll lock/unlock,
- destructive archive,
- privilege mutation.

Jangan membuat confirmation fatigue pada action biasa.

---

# 26. Security Testing Strategy

## 26.1 Test Layers

Security test harus mencakup:

1. unit tests untuk authorization/domain guards,
2. integration tests untuk auth/session/database constraint,
3. API negative tests,
4. E2E browser security behavior,
5. dependency scanning,
6. static/code review checks,
7. manual security review untuk high-risk flow.

---

## 26.2 Authorization Matrix Tests

Setiap protected command harus diuji minimal untuk:

- unauthenticated,
- authenticated without permission,
- authenticated with wrong scope,
- authorized actor,
- stale permission/session state.

---

## 26.3 Input Negative Tests

Test malformed:

- invalid IDs,
- invalid enum,
- oversized input,
- unexpected field,
- HTML/script payload pada note,
- SQL-like payload,
- invalid date/time,
- negative money,
- integer overflow boundary.

Expected result adalah safe rejection atau safe text storage—not execution.

---

## 26.4 Concurrency Tests

Critical concurrent scenarios:

- two schedule publishers,
- simultaneous request approval,
- concurrent salary version creation,
- double payroll calculate,
- simultaneous finalize/lock,
- unlock vs source change,
- role mutation collision.

---

# 27. Security Acceptance Matrix

| Scenario | Expected |
|---|---|
| Anonymous accesses dashboard | Redirect/401; no data leakage |
| Member calls publish endpoint directly | 403 |
| Scheduler calls payroll lock | 403 unless explicitly granted |
| Admin uses stale schedule version | 409 concurrency conflict |
| Duplicate payroll calculate with same idempotency key | Single business effect |
| Idempotency key reused with different payload | Conflict/reject |
| Cross-origin forged mutation | Rejected |
| GET endpoint attempts state mutation | Contract test fails |
| XSS payload stored in note | Rendered as inert text |
| SQL-like employee search | Parameterized/safe; no injection |
| Client sends `lockedBy` | Ignored/rejected |
| Client changes own employeeId on SELF request | Rejected/server overrides identity |
| Locked payroll PATCH attempt | Rejected |
| Unlock without reason | Rejected |
| Unlock without permission | 403 |
| Account disabled | Sessions revoked / protected request rejected |
| User deletes last admin role | Rejected |
| Log payload contains password/token | Redacted/not logged |
| CSV user text starts formula marker | Export neutralizes formula injection |
| Missing critical production secret | Application fails closed/startup fails |
| CSP violation from unapproved script | Browser blocks/reports according policy |
| Raw unexpected field sent in employee update | Rejected/ignored by allowlist contract |
| Database runtime account tries schema migration | Not permitted in production design |

---

# 28. Security Business Rules

- **SEC-001** — All protected resources require server-side authentication.
- **SEC-002** — Authorization is enforced server-side for every protected mutation.
- **SEC-003** — Unknown permission state defaults to deny.
- **SEC-004** — Frontend visibility is not a security control.
- **SEC-005** — Client-supplied actor identity is never trusted.
- **SEC-006** — Self-service subject identity comes from server session unless delegated permission exists.
- **SEC-007** — Production auth cookies are HttpOnly and Secure.
- **SEC-008** — Session tokens are not stored in localStorage.
- **SEC-009** — Sessions have finite expiration.
- **SEC-010** — Disabled account cannot create/use valid protected session.
- **SEC-011** — Session revocation is supported.
- **SEC-012** — Passwords are never stored plaintext.
- **SEC-013** — Password hashing uses approved adaptive/memory-hard configuration.
- **SEC-014** — Login errors do not unnecessarily enumerate accounts.
- **SEC-015** — Better Auth CSRF/origin security checks remain enabled in production.
- **SEC-016** — Trusted origins use explicit allowlist.
- **SEC-017** — NOCScheduler GET endpoints are read-only.
- **SEC-018** — Cookie-authenticated mutations apply CSRF/origin defense.
- **SEC-019** — All untrusted payloads receive runtime validation.
- **SEC-020** — Database queries use parameter binding/safe ORM semantics.
- **SEC-021** — Raw SQL may not interpolate untrusted input.
- **SEC-022** — Mass assignment from request payload to database is forbidden.
- **SEC-023** — User-controlled text renders as inert text by default.
- **SEC-024** — Arbitrary open redirects are forbidden.
- **SEC-025** — Production uses CSP.
- **SEC-026** — Production uses relevant security response headers.
- **SEC-027** — Production authentication traffic requires HTTPS.
- **SEC-028** — Authentication endpoints are rate-limited.
- **SEC-029** — Expensive/high-risk application endpoints have abuse controls.
- **SEC-030** — Proxy-derived client IP is trusted only from configured proxy chain/header.
- **SEC-031** — High-risk commands use explicit authorization permission.
- **SEC-032** — Duplicate-sensitive commands support idempotency.
- **SEC-033** — Critical mutable resources use optimistic concurrency/revision guard.
- **SEC-034** — Stale critical write does not silently overwrite current state.
- **SEC-035** — Payroll total is calculated server-side.
- **SEC-036** — Locked payroll rejects normal mutation server-side.
- **SEC-037** — Payroll unlock requires dedicated permission and reason.
- **SEC-038** — Manual payroll adjustment requires permission, reason, and audit.
- **SEC-039** — Schedule publish is atomic.
- **SEC-040** — Published correction retains before/after history.
- **SEC-041** — Runtime DB credential follows least privilege.
- **SEC-042** — Historical records are protected from destructive cascades.
- **SEC-043** — High-risk mutation generates durable audit evidence.
- **SEC-044** — Security logs never contain plaintext secret or credential.
- **SEC-045** — User-controlled log values are safely structured/sanitized.
- **SEC-046** — Secrets are not committed to source control.
- **SEC-047** — Production secrets use deployment secret management.
- **SEC-048** — Critical secrets have rotation procedure.
- **SEC-049** — Dependency lockfile is committed and respected in CI.
- **SEC-050** — Dependency vulnerabilities are monitored.
- **SEC-051** — CI token permissions follow least privilege.
- **SEC-052** — Production config fails closed when critical security config is missing.
- **SEC-053** — Environment databases and secrets are separated.
- **SEC-054** — Production errors do not expose stack trace/SQL/secrets to users.
- **SEC-055** — Export escapes spreadsheet formula injection where applicable.
- **SEC-056** — Public self-signup is disabled unless explicitly introduced later.
- **SEC-057** — Account deactivation preserves historical attribution.
- **SEC-058** — Last administrator invariant is protected.
- **SEC-059** — Security tests include negative authorization and malformed-input cases.
- **SEC-060** — Critical concurrency scenarios are covered by automated tests.

---

# 29. Security Definition of Done

A feature affecting authentication, access, schedule mutation, compensation, payroll, settings, or audit is not security-complete until:

- [ ] authentication requirement is explicit,
- [ ] authorization permission/scope is explicit,
- [ ] server-side authorization test exists,
- [ ] request runtime validation exists,
- [ ] untrusted fields use allowlist,
- [ ] database mutation is parameterized/safe,
- [ ] object-level authorization is tested,
- [ ] concurrency behavior is defined where mutable,
- [ ] idempotency is defined where duplicate effect is dangerous,
- [ ] business validation cannot be bypassed from direct API call,
- [ ] critical mutation is transactional,
- [ ] required audit event is emitted,
- [ ] secrets/tokens are excluded from logs,
- [ ] user-generated content is rendered safely,
- [ ] error response does not leak internal details,
- [ ] Light/Dark/UI states do not accidentally reveal hidden privileged data,
- [ ] disabled/read-only/locked UI state matches backend enforcement,
- [ ] negative tests exist for unauthenticated and forbidden actors,
- [ ] dependency/security scan remains acceptable,
- [ ] production security headers/CSP are compatible with the feature.

---

# 30. Implementation Priority

## Phase SEC-F0 — Security Foundation

- Better Auth setup,
- production-safe cookie configuration,
- trusted origins,
- session lifecycle,
- centralized authorization service,
- Zod API validation,
- structured error contract,
- secret/env validation.

## Phase SEC-F1 — Critical Domain Guards

- schedule permission,
- publish concurrency/idempotency,
- request approval guard,
- compensation guard,
- payroll lifecycle permission,
- lock/unlock protection,
- audit integration.

## Phase SEC-F2 — Browser & Platform Hardening

- CSP,
- security headers,
- rate limiting,
- log redaction,
- proxy/IP trust configuration,
- export hardening.

## Phase SEC-F3 — Verification & Operational Hardening

- authorization matrix tests,
- security negative API tests,
- concurrency tests,
- dependency scanning,
- secret rotation runbook,
- account offboarding test,
- security review before production launch.

---

# 31. Out of Scope / Future Security Enhancements

Not mandatory for MVP unless deployment policy requires them:

- mandatory MFA for every user,
- WebAuthn/passkey-only authentication,
- corporate SSO/OIDC,
- device posture validation,
- dedicated WAF,
- SIEM integration,
- IP allowlisting/VPN-only access,
- hardware security key requirement,
- field-level payroll encryption beyond platform/database security,
- advanced anomaly detection.

Architecture must not prevent these additions later.

---

# 32. Security Reference Notes

Engineering implementation should periodically re-check the latest official guidance instead of freezing security assumptions forever.

Primary references at time of PRD creation:

- OWASP ASVS 5.0.0 — https://owasp.org/www-project-application-security-verification-standard/
- OWASP Top 10:2025 — https://owasp.org/Top10/
- OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org/
- Better Auth Security — https://better-auth.com/docs/reference/security
- Better Auth Cookies — https://better-auth.com/docs/concepts/cookies
- Better Auth Rate Limit — https://better-auth.com/docs/concepts/rate-limit
- Next.js Content Security Policy Guide — https://nextjs.org/docs/app/guides/content-security-policy

---

# 33. Final Security Contract

NOCScheduler security baseline dapat diringkas sebagai:

```text
Authenticate the actor
→ validate origin/request
→ validate input shape
→ authorize capability + scope
→ validate business state
→ enforce concurrency/idempotency
→ write transactionally
→ enforce database invariants
→ create durable audit evidence
→ return minimal safe response
```

Security dianggap berhasil bukan ketika aplikasi terasa penuh hambatan, tetapi ketika **user yang sah dapat bekerja dengan cepat sementara unauthorized, stale, forged, duplicate, malformed, atau historically destructive action gagal secara konsisten dan dapat dijelaskan**.
