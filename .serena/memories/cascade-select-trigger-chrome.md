# CascadeSelect trigger chrome (2026-11)

## Issue
On Catalog → Fields, empty `TemplateFolderPicker` («Оберіть категорію») looked duller than UI Editor / filled CascadeSelect triggers.

## Cause
1. Empty state applied `text-muted-foreground` on the whole `Button outline` (not only the label span).
2. Fields picker used default `variant="menu"` (DropdownMenu); UI Editor / ProductFolderPicker use `variant="tree"` (Popover).

## Fix
- `components/form/cascade-select.tsx`: mute only the placeholder `<span>`, keep Button `text-primary` + `border-primary/40`.
- `components/admin/catalog/template-folder-picker.tsx`: `variant="tree"` for parity with ProductFolderPicker and UI Editor card preview.

## Canon
Outline field triggers: `Button variant="outline"` + `sheetFieldTriggerClassName` (`h-11 w-full …`). Border stays `border-primary/40` whether empty or filled.