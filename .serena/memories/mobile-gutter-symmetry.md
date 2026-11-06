## Mobile gutter asymmetry on PDP (2026-11-06) — RESOLVED

### Symptom
On PDP on narrow phones (~363 CSS px, OnePlus 1272px @ 560dpi), everything below the breadcrumb (gallery, thumbs, buybox) sticks out to the right: right gutter smaller than left. Catalog/home fine.

### Real root cause (measured)
PDP section `grid gap-8` had no explicit columns, so its implicit `auto` track grew to the largest min-content child. `ProductDetailsTabs` tab list (3 nowrap `flex-none` triggers + gap-6 + card p-4) had min-content ~330px > available 323px. Track = 330px -> all section children 330px wide -> +7px to the right.
The thumb strip was NOT the cause (it was just the first visible block). Container-query attempt (@container / cqi) was reverted: Tailwind v3 here has no container-queries plugin.

### Fix
- app/[locale]/products/[id]/page.tsx: section `grid min-w-0 grid-cols-1 ...`; inner gallery/buybox grid `grid min-w-0 grid-cols-1 ... lg:grid-cols-2`.
- components/single-product/product-details-tabs.tsx: list `min-w-0 max-w-full gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden` + hidden scrollbar; wrapper and card `min-w-0`.

### Canon
Page-level grids holding arbitrary content: always `grid-cols-1` (minmax(0,1fr)), not bare `grid`.

### Debug method
ADB screencap (.cursor/tools/platform-tools/adb.exe) + CDP emulation at real CSS width; measure section track (`getComputedStyle(grid).gridTemplateColumns`) and min-content of each child (`style.width='min-content'`).
Caveat: Next Dev Tools issues overlay sets body `padding-right:10px; overflow:hidden` — close it before measuring.

### Related (still valid)
- globals.css: thin scrollbar; scrollbar-gutter stable only md+; page-container padding-inline max(1.25rem, safe-area).
- Locale layout viewportFit cover.