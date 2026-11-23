## Finance autosave + financing root + UI editor autosave (2026-11-23)

1. **Pricing tab** (`finance-pricing-view`): no Save button; debounced autosave (~350ms) via `upsertRootPricingAction` + save chain. Hydration skip on scope change.

2. **Currencies**: removed «N у довіднику»; `currencyDisplayMode` moved to top row beside Add button.

3. **UI Editor**: card-preview + product-page editors autosave (~400ms), Save buttons removed.

4. **Financing tab**: real panel (not stub). Root scope (ALL or one root) + `financingEnabled` switch (autosave). Schema: `RootPricing.financingEnabled` default true. PDP hides financing block when false. Pricing upsert does not overwrite financingEnabled.

Related: `mem:finance-settings-autosave-delete-price-2026-11-23`, `mem:explore-price-financing-2026-11-09`.