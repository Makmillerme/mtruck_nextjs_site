## Product card financing estimate (2026-11-23)

When `RootPricing.financingEnabled`, catalog cards show under the price stack (right-aligned):
- mono eyebrow `financingFrom`
- `financingPerMonth` with shared `estimateMonthlyFinancing(amount/51)` from `lib/finance/financing-estimate.ts`

Wired via `StorefrontPriceDisplay.financingLabel|AmountLabel` filled in `resolveStorefrontPriceDisplay`, passed through `product-to-card` → `CardPriceBlock`. VAT still PDP-only.

Related: `mem:product-card-currency-stack-2026-11-23`, `mem:finance-autosave-financing-ui-editor-2026-11-23`.