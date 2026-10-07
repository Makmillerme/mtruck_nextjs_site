# Homepage finder / catalog perf fix (2026-10-07)

## Cause
`facetsForNode` ran for **every** folder in the home tree and for each NUMBER/YEAR field did `collectSubtreeIds` + **2** `productSpec.aggregate` queries (subtree + global). Plus per-node `subtreePublishedCount` (another collectSubtreeIds + groupBy). After CMS saves, `revalidateCatalog` busts caches → cold rebuild hung admin and made homepage→catalog ~30s.

## Fix (`lib/home/home-finder.ts`)
- One `product.groupBy` for published counts; subtree totals summed in memory from the taxonomy tree
- Facets only on **home-tree leaves** (parents use `[]`; UI selects deepest folder)
- No server-side number bounds — client `narrowFacetsForFolder` + availability fills min/max

## Catalog schema (`public-filter.ts`)
- `numberBoundsForAttribute`: global fallback only when subtree agg is empty
- Leaf numeric bounds loaded in `Promise.all`
