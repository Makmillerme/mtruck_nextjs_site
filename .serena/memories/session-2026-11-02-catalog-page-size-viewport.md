# Catalog page size follows card grid (2026-11-02)

ProductsGrid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`.

Page size dropdown (`CatalogPagination`):
- `< xl` (1–2 cols): **10 / 20 / 30** (`CATALOG_PAGE_SIZES_NARROW`)
- `xl+` (≥1280px, 3 cols): **9 / 18 / 36** (`CATALOG_PAGE_SIZES_WIDE`)

MatchMedia: `CATALOG_WIDE_PAGE_SIZE_MQ = (min-width: 1280px)`.
If current `pageSize` not in active set → `nearestCatalogPageSize` (URL update via soft nav).
Legacy URL values 25→20, 40→36 in `parseCatalogPageSize`.
Default remains **10**.
