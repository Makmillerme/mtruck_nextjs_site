# Admin products — dynamic table columns (2026-09)

## Goal
Sheet and admin products table show CMS-created fields only (no hardcoded company/status/price columns in the table).

## Table columns
- Always: **Назва** + **Дії**
- Dynamic: catalog attributes from `fetchRootCatalogAttributes()` (all attributes under active root taxonomy trees, unique by `key`)
- Toolbar button **Колонки** → Sheet with checkboxes for every root-catalog field
- Prefs in `localStorage` key `mtruck.admin.products.visibleColumns` (array of attribute keys)
- Select all / clear all in the picker
- Cell values via `lib/catalog/spec-display.ts` `formatSpecCell`; match spec by `attributeId` then `attributeKey`

## Data
- `fetchAdminProducts` includes `specs.option.label` and `specs.attribute` (key, name, type, unit)
- Page maps `optionLabel`, `attributeKey`, `unit`, `type` into `AdminProductRow.specs`
- `tableAttributes` passed from page alongside sheet `attributes` (folder-scoped for create/edit)

## Product sheet
- Removed visible **company** FormInput; hidden `company` keeps Zod + identity fill (`companyFromIdentity` from specs)
- System fields remain: folder, status, availability, name (or display-group), price, images, description, featured
- Specs: `ProductSpecFields` from CMS attributes for selected folder

## UI plumbing
- `AdminListToolbar` optional `toolbarActions` slot (columns button before create)

## i18n
Admin keys: `columns`, `columnsSheetTitle`, `columnsSheetLede`, `columnsEmpty`, `columnsSelectAll`, `columnsClear`, `columnsYes`, `columnsEmptyCell`; search placeholder updated (uk/en/de).
