## Account orders mid-screen + card rebuild (2026-11-04)

### Cards
- `flex-col` → `sm:flex-row`
- Photo always `aspect-[4/3]` (full width on xs; `sm:w-28 md:w-32 lg:w-36` thereafter) — no self-stretch
- Client: no Edit button / no edit sheet; delete only while NEW

### Layout
- Sidebar only from **xl** (`xl:grid-cols-[minmax(0,1fr)_20rem]` + sticky). Mid/lg stay single column, summary below — fixes clipped USD in 18rem lg sidebar.
- Summary amounts stacked (label then value) with `min-w-0 break-words`

### Files
- account-order-line, account-orders-summary, account-orders-view, AccountCabinetView, account page, ui-lab-account-orders
