# Stop auto-seeding container leaf fields (2026-11-02)

## Why they reappeared
`ensureTruckCatalogFields` upserted `container_size` («Тип контейнера») and `twist_locks` («Твістлоки») on `kontejnerovozy` every run (`db:seed`, demo seed, `scripts/ensure-equipment-only.ts`). Not related to Комплектація MULTI_SELECT.

## Fix
- Removed that block from `lib/catalog/ensure-truck-fields.ts`.
- Demo seed attaches those specs only if attributes still exist.
- Deleted both attributes from DB for `kontejnerovozy`.

Leaf-only fields are CMS-managed; shared truck fields stay on `vantazhni-avto`.
