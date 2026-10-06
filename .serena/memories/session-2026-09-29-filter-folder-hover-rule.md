# Catalog filter hairlines (2026-09-29)

## Folder buttons
Nav-like: `hover:bg-foreground/10`; active `bg-foreground/10`.

## Rules (`catalog-filter-tree.tsx`)
- `FILTER_RULE_H` (`h-px w-full bg-border`): між sibling-папками; між папкою і **підпапками** (`!isLeaf` only)
- `FILTER_RULE_V` (`w-px bg-border`): зліва біля leaf-фасетів
- **Leaf:** без горизонталі; відступ під кнопкою через `pt-3` на блоці фасетів (риску прибрали, spacing лишили)

## Thickness note
Усі tree-риски одного weight. «Товстіші» під leaf були від H+V разом. Outline фасетів — окремо.
