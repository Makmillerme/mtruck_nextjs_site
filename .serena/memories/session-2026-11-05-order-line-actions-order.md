# AccountOrderLine footer order (updated 2026-11-06)

Card footer (`items-end` column):
1. **Qty stepper** (only if `allowsQuantity` / non-unique)
2. **Favorites + delete** under the stepper

Unique products: only favorites/delete row.
File: `components/account/account-order-line.tsx`.