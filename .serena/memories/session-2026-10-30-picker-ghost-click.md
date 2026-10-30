# SearchableEntityPicker ghost click → PDP — 2026-10-30

## Symptom
Admin product create: choosing make/model navigates to `/products/{id}` (table row link under the sheet).

## Cause
Popover/cmdk closes on `onSelect` before mouseup; click falls through to `Link href=/products/${id}` in products table. Filter `FacetDropdown` already used `onMouseDown preventDefault`; picker did not.

## Fix (`searchable-entity-picker.tsx`)
- `onMouseDown={(e) => e.preventDefault()}` on clear + option `CommandItem`
- Search input: `Enter` → `preventDefault` so form does not submit

The huge React tree dump with `data-cursor-ref` is Cursor overlay / hydration noise, not the navigation bug.
