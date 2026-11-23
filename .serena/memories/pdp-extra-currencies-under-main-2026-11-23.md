## Extra currencies under main price (2026-11-23)

STACKED `extra` lines must sit under the main price (smaller than hero: `text-base`/`lg:text-lg`, but `font-bold`). They must NOT enter the VAT column.

- `ProductBuyBox`: prop `extraPriceLines: string[]`; `priceLines` = VAT only (`net`/`gross`/`vat`). `hasVatBreakdown` ignores extras — extras alone no longer open the two-column VAT layout.
- PDP `page.tsx`: splits `extra` vs VAT before pass-through.
- Product card: extras first under main (`text-sm font-bold`), then VAT lines muted.
- UI Lab PDP demo includes sample extras.

Related: `mem:pdp-buybox-vat-financing-layout-2026-11-23`, `mem:finance-main-and-additional-2026-11-23`.