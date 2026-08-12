# NOCScheduler — CJS Generator + GitHub Sync Development Workflow

> **Workflow ID:** WORKFLOW-NOCSCHEDULER-CJS-GITHUB-V2  
> **Status:** Active — Canonical Execution Workflow  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Created:** 2026-08-13  
> **Supersedes:** `docs/workflow/WORKFLOW_Chat_GitHub_Full_Automation_v1.md`  
> **Master Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Canonical Platform:** PRD-22  
> **Package Manager:** npm + npm workspaces  
> **Execution Model:** ChatGPT audit via GitHub → downloadable `.cjs` generator → local execution → commit/push → QA  
> **Default Branch:** `main`

---

# 1. Purpose

Dokumen ini adalah aturan main canonical untuk development NOCScheduler melalui sesi chat.

Workflow V2 sengaja memindahkan **source-code writing** dari direct GitHub editing menjadi **temporary Node.js CommonJS generator script (`.cjs`)** yang dibuat oleh assistant dan dieksekusi user pada local repository.

Alasan utama:

- assistant dapat menghasilkan perubahan sangat besar dan kompleks tanpa dibatasi kenyamanan copy-paste chat;
- generator dapat create/update/delete banyak file dalam satu execution;
- setelah generator selesai menulis repository, perubahan langsung di-commit dan di-push **sebelum quality gate dijalankan**;
- jika lint/test/build gagal, exact failing repository state sudah berada di GitHub;
- assistant dapat membaca failing state tersebut melalui GitHub plugin pada turn berikutnya dan membuat repair generator berdasarkan source yang benar-benar gagal;
- user tidak perlu melakukan source editing manual;
- phase tetap dikontrol oleh user acceptance.

Workflow ini boleh berubah jika development nyata menemukan kendala. Setiap perubahan material harus dicatat di repository.

---

# 2. Core Collaboration Loop

```text
User: lanjut / repair
        ↓
Assistant baca latest GitHub main
        ↓
Assistant baca Workflow + Phase Control + Workplan + relevant PRD
        ↓
Assistant audit current phase dan exact source state
        ↓
Assistant generate downloadable scripts/<task>.cjs
        ↓
User download/place generator pada local repo
        ↓
Local sync preflight
        ↓
node scripts/<task>.cjs
        ↓
Generator selesai menulis source/config/tests/docs
        ↓
Cleanup temporary generator/backups
        ↓
git add -A
        ↓
git commit
        ↓
git push
        ↓
Quality gates: typecheck/lint/test/build/etc
        ↓
PASS → user cek runtime/visual bila relevan → user bilang passed/lanjut
FAIL → user kirim exact output/error
        ↓
Assistant fetch exact pushed failing commit dari GitHub
        ↓
Assistant generate repair .cjs untuk phase yang sama
```

**Push-before-QA adalah keputusan workflow yang disengaja.** `main` boleh sementara berada pada state merah selama repair loop, karena repository remote dipakai sebagai shared source state antara local machine user dan assistant.

---

# 3. Responsibility Boundary

## 3.1 Assistant

Assistant bertanggung jawab untuk:

- membaca latest `main` melalui GitHub plugin sebelum membuat generator;
- membaca workflow, phase ledger, workplan, PRD, dan implementation terkait;
- menentukan scope current phase;
- membuat generator `.cjs` yang lengkap;
- menyediakan generator sebagai **downloadable file**, bukan memaksa user copy-paste puluhan/ribuan baris;
- tidak membatasi ukuran generator secara artifisial;
- membuat generator yang dapat create/update/delete file yang diperlukan;
- menyediakan exact PowerShell execution command;
- setelah user menjalankan command, membaca commit terbaru dari GitHub;
- menganalisis lint/test/build/runtime error berdasarkan exact pushed source;
- membuat repair generator tanpa keluar dari current phase;
- menjaga PRD/workplan/workflow/phase-state tetap konsisten.

## 3.2 User

User bertanggung jawab untuk:

- menjaga local repository sebagai working copy;
- menempatkan downloaded generator pada path yang diminta, default `scripts/<task>.cjs`;
- menjalankan exact command yang diberikan assistant;
- mengirim terminal output jika command gagal;
- melakukan runtime/visual/manual QA yang tidak dapat dibuktikan hanya dari source/test;
- menyatakan PASS dan meminta lanjut bila phase diterima.

User **tidak perlu mengedit source secara manual** dalam normal workflow.

---

# 4. Source of Truth

## Product / Architecture

```text
Latest explicit user instruction
→ relevant approved PRD
→ PRD-22 for platform conflicts
→ Master Workplan
→ existing implementation
```

## Execution Process

```text
Latest explicit user instruction
→ this Workflow V2
→ PHASE_CONTROL.md
→ Master Workplan
```

## Code State

```text
Latest pushed GitHub main commit
```

Assistant tidak boleh membuat repair berdasarkan asumsi bahwa local files berbeda dari GitHub. Jika user menjalankan generator dan push sukses, GitHub commit tersebut menjadi exact state yang harus diaudit.

---

# 5. Mandatory Assistant Preflight

Sebelum membuat generator baru, assistant wajib:

1. baca Workflow V2 terbaru;
2. baca `docs/workflow/PHASE_CONTROL.md`;
3. baca current phase pada Master Workplan;
4. baca relevant PRD;
5. baca PRD-22 jika menyentuh stack, package, API, persistence, auth, build, deployment, TypeScript, Vite, Firebase, atau repository structure;
6. fetch latest `main`;
7. inspect target files dan related tests;
8. inspect recent relevant commit/error bila sedang repair;
9. lock scope;
10. baru generate `.cjs`.

Memory chat bukan pengganti latest repository state.

---

# 6. Generator Delivery Contract

Setiap implementation/repair yang memerlukan source write harus diberikan sebagai downloadable `.cjs` file.

Default naming:

```text
scripts/<phase>-<short-task>.cjs
```

Contoh:

```text
scripts/wp-f00-bootstrap-toolchain.cjs
scripts/wp-f03-build-design-system-foundation.cjs
scripts/wp-f11-fix-schedule-publication-guard.cjs
```

Assistant harus memberikan:

1. link download file `.cjs`;
2. target path file di local repo;
3. exact execution command;
4. commit message yang sudah tertanam pada command;
5. expected validation gates;
6. catatan khusus bila ada dependency/environment prerequisite.

Tidak ada batas line-count buatan. Generator boleh berukuran puluhan ribu baris jika scope memang membutuhkan. **Completeness dan correctness lebih penting daripada ukuran script.**

Assistant boleh memecah generator hanya jika:

- ada hard technical delivery limit;
- perubahan benar-benar lebih aman transactional dalam beberapa stage;
- external prerequisite memisahkan stage;
- satu stage harus menghasilkan data yang dibutuhkan stage berikutnya.

Pemecahan tidak boleh dilakukan hanya agar response terlihat lebih pendek.

---

# 7. Generator Engineering Standard

Generator harus memakai Node.js CommonJS (`.cjs`) dan fokus pada repository transformation.

Generator sebaiknya:

- menggunakan `node:fs`, `node:path`, dan standard Node APIs;
- resolve repository root dari `process.cwd()`;
- fail fast jika dijalankan dari lokasi yang salah;
- bila praktis, memeriksa expected base commit atau sentinel file sebelum write;
- memeriksa target content/structure sebelum destructive replacement;
- menggunakan atomic/controlled writes untuk file penting;
- create directory bila diperlukan;
- dapat create/update/delete banyak file;
- menjaga UTF-8 text;
- tidak menaruh secret/credential;
- menghasilkan error message yang jelas;
- menghindari silent partial success;
- idempotent bila reasonable, atau explicit abort bila script sudah pernah diaplikasikan;
- hanya membuat `.bak-*` jika backup memang diperlukan;
- tidak menyimpan backup setelah successful workflow cleanup;
- tidak melakukan business-rule workaround hanya untuk membuat test hijau.

Generator **tidak boleh menjalankan `git commit`, `git push`, atau acceptance QA secara internal**. Git mutation dan QA dijalankan oleh outer PowerShell command agar urutannya terlihat dan dapat diaudit.

Read-only Git metadata check dari generator diperbolehkan jika diperlukan untuk stale-base guard.

---

# 8. Local Sync Preflight

Sebelum generator dijalankan, local repository harus sinkron dengan GitHub `main` dan tidak membawa unrelated dirty changes.

Default preflight:

```powershell
git status --short
git pull --ff-only
```

`git pull --ff-only` adalah satu-satunya normal Git operation yang boleh berada **sebelum** generator karena fungsinya hanya menyamakan local base dengan source state yang dipakai assistant.

Jika local repository memiliki unrelated uncommitted changes, user harus menyelesaikan/stash perubahan tersebut sebelum menjalankan generator agar patch tidak tercampur.

---

# 9. Canonical Mutation Order

Untuk task tanpa dependency materialization khusus, urutan wajib adalah:

```text
1. local sync preflight
2. node generator
3. generator selesai writing
4. cleanup generator/backups
5. git add -A
6. git commit
7. git push
8. typecheck/lint/test/build/other QA
9. manual/runtime/visual validation bila relevan
10. report PASS atau FAIL ke assistant
```

**Commit dan push harus terjadi sebelum quality gate.**

Tujuannya supaya jika gate gagal, assistant tetap dapat membaca exact failing implementation dari GitHub.

---

# 10. Dependency-Change Exception

Jika task menambah/menghapus/mengubah npm dependency, `package-lock.json` harus menjadi bagian dari committed source state.

Karena lockfile harus dihasilkan oleh npm, dependency materialization dianggap bagian dari **write stage**, bukan QA stage.

Urutannya:

```text
1. sync preflight
2. node generator writes package.json/source/config
3. npm install / npm install --package-lock-only sesuai kebutuhan
4. source + package-lock.json sekarang final untuk commit
5. cleanup generator/backups
6. git add -A
7. git commit
8. git push
9. npm run typecheck
10. npm run lint
11. npm test
12. npm run build
13. additional relevant QA
```

Assistant harus memberi exact command sesuai task. Jangan membuat atau menebak `package-lock.json` secara manual bila npm dapat menghasilkannya dengan benar.

---

# 11. Canonical PowerShell Chain

Template tanpa dependency change:

```powershell
git pull --ff-only; if ($LASTEXITCODE -eq 0) { node scripts/<task>.cjs; if ($LASTEXITCODE -eq 0) { Remove-Item scripts/<task>.cjs -Force; Get-ChildItem -Recurse -File -Filter "*.bak-*" | Remove-Item -Force; git add -A; git commit -m "<commit-message>"; if ($LASTEXITCODE -eq 0) { git push; if ($LASTEXITCODE -eq 0) { npm run typecheck; if ($LASTEXITCODE -eq 0) { npm run lint; if ($LASTEXITCODE -eq 0) { npm test; if ($LASTEXITCODE -eq 0) { npm run build } } } } } } }
```

Assistant wajib menyesuaikan chain terhadap scripts yang benar-benar sudah tersedia pada phase tersebut. Sebelum WP-F02, beberapa quality commands mungkin belum ada; jangan memanggil script npm yang belum didefinisikan.

Template dengan dependency change dapat menambahkan npm dependency materialization **setelah generator dan sebelum git add/commit**.

---

# 12. Push-Before-QA Semantics

Commit hasil generator yang sudah dipush tetapi belum lolos quality gate memiliki status:

```text
PUSHED_UNVERIFIED
```

Status ini bukan defect workflow. Ini adalah intentional collaboration checkpoint.

Jika QA gagal:

```text
PUSHED_UNVERIFIED
→ QA_FAILED
→ assistant fetch exact failing GitHub commit
→ repair generator
→ new pushed commit
→ PUSHED_UNVERIFIED
→ QA ulang
```

Jika QA sukses dan manual validation relevan juga sukses:

```text
PUSHED_UNVERIFIED
→ USER_VALIDATION_PASSED
→ user explicitly asks continue
→ previous phase ACCEPTED
→ next phase may begin
```

Green CI atau successful push sendirian tidak sama dengan acceptance.

---

# 13. Failure Handling

Jika command gagal **sebelum push**, user mengirim output. Assistant harus menentukan apakah failure terjadi pada:

- stale/dirty local preflight;
- generator guard;
- generator write;
- dependency materialization;
- cleanup;
- git commit;
- git push.

Jika command gagal **setelah push**, assistant wajib terlebih dahulu fetch latest `main` dan relevant commit dari GitHub, lalu menganalisis:

- typecheck failure;
- lint failure;
- test failure;
- build failure;
- runtime failure;
- Firebase Emulator failure;
- E2E/visual/accessibility failure;
- user screenshot/behavior defect.

Repair tetap berada pada phase yang sama.

Assistant tidak boleh meminta user copy-paste source hanya karena test gagal; source sudah harus dibaca dari GitHub.

---

# 14. Phase Control Model

Canonical phase statuses:

```text
NOT_STARTED
AUDIT
GENERATOR_READY
PUSHED_UNVERIFIED
QA_FAILED
USER_VALIDATION_REQUIRED
ACCEPTED
BLOCKED
BLOCKED_EXTERNAL
SUPERSEDED
LOCKED
```

Rules:

- future phase tetap `LOCKED` sampai current phase diterima;
- generator tersedia tidak berarti phase implemented;
- pushed code tidak berarti passed;
- failed QA tetap di current phase;
- user PASS adalah acceptance authority;
- assistant tidak boleh auto-advance;
- explicit user request `lanjut` dibutuhkan sebelum next phase dimulai.

Karena `PHASE_CONTROL.md` ikut berada di repository yang di-commit sebelum QA, ledger dapat memakai `PUSHED_UNVERIFIED` sebagai durable remote checkpoint. PASS final dapat dicatat pada generator phase berikutnya atau pada dedicated workflow-state update jika memang diperlukan.

---

# 15. Standard Phase Procedure

## Step A — Audit

Assistant membaca latest remote state dan menentukan current phase gap.

## Step B — Design transformation

Assistant menentukan file create/update/delete, business impact, tests, and rollback surface.

## Step C — Build downloadable generator

Assistant membuat `.cjs` lengkap dan exact execution command.

## Step D — User executes

Local sync → generator → commit → push → QA.

## Step E — User reports result

- PASS: user memberi acceptance dan meminta lanjut saat siap;
- FAIL: user memberi exact output/log/screenshot.

## Step F — Assistant rehydrates from GitHub

Assistant fetch latest pushed commit and source. Tidak menebak local state.

## Step G — Repair or advance

- FAIL → repair generator, same phase;
- PASS + explicit continue → mark prior phase accepted dan mulai audit next phase.

---

# 16. Quality Gate Policy

Canonical npm gates setelah tersedia:

```text
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:integration
npm run test:e2e
npm run build
npm run check:deadcode
```

Additional gates bila relevan:

```text
npm run test:rules
npm run test:visual
npm run test:a11y
npm run test:security
npm run test:performance
```

Assistant memilih exact gates berdasarkan current phase. Jangan menjalankan nonexistent script.

Quality gate failure tidak boleh diperbaiki dengan:

- menghapus valid test;
- melemahkan assertion penting;
- menonaktifkan strict TypeScript tanpa architectural reason;
- meng-ignore defect;
- memindahkan business truth ke UI;
- menghapus security/integrity invariant.

---

# 17. UI/UX Validation

Untuk UI phase, automated gate saja tidak cukup.

User validation dapat mencakup:

- desktop;
- mobile;
- Light Mode;
- Dark Mode;
- alignment;
- typography;
- density;
- whitespace;
- overflow;
- sticky collision;
- modal/sheet sizing;
- touch reachability;
- focus/keyboard;
- loading/empty/error/permission states.

Jika screenshot menunjukkan defect scope current phase, assistant membuat repair generator dan phase tetap belum accepted.

---

# 18. Critical Domain Safety

Scheduling, payroll, compensation, authorization, audit/history, dan critical mutations harus tetap mengikuti PRD safety baseline:

- strict TypeScript contracts;
- Zod/runtime validation pada trust boundary;
- server-authoritative business rules;
- deterministic calculations;
- explicit Asia/Jakarta time handling;
- integer IDR representation;
- idempotency/concurrency bila contract membutuhkan;
- Firestore invariant strategy;
- historical/effective-date correctness;
- audit evidence;
- regression tests.

Generator besar tidak boleh menjadi alasan menurunkan architecture quality.

---

# 19. GitHub Plugin Role Under V2

GitHub plugin tetap penting, tetapi role utamanya berubah menjadi:

```text
READ / AUDIT
- latest main
- changed files
- exact pushed failing implementation
- commits
- CI status/logs when available
- docs/PRD/workplan/workflow

CONTROLLED DOC/STATE WRITE
- workflow/workplan correction bila diperlukan sebelum implementation
- emergency repository metadata/documentation maintenance bila generator path tidak relevan
```

Normal application source implementation dilakukan melalui downloadable `.cjs` generator executed locally by user.

---

# 20. Generator Cleanup Rule

Temporary generator tidak menjadi permanent application source.

Setelah generator success dan sebelum `git add -A`:

```powershell
Remove-Item scripts/<task>.cjs -Force
Get-ChildItem -Recurse -File -Filter "*.bak-*" | Remove-Item -Force
```

Jika generator gagal, jangan otomatis menghapus evidence/backups yang mungkin diperlukan untuk diagnosis kecuali assistant secara khusus menginstruksikan cleanup.

Permanent scripts hanya dibuat jika script tersebut memang bagian resmi dari product/developer tooling, bukan temporary patch generator.

---

# 21. Commit Policy

Setiap generator execution harus memiliki commit message yang diberikan assistant.

Pattern:

```text
chore(wp-f00): bootstrap npm workspace toolchain
feat(wp-f06): implement authentication foundation
fix(wp-f11): repair schedule publication guard
test(wp-f19): harden authorization regression coverage
```

Commit boleh merah sementara karena push dilakukan sebelum QA. Repair berikutnya harus menggunakan commit baru, bukan rewrite history/force push dalam normal workflow.

Jangan force-push `main` untuk menyembunyikan failing iteration.

---

# 22. External Blocker Rule

Jika phase membutuhkan tindakan yang tidak dapat dilakukan assistant melalui GitHub/source generator, misalnya account consent, Firebase project binding, billing, secret creation, atau domain verification:

- assistant tetap membuat semua repo changes yang dapat disiapkan;
- tandai `BLOCKED_EXTERNAL` bila benar-benar blocking;
- berikan minimal exact external action;
- setelah user menyelesaikannya, lanjut dari phase yang sama.

---

# 23. Session Continuity

Setiap execution turn harus dapat direkonstruksi dari:

```text
docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md
docs/workflow/PHASE_CONTROL.md
docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md
docs/prd/README.md
relevant PRD(s)
latest GitHub main
latest user-provided QA output
```

Repository adalah shared durable state. Chat adalah command/control channel dan tempat user memberi acceptance/error evidence.

---

# 24. Canonical Handoff Format

Saat memberikan implementation generator, assistant harus menyertakan:

```text
Phase: WP-Fxx — <name>
Generator: scripts/<task>.cjs
Base audited commit: <sha>
Download: <file link>
Commit message: <message>

Execution command:
<exact PowerShell chain>

After execution:
- paste terminal output if any step fails
- if automated gates pass, perform requested runtime/visual check
- report PASS or defects
```

Assistant tidak boleh menaruh ribuan baris generator di chat jika downloadable artifact dapat diberikan dengan lebih aman, kecuali user secara eksplisit meminta source script inline.

---

# 25. Revision History

## V2 — 2026-08-13

- mengganti direct GitHub application-source writing dengan downloadable `.cjs` generator;
- menetapkan generator size tidak dibatasi secara artifisial;
- menetapkan `git commit` dan `git push` **setelah write stage tetapi sebelum QA**;
- menjadikan pushed failing state sebagai intentional shared debugging checkpoint;
- mempertahankan npm sebagai canonical package manager;
- menetapkan dependency-lock materialization sebagai write-stage exception sebelum commit;
- mempertahankan user sebagai final acceptance authority;
- mempertahankan strict no-auto-advance antarphase.

---

# 26. Active Rule Summary

1. Assistant audit latest GitHub `main` sebelum setiap generator.
2. Application source writes dilakukan oleh temporary downloadable `.cjs` generator.
3. User tidak perlu source editing manual.
4. Generator boleh sangat besar jika scope membutuhkan.
5. Local sync dilakukan sebelum generator.
6. Generator selesai writing sebelum mutation Git (`add/commit/push`).
7. Dependency lock materialization termasuk write stage bila diperlukan.
8. Commit dan push dilakukan **sebelum typecheck/lint/test/build**.
9. Failing pushed commit sengaja dipertahankan agar assistant dapat mengaudit exact error state.
10. Repair selalu berdasarkan latest GitHub state.
11. QA failure tetap pada phase yang sama.
12. User PASS + explicit `lanjut` diperlukan sebelum next phase.
13. Future phases tetap locked sampai accepted.
14. No force-push untuk menyembunyikan failed iteration.
15. Workflow dapat direvisi jika development membutuhkan, tetapi revision harus terdokumentasi.
