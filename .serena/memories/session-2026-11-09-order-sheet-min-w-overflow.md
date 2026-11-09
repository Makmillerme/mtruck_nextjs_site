# Order sheet mobile overflow vs product sheet (2026-11-09)

## Why product looked fine, order did not
Product sheet fields are short labels (status/folder). Order sheet `SearchableEntityPicker` labels are long (`code · name · email`). Flex/grid default `min-width: auto` let that content widen `SheetContent` past `w-[min(100%-4.5rem,28rem)]`, so the right edge (close X, buttons, fields) clipped off-screen.

## Fix
- `sheet.tsx`: base `min-w-0`; left/right `max-w-[min(100%-4.5rem,28rem)]`
- `sheetFieldTriggerClassName`: `min-w-0 overflow-hidden` (truncate works)
- `SearchableEntityPicker` + sales OrderFormFields / sheet grids: `min-w-0`
