# Card preview layout inheritance (2026-10-21)

## Проблема
Адмін layout на «Вантажні авто» (TAGS + 6 слотів) не впливав на `/products` і головну:
1. `fetchCardPreviewLayoutsByNodeIds` брав лише **exact** `taxonomyNodeId` товару.
2. Дочірні папки (Тягачі/Фургони/Контейнеровози) мали seed-layout GRID×4 → блокували батька.
3. `CatalogFeaturedGrid` (home) взагалі не передавав `layouts`.

## Фікс
- `lib/catalog/card-preview.ts`: resolve по ланцюгу ancestors (node → parent → …).
- `CatalogFeaturedGrid`: `fetchCardPreviewLayoutsByNodeIds` + `layouts` у `ProductsGrid`.
- One-time cleanup: видалено seed-layout на дочірніх, якщо є layout у предка і слоти = mileage/transmission/euro/feature + GRID/4.
- i18n `pickFolderHint`: layout діє на папку + нащадків, доки в дитині немає свого.

## Перевірка Browser
- `/products?folder=vantazhni-avto`: TAGS з 6 полями (вкл. локація, к.с.).
- `/` featured: ті самі TAGS.
