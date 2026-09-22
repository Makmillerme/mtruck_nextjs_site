# Sheet field combobox canon (2026-09-21, search rules 2026-09-22)

## Canon chrome
All sheet dropdowns: `Button outline` + `h-11` + `role=combobox` + `LuChevronsUpDown` (`lib/ui/sheet-field.ts`).

## Search policy
- Same chrome; search is optional.
- **No search** (`CatalogMenuSelect` default `searchable={false}`): status, availability, currency, sheetWidth, field type, role — short fixed lists.
- **With search** (`SearchableEntityPicker` default `searchable={true}`): product spec SELECT, clients/vehicles, display-group member add.
- Folder: `CascadeSelect` tree — no cmdk search.

## Spec SELECT threshold
- Product sheet specs: `searchable={options.length >= 10}` (`SHEET_COMBOBOX_SEARCH_MIN`).

## Search fix (2026-09-22)
- Root cause of gray/dead search: `Popover modal` nested in Sheet + cmdk `CommandInput` focus trap.
- Fix: `modal={false}` + plain `Input` (not CommandInput) with controlled filter; `text-foreground`; verified in UI Lab and name-settings Dialog (filter «кпп» → only КПП).

## Search fix notes
- Controlled filter: `Command shouldFilter={false}` + local `query` / `filtered` (cmdk default filter inside Sheet was unreliable).
- `Popover modal` + Command `onKeyDown` stopPropagation so Sheet does not swallow typing.

## UI Lab
Overlays → Sheet fields (`ui-lab-sheet-fields.tsx`).