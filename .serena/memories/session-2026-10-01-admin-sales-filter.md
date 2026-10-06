# Admin sales filter sheet (2026-10-01)

## Behavior
`/admin/sales` Filter Sheet — draft + Apply/Clear (`hideFooter`), sheet-field canons.

## Dimensions
- Payment: combobox all/paid/unpaid
- Period: date from/to (`createdAt` YYYY-MM-DD)
- Amount: min/max `orderTotal`
- Kind: all/CATALOG/REQUEST
- Vehicle: all/with/without (`productId`)

## Files
- `components/admin/sales/sales-filter-fields.tsx` — draft type, match, UI
- `components/admin/sales/admin-sales-view.tsx` — applied/draft wiring
- `components/admin/admin-list-toolbar.tsx` — optional `onOpenChange` (sync draft on open)
- i18n Admin keys: filterPeriod/Amount/Kind*/Vehicle*/From/To (uk/en/de)

## Verify
Оплачено → 0 rows + badge 1; Clear → 2; amount min 60000 → 1 row.
