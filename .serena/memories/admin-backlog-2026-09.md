# Admin backlog trio (2026-09-22)

Implemented three backlog items from `docs/backlog/ideas.md`.

## 1. AdminFilterSheet
- Export in `components/admin/admin-list-toolbar.tsx`
- Wired: `admin-products-view.tsx`, `admin-sales-view.tsx`
- Props: label, count, clearLabel, onClear, children

## 2. CMS delete → AlertDialog
- `folder-tree.tsx`, `fields-panel.tsx`, `display-groups-panel.tsx`, `option-editor.tsx`
- `ConfirmDeleteIcon` + taxonomy `delete*Action`; no `mode: "delete"` sheets
- Folders with products: disabled delete + blocked title

## 3. Optimistic archive/restore
- Hook: `lib/admin/optimistic-list.ts` — `useOptimisticListRemove`
- Pattern: remove row → server action → toast; `ok === false` → `router.refresh()`
- Lists: products/sales/users row archive via `ConfirmDeleteCallbackIcon`
- Archive view: restore click + hard delete Callback; three optimistic lists (orders/products/users)
- Sheet footer archive forms unchanged (no optimistic)
- Actions return `{ message, ok }` for archive/restore/delete

## Out of scope
- Optimistic sheet create/update CRUD
- Filter state in URL
- Archive list-toolbar redesign

See also: `mem:ui-confirm-delete-2026-09`, `mem:admin-list-toolbar-2026-09`.