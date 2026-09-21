# Catalog layout toggle without filter reset (2026-09-21)

## Проблема
Перемикач Картки/Список робив `router.replace(?layout=…)` → RSC refresh → фільтр скидав draft і згортав дерево.

## Рішення
- `selectLayout` лише `setLayout` + cookie `mtruck-catalog-layout`, **без** URL navigation.
- `CatalogLayoutContext` / `useCatalogLayout()` у `catalog-view.tsx`.
- `catalog-results-switch.tsx` показує grid або list з контексту.
- `CatalogResults` рендерить обидва слоти (ProductsGrid + ProductsList) і передає в switch.

URL `layout=` лишається валідним при першому завантаженні (page.tsx), але toggle його більше не чіпає.
