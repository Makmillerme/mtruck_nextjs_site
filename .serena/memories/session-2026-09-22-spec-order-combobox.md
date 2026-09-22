## Spec order + combobox (2026-09-22)

### Order
`resolveAttributesByKey` now sorts by folder path (senior → junior, first-seen `taxonomyNodeId`) then `sortOrder`.
Sheet display uses `sortSheetAttributes`: whole parent folder, then child folder; cascade only reorders inside its folder.

### Selects
`ProductSpecFields` SELECT uses `SearchableEntityPicker` (sheet canon). Picker gained `disabled` for cascade dependents.
