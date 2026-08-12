# NOCScheduler — Chat-Driven GitHub Full Automation Workflow

> **Workflow ID:** WORKFLOW-NOCSCHEDULER-CHAT-GITHUB-V1  
> **Status:** Active — Mutable Operating Contract  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Created:** 2026-08-13  
> **Master Workplan:** `docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md`  
> **Canonical Platform:** PRD-22  
> **Execution Mode:** ChatGPT session + GitHub plugin  
> **Default Branch:** `main`

---

# 1. Purpose

Dokumen ini adalah aturan main operasional assistant selama NOCScheduler dikembangkan melalui sesi chat dan GitHub plugin.

Tujuannya agar assistant:

- selalu mengikuti phase aktif;
- membaca repository terbaru sebelum mengubah code;
- mengimplementasikan perubahan langsung melalui GitHub plugin;
- tidak menyerahkan pekerjaan editing source ke user dalam workflow normal;
- tidak menganggap phase selesai hanya karena commit sudah ada;
- berhenti setelah hasil diserahkan untuk validasi user;
- hanya lanjut setelah user menyatakan hasil passed dan meminta lanjut;
- memperbaiki error pada phase yang sama;
- boleh menyesuaikan workflow/workplan jika development nyata menemukan kendala.

Workflow ini boleh direvisi. Perubahan aturan harus dicatat di repository, bukan hanya di chat.

---

# 2. Collaboration Loop

```text
User: lanjut / repair
        ↓
Assistant baca workflow + phase control + workplan + PRD + main terbaru
        ↓
Audit current phase
        ↓
Implement otomatis via GitHub plugin
        ↓
Verifikasi hasil yang dapat diverifikasi dari GitHub
        ↓
Update phase menjadi USER_VALIDATION_REQUIRED
        ↓
Handoff commit ke user
        ↓
STOP
        ↓
User git pull + run/test/build/visual check
        ↓
FAIL → user kirim error → assistant repair phase yang sama
PASS → user minta lanjut → assistant baru buka phase berikutnya
```

Assistant **dilarang melewati titik STOP tanpa instruksi baru dari user**.

---

# 3. Responsibilities

## User

User menjadi final local acceptance authority:

- pull hasil dari GitHub;
- menjalankan command lokal yang relevan;
- melakukan runtime dan visual check;
- mengirim error/log/screenshot bila gagal;
- menyatakan passed/lanjut bila phase diterima.

User tidak perlu melakukan source editing untuk patch assistant dalam workflow normal.

## Assistant

Assistant bertanggung jawab untuk:

- membaca repository terbaru;
- menentukan gap current phase;
- mengedit repository via GitHub plugin;
- menjaga PRD/workplan/architecture;
- membuat commit yang jelas;
- memeriksa hasil write dan GitHub-side checks yang tersedia;
- memperbaiki masalah yang ditemukan sebelum handoff bila memungkinkan;
- melaporkan apa yang sudah dan belum dapat diverifikasi;
- berhenti setelah handoff.

Assistant tidak boleh mengklaim local test passed jika test tersebut belum benar-benar dijalankan.

---

# 4. Source-of-Truth Order

## Product / Architecture

```text
Latest explicit user instruction
→ relevant approved PRD
→ PRD-22 for platform conflicts
→ Master Workplan
→ existing implementation detail
```

Jika user mengubah requirement material, assistant harus memperbarui documentation yang relevan agar code dan PRD/workplan tidak drift.

## Execution Process

```text
Latest explicit user instruction
→ this Workflow
→ PHASE_CONTROL.md
→ Master Workplan
```

---

# 5. Mandatory Preflight Before Every Implementation

Sebelum mengubah repository, assistant wajib:

1. baca workflow versi terbaru;
2. baca `docs/workflow/PHASE_CONTROL.md`;
3. baca scope current phase di Master Workplan;
4. baca PRD yang relevan;
5. baca PRD-22 bila menyentuh stack, architecture, dependency, API, persistence, auth, build, atau deployment;
6. fetch branch `main` terbaru;
7. inspect file yang akan diubah;
8. inspect recent commit bila dibutuhkan;
9. baru membuat implementation.

Assistant tidak boleh memakai memory chat sebagai pengganti repository terbaru.

---

# 6. Full Automation Rule

Default workflow:

```text
Assistant via GitHub plugin
→ create/update/delete code
→ commit ke main
→ handoff
→ user pull dan validasi
```

Assistant tidak boleh secara default meminta user:

- membuat file source;
- copy-paste patch;
- menjalankan generator untuk mengedit repo;
- melakukan search/replace manual;
- commit atau push perubahan assistant.

Manual responsibility user normalnya hanya:

```text
git pull
install dependency bila berubah
run/check/test/build
visual/manual QA
report PASS atau error
```

## External-action exception

Jika ada tindakan yang memang membutuhkan akun/consent/configuration di luar GitHub dan tidak dapat dilakukan assistant, assistant harus:

- menyelesaikan seluruh bagian repo yang masih bisa diotomatisasi;
- menandai `BLOCKED_EXTERNAL` bila benar-benar blocking;
- memberi minimal exact action kepada user;
- tidak berpura-pura external setup sudah berhasil;
- tetap berada di phase yang sama.

---

# 6.1 Package Manager Rule

Canonical package manager adalah **npm**. Gunakan npm workspaces melalui root `package.json`, simpan dependency lock pada `package-lock.json`, dan jangan mencampur package manager lain ke workflow normal.

Command baseline:

```text
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

---

# 7. Branch and Commit Policy

Baseline saat ini adalah direct-to-`main` karena user akan menarik dan memvalidasi setiap hasil phase.

Branch/PR workflow dapat diadopsi nanti jika branch protection atau kebutuhan kolaborasi berubah.

Perubahan satu scope sebaiknya atomic. Jika phase membutuhkan beberapa repair commit, itu diperbolehkan selama semuanya masih dalam phase yang sama.

Commit pattern yang disarankan:

```text
chore(wp-f00): bootstrap workspace toolchain
feat(wp-f06): implement authentication flow
fix(wp-f11): repair schedule publication guard
test(wp-f19): expand security regression coverage
docs(workflow): revise handoff policy
```

---

# 8. Phase State Machine

Status operasional:

```text
NOT_STARTED
→ AUDIT
→ IN_PROGRESS
→ IMPLEMENTED
→ PLUGIN_VERIFIED
→ USER_VALIDATION_REQUIRED
   ├─ PASS → ACCEPTED
   └─ FAIL → QA_FAILED → IN_PROGRESS

Possible blockers:
BLOCKED
BLOCKED_EXTERNAL
SUPERSEDED
```

`PLUGIN_VERIFIED` berarti assistant sudah melakukan verification yang tersedia melalui GitHub/plugin/CI. Itu **bukan** user acceptance.

`ACCEPTED` hanya setelah user menyatakan hasil passed atau secara jelas meminta lanjut setelah validasi.

---

# 9. Strict Phase Rules

## Never auto-advance

Setelah handoff, assistant tidak boleh memulai phase berikutnya meskipun code dan CI terlihat benar.

## User validation is the acceptance boundary

Commit sukses tidak sama dengan phase selesai.

## Failure stays in the same phase

Jika user mengirim error:

```text
current phase
→ QA_FAILED
→ audit latest repo
→ repair
→ verify
→ USER_VALIDATION_REQUIRED
```

Error tidak boleh dipindahkan ke phase berikutnya kecuali user secara eksplisit memilih defer.

## No hidden future scope

Assistant tidak boleh "sekalian" mengerjakan phase berikutnya kecuali itu prerequisite yang benar-benar tidak dapat dipisahkan. Jika terjadi, alasannya harus dijelaskan.

---

# 10. Standard Procedure Per Phase

## Step 1 — Resolve active phase

Baca `PHASE_CONTROL.md`. Jika phase sebelumnya masih menunggu validasi atau gagal QA, jangan buka phase baru.

## Step 2 — Audit

Bandingkan workplan/PRD dengan current implementation dan tentukan gap, dependency, regression surface, dan validation gate.

## Step 3 — Scope lock

Tentukan apa yang wajib selesai di phase saat ini dan apa yang tetap milik future phase.

## Step 4 — Implement

Lakukan seluruh write yang diperlukan melalui GitHub plugin.

Assistant boleh membuat beberapa commit/fix otomatis selama masih menyelesaikan phase yang sama.

## Step 5 — Verify repository result

Setelah write:

- fetch ulang changed file/commit;
- pastikan perubahan benar-benar ada di `main`;
- pastikan temporary file yang tidak dibutuhkan tidak tertinggal;
- inspect CI/check status jika tersedia;
- bila CI gagal karena implementation, repair dalam phase yang sama bila memungkinkan.

## Step 6 — Update phase ledger

Sebelum handoff, update `PHASE_CONTROL.md` dengan:

- current phase;
- `USER_VALIDATION_REQUIRED`;
- latest commit SHA;
- summary;
- required local validation;
- next phase tetap locked.

## Step 7 — Handoff and stop

Handoff minimal berisi:

```text
Phase
Status
Commit SHA(s)
Implemented
GitHub-side verification
What still needs local validation
Exact relevant commands/checks
```

Setelah itu assistant berhenti.

---

# 11. User Validation Protocol

Setelah pull, command generik setelah toolchain tersedia dapat berupa:

```bash
git pull
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

Tetapi assistant harus memberikan command yang relevan terhadap phase saat itu, bukan memaksa seluruh suite setiap kali.

Phase tertentu dapat membutuhkan:

```bash
npm run test:integration
npm run test:rules
npm run test:e2e
npm run test:visual
npm run test:a11y
npm run test:security
npm run test:performance
```

Contoh PASS:

- `passed, lanjut`;
- `semua aman, lanjut phase berikutnya`;
- `udah gue cek nggak ada error, lanjut`.

Contoh FAIL:

- build/test error;
- runtime crash;
- behavior tidak sesuai;
- screenshot alignment/overflow/theme issue;
- auth/API/Firestore error.

Saat FAIL, assistant langsung audit dan repair current phase tanpa meminta user mengulang informasi yang sudah tersedia.

---

# 12. Error and Regression Rule

Saat menerima error, assistant wajib:

1. baca exact evidence;
2. fetch `main` terbaru;
3. cari root cause;
4. perbaiki abstraction yang benar;
5. tambahkan regression test bila defect dapat diuji otomatis;
6. commit fix dengan phase ID;
7. verify GitHub-side result;
8. update phase ledger;
9. handoff ulang;
10. stop.

Assistant tidak boleh membuat gate hijau dengan menghapus test valid, melemahkan assertion penting, mematikan strictness tanpa alasan, atau menutupi defect melalui ignore yang tidak semestinya.

---

# 13. CI Policy

Jika GitHub Actions sudah tersedia:

- inspect status final commit;
- jika gagal, inspect job/log yang tersedia;
- repair known code failure sebelum handoff bila feasible;
- jangan menandai `PLUGIN_VERIFIED` jika required CI diketahui masih merah.

Jika CI belum tersedia, assistant harus menyatakan bahwa repository-level verification sudah dilakukan tetapi typecheck/test/build masih membutuhkan local validation user.

Jika failure berasal dari external platform, klasifikasikan dengan jelas dan jangan mengubah business code hanya untuk menyamarkannya.

---

# 14. UI/UX Validation Rule

Untuk UI phase, validation harus mempertimbangkan surface relevan pada:

- desktop;
- mobile;
- Light Mode;
- Dark Mode.

Check termasuk:

- alignment;
- typography;
- density;
- dead whitespace;
- overflow;
- sticky collision;
- touch usability;
- modal/sheet sizing;
- focus states;
- loading/empty/error states;
- consistency shared component.

Jika user mengirim screenshot defect, assistant tetap berada pada phase tersebut sampai defect scope phase diterima.

---

# 15. Critical Logic Safety Rule

Untuk scheduling, payroll, authorization, compensation, audit, history, dan critical mutation, assistant harus menjaga:

- server-authoritative business validation;
- runtime validation pada trust boundary;
- strict TypeScript contracts;
- no duplicated critical formula in UI;
- explicit timezone handling;
- safe IDR representation;
- idempotency/concurrency policy bila dibutuhkan contract;
- Firestore invariant strategy;
- audit evidence;
- deterministic regression tests;
- historical/effective-date correctness.

UI yang terlihat bekerja belum cukup jika invariant critical belum terbukti.

---

# 16. Dependency Rule

Assistant boleh menambah dependency tanpa confirmation terpisah jika dependency:

- sudah disetujui PRD/workplan; atau
- jelas dibutuhkan current phase;
- tidak mengubah architecture fundamental;
- memiliki responsibility yang jelas.

Hindari overlapping library, dependency berat untuk masalah kecil, dan package yang bertentangan dengan PRD-22.

Perubahan fundamental seperti mengganti Vite, React Router, Firebase/Firestore, Express, Tailwind, atau backend topology membutuhkan explicit user decision dan documentation update.

---

# 17. Workflow and Workplan Change Control

Workflow dan Workplan **boleh berubah sewaktu-waktu** jika implementation menunjukkan kebutuhan nyata, misalnya:

- plugin limitation;
- dependency conflict;
- Firebase constraint;
- CI strategy berubah;
- phase terlalu besar;
- validation flow tidak efektif;
- branch policy berubah;
- production/release strategy berubah.

Jika workflow berubah, assistant harus:

1. menjelaskan alasan;
2. update file workflow melalui GitHub plugin;
3. catat revision history;
4. update `PHASE_CONTROL.md` bila state terpengaruh.

Jika workplan berubah, perubahan phase harus terdokumentasi dan next valid phase harus tetap jelas.

Accepted phase tidak boleh diam-diam diubah sehingga acceptance lama kehilangan makna.

---

# 18. Session Continuity Rule

Pada setiap execution turn, assistant harus mampu merekonstruksi project state dari repository dengan membaca:

```text
docs/workflow/WORKFLOW_Chat_GitHub_Full_Automation_v1.md
docs/workflow/PHASE_CONTROL.md
docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md
docs/prd/README.md
relevant PRD(s)
latest main implementation
```

Repository menjadi continuity source agar development tidak bergantung pada hidden chat memory.

---

# 19. Current Collaboration Contract

1. Semua repository implementation dilakukan assistant via GitHub plugin.
2. Default target adalah `main`.
3. User tidak melakukan normal source editing untuk patch assistant.
4. Setelah assistant handoff, user pull dari GitHub.
5. User melakukan local/runtime/visual validation.
6. Assistant berhenti setelah handoff.
7. Jika gagal, assistant repair phase yang sama.
8. Jika passed, user meminta lanjut.
9. Hanya setelah itu phase berikutnya boleh dimulai.
10. Workflow/workplan boleh berubah jika development memerlukan, tetapi perubahan harus masuk repository.
11. Commit bukan acceptance; user validation adalah final phase boundary.
12. Assistant wajib membaca repository terbaru setiap execution turn.

---

# 20. Handoff Template

```text
WP-Fxx — <Phase Name>
Status: USER_VALIDATION_REQUIRED

Commit:
<sha> — <message>

Implemented:
- ...

GitHub-side verification:
- ...

Belum dapat diverifikasi dari plugin:
- ...

Setelah pull, jalankan/check:
- ...

Kalau failed, kirim output/screenshot.
Kalau passed, bilang lanjut.
```

---

# 21. Revision History

## v1.0 — 2026-08-13

Initial rules:

- full automation through GitHub plugin;
- direct-to-main baseline;
- mandatory repository preflight;
- strict phase state machine;
- plugin verification separated from user acceptance;
- mandatory stop after handoff;
- user pull/test/visual validation;
- same-phase repair rule;
- mutable workflow/workplan;
- repository-based session continuity.