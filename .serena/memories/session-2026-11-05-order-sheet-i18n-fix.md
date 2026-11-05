## Order Sheet i18n fix (2026-11-05)

Screenshot showed raw `AccountCabinet.statusNew` / `AccountCabinet.kindCatalog`.

**Cause:** labels live under namespace `Orders` (same as `account-orders-view`), but Sheet used `useTranslations("AccountCabinet")`.

**Fix:** `order-added-sheet.tsx` → `tOrders("statusNew"|"kindCatalog")`.
Also `Product.orderConfirmHint` uk/en/de: vehicle → product/товар/Artikel (domain: Product not vehicle).