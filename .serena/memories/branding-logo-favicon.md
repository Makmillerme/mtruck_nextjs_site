Branding assets (2026-09-08):
- Header: `Logo.tsx` → `/logo_mtruck.svg?v=silver4` (cache-bust). Favicon: `public/favicon_mtruck.svg` + `app/icon.svg`.
- Silver chrome: `gradientUnits="objectBoundingBox"` vertical gradient so every glyph gets full metal banding at header size.
- Stops (gunmetal5): `#F4F5F7` → `#D2D5DB` → `#9A9EA6` → `#5C6068` → `#C2C5CC` → `#E8EAEE` → `#8E929A` → `#555960`. Header cache `?v=gunmetal5`.
- Avoid global `userSpaceOnUse` diagonals — they leave TRUCK in a dark muddy slice.
