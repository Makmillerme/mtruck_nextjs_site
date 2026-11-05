## Taxonomy 3-level + root uniqueness + order qty (2026-11-05)

### Depth
- `TAXONOMY_MAX_DEPTH = 3` (depths 0/1/2) in `lib/catalog/taxonomy.ts`
- `getTaxonomyNodeDepth`, `findTaxonomyNodesBeyondMaxDepth`
- `createTaxonomyNodeAction` rejects parent with depth ≥ 2 (`folderMaxDepth`)
- Admin folder-tree: hide «+» when `depth >= 2`
- Audit script: `npx tsx --env-file=.env scripts/audit-taxonomy-depth.ts`

### Root uniqueness
- `TaxonomyNode.productsAreUnique Boolean @default(false)` (unique OFF by default → qty allowed)
- Edit only on root in folder-tree (`flagProductsAreUnique`)
- `resolveProductsAreUnique` / `resolveProductsAreUniqueByNodeIds` walk to root

### Qty stepper
- `ORDER_QUANTITY_MAX` in `lib/catalog/order-quantity.ts` (not from `actions.ts` — use server export rule)
- `updateCatalogOrderQuantityAction` — owner, CATALOG, NEW/IN_PROGRESS; unique → force 1; else 1…99; `orderTotal = price * qty`
- `AccountOrderLine` stepper when `allowsQuantity`; Lab demo local qty
- Account mapOrders sets `quantity` + `allowsQuantity` from root flag

### Verify
tsc OK; db push applied `productsAreUnique`. If `prisma generate` EPERM — restart next/dev lock on query_engine dll.