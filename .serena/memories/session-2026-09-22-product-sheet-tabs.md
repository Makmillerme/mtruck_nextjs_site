# Product sheet tabs (2026-09-22)

## UX
- Removed create/edit `SheetDescription` ledes.
- `ProductSheetFields`: framed `Tabs` — **Головна** (folder, status, availability, gallery, name, price, description) / **Характеристики** (`ProductSpecFields`).
- Both `TabsContent` use `forceMount` + `data-[state=inactive]:hidden` so spec inputs still submit and name-template sync works.
- No folder → specs tab shows `CatalogAdmin.productSpecsNeedFolder` («Оберіть папку каталогу.»).
- Folder without fields → `noOwnFields`.
- `ProductSpecFields` gained `showHeading` (false in sheet tabs).

## i18n Admin
- `sheetTabMain` / `sheetTabSpecs` (uk/en/de).

## Git
- Checkpoint before this: `5102b54` pushed to origin/main.
