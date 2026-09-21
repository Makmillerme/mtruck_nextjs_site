# Catalog filter bugfixes (2026-09-18)

## Fixes
1. **onSelectFolder is not a function** — `CatalogFilterBranch` no longer relies on `{...rest}` alone; callbacks passed explicitly; defensive `typeof === "function"` guard. Folders use `variant="ghost"` (interim; full visual redesign deferred until user brings a reference).
2. **Parent folders show no products** — opening any folder (parent or leaf) calls `selectFolder(slug)` so `folder=` filters the taxonomy subtree via `collectSubtreeIds`.
3. **Adaptive facet options** — `enrichFilterSchemaForQuery` in `lib/catalog/public-filter.ts`: for each leaf facet, options/bounds are narrowed to values present on published products matching the rest of the current filter (omit self-key). Wired in `ProductsContainer` + `pruneScopedFacetsToSchema`.

## Deferred
- Premium filter visual redesign in UI Lab after user finds a reference look.
