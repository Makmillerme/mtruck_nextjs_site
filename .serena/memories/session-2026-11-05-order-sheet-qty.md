# Order sheet qty stepper (2026-11-05)

When root `productsAreUnique` is **false**, OrderAddedSheet shows the same AccountOrderLine qty stepper as /account orders.

## Flow
- PDP: `resolveProductsAreUnique` → `allowsQuantity={!unique}` into `CatalogOrderProvider`
- Also passes `openOrderId` / `openOrderQuantity` from `fetchOpenCatalogOrderForProduct` (now selects `products`)
- Sheet local qty; confirm submits hidden `quantity`; create action clamps via unique + `ORDER_QUANTITY_MAX`
- Ordered mode: qty change calls `updateCatalogOrderQuantityAction` when `orderId` known
- Lab demo: `allowsQuantity: true`

## Files
- `components/single-product/order-added-sheet.tsx`
- `components/single-product/product-order-cta.tsx`
- `app/[locale]/products/[id]/page.tsx`
- `utils/actions.ts` (create + fetchOpen)
- `components/dev/ui-lab-order-added-sheet.tsx`
