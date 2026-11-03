# MULTI_SELECT / комплектація (2026-10-30)

## Model
- `AttributeType.MULTI_SELECT` — same option CRM as SELECT, multi-value.
- `ProductSpecOption` join: ProductSpec ↔ many AttributeOption.
- SELECT = one of many; MULTI_SELECT = many of many (checkbox UI).

## Runtime
- Form: `spec_options_{attributeId}` via getAll; sheet state comma-separated ids.
- create/update product + `diffProductSpecs` sync selectedOptions.
- Public facets / home finder: MULTI_SELECT excluded (phase 2).

## UI
- CMS type label «Чекбокси» / Checkboxes; OptionEditor for MULTI_SELECT (flat).
- Product sheet checkbox group.
- PDP tab «Комплектація» from `buildProductEquipmentGroups`.
