# Storefront Pricing vs FX base (2026-11-24)

## Roles
- **Currencies tab** (`FinanceSettings.baseCurrencyCode` + `Currency.rateToBase`): technical FX anchor. Base quote is always 1.
- **Pricing tab** (`RootPricing.mainCurrencyCode` + `displayMode` + `extraCurrencyCodes`): buyer-facing display. May be UAH while base is USD.

## Bug symptom
Cards showed USD while Pricing said main=UAH / STACKED + extra USD. Not an override by base currency — `buildStorefrontPriceDisplay` already targets `mainCurrencyCode`. Conversion USD→UAH failed because `UAH.rateToBase` was null, then silent fallback to product currency (USD).

## Fixes
- Resolve: never treat FX base as successful main; keep `rateMissing` when main FX fails; still build VAT/extras that can convert; use VAT-aware `primaryAmount` on fallback.
- Cards: render `priceHint` under the price.
- Pricing UI: amber warning when main/extras lack rate vs base (`pricingRateMissingWarning`).
- Help copy: Currencies = anchor; Pricing = buyer display.
- Admin product default currency: `vatConfig.mainCurrencyCode` before site/base.

## Operator step
To show UAH on the storefront for USD-priced products: set UAH rate on Currencies (units of UAH per 1 USD). Without a rate, display cannot invent UAH amounts.