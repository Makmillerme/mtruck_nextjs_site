# Cascade folder select (2026-09)

## Component
- `components/form/cascade-select.tsx` — tree `{ id, label, children }[]`
- Trigger: `Button outline`, `w-full max-w-sm` (not full content width)
- Content: `w-max min-w-[10rem] max-w-sm` (not forced to trigger width)
- Path label in trigger: `Parent / Child / …`

## Interaction
- **Hover** on `DropdownMenuSubTrigger` → Radix opens submenu (children only)
- **Click** on parent `SubTrigger` → `onClick` + `preventDefault` → select that folder and close (no duplicate parent row inside `SubContent`)
- Leaf → `DropdownMenuItem` `onSelect` + `preventDefault` → select
- Do **not** add parent as first item in submenu

## CMS fields tab
- `app/[locale]/admin/catalog/page.tsx`: vertical stack — `TemplateFolderPicker` above `FieldsPanel` (no side-by-side tree pick)
- No card title «Папка шаблону» around the picker
- Empty: `pickFolderLede` = «Оберіть папку вище…» (uk/en/de)
- `TemplateFolderPicker` → `router.push(/admin/catalog?tab=fields&node=id)`
- Products: `ProductFolderPicker` same CascadeSelect + `tree` prop

## Helpers
- `taxonomyToCascadeItems` in `lib/catalog/taxonomy.ts`
- UI Lab: `#cascade` / `components/dev/ui-lab-cascade.tsx`

## Note
- Browser automation a11y click may not fire React `onClick` on SubTrigger; real mouse click / `MouseEvent` does.