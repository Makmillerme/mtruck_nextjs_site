# PDP hero buy-box (2026-11-03)

## Canon
- Hero row: `lg:grid-cols-2 lg:items-stretch` (page + ui-lab).
- Buy-box: `flex flex-col gap-5 lg:h-full`; header + key facts зверху; **price + CTA + trust** у `lg:mt-auto` (рівні по низу з галереєю).
- Без desktop sticky. Mobile `ProductStickyCta` лишається.
- Key facts без іконок.
- Finance copy panel: «Фінансування від» + amount/міс + hint «Лізинг або кредит · …» (`financingFrom` / `financingPerMonth` / `financingHint`; props financingLabel|Amount|Hint).
