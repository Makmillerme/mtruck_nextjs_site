# Mobile filter sheet: Очистити under apply (2026-09-29)

## Change
Мобільний `CatalogFilterSheet` (`/products`, lg:hidden):
- Прибрано `CatalogFilterClearButton` (LuTrash2) з хедера Sheet
- Під «Фільтрувати» — outline `h-10 w-full` «Очистити» (`clearBelowApply` на `CatalogFilterFields`)

Desktop sidebar (`CatalogFilterSidebar`): trash у хедері **без змін**.

## Also
- `AdminFilterSheet` — той самий footer-патерн (parity з mobile catalog)
- i18n `Products.filterClear` / `AdminProducts.clearFilters`: uk «Очистити», en «Clear», de «Löschen»
- UI Lab: dashed block з каноном mobile sheet footer

## Files
- `components/products/catalog-filters.tsx` — prop `clearBelowApply`
- `components/products/catalog-view.tsx`
- `components/admin/admin-list-toolbar.tsx`
- `messages/{uk,en,de}.json`
- `components/dev/ui-lab-catalog-filter.tsx`, `ui-lab.tsx`
