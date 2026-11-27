## Product status / availability badges (updated 2026-11-27)

### ProductStatus (commercial)
- `DRAFT` | `PUBLISHED` | `RESERVED` | `SOLD`
- **Removed** `PREPARING` (db push --accept-data-loss)
- Admin label for RESERVED: **Заброньовано** (not «Резерв»)
- Admin table: colored status + availability tags; DRAFT rows tinted `bg-slate-500/5`

### ProductAvailability (logistics)
- `IN_STOCK` | `TRANSIT` | `ON_ORDER`

### Public badge resolver (`lib/catalog/product-availability-badge.ts`)
- Priority: SOLD > RESERVED (yellow/amber) > TRANSIT / ON_ORDER / **IN_STOCK** (emerald — always shown again)
- `chipClassName` for PDP buy-box soft colored chips (same palette as card dots)
- Storefront where: PUBLISHED | RESERVED
- Order CTA only when status === PUBLISHED

### UI Lab
- PDP section «Публічні бейджі статусу» with colored chips