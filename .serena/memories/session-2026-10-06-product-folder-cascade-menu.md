# Product folder picker = CMS cascade menu (2026-10-06)

## Why it looked different
`ProductFolderPicker` and product move `CascadeSelect` forced `variant="tree"` (Popover nested panels), while CMS `TemplateFolderPicker` used default `variant="menu"` (DropdownMenu hover submenus → Комерційна техніка → Вантажні авто → …).

Historical note: 2026-09-21 kept tree for Sheets (Sub flaky); 2026-09-29 already intended menu parity — tree slipped back.

## Fix
- Removed `variant="tree"` from `product-folder-picker.tsx` and move Dialog in `admin-products-view.tsx`.
- Default remains `menu`. `tree` only in UI Lab sheet demo (`ui-lab-sheet-fields.tsx`).

Related: `mem:cascade-folder-select-2026-09`, `mem:session-2026-09-29-depends-placeholder-cascade-menu`.
