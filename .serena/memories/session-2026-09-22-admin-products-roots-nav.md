# Admin products roots nav (2026-09-22)

## UX
- Sidebar «Товари» expands when taxonomy has ≥1 roots; children = root names → `/admin/products?root=<id>`.
- Parent toggles expand (chevron); open by default on products routes.
- 0 roots → flat Link as before.

## Scope
- `collectSubtreeNodeIds(tree, rootId)` in `lib/catalog/taxonomy.ts`.
- `products/page.tsx` validates `root` is a top-level node, filters products whose `taxonomyNodeId` is in subtree (null excluded).
- No `root` → all products.
- `listRootId` passed to `AdminProductsView`; create sheet defaults folder to that root; picker still full tree.
- `syncProductsSheetUrl` keeps `root` query when toggling create/edit/node.

## Files
- `app/[locale]/admin/layout.tsx`, `Sidebar.tsx`, `products/page.tsx`
- `components/admin/products/admin-products-view.tsx`
- `lib/catalog/taxonomy.ts`
