## Orders sidebar from lg only (2026-11-04)

Mid widths (md–lg) were cramped: cards + 18rem sidebar side-by-side.

### Fix
- Shell: single column until `lg`; then `lg:grid-cols-[minmax(0,1fr)_20rem]` / `xl:…22rem`
- Summary sticky: `lg:sticky lg:top-24` (was md)

Files: account-orders-view.tsx, ui-lab-account-orders.tsx
