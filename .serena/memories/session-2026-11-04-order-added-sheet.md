## Order-added Sheet (фаза 1) — 2026-11-04

### Mental model
- **Замовлення (`/account?tab=orders`) = кошик** (інша назва). Не furniture-cart / Stripe.

### Flow
1. PDP «Замовити товар» → `createCatalogOrderAction` створює CATALOG Order (NEW), **без redirect**.
2. Returns `{ ok: true, orderId, message: '' }` → `RequestCatalogOrder` відкриває `OrderAddedSheet`.
3. Sheet: Скасувати = лише close (order лишається); Оформити → `/account?tab=orders`.
4. Якщо вже open order: CTA `Product.goToOrders` («Перейти до замовлень») → той самий href.

### Files
- `components/single-product/order-added-sheet.tsx`
- `components/single-product/RequestCatalogOrder.tsx`
- UI Lab: `order-added-sheet` / `ui-lab-order-added-sheet.tsx`
- Action: `createCatalogOrderAction` in `utils/actions.ts`
- ActionState: optional `orderId`

### Backlog
- Сторінка оформлення (рахунок / кредит-лізинг)
- Розширений контент Sheet (upsell)

### i18n Product
- goToOrders, orderAddedTitle, orderAddedCancel, orderAddedCheckout (uk/en/de)