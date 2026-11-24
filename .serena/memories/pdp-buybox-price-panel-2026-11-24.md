# PDP buy-box price panel (2026-11-24)

## Layout canon
One card `rounded-sm border bg-card p-5 sm:p-6`:
1. **VAT on:** top — hero (left) | VatBreakdown (right); FinancingPanel under `border-t`.
2. **VAT off:** hero | FinancingPanel.
3. Mobile VAT: stack hero → VAT → financing.

## Details
- Hero extras: `w-fit justify-items-end text-right` (align to main price right edge); with VAT column `sm:justify-end`.
- FinancingPanel: `items-center` icon; no hint; outline Button `financingCalcLabel` (Розрахувати) on the right.
i18n `Product.financingCalculate` uk/en/de.
