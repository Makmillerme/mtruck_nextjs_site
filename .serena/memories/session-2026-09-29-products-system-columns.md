# Admin products system columns picker (2026-09-29)

Columns sheet now lists **system** columns first, then CMS attributes.

## System columns (toggleable)
`status`, `availability`, `price`, `featured`, `company`

Always fixed: **Назва** + **Дії**.

## Prefs
- Attributes: `mtruck.admin.products.visibleColumns`
- System: `mtruck.admin.products.visibleSystemColumns` (JSON array of ids)
- Migrates legacy `showStatusColumn` (`0`/`1`) once if system key missing

## Select all / Clear
Affects both system + catalog keys.

## Cells
- status → ProductStatusBadge
- availability → i18n stock/transit
- price → formatCurrency(locale, product.currency)
- featured → Так / —
- company → text or —

File: `components/admin/products/admin-products-view.tsx`