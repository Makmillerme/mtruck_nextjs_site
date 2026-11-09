# AccountOrderLine mobile stack + meta rail (2026-11-09)

## Layout canon
- `<md`: photo on top (aspect 4/3 full width). `md+`: photo left capped width.
- Meta panel: `grid-cols-[minmax(0,1fr)_auto]` — text left; right rail:
  - favorite + delete → top-right (`justify-start` / `justify-between`)
  - qty +/- → bottom-right (`justify-end` / `justify-between`)

Files: `components/account/account-order-line.tsx`, UI Lab note in `ui-lab-account-orders.tsx`.

## Hydration note
CatalogPagination mismatch after HMR = stale SSR vs new classes; hard refresh.

## ADB
phone-dev Adb reverse; sheet verified vertical + right rail.