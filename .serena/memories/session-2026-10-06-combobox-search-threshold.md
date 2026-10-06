# Combobox search threshold fix (2026-10-06)

## Bug
Option editor `ParentSelect` forced `searchable` → search UI always shown (even 5 brands) and felt broken inside Dialog.

## Canon (unchanged)
`SHEET_COMBOBOX_SEARCH_MIN = 10` in `searchable-entity-picker.tsx`.
- Omit `searchable` → auto show iff `options.length >= 10`.
- `searchable={false}` for short enums.
- Plain `Input` + `Command shouldFilter={false}` + `Popover modal={false}` (not CommandInput).

## Fixes
- `option-editor` ParentSelect: removed forced `searchable` (auto).
- `CatalogMenuSelect`: default no longer `false`; omitted → auto threshold.
- Explicit `searchable={false}`: status, availability, currency, role, field type, sheetWidth.
- Picker search Input: `onPointerDown` stopPropagation (Dialog/Sheet traps).

Related: `mem:session-2026-09-21-sheet-field-combobox-canon`.
