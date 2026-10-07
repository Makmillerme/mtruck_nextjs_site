# Field showInHomeFilter (2026-10-07)

## Schema
`AttributeDefinition.showInHomeFilter Boolean @default(true)` — independent of `isFacet` (catalog).

## Admin
`FieldFlags` in `fields-panel.tsx`: checkbox `flagFieldShowInHomeFilter` under catalog facet flag. Badge on field row. i18n uk/en/de + hints.

## Homepage finder
`facetsForNode` includes fields with `showInHomeFilter` (not `isFacet`); skips TEXT and dependsOn.

## Plate fill
`CategoryFinderPanel`:
- All SELECT/BOOLEAN home facets as chip rows (make/brand first)
- All NUMBER/YEAR as ranges in 12-col rows of 3
- CTA fills leftover cells on last partial row, or full row if last row is full / no ranges

## Ops
`prisma db push` applied. Generate needed after killing process locking query_engine DLL.