# Admin products sheet + strip titles — 2026-09

Коміт після `48a5227`.

## Заголовки

- CMS / sales / edit: прибрано page-level `h1` і lede.
- Sales і products: лишився лише лічильник (`Усього …`).

## Сайдбар

- З `adminLinks` видалено `/admin/products/create`.
- Старий маршрут `create/page.tsx` редіректить на `/admin/products?create=1`.

## Мої товари

`components/admin/products/admin-products-view.tsx`:
- Тулбар: пошук (name/company) + Sheet-фільтр (компанія, статус, рекомендовані) у стилі мобільного каталогу + кнопка «Створити товар».
- Фільтрація клієнтська по вже завантаженому списку.
- Створення — правий Sheet (`?create=1`, папка через `&node=`), форма з folder picker / status / availability / specs.
- Таблиця додає колонку Статус.
