# Account «Запит на автівку» sheet — no RSC refresh (2026-11-05)

## Bug
Opening create sheet called `router.replace(/account?tab=orders&create=1)` → SoftNavPending + full account RSC remount (Orders tab flicker).

## Fix
`AccountCabinetView.onSheetUrlChange` → `history.replaceState` via `syncAccountSheetUrl` (keep `tab=orders`, toggle `create`). Tab switches still use `router.replace`.

File: `components/account/AccountCabinetView.tsx`.
