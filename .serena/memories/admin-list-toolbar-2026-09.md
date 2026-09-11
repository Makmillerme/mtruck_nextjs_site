# Shared admin list toolbar — 2026-09-11

`components/admin/admin-list-toolbar.tsx` — єдиний рядок як у публічному каталозі:
`flex min-w-0 items-center gap-2` (пошук flex-1 + фільтр + створити).

Використовують `AdminProductsView` і `AdminSalesView`.
Кнопки `whitespace-nowrap`, щоб «Створити замовлення» не ламало ряд.
