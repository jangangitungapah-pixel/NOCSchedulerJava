# PRD-13 — UI Polish & Visual Quality Standard

> **Product:** NOCScheduler  
> **Document Type:** Product Requirements Document — UI Polish & Visual Quality Standard  
> **Document ID:** PRD-13  
> **Status:** Draft — Visual Quality Gate Source of Truth  
> **Depends On:** PRD-01 through PRD-12  
> **Target:** Internal NOC Operations  
> **Default Locale:** Indonesia  
> **Default Timezone:** Asia/Jakarta  
> **Default Theme:** Light  
> **Theme Support:** Light + Dark parity required  
> **Platforms:** Desktop Web + Mobile Web with equal product priority  
> **Repository:** `jangangitungapah-pixel/NOCScheduler`

---

# 1. Purpose

Dokumen ini mendefinisikan **quality gate final untuk visual fidelity, spatial composition, alignment, typography, density, surface consistency, responsive polish, component state completeness, motion quality, theme parity, visual regression, dan screenshot-based acceptance** pada NOCScheduler.

PRD-13 menjadi source of truth untuk menjawab:

> **“Kapan sebuah halaman NOCScheduler benar-benar dianggap selesai secara visual, bukan hanya berfungsi?”**

Dokumen ini tidak mendefinisikan fitur baru. PRD ini memverifikasi implementasi terhadap pengalaman dan design system yang sudah ditetapkan oleh:

- PRD-10 — UI/UX, User Flow & Interaction Design,
- PRD-11 — Design System & Component Specification,
- PRD-12 — Responsive & Mobile Experience.

Sebuah fitur **belum Done** jika business logic sudah bekerja tetapi visual quality masih:

- tidak sejajar,
- tidak konsisten,
- terlalu kosong,
- terlalu padat tanpa hierarchy,
- memiliki state yang hilang,
- memiliki Light/Dark mismatch,
- rusak pada mobile,
- memiliki animation janky,
- menggunakan component yang terasa berbeda dari halaman lain.

---

# 2. Visual Quality Vision

NOCScheduler harus terasa seperti produk yang memiliki **obsessive attention to detail**.

Target visual quality:

> **Spatial, modern, premium, precise, dense, calm, tactile, responsive, and intentionally composed.**

UI harus memberikan kesan:

- setiap pixel memiliki alasan,
- setiap component mengikuti grammar visual yang sama,
- setiap layer terasa memiliki depth yang tepat,
- setiap action memiliki feedback,
- setiap state terasa dirancang,
- tidak ada area yang terlihat seperti placeholder,
- tidak ada elemen yang terasa “hampir sejajar”,
- tidak ada halaman yang terlihat berasal dari template berbeda.

Wow-factor tidak dinilai dari dekorasi berlebihan.

Wow-factor dinilai dari kombinasi:

```text
Precision
+ Spatial Composition
+ Responsiveness
+ Interaction Quality
+ Motion Detail
+ Density Control
+ Visual Consistency
+ State Completeness
```

---

# 3. Core Polish Principles

## POL-P01 — Functional Is Not Finished

Fitur yang berfungsi tetapi masih memiliki visual defect belum dianggap selesai.

Contoh defect:

- label input bergeser 2–4 px dibanding field lain,
- button height berbeda tanpa alasan,
- icon optical alignment buruk,
- table column header tidak sejajar dengan body,
- modal terlalu besar untuk isi yang sedikit,
- mobile page memiliki whitespace mati,
- dark mode kehilangan hierarchy,
- sticky layer bertabrakan.

---

## POL-P02 — Alignment Is a Quality Gate

Alignment repeated structure wajib presisi.

Harus diperiksa:

- vertical baseline,
- horizontal starting edge,
- center alignment,
- label-to-control spacing,
- icon-to-text alignment,
- row-to-row rhythm,
- table header/body alignment,
- calendar cell alignment,
- section title alignment,
- action cluster alignment.

Jika elemen yang secara visual harus sejajar terlihat tidak sejajar, itu adalah defect.

---

## POL-P03 — Desktop and Mobile Are Reviewed Independently

Visual approval desktop tidak otomatis berarti mobile approved.

Setiap halaman P0/P1 wajib melewati dua review independen:

- Desktop polish QA,
- Mobile polish QA.

Tablet/compact desktop juga harus diuji ketika composition berubah secara signifikan.

---

## POL-P04 — Light and Dark Require Equal Fidelity

Light Mode adalah default, tetapi Dark Mode bukan secondary skin yang kualitasnya boleh turun.

Review wajib memeriksa:

- surface hierarchy,
- contrast,
- border visibility,
- selected state,
- hover state,
- focus-visible,
- elevation,
- overlay,
- muted text,
- shift colors,
- destructive states,
- skeleton/loading states.

---

## POL-P05 — Polish the System, Not the Screenshot

Jangan memperbaiki satu screenshot dengan CSS ad-hoc yang hanya bekerja pada satu halaman.

Jika defect berasal dari component atau token shared:

1. perbaiki component/token,
2. regression-check seluruh consumer,
3. jangan patch page lokal kecuali memang variant khusus yang sah.

---

## POL-P06 — Dense Does Not Mean Cramped

Desktop boleh padat tetapi tidak boleh membuat control berdesakan.

Mobile boleh compact tetapi tetap harus menjaga:

- touch target,
- readability,
- grouping,
- safe area,
- scanability.

Density harus datang dari hierarchy dan spacing yang efisien, bukan mengecilkan semua elemen tanpa aturan.

---

## POL-P07 — Spatial Does Not Mean Oversized

Spatial UI tidak berarti:

- card raksasa,
- hero header tinggi,
- padding 48–80 px di semua section,
- terlalu banyak floating layer,
- glass surface berlebihan.

Spatial quality harus muncul dari layering, hierarchy, controlled depth, sticky context, composition, dan motion.

---

## POL-P08 — Every State Must Look Intentional

Component/page tidak boleh hanya polished pada populated/default state.

Wajib review:

- loading,
- empty,
- zero-result,
- error,
- validation error,
- disabled,
- read-only,
- permission denied,
- dirty/outdated,
- locked,
- offline/degraded jika tersedia.

---

## POL-P09 — Motion Is Part of Polish

Animation yang terlalu lambat, terlalu banyak, tidak sinkron, atau patah-patah adalah defect visual.

Motion harus:

- memperjelas perubahan state,
- menjaga spatial continuity,
- memiliki easing konsisten,
- tidak menghambat kerja,
- menghormati reduced-motion preference.

---

## POL-P10 — Screenshot QA Is Required

Critical page tidak boleh mendapat final visual approval hanya dari inspeksi interaktif sesaat.

Gunakan screenshot untuk membandingkan:

- alignment,
- hierarchy,
- whitespace,
- overflow,
- density,
- theme parity,
- breakpoint behavior,
- regression antar-iterasi.

---

# 4. Visual Defect Severity

## 4.1 P0 — Release Blocking Visual Defect

Contoh:

- content/action tidak dapat digunakan,
- accidental page-level horizontal overflow,
- CTA tertutup viewport/safe area/keyboard,
- modal/sheet tidak dapat ditutup,
- sticky header menutup content penting,
- text tidak terbaca karena contrast,
- mobile layout pecah,
- essential content terpotong tanpa akses,
- dark/light theme membuat informasi hilang,
- focus state tidak terlihat pada critical interaction.

P0 wajib diperbaiki sebelum release.

---

## 4.2 P1 — Major Polish Defect

Contoh:

- repeated alignment mismatch yang jelas,
- inconsistent component height,
- table/calendar geometry tidak stabil,
- section spacing sangat tidak konsisten,
- density buruk,
- hierarchy membingungkan,
- theme parity lemah,
- animation noticeably janky,
- truncation menghilangkan informasi penting padahal ruang tersedia,
- desktop/mobile terlihat seperti produk berbeda.

P1 wajib diselesaikan sebelum feature dianggap visually complete.

---

## 4.3 P2 — Minor Polish Defect

Contoh:

- optical icon alignment kecil,
- subtle spacing mismatch,
- shadow/elevation sedikit berbeda,
- text wrapping kurang optimal,
- hover transition kurang refined,
- minor empty-state composition issue.

P2 dapat dibundel dalam polish pass tetapi harus memiliki tracking.

---

## 4.4 P3 — Enhancement

Contoh:

- microinteraction tambahan,
- delightful transition,
- subtle visual refinement yang tidak memengaruhi consistency/usability.

P3 bukan alasan menunda penggunaan produk.

---

# 5. Screenshot-Based QA Matrix

Minimal critical page harus direview pada kombinasi berikut.

## 5.1 Theme Matrix

- Light
- Dark

## 5.2 Viewport Matrix

Minimum baseline:

- 360 px compact mobile
- 390/393 px common mobile
- 430 px large mobile
- 768 px tablet
- 1024 px compact desktop/tablet landscape
- 1280 px desktop
- 1440 px canonical desktop
- 1920 px wide desktop

Tidak seluruh screenshot harus disimpan permanen untuk setiap patch kecil, tetapi P0/P1 page acceptance wajib mewakili viewport yang composition-nya berbeda.

---

## 5.3 Data State Matrix

Critical page minimal diuji pada:

- realistic populated state,
- maximum/long-content state,
- minimum/empty state,
- loading state,
- validation/error state bila relevan.

---

## 5.4 Permission/Business State Matrix

Jika relevan:

- member/read-only,
- scheduler/admin editable,
- draft,
- published,
- dirty/outdated,
- finalized,
- locked.

---

# 6. Page Composition Audit

Setiap halaman harus diaudit dari atas ke bawah.

## 6.1 Shell

Periksa:

- sidebar/bottom nav alignment,
- page content inset,
- shell gutter,
- top bar height,
- active nav state,
- notification/profile controls,
- theme switcher placement,
- collapsed sidebar geometry.

---

## 6.2 Page Header

Page header harus compact dan proporsional.

Periksa:

- title baseline,
- subtitle spacing,
- status badge alignment,
- primary action alignment,
- secondary action placement,
- period/date selector alignment,
- breadcrumb hanya bila membantu.

Dilarang memakai oversized hero header pada halaman operasional.

---

## 6.3 Content Rhythm

Periksa konsistensi:

- section-to-section spacing,
- heading-to-content spacing,
- control-to-control spacing,
- group boundary,
- card/surface separation,
- bottom page breathing room.

Tidak boleh ada satu section dengan ruang 3× lebih besar tanpa alasan.

---

## 6.4 Maximum Width

Halaman form/detail tidak boleh melebar sampai sulit dibaca.

Power workspace boleh menggunakan viewport lebar.

Wide desktop tidak boleh menghasilkan ruang mati masif; gunakan context panel, wider workspace, atau controlled max-width yang sesuai.

---

# 7. Typography Polish Standard

## 7.1 Hierarchy

Harus terlihat jelas antara:

- page title,
- section title,
- card/surface title,
- label,
- body,
- metadata,
- muted helper,
- numerical emphasis.

Jangan membuat terlalu banyak size/weight yang hampir sama tetapi tidak punya peran jelas.

---

## 7.2 Baseline Alignment

Text di repeated structure harus memiliki baseline konsisten.

Contoh:

- table cells,
- stat rows,
- employee list,
- schedule rows,
- payroll rows,
- form labels.

---

## 7.3 Truncation Policy

Truncation hanya digunakan jika layout memang membutuhkan.

Jika ruang cukup, jangan memotong teks karena width hardcoded terlalu sempit.

Critical information harus punya cara untuk dibaca penuh melalui:

- wrapping,
- expanded row,
- tooltip/popover,
- detail view.

Tooltip tidak boleh menjadi solusi untuk semua truncation.

---

## 7.4 Numeric Typography

Nominal payroll, count, waktu, dan angka penting harus mudah dipindai.

Gunakan numeric alignment/tabular numerals jika font mendukung untuk:

- currency,
- table numeric columns,
- time,
- count comparisons.

---

# 8. Iconography Polish

## 8.1 Optical Centering

Icon tidak cukup hanya mathematically centered.

Review optical balance terhadap:

- button label,
- input content,
- sidebar item,
- badge,
- empty state,
- status indicator.

---

## 8.2 Icon Size Consistency

Ukuran icon harus mengikuti role/variant.

Dilarang menggunakan 15px, 17px, 19px, 21px secara random antarhalaman hanya untuk mengejar alignment lokal.

---

## 8.3 Icon Meaning

Satu icon harus memiliki meaning yang konsisten.

Contoh destructive/archive/delete tidak boleh saling bertukar glyph tanpa alasan.

---

# 9. Button & Action Polish

Periksa:

- height,
- label centering,
- icon gap,
- loading geometry,
- disabled opacity/contrast,
- pressed state,
- focus-visible,
- destructive emphasis,
- primary vs secondary hierarchy.

Satu konteks tidak boleh mempunyai empat button yang semuanya terlihat primary.

Button group harus terlihat sebagai cluster yang disengaja.

---

# 10. Input, Select & Form Polish

Input family harus terasa identik.

Periksa:

- height,
- radius,
- border,
- background,
- label placement,
- placeholder contrast,
- icon inset,
- select chevron alignment,
- validation message spacing,
- helper text,
- disabled/read-only distinction,
- focus ring.

Text input, Select, Date Picker, Search, Combobox tidak boleh terlihat berasal dari library berbeda.

Form field vertical rhythm harus konsisten.

---

# 11. Table & Data Grid Polish

## 11.1 Geometry

Periksa:

- header/body column alignment,
- row height consistency,
- checkbox alignment,
- avatar alignment,
- action column centering,
- sticky column shadow/border,
- sort icon placement.

---

## 11.2 Density

Desktop table harus padat tetapi scanable.

Hindari row height besar jika isi hanya satu baris.

Mobile tidak boleh memaksa full desktop table jika struktur list/detail lebih tepat.

---

## 11.3 Numeric Columns

Currency/count columns sebaiknya right-aligned ketika membantu comparison.

Header harus align dengan nilai body.

---

## 11.4 Sticky Layers

Sticky header/column wajib diuji saat:

- vertical scroll,
- horizontal scroll,
- browser zoom,
- dark mode,
- hover/selected rows.

Tidak boleh ada seam atau overlap yang terlihat rusak.

---

# 12. Schedule & Calendar Polish

Schedule adalah surface paling sensitif dan wajib melalui dedicated QA.

Periksa:

- date header alignment,
- employee row alignment,
- today state,
- selected state,
- weekend treatment,
- shift badge geometry,
- OFF/Leave/Exception distinction,
- sticky date header,
- sticky employee column,
- horizontal scroll affordance,
- scrollbar behavior,
- cell hover/pressed state,
- conflict/warning badge,
- cross-midnight display,
- empty/unassigned distinction.

## 12.1 Today vs Selected

Today dan selected tidak boleh menggunakan visual yang sama.

User harus dapat memahami keduanya ketika today juga sedang selected.

---

## 12.2 Scroll Quality

Horizontal calendar scroll harus:

- smooth,
- tidak snap agresif,
- tidak melawan vertical scroll pada touch,
- tidak membuat sticky header transparan bertabrakan dengan content.

---

## 12.3 Repeated Cell Alignment

Cell schedule adalah repeated geometry; misalignment kecil mudah terlihat.

Review screenshot harus memeriksa garis:

- date columns,
- row separators,
- badges,
- selection highlight,
- text baseline.

---

# 13. Payroll UI Polish

Payroll harus terasa trustworthy.

Periksa:

- currency alignment,
- total emphasis,
- subtotal grouping,
- qty × rate readability,
- state badge,
- dirty/outdated warning,
- finalized/locked treatment,
- adjustment distinction,
- positive/negative semantic treatment,
- drill-down source list,
- calculation timestamp.

Jangan membuat semua angka memiliki visual emphasis yang sama.

Calculated THP harus menjadi anchor visual tanpa membuat halaman terasa seperti marketing dashboard.

---

# 14. Modal, Drawer & Bottom Sheet Polish

## 14.1 Modal

Modal wajib proporsional terhadap isi.

Dilarang menggunakan modal besar untuk dua field sederhana.

Periksa:

- header/content/footer alignment,
- close action,
- CTA alignment,
- scroll containment,
- keyboard focus,
- overlay,
- max-height.

---

## 14.2 Drawer / Inspector

Drawer/inspector harus terasa terhubung dengan selected context.

Periksa:

- origin animation,
- selected-row persistence,
- surface separation,
- sticky header/action jika diperlukan.

---

## 14.3 Bottom Sheet

Mobile bottom sheet wajib:

- memperhitungkan safe area,
- memiliki drag affordance bila draggable,
- memiliki visible close path,
- tidak menutup keyboard CTA,
- tidak membuat nested sheet hell.

Critical workflow panjang harus pindah ke full-screen flow.

---

# 15. Navigation Polish

## 15.1 Desktop Sidebar

Periksa:

- icon baseline,
- label baseline,
- group spacing,
- active indicator,
- badge alignment,
- collapsed state,
- collapse button collision,
- profile section.

---

## 15.2 Mobile Bottom Navigation

Periksa:

- safe-area,
- label/icon alignment,
- active state,
- badge placement,
- equal tap region,
- collision dengan sticky CTA.

Bottom navigation dan contextual action bar tidak boleh saling menumpuk.

---

# 16. Surface, Border, Shadow & Depth Audit

Depth harus konsisten dengan elevation hierarchy.

Periksa:

- canvas/base/raised/overlay distinction,
- subtle border visibility,
- shadow softness,
- dark-mode surface separation,
- sticky surface depth,
- nested surface count.

Dilarang:

- card-inside-card-inside-card tanpa alasan,
- shadow berbeda per halaman,
- border terlalu banyak hingga UI terasa wireframe,
- semua surface menggunakan elevation tinggi.

---

# 17. Color & Semantic Polish

Semantic color harus konsisten untuk:

- S1,
- S2,
- S3,
- OFF,
- Leave,
- Warning,
- Error,
- Success,
- Info,
- Locked,
- Dirty/Outdated.

Color bukan satu-satunya carrier informasi.

Status penting juga menggunakan:

- label,
- icon,
- shape/border,
- typography.

Shift color wajib diuji Light/Dark agar tetap terbaca tanpa terlalu neon.

---

# 18. Light/Dark Parity Audit

Setiap page approval harus memeriksa:

1. canvas hierarchy,
2. raised surface,
3. border,
4. text primary,
5. text secondary,
6. muted text,
7. button states,
8. input states,
9. selected states,
10. hover states,
11. focus-visible,
12. overlay/modal,
13. skeleton,
14. tooltip/popover,
15. semantic colors,
16. charts/reports jika ada.

Dark mode tidak boleh hanya mengganti background menjadi hitam dan text menjadi putih.

---

# 19. Responsive Visual Defect Audit

Pada tiap responsive band, periksa:

- page overflow,
- wrapping,
- clipped content,
- toolbar collision,
- sticky collision,
- filter overflow,
- action reachability,
- safe-area,
- keyboard overlap,
- modal/sheet size,
- bottom-nav collision,
- date strip behavior,
- responsive table transformation,
- orientation change.

Jika layout terasa “dipaksa muat”, evaluasi recomposition daripada terus mengecilkan component.

---

# 20. Motion & Microinteraction Quality

## 20.1 Required Review

Periksa:

- hover transition,
- pressed feedback,
- focus transition,
- dropdown opening,
- modal opening/closing,
- drawer transition,
- bottom sheet transition,
- navigation active change,
- skeleton → content,
- save success feedback,
- schedule selection,
- status transition.

---

## 20.2 Jank Is a Defect

Animation yang drop frame secara terlihat pada perangkat target dianggap defect.

Jangan menganimasikan property mahal jika transform/opacity dapat digunakan.

---

## 20.3 Reduced Motion

Dengan `prefers-reduced-motion`, spatial meaning tetap harus jelas meskipun animation dikurangi.

Jangan menghapus state feedback seluruhnya.

---

# 21. Loading, Empty & Error Polish

## 21.1 Loading

Skeleton harus mengikuti final geometry.

Hindari:

- full-page spinner untuk content utama,
- skeleton acak yang ukurannya berbeda dari content,
- layout shift besar setelah data masuk.

---

## 21.2 Empty State

Empty state harus menjelaskan:

- apa yang belum ada,
- apakah itu normal,
- action berikutnya jika ada.

Jangan menggunakan ilustrasi besar jika hanya menambah ruang kosong.

---

## 21.3 Zero Result

Filter menghasilkan nol data harus berbeda dari database benar-benar kosong.

Zero-result state harus menawarkan:

- clear filter,
- adjust search,
- reset scope.

---

## 21.4 Error

Error state harus tetap menyatu dengan layout dan memberikan recovery path.

Jangan hanya menampilkan raw technical error.

---

# 22. Long Content & Edge-Case Polish

QA wajib menggunakan data realistis yang panjang:

- nama employee panjang,
- notes panjang,
- role label panjang,
- nominal besar,
- banyak shift/rows,
- banyak notification,
- banyak validation issue,
- banyak payroll items.

Jangan hanya QA menggunakan data pendek yang “cantik”.

---

# 23. Browser Zoom & Accessibility Visual QA

Minimal QA pada:

- 100% browser zoom,
- 125% bila relevan,
- 200% untuk accessibility validation pada critical flow.

Periksa:

- clipping,
- overflow,
- sticky behavior,
- dialog sizing,
- text reflow,
- focus ring.

User zoom tidak boleh dinonaktifkan.

---

# 24. Screenshot Review Workflow

Recommended workflow per major UI implementation:

1. Implement functional page.
2. Capture canonical desktop Light.
3. Capture canonical desktop Dark.
4. Capture canonical mobile Light.
5. Capture canonical mobile Dark.
6. Capture populated + edge state.
7. Review alignment and spacing.
8. Review hierarchy and density.
9. Review theme parity.
10. Review sticky/overflow behavior.
11. Review interactive states manually.
12. Fix shared component issues first.
13. Recapture affected screenshots.
14. Mark page visually accepted only after critical defects clear.

---

# 25. Screenshot Inspection Checklist

Saat melihat full-page screenshot, reviewer harus secara aktif mencari:

- vertical lines yang seharusnya sejajar,
- text baseline yang melompat,
- button yang sedikit lebih tinggi,
- card/surface width yang aneh,
- padding tidak konsisten,
- icon yang tampak turun/naik,
- row yang tidak rata,
- sticky area yang transparan,
- truncation yang tidak perlu,
- whitespace mati,
- viewport yang terlalu kosong,
- component density mismatch,
- excessive nested surfaces,
- inconsistent radius,
- inconsistent border/shadow,
- duplicated heading,
- action yang terlalu jauh dari context.

---

# 26. Page-Level Visual Approval Template

Setiap critical page dapat menggunakan checklist berikut:

```text
Page:
Route:
Role:
State:
Theme:
Viewport:

[ ] Shell aligned
[ ] Header compact and aligned
[ ] Primary action clear
[ ] Typography hierarchy correct
[ ] Repeated structures aligned
[ ] Component heights consistent
[ ] Spacing rhythm consistent
[ ] Surface hierarchy correct
[ ] No unnecessary nested cards
[ ] No accidental overflow
[ ] Sticky elements correct
[ ] Long text handled
[ ] Loading state polished
[ ] Empty/zero state polished
[ ] Error/validation state polished
[ ] Focus/hover/pressed states complete
[ ] Motion smooth
[ ] Theme parity checked
[ ] Responsive composition correct
[ ] No P0/P1 visual defects
```

---

# 27. Domain-Specific Acceptance Targets

## 27.1 Dashboard

- Today Shift menjadi anchor visual utama.
- Next Shift dan Now on Duty mudah dipindai.
- Tidak menjadi kumpulan card besar dengan ruang kosong berlebihan.
- Admin attention items tidak mengalahkan personal context tanpa alasan.

---

## 27.2 My Schedule

- Hari ini langsung ditemukan.
- Shift color/label jelas.
- Mobile scrolling natural.
- Tidak ada ambiguity antara OFF dan Unassigned.

---

## 27.3 Team Schedule

- Row/column alignment sangat presisi.
- Sticky headers/columns stabil.
- Coverage context mudah terlihat.
- Large dataset tetap readable.

---

## 27.4 Manage Schedule

- Workspace mendapatkan maksimum ruang berguna.
- Toolbar compact.
- Bulk selection state jelas.
- Validation inspector tidak mengganggu grid.
- Publish CTA jelas tetapi tidak floating tanpa context.

---

## 27.5 Requests

- Status mudah dibaca.
- Planned → proposed/effective change mudah dibandingkan.
- Approve/Reject tidak ambigu.
- Mobile approval bisa dilakukan satu tangan.

---

## 27.6 Employees

- Directory padat dan searchable.
- Employee detail tidak memiliki hero profile berlebihan.
- Tabs/sections aligned.

---

## 27.7 Payroll

- Angka trustworthy dan aligned.
- THP menjadi visual anchor.
- Breakdown mudah dipahami.
- Locked/dirty/finalized states tidak bisa tertukar.

---

## 27.8 Settings

- Compact section layout.
- Semua input/select memiliki grammar visual sama.
- Tidak ada duplicated page title/hero.
- Effective-date impact dijelaskan dekat control.
- Destructive/high-risk settings dibedakan jelas.

---

# 28. Anti-Patterns — Automatic Polish Failure

Implementasi berikut otomatis gagal visual review sampai diperbaiki:

1. Giant hero header pada operational page.
2. Random spacing values tanpa token/justification.
3. Input styles berbeda antarhalaman.
4. Button heights berbeda tanpa variant resmi.
5. Page-level horizontal overflow tidak disengaja.
6. Sticky header transparan sehingga content menembus text.
7. Modal-on-modal untuk normal workflow.
8. Card-inside-card hierarchy berlebihan.
9. Desktop table dijejalkan ke mobile tanpa adaptation.
10. Mobile CTA tertutup bottom navigation/keyboard.
11. Text penting dipotong padahal ruang tersedia.
12. Dark mode dengan contrast/hierarchy buruk.
13. Hover-only information untuk required task.
14. Animation yang menahan user sebelum action bisa dilakukan.
15. Empty state menggunakan ruang terlalu besar tanpa fungsi.
16. Icon family bercampur tanpa alasan.
17. Hardcoded shadow/radius/color khusus satu page untuk meniru component existing.
18. Duplicated large heading di dalam page shell.
19. Badge/label yang tidak vertically centered.
20. Repeated table/calendar row dengan baseline tidak konsisten.

---

# 29. Visual Regression Strategy

Visual regression automation sangat direkomendasikan untuk halaman/component kritis setelah implementation architecture tersedia.

Candidate baseline snapshots:

- Dashboard desktop/mobile Light/Dark,
- My Schedule,
- Team Schedule,
- Manage Schedule,
- Employee list/detail,
- Monthly Payroll,
- Payroll Detail,
- Settings Shift,
- Settings Compensation,
- modal/drawer/bottom sheet critical variants.

Automation tidak menggantikan human visual review.

Pixel diff harus diperlakukan sebagai signal, bukan keputusan otomatis bahwa UI salah/benar.

---

# 30. Polish Pass Cadence

Direkomendasikan tiga level polish pass:

### Pass A — Component Polish

Dilakukan ketika shared component dibuat/diubah.

### Pass B — Page Polish

Dilakukan setelah functional page lengkap.

### Pass C — Cross-Product Polish

Dilakukan setelah beberapa domain selesai untuk membandingkan consistency antarhalaman.

Jangan menunda seluruh polish sampai akhir project karena inconsistency akan terlalu mahal diperbaiki.

---

# 31. Performance as Visual Quality

Visual polish gagal jika UI cantik tetapi terasa berat.

Review harus mencakup:

- scroll smoothness,
- input latency,
- sheet/modal opening,
- large table/calendar responsiveness,
- skeleton transition,
- resize/reflow stability.

Large schedule workspace harus menggunakan teknik rendering yang menjaga interaksi tetap responsif.

Target performance numerik final ditentukan di PRD technical/performance terkait.

---

# 32. Cross-Browser Quality

Minimum browser support final ditentukan pada Technical Architecture PRD, tetapi visual QA harus mencakup browser yang ditetapkan support matrix.

Periksa khusus:

- sticky positioning,
- backdrop/blur behavior jika digunakan,
- scrollbar,
- date input behavior,
- focus outline,
- safe-area,
- viewport units mobile.

---

# 33. UI Polish Ownership

Visual quality adalah shared responsibility.

### Design/UX responsibility

- quality bar,
- hierarchy,
- spacing intent,
- component behavior,
- acceptance review.

### Frontend responsibility

- faithful implementation,
- responsive behavior,
- interaction states,
- performance,
- design token compliance.

### QA responsibility

- viewport/theme/state coverage,
- regression detection,
- defect severity.

Tidak boleh ada pola:

> “Itu cuma masalah UI, nanti belakangan.”

Jika defect merusak clarity, interaction, atau product consistency, itu adalah product defect.

---

# 34. UI Polish Business Rules

## POL-001
P0/P1 feature tidak dianggap selesai tanpa desktop dan mobile visual approval.

## POL-002
Light approval tidak menggantikan Dark approval.

## POL-003
Repeated structure alignment mismatch adalah defect.

## POL-004
Page-level accidental horizontal overflow adalah release-blocking defect.

## POL-005
Sticky content tidak boleh membuat text/content overlap yang tidak disengaja.

## POL-006
Critical CTA harus tetap reachable pada supported viewport.

## POL-007
Mobile CTA harus memperhitungkan safe-area dan virtual keyboard.

## POL-008
Input family harus mengikuti component system yang sama.

## POL-009
Button family harus mengikuti documented variant.

## POL-010
Arbitrary page-specific visual patch tidak boleh menggantikan shared component fix.

## POL-011
Today dan Selected state schedule harus dapat dibedakan.

## POL-012
OFF dan Unassigned harus dapat dibedakan.

## POL-013
Dirty, Finalized, dan Locked payroll harus memiliki state yang tidak ambigu.

## POL-014
Long content tidak boleh menghancurkan layout.

## POL-015
Tooltip tidak boleh menjadi satu-satunya cara membaca critical content.

## POL-016
Hover tidak boleh menjadi requirement untuk mobile-equivalent information.

## POL-017
Loading state harus menjaga geometry layout sedekat mungkin.

## POL-018
Zero result harus berbeda dari true empty state.

## POL-019
Error state wajib memiliki recovery path bila action recovery tersedia.

## POL-020
Dark mode wajib mempertahankan semantic hierarchy.

## POL-021
Color tidak boleh menjadi satu-satunya carrier status penting.

## POL-022
Shift semantic color harus konsisten di semua halaman.

## POL-023
Table numeric alignment harus konsisten.

## POL-024
Calendar repeated cell geometry harus stabil.

## POL-025
Sticky column/header tidak boleh menghasilkan seam visual rusak.

## POL-026
Modal size harus proporsional terhadap content.

## POL-027
Modal stacking dilarang pada normal workflow.

## POL-028
Long mobile form harus dapat menggunakan full-screen flow.

## POL-029
Bottom sheet harus memiliki safe close path.

## POL-030
Mobile primary navigation tap areas harus konsisten.

## POL-031
Desktop sidebar collapsed state harus tetap aligned dan usable.

## POL-032
Icon family tidak boleh dicampur secara ad-hoc.

## POL-033
Icon optical alignment harus direview, bukan hanya CSS center.

## POL-034
Page header operasional harus compact.

## POL-035
Duplicated hero/title pada shell dan content tidak diperbolehkan.

## POL-036
Whitespace yang tidak memperjelas structure harus dipangkas.

## POL-037
Wide desktop tidak boleh hanya memperbesar ruang kosong.

## POL-038
Mobile tidak boleh sekadar mengecilkan desktop structure.

## POL-039
Breakpoint composition change harus tetap mempertahankan semantics.

## POL-040
Orientation change tidak boleh merusak visual state.

## POL-041
Animation tidak boleh menghambat task completion.

## POL-042
Reduced motion wajib tetap menghasilkan state transition yang jelas.

## POL-043
Noticeable animation jank adalah visual defect.

## POL-044
Browser zoom tidak boleh menghasilkan clipped critical controls.

## POL-045
Focus-visible harus jelas pada interactive control.

## POL-046
Disabled state tidak boleh terlihat seperti enabled state.

## POL-047
Read-only dan disabled harus berbeda bila behavior berbeda.

## POL-048
Error border/message tidak boleh mengubah layout secara liar.

## POL-049
Currency dan important number harus mudah dibandingkan secara visual.

## POL-050
High-risk action harus memiliki destructive/attention hierarchy yang konsisten.

## POL-051
Activity history repeated timeline alignment harus konsisten.

## POL-052
Notification badge tidak boleh bertabrakan dengan icon/container.

## POL-053
Skeleton harus memiliki theme parity.

## POL-054
Overlay harus memiliki contrast yang cukup tanpa membuat UI terasa berat.

## POL-055
Nested surfaces harus diminimalkan.

## POL-056
Border/shadow/elevation harus menggunakan documented family.

## POL-057
Screenshot QA harus menggunakan realistic content, bukan hanya dummy pendek.

## POL-058
Shared component fix wajib regression-check consumer utama.

## POL-059
Tidak boleh menutup P1 visual defect hanya karena feature secara functional lolos test.

## POL-060
Critical page hanya dapat ditandai visually accepted setelah P0 dan P1 defect clear.

---

# 35. Critical Visual Acceptance Tests

| ID | Scenario | Expected |
|---|---|---|
| VIS-001 | Dashboard 1440 Light | hierarchy/alignment clean, no dead space |
| VIS-002 | Dashboard 390 Light | one-hand readable, no overflow |
| VIS-003 | Dashboard Dark | parity dengan Light |
| VIS-004 | My Schedule 360 | today/shift readable, scroll natural |
| VIS-005 | Team Schedule 1440 | row/column/sticky alignment presisi |
| VIS-006 | Team Schedule 390 | recomposed view, bukan squeezed matrix |
| VIS-007 | Manage Schedule 1280 | workspace dense, toolbar compact |
| VIS-008 | Manage Schedule long employee names | geometry tetap stabil |
| VIS-009 | Schedule horizontal scroll mobile | tidak konflik dengan vertical scroll |
| VIS-010 | Sticky schedule header | opaque/readable, tidak overlap content |
| VIS-011 | Payroll desktop | numeric alignment dan THP hierarchy benar |
| VIS-012 | Payroll mobile | summary + drill-down readable |
| VIS-013 | Payroll Dirty | warning unmistakable |
| VIS-014 | Payroll Locked | state unmistakable dan action hierarchy benar |
| VIS-015 | Employee list desktop | density dan row alignment konsisten |
| VIS-016 | Employee detail mobile | tidak ada hero/profile whitespace berlebihan |
| VIS-017 | Settings desktop | input/select visually identical family |
| VIS-018 | Settings mobile keyboard open | active field/CTA tetap reachable |
| VIS-019 | Modal desktop | proportionate, aligned, focus visible |
| VIS-020 | Bottom sheet mobile | safe-area dan close path benar |
| VIS-021 | Empty state | compact, actionable, bukan giant illustration |
| VIS-022 | Zero result | distinguishable from empty database |
| VIS-023 | Loading Light/Dark | skeleton geometry/theme parity |
| VIS-024 | Error state | integrated, readable, recovery available |
| VIS-025 | 1920 wide desktop | no giant dead space |
| VIS-026 | 360 compact mobile | no accidental horizontal overflow |
| VIS-027 | Browser zoom 200% critical form | content reflows tanpa clipping critical action |
| VIS-028 | Reduced motion | transitions still understandable |
| VIS-029 | Long text/large nominal data | no broken hierarchy/truncation defect |
| VIS-030 | Light ↔ Dark switch | component structure/state remains stable |

---

# 36. Visual Definition of Done

Sebuah critical page hanya boleh disebut **Visual Done** jika seluruh kondisi berikut terpenuhi:

- [ ] Functional behavior sudah stabil.
- [ ] Desktop canonical viewport sudah direview.
- [ ] Mobile canonical viewport sudah direview.
- [ ] Tablet/compact state direview jika composition berubah.
- [ ] Light Mode lolos.
- [ ] Dark Mode lolos.
- [ ] Populated state lolos.
- [ ] Empty/zero state lolos.
- [ ] Loading state lolos.
- [ ] Error/validation state lolos bila relevan.
- [ ] Long-content state lolos.
- [ ] Repeated alignment presisi.
- [ ] Typography hierarchy konsisten.
- [ ] Input/button/component sizing konsisten.
- [ ] No accidental page overflow.
- [ ] Sticky/fixed layer tidak collision.
- [ ] Safe-area benar.
- [ ] Keyboard state benar pada mobile form.
- [ ] Focus-visible benar.
- [ ] Hover/pressed/selected states benar.
- [ ] Motion smooth.
- [ ] Reduced motion benar.
- [ ] No arbitrary component styling.
- [ ] No excessive nested cards/surfaces.
- [ ] No duplicated page hero/title.
- [ ] No unnecessary truncation.
- [ ] No P0 visual defect.
- [ ] No P1 visual defect.
- [ ] Shared-component changes sudah regression-checked.
- [ ] Screenshot acceptance sudah dilakukan.

---

# 37. Relationship to Future PRDs

PRD-13 menjadi visual quality contract untuk PRD selanjutnya.

### PRD-14 — Technical Architecture

Harus memilih frontend/tooling yang mampu mendukung:

- design token,
- responsive composition,
- animation quality,
- accessibility,
- efficient large-grid rendering,
- theme parity.

### PRD-19 — QA & Testing

Harus memasukkan:

- visual regression strategy,
- responsive test matrix,
- accessibility verification,
- component regression,
- screenshot QA.

---

# 38. Final Quality Statement

Target NOCScheduler bukan sekadar:

> “fiturnya lengkap dan tampilannya modern.”

Target finalnya adalah:

> **“Setiap halaman terasa seperti hasil satu sistem desain premium yang matang—padat tetapi tenang, spatial tetapi tidak boros ruang, modern tetapi tidak gimmicky, sangat presisi di desktop, sangat natural di mobile, dan konsisten sampai ke state, alignment, motion, serta detail terkecil.”**

UI yang secara teknis berfungsi tetapi belum mencapai standard tersebut belum dianggap selesai secara visual.
