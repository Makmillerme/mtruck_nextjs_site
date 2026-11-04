## UI layouts leaf-only purge (2026-11-03)

User: clean parent-category UI layout leftovers. UI configures **only end (leaf) folders**.

### Code
- `fetchCardPreviewLayoutsByNodeIds` — exact node ids only (removed ancestor walk).
- `fetchProductPageLayoutsByNodeIds` — already leaf-only from prior fix.
- Removed `inheritedFromAncestor` from product-page editor payload + hint UI.
- i18n uk/en/de: dropped `productPageInheritedHint`; `pickFolderHint` / no-fields copy no longer mention parent layout inheritance.
- `docs/backlog/ideas.md` PDP layout note updated.

### Data
`scripts/cleanup-non-leaf-layouts.mjs`: 4 non-leaf nodes, **0** leftover CardPreview/ProductPage layouts (already clean).

### Still inherited (by design)
Catalog **AttributeDefinition** / display groups on parent folders — data model, not UI layout.
