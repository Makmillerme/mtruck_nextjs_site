# Premium equipment LIST (2026-11-02)

## Canon
`ProductEquipmentList` — Specs-rhythm checklist for PDP tab kind=LIST:
- Column-major 1 → `sm:2` → `lg:3` (`gap-x-8`): thirds + invisible pad for row align
- Per column `divide-y divide-border/60`, row `py-2.5 text-sm`
- Mark: `LuCheck` in `size-5 rounded-sm bg-muted` (kept; may refine later)
- Label: `font-medium text-foreground`
- No nested card/shadow inside tabs card

## Files
- `components/single-product/product-equipment-list.tsx`
- `components/dev/ui-lab-pdp.tsx` LIST caption
- `components/dev/ui-lab-catalog.ts` PDP hint/keywords

Props unchanged: `items`, `className`.
