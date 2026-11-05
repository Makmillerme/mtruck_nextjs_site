## Order-added Sheet not showing — root cause

After `createCatalogOrderAction`, Next.js soft-refreshes the PDP. `CatalogOrderProvider` on the product page remounted and wiped `sheetOpen` before paint. CTA became «Перейти до замовлень»; Sheet never visible.

## Fix

- `OrderAddedSheetProvider` in `app/providers.tsx` (layout-stable, like `CtaInquiryProvider`).
- On success (and cookie flash restore) call `useOrderAddedSheet().open(product)`.
- SheetContent blocks outside-dismiss (`preventDefault` on pointer/interact outside).
- Flash cookie `mtruck-order-added` as backup when onSuccess loses the remount race.
- Do not `revalidatePath` the product page from the create action.

## Verify

Order a product without an open order → Sheet stays open after soft refresh.