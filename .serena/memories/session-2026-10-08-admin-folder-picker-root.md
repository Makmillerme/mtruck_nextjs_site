# Admin product folder picker — drop move button, keep ?root= (2026-10-08)

## Why root selection vanished after save
`createProductAction` / `updateProductAction` always `redirectLocalized('/admin/products')` with **no query**. Sidebar `?root=` was lost → `listRootId` undefined → folder combobox used **full tree** (path includes root name like «Техніка / …») and «Товари» looked selected.

## Fix
- Hidden `listRootId` on create/edit forms.
- `adminProductsReturnHref(formData)` → `/admin/products?root=<uuid>` when valid UUID; else `/admin/products`.
- Widened `redirectLocalized` href union with `` `/admin/products?${string}` ``.

## Move button removed
Scoped (and unscoped) `ProductFolderPicker` / CascadeSelect already changes `taxonomyNodeId`. Redundant outline «Перенести в інший каталог» dialog + i18n keys removed. `trailing` prop removed from picker.

## Scoped path label
Under `?root=`, `pickerTree = getRootChildren(tree, listRootId)` — label is relative (no root segment). Restored when root survives redirect.

## Cross-root move
Only from «Товари» (no root) where picker shows full tree. Intentional after removing move dialog.