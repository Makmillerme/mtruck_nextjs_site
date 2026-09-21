# Catalog UX polish (2026-09-18)

Implemented plan `catalog_ux_polish`.

## Dropdown canon
- Site (except header): `Button outline` + `DropdownMenu`, content `min-w-0 w-max`, `modal={false}`.
- Header `LocaleSwitcher` / Links / UserProfile — unchanged (ghost).
- Edge align: `lib/use-edge-menu-align.ts` (midpoint vs viewport → start|end).
- Sort + page size + FacetDropdown all use this canon. Page size no longer Select.
- Lab: `components/dev/ui-lab-dropdown-canon.tsx` in overlays section.

## Filter chrome
- Folders & fields: always `variant="outline"`; selected = stronger `border-primary` + label text, never fill.
- Folders: semibold + chevron + indent. Fields: `font-normal`.
- Sidebar: stretch `items-stretch`, Card `h-full flex flex-col`, body `.app-scroll`.
- `FILTER_SCROLL_CLASS` = `"app-scroll"` (no longer hides scrollbar).

## Range + slider
- shadcn `components/ui/slider.tsx` (dual thumb).
- `PublicFilterFacet.minBound/maxBound` from ProductSpec aggregates (folder subtree → site-wide fallback).
- Lab year demo: 2015–2024.

## Perf / grid
- `unstable_cache` 60s on `fetchAllProducts` + `fetchPublicFilterSchema`.
- Suspense fallback `null` (no skeleton flash); all catalog URL updates use `startTransition`.
- Grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` + fade-in on cards.

## Scrollbar
- `app/globals.css`: thin scrollbar on `html` + `.app-scroll` (Firefox + webkit).
- Lab sample in dropdown canon panel.
