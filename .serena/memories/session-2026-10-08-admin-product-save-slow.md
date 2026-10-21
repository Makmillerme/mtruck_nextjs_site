# Why admin product sheet save feels slow (2026-10-08)

## Measured (dev terminal)
- `updateProductAction`: ~0.5s (light) … ~1.5–1.7s (heavier)
- After success redirect: `GET /admin/products?root=…` ~**2.0s**
- Perceived POST often ~**3.6–3.7s** = action + remount

## Causes
1. **Hard redirect** after save remounts entire admin products RSC page.
2. Page `Promise.all`: `fetchAdminProducts` (all products + images + **all specs**), taxonomy tree, root table attrs, public filter schema, filter availability — heavy; remote PgBouncer latency.
3. `revalidatePublicCatalog` on every save busts catalog tags + `/` + `/products` (needed for public freshness; makes cached pieces cold).
4. Update path always rewrites specs (`deleteMany` + create); image-order can N× `productImage.update`.

## Faster UX directions (not done)
- Soft-close sheet + optimistic/local list patch instead of full redirect.
- Slim `fetchAdminProducts` (defer full specs to sheet load).
- Keep list query/`?root=` (already fixed) and avoid remounting filter schema when unchanged.