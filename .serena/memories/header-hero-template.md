# Hero

- `components/home/Hero.tsx` RSC: native `<img>` from `public/images/hero.webp` (~89KB) + `preload()` from `react-dom` (head).
- Source PNG kept at `public/images/hero.png` for regenerating WebP.
- Crop: 52% / sm 58% / md 64% / lg 78%. `#hero` has `data-header-surface="dark"`.
- Negative margin `-mt-14 lg:-mt-16` under glass header; min-h 600/700 kept.
- Horizontal fog via `#hero::after` in `globals.css`.
