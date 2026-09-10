# CatalogBlock — unified finder + grid (2026-09)

## Goal
Single visual catalog on homepage: filters + vehicle cards, no duplicate titles between them.

## Files
- `components/catalog/CatalogBlock.tsx` — master section `#catalog`, `bg-secondary`, `page-container py-16 md:py-24`
- `components/catalog/CategoryFinderPanel.tsx` — client finder UI (eyebrow CategoryFinder.eyebrow, title, categories, brands, status, CTA)
- `components/catalog/CatalogFeaturedGrid.tsx` — server: `fetchFeaturedProducts` → `ProductsGrid` + viewCatalog button; no H2 above cards

## Removed
- `components/home/CategorySelectorSection.tsx`
- `components/home/FeaturedProducts.tsx` (headers catalogEyebrow / featuredTitle no longer rendered on HP)

## Anchors
- `#catalog` — whole block
- `#inventory` — grid wrapper inside CatalogBlock
- Hero: `#catalog` / `#inventory`

## Tokens
Use `bg-secondary` + `page-container`, not raw `bg-slate-50` / `container max-w-7xl`.
Gutters: see `mem:layout-page-container-gutters-2026-09` (mobile 1rem; sm+ clamp to ~1.875rem).

## Finder panel

`CategoryFinderPanel` (2026-09-10): mono eyebrow + `font-black` title; category tiles `rounded-sm` hairline (no shadow, no framer-motion); filters as a top-rule ledger, chips stay rounded-full per UI Lab marks. CTA Button default lg + `LuChevronRight`.

## Status pill

VehicleCard overlay: flex row (Badge + favorite). shadcn `Badge`, no `truncate` collapse.