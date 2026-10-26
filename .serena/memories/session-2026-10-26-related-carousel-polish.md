# Related carousel polish (2026-10-26)

## Fixes
1. **CatalogTeaserCard** — removed `aspect-[4/3] bg-muted` photo stub; centered icon + label + hint full height.
2. **Arrows** — `px-11` gutter on carousel; buttons `left-0`/`right-0`, `z-30`, `pointer-events-auto`, `shadow-md`, `onPointerDown stopPropagation` so clicks do not hit VehicleCard links underneath.
3. Slides stay `lg:basis-1/3` (3-up) / `xl:basis-1/4` (4-up).
