# Account order qty — optimistic (2026-11-05)

## Problem
AccountOrdersView used `quantityAction` + FormContainer + `router.refresh()` on every +/- → full RSC reload.

## Fix
- Local `qtyPatch` (quantity + orderTotal), instant UI + summary
- Debounced persist (~280ms), no refresh on success
- On failure: drop patch + `router.refresh()`

## Flicker on rapid clicks
Root cause: `revalidatePath('/account')` refreshed RSC mid-click + wiping all patches → flash to intermediate number.

Mitigations:
- Soft-reconcile only when server qty === latest desired; never wipe all patches
- Request gen + ignore stale responses
- Stable `unitPriceRef`
- Qty action revalidates only `/admin/sales`, not `/account`

## File
`components/account/account-orders-view.tsx`, `utils/actions.ts` (`updateCatalogOrderQuantityAction`)
