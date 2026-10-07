# showInHomeFilter — homepage filter in data model (2026-10-07)

## Decision
Homepage quick filter is NOT configured in `/admin/ui`. Same place as catalog: folder sheet flags.

## Schema
- `TaxonomyNode.showInHomeFilter Boolean @default(true)`
- Dropped `HomeFinderSettings` singleton.

## Admin
- Folder create/edit sheet: checkbox under `flagShowInFilter` → `flagShowInHomeFilter` («Показувати папку у фільтрі на головній»).
- Tree badges: `hiddenFromHomeFilter`.
- `/admin/ui` Filter tab = stub (`stubFilter`).

## Public
- `fetchHomeFinderPayload`: roots with `showInHomeFilter`; children same; roots row only if `roots.length > 1`.
- Plate layout kept: make chips + year/mileage + CTA.
