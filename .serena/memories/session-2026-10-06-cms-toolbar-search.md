# CMS folders/fields toolbar + search (2026-10-06)

## Goal
Unify Папки/Поля toolbars under folders DOM pattern + client search.

## Structure
- Shared [`components/admin/catalog/cms-panel-toolbar.tsx`](components/admin/catalog/cms-panel-toolbar.tsx): search `flex-1` (LuSearch + Input h-9) + outline `sm` create + `infoTip` slot.
- **Folders** ([`folder-tree.tsx`](components/admin/catalog/folder-tree.tsx)): toolbar first row in `grid gap-4` inside page `CardContent` (unchanged page wrapper).
- **Fields** ([`fields-panel.tsx`](components/admin/catalog/fields-panel.tsx)): removed `CardHeader`; toolbar first child of `CardContent` with `pt-6`.
- Not using `AdminListToolbar` (primary create + filter sheet).

## Search
- **Folders:** `filterTaxonomyTree` — self-match keeps full children; descendant-only match keeps ancestor path with pruned siblings. While query non-empty, auto-expand all nodes with children in filtered tree (`collectExpandIds`); manual toggle disabled during search.
- **Fields:** filter own/inherited by `attribute.name` includes; `panelSearchEmpty` when both empty.

## i18n (`CatalogAdmin`)
- `folderSearchPlaceholder`, `fieldSearchPlaceholder`, `panelSearchEmpty` (uk/en/de).

## Out of scope
`DisplayGroupsPanel` CardHeader unchanged.
