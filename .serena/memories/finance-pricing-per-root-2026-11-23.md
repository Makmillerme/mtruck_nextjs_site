## Pricing per root category (2026-11-23)

### Schema
- Enums: `PriceEntryMode` (INCL_VAT|EXCL_VAT), `PriceDisplayMode` (SINGLE|STACKED), `PromoKind` (AMOUNT|PERCENT).
- `RootPricing` 1:1 with root `TaxonomyNode`; `RootPricingCurrency` for STACKED extras.
- `Product.promoKind` + `promoValue` Decimal(18,4).
- `prisma db push` done. Client generate may need restart of `npm run dev` if EPERM on query engine DLL.

### Admin
- Finance tabs: currencies | pricing | financing (taxes removed; `?tab=taxes` → pricing).
- Panel: `finance-pricing-panel.tsx` + `finance-pricing-view.tsx` — scope root or ALL, entry mode, VAT %, three display flags, SINGLE/STACKED, main currency, optional header switch (SINGLE only), extra currency checkboxes (STACKED).
- Buyer switch removed from currencies tab; navbar uses `anyRootAllowsBuyerSwitch()`.

### Product field
- `PriceInput`: label from entry mode (Вартість з/без ПДВ), optional promo field; `promo-format.ts` is client-safe (no Prisma).
- Create/update parse promo via `parsePromoInput` (`%` → percent).

### Storefront
- `buildStorefrontPriceDisplay` / `resolveStorefrontPriceDisplay` → main line, struck promo, extra/VAT lines.
- Card + buy-box render struck + secondary lines.

No commit.
