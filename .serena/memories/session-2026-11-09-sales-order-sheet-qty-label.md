# Sales edit order sheet — qty label (2026-11-09)

## Layout audit (390px)
- Sheet canon OK: left 72px peek, width ~318, safe-area pt 32 / pb 24.
- SheetFormActions: Зберегти + Архівувати `w-full` (~352px).

## Bug fixed
OrderFormFields used `Orders.products` = «Авто» next to Admin.vehicle = «Авто» → duplicate labels; qty field showed as second «Авто» with value `1`.
- Now `Admin.productsCount` = «Кількість» / Quantity / Anzahl (uk/en/de).
- File: `components/admin/sales/admin-sales-view.tsx` OrderFormFields CatalogField name=products.
