# Catalog filter UX (2026-09-18 follow-up)

User rejected folder checkboxes + separate chevron: unexplained dual control.

## Current behaviour
- One row control (`Button`): click expands/collapses. Opening a **leaf** writes `folder=` that slug (`setFolder`) and drops other folders’ `f.{slug}.*`.
- Parent rows only expand (no product folder param until a leaf is open).
- Indent: `pl-2 / pl-6 / pl-10 / pl-14` by depth. Open panel uses `grid-rows-[0fr|1fr]` 200ms.
- SELECT facets: compact `h-9` shadcn `Button` outline → **default/primary** when filled (same language as «Детальніше»). No extra label above the trigger.
- CMS `dependsOnAttributeId` + `parentOptionId` → public `dependsOnKey` / `option.parentSlug`. Model list filters by selected makes and **groups by make**. Changing make prunes illegal models (`pruneDependentFacetValues`).

## Files
- `components/products/catalog-filter-tree.tsx`
- `components/products/catalog-filters.tsx`
- `lib/catalog/public-filter.ts`
- `utils/catalog-query.ts` (`setFolder`, `scopedFacetBucket`)
- Lab: `ui-lab-catalog-filter.tsx`
