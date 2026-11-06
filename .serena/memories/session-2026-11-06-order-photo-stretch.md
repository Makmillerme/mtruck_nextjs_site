# AccountOrderLine photo height (Full HD fix)

**Date:** 2026-11-06

Card body uses **CSS grid** `grid-cols-[auto_minmax(0,1fr)]` so photo + meta share one row height.

- Phone (`max-md`): `aspect-square` on photo cell
- md+: no aspect-ratio; cell stretches with row; `Image fill` + `object-cover`
- Widths: w-40 → sm:w-44 → md:w-52 → lg:w-56 → xl:w-64

File: `components/account/account-order-line.tsx`.