# Option search + create modal (C) (2026-10-06)

## UI (`option-editor.tsx`)
- Toolbar: `LuSearch` + search Input + outline `LuPlus` «Додати»
- Client filter on option/parent labels
- Tags: `Badge tag` + gallery delete; depends = `label · parent` one wrap (no per-parent sections)
- Create: Dialog `z-[110]` → CatalogForm + createAttributeOptionAction
  - Independent: label only
  - Depends: CatalogMenuSelect parent (searchable) + label
- Empty parents: `addParentOptionsFirst` only

## i18n CatalogAdmin (uk/en/de)
createOptionTitle, optionSearchPlaceholder, optionSearchEmpty, optionParentLabel/Placeholder/Search

## Verify
Марка: search + dialog label. Модель: tags `R450 · Scania` etc.; dialog parent+label.