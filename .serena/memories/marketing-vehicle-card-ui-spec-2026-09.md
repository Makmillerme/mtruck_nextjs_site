# VehicleCard — 01+03 + motion + carousel

Date: 2026-09-17

- `rounded-sm`, `border-border`, white plate.
- **Keep** `shadow-sm` + `group-hover:shadow-xl` (`duration-500`). Buttons have no drop-shadow; **cards do**.
- Photo: shared `PhotoCarousel` variant=`card` (Embla, in-frame arrows, dots). Zoom on hover still via Image class.
- Footer: price + hint, then full-width `Детальніше` (`Button w-full`), not side-by-side.
- Title always `line-clamp-2`.
- Icons: `react-icons/lu`.
- UI Lab vehicle block shows 3-col grid + PhotoCarousel page demo.
