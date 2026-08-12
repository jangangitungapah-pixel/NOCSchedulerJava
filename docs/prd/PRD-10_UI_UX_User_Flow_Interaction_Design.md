# PRD-10 — UI/UX, User Flow & Interaction Design

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — UI/UX & Interaction Design  
> **Document ID:** PRD-10  
> **Status:** Draft — UI/UX Source of Truth  
> **Depends On:** PRD-01 through PRD-09  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Theme Support:** Light + Dark parity required  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **arah UI/UX, user flow, interaction model, responsive experience, spatial composition, information hierarchy, motion behavior, feedback states, accessibility baseline, dan high-fidelity quality bar** untuk NOCScheduler.

PRD-10 menjadi source of truth untuk menjawab:

> **“Bagaimana NOCScheduler harus terasa ketika digunakan—seberapa cepat user memahami keadaan, seberapa sedikit friction untuk menyelesaikan pekerjaan, dan bagaimana desktop maupun mobile sama-sama terasa premium, modern, indah, serta sangat terkontrol?”**

Dokumen ini tidak menggantikan:

- **PRD-11 — Design System & Component Specification**, yang akan menetapkan token, typography scale, radius, elevation, component anatomy, dan theme contract secara detail.
- **PRD-12 — Responsive & Mobile Experience**, yang akan memperdalam behavior mobile, gesture, touch ergonomics, dan breakpoint behavior.
- **PRD-13 — UI Polish & Visual Quality Standard**, yang akan menjadi visual QA checklist dan acceptance bar final.

PRD-10 menetapkan **experience contract** dan interaction behavior yang harus dipatuhi seluruh halaman.

---

# 2. Product Experience Vision

NOCScheduler harus terasa seperti **modern operational workspace kelas premium**, bukan spreadsheet yang dibungkus website dan bukan dashboard generik penuh kartu.

Target experience:

- sangat modern,
- high-fidelity,
- spatial dan memiliki depth,
- terlihat mahal tetapi tidak berlebihan,
- dense namun tetap tenang,
- responsive dan terasa native pada desktop maupun mobile,
- cepat dipahami tanpa onboarding panjang,
- seluruh state terasa disengaja,
- setiap alignment, transition, hover, focus, loading, empty state, dan feedback terlihat polished,
- tetap efisien untuk penggunaan operasional berulang setiap hari.

Target emotional response:

> **“Aplikasinya keren banget, tapi yang lebih penting: gue langsung ngerti harus ngapain.”**

Visual wow-factor tidak boleh mengorbankan speed, clarity, accessibility, atau productivity.

---

# 3. Core UX Principles

## UX-P01 — Desktop and Mobile Have Equal Priority

Desktop dan mobile adalah dua first-class experiences.

Tidak diperbolehkan workflow seperti:

> desktop selesai → mobile sekadar diperkecil.

Setiap fitur P0/P1 harus dinilai secara terpisah untuk:

- desktop usability,
- mobile usability,
- information density,
- input method,
- navigation depth,
- interaction cost.

Desktop dioptimalkan untuk **power and overview**.

Mobile dioptimalkan untuk **speed, clarity, reachability, and focused execution**.

Keduanya memiliki kualitas visual dan UX yang setara.

---

## UX-P02 — Schedule First, Context Always Visible

Jadwal adalah pusat pengalaman.

Dalam beberapa detik setelah membuka aplikasi, user harus dapat memahami:

- hari/tanggal saat ini,
- shift dirinya,
- jam shift,
- shift berikutnya,
- rekan satu shift,
- apakah ada perubahan penting.

User tidak boleh dipaksa membuka beberapa halaman hanya untuk mengetahui kondisi kerja hari ini.

---

## UX-P03 — Frictionless by Default

Setiap flow harus meminimalkan:

- pilihan yang tidak diperlukan,
- input ulang informasi yang sistem sudah tahu,
- modal bertingkat,
- konfirmasi berlebihan,
- navigasi bolak-balik,
- save button yang tidak perlu,
- reload halaman penuh.

Namun low-friction tidak berarti unsafe.

High-risk mutation tetap membutuhkan deliberate confirmation atau review state.

---

## UX-P04 — Spatial, Not Empty

Spatial UI berarti menggunakan:

- hierarchy,
- layering,
- depth,
- grouping,
- responsive composition,
- sticky context,
- controlled whitespace,
- contextual surfaces.

Spatial **bukan** berarti membuat padding raksasa atau membuang ruang.

Desktop harus terasa padat dan produktif, namun tetap memiliki visual breathing room yang terukur.

---

## UX-P05 — Dense but Calm

Informasi boleh banyak, tetapi hierarchy harus membuat mata tahu ke mana melihat lebih dulu.

Gunakan perbedaan:

- size,
- weight,
- contrast,
- grouping,
- surface elevation,
- status emphasis,

bukan hanya whitespace berlebihan.

---

## UX-P06 — One Primary Action per Context

Setiap halaman atau state harus mempunyai satu aksi utama yang jelas.

Contoh:

- Draft Schedule → **Publish Schedule**
- Payroll calculated → **Review / Finalize**
- Request pending → **Approve / Reject** dengan hierarchy yang jelas

Secondary actions tidak boleh bersaing secara visual dengan primary action.

---

## UX-P07 — Progressive Disclosure

Complexity hanya muncul saat dibutuhkan.

Contoh Schedule Management:

- workspace utama tetap fokus pada grid,
- detail employee/date tampil di inspector,
- advanced validation muncul ketika relevan,
- historical diff muncul saat user meminta detail.

Jangan memaksa semua metadata terlihat sekaligus.

---

## UX-P08 — Preserve User Context

Ketika user membuka detail lalu kembali, aplikasi harus mempertahankan sebanyak mungkin:

- period,
- filters,
- scroll position,
- selected employee,
- selected date,
- active tab,
- view mode.

User tidak boleh merasa “dilempar kembali ke awal”.

---

## UX-P09 — No Dead Ends

Empty, error, permission denied, locked, or missing-data states harus menjelaskan:

1. apa yang terjadi,
2. kenapa,
3. apa yang bisa dilakukan berikutnya.

---

## UX-P10 — Immediate Feedback

Setiap action harus memberikan respons visual secepat mungkin.

Contoh:

- button pressed state,
- optimistic selection state jika aman,
- saving indicator,
- success confirmation,
- validation feedback,
- progress untuk operasi berat.

Jangan biarkan user bertanya apakah click-nya bekerja.

---

## UX-P11 — Motion Communicates State

Animasi bukan dekorasi.

Motion harus membantu menjelaskan:

- elemen berasal dari mana,
- state berubah ke mana,
- panel dibuka dari konteks apa,
- data baru menggantikan data lama,
- action berhasil atau gagal.

---

## UX-P12 — Powerful Without Looking Technical

User boleh melakukan operasi kompleks seperti bulk scheduling, payroll review, dan historical comparison tanpa UI terasa seperti database admin panel.

Terminologi UI harus business-oriented, bukan schema-oriented.

---

# 4. Visual Experience Direction

## 4.1 Overall Character

Visual NOCScheduler diarahkan ke:

- contemporary productivity software,
- precise geometry,
- subtle depth,
- high-quality typography,
- restrained translucency,
- crisp borders,
- carefully layered surfaces,
- elegant motion,
- strong information hierarchy,
- premium light/dark parity.

Aplikasi tidak boleh terasa:

- template dashboard generik,
- penuh card yang tidak perlu,
- terlalu rounded dan childish,
- neon cyberpunk berlebihan,
- flat tanpa hierarchy,
- glassmorphism berlebihan sampai readability turun,
- enterprise legacy yang kaku.

---

## 4.2 Spatial Layering

Gunakan hierarchy surface konseptual:

1. **App background**
2. **Navigation shell**
3. **Page canvas**
4. **Primary work surface**
5. **Floating/contextual surface**
6. **Modal / command / critical layer**

Perbedaan layer harus terasa melalui kombinasi border, elevation, contrast, blur, dan motion—bukan shadow besar secara berlebihan.

---

## 4.3 Alignment Quality

Semua elemen harus mengikuti grid dan baseline yang konsisten.

Tidak boleh ada:

- label bergeser beberapa pixel antarfield,
- tombol dengan tinggi berbeda tanpa alasan,
- icon tidak optical-center,
- header tabel tidak sejajar dengan body,
- text baseline tidak konsisten,
- cards yang hampir tetapi tidak benar-benar rata,
- horizontal rhythm berbeda antarhalaman tanpa alasan.

Alignment adalah quality gate, bukan cosmetic preference.

---

## 4.4 Light and Dark Theme

Light Mode adalah default.

Dark Mode wajib memiliki parity penuh:

- contrast,
- hierarchy,
- status readability,
- focus state,
- hover state,
- chart/table readability,
- modal layering,
- schedule color differentiation.

Dark Mode tidak boleh sekadar inverse warna Light Mode.

---

# 5. Application Shell UX

## 5.1 Desktop Shell

Desktop menggunakan struktur:

```text
Sidebar | Main Workspace
        | Top Context Header / Page Header
        | Content
```

Sidebar:

- compact,
- collapsible,
- persistent,
- icon + label saat expanded,
- tooltip saat collapsed,
- active state sangat jelas tetapi tidak agresif.

Main content harus dapat memakai full width secara produktif pada Schedule Management dan payroll tables.

Jangan memaksa seluruh halaman berada dalam narrow centered container.

---

## 5.2 Mobile Shell

Mobile menggunakan:

- compact top app bar,
- bottom navigation,
- contextual header,
- bottom sheet/drawer untuk secondary control,
- sticky primary actions bila perlu.

Bottom navigation canonical mengikuti PRD-06:

- Home
- Schedule
- Team
- Payroll
- More

Area penting harus reachable dengan satu tangan pada mayoritas device modern.

---

## 5.3 Page Header

Page header tidak boleh memakan area berlebihan.

Desktop header idealnya menggabungkan:

- title,
- secondary context,
- status,
- relevant controls,
- primary action.

Mobile header lebih compact dan dapat menggunakan progressive disclosure.

Duplicate giant hero title + page title dilarang.

---

# 6. Dashboard Experience

## 6.1 Primary Goal

Dashboard harus membuat user memahami kondisi kerjanya dalam beberapa detik.

Hierarchy:

1. **My Shift Today**
2. **Next Shift**
3. **Now on Duty**
4. **Recent Schedule Change**
5. **Monthly Shift / Incentive Summary**
6. role-aware operational attention

---

## 6.2 My Shift Today

Harus menjadi visual anchor dashboard.

Informasi minimum:

- shift name,
- start–end time,
- work date,
- status,
- team members,
- change indicator jika baru diubah.

Jika user OFF:

- tampil intentional,
- jangan menyerupai empty/error state.

Jika Unassigned:

- harus berbeda jelas dari OFF.

---

## 6.3 Now on Duty

Didesain sebagai concise live operational surface.

Desktop:

- compact avatar/list layout,
- current shift context,
- coverage awareness.

Mobile:

- horizontally compact atau stacked list,
- tidak memakan seluruh first viewport.

---

# 7. My Schedule UX

## 7.1 Primary Modes

Desktop direkomendasikan mendukung:

- Month
- Week
- Agenda

Mobile direkomendasikan:

- Agenda sebagai quick consumption view,
- compact month strip/calendar,
- swipe/jump date interaction,
- detail selected date di bawahnya.

---

## 7.2 Schedule Cell Information

Calendar cell tidak boleh overloaded.

Priority:

1. day/date,
2. shift identity,
3. state indicator,
4. exception/change marker,
5. secondary metadata on demand.

---

## 7.3 Date Detail

Selecting a date membuka contextual detail tanpa kehilangan calendar context.

Desktop:

- side inspector atau anchored popover/drawer.

Mobile:

- bottom sheet atau inline expanding detail.

Actions seperti Request Change atau Shift Swap harus prefilled dari selected date/assignment.

---

# 8. Team Schedule UX

## 8.1 Consumption First

Team Schedule adalah read-oriented workspace.

Tidak boleh terlihat seperti admin editor bagi regular member.

Core capabilities:

- quickly scan who works when,
- compare shift coverage,
- filter employee/shift,
- jump to today,
- switch planned/effective state jika relevan.

---

## 8.2 Desktop Team Schedule

Recommended pattern:

- sticky employee column,
- sticky date header,
- horizontally scrollable schedule matrix jika diperlukan,
- controlled row density,
- visual shift encoding + text label,
- hover/focus detail,
- keyboard-accessible cell navigation.

Scroll harus smooth dan tidak menggunakan aggressive column snap.

---

## 8.3 Mobile Team Schedule

Jangan memaksa desktop matrix miniatur.

Gunakan kombinasi:

- date-focused view,
- employee cards/rows,
- shift grouping,
- horizontal date strip,
- filter drawer.

Tujuan mobile bukan melihat 31 hari × seluruh employee sekaligus.

---

# 9. Schedule Management UX

## 9.1 Power Workspace

Schedule Management adalah workspace paling powerful di aplikasi.

Desktop merupakan primary high-density environment, namun mobile tetap harus memiliki supported management flow yang usable.

Desktop structure:

```text
Compact Page Header
Period + Status + Publish

Tool Rail / Toolbar
Filters | Bulk Mode | Copy | Template | View

Schedule Grid / Matrix

Context Inspector
Selected Cell / Employee / Validation / History

Validation & Action Layer
```

---

## 9.2 Direct Manipulation

Untuk pekerjaan berulang, UI harus mendukung interaction cepat seperti:

- click cell → quick shift chooser,
- keyboard navigation,
- multi-select,
- bulk assignment,
- copy/paste pattern internal,
- drag interaction hanya jika tidak menimbulkan ambiguity,
- undo sebelum commit jika feasible.

Tidak semua perubahan harus membuka modal.

---

## 9.3 Bulk Mode

Bulk mode harus terlihat sebagai state khusus.

Saat aktif:

- selected cells jelas,
- count selection terlihat,
- action bar kontekstual muncul,
- escape/cancel mudah,
- result validation jelas.

Bulk operation tidak boleh terasa seperti accidental multi-click.

---

## 9.4 Validation Experience

Validation dibagi:

- Error
- Warning
- Info

UI harus menunjukkan:

- total issue,
- issue per employee/date,
- jump-to-location,
- explanation,
- recommended resolution bila tersedia.

Publish dengan blocking error harus disabled/blocked dengan alasan yang jelas.

Jangan hanya menampilkan toast `Validation failed`.

---

## 9.5 Publish Flow

Publish adalah high-impact action.

Flow:

1. Validate
2. Show concise summary
3. Highlight unresolved warnings
4. Confirm publish
5. Progress state
6. Success state + notification awareness

Tidak perlu modal besar jika semua context sudah berada di page; dapat menggunakan review drawer atau confirmation sheet.

---

## 9.6 Mobile Schedule Management

Mobile tidak boleh sekadar menampilkan matrix sempit.

Recommended model:

- date-by-date focused editing,
- employee list per selected date,
- quick shift chips/menu,
- bulk by employee atau date melalui selection mode,
- validation summary sebagai bottom sheet,
- sticky Save/Publish context bila relevan.

Mobile harus memungkinkan emergency correction dengan nyaman walaupun bulk planning skala besar tetap lebih efisien di desktop.

---

# 10. Request & Exception UX

## 10.1 Request Creation

Flow harus contextual.

Ideal:

`Schedule date → action → request form prefilled`

System otomatis mengisi:

- employee,
- work date,
- current assignment,
- shift,
- applicable request options.

User hanya memasukkan informasi yang memang belum diketahui sistem.

---

## 10.2 Request Type Selection

Jangan tampilkan semua form sekaligus.

Gunakan staged selection:

1. pilih jenis request,
2. tampilkan field yang relevan,
3. preview impact,
4. submit.

---

## 10.3 Shift Swap

Swap UX wajib memperlihatkan dua sisi dengan jelas:

```text
YOU
12 Aug — Shift 3

SWAP WITH
Andi
13 Aug — Shift 2
```

Sebelum submit/approve, tampilkan:

- resulting schedule,
- conflict/warning,
- affected dates,
- incentive/payroll awareness jika relevan.

---

## 10.4 Approval UX

Approver harus bisa memahami request tanpa membuka banyak halaman.

Detail view menampilkan:

- requester,
- before,
- proposed after,
- impact,
- validation,
- related coverage,
- reason,
- history.

Primary actions:

- Approve
- Reject

High-risk override membutuhkan reason.

---

# 11. Employee Experience

## 11.1 Employee List

Desktop:

- dense table/list hybrid,
- sticky header,
- fast search,
- role/status/current shift,
- minimal wasted space.

Mobile:

- compact rows/cards,
- current/next shift context,
- quick detail navigation.

---

## 11.2 Employee Detail

Detail menggunakan one-profile mental model.

Recommended tabs:

- Overview
- Schedule
- Payroll
- History

Header employee compact; jangan membuat hero profile raksasa.

---

# 12. Payroll UX

## 12.1 Payroll Overview

Payroll harus terasa seperti controlled financial workspace, bukan spreadsheet mentah.

Hierarchy:

- period selector,
- lifecycle status,
- aggregate totals,
- attention/errors,
- employee table,
- primary workflow action.

---

## 12.2 Monthly Payroll Table

Desktop harus mendukung high-density comparison.

Recommended columns:

- Employee
- Base Salary
- S1
- S2
- S3
- Shift Incentive
- Adjustment
- Deduction
- THP
- Status

Columns dapat responsive/hide berdasarkan viewport tetapi employee + THP + status tetap prioritas.

---

## 12.3 Payroll Detail

Setiap angka harus explainable.

User dapat drill-down:

`THP → component → shift/rate segment → source work dates`

Detail jangan langsung menampilkan semua source row.

Gunakan progressive disclosure.

---

## 12.4 Payroll Lifecycle Interaction

State harus sangat jelas:

- OPEN
- CALCULATED
- DIRTY/OUTDATED
- FINALIZED
- LOCKED

Status tidak hanya mengandalkan warna; gunakan text/icon/label.

Action tersedia sesuai lifecycle dan permission.

---

## 12.5 Locked Payroll

Locked state harus terasa deliberate.

Mutation controls hilang/disabled sesuai permission.

Jika user memiliki permission unlock:

- action ditempatkan sebagai secondary/high-risk action,
- tidak bersebelahan seolah setara dengan normal edit,
- reason wajib.

---

# 13. Settings UX

## 13.1 Settings Is Configuration, Not Operations

Settings menggunakan navigation lokal yang jelas:

- General
- Shifts
- Payroll
- Compensation
- Holidays
- Access
- Notifications

---

## 13.2 Form Density

Desktop settings harus compact dan aligned.

Hindari form dengan satu field per layar atau kartu besar untuk setiap input.

Gunakan grouped sections dengan label, description singkat, control, dan supporting metadata yang sejajar.

---

## 13.3 Autosave vs Explicit Save

Preference/non-critical settings boleh autosave jika aman.

Critical configuration seperti:

- shift effective version,
- salary,
- incentive,
- permission,
- payroll rule,

harus menggunakan explicit review/save karena berdampak historis/finansial.

---

## 13.4 Effective Date UX

Jika setting menggunakan effective dating, UI wajib membuat efek tanggal mudah dipahami.

Contoh:

> Tarif baru mulai berlaku **1 September 2026**. Payroll sebelum tanggal tersebut tidak berubah.

Jangan hanya tampilkan field `effective_from` tanpa explanation.

---

# 14. Search & Command UX

Global search/command palette adalah P1 productivity feature.

Desktop shortcut direkomendasikan:

`Ctrl/Cmd + K`

Search targets:

- employee,
- schedule period,
- payroll period,
- request,
- settings section,
- action sesuai permission.

Result grouped dan keyboard navigable.

Mobile menggunakan full-screen search sheet/page.

---

# 15. Notification UX

Notification harus actionable dan contextual.

Contoh:

> Jadwal kamu tanggal 14 Aug berubah S2 → S3.

Tap/click membuka exact schedule context.

Read/unread indicator subtle tetapi jelas.

Jangan menggunakan notification center sebagai duplicate audit log.

---

# 16. Loading Experience

## 16.1 Avoid Full-Page Spinners

Gunakan skeleton atau localized loading untuk mempertahankan spatial structure.

Full-screen loading hanya untuk initial application bootstrap/auth state jika benar-benar perlu.

---

## 16.2 Skeleton Fidelity

Skeleton harus menyerupai bentuk content sebenarnya.

Jangan gunakan random gray rectangles dengan ukuran tidak realistis.

---

## 16.3 Mutation Loading

Saat save/publish/calculate:

- action state jelas,
- duplicate submission dicegah,
- page context tetap terlihat jika aman,
- operation failure tidak menghapus input user.

---

# 17. Empty State Experience

Empty state dibagi berdasarkan sebab:

- legitimately empty,
- no search result,
- no permission,
- not configured,
- not created yet,
- filtered to zero.

Contoh `No payroll yet` berbeda dengan `No result for current filter`.

Empty state harus compact; jangan menghabiskan seluruh layar dengan ilustrasi besar tanpa fungsi.

---

# 18. Error Experience

Error message harus:

- manusiawi,
- spesifik,
- memberi next action,
- tidak membocorkan internal stack trace.

Contoh baik:

> Jadwal tidak bisa dipublish karena 3 assignment masih bentrok. Review konflik sebelum melanjutkan.

Bukan:

> Error 422.

Technical reference/correlation ID dapat ditampilkan dalam expandable detail untuk support.

---

# 19. Toast, Banner, Inline Feedback

Gunakan hierarchy:

- **Inline** → field/context issue.
- **Toast** → confirmation ringan/non-blocking.
- **Banner** → page-level state yang perlu perhatian.
- **Dialog/Sheet** → keputusan penting/high-risk.

Jangan menggunakan toast sebagai satu-satunya tempat untuk critical validation.

---

# 20. Motion & Animation Direction

## 20.1 Motion Character

Motion harus:

- cepat,
- smooth,
- spatial,
- responsive,
- tidak cartoonish,
- tidak menghambat workflow.

---

## 20.2 Motion Categories

### Micro feedback

Untuk:

- hover,
- press,
- toggle,
- selection,
- checkbox,
- chip.

Harus terasa instant.

### Surface transition

Untuk:

- drawer,
- inspector,
- bottom sheet,
- popover,
- modal.

Motion menjelaskan arah dan layer.

### Content transition

Untuk:

- period change,
- tab change,
- filter result,
- schedule detail swap.

Gunakan subtle fade/translate/crossfade yang menjaga orientation.

### State transition

Untuk:

- published,
- approved,
- finalized,
- locked,
- success/failure.

Boleh memiliki slightly richer feedback tetapi tetap singkat.

---

## 20.3 Reduced Motion

`prefers-reduced-motion` wajib dihormati.

Essential state feedback tetap terlihat tanpa bergantung pada animation.

---

# 21. Gesture & Touch Principles

Mobile touch target harus nyaman untuk satu tangan.

Gesture boleh digunakan untuk enhancement, tetapi critical action tidak boleh hanya tersedia lewat gesture tersembunyi.

Swipe dapat dipakai untuk:

- berpindah hari/periode,
- membuka secondary action yang juga tersedia secara eksplisit.

Hindari gesture yang bentrok dengan horizontal schedule scrolling.

---

# 22. Keyboard & Desktop Productivity

Desktop power workflow harus keyboard-friendly.

Minimum goals:

- logical tab order,
- visible focus,
- Escape menutup transient surface,
- Enter/Space mengaktifkan control sesuai semantic,
- arrow-key navigation pada grid jika feasible,
- command palette shortcut,
- bulk selection keyboard support pada schedule workspace.

Shortcut custom harus discoverable dan tidak menimpa browser behavior penting tanpa alasan kuat.

---

# 23. Accessibility Baseline

High-fidelity tidak boleh mengurangi accessibility.

Minimum:

- semantic HTML,
- keyboard navigability,
- focus visible,
- meaningful labels,
- non-color status cue,
- sufficient contrast,
- screen-reader friendly form errors,
- responsive text,
- reduced motion support,
- touch target ergonomics.

Target formal accessibility level ditentukan pada PRD quality/technical, tetapi desain harus diarahkan minimal ke praktik WCAG modern yang masuk akal untuk aplikasi internal.

---

# 24. Responsive Philosophy

Responsive behavior bukan hanya breakpoint resize.

Setiap viewport mempertimbangkan:

- hierarchy,
- action priority,
- density,
- interaction method,
- visibility,
- navigation mode.

Responsive transformation examples:

| Desktop | Mobile |
|---|---|
| Sidebar | Bottom navigation + More |
| Right inspector | Bottom sheet |
| Dense table | Priority rows/cards |
| Full toolbar | Primary controls + filter sheet |
| Multi-column summary | Stacked/scrollable summary |
| Schedule matrix | Date-focused schedule |

Detail breakpoint ditentukan PRD-12.

---

# 25. User Flow — Daily NOC Member

Target flow:

```text
Open App
  ↓
Dashboard
  ↓
See Today's Shift immediately
  ↓
Optional: See Team / Next Shift / Recent Change
```

Target experience: tidak perlu lebih dari satu navigational decision untuk mengetahui jadwal hari ini.

---

# 26. User Flow — View Monthly Schedule

```text
Dashboard / Bottom Nav
  ↓
My Schedule
  ↓
Month / Agenda
  ↓
Select Date
  ↓
Context Detail
```

Selected period/context harus dipertahankan saat kembali.

---

# 27. User Flow — Create Schedule Request

```text
My Schedule
  ↓
Select Shift/Date
  ↓
Request Action
  ↓
Choose Request Type
  ↓
Prefilled Form
  ↓
Impact Preview
  ↓
Submit
  ↓
Status Confirmation
```

---

# 28. User Flow — Scheduler Creates Monthly Schedule

```text
Manage Schedule
  ↓
Create/Open Draft Period
  ↓
Copy Previous / Template / Blank
  ↓
Bulk Edit + Individual Adjustments
  ↓
Validation
  ↓
Resolve Blocking Issues
  ↓
Publish Review
  ↓
Publish
  ↓
Success + Notifications
```

Flow harus memungkinkan scheduler menyelesaikan mayoritas pekerjaan tanpa berpindah route.

---

# 29. User Flow — Emergency Published Correction

```text
Team Schedule / Manage Schedule
  ↓
Locate Employee + Date
  ↓
Controlled Edit
  ↓
Show Current → Proposed State
  ↓
Validation + Reason if required
  ↓
Confirm
  ↓
Schedule Revision + Audit
  ↓
Notification / Payroll Dirty Awareness
```

---

# 30. User Flow — Approve Request

```text
Notification / Requests
  ↓
Request Detail
  ↓
Before + Proposed After + Impact
  ↓
Approve / Reject
  ↓
Validation
  ↓
Atomic State Update
  ↓
Success + Related Schedule Context
```

---

# 31. User Flow — Monthly Payroll Review

```text
Payroll Overview
  ↓
Select Period
  ↓
Calculate / Review Current State
  ↓
Resolve Errors / Dirty Sources
  ↓
Inspect Employee Outliers
  ↓
Drill-down Component if needed
  ↓
Finalize
  ↓
Lock
```

Lifecycle state harus selalu visible agar reviewer tidak kehilangan context.

---

# 32. User Flow — Change Incentive Rate

```text
Settings → Compensation
  ↓
Select Shift Incentive
  ↓
Enter New Rate
  ↓
Choose Effective Date
  ↓
Impact Explanation
  ↓
Review
  ↓
Save New Version
  ↓
Success + Effective Date Confirmation
```

Historical rate tidak diedit secara destructive.

---

# 33. User Flow — Audit Investigation

```text
Contextual History / Activity
  ↓
Filter Domain / Employee / Date
  ↓
Select Event
  ↓
Human-readable Summary
  ↓
Before / After
  ↓
Related Correlated Events
```

Technical payload tidak menjadi default first view.

---

# 34. High-Fidelity Interaction Standards

Setiap interactive component wajib mempunyai state yang didesain:

- default,
- hover bila applicable,
- focus,
- active/pressed,
- selected,
- disabled,
- loading,
- success bila relevant,
- error bila relevant.

Tidak boleh ada komponen production yang hanya memiliki default state.

---

# 35. Visual Density Rules

Desktop:

- prioritaskan density produktif,
- row height compact tetapi nyaman,
- hindari repeated large cards,
- gunakan full viewport width bila memberi nilai.

Mobile:

- compact tetapi touch-friendly,
- jangan mengecilkan font/control demi memuat semuanya,
- prioritaskan informasi lalu disclosure sisanya.

---

# 36. Anti-Patterns — Dilarang

- Giant hero heading pada halaman operasional.
- White space berlebihan yang mengurangi information density.
- Card di dalam card di dalam card tanpa hierarchy yang jelas.
- Modal untuk setiap edit kecil.
- Scroll nested horizontal + vertical yang tidak terkendali.
- Horizontal scroll dengan aggressive snap pada schedule grid.
- Table desktop dipaksa menjadi tiny table di mobile.
- Hidden destructive gesture tanpa alternative visible action.
- Animation panjang sebelum user dapat berinteraksi.
- Blur/transparency yang menurunkan readability.
- Icon-only action tanpa tooltip/accessible label pada desktop.
- Status hanya dibedakan menggunakan warna.
- Duplicate page title/hero.
- Save button jauh dari area edit tanpa sticky/contextual support.
- Toast sebagai satu-satunya error explanation.
- Global loading spinner untuk perubahan kecil.
- Reset filter/scroll setiap user membuka detail lalu kembali.

---

# 37. UX Business Rules

- **UX-001** — Desktop dan mobile memiliki product priority yang setara.
- **UX-002** — Dashboard harus membuat shift hari ini dapat diketahui tanpa navigasi tambahan.
- **UX-003** — OFF dan Unassigned harus memiliki representation berbeda.
- **UX-004** — Draft dan Published schedule harus dapat dibedakan secara jelas.
- **UX-005** — High-risk mutation harus memiliki deliberate review/confirmation.
- **UX-006** — Low-risk repetitive edit tidak boleh selalu membutuhkan modal.
- **UX-007** — Contextual action harus prefill known data.
- **UX-008** — Returning navigation harus mempertahankan context bila feasible.
- **UX-009** — Validation harus menunjukkan location dan explanation.
- **UX-010** — Blocking validation tidak boleh hanya berupa toast.
- **UX-011** — Mobile Team Schedule tidak boleh sekadar matrix desktop yang diperkecil.
- **UX-012** — Mobile Manage Schedule harus memiliki focused editing model sendiri.
- **UX-013** — Desktop Manage Schedule harus mendukung high-density operation.
- **UX-014** — Published correction harus menampilkan before/after awareness.
- **UX-015** — Payroll lifecycle state harus selalu mudah dikenali.
- **UX-016** — Payroll number harus mempunyai drill-down path ke source.
- **UX-017** — Locked payroll harus memiliki visual state yang deliberate.
- **UX-018** — Effective-dated setting harus menjelaskan kapan perubahan berlaku.
- **UX-019** — Empty state harus membedakan empty, filtered zero, dan missing configuration.
- **UX-020** — Error state harus memberi recovery path jika memungkinkan.
- **UX-021** — Animation tidak boleh memblokir interaction lebih lama dari yang diperlukan.
- **UX-022** — Reduced motion harus didukung.
- **UX-023** — Keyboard focus harus terlihat.
- **UX-024** — Critical mobile action tidak boleh gesture-only.
- **UX-025** — Theme parity berlaku untuk Light dan Dark.
- **UX-026** — UI tidak boleh bergantung pada warna saja untuk status.
- **UX-027** — Major workspace harus menggunakan viewport secara efisien.
- **UX-028** — Nested card hierarchy tanpa fungsi jelas dilarang.
- **UX-029** — Duplicate giant page headers dilarang.
- **UX-030** — Loading state harus mempertahankan spatial context bila memungkinkan.
- **UX-031** — User input tidak boleh hilang setelah recoverable failure.
- **UX-032** — Bulk mode harus memiliki explicit entry/exit state.
- **UX-033** — Permission-aware action yang tidak tersedia tidak boleh menimbulkan dead-end.
- **UX-034** — Activity history default harus human-readable.
- **UX-035** — Search/command result harus keyboard navigable di desktop.
- **UX-036** — Main mobile destinations harus reachable melalui bottom navigation atau maksimal satu secondary navigation action.
- **UX-037** — Touch controls harus ergonomis dan tidak terlalu rapat.
- **UX-038** — Visual alignment inconsistencies adalah UI defect.
- **UX-039** — Microinteraction harus konsisten dengan state transition yang direpresentasikan.
- **UX-040** — Wow-factor tidak boleh mengorbankan clarity, performance, atau task completion speed.

---

# 38. UX Acceptance Scenarios

## UX-A01 — Daily Schedule Discovery

Given user baru membuka aplikasi,
when Dashboard selesai dimuat,
then user dapat mengetahui shift hari ini, jam kerja, dan state OFF/Unassigned tanpa membuka halaman lain.

## UX-A02 — Mobile Daily Usage

Given viewport mobile,
when user membuka Schedule,
then jadwal personal dapat dibaca tanpa horizontal scrolling wajib untuk informasi utama.

## UX-A03 — Desktop Schedule Power Use

Given Scheduler membuka Manage Schedule desktop,
when melakukan assignment berulang,
then operasi bulk dan quick edit dapat dilakukan tanpa modal per cell.

## UX-A04 — Mobile Emergency Correction

Given Scheduler hanya memiliki ponsel,
when perlu mengoreksi satu published shift,
then flow dapat diselesaikan secara aman tanpa menggunakan desktop matrix miniatur.

## UX-A05 — Validation Recovery

Given draft memiliki blocking error,
when user menekan Publish,
then UI menjelaskan issue dan menyediakan jump-to-location/context untuk memperbaikinya.

## UX-A06 — Shift Swap Understanding

Given user mengajukan shift swap,
then sebelum submit user dapat melihat kondisi sebelum dan hasil setelah swap.

## UX-A07 — Payroll Explainability

Given user melihat THP,
when membuka detail,
then user dapat menelusuri komponen insentif ke shift/rate/work date sumbernya.

## UX-A08 — Dirty Payroll

Given source berubah setelah payroll calculated,
then status outdated/dirty terlihat jelas dan action finalization tidak menyesatkan.

## UX-A09 — Locked Payroll

Given payroll locked,
then mutation biasa tidak tampil sebagai tindakan normal dan unlock hanya terlihat untuk permission yang berhak.

## UX-A10 — Effective Date Change

Given admin mengubah incentive rate,
then UI menjelaskan effective date dan memberi awareness bahwa historical payroll sebelumnya tidak berubah.

## UX-A11 — Return Context

Given user membuka employee detail dari filtered Team Schedule,
when kembali,
then filter/period/context sebelumnya dipertahankan bila state masih valid.

## UX-A12 — Theme Parity

Given user berpindah Light ↔ Dark,
then information hierarchy, status distinction, focus, hover, schedule labels, dan readability tetap setara.

## UX-A13 — Reduced Motion

Given OS menggunakan reduced motion,
then seluruh task tetap dapat dipahami dan diselesaikan tanpa animation dependency.

## UX-A14 — Keyboard Navigation

Given desktop keyboard user,
then core navigation, form, dialog, dan major workspace controls dapat diakses tanpa mouse.

## UX-A15 — Recoverable Error

Given mutation gagal karena validation/network recoverable,
then input user tidak hilang dan UI menjelaskan tindakan berikutnya.

---

# 39. High-Fidelity Definition of Done

Sebuah halaman belum dianggap UI/UX selesai hanya karena seluruh fitur dapat diklik.

Definition of Done mencakup:

1. desktop layout selesai,
2. mobile layout selesai,
3. Light Mode selesai,
4. Dark Mode selesai,
5. default state selesai,
6. loading state selesai,
7. empty state selesai,
8. error state selesai,
9. permission state selesai,
10. responsive transformation selesai,
11. keyboard/focus state selesai,
12. hover/pressed/selected state selesai,
13. microinteraction selesai,
14. reduced-motion behavior selesai,
15. alignment QA selesai,
16. typography hierarchy konsisten,
17. no accidental overflow,
18. no unclear truncation,
19. contextual navigation tested,
20. primary user flow dapat diselesaikan tanpa friction yang tidak perlu.

---

# 40. Relationship to Next PRDs

PRD-10 menetapkan **how the application should feel and behave**.

Dokumen berikutnya memperdalamnya:

### PRD-11 — Design System & Component Specification

Akan menentukan:

- typography system,
- spacing/token system,
- color semantics,
- surface hierarchy,
- radius,
- elevation,
- icon rules,
- buttons,
- forms,
- tables,
- calendar cells,
- drawers,
- modal,
- toast,
- badges,
- component state contracts,
- Light/Dark theme tokens.

### PRD-12 — Responsive & Mobile Experience

Akan memperdalam:

- breakpoints,
- mobile ergonomics,
- one-hand reachability,
- sticky zones,
- bottom navigation,
- touch gestures,
- mobile schedule patterns,
- responsive transformation per page.

### PRD-13 — UI Polish & Visual Quality Standard

Akan menjadi strict visual QA contract untuk:

- pixel alignment,
- spacing,
- optical balance,
- animation quality,
- truncation,
- surface consistency,
- theme parity,
- final screenshot acceptance.

---

# 41. Final Experience Standard

NOCScheduler harus mencapai kombinasi berikut:

```text
Visual Wow
+ Operational Speed
+ Information Clarity
+ Spatial Depth
+ Mobile Excellence
+ Desktop Power
+ Interaction Precision
+ Historical Trust
= NOCScheduler Experience
```

Target akhir bukan sekadar aplikasi yang “bagus dilihat”.

Target akhir adalah aplikasi yang:

- terasa modern saat pertama dibuka,
- terasa natural setelah digunakan berulang kali,
- tetap cepat ketika data bertambah,
- memberikan confidence saat user melakukan tindakan penting,
- mempunyai kualitas visual yang membuat aplikasi internal terasa setara produk SaaS premium,
- dan membuat pekerjaan scheduling serta payroll terasa jauh lebih sederhana daripada kompleksitas bisnis di belakangnya.
