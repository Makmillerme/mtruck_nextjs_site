# Header + Hero (2026-09-09)

## Layout
Sticky in-flow header above `#hero`. Home slot and header dark surface are `#061020` (same as hero `bg-[#061020]`). Light `bg-white/80` over navy is forbidden — it reads dirty gray.

Dark header: `bg-black/25 backdrop-blur-xl` (glass over navy slot / dark sections). Light: `bg-white/80 backdrop-blur-xl`. No color transition on the header (avoids hydrate flash).

## Hero fog (`#hero::after`)
Horizontal left→right navy wash only. No vertical top-belt. No `background-color` on the fog.

## Photo
`public/images/hero.png` via **native `<img>`** in RSC (`heroImage.src`), not `next/image`. Reason: `next/image` is a client component with empty placeholder; React Strict Mode in `next dev` remounts it twice (navy → photo → navy → photo), and `/_next/image` delays first paint.

Crop: 52% / sm 58% / md 64% / lg 78%. `#hero` has `data-header-surface="dark"`. Preload: `<link rel="preload" as="image">`.
Do not wrap the LCP photo in `next/image` without an explicit need.
