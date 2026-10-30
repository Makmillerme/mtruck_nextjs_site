# Display templates UI split — 2026-10-30

## Done (plan S)
- `display-groups-panel.tsx`: two Cards — name template vs PDP spec sections
- Create/edit sheets force `writesProductName` on/off via hidden input (no toggle)
- Add name template disabled when own writer already exists
- i18n uk/en/de: `nameTemplate*` + `specSection*` keys; `productNameFromDisplayGroup` wording
- Backlog note: no COMPOSITE field type

## Unchanged
- Prisma DisplayGroup / Member
- resolveDisplayGroupString, buildProductSpecGroups, CardPreview
