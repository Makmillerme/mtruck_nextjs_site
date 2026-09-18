# Display groups + auto product sheet (2026-09-14)

## Models
- `SheetWidth` enum: FULL | HALF | THIRD on `AttributeDefinition.sheetWidth` (default FULL).
- `DisplayGroup` on folder: key, name, separator, writesProductName, sortOrder.
- `DisplayGroupMember`: ordered attribute refs (Cascade delete with attribute/group).

## Resolve
- `lib/catalog/display-group.ts`: join member values (option label / text / number+unit / year); skip empty.
- If group has `writesProductName`, `createProductAction` / `updateProductAction` set `Product.name` from the composed string (does not wipe when empty).
- Product sheet: when a writer group exists for the folder, name input is preview + hidden fallback.

## Sheet layout
- `lib/catalog/sheet-layout.ts` packer budget 6: FULL=6, HALF=3, THIRD=2.
- `ProductSpecFields` uses `grid-cols-6 gap-6` + span classes.

## CMS
- Field create/edit: sheet width select.
- `DisplayGroupsPanel` under fields: CRUD + ordered member picker.
- Fetch: `fetchDisplayGroupsForNode` / `resolveDisplayGroupsByKey` (inheritance like attributes).
