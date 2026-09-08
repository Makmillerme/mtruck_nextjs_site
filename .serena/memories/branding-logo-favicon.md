Branding assets (2026-09-08):
- Header: `Logo.tsx` → `/logo_mtruck.svg?v=silver4` (cache-bust). Favicon: `public/favicon_mtruck.svg` + `app/icon.svg`.
- Silver chrome: `gradientUnits="objectBoundingBox"` vertical gradient so every glyph gets full metal banding at header size.
- Stops: `#FFFFFF` → `#E9EBEF` → `#C5C8D0` → `#9EA2AB` → `#D8DBE1` → `#F2F3F5` → `#B8BBC3` → `#8A8E97` (no near-black).
- Avoid global `userSpaceOnUse` diagonals — they leave TRUCK in a dark muddy slice.
