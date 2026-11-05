# Client order cards — no status·kind (2026-11-05)

Removed `Нове · З каталогу` (status + kind) from client `AccountOrderLine`.
Props `kindLabel` / `status` / `statusLabel` / `AccountOrderLineStatus` deleted.

Touches: account-order-line, account-orders-view, order-added-sheet, ui-lab-account-orders.
Admin sales UI unchanged (separate components).

Card still shows: title, article, note (request), price, qty/actions.
