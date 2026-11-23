# Finance audit fixes 2026-11-23

## P2 getter is read-only
`getFinanceSettings` in `lib/finance/settings.ts` only `findUnique` + `mapFinanceSettings`. It does not update `Currency` or `FinanceSettings`.
Site stays equal to base inside `updateFinanceSettings` in `lib/finance/currencies.ts` (write path). Existing row was already aligned (`site === base`).

## P1 catalog price context is one request
`loadTaxonomyParentIndex` loads `{id, parentId}` once per request (`React.cache`). `rootIdFromParentIndex` walks parents in memory. `resolveTaxonomyRootId` uses that map.
`getRootPricingForProductNode` reads `listRootPricing()` (one cached query) instead of `findUnique` per root. Unused `getRootPricing` removed.
`buildStorefrontPriceDisplay` uses `loadStorefrontPriceContext`: settings, rates, currencies, all root pricing, and the parent map once, then each product looks up its root in memory. Grid, list, account, and PDP share that cache inside one request.

## Client boundary
Product form formats promo via `lib/finance/promo-format.ts`. `promo.ts`, `vat.ts`, and `root-pricing.ts` stay on the server (`resolve-storefront-price.ts`, actions, admin page, navbar server component).

## P0 EBUSY
`lib/finance/promo.ts` was locked while Tailwind scanned it; `/admin` returned 500. Dev server was restarted after the file became readable. Do not import `promo.ts` from client components.
