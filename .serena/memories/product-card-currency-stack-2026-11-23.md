## Product card currency stack (2026-11-23)

`CardPriceBlock` in `product-card.tsx`:
- Main: `text-xl/2xl font-extrabold tabular-nums`
- Extras under main: `text-sm/base font-bold`
- When extras or VAT present → whole price block `text-right` (aligned stack)
- VAT lines (if any): muted `text-xs/sm` under hairline `border-t`

UI Lab blocks demo includes UAH main + USD/EUR extras. Canon mirrors PDP extras-under-main.

Related: `mem:pdp-extra-currencies-under-main-2026-11-23`, `mem:currency-display-mode-and-pdp-price-canon-2026-11-23`.