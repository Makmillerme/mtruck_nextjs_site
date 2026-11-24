## Product card financing + fit price (2026-11-24)

`CardPriceBlock` (grid + list):
- Row `flex items-center justify-between gap-3` — financing vertically centered vs price stack.
- Financing: fixed-ish `w-[min(48%,12rem)]` (list `14rem`) `shrink-0`; label mono 10–11px; amount `text-base font-bold`.
- Price column `flex-1 min-w-0` right-aligned when financing/extras; `FitPriceText` tiers 0→1 size drop→2 scale 0.92.

Pass `layout` from `ProductCard`. VAT still PDP-only.