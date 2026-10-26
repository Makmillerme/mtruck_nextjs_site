# PDP specs + responsive audit (2026-10-26)

## Характеристики (`product-specs.tsx` / SpecRows)

- **Було:** `sm:grid-cols-2` → з ≥640px уже 2 стовпці (на «телефоні»/вузькому планшеті виглядало як на скріні користувача).
- **Стало:** `lg:grid-cols-2` → **1 колонка** на mobile + tablet + small desktop (&lt;1024), **2 колонки** з `lg` (≥1024).
- Рядок label|value: `grid-cols-[7.5rem_1fr]` → `sm:10rem` → `lg:11rem` (це не 2 стовпці фактів, а ширина dt).

## Browser verify (Actros PDP)

| Viewport | specs `dl` tracks | hero | sticky CTA |
|----------|-------------------|------|------------|
| 390 mobile | 1 (~325px) | stack | visible |
| 768 tablet | 1 (~678px) | stack | visible (`lg:hidden`) |
| 1023 | 1 | stack | visible |
| 1024 | 2 | 2-col | hidden |
| 1280 / 1440 | 2 | 2-col | hidden |

Key facts compact у buy-box: `grid-cols-2 sm:grid-cols-3` — на 1024 (~454px col) без overflow/truncation.

## Канон телефонів (підтверджено)

- Hero stack &lt;lg; sticky CTA `lg:hidden` + `pb-24 lg:pb-8` на page shell.
- Gallery full-bleed column; lightbox thumbs з `md:`.
- Specs тепер узгоджені з цим (не ламають mobile 2-col).

## Файли

- `components/single-product/product-specs.tsx`
- Page shell: `app/[locale]/products/[id]/page.tsx` (`lg:grid-cols-2` hero, sticky)
