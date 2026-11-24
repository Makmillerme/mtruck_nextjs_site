# Finance Pricing VAT UI (2026-11-24)

## Labels
- Entry + storefront options: unified «З ПДВ» / «Без ПДВ» (no «Вартість»).
- `storefrontPriceMode` → «Основна вартість на сайті».
- `pricingDisplayTitle` → «Як показувати ціну на сайті».
- `vatDisplayTitle` → «Показ сум ПДВ».

## Layout
1. **Вартість і ПДВ** — entry mode, storefront mode, rate (only when `vatEnabled`).
2. **Показ сум ПДВ** — `vatEnabled` switch + checkboxes `showPriceWithVat|Without|VatAmount` + VAT currency.
3. **Як показувати ціну на сайті** — display mode / main currency / extras.

## Persistence
Autosave sends real `show*` from draft (was hardcoding false). `upsertOne` stores `input.show*` gated by `vatEnabled` (no longer derived from storefrontPriceMode).

## Storefront
`buildStorefrontPriceDisplay` pushes net/vat/gross only when the matching `show*` flag is true.

Related: `mem:finance-vat-toggle-display-currency-2026-11-23`.