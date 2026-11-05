# Admin performance audit (read-only) — 2026-11-05

Scope: `app/[locale]/admin/**`, `components/admin/**`, `utils/actions.ts`, `utils/taxonomy-actions.ts`, `lib/admin/**`.

## Already mitigated (do not re-litigate as open bugs)
- Soft-save products/users (no redirect); smart writes `lib/admin/product-write.ts`; slim list (no gallery).
- Client table pagination phase 1 (`useAdminTablePagination`); archive local tabs.
- Session `React.cache`; product `after(revalidatePublicCatalog)`.
- Taxonomy tree request-scoped `cache()` shared layout+page.

## Top open issues
1. **P0** `fetchAdminProducts` / orders / users / archive / inquiries — full `findMany`, no Prisma take/skip; client slice only.
2. **P0** `/admin/products` always loads public filter schema + admin availability index + root attrs + all product specs.
3. **P0** `regenerateFormationInFolderSubtree` N+1 (per product `applyFormationTemplates` + per-row updates) then `revalidateCatalog()`.
4. **P0** inquiries mount: `markCallbackInquiriesReadAction` → `revalidatePath` inquiries + `/` layout + `router.refresh()`.
5. **P0** sales create/update still `redirectLocalized('/admin/sales')`; page loads all orders + all users + all products for pickers.
6. **P1** soft-save returns `adminProductListInclude` (images+full specs) into slim list state; taxonomy `revalidateCatalog` 5 admin paths + public.
7. **P1** no `next/dynamic` in admin client views; products view ~40KB + CatalogFilterFields.
8. **P1** UI editor `force-dynamic`; tab/node `router.replace` full SSR.

See parent agent transcript for full structured findings table.