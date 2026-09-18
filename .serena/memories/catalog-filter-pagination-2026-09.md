# Catalog: LCP eager, accordion filter, pagination (2026-09)

## LCP
- `components/media/photo-carousel.tsx` `SlideImage`: `loading={priority ? "eager" : "lazy"}` alongside `priority`.
- Featured/catalog still use `priorityCount={3}`.

## Public filter tree
- `lib/catalog/public-filter.ts`: `PublicFilterSchema.tree` of `PublicFilterNode { slug, name, children, facets[] }`.
- Facets only on leaves (no visible `showInFilter` children); unique by attribute key.
- Nodes with `showInFilter=false` are omitted but **visible descendants hoist** (root `komercijna-tehnika` is hidden → `vantazhni-avto` / `prychepy` appear at top).
- UI: nested shadcn Accordion `type="single" collapsible` per level in `components/products/catalog-filters.tsx` (`CatalogFilterBranch` + `nodeContainsSlug`).
- Opening a folder sets `folder=<slug>`, clears `f.*`, resets `page`.
- Accordion icon: `LuChevronDown` in `components/ui/accordion.tsx` (react-icons, not Lucide).

## Pagination
- URL: `page` (1-based), `pageSize` ∈ `{10,25,40}` default 10 (`utils/catalog-query.ts`).
- `fetchAllProducts` returns `{ products, total }` with Prisma `skip`/`take` + `count`.
- UI: `components/products/catalog-pagination.tsx` (arrows + `page / pageCount` + Select) + client wrapper on `/products`.
- Filter/sort/pageSize changes reset `page` via `buildCatalogHref`.
- Count heading uses **total**, not page length.

## UI Lab
- `components/dev/ui-lab-catalog-filter.tsx`: nested filter demo + live pagination demo.
- Catalog entries: `catalog-filter`, `catalog-pagination` in `ui-lab-catalog.ts` / `ui-lab.tsx`.

## i18n
- `Products.pageOf`, `pageSize`, `prevPage`, `nextPage`, `filterEmpty` (uk/en/de).
