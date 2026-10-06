# Filter folder open/close vs selection (2026-10-06)

## User model
Open folder = select for filter; close = deselect.

## Actual (draft, then Apply)
- Open: `selectFolder(slug)` → `draft.folders = [slug]` (single folder).
- Close mid-level: if selection is this node or under it → `selectFolder(parentSlug)` (selection moves up, not full clear).
- Close root: `selectFolder("")` → empty draft.
- Close without owning selection: UI only.
- Listing updates only on **Фільтрувати** (`buildCatalogHrefFromDraft`); draft is dirty until then.
- URL/query uses one folder slug (+ scoped facets/ranges for that slug).

## Shared
`CatalogFilterTree` + `selectFolder` in catalog-filters (desktop/mobile) and admin via same draft pattern.