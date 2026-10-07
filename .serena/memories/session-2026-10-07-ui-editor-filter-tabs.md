# UI editor tabs + filter config phase 1 (2026-10-07)

## Done
- `/admin/ui`: `UiEditorTabs` (CmsTabs canon — TabsList w-full, SoftNavPending, `?tab=` + keep `?node=`).
- Tabs: filter | cardPreview | productCard | layout. Stubs for last three via `UiEditorStubPanel`.
- `parseUiEditorTab` in `lib/admin/ui-editor-tab.ts` (server-safe; not from client module).
- Filter tab `FilterSettingsPanel`: CascadeSelect tree folder picker; Checkbox `showInFilter`; list own (non-inherited) attributes with Checkbox `isFacet`; TEXT disabled.
- Actions: `setNodeShowInFilterAction`, `setAttributeIsFacetAction` in `utils/taxonomy-actions.ts` + schemas; `revalidateCatalog` includes `/admin/ui`; `revalidatePublicCatalog` also `updateTag` filterSchema + availability.
i18n: `UiEditor.*` uk/en/de; `CatalogAdmin.textCannotBeFacet`.

## Verified
- Page loads; select Контейнеровози; toggle facet checkbox checked↔unchecked persists after refresh path.
- Direct URL `?tab=cardPreview` shows stub.

## Next
Card preview / product card / layout editors.
