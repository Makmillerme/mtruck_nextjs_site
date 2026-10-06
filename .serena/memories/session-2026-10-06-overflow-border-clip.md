# Overflow border clip + dual date UX (2026-10-06)

## Dual date UX (intentional)
- **Catalog / finder ranges** (рік, пробіг, потужність): `RangeFacet` — manual from/to digits + slider. Not calendar.
- **CRM / sales period**: `SheetDateField` — outline combobox + LuCalendar + Popover calendar. Value YYYY-MM-DD.
- Documented in `ui-lab-sheet-fields.tsx` + comment on `RangeFacet`.

## Bug
Full-width Input/Button borders (and rings) clipped by `overflow-hidden` / `overflow-y-auto` ancestors when controls sit flush to the scrollport. Catalog sidebar also had broken flex contain: footer overlapped scroll body (disabled Apply `pointer-events-none` let clicks fall through).

## Fix
Shared (`lib/ui/sheet-field.ts`):
- `overflowFieldGutterClassName` = `p-px`
- `sheetScrollBodyClassName` = `min-h-0 flex-1 overflow-x-clip overflow-y-auto p-px`

Applied to:
- `CatalogFilterFields` (desktop sidebar + mobile sheet + admin products filter)
- `CatalogFilterSidebar` Card: `overflow-hidden`
- `CatalogFilterSheet` body: `overflow-hidden`
- Accordion panel inner: `p-px` gutter (`catalog-filter-tree.tsx`)
- `AdminFilterSheet` + `SalesFilterFields`
- `Sheet` primitive: `overflow-x-clip overflow-y-auto`
- UI Lab catalog filter demo parity

## Verify
- `/products`: expand leaf → Рік Від focusable; Apply at bottom (y below facets), no overlap.
- `/admin/sales` Filter: SheetDateField period + amount inputs.
