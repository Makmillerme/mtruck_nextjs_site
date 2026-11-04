# PDP order CTA state (2026-11-03)

`RequestCatalogOrder`:
- Guest → sign-in button
- Auth + no open CATALOG order (NEW/IN_PROGRESS) → submit «Замовити товар» (`Product.requestVehicle`)
- Auth + open order → Link `/account?tab=orders` «Перейти до оформлення» (`Product.goToCheckout`)

Helper: `fetchOpenCatalogOrderForProduct` in `utils/actions.ts` (also used by create action duplicate check).
PDP passes `hasOpenOrder={Boolean(openCatalogOrder)}`.
Empty-orders copy + UI Lab PDP demo aligned to «Замовити товар».
