# Depends placeholder + cascade menu in product sheet (2026-09-29)

## Placeholder
`ProductSpecFields` disabled dependent SELECT uses `dependsOnPlaceholder` with parent field name (`Залежить від {field}`), not generic `dependsOn`.
i18n: CatalogAdmin.dependsOnPlaceholder uk/en/de.

## Folder picker
`ProductFolderPicker` and product move Dialog CascadeSelect no longer force `variant="tree"` — default `menu` (hover submenus), same as CMS TemplateFolderPicker «Оберіть папку».
Tree variant remains for UI Lab sheet demo only.
