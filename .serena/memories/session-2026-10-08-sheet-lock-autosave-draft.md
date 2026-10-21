# Session 2026-10-08 — sheet lock, save latency, DRAFT bug

## User ask
- Closing sheet during save cancels the action; asked about field autosave.
- POST save ~3.4s while `updateProductAction` ~973ms.
- Product vanished from public catalog/home after save.

## Decisions
- **No full autosave** for product sheets (multi-field + images + specs). Prefer **lock sheet while pending**.
- Soft-save already returns before full page redirect; further latency cut via `after(() => revalidatePublicCatalog(...))` so catalog revalidation does not block the action response.

## Fixes shipped
1. **DRAFT bug**: `CatalogMenuSelect` no longer silently falls back to `options[0]` (DRAFT) when `defaultValue` is missing/not yet in options; syncs via `useEffect`. `updateProductAction` treats empty status/availability as keep-existing.
2. **Product restore**: acceptance product `041cb6a9-b33f-4341-b9bc-44b8b1bed325` set back to `PUBLISHED` (earlier in session).
3. **Sheet lock**: `FormContainer` / `CatalogForm` expose `onPendingChange` (+ cleanup on unmount). Controlled sheets ignore `onOpenChange(false)` while pending:
   - `admin-products-view`, `admin-sales-view`, `admin-users-view`
   - catalog `folder-tree`, `fields-panel`, `display-groups-panel`
4. **Latency**: `createProductAction` / `updateProductAction` wrap `revalidatePublicCatalog` in `after()` from `next/server`.

## Notes
- Dual `loadAdminProductSheetAction` ~500ms in logs = React Strict Mode double invoke in dev.
- Remaining save cost (~1s action) is still DB/images/smart-write path — further cuts are separate.
- Autosave backlog if needed later: per-field debounce + optimistic UI, not wholesale form submit.
