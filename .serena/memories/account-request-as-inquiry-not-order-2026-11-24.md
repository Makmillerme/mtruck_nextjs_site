# Account «Запит на товар» = заявка, не order card (2026-11-24)

## Product
- Cabinet CTA must **not** create an `Order` / order card.
- Submit creates `CallbackInquiry` (phone + note) → admin **Продажі → Заявки** (`/admin/sales/inquiries`).
- Staff realtime: `publishInquiryCreated` (not `publishOrderRequestCreated`).

## Code
- `createUserRequestOrderAction` in `utils/actions.ts` — inquiry create; name kept for FormContainer wiring.
- `fetchUserOrders` — `kind: 'CATALOG'` only (legacy REQUEST rows hidden from cabinet).
- Dialog UI unchanged (`account-orders-view.tsx`).

## Legacy
- `Order.kind = REQUEST` still exists for old rows / sales filters / vehicle-request notif helpers; new account CTA no longer writes them.
