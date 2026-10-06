# Remove Product.company / featured from admin & account UI (2026-09-29)

## Done
- `components/admin/products/admin-products-view.tsx`: dropped `company`/`featured` from `AdminProductRow`; removed hidden company input; removed company/featured filter state & UI; search haystack = name + specs; status filter kept.
- `app/[locale]/admin/products/page.tsx`: stopped mapping company/featured.
- `components/admin/archive/admin-archive-view.tsx` + archive page: removed company column/type/mapping.
- `components/admin/sales/admin-sales-view.tsx`: product picker label/keywords without company; type without company.
- `components/account/AccountCabinetView.tsx` + account page: favorites product type/mapping without company/featured.
- `lib/catalog/product-to-vehicle.ts`: `company` optional (fallback for categoryLabel) so favorites still compile.

## Note
Sales page passes `fetchAdminOrderFormOptions().products` directly; excess `company` on fetch result is structurally fine.
