# Hero (2026-09-09, update)

- `components/home/Hero.tsx` RSC: native `<img>` from `public/images/hero.webp` (~89KB) + `preload()` from `react-dom` (head).
- Buttons rewritten: removed catalog/new-arrivals CTAs (duplicated quick access already below the fold).
  - Primary: `heroCta` → `#custom-order` («Замовити техніку»)
  - Secondary (outline): `heroSecondary` → `#contact` («Зв'язатися з нами»)
- Added decorative scroll cue (aria-hidden, `hidden sm:flex`, absolute bottom-center, `animate-bounce` ChevronDown) — justified absolute-position exception (pinned indicator independent of content flow).
- Crop: 52% / sm 58% / md 64% / lg 78%. `#hero` has `data-header-surface="dark"`.
- Negative margin `-mt-14 lg:-mt-16` under glass header; min-h 600/700 kept.
- Horizontal fog via `#hero::after` in `globals.css`.
