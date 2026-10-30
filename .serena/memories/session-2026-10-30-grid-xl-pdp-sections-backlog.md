# Catalog grid xl + PDP sections backlog — 2026-10-30

## Grid
- Canon: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5`
- 3 cols only at xl (1280+) because filter sidebar appears at lg
- Updated: ProductsGrid, loading-skeletons, ui-lab-blocks, ui-lab-layout

## Spec sections
- Removed Spec Sections card from `display-groups-panel.tsx` (name template only)
- Runtime still uses non-writer DisplayGroups via `buildProductSpecGroups`
- Backlog: UI Editor — layout PDP / секції характеристик
