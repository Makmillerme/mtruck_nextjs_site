# Header + Hero (2026-09-09)

## Layout
Sticky glass header over the top of `#hero` on home: transparent spacer `h-14 lg:h-16`, header `-mt-*`, hero also `-mt-14 lg:-mt-16` so **one** photo spans slot + hero. Hero `min-h` stays `600px` / `lg:700px` (full height; `-mt` only pulls photo under glass, does not shrink the section).

Dark glass: `bg-black/25 backdrop-blur-xl`. Light: `bg-white/80 backdrop-blur-xl`. No color transition on hydrate.

## Hero fog (`#hero::after`)
Horizontal left→right navy wash only. No vertical top-belt. No `background-color` on the fog.

## Photo
`public/images/hero.png` via native `<img>` in RSC (not `next/image` — avoids Strict Mode double flash). Crop: 52% / sm 58% / md 64% / lg 78%. `#hero` has `data-header-surface="dark"`.
Do not paint a solid navy slot behind the home header — the hero photo is the slot background.
