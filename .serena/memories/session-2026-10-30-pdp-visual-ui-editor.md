# PDP visual UI Editor (2026-10-30)

## Done
- Prisma: `TextInput` LINE|AREA on AttributeDefinition; `ProductPageLayout.keyFactsMax`; `ProductPageKeyFactSlot`; `ProductPageTab` (TEXT|TABLE|LIST) + `ProductPageTabSlot` (attributeId | systemSource DESCRIPTION). Legacy SpecSlots kept; save syncs first TABLE → SpecSlots.
- Resolve: `lib/catalog/product-page-layout.ts` — key facts opt-in after save; empty → seed all eligible; legacy slots → one TABLE tab.
- Runtime: `buildProductKeyFacts(specs, layout)`, `buildProductDetailsTabs` — no KEY_FACT_PRIORITY, no hardcoded Description tab. PDP page uses layout tabs only.
- `ProductDetailsTabs` API: `tabs: ProductDetailsTab[]`. LIST via `ProductEquipmentList` (2-col UI Lab canon).
- CMS: TEXT LINE/AREA in fields-panel + product sheet Textarea.
- UI Editor `/admin/ui` productCard: visual editor — key facts (MemberOrderPicker + max 2–12) + tabs canvas (kind, fields, live ProductDetailsTabs preview). Save: `saveProductPageLayoutAction`.
- Backlog: inline `{field}` tokens in textarea — відкладено; formation unchanged.

## Files
- prisma/schema.prisma
- lib/catalog/product-page.ts, product-page-layout.ts
- lib/admin/product-page-editor-data.ts
- utils/product-page-actions.ts, utils/actions.ts (textInput on single product)
- components/admin/ui-editor/product-page-editor.tsx
- components/single-product/product-details-tabs.tsx, product-equipment-list.tsx
- app/[locale]/products/[id]/page.tsx
- components/dev/ui-lab-pdp.tsx
- docs/backlog/ideas.md
- messages uk/en/de UiEditor + CatalogAdmin textInput

## Note
After schema change run `npx prisma generate` (EPERM if next locks DLL). Description shows on PDP only via TEXT tab + system DESCRIPTION or TEXT AREA attribute.
