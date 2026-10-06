# Field edit sheet parity + flag hints (2026-09-29)

## Done
- Edit CMS field sheet matches create: `type`, `dependsOnAttributeId`, unit, sheetWidth, flags.
- `updateAttributeSchema` + `updateAttributeAction`: on type/dependsOn change, transaction deletes ProductSpec + AttributeOption for that attribute, then updates definition. Non-SELECT forces dependsOn null; leaving SELECT blocked if dependents exist.
- Flags: vertical `grid gap-2` via `FieldFlags` in fields-panel (create+edit).
- `CatalogFlag` optional hint + `AdminInfoTip size="sm"` (text-sized circle); tip outside label so click does not toggle checkbox.
- i18n uk/en/de: `flagIdentity` without make/model; `flagRequiredHint`, `flagFacetHint`, `flagIdentityHint`.

## Identity meaning
`isIdentity` SELECT: first filled option label → Product.company when company empty (`product-specs.ts` / create-update product actions).

## Files
fields-panel.tsx, catalog-fields.tsx, admin-info-tip.tsx, taxonomy-schema.ts, taxonomy-actions.ts, messages uk/en/de.