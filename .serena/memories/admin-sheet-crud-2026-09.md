# Admin create/edit via right Sheet — 2026-09-11

## Products
- Create: `/admin/products?create=1` (як було).
- Edit: `/admin/products?edit=<id>&node=` — правий Sheet, не окрема сторінка.
- Старий `/admin/products/[id]/edit` редіректить на `?edit=`.
- `updateProductAction` пише folder/status/availability/specs і опційно нові фото (cover лишається).
- У таблиці лише олівець (відкриває sheet).

## Orders
- Create/edit уже були Sheet.
- У таблиці лише олівець.

## Delete
- У edit-sheet справа від «Зберегти»: outline destructive «Видалити».
- `SheetFormActions` + hidden sibling form (`form="delete-…-form"`).
- На create-sheet delete немає.
