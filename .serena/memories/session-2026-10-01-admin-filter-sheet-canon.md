# Admin filter sheet canon (2026-10-01)

## Problem
Facet controls (Євронорма, КПП, …) felt inactive: (1) closed accordion kept ghost facets with pointer-events-none / under footer overlap; (2) chrome was DropdownMenu h-10, not admin sheet combobox.

## Fix
- `FacetDropdown` → `Popover modal={false}` + `sheetFieldTriggerClassName` (h-11) + `LuChevronsUpDown` + Command multi-select (search if ≥10). `onMouseDown preventDefault` keeps menu open.
- `RangeFacet` inputs → h-11.
- `AdminFilterSheet` → default `SheetContent` padding (`gap-4 overflow-hidden`), no custom `p-0`.
- Closed accordion panels: `inert` instead of only `pointer-events-none`.
- Filter footer: h-11 + border-t separator; scroll body `pb-2`.

## Files
- `components/products/catalog-filter-tree.tsx`
- `components/products/catalog-filters.tsx`
- `components/admin/admin-list-toolbar.tsx`
