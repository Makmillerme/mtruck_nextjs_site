# Filter hairline thickness (2026-10-06)

## Why it looked thicker/thinner
- Separators were `h-px`/`w-px` + `bg-border`.
- Display DPR was **1.25** → 1 CSS px maps to 1.25 device px; browser rounds to 1 or 2 physical px depending on Y/X offset after accordion reflow.
- Under-folder H lived inside `grid-rows` 0fr→1fr animation → subpixel squash during transition.

## Fix (`catalog-filter-tree.tsx`)
- `FILTER_RULE_H` = `h-0 border-t border-border`
- `FILTER_RULE_V` = `w-0 border-l border-border`
- Under-folder H rendered **outside** the animated grid panel (only when `isOpen && !isLeaf`)

Same tree: desktop aside, mobile sheet, admin, UI Lab.