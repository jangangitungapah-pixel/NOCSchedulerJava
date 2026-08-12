# PRD-12 — Responsive & Mobile Experience

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Responsive & Mobile Experience  
> **Document ID:** PRD-12  
> **Status:** Draft — Responsive Experience Source of Truth  
> **Depends On:** PRD-01 through PRD-11  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Theme Support:** Light + Dark parity required  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **responsive strategy, breakpoint behavior, mobile information architecture, touch ergonomics, one-hand usability, safe-area behavior, keyboard handling, orientation behavior, responsive reflow, mobile data presentation, sticky controls, gesture policy, dan adaptive interaction model** untuk NOCScheduler.

PRD-12 menjadi source of truth untuk menjawab:

> **“Bagaimana NOCScheduler tetap terasa cepat, premium, spatial, padat, jelas, dan mudah dioperasikan pada ukuran layar apa pun tanpa menjadikan mobile sekadar versi desktop yang dikecilkan?”**

Dokumen ini memperdalam PRD-10 dan PRD-11.

- PRD-10 menentukan experience dan interaction philosophy.
- PRD-11 menentukan design system dan component contract.
- PRD-12 menentukan bagaimana experience dan component tersebut **beradaptasi terhadap ruang, input method, dan device constraints**.

PRD-12 tidak menggantikan PRD-13 — UI Polish & Visual Quality Standard, yang akan menjadi quality gate visual terakhir.

---

# 2. Responsive Experience Vision

NOCScheduler harus terasa seperti dua pengalaman yang sama-sama matang:

### Desktop

> **Powerful operational cockpit.**

Desktop mengutamakan:

- overview,
- density,
- multi-column information,
- bulk operations,
- keyboard efficiency,
- simultaneous context,
- large schedule workspace,
- payroll review,
- reporting.

### Mobile

> **Focused operational companion.**

Mobile mengutamakan:

- immediate awareness,
- one-hand navigation,
- quick decisions,
- schedule visibility,
- focused editing,
- approval/review,
- payroll consumption,
- request submission,
- interruption-friendly interaction.

Keduanya harus terasa berasal dari produk yang sama dan memiliki visual fidelity yang setara.

---

# 3. Core Responsive Principles

## RSP-P01 — Mobile Is Not Scaled Desktop

Mobile tidak boleh dibuat dengan sekadar:

- mengecilkan font,
- mengecilkan padding,
- menyembunyikan beberapa kolom,
- lalu membiarkan struktur desktop tetap sama.

Jika struktur interaction desktop tidak cocok di layar sempit, komposisi wajib berubah.

---

## RSP-P02 — Equal Product Priority

Fitur P0 dan P1 wajib mempunyai acceptance criteria desktop dan mobile.

Sebuah fitur belum selesai jika:

- desktop bagus tetapi mobile buruk,
- mobile bagus tetapi desktop kehilangan productivity.

---

## RSP-P03 — Responsive Means Recomposition

Adaptasi boleh berupa:

- columns → stack,
- sidebar → bottom navigation,
- inspector → bottom sheet,
- table → list/detail drill-down,
- toolbar → compact action bar,
- hover detail → tap detail,
- inline advanced form → progressive disclosure.

Semantics tetap sama meskipun composition berubah.

---

## RSP-P04 — One-Hand Reachability Matters

Action yang sering digunakan di mobile harus berada pada area yang dapat dijangkau tanpa hand gymnastics berlebihan.

Prioritaskan area bawah layar untuk:

- primary navigation,
- contextual primary action,
- confirm/save action,
- quick filters bila relevan.

---

## RSP-P05 — Content Before Chrome

Pada layar kecil, ruang utama harus diberikan kepada content, bukan decorative shell.

Hindari:

- header tinggi,
- breadcrumb panjang,
- hero banner,
- card wrapper bertingkat,
- toolbar dua/tiga baris tanpa prioritas.

---

## RSP-P06 — No Accidental Horizontal Scroll

Horizontal scrolling hanya boleh digunakan pada component yang memang membutuhkan sumbu horizontal dan memiliki affordance yang jelas.

Contoh yang diperbolehkan:

- timeline,
- schedule date strip,
- schedule matrix tertentu,
- compact chart.

Page-level accidental horizontal overflow adalah defect.

---

## RSP-P07 — Gesture Enhances, Never Hides Critical Actions

Gesture boleh mempercepat workflow tetapi critical action tidak boleh hanya tersedia melalui gesture.

Contoh:

- swipe untuk quick action boleh ada,
- tetapi action yang sama tetap tersedia melalui visible menu/button.

---

## RSP-P08 — Safe Areas Are First-Class

Bottom navigation, sticky CTA, sheet, dan floating surface harus memperhitungkan device safe-area inset.

Tidak boleh ada button utama tertutup home indicator atau browser chrome.

---

## RSP-P09 — Keyboard Is a Layout State

Kemunculan virtual keyboard harus diperlakukan sebagai responsive state.

Form tidak boleh:

- kehilangan field aktif,
- menaruh CTA di belakang keyboard,
- melakukan scroll jump agresif,
- memaksa user menutup keyboard untuk melihat validation.

---

## RSP-P10 — Orientation Must Not Break Work

Landscape mobile/tablet boleh mengubah komposisi untuk memanfaatkan lebar tambahan tetapi tidak boleh kehilangan state.

Rotation tidak boleh menghapus:

- form input,
- selected employee,
- selected date,
- filter,
- draft edit,
- scroll context bila dapat dipertahankan.

---

# 4. Breakpoint Strategy

## 4.1 Breakpoints Are Behavioral Boundaries

Breakpoint tidak digunakan hanya karena device populer memiliki ukuran tertentu.

Gunakan breakpoint ketika layout membutuhkan behavior baru.

Baseline responsive bands:

| Band | Suggested Range | Primary Intent |
|---|---:|---|
| Compact Mobile | `< 480px` | one-hand focused experience |
| Mobile | `480–767px` | larger phone / landscape-aware |
| Tablet | `768–1023px` | adaptive two-pane where useful |
| Compact Desktop | `1024–1279px` | dense desktop, reduced secondary chrome |
| Desktop | `1280–1599px` | canonical power workspace |
| Wide Desktop | `>= 1600px` | expanded context, never empty stretch |

Exact CSS breakpoints dapat disesuaikan saat implementation jika content-driven testing menunjukkan kebutuhan berbeda.

---

## 4.2 No Device Name Logic

Business/UI behavior tidak boleh bergantung pada user-agent seperti:

```text
if iPhone ...
if Android ...
```

Gunakan:

- viewport,
- input capabilities,
- pointer precision,
- hover availability,
- feature detection.

---

## 4.3 Container Strategy

Halaman informasi normal dapat menggunakan max-content width agar teks dan form tidak melebar berlebihan.

Power workspace seperti:

- Schedule Management,
- Team Schedule,
- Monthly Payroll,
- Reports,

boleh memanfaatkan hampir seluruh viewport width.

Wide desktop tidak boleh menghasilkan ruang kosong besar hanya karena container terlalu sempit.

---

# 5. Application Shell Adaptation

## 5.1 Desktop Shell

Desktop menggunakan:

- left sidebar,
- compact top utility area bila diperlukan,
- main content,
- optional right inspector/context surface.

Sidebar dapat collapsed.

---

## 5.2 Tablet Shell

Tablet dapat menggunakan salah satu:

- compact sidebar,
- temporary navigation rail,
- drawer navigation,

berdasarkan available width.

Jangan memaksakan full expanded sidebar jika content workspace menjadi terlalu sempit.

---

## 5.3 Mobile Shell

Mobile canonical shell:

```text
Compact App Header
Main Scrollable Content
Bottom Navigation
Optional Contextual Sticky Action
```

Bottom navigation mengikuti PRD-06:

- Home
- Schedule
- Team
- Payroll
- More

---

## 5.4 Mobile Header

Header mobile harus compact.

Recommended anatomy:

- optional back button,
- concise title,
- one/two contextual actions,
- notification/profile entry bila context memungkinkan.

Hindari header dua tingkat kecuali benar-benar diperlukan.

---

## 5.5 Sticky Layers

Sticky element hierarchy harus terkontrol.

Contoh mobile:

1. browser/device chrome,
2. application header,
3. sticky contextual filter/date strip,
4. content,
5. contextual CTA,
6. bottom navigation.

Sticky surface tidak boleh saling menutupi.

---

# 6. Safe Area & Viewport Rules

## 6.1 Safe Area

Gunakan safe-area variables untuk:

- bottom navigation,
- sticky CTA,
- bottom sheet,
- full-screen dialog,
- landscape side inset jika relevan.

---

## 6.2 Dynamic Viewport Height

Mobile browser chrome dapat mengubah visual viewport.

Hindari ketergantungan buta pada `100vh` untuk full-height surface.

Gunakan dynamic viewport strategy yang sesuai platform modern.

---

## 6.3 Scroll Container Discipline

Baseline preference:

- satu primary vertical scroll container per screen.

Nested vertical scroll hanya digunakan jika benar-benar diperlukan.

Drawer/sheet dapat memiliki internal scroll, tetapi body di belakang harus dikunci dengan benar.

---

# 7. Touch Ergonomics

## 7.1 Minimum Interactive Target

Target sentuh mobile harus cukup besar untuk penggunaan operasional cepat.

Recommended baseline:

- minimum practical target sekitar 44×44 CSS px,
- visual icon dapat lebih kecil selama hit area memenuhi target.

Dense desktop control boleh lebih compact karena pointer precision lebih tinggi.

---

## 7.2 Spacing Between Critical Targets

Critical adjacent actions seperti:

- Approve / Reject,
- Lock / Cancel,
- Delete / Save,

harus memiliki separation yang cukup untuk mencegah mis-tap.

---

## 7.3 Primary Action Reachability

Pada mobile form panjang, primary submit dapat menggunakan sticky bottom action area bila membantu.

CTA tidak boleh selalu dipaksa sticky jika hanya menambah chrome dan mengurangi viewport.

---

# 8. Thumb Zone Strategy

## 8.1 Frequently Used Actions

Action frekuensi tinggi:

- switch schedule view,
- jump today,
- submit request,
- approve/reject request,
- open employee detail,
- view payroll breakdown,

harus reachable tanpa perlu menjangkau pojok atas berkali-kali.

---

## 8.2 Top Area Usage

Area atas diprioritaskan untuk:

- title/context,
- back navigation,
- low-frequency overflow action.

Jangan menempatkan semua action penting di kanan atas hanya karena pola desktop demikian.

---

# 9. Mobile Navigation Behavior

## 9.1 Bottom Navigation Persistence

Bottom nav terlihat pada top-level screen.

Pada immersive flow seperti:

- full-screen edit,
- bottom sheet expanded penuh,
- confirmation flow,

bottom nav dapat disembunyikan sementara jika mengurangi confusion.

---

## 9.2 Navigation State Preservation

Berpindah antar top-level tab sebaiknya mempertahankan state lokal yang reasonable:

- selected month,
- filter,
- scroll position,
- active segment.

---

## 9.3 Back Behavior

Back harus predictable.

Priority:

1. close popover/sheet,
2. close detail overlay,
3. return ke previous contextual page,
4. jangan langsung melempar user ke dashboard jika sebelumnya berada di nested schedule flow.

---

# 10. Dashboard Responsive Experience

## 10.1 Desktop

Dashboard desktop dapat menggunakan multi-column composition.

Recommended hierarchy:

```text
Primary Shift Today / Next Shift
Now on Duty
Monthly Summary
Recent Changes
Operational Alerts
```

Card tidak boleh memenuhi halaman hanya untuk angka kecil.

---

## 10.2 Mobile

Mobile dashboard harus menjawab dalam viewport awal sebanyak mungkin:

1. Hari ini shift apa?
2. Jam berapa?
3. Dengan siapa?
4. Shift berikutnya kapan?

Primary shift card dapat menjadi hero operasional kecil, tetapi bukan hero marketing besar.

---

## 10.3 Now on Duty

Desktop dapat menggunakan compact roster/grid.

Mobile menggunakan horizontally compact roster atau stacked list tanpa membuat user melakukan horizontal scroll panjang.

---

# 11. My Schedule Responsive Experience

## 11.1 Desktop

Desktop dapat menggunakan:

- month calendar,
- week view,
- agenda view.

Month view harus tetap readable tanpa excessive cell height.

---

## 11.2 Mobile Default

Mobile default direkomendasikan **Agenda + Compact Date Strip / Calendar Hybrid**.

Tujuannya:

- shift mudah dibaca,
- tidak ada cell kalender terlalu kecil,
- today mudah ditemukan,
- upcoming shift jelas.

Full month mini-calendar dapat tersedia untuk navigasi tanggal, bukan untuk memuat seluruh detail shift dalam cell sempit.

---

## 11.3 Date Strip

Horizontal date strip boleh digunakan.

Requirements:

- scroll bebas/smooth,
- selected date jelas,
- today jelas,
- tidak menggunakan aggressive mandatory snap,
- scroll tidak berkonflik dengan vertical page gesture.

---

## 11.4 Cross-Midnight Display

Pada mobile tetap harus eksplisit.

Contoh:

`23:00 → 07:00 (+1 hari)`

atau equivalent human-readable representation.

---

# 12. Team Schedule Responsive Experience

## 12.1 Desktop

Desktop dapat menggunakan employee × date matrix atau timeline.

Features:

- sticky employee column,
- sticky date header,
- synchronized scrolling,
- compact cell,
- filters,
- coverage indicators.

---

## 12.2 Tablet

Tablet boleh mempertahankan matrix dengan:

- lebih sedikit visible dates,
- compact employee identity,
- collapsible controls,
- inspector overlay.

---

## 12.3 Mobile

Mobile **tidak boleh** memaksakan matrix penuh semua employee × seluruh bulan sebagai default.

Recommended modes:

### By Day

```text
Selected Date
S1
  Employee A
  Employee B
S2
  Employee C
S3
  Employee D
OFF / Exceptions
```

### By Employee

Pilih employee → tampil agenda shift employee.

### Compact Timeline

Optional secondary mode untuk beberapa hari.

---

## 12.4 Mobile Team Filter

Filter dapat dibuka melalui bottom sheet.

Selected filter penting ditampilkan sebagai compact chips di atas content.

---

# 13. Schedule Management Responsive Experience

## 13.1 Desktop Power Workspace

Canonical desktop editor:

- period controls,
- validation summary,
- employee × date matrix,
- bulk selection,
- inspector,
- sticky action area.

Keyboard dan pointer productivity diprioritaskan.

---

## 13.2 Tablet Editor

Tablet dapat menggunakan hybrid:

- compact matrix,
- fewer columns,
- selected-cell inspector sebagai overlay/sheet,
- bulk operation terbatas tetapi tetap available.

---

## 13.3 Mobile Editor Philosophy

Mobile schedule management harus **focused editing**, bukan desktop matrix mini.

Recommended workflow:

1. pilih tanggal atau employee,
2. lihat assignments pada scope tersebut,
3. tap employee/date,
4. pilih S1/S2/S3/OFF/exception,
5. save/continue,
6. validation muncul contextual.

---

## 13.4 Mobile Batch Editing

Batch editing tetap dapat tersedia melalui explicit selection mode.

Contoh:

```text
Select employees
→ Choose date/range
→ Assign Shift
→ Review impact
→ Apply
```

Jangan menggunakan multi-select tersembunyi yang sulit ditemukan.

---

## 13.5 Published Correction

Mobile correction terhadap published schedule harus memiliki review sheet yang menampilkan:

- before,
- after,
- affected employee/date,
- warning,
- reason jika wajib,
- payroll impact awareness.

---

# 14. Calendar & Horizontal Scroll Rules

## 14.1 Horizontal Scroll Is Intentional

Calendar/timeline yang horizontal harus:

- memiliki clear scroll region,
- tidak menyebabkan seluruh page ikut horizontal scroll,
- menjaga vertical page scroll tetap natural.

---

## 14.2 Touch Axis Lock

Implementation harus menghindari konflik ketika user ingin:

- scroll page vertikal,
- scroll calendar horizontal.

Jangan menggunakan gesture handler agresif yang memblokir native scrolling.

---

## 14.3 No Forced Column Snap by Default

Untuk schedule matrix/date strip yang padat, mandatory per-column snap direkomendasikan **tidak digunakan** sebagai default.

Free scrolling lebih sesuai untuk scanning cepat.

Optional subtle snap hanya boleh jika user testing membuktikan membantu.

---

## 14.4 Sticky Date Header

Sticky date header harus memiliki surface/background yang cukup sehingga content di belakang tidak menembus dan mengurangi readability.

Transparansi visual yang menyebabkan text overlap dianggap defect.

---

# 15. Responsive Tables

## 15.1 Desktop Table

Desktop table mendukung:

- sortable columns,
- filters,
- sticky header,
- selected row,
- compact row density,
- horizontal scroll hanya jika benar-benar perlu.

---

## 15.2 Mobile Transformation Strategy

Tidak semua table harus menjadi card.

Gunakan salah satu dari tiga pola:

### A. Priority Columns

Pertahankan table dengan kolom paling penting.

### B. Stacked Rows

Satu row menjadi compact structured block.

### C. List + Detail

List hanya menampilkan summary, tap membuka detail penuh.

Pemilihan pola berdasarkan task, bukan rule universal.

---

## 15.3 Payroll Table Mobile

Monthly payroll mobile direkomendasikan menjadi list summary:

```text
Employee
THP
S2 count · S3 count
Payroll status
```

Tap membuka breakdown detail.

Jangan memaksakan 10+ kolom mengecil di layar phone.

---

# 16. Payroll Responsive Experience

## 16.1 Desktop Payroll

Desktop menampilkan:

- summary table,
- calculation status,
- filters,
- bulk calculation/review,
- employee detail inspector/page.

---

## 16.2 Mobile Payroll

Mobile fokus pada consumption dan targeted review.

Hierarchy:

1. Take Home Pay,
2. payroll state,
3. base salary,
4. S2/S3 incentives,
5. adjustments/deductions,
6. source drill-down.

---

## 16.3 Financial Number Alignment

Nominal harus tetap mudah dipindai.

Desktop dapat right-align numeric columns.

Mobile menggunakan consistent numeric alignment pada breakdown row.

---

## 16.4 Locked Payroll Mobile

Locked state harus jelas tanpa menggunakan banner raksasa.

Action mutation harus hilang/disabled sesuai permission dan state.

---

# 17. Requests & Approval Responsive Experience

## 17.1 Request Creation

Mobile request flow harus pendek.

Jika dibuka dari suatu shift:

- employee,
- tanggal,
- shift

harus prefilled.

---

## 17.2 Request Type Selection

Gunakan option yang mudah disentuh.

Jangan membuat dropdown kecil dengan daftar panjang jika bottom sheet/list lebih natural.

---

## 17.3 Approval

Approve/Reject pada mobile harus:

- jelas,
- cukup terpisah,
- memiliki state loading,
- tidak mudah salah tap.

Reject yang membutuhkan reason membuka focused input state.

---

## 17.4 Shift Swap

Mobile swap flow harus menjelaskan dua sisi secara visual:

```text
You
12 Aug · S2
↕
Andi
14 Aug · S3
```

Sebelum confirm, validation dan resulting schedule ditampilkan.

---

# 18. Employee Directory Responsive Experience

## 18.1 Desktop

Desktop dapat memakai dense table/list hybrid.

---

## 18.2 Mobile

Mobile directory menggunakan compact list dengan:

- avatar/initial,
- name,
- current/next shift,
- optional status.

Tap membuka employee detail.

---

## 18.3 Employee Detail

Desktop dapat memakai tabs + side context.

Mobile tabs boleh berubah menjadi:

- segmented control,
- horizontally scrollable tab strip,
- grouped sections,

tergantung jumlah tab.

---

# 19. Settings Responsive Experience

## 19.1 Desktop

Desktop settings menggunakan compact two-column atau sectioned layout bila membantu.

---

## 19.2 Mobile

Mobile settings menggunakan one-column flow.

Label berada di atas control jika inline label mengurangi ruang input.

---

## 19.3 Settings Navigation

Desktop:

- secondary side navigation atau tabs.

Mobile:

- settings index → subpage,
- bukan tabs sempit dengan banyak item.

---

## 19.4 Effective Date Editor

Mobile harus tetap menjelaskan:

- current value,
- new value,
- effective date,
- impact scope.

Jangan hanya menampilkan form angka tanpa historical context.

---

# 20. Modal, Drawer, Sheet & Overlay Adaptation

## 20.1 Desktop Modal

Gunakan untuk focused task ukuran bounded.

---

## 20.2 Desktop Drawer/Inspector

Gunakan untuk contextual detail sambil mempertahankan workspace.

---

## 20.3 Mobile Bottom Sheet

Bottom sheet menjadi pattern utama untuk:

- filter,
- picker,
- quick detail,
- compact edit,
- confirmation context.

---

## 20.4 Full-Screen Mobile Surface

Gunakan full-screen page/sheet jika task:

- panjang,
- memiliki beberapa field,
- membutuhkan keyboard,
- membutuhkan deep navigation,
- memiliki critical review.

Jangan memaksa form panjang ke half-height sheet.

---

## 20.5 No Overlay Stacking

Modal → modal → bottom sheet bertumpuk tidak diperbolehkan.

Jika flow membutuhkan level tambahan, gunakan navigation/page transition atau replace current overlay.

---

# 21. Virtual Keyboard Behavior

## 21.1 Focus Visibility

Field aktif harus tetap terlihat setelah keyboard muncul.

---

## 21.2 Sticky CTA

Jika sticky CTA digunakan, posisinya harus mengikuti visual viewport dan tidak tertutup keyboard.

---

## 21.3 Numeric Fields

Gunakan input mode yang tepat untuk:

- salary,
- incentive,
- numeric quantity.

Tetap lakukan validation server-side.

---

## 21.4 Enter/Next Behavior

Form mobile harus memiliki logical focus progression.

Keyboard action `Next` seharusnya berpindah ke field berikutnya jika platform mendukung.

---

# 22. Orientation Behavior

## 22.1 Portrait Default

Phone experience dioptimalkan untuk portrait karena penggunaan harian lebih dominan.

---

## 22.2 Landscape Enhancement

Landscape dapat meningkatkan:

- visible schedule range,
- table width,
- split detail.

Tetapi orientation change tidak boleh menjadi requirement untuk menggunakan fitur.

---

## 22.3 No “Rotate Device” Blocking

Dilarang memblokir penggunaan dengan pesan:

> Rotate your device to continue.

Landscape boleh direkomendasikan sebagai optional enhancement untuk workspace tertentu, bukan requirement.

---

# 23. Gesture Policy

## 23.1 Allowed Enhancements

Potential gesture:

- swipe date strip,
- swipe row untuk reveal quick actions,
- pull-to-refresh bila benar-benar diperlukan,
- drag selection pada desktop pointer context.

---

## 23.2 Forbidden Gesture Dependency

Critical operation tidak boleh hanya tersedia melalui:

- long press,
- hidden swipe,
- multi-finger gesture.

---

## 23.3 Destructive Swipe

Swipe destructive action tidak boleh langsung mengeksekusi irreversible mutation tanpa confirmation/undo strategy yang tepat.

---

# 24. Hover, Pointer & Touch Capability

## 24.1 Hover Is Enhancement

Informasi penting tidak boleh hanya terlihat saat hover.

Touch user harus memiliki equivalent interaction.

---

## 24.2 Fine Pointer Optimization

Desktop dengan fine pointer boleh menggunakan:

- compact row,
- hover affordance,
- resize handle,
- context menu,
- drag select.

---

## 24.3 Coarse Pointer Adaptation

Touch device meningkatkan:

- hit area,
- control spacing,
- visible action affordance.

---

# 25. Responsive Typography

## 25.1 Do Not Shrink Everything

Mobile typography tidak dibuat tiny hanya agar semua muat.

Hierarchy tetap dipertahankan.

---

## 25.2 Large Display Text

NOCScheduler bukan marketing site.

Heading tidak memerlukan dramatic responsive display size.

Page title harus compact pada semua viewport.

---

## 25.3 Numeric Emphasis

Key numbers seperti THP dapat lebih besar tetapi tidak mendominasi satu layar penuh.

---

# 26. Responsive Spacing

## 26.1 Preserve Rhythm

Spacing boleh mengecil pada compact viewport tetapi tetap mengikuti token family.

---

## 26.2 No Edge-to-Edge Accident

Content umum membutuhkan page gutter.

Edge-to-edge hanya untuk component yang memang membutuhkan lebar penuh seperti:

- schedule timeline tertentu,
- full-width data surface.

---

## 26.3 Mobile Density

Mobile harus compact tetapi masih memiliki separation yang jelas antara:

- section,
- row,
- interactive target.

---

# 27. Responsive Motion

## 27.1 Spatial Continuity

Desktop:

- inspector slide,
- row expansion,
- contextual transitions.

Mobile:

- bottom sheet transition,
- page/detail transition,
- selection feedback.

---

## 27.2 Motion Duration

Mobile interaction tidak boleh terasa lambat karena transisi panjang.

Gunakan motion token PRD-11.

---

## 27.3 Reduced Motion

`prefers-reduced-motion` harus meminimalkan non-essential transforms dan parallax-like movement.

---

# 28. Loading on Responsive Screens

## 28.1 Mobile Skeleton

Skeleton mengikuti mobile composition, bukan memakai skeleton desktop yang dipotong.

---

## 28.2 Preserve Layout Stability

Loading content tidak boleh menyebabkan navigation, CTA, atau date strip melompat besar ketika data selesai dimuat.

---

## 28.3 Incremental Loading

Prioritaskan critical above-the-fold data seperti shift hari ini sebelum secondary analytics jika backend architecture memungkinkan.

---

# 29. Error & Offline-Degraded Experience

## 29.1 Error Placement

Error muncul dekat context yang gagal.

Jangan selalu mengganti seluruh screen jika hanya satu widget gagal.

---

## 29.2 Mutation Failure

Jika save gagal:

- user input dipertahankan,
- reason dijelaskan,
- retry tersedia jika aman.

---

## 29.3 Connectivity Awareness

Future enhancement dapat memberikan connectivity state untuk kondisi jaringan buruk.

Sistem tidak boleh berpura-pura mutation berhasil sebelum server confirmation untuk business-critical action.

---

# 30. Accessibility on Responsive Layout

## 30.1 Reflow

Content harus dapat direflow tanpa kehilangan informasi penting.

---

## 30.2 Zoom

Mobile tidak boleh memblokir browser zoom.

---

## 30.3 Focus Order

Ketika layout berubah dari columns ke stack, DOM/focus order tetap logis.

---

## 30.4 Sticky Elements

Sticky header/nav tidak boleh menutupi focused element ketika keyboard navigation atau anchor navigation digunakan.

---

# 31. Performance Experience Targets

Responsive experience premium membutuhkan responsiveness performa.

Target product behavior:

- navigation terasa immediate,
- touch feedback muncul langsung,
- scrolling tidak patah-patah,
- schedule matrix tidak freeze ketika dataset membesar,
- bottom sheet tidak jank,
- theme switch tidak flash kasar.

Implementation detail/performance budget final ditentukan technical architecture dan QA PRD.

---

# 32. Large Data Strategy

## 32.1 Desktop

Large schedule/payroll table dapat menggunakan virtualization jika diperlukan.

---

## 32.2 Mobile

Mobile tidak boleh merender seluruh data besar tanpa kebutuhan.

Gunakan:

- pagination,
- windowing,
- grouped loading,
- scoped date range,
- search/filter.

---

## 32.3 Preserve Context During Data Fetch

Load next range tidak boleh mengembalikan user ke posisi awal.

---

# 33. Desktop-Specific Productivity Requirements

Walaupun PRD ini banyak membahas mobile, desktop tetap equal priority.

Desktop wajib mempertahankan:

- keyboard shortcuts,
- multi-row selection,
- dense table,
- sticky column/header,
- wide workspace,
- quick inspector,
- command palette,
- efficient multi-step admin flow.

Responsive refactor tidak boleh mengorbankan power-user desktop hanya demi menyatukan implementation.

---

# 34. Mobile-Specific Quality Requirements

Mobile release tidak dianggap selesai jika masih memiliki:

- horizontal page overflow,
- tiny tap target,
- desktop table squeezed,
- action tertutup bottom nav,
- keyboard menutupi input/CTA,
- sticky element collision,
- unclear back behavior,
- full-width text dengan gutter nol,
- modal terlalu tinggi tanpa scroll management,
- calendar touch conflict,
- critical action hanya via gesture.

---

# 35. Responsive Anti-Patterns

Dilarang sebagai default:

1. `transform: scale()` untuk “membuat desktop muat di mobile”.
2. Font 10–11px untuk menyelamatkan layout.
3. Page-level horizontal scrolling.
4. Desktop sidebar disusutkan menjadi icon strip sempit di phone.
5. Full monthly employee matrix sebagai satu-satunya mobile Team Schedule.
6. Full desktop toolbar dipindahkan seluruhnya ke mobile header.
7. Sticky header + sticky filter + sticky CTA + bottom nav tanpa collision planning.
8. Modal desktop fixed-width yang overflow di mobile.
9. Hover-only information.
10. Gesture-only critical action.
11. Overuse accordion untuk menyembunyikan struktur buruk.
12. Card untuk setiap row hanya karena layar sempit.
13. Bottom sheet untuk form yang sebenarnya membutuhkan full page.
14. Mandatory landscape.
15. Forced scroll snapping pada dense calendar tanpa UX proof.

---

# 36. Responsive Business Rules

## RSP-001

Desktop dan mobile merupakan equal-priority product surfaces.

## RSP-002

Mobile tidak boleh menjadi scaled desktop layout.

## RSP-003

Breakpoint harus merepresentasikan behavioral/layout need.

## RSP-004

Page-level horizontal overflow adalah defect.

## RSP-005

Critical mobile action harus reachable melalui visible control.

## RSP-006

Gesture tidak boleh menjadi satu-satunya akses critical action.

## RSP-007

Bottom navigation harus memperhitungkan safe-area inset.

## RSP-008

Sticky CTA tidak boleh tertutup bottom navigation atau keyboard.

## RSP-009

Virtual keyboard tidak boleh membuat focused field inaccessible.

## RSP-010

Orientation change tidak boleh kehilangan unsaved state normal.

## RSP-011

Mobile Team Schedule default tidak boleh memaksa full monthly matrix.

## RSP-012

Mobile Schedule Management harus menggunakan focused workflow.

## RSP-013

Desktop Schedule Management tetap power workspace.

## RSP-014

Cross-midnight shift harus readable pada semua viewport.

## RSP-015

Horizontal calendar scroll tidak boleh merusak vertical page scroll.

## RSP-016

Mandatory column snap bukan default untuk dense scheduling interface.

## RSP-017

Sticky calendar header harus opaque/readable terhadap underlying content.

## RSP-018

Responsive table transformation harus mengikuti task priority.

## RSP-019

Mobile payroll harus menggunakan progressive disclosure untuk detail.

## RSP-020

Mobile form harus mempertahankan user input ketika validation/server error terjadi.

## RSP-021

Touch target harus memenuhi practical mobile ergonomics.

## RSP-022

Hover-only critical information dilarang.

## RSP-023

Overlay stacking harus dihindari.

## RSP-024

Long mobile form harus menggunakan full-page/full-screen pattern jika sheet tidak memadai.

## RSP-025

Responsive state tidak boleh mengubah business semantics.

## RSP-026

Light/Dark theme parity berlaku pada seluruh breakpoint.

## RSP-027

Reduced motion berlaku pada desktop dan mobile.

## RSP-028

Large dataset harus memiliki rendering strategy yang menjaga responsiveness.

## RSP-029

Mobile navigation harus mempertahankan context state bila reasonable.

## RSP-030

Back behavior harus predictable dan context-aware.

## RSP-031

Page title dan application chrome harus compact di mobile.

## RSP-032

Mobile tidak boleh menggunakan giant hero spacing.

## RSP-033

Wide desktop tidak boleh menghasilkan empty stretch berlebihan.

## RSP-034

Fine pointer dan coarse pointer dapat memiliki density berbeda tanpa mengubah semantics.

## RSP-035

Selected/today schedule states harus tetap distinguishable di semua viewport.

## RSP-036

Responsive skeleton harus mengikuti final composition masing-masing viewport.

## RSP-037

Critical mutation tidak boleh dianggap sukses sebelum server confirmation.

## RSP-038

Mobile zoom browser tidak boleh diblokir.

## RSP-039

Responsive DOM/focus order harus tetap logis.

## RSP-040

A feature P0/P1 tidak dianggap done sebelum desktop dan mobile acceptance lolos.

---

# 37. Critical Responsive Acceptance Matrix

| Scenario | Desktop | Mobile |
|---|---|---|
| Dashboard shift today | immediate, dense | visible near first viewport |
| My Schedule | month/week/agenda | agenda + date navigation |
| Team Schedule | matrix/timeline | by-day/by-employee |
| Manage Schedule | full power editor | focused editor |
| Bulk assignment | multi-cell selection | explicit batch flow |
| Request creation | modal/drawer/page | compact full-screen/sheet |
| Shift swap | side-by-side context | stacked comparison |
| Payroll monthly | table + filters | summary list |
| Payroll detail | detailed breakdown | progressive drill-down |
| Employee list | dense table/list | compact list |
| Settings | compact structured form | one-column subpage |
| Filters | toolbar/popover | sheet + chips |
| Inspector | right surface | bottom sheet/full-screen |
| Validation | inline + panel | inline + jump/context sheet |
| Theme switch | no flash | no flash |
| Keyboard | full shortcut support | virtual keyboard safe |
| Cross-midnight shift | explicit date/time | explicit `+1 day` context |
| Long content | controlled scroll | one primary vertical scroll |

---

# 38. Device & Viewport QA Matrix

Minimum QA harus mencakup representative widths, bukan hanya satu phone dan satu laptop.

Recommended baseline:

- 360px compact mobile,
- 390/393px common mobile,
- 430px large mobile,
- 768px tablet portrait,
- 1024px tablet/compact desktop,
- 1280px desktop,
- 1440px desktop,
- 1920px wide desktop.

Juga test:

- portrait,
- mobile landscape,
- browser zoom,
- text scaling where applicable,
- Light Mode,
- Dark Mode,
- reduced motion,
- coarse pointer,
- fine pointer.

Exact physical device lab ditentukan pada QA PRD.

---

# 39. Responsive Definition of Done

Sebuah page belum dianggap responsive-complete sebelum:

1. Tidak ada accidental horizontal page overflow.
2. Tidak ada clipped text penting.
3. Tidak ada sticky collision.
4. Bottom nav tidak menutupi content/action.
5. Safe area sudah diperhitungkan.
6. Virtual keyboard tidak menutupi field aktif.
7. CTA tetap reachable.
8. Touch target layak.
9. Desktop density tetap produktif.
10. Mobile hierarchy tetap jelas.
11. Landscape tidak rusak.
12. Light/Dark parity lolos.
13. Loading skeleton sesuai layout.
14. Empty/error state responsive.
15. Overlay tidak overflow.
16. Table menggunakan transformation strategy yang tepat.
17. Calendar scrolling natural.
18. Selected/today states tetap jelas.
19. Focus order benar.
20. Reduced motion benar.
21. Page restore/context preservation berfungsi.
22. Data besar tidak membuat interaction freeze.
23. Tidak ada component local hack untuk satu breakpoint.
24. Semua perubahan mengikuti design token/component contract.
25. Visual QA lolos pada representative viewport matrix.

---

# 40. Implementation Guidance

Implementation harus memprioritaskan:

- CSS/layout responsive berbasis component behavior,
- semantic design tokens,
- shared component variants,
- feature detection,
- robust overflow handling,
- minimal device-specific hacks.

Responsive logic kompleks sebaiknya ditangani pada layout/component boundary, bukan tersebar sebagai conditional random di setiap page.

Contoh yang baik:

```text
ScheduleInspector
Desktop → right inspector
Mobile → bottom sheet
```

Bukan dua business component berbeda dengan logic terduplikasi.

---

# 41. Relationship to Following PRDs

PRD-12 menjadi input utama untuk:

- **PRD-13 — UI Polish & Visual Quality Standard**
- PRD-14 — Technical Architecture & Technology Stack
- PRD-19 — QA, Testing & Acceptance Criteria

PRD-13 akan mengunci quality gate visual akhir seperti:

- alignment,
- spacing consistency,
- pixel-level polish,
- animation quality,
- responsive visual defects,
- theme parity,
- component consistency.

---

# 42. Final Responsive Contract

NOCScheduler harus memenuhi kontrak berikut:

> **Desktop harus terasa seperti workspace profesional berdaya tinggi. Mobile harus terasa seperti aplikasi operasional premium yang memang dirancang untuk tangan manusia, bukan hasil shrink dari desktop. Keduanya harus memiliki hierarchy, polish, speed, trust, dan visual quality yang setara.**

Responsive excellence bukan bonus finishing.

Responsive excellence adalah bagian dari definisi produk NOCScheduler.
