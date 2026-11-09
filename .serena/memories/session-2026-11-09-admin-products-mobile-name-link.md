# Admin products mobile card — name → PDP (2026-11-09)

Desktop table already linked name to `/products/[id]`. Mobile `AdminListMobileCard` used plain `title={item.name}` (card tap = edit sheet only).

Fix: title is `Link` + `tableLinkClassName`. Card activate still opens edit on non-link areas (`isInteractiveTarget` skips `a`).
