# Product sheet specs mobile stack (2026-11-09)

Characteristics tab in create/edit product sheet:
- Below `md`: `grid-cols-1`, every field `col-span-1` — ignore `sheetWidth` (no HALF/THIRD side-by-side crush).
- From `md+`: `grid-cols-6` + `md:col-span-6|3|2` as before.

Files:
- `components/admin/catalog/product-spec-fields.tsx` (`sheetWidthClass` + grid container)
- `lib/catalog/sheet-layout.ts` (`SHEET_WIDTH_CLASS` synced; packing order unchanged)

Tailwind literals stay in components/ for JIT.