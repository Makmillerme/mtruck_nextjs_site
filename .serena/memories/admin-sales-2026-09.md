# Admin sales + table polish — 2026-09

## Table UI

- `components/ui/table.tsx`: header `bg-secondary/50`, head uppercase tracking, row hover `secondary/40`.
- Dates: `formatDate` = `DD.MM.YYYY` (`uk-UA` 2-digit). Products + sales: same Card/Table, status as `Badge`, vehicle name as `tableLinkClassName`.
- Лічильник завжди **над** таблицею (`p.text-sm text-muted-foreground`), не `TableCaption`.
- UI Lab Table оновлено під цей патерн (Badge статусу, колонка Авто).

## Продажі (`/admin/sales`)

- Таблиця продажів (2026-09-14): без колонки «Тип»; у «Статус» лише оплата (Оплачено / Не оплачено), без стану NEW/IN_PROGRESS/CLOSED.
- Actions: `fetchAdminOrders` (усі + user/product), `fetchAdminOrderFormOptions`, `createAdminOrderAction`, `updateAdminOrderAction`, `deleteAdminOrderAction`.
- Schema: `Order.productId` optional → конкретне авто; `adminOrderSchema` у `utils/schemas.ts`.
- `prisma db push` уже виконано.

## Кабінет

- `fetchUserOrders` показує **усі** замовлення користувача (не лише paid), з product.
- Account orders: лічильник ззовні, назва авто в рядку.

## Далі

- Клієнтське створення замовлення з кабінету / картки авто — окремий task (адмін уже може створювати за клієнта).
