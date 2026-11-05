## Order confirm Sheet (2026-11-05)

### Flow
1. PDP «Замовити товар» opens Sheet instantly (no POST).
2. Confirm mode: title only (no SheetDescription hint); card actions Скасувати | Створити. Cancel/X/overlay = no DB.
3. Create on card → `createCatalogOrderAction` → Sheet mutates to ordered; PDP CTA → «Оформити замовлення».
4. Ordered / revisit: CTA opens Sheet ordered (Усі замовлення | Оформити → `/account?tab=orders`).

### UI
- Sheet product card = **AccountOrderLine** (same as `/account?tab=orders`; UI Lab `account-orders`).
- Actions under the line (Dialog footer sizes). Catalog grid card is separate surface; do not copy it into Sheet.
- Sheet width: primitive canon (`sm:max-w-lg`).
- Host: `OrderAddedSheetProvider` in `app/providers.tsx`.
- Close on pathname change + Link click («Усі замовлення» / «Оформити») — layout host otherwise keeps Sheet open after soft nav.

### Files
- `components/single-product/order-added-sheet.tsx`
- `components/single-product/product-order-cta.tsx`
- PDP payload: subtitle + facts from `page.tsx`
- UI Lab: confirm + ordered demos
- i18n Product: checkoutOrder, createOrder, allOrders, orderConfirm*, orderInCart*

### Lab note
`productId` starting with `demo-` skips real POST and only flips mode.