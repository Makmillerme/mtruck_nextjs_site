# Sheet field combobox canon (2026-09-21, search rules 2026-09-22)

## Canon chrome
All sheet dropdowns: `Button outline` + `h-11` + `role=combobox` + `LuChevronsUpDown` (`lib/ui/sheet-field.ts`).

## Search policy
- Same chrome; search is optional.
- **Auto** (default when `searchable` omitted): show search iff `options.length >= SHEET_COMBOBOX_SEARCH_MIN` (10) — `SearchableEntityPicker`.
- **No search** (`CatalogMenuSelect` default `searchable={false}`): status, availability, currency, sheetWidth, field type, role.
- Folder: `CascadeSelect` tree — no cmdk search.
- While query is non-empty, clear-row is hidden so empty state is visible.

## Search fix (2026-09-22)
- Root cause of gray/dead search: `Popover modal` nested in Sheet + cmdk `CommandInput` focus trap.
- Fix: `modal={false}` + plain `Input` (not CommandInput) with controlled filter; `Command shouldFilter={false}`.

## UI Lab
Overlays → Sheet fields (`ui-lab-sheet-fields.tsx`).
