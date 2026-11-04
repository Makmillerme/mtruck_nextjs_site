# Search by article / productCode (2026-11-03)

**Article ≠ UUID.** Public SKU is `Product.productCode` — unique 5-digit code (`lib/codes.ts`). PDP shows it as «Артикул: {code}».

## Fix
- Admin list search haystack now includes `productCode` (+ MULTI_SELECT `optionLabels`).
- `AdminProductRowDTO` / mappers expose `productCode`.
- Public catalog `catalogTextSearchClause` in `lib/catalog/public-filter.ts`: OR on `name` + `productCode` (used by `productWhereForLeaf` + `catalogQueryToWhere`).
- Placeholders uk/en/de mention артикул / SKU / Art.-Nr.

UUID `id` is still the URL key (`/products/[id]`), not the article.
