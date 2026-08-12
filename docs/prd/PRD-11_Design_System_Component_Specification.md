# PRD-11 — Design System & Component Specification

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — Design System & Component Specification  
> **Document ID:** PRD-11  
> **Status:** Draft — Visual System Source of Truth  
> **Depends On:** PRD-01 through PRD-10  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Theme Support:** Light + Dark parity required  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **design system, visual language, semantic token architecture, typography, spacing, grid, radius, borders, elevation, color roles, iconography, component anatomy, state model, motion token, theme contract, accessibility baseline, dan component quality standard** untuk NOCScheduler.

PRD-11 menjadi source of truth untuk menjawab:

> **“Bagaimana setiap elemen NOCScheduler harus terlihat, terasa, bereaksi, dan tetap konsisten pada seluruh halaman, ukuran layar, serta Light/Dark Mode?”**

PRD ini tidak menetapkan layout responsif per breakpoint secara penuh; detail tersebut berada di **PRD-12 — Responsive & Mobile Experience**.

PRD ini juga tidak menggantikan final visual QA checklist yang akan ditetapkan di **PRD-13 — UI Polish & Visual Quality Standard**.

Namun setiap implementasi UI wajib mengikuti kontrak visual dan component behavior di dokumen ini.

---

# 2. Design System Vision

NOCScheduler harus memiliki visual language yang terasa:

- modern,
- premium,
- spatial,
- high-fidelity,
- precise,
- calm,
- tactile,
- operational,
- contemporary,
- visually memorable,
- tetapi tidak gimmicky.

UI harus terasa seperti **satu sistem visual yang dirancang secara sengaja**, bukan kumpulan library component yang diberi warna seragam.

Target visual impression:

> **Clean precision + spatial depth + controlled density + refined motion + operational clarity.**

Wow-factor harus muncul dari:

- hierarchy yang tepat,
- spacing yang presisi,
- alignment yang konsisten,
- depth yang halus,
- typography yang bersih,
- responsive composition,
- microinteraction berkualitas,
- state transition yang halus,
- detail visual kecil yang konsisten.

Wow-factor **tidak** boleh bergantung pada:

- gradient berlebihan,
- glass blur di semua tempat,
- shadow besar,
- card bertumpuk tanpa fungsi,
- neon yang mengganggu,
- animasi lambat,
- whitespace kosong yang terlalu luas.

---

# 3. Core Design Principles

## DS-P01 — One Component, Two Skins

Light dan Dark Mode harus menggunakan **component structure yang sama**.

Perbedaan theme diwujudkan melalui semantic token.

Dilarang membuat:

- `LightButton` dan `DarkButton`,
- CSS halaman khusus dark tanpa token,
- duplicate component tree hanya untuk theme.

Konsep utama:

> **Satu barang, dua kulit.**

---

## DS-P02 — Semantic Tokens Over Raw Values

Component tidak boleh bergantung langsung pada nilai visual seperti warna mentah secara tersebar.

Gunakan semantic token seperti:

```text
surface.canvas
surface.base
surface.raised
surface.overlay
text.primary
text.secondary
text.muted
border.subtle
border.strong
action.primary
status.success
status.warning
status.danger
shift.s1
shift.s2
shift.s3
```

Raw palette hanya digunakan pada token foundation.

---

## DS-P03 — Spatial Hierarchy Before Decoration

Depth dibentuk melalui kombinasi:

- surface tone,
- border,
- elevation,
- inset grouping,
- sticky layer,
- overlap yang terkontrol,
- motion,
- typography.

Jangan menggunakan shadow besar hanya untuk membuat UI terasa spatial.

---

## DS-P04 — Density Is a Feature

Desktop harus mampu menampilkan banyak informasi tanpa terasa penuh sesak.

Mobile harus compact tanpa menjadi cramped.

Density dicapai dengan:

- row height terkendali,
- typography compact,
- grouping jelas,
- icon size konsisten,
- selective whitespace,
- progressive disclosure.

---

## DS-P05 — Alignment Is Non-Negotiable

Elemen yang secara visual seharusnya berada pada garis yang sama harus benar-benar sejajar.

Misalignment beberapa pixel pada:

- label,
- icon,
- input,
- table header,
- calendar cell,
- button,
- section heading,

harus dianggap defect visual.

---

## DS-P06 — Components Must Feel Related

Input, Select, Date Picker, Search, Button, Dropdown, Table, Modal, Drawer, dan Calendar harus menggunakan shared visual grammar:

- radius family,
- border family,
- typography,
- focus treatment,
- elevation,
- state animation.

Tidak boleh ada halaman yang terasa menggunakan design library berbeda.

---

## DS-P07 — State Is Part of the Component

Setiap interactive component minimal mempertimbangkan:

- default,
- hover,
- focus-visible,
- active/pressed,
- selected,
- disabled,
- loading,
- error,
- success bila relevan.

State tidak boleh ditambahkan belakangan sebagai patch.

---

## DS-P08 — Motion Must Reinforce Space

Animasi harus menjelaskan:

- dari mana surface muncul,
- apa yang berubah,
- elemen mana yang menjadi aktif,
- apa yang tersimpan,
- apa yang berpindah.

Motion dekoratif tanpa fungsi harus diminimalkan.

---

## DS-P09 — Contrast Without Harshness

Visual hierarchy tidak hanya menggunakan hitam murni vs putih murni.

Gunakan beberapa tingkat:

- primary text,
- secondary text,
- muted text,
- subtle border,
- raised surface,
- selected surface.

Namun contrast accessibility tetap harus dipenuhi.

---

## DS-P10 — No Ad-Hoc Styling

Halaman tidak boleh membuat versi lokal dari component standar hanya karena terlihat lebih cepat.

Jika kebutuhan baru muncul:

1. evaluasi apakah variant existing cukup,
2. tambahkan variant resmi jika reusable,
3. dokumentasikan behavior,
4. baru gunakan pada halaman.

---

# 4. Token Architecture

Design token dibagi menjadi tiga layer.

## 4.1 Foundation Tokens

Nilai primitif:

- raw color palette,
- spacing scale,
- font size,
- font weight,
- line height,
- radius,
- shadow,
- blur,
- duration,
- easing.

Foundation token **tidak digunakan langsung oleh page component** jika semantic token tersedia.

---

## 4.2 Semantic Tokens

Menjelaskan tujuan visual.

Contoh:

```text
surface.canvas
surface.base
surface.subtle
surface.raised
surface.sunken
surface.overlay
surface.selected

text.primary
text.secondary
text.tertiary
text.inverse
text.disabled

border.subtle
border.default
border.strong
border.focus

action.primary.bg
action.primary.fg
action.primary.hover
action.secondary.bg
action.destructive.bg

status.info
status.success
status.warning
status.danger

shift.s1
shift.s2
shift.s3
shift.off
shift.leave
```

---

## 4.3 Component Tokens

Hanya digunakan jika suatu component membutuhkan tuning yang tidak cocok menjadi semantic global.

Contoh:

```text
button.height.sm
button.height.md
input.height.md
calendar.cell.minWidth
sidebar.width.expanded
bottomNav.height
modal.radius
```

Component token tidak boleh menduplikasi semantic color secara sembarangan.

---

# 5. Theme Architecture

## 5.1 Light Theme

Light Mode adalah theme default.

Karakter visual:

- bright but not sterile,
- surface separation halus,
- border lembut tetapi terbaca,
- primary text sangat jelas,
- elevated surface terasa ringan,
- accent tidak mendominasi seluruh UI.

Background utama sebaiknya tidak terasa seperti putih polos tanpa struktur.

Gunakan tonal separation yang sangat halus antara canvas, base, raised, dan selected surface.

---

## 5.2 Dark Theme

Dark Mode bukan hasil `invert()` dari Light Mode.

Karakter visual:

- deep neutral canvas,
- elevated surface sedikit lebih terang,
- border cukup terlihat tanpa terlalu kontras,
- text hierarchy tetap kuat,
- status/shift color disesuaikan agar tidak terlalu menyala,
- shadow digabung dengan border/surface contrast karena shadow lebih sulit terbaca pada dark canvas.

---

## 5.3 Theme Parity

Semua component P0/P1 wajib tersedia dan lolos QA pada kedua theme.

Tidak diperbolehkan:

- component hanya terlihat bagus pada Light,
- hardcoded white background,
- hardcoded black text,
- icon hilang pada Dark,
- selected state kehilangan contrast,
- chart/status color sulit dibedakan pada salah satu theme.

---

## 5.4 Theme Switching

Theme switch harus:

- cepat,
- tidak reload halaman,
- mempertahankan context,
- menghindari flash theme yang salah,
- mengikuti preference user yang disimpan.

Default instalasi: `Light`.

Future option dapat mendukung `System`.

---

# 6. Color System

## 6.1 Neutral Palette

Neutral palette adalah fondasi mayoritas UI.

Digunakan untuk:

- canvas,
- surfaces,
- borders,
- typography,
- disabled states,
- table structure.

Neutral harus terasa modern dan sedikit cool/clean, tanpa menjadi biru berlebihan.

---

## 6.2 Brand / Primary Accent

Primary accent digunakan secara selektif untuk:

- primary action,
- focus/selection tertentu,
- current navigation,
- key interactive highlight.

Accent tidak boleh membanjiri seluruh card dan background.

Target visual: contemporary, confident, digital-operational.

---

## 6.3 Shift Colors

Shift color harus memiliki identity yang stabil.

Minimum semantic identity:

- `shift.s1`
- `shift.s2`
- `shift.s3`
- `shift.off`
- `shift.leave`
- `shift.exception`

Shift tidak boleh dibedakan hanya lewat warna.

Selalu kombinasikan minimal dengan salah satu:

- text label,
- short code,
- icon,
- shape treatment.

Ini penting untuk accessibility dan color vision deficiency.

---

## 6.4 Status Colors

Semantic status:

- Info
- Success
- Warning
- Danger
- Neutral

Status color digunakan untuk state, bukan dekorasi.

`Danger` tidak boleh digunakan untuk sekadar membuat UI terlihat hidup.

---

# 7. Typography System

## 7.1 Typeface Direction

Gunakan modern sans-serif dengan karakteristik:

- sangat terbaca pada ukuran kecil,
- angka jelas,
- tabular number support bila memungkinkan,
- compact enough untuk dense UI,
- memiliki banyak font weight,
- render baik di Windows, macOS, Android, dan iOS.

Recommended direction:

- modern grotesk / neo-grotesk UI font,
- fallback system sans yang kuat.

Pemilihan font final dilakukan saat technical/design implementation, tetapi **satu primary UI font family** harus dipertahankan secara konsisten.

---

## 7.2 Type Roles

Minimum roles:

```text
display
page-title
section-title
subsection-title
body
body-strong
label
caption
micro
numeric-emphasis
```

Ukuran harus menggunakan limited scale, bukan angka acak per halaman.

---

## 7.3 Recommended Type Scale Direction

Baseline compact scale:

- Display: 28–32px
- Page Title: 22–26px
- Section Title: 17–20px
- Subsection: 15–17px
- Body: 14–15px
- Label: 12–14px
- Caption: 11–12px
- Micro: 10–11px hanya untuk metadata sekunder tertentu

PRD-12 dapat menyesuaikan ukuran berdasarkan viewport.

---

## 7.4 Weight

Gunakan weight untuk hierarchy secara selektif.

Baseline:

- Regular: body
- Medium: labels/navigation
- Semibold: title/action emphasis
- Bold: sangat jarang, hanya angka atau emphasis penting

Jangan membuat seluruh UI `font-weight: 600` karena hierarchy akan hilang.

---

## 7.5 Numeric Typography

Salary, incentive, shift count, tanggal, dan duration harus mudah dipindai.

Gunakan tabular numeric alignment pada:

- table salary,
- payroll totals,
- schedule metric,
- report columns,
- time values jika membantu alignment.

---

# 8. Spacing System

## 8.1 Base Scale

Gunakan 4px-based spacing system sebagai fondasi.

Recommended token direction:

```text
0
2
4
6
8
12
16
20
24
32
40
48
64
```

Nilai intermediate hanya digunakan sebagai token resmi jika benar-benar diperlukan.

---

## 8.2 Spatial Density

Desktop:

- compact control spacing,
- section gap jelas,
- dense tables,
- predictable padding.

Mobile:

- touch target tetap aman,
- visual gap compact,
- content tidak terasa sesak.

Jangan menyamakan visual padding dengan touch target; hit area dapat lebih besar dari visible control.

---

## 8.3 Section Rhythm

Gunakan hierarki jarak:

- intra-component gap kecil,
- related group gap medium,
- section gap lebih besar,
- page major region gap paling besar.

Semua halaman harus memiliki rhythm yang konsisten.

---

# 9. Radius System

Gunakan radius family terbatas.

Recommended direction:

- Small: 6–8px
- Medium: 10–12px
- Large: 14–16px
- Extra Large: hanya untuk modal/sheet/special container tertentu
- Pill: badge/chip/toggle tertentu

Jangan menggunakan radius sangat besar untuk semua card.

Component yang berdekatan harus memiliki radius relationship yang harmonis.

---

# 10. Borders, Elevation & Depth

## 10.1 Borders

Border adalah alat struktur utama.

Gunakan:

- subtle border untuk surface separation,
- default border untuk input/card,
- strong border untuk focus/selected/error tertentu.

Border tidak boleh terlalu gelap sehingga UI terlihat seperti spreadsheet lama.

---

## 10.2 Elevation Levels

Recommended conceptual elevation:

- `E0` — canvas/sunken
- `E1` — base surface
- `E2` — raised card/sticky toolbar
- `E3` — dropdown/popover
- `E4` — modal/drawer/command palette

Elevation dibentuk oleh kombinasi:

- surface tone,
- border,
- shadow,
- backdrop.

---

## 10.3 Glass / Blur

Blur hanya digunakan secara restrained untuk layer seperti:

- sticky floating toolbar,
- command palette backdrop,
- modal backdrop,
- mobile floating chrome.

Jangan membuat setiap card menjadi glass panel.

---

# 11. Iconography

## 11.1 Icon Style

Gunakan satu icon family dengan karakter:

- modern outline,
- consistent stroke,
- simple silhouette,
- mudah terbaca di 16–20px.

Jangan mencampur icon filled, outlined, emoji, dan glyph acak pada konteks yang sama.

---

## 11.2 Common Sizes

Recommended:

- 14px — metadata micro
- 16px — table/input compact action
- 18px — normal control
- 20px — navigation/action
- 24px — feature emphasis tertentu

Icon harus optically aligned dengan text, bukan hanya center secara matematis.

---

# 12. Buttons

## 12.1 Variants

Minimum variants:

- Primary
- Secondary
- Tertiary / Ghost
- Destructive
- Icon Button

Optional:

- Soft/Tonal untuk contextual action

---

## 12.2 Sizes

Minimum:

- Small — dense table/toolbar
- Medium — default
- Large — mobile primary action atau special flow

Height ditentukan sebagai token, bukan custom tiap halaman.

---

## 12.3 Button Anatomy

Button dapat memiliki:

- leading icon,
- label,
- trailing icon,
- loading indicator.

Icon-label gap harus konsisten.

---

## 12.4 Button State

Wajib:

- default,
- hover,
- pressed,
- focus-visible,
- disabled,
- loading.

Loading button harus mempertahankan width jika memungkinkan agar layout tidak bergeser.

---

## 12.5 Destructive Action

Destructive button tidak menjadi primary visual treatment kecuali pada explicit destructive confirmation.

Delete/archive/cancel tidak boleh memiliki prominence yang sama dengan Save/Publish secara default.

---

# 13. Inputs & Form Controls

## 13.1 Shared Form Grammar

Text Input, Number Input, Search, Select, Combobox, Date Picker, Time Picker, Textarea harus terasa satu keluarga.

Shared properties:

- height family,
- border,
- radius,
- label placement,
- placeholder contrast,
- focus ring,
- error treatment,
- disabled state.

---

## 13.2 Field Anatomy

Minimum optional anatomy:

```text
Label
Required indicator
Input container
Leading icon/prefix
Value
Trailing action/suffix
Helper text / validation text
```

Label tidak boleh bergantung pada placeholder sebagai satu-satunya penjelas field.

---

## 13.3 Focus State

Focus harus jelas tetapi tidak kasar.

Focus-visible treatment harus konsisten di seluruh controls dan keyboard navigation.

---

## 13.4 Error State

Error harus menggunakan kombinasi:

- border/state color,
- text message,
- optional icon.

Jangan hanya mengubah border menjadi merah tanpa menjelaskan masalah.

---

## 13.5 Number & Money Input

Untuk salary/incentive:

- format IDR mudah dibaca,
- user tidak harus mengetik separator secara manual,
- value internal tetap numeric,
- negative money hanya diperbolehkan jika domain benar-benar mengizinkan.

---

# 14. Select, Combobox & Dropdown

## 14.1 Select

Gunakan untuk option set kecil dan jelas.

## 14.2 Combobox

Gunakan untuk:

- employee selection,
- searchable large option,
- complex filtering.

Mendukung:

- keyboard navigation,
- search,
- selected state,
- empty result,
- clear action bila relevan.

---

## 14.3 Dropdown / Menu

Menu harus:

- punya clear grouping,
- dangerous action dipisahkan,
- shortcut dapat ditampilkan,
- alignment terhadap trigger konsisten,
- tidak keluar viewport.

---

# 15. Checkbox, Radio, Switch & Segmented Control

## 15.1 Checkbox

Untuk multi-select atau independent boolean.

## 15.2 Radio

Untuk mutually exclusive pilihan yang semuanya perlu terlihat.

## 15.3 Switch

Untuk setting yang dapat diaktif/nonaktifkan dan memiliki immediate conceptual state.

Jangan gunakan switch untuk action seperti “Publish”.

## 15.4 Segmented Control

Cocok untuk small mutually exclusive view modes seperti:

- Month / Week / Agenda
- Planned / Effective

Jumlah option harus terbatas.

---

# 16. Cards & Surfaces

## 16.1 Card Philosophy

Card digunakan hanya ketika grouping benar-benar berguna.

Jangan membungkus:

`page → card → card → card`

secara berlebihan.

---

## 16.2 Card Variants

Recommended:

- Base
- Raised
- Interactive
- Selected
- Metric
- Alert/Status

---

## 16.3 Interactive Card

Harus memiliki:

- hover/pressed feedback,
- focus-visible,
- clear clickable region,
- tidak menyembunyikan nested action.

---

# 17. Tables & Data Grids

## 17.1 Table Philosophy

Desktop table adalah first-class operational component.

Harus terasa:

- dense,
- readable,
- aligned,
- scan-friendly,
- modern.

---

## 17.2 Table Anatomy

Minimum support:

- header,
- row,
- cell,
- sortable state,
- selected row,
- hover row,
- empty state,
- loading skeleton,
- pagination atau virtualization jika diperlukan.

---

## 17.3 Alignment Rules

Default:

- text → left,
- numeric/money → right,
- compact status → consistent alignment,
- action column → right.

Column header harus mengikuti alignment data jika membantu scanning.

---

## 17.4 Sticky Areas

Large data grid dapat menggunakan:

- sticky header,
- sticky first column,
- sticky action/footer.

Sticky shadow/border harus subtle dan hanya muncul ketika overlap terjadi jika feasible.

---

## 17.5 Zebra Striping

Tidak menjadi default.

Gunakan spacing, subtle divider, hover, dan surface contrast terlebih dahulu.

---

# 18. Schedule Calendar & Matrix Components

## 18.1 Calendar Is Domain-Specific

Schedule calendar bukan generic event calendar.

Component harus memahami:

- Shift 1,
- Shift 2,
- Shift 3,
- OFF,
- Leave/Exception,
- Draft/Published,
- validation,
- selection,
- coverage context.

---

## 18.2 Schedule Cell Anatomy

Desktop cell dapat memuat:

- shift code/name,
- time hint jika dibutuhkan,
- state indicator,
- exception marker,
- validation marker,
- selection/hover layer.

Informasi tidak boleh menumpuk hingga sulit dibaca.

---

## 18.3 Shift Badge

Shift badge harus compact dan recognizable.

Minimum properties:

- semantic color,
- short text `S1/S2/S3`,
- optional label,
- sufficient contrast,
- Light/Dark parity.

---

## 18.4 Today & Selected Date

`Today` dan `Selected` adalah dua state berbeda dan tidak boleh menggunakan treatment identik.

---

## 18.5 Weekend / Holiday

Weekend/holiday dapat memiliki subtle background treatment, tetapi jangan sampai lebih dominan daripada assignment.

---

# 19. Badges, Chips & Status Indicators

## 19.1 Badge

Untuk compact status/label non-interactive.

## 19.2 Chip

Untuk filter, selected value, atau removable item.

## 19.3 Status Dot

Boleh digunakan sebagai secondary cue, tetapi tidak boleh menjadi satu-satunya representasi status kritis.

---

# 20. Avatar & Employee Identity

Employee identity dapat menggunakan:

- avatar,
- initials fallback,
- name,
- optional employee role/status.

Avatar size harus mengikuti token scale.

Fallback initials harus deterministic dan memiliki contrast yang baik.

Jangan menggunakan random color yang berubah setiap render.

---

# 21. Navigation Components

## 21.1 Desktop Sidebar

Mendukung:

- expanded,
- collapsed,
- active item,
- hover,
- focus,
- badge,
- grouped navigation,
- tooltip ketika collapsed.

Sidebar harus terasa sebagai structural layer, bukan card besar menempel ke layar.

---

## 21.2 Mobile Bottom Navigation

Canonical item:

- Home
- Schedule
- Team
- Payroll
- More

Wajib:

- selected state sangat jelas,
- touch target nyaman,
- label tetap terlihat untuk mental model,
- safe-area aware,
- tidak menutupi content/action penting.

---

## 21.3 Tabs

Tabs digunakan untuk sibling content pada hierarchy yang sama.

Tab bar harus memiliki selected indicator yang presisi dan motion ringan.

---

## 21.4 Breadcrumb

Desktop breadcrumb digunakan hanya ketika hierarchy memerlukan context.

Jangan menampilkan breadcrumb satu level yang tidak memberi nilai.

---

# 22. Modal, Drawer & Bottom Sheet

## 22.1 Modal

Gunakan untuk:

- bounded task,
- confirmation,
- short form,
- high-focus action.

Jangan gunakan modal untuk full page kompleks.

---

## 22.2 Drawer / Inspector

Desktop drawer cocok untuk:

- schedule cell detail,
- employee contextual detail,
- validation detail,
- quick edit.

Context di belakang tetap terlihat.

---

## 22.3 Bottom Sheet

Mobile equivalent untuk contextual detail/action.

Mendukung:

- drag handle jika appropriate,
- safe area,
- internal scroll,
- sticky action area,
- predictable snap state bila digunakan.

Critical action tidak boleh hanya tersedia melalui swipe gesture.

---

## 22.4 Layering

Modal di atas modal harus dihindari.

Jika workflow membutuhkan nested detail, pertimbangkan:

- replace modal content,
- side route,
- full page,
- nested inspector dengan navigation yang jelas.

---

# 23. Tooltip, Popover & Context Menu

## 23.1 Tooltip

Untuk short explanatory text.

Tidak boleh menyimpan critical information yang tidak tersedia dengan cara lain pada touch device.

## 23.2 Popover

Untuk contextual interactive content yang lebih kaya.

## 23.3 Context Menu

Desktop optional enhancement untuk schedule/data grid power user.

Semua action tetap harus tersedia lewat discoverable UI.

---

# 24. Toast, Banner & Inline Feedback

## 24.1 Toast

Untuk feedback transient seperti:

- saved,
- copied,
- minor success,
- background completion.

Toast bukan tempat error yang membutuhkan keputusan user.

---

## 24.2 Banner

Untuk page-level state seperti:

- payroll dirty,
- schedule unpublished,
- configuration missing,
- historical view.

---

## 24.3 Inline Feedback

Validation dekat dengan sumber masalah lebih penting daripada toast global.

---

# 25. Empty, Loading & Error Components

## 25.1 Skeleton

Skeleton mengikuti bentuk akhir layout.

Jangan menggunakan satu rectangle besar untuk seluruh halaman.

---

## 25.2 Empty State

Membedakan:

- first-use empty,
- no-result filter,
- no schedule,
- no payroll,
- no permission,
- historical empty.

Empty state harus menyediakan next action jika ada.

---

## 25.3 Error State

Membedakan:

- recoverable load error,
- validation error,
- permission denied,
- missing configuration,
- stale/concurrent data,
- destructive failure.

Error harus memberikan recovery path.

---

# 26. Command Palette & Global Search

Command Palette adalah premium productivity feature untuk desktop dan dapat memiliki mobile search equivalent.

Mendukung kategori:

- Navigate
- Employee
- Schedule
- Payroll
- Action sesuai permission

Result harus keyboard navigable.

High-risk action tidak boleh dieksekusi langsung tanpa review/confirmation yang sesuai hanya dari command palette.

---

# 27. Payroll Components

## 27.1 Money Display

Payroll amount harus:

- mudah dipindai,
- menggunakan numeric alignment,
- tidak oversized secara berlebihan,
- menunjukkan hierarchy antara THP dan component.

---

## 27.2 Payroll Breakdown Row

Mendukung:

- component label,
- quantity,
- rate,
- amount,
- expandable source detail.

Contoh:

```text
Shift 3 Incentive
7 × Rp75.000                         Rp525.000
```

---

## 27.3 Payroll State Badge

State:

- OPEN
- CALCULATED
- DIRTY
- FINALIZED
- LOCKED

Harus memiliki semantic treatment berbeda dan tidak bergantung hanya pada warna.

---

# 28. Audit & Timeline Components

Business History menggunakan timeline/card-row hybrid yang compact.

Minimum:

- event title,
- actor,
- timestamp,
- before → after summary,
- reason bila ada,
- correlation/group indicator bila relevant.

Raw JSON audit payload tidak menjadi default human view.

---

# 29. Motion System

## 29.1 Motion Principles

Motion harus:

- cepat,
- subtle,
- responsive,
- interruptible,
- tidak menunda task.

---

## 29.2 Duration Tokens

Recommended conceptual ranges:

- Instant: 80–120ms
- Fast: 120–180ms
- Standard: 180–240ms
- Emphasized: 240–320ms

Animasi lebih lama hanya untuk rare onboarding/illustrative context.

---

## 29.3 Motion Use Cases

- hover/pressed transition,
- selected indicator,
- sidebar collapse,
- drawer entry/exit,
- bottom sheet,
- modal,
- toast,
- list insertion/removal,
- schedule selection,
- save success microfeedback.

---

## 29.4 Reduced Motion

`prefers-reduced-motion` wajib dihormati.

Reduced mode:

- menghilangkan nonessential transform,
- mempersingkat transition,
- menjaga state feedback tetap jelas.

---

# 30. Focus & Accessibility Contract

Minimum:

- keyboard reachable untuk interactive desktop control,
- visible focus state,
- semantic HTML jika memungkinkan,
- proper label association,
- sufficient contrast,
- screen-reader label untuk icon-only action,
- no color-only critical meaning,
- reduced motion support,
- touch target aman.

Accessibility tidak boleh diperlakukan sebagai final cleanup.

---

# 31. Responsive Component Philosophy

Component yang sama boleh memiliki different composition pada viewport berbeda.

Contoh:

Desktop payroll row:

```text
Label | Qty | Rate | Amount
```

Mobile:

```text
Label                         Amount
Qty × Rate
```

Ini tetap satu semantic component dengan responsive anatomy.

Jangan memaksa desktop geometry ke mobile.

Detail breakpoint didefinisikan di PRD-12.

---

# 32. Component API Philosophy

Saat implementasi frontend, component API harus:

- semantic,
- predictable,
- typed jika stack mendukung,
- tidak memiliki prop explosion,
- menggunakan variant yang jelas,
- tidak menerima arbitrary style escape hatch sebagai default workflow.

Contoh conceptual:

```text
<Button variant="primary" size="md" loading />
<Badge tone="warning" />
<ShiftBadge shift="S3" />
<Surface elevation="raised" />
```

Hindari:

```text
<Button color="#..." radius="13" padding="7px" shadow="..." />
```

pada usage biasa.

---

# 33. Design System Documentation Requirement

Setiap reusable component penting harus memiliki dokumentasi minimum:

- purpose,
- anatomy,
- variants,
- sizes,
- states,
- theme behavior,
- responsive behavior,
- accessibility notes,
- do/don't example.

Component explorer seperti Storybook-equivalent dapat dipertimbangkan pada Technical Architecture, tetapi requirement dokumentasi tetap berlaku terlepas dari tool.

---

# 34. Anti-Patterns

Dilarang sebagai default:

1. hardcoded visual value tersebar di page CSS,
2. input dengan tinggi/radius berbeda tanpa alasan,
3. multiple icon families,
4. giant hero header pada operational page,
5. nested card berlebihan,
6. glassmorphism di seluruh app,
7. shadow berat,
8. gradient pada semua CTA,
9. random badge colors,
10. font size acak,
11. modal di atas modal,
12. full-page spinner untuk loading normal,
13. toast untuk semua validation error,
14. color-only status,
15. component Light/Dark terpisah,
16. custom button per page,
17. arbitrary z-index tanpa layer system,
18. border/radius tidak konsisten,
19. mobile control yang terlalu kecil,
20. animation yang membuat user menunggu.

---

# 35. Layer / Z-Index Contract

Gunakan semantic layer, bukan angka z-index acak.

Conceptual order:

```text
base content
sticky content
sidebar/topbar
popover/dropdown
tooltip
backdrop
modal/drawer/sheet
critical system overlay
```

Actual token values ditentukan saat implementation.

---

# 36. Quality Gates per Component

Component dianggap ready jika:

1. anatomy sesuai spec,
2. semua variant valid tersedia,
3. default/hover/pressed/focus/disabled diuji,
4. loading/error state diuji bila relevant,
5. Light Mode lolos visual QA,
6. Dark Mode lolos visual QA,
7. desktop usage lolos,
8. mobile usage lolos,
9. keyboard behavior valid,
10. contrast valid,
11. reduced motion valid bila animated,
12. tidak memiliki hardcoded theme leak,
13. alignment benar,
14. component tidak menyebabkan layout shift tidak perlu.

---

# 37. Design System Business Rules

- `DS-001` — Semua UI P0/P1 wajib menggunakan semantic design token.
- `DS-002` — Light dan Dark Mode menggunakan component structure yang sama.
- `DS-003` — Light Mode adalah default product theme.
- `DS-004` — Dark Mode wajib memiliki visual parity.
- `DS-005` — Raw color tidak boleh digunakan langsung pada normal page component jika semantic token tersedia.
- `DS-006` — Spacing utama mengikuti token scale.
- `DS-007` — Typography mengikuti defined type roles.
- `DS-008` — Font size arbitrary per halaman dilarang.
- `DS-009` — Radius harus berasal dari radius family.
- `DS-010` — Elevation harus berasal dari semantic elevation level.
- `DS-011` — Multiple icon family dalam core app dilarang.
- `DS-012` — Interactive component wajib memiliki focus-visible state.
- `DS-013` — Critical status tidak boleh dikomunikasikan hanya melalui warna.
- `DS-014` — Shift identity tidak boleh bergantung hanya pada warna.
- `DS-015` — Money value tidak boleh menggunakan alignment yang membuat scanning sulit.
- `DS-016` — Standard forms wajib menggunakan shared field grammar.
- `DS-017` — Input, Select, Date Picker, dan Combobox harus terasa satu component family.
- `DS-018` — Button loading state tidak boleh menyebabkan unnecessary layout jump.
- `DS-019` — Destructive action tidak boleh default menjadi visual primary action.
- `DS-020` — Table numeric column direkomendasikan right-aligned.
- `DS-021` — Generic table tidak boleh digunakan sebagai mobile layout tanpa responsive transformation.
- `DS-022` — Schedule calendar adalah domain component, bukan generic event calendar tanpa semantics.
- `DS-023` — Today state dan selected state harus berbeda.
- `DS-024` — OFF dan Unassigned tidak boleh memiliki visual representation yang ambigu.
- `DS-025` — Modal stacking harus dihindari.
- `DS-026` — Tooltip tidak boleh menjadi satu-satunya sumber critical information.
- `DS-027` — Toast tidak boleh menggantikan inline validation.
- `DS-028` — Skeleton harus mencerminkan final spatial layout.
- `DS-029` — Empty state harus membedakan empty data dan zero filter result.
- `DS-030` — Permission denied tidak boleh tampil seperti generic server error.
- `DS-031` — Motion tidak boleh memblokir task completion.
- `DS-032` — `prefers-reduced-motion` wajib didukung.
- `DS-033` — Arbitrary z-index pada feature page tidak diperbolehkan.
- `DS-034` — Touch target mobile harus memenuhi ergonomi meski visible icon compact.
- `DS-035` — Bottom navigation harus safe-area aware.
- `DS-036` — Sticky content harus memiliki visual separation ketika overlap.
- `DS-037` — Component responsive boleh berubah composition tetapi tidak semantics.
- `DS-038` — Theme switch tidak boleh membutuhkan full reload.
- `DS-039` — Theme preference harus dapat dipertahankan.
- `DS-040` — Hardcoded white/black theme assumptions dilarang.
- `DS-041` — Generic setting card tidak boleh menggunakan nested-card berlebihan.
- `DS-042` — Status badge wajib memiliki text/symbol selain color bila state penting.
- `DS-043` — Payroll locked state harus visually unmistakable.
- `DS-044` — Schedule validation marker harus dapat ditelusuri ke explanation.
- `DS-045` — Dropdown/popover tidak boleh keluar viewport tanpa repositioning/overflow strategy.
- `DS-046` — Icon-only action wajib memiliki accessible label.
- `DS-047` — User-facing audit history tidak menampilkan raw JSON sebagai default.
- `DS-048` — Reusable component tidak boleh di-fork hanya untuk satu halaman tanpa design review.
- `DS-049` — Page-specific styling harus menggunakan token dan existing primitives terlebih dahulu.
- `DS-050` — Misalignment visual pada repeated structure dianggap defect.
- `DS-051` — Desktop dan mobile sama-sama wajib lolos component visual QA.
- `DS-052` — Light dan Dark parity wajib menjadi automated/manual quality gate sebelum release.
- `DS-053` — Component yang menggunakan animation wajib memiliki deterministic end state.
- `DS-054` — Interactive card harus keyboard accessible jika card benar-benar clickable.
- `DS-055` — Placeholder tidak boleh menggantikan persistent field label untuk form penting.
- `DS-056` — Disabled state harus tetap readable tetapi jelas non-interactive.
- `DS-057` — Error, warning, success, dan info wajib menggunakan shared semantic status system.
- `DS-058` — Shift color palette harus diuji di Light/Dark Mode.
- `DS-059` — Design token menjadi contract lintas seluruh page, bukan guideline opsional.
- `DS-060` — Komponen yang tidak memenuhi quality gate tidak dianggap production-ready.

---

# 38. Critical Component Acceptance Matrix

| Area | Acceptance |
|---|---|
| Theme | Semua core component render benar pada Light dan Dark |
| Button | State default/hover/pressed/focus/disabled/loading konsisten |
| Input | Label, helper, focus, error, disabled konsisten |
| Select | Dropdown alignment, keyboard, selected state, viewport collision aman |
| Table | Dense, aligned, numeric scanning baik, sticky state jelas |
| Schedule | S1/S2/S3/OFF/exception mudah dibedakan tanpa color-only dependence |
| Modal | Focus management dan hierarchy jelas |
| Drawer | Context di belakang tetap terbaca tanpa mengganggu foreground |
| Bottom Sheet | Touch-friendly, safe-area aware, internal scroll stabil |
| Toast | Tidak menutupi critical control dan tidak dipakai untuk blocking error |
| Skeleton | Geometry mendekati final content |
| Payroll | THP dan breakdown punya hierarchy jelas |
| Audit | Timeline mudah dibaca manusia |
| Sidebar | Expanded/collapsed state tetap aligned |
| Bottom Nav | 5 primary destinations tetap ergonomis dan selected state jelas |
| Motion | Cepat, tidak blocking, reduced-motion compatible |
| Accessibility | Focus, labels, contrast, non-color cues tersedia |

---

# 39. Visual Definition of Done

Sebuah component/page **belum** dianggap selesai hanya karena functional.

Visual Definition of Done minimum:

1. menggunakan design token resmi,
2. tidak memiliki raw theme leak,
3. alignment presisi,
4. typography hierarchy jelas,
5. spacing konsisten,
6. density sesuai konteks,
7. Light Mode polished,
8. Dark Mode polished,
9. desktop polished,
10. mobile polished,
11. state lengkap,
12. focus state jelas,
13. loading state intentional,
14. error state intentional,
15. empty state intentional,
16. transition tidak kasar,
17. tidak ada unexpected layout shift,
18. text tidak clipping/truncating secara tidak disengaja,
19. icon optically aligned,
20. touch/keyboard behavior sesuai platform,
21. semantic status mudah dimengerti,
22. spacing antar repeated element konsisten,
23. screenshot full-page tidak memperlihatkan misalignment nyata,
24. component terasa berasal dari design language NOCScheduler yang sama.

---

# 40. Relationship to Next PRDs

PRD-11 menetapkan **visual system dan component contract**.

Dokumen berikutnya memperdalam aspek lain:

- **PRD-12 — Responsive & Mobile Experience**  
  Breakpoint, reflow, mobile composition, gesture, thumb reach, responsive table/calendar, sticky region, orientation, viewport behavior.

- **PRD-13 — UI Polish & Visual Quality Standard**  
  Pixel-level QA, alignment checklist, motion polish, cross-theme parity, cross-browser visual acceptance, final high-fidelity release bar.

PRD-11 tidak boleh dipandang sebagai style suggestion. Ia adalah **implementation contract** untuk seluruh UI NOCScheduler.

---

# 41. Final Design Contract

NOCScheduler harus memiliki satu visual language yang konsisten dari login hingga payroll lock.

Setiap component harus terasa:

- intentional,
- precise,
- modern,
- spatial,
- responsive,
- accessible,
- theme-safe,
- operationally efficient.

Final principle:

> **Beautiful enough to create a “wow” impression, disciplined enough to remain invisible while the user works.**

Design system dianggap berhasil jika user tidak pernah merasa berpindah ke “halaman yang desainnya beda”, meskipun sedang berpindah dari Dashboard ke Schedule, Employees, Payroll, Reports, Activity History, atau Settings.
