Каталог `/products`: тулбар у `CatalogView` без `Separator`.

Рядок 1: лічильник + grid/list.
Рядок 2: пошук (`?search=` debounce 400ms) + кнопка Фільтр (Sheet: бренд `company`, «Лише новинки» `featured=1`) + сортування dropdown (`newest` | `price-asc` | `price-desc` | `name`).

Парсери: `utils/catalog-query.ts`. Запит: `fetchAllProducts({ search, sort, brands, featuredOnly })`, бренди: `fetchProductBrands()`.
URL зберігає layout/sort/brand/search разом.
