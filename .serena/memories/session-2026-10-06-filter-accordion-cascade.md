# Filter accordion cascade fix (2026-10-06)

## Bug
Desktop catalog aside (`/products`): collapsing a nested folder also collapsed all ancestors.

## Cause
Collapse called `selectFolder("")` → emptied draft → `initialOpenSlug=null` → every `CatalogFilterBranch` sync set `openSlug=undefined`.

## Fix (`catalog-filter-tree.tsx`)
- Nested branches get `parentSlug={node.slug}`
- Collapse: local `openSlug` + `childEpoch` only; if selection is this node or under it → `selectFolder(parentSlug ?? "")` (root still clears all)

## Shared surfaces
Same `CatalogFilterTree`: desktop aside, mobile sheet, admin products filter, UI Lab demo.

## Verify
Open Commercial → Trucks → Containeровози; collapse leaf → parents stay expanded; collapse Trucks → Commercial stays expanded.