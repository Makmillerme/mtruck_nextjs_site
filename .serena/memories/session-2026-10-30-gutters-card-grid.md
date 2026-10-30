# Canonical gutters + catalog grid — 2026-10-30

## Gutters (`app/globals.css`)

One canon for `.page-container` / `.page-content` (navbar/footer share `.page-container`):

- mobile `< 40rem`: `1.25rem` (20px)
- tablet+: `clamp(2rem, 1.75rem + 0.5vw, 2.25rem)` (~32–36px)

Admin no longer has separate `2rem` padding — only `max-width: none` via shell / `data-page-shell="admin"`.

Shell max-widths unchanged (home/catalog/product/reading).

## Catalog grid

`ProductsGrid` + loading skeletons: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5` (was `xl:grid-cols-3`). Matches UI Lab + VehicleCard `sizes`.

Home `#inventory` and `/products` both use `ProductsGrid`.

## Lab

`ui-lab-layout` gutters RuleCard + admin shell sample text updated.
