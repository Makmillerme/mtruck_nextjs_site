# Related teaser right border clipped — 2026-10-26

## Cause
Embla `overflow-hidden` flushes the last slide to the clip edge. Card `border` + `shadow-sm` sit on that edge and look cut off. Viewport `p-px` alone is not enough (Embla clientWidth eats padding).

## Fix
1. `CarouselContent` accepts `viewportClassName` (`components/ui/carousel.tsx`).
2. Related carousel: `viewportClassName={cn(overflowFieldGutterClassName, "py-1")}` + slides `first:pl-1 last:pr-2` so the card is inset inside the slide (~8px from clip).
3. Keep `ml-0 gap-5` + `lg:basis-1/3 xl:basis-1/4` (no shadcn -ml/pl).

## Verify
At end: teaserR ≈ viewportR − 9; slide `padding-right: 8px`. Page scrollDelta 0.