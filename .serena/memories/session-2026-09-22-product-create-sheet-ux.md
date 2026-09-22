## Product create/edit sheet UX (2026-09-22)

### Done
1. **Featured removed from sheet** — no checkbox in `ProductSheetFields`. Create forces `featured: false`; update keeps `existing.featured`.
2. **Field order** — folder → status → availability → price → images → name (+ gear) → specs → description.
3. **Adaptive packing** — `packSheetAttributes` shelf-pack budget 6 with dependency-safe lookahead (`lib/catalog/sheet-layout.ts`).
4. **Name always editable** — Input + `ProductNameSettingsDialog`. Gear disabled without folder. Reuses `MemberOrderPicker`, create/update display group actions. Inherited writer → create local; own → edit.
5. **Live compose** — `specsFromSheetValues` + dirty flag; server still composes on save when writer on path. Prefer non-inherited writer.
6. **Meta** — `loadProductSheetMetaAction` returns `nameWriterGroup`.

### Key files
`admin-products-view.tsx`, `product-name-settings-dialog.tsx`, `product-spec-fields.tsx`, `sheet-layout.ts`, `display-group.ts`, `product-sheet-meta.ts`, `page.tsx` (admin products), i18n `productNameSettings*`.

### Note
Display-group save still requires admin (`getAdminUser`).