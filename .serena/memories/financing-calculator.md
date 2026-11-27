# Financing calculator

**Date:** 2026-11-24

## Math

`lib/finance/financing-quote.ts` is pure (no server imports).

- Credit: annuity. Rate 0 → principal / months.
- Lease: depreciation `(principal − residual) / months` plus rent charge `(principal + residual) * APR / 2400`. Residual is a percent of the financed price.
- Monthly amounts are rounded to whole units.
- Card and buy-box «від» = `lowerDefaultMonthly` (the cheaper of the two default quotes).

## Base and currency

- No separate financing currency. Main currency, SINGLE/STACKED, and CODE/SYMBOL come from «Як показувати ціну».
- Principal is the gross price in the buyer main currency when taxes are on and the rate is above 0, even if the big price is excl. VAT and even if VAT rows are hidden.
- Taxes off or rate 0: finance the price as entered. Do not add VAT again on the installment.
- `FinancingOffer.lines[0]` is the main currency (`perMain` 1). Later lines are stacked extras; the client multiplies the monthly by `perMain`.

## Storefront

- Offer is built in `lib/finance/resolve-storefront-price.ts` and labeled in `lib/finance/storefront-card-price.ts`.
- Calculator: `components/single-product/financing-calculator.tsx`, section `#financing` (`scroll-mt-24`), placed after `ProductDetailsTabs`.
- Buy-box financing control is one `<button>` (with or without the VAT column) and scrolls to `#financing`.
- Cards get `financingExtraLabels` through `productWithSpecsToCardModel`. Related products must pass `taxonomyNodeId` (and promo) into `resolveStorefrontPriceDisplay`.
- UI Lab canon: `components/dev/ui-lab-pdp.tsx` under the demo details tabs.
- Slider thumbs follow `value.length` (`components/ui/slider.tsx`). Catalog range still passes two values.
- `lib/finance/financing-estimate.ts` only re-exports the new helpers. The old `amount/51` stub is gone.

## Admin

- «Податки» is one section. `vatEnabled` is the master switch. «Показ сум ПДВ» is nested and uses `vatSumsEnabled` (default true). Turning sums off does not change the rate, the site price, or the financing gross base.
- Presets live on `RootPricing` (credit and lease). `saveRootFinancing` / `saveRootFinancingAction` write only financing columns and do not touch VAT. ALL scope updates every root.
- Schema was pushed to `mtruck_nextjs` (Prisma `db push`). Do not print the database URL or password.
