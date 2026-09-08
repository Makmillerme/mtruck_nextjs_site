# Catalog filters: mobile Sheet + desktop sticky sidebar

## UX
- **Mobile / < lg:** toolbar is one row: search, sort, filter. Filter opens a Sheet. Trigger is primary (blue) `lg:hidden`.
- **Desktop / lg+:** sticky left sidebar (`sticky top-20`, `max-h-[calc(100vh-6rem)]`, overflow-y auto). Catalog grid/list is on the right. Filter button is hidden.
- Shared fields live in `components/products/catalog-filters.tsx` (`useCatalogFilters`, `CatalogFilterFields`). Unique checkbox ids via `idPrefix` (`catalog-mobile` vs `catalog-desktop`).

## Layout (`catalog-view.tsx`)
- Grid: `lg:grid-cols-[16rem_minmax(0,1fr)]`, `xl:grid-cols-[18rem_minmax(0,1fr)]`.
- Do **not** use `items-start` on the catalog grid: the aside must stretch so `position: sticky` works while scrolling the page.
- Sidebar: `hidden lg:block` + Card. Mobile sheet trigger: `lg:hidden`, `variant="default"`.
- Mobile toolbar: `flex items-center` — `CatalogSearch`, `CatalogSortButton`, `CatalogFilterSheet`.

## URL
- Brands: `?brand=A,B` (comma-separated).
- Featured: `?featured=1`.
- Search/sort unchanged (`search`, `sort`). Cookie `mtruck-catalog-layout` for grid/list.
