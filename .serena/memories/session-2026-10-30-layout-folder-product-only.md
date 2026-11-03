# Layout folder UX (2026-10-30)

- Removed card preview «Джерело категорії» UI (LAYOUT_FOLDER / PRODUCT_FOLDER).
- Category label on cards always = product.taxonomyNode.name.
- Save always writes categorySource=PRODUCT_FOLDER; resolve forces PRODUCT_FOLDER (DB column kept).
- Editor hints: configure on product leaf folder; parent layout inherited; empty path fields → cardPreviewNoFields / productPageNoSubtreeFields.
- Files: card-preview-editor.tsx, card-preview-actions.ts, product-to-vehicle.ts, card-preview.ts, card-preview-editor-data.ts, messages uk/en/de.
