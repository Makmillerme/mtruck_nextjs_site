# Related carousel: 3 cards clipped — 2026-10-26

## Cause
`lg:basis-1/3` + `gap-5` → 3×33.333% + 2×1.25rem > 100%, so the third card (or peek of 4th) was clipped by Embla overflow.

## Fix (`product-related-carousel.tsx`)
- `lg:basis-[calc((100%-2.5rem)/3)]` (2 gaps)
- `xl:basis-[calc((100%-3.75rem)/4)]` (3 gaps)
- Keep `gap-5`, `ml-0`, `p-px pl-px` on slides for border gutter
- Drop asymmetric `first:pl` / `last:pr`

## Verify
1024: threeFit true, no fourth peek. 1280: fourFit true. End settle: teaserInset ≥ 1.