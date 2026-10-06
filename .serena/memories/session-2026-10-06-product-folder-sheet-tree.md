# Product folder in Sheet = tree (2026-10-06)

## Bug
After switching ProductFolderPicker to `variant="menu"`, cascade inside product Sheet was not usable: Radix DropdownMenu Sub hover/click is flaky when Sheet sets `body { pointer-events: none }`.

## Rule
- **CMS page** (`TemplateFolderPicker`): `menu` (hover submenus) — OK outside Sheet.
- **Product Sheet + move Dialog**: `variant="tree"` — Popover + `CascadePanels` columns (hover expands, click selects). Verified: open → Контейнеровози click → trigger `Вантажні авто / Контейнеровози`.

Related: `mem:session-2026-10-06-product-folder-cascade-menu`, `mem:session-2026-09-21-cascade-variant-restore`.
