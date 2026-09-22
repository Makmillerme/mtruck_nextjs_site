# Product price + currency (2026-09-22)

- `Product.currency` enum `USD | EUR | UAH` default USD (`prisma` pushed).
- `PriceInput`: number field without spinners / wheel change; beside it sheet combobox (`CatalogMenuSelect` hideLabel) with symbols `$` `€` `₴`.
- Form field `currency`; zod `productSchema`; AdminProductRow + page map.
- `formatCurrency(amount, locale, currency?)` accepts currency code.
- If `prisma generate` EPERM — stop `next dev`, regenerate, restart.