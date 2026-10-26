# Catalog filter visual polish A+B (2026-10-21)

UX логіка без змін (дерево, soft-apply, clear).

## Chrome
- Aside Card: `rounded-sm` + `border-border` + `shadow-md` (читабельна тінь на білому).
- Header hairline `border-b`; footer Apply `border-t`.
- Mobile sheet header теж `border-b`.
- UI Lab `ui-lab-catalog-filter` синхронно.

## Tree / fields
- Згорнуті папки: `text-muted-foreground`; selected: `bg-foreground/10`.
- Facet gap `gap-4`; range `gap-2.5`.
- Slider track м’якший: muted + range `foreground/40` (лише в RangeFacet).

Файли: `catalog-view.tsx`, `catalog-filters.tsx`, `catalog-filter-tree.tsx`, `ui-lab-catalog-filter.tsx`.
