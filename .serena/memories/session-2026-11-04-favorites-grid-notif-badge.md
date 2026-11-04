# Favorites denser grid + notif badge (2026-11-04)

## Favorites grid (no catalog sidebar)
- `1 → sm:2 → md:3 → xl:4` (was catalog-like `1/2/xl:3` — too wide on mid screens)
- `VehicleCard` optional `imageSizes` for denser next/image: `(max-width:640) 100vw, 767 50vw, 1279 33vw, 25vw`

## Notifications badge
- Count pill: `bg-destructive` + `ring-2 ring-background` (was navy `bg-primary`, hard to notice)
