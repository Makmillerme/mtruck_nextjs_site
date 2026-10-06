# Admin filter scoped to sidebar root (2026-10-01)

## Behavior
На `/admin/products` Sheet «Фільтр» показує **підпапки обраного кореня** з лівого сайдбара (`?root=` / `listRootId`), а не весь каталог.

- `listRootId` відсутній («Товари») → повне `filterSchema.tree`
- корінь з дітьми → `{ tree: node.children }`
- листовий корінь → `{ tree: [node] }` (фасети)

## Implementation
- `scopeFilterSchemaToRoot` + `findFilterNodeById` у `lib/catalog/public-filter.ts`
- `AdminProductsView`: `scopedFilterSchema` useMemo; reset `appliedFilter` + remount provider `key={listRootId}` при зміні кореня
