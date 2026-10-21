# Catalog empty filter / hidden roots investigation (2026-10-13)

## Question
Why catalog shows 0 products when filter has nothing selected, especially with top-level categories hidden (`showInHomeFilter` / `showInFilter`).

## Product query path (public `/products`)
1. `app/[locale]/products/page.tsx` → `parseCatalogQuery(searchParams)`
2. `components/products/ProductsContainer.tsx` → `ProductsCatalogBody` → `CatalogResults`
3. `utils/actions.ts` `fetchAllProducts` / `fetchAllProductsUncached`
4. `lib/catalog/public-filter.ts` `catalogQueryToWhere`

## Empty selection behavior (critical)
`catalogQueryToWhere`: if `query.folders.length === 0`, does **NOT** add `taxonomyNodeId` scope. Only `PUBLISHED` + `archivedAt: null` (+ optional search/global facets/ranges).
**There is no logic that scopes empty selection to visible filter roots.**

When `folders.length > 0` but no matching active slug → `{ id: "__no_folder_match__" }` → hard 0.

## Hide-from-filter hoist
- Catalog: `mapFilterNodes` — `!showInFilter` → children hoist (`lib/catalog/public-filter.ts`)
- Home: `mapHomeFilterNodes` — `!showInHomeFilter` → children hoist (`lib/home/home-finder.ts`)

## Root-cause hypothesis (home → catalog)
Hiding a top-level folder removes it from the visible tree; products attached to that hidden node are **not** in hoisted children’s `subtreePublishedCount`.
Home CTA (`CategoryFinderPanel`): `count = activeFolder?.productCount ?? selectedRoot?.productCount ?? 0`; always auto-selects first visible folder via `resolveHomeFinderDefaults`. CTA links with `folder=<visible-child>` via `buildHomeFinderProductsHref` → server scopes to that child’s subtree → **0** if inventory lives on the hidden parent.

Clean `/products` (no `folder`) should still list those products.

## Related UI mismatch
URL `folder=<hidden-root-slug>`: query still scopes to full subtree (slug exists in DB), but UI selection may look empty because slug is absent from hoisted `displayTree`.
