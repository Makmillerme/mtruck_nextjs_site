# Demo vehicles seed — 2026-10-20

## Request
User asked for 20–30 catalog products without changing the Prisma/data model. They planned to delete the existing product first.

## Done
- Ran `npx tsx --env-file=.env scripts/wipe-seed-demo-vehicles.ts`
- Admin: `mtruck@admin.com`
- Result: deleted 0 existing products (already empty / user deleted), seeded **25** PUBLISHED demo vehicles
- Schema unchanged; uses existing taxonomy folders + shared attrs from `ensureTruckCatalogFields`

## Source
- `lib/catalog/seed-demo-vehicles.ts` — `wipeAndSeedDemoVehicles`
- Mix: ~10 контейнеровози (`kontejnerovozy`), ~8 тягачі (`tiahachi`), ~7 фургони (`furhony`)
- Images: Pexels remote URLs in `DEMO_GALLERY`
- Re-run anytime: `npx tsx --env-file=.env scripts/wipe-seed-demo-vehicles.ts` (wipes all products then re-seeds)

## Note
`npm run db:seed` / `prisma/seed.ts` may skip if products already exist — use the wipe script for a clean demo set.
