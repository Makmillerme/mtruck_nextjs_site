# Admin sheets + catalog bugfix (2026-09-21)

## Shipped
1. **Products sheet without RSC** — `admin-products-view.tsx` uses local `sheetCreateOpen` / `sheetEditId` / `folderNodeId` + `history.replaceState` (no `router.replace` on open/close/folder). Attributes via `loadProductSheetMetaAction` (`lib/catalog/product-sheet-meta.ts`).
2. **Folder picker** — `CascadeSelect` `modal={false}`; optimistic local `taxonomyNodeId`.
3. **Lab selects** — `CatalogMenuSelect` in `catalog-fields.tsx` (DropdownMenuRadio + hidden input) for status/availability.
4. **Status column** — badge colors + Columns toggle (`STATUS_COLUMN_STORAGE_KEY`).
5. **Order vehicle search** — `SearchableEntityPicker` `Popover modal={false}`; Sheet `isFloatingLayer` also matches popover/cmdk/listbox.
6. **Mobile filter** — controlled Sheet + `onApplied` closes after Apply.
7. **sheetWidth** — HALF=`col-span-3`, THIRD=`col-span-2` (no `sm:`).

## Verify
- Open/close create: no `GET ?create=1` storms.
- Pick folder → specs load; create product works.
- Status visible in table; Columns can hide it.
- Sales create: vehicle search selects.
- Mobile filter Apply closes sheet.
