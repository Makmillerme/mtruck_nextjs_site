# Filter accordion toggle fix (2026-10-06)

## Bug
Folder buttons expanded but would not collapse: `descendantActive` used `nodeContainsSlug` which matches **self**. After open, `selectFolder(slug)` made `folders=[slug]` → collapse guard `openSlug===slug && !descendantActive` never true.

## Fix (`catalog-filter-tree.tsx`)
- `nodeHasDescendantSlug` — children only
- `isOpen` = openSlug | (leaf+selected) | hasSelectedDescendant | hasOpenDescendant
- Click toggle: if `isOpen` → clear openSlug + `selectFolder("")` + childEpoch; else open+select
- Active chrome: `aria-expanded:bg-foreground/10 aria-expanded:font-semibold`
- Hairline under `!isLeaf`: single `FILTER_RULE_H` with `my-1.5` (no nested py wrapper)

## Verify (v1)
Mobile filter sheet: open → collapse worked; desktop aside still cascaded.

## Cascade bug (v2)
Collapse called `selectFolder("")` → draft empty → `initialOpenSlug=null` → every `CatalogFilterBranch` sync cleared `openSlug` → ancestors closed.

## Fix v2
- `parentSlug?: string` on nested branches
- Collapse: clear local `openSlug` + `childEpoch`; if selection is this node/under it → `selectFolder(parentSlug ?? "")` (root only clears all)
- Desktop aside + mobile sheet + admin share `CatalogFilterTree`
