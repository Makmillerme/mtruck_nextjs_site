# Field formation templates (2026-10-30)

## What shipped
- `DisplayGroup.targetAttributeId` (FK → AttributeDefinition, Cascade) + existing `writesProductName`.
  - null + writesProductName → Product.name
  - set target → TEXT ProductSpec.textValue
- `lib/catalog/display-group.ts`: `resolveFormationTemplates`, `applyFormationTemplates`, `regenerateFormationInFolderSubtree`, `mergeFormationIntoSpecs`.
- CMS panel `display-groups-panel.tsx`: «Шаблон формування поля» — target picker (Name + TEXT), members, confirm regenerate.
- Product sheet: gear/`ProductNameSettingsDialog` removed; plain name Input + TEXT autofill via `formationAutoValues` on `ProductSpecFields`.
- create/update product apply formation for empty/previous-auto TEXT specs.
- i18n uk/en/de `formation*` keys; backlog COMPOSITE → replaced by formation templates.

## Ops note
- `prisma db push` applied; `prisma generate` OK.
- Config only in CMS data model on selected folder (any node).
