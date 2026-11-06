# Order-added sheet: favorites + delete (ordered mode)

**Date:** 2026-11-06

When `mode === ordered`, `AccountOrderLine` shows favorites + delete under title/price (same footer as account orders). Qty stepper still only if `allowsQuantity` (non-unique).

- `toggleFavoriteAction` returns `favoriteId` on ActionState; line calls `onFavoriteChange`.
- Delete → `deleteUserOrderAction`, clear flash cookie, `onDeleted` → `justAdded=false`, `router.refresh()`.
- `CatalogOrderProvider` passes `favoriteId` from PDP.

Files: `order-added-sheet.tsx`, `product-order-cta.tsx`, `account-order-line.tsx`, `utils/types.ts`, `utils/actions.ts`, PDP page.