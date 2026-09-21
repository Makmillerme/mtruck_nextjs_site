# Filter clear icon + UI Lab first rule (2026-09-18)

- Clear filters moved from footer text button to header icon (`LuX`, UI Lab / sheet dismiss canon) opposite «Фільтр».
- `CatalogFilterProvider` + `CatalogFilterClearButton` share draft with fields; footer keeps only Apply.
- Sheet + Lab updated the same way.
- New always-apply rule: `.cursor/rules/ui-lab-first.mdc` — check UI Lab before inventing UI/icons.

## Follow-up
- Clear icon → `LuTrash2` (not LuX).
- Filter scroll body `pr-3` for gap before scrollbar.
- `/products` page shell: `full-bleed bg-secondary` (pastel only), cards stay white.
