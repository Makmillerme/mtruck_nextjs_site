# Product page layout (PDP specs order/visibility) — 2026-10-30

## Model
- `ProductPageLayout` (1:1 TaxonomyNode)
- `ProductPageSpecSlot` (attributeId, sortOrder, visible)

## Runtime
- `lib/catalog/product-page-layout.ts` — resolve + ancestor fetch
- `buildProductSpecGroups(..., layout)` applies visible + order
- PDP page fetches layout by product folder

## Admin
- UI Editor tab `productCard` → `ProductPageEditor`
- Save: `utils/product-page-actions.ts`
- Load: `lib/admin/product-page-editor-data.ts`
- Default (no layout): all attrs model order, visible
- New attrs append visible at end
- Inheritance like Card Preview

## Note
`prisma db push` OK; `prisma generate` may EPERM while `npm run dev` holds query_engine DLL — restart next then `npx prisma generate`.
