# Demo vehicles + gallery + catalog data — 2026-09-11

## Data
- Меблі (4 Pexels furniture) видалені.
- Поля «Вантажні авто»: make/model/year/mileage/power + euro, transmission, axle, location, feature.
- Поля «Контейнеровози»: container_size, twist_locks.
- Марки доповнено Mercedes-Benz, MAN; моделі Actros/FH460/TGX тощо.
- 4 демо-контейнеровози з specs + 3 фото кожен (Pexels).
- `ProductImage` (до 15): таблиця створена raw SQL через PgBouncer (db push падав на prepared statements).

## Scripts
- `lib/catalog/ensure-truck-fields.ts`
- `lib/catalog/seed-demo-vehicles.ts`
- `npx tsx --env-file=.env scripts/wipe-seed-demo-vehicles.ts`
- `prisma/seed.ts` більше не сідить furniture JSON; порожня БД → demo vehicles.

## Admin
- Create sheet: `ImageGalleryInput` (multiple, max 15), cover = перше фото.

## Public
- `productListSelect` + `productWithSpecsToVehicle` → VehicleCard (рік/пробіг/euro/КПП/feature/папка).
- PDP: галерея thumbs + таблиця specs з БД.
- Каталог/featured: лише `PUBLISHED`.
- `EmptyList` зроблено client (`useTranslations`) — фікс для admin Sheets.

## Далі
- Інтерактивна галерея на PDP (клік по thumbs).
- Повне редагування галереї на edit product (зараз sync лише cover).
- Публічні facets з AttributeDefinition.
