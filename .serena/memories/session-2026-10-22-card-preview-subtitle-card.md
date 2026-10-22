# Card preview — subtitle settings as own card (2026-10-22)

`card-preview-editor.tsx`: subtitle settings (categorySource + MemberOrderPicker) moved out of Visibility into a separate `Card`, same pattern as Specs.

- Visibility: switches only (name/price/status/subtitle/specs)
- `showSubtitle` → Card `subtitleSectionTitle` (i18n uk/en/de)
- `showSpecs` → Card `specsSectionTitle`
