## Orders cards: always row + full-height photo + md sidebar (2026-11-04)

- Cards always `flex-row` (phone = tablet style, not catalog stack)
- Photo: fixed width `w-[5.5rem]/sm:w-28/md:w-32/lg:w-36` + `self-stretch` + `object-cover` (fills card height)
- Checkout sidebar from `md:` (`16rem` → `lg:18rem` → `xl:20rem`), sticky; below list only on phone
- Summary amounts remain stacked (no USD clip)
