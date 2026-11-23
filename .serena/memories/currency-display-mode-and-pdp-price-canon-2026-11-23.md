## Currency display + PDP price canon (2026-11-23)

1. **Removed** storefront mode captions under main price (`ВАРТІСТЬ` / з ПДВ / без ПДВ). `resolveStorefrontPriceDisplay` keeps `priceHint` only for `rateMissing`. Buy-box no longer accepts/renders `priceHint` or `vatCurrenciesDiffer`.

2. **FinanceSettings.currencyDisplayMode** enum `CODE | SYMBOL` (default CODE). Admin → Валюти → under main currency: select «Літерами (USD)» vs «Значками ($)». Autosave via `updateFinanceSettingsAction`. `formatProductPrice(..., displayMode)` uses Intl `currencyDisplay: code|symbol`. Storefront resolve + cards + PDP pass the mode.

3. Extra currency lines under main price: **text-right** (left price column right-aligned when extras or VAT layout).

Related: `mem:pdp-extra-currencies-under-main-2026-11-23`, `mem:finance-currencies-v1-2026-11-09`.