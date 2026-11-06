# Canonical gutters + catalog grid — 2026-10-30

## Gutters (`app/globals.css`)

One canon for `.page-container` / `.page-content` (navbar/footer share `.page-container`):

- mobile `< 40rem`: `padding-inline: max(1.25rem, safe-area-L, safe-area-R)` (20px+)
- tablet+: `max(clamp(2rem, 1.75rem + 0.5vw, 2.25rem), safe-area…)` (~32–36px)
- Mobile scrollbar: no `scrollbar-gutter: stable` (desktop fine-pointer only) — avoids L/R asymmetry

Admin no longer has separate `2rem` padding — only `max-width: none` via shell / `data-page-shell="admin"`.

Shell max-widths unchanged (home/catalog/product/reading).

## Catalog grid

`ProductsGrid` + loading skeletons: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5` (was `xl:grid-cols-3`). Matches UI Lab + VehicleCard `sizes`.

Home `#inventory` and `/products` both use `ProductsGrid`.

## Lab

`ui-lab-layout` gutters RuleCard + admin shell sample text updated.
