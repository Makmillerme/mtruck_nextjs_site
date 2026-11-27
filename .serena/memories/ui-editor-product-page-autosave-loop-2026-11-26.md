# Product page layout autosave loop (2026-11-26)

`ProductPageEditor` autosave called `saveProductPageLayoutAction`, which `revalidatePath("/admin/ui")` and recreated tabs with new UUIDs. The hydrate effect then saw new tab ids, the save effect treated that as a user edit, and POST looped.

Fix:
- Persist the client tab UUID on create (`utils/product-page-actions.ts`).
- While applying server props, set `lastSaved` to the incoming snapshot and ignore the stale render (`syncing` ref). Identical server payloads do not reset editor state (`appliedServer`).
