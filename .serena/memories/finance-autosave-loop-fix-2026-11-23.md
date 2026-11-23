## Financing autosave infinite loop fix (2026-11-23)

**Bug:** `FinanceFinancingView` effect watched `enabled` + hydrate effect watched `pricingByRoot`. After save → `router.refresh()` → new props → hydrate set `hydrating` and raced with save effect overwriting `lastSaved` → another POST forever.

**Fix:** Imperative save only on Switch `onCheckedChange` / scope change (same idea as currencies). No effect-driven persist.

**Pricing:** hydrate effect deps reduced to `[scope]` only so refresh does not re-enter autosave.

Related: `mem:finance-autosave-financing-ui-editor-2026-11-23`.