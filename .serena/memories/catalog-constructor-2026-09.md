# Catalog constructor (Handle-style) — 2026-09-11

Implemented admin constructor: folders + dependent fields + cascade options. Public `/products` facets still later. Furniture products kept.

## Data (Prisma, additive `db push`)
- `TaxonomyNode` tree (`parentId`, unique `slug`)
- `AttributeDefinition` on a folder (inherited by children): SELECT/NUMBER/TEXT/BOOLEAN/YEAR, `dependsOnAttributeId`, `isFacet`, `isIdentity`, `unit`
- `AttributeOption` with `parentOptionId` (R450 under Scania)
- `ProductSpec` EAV; `Product.taxonomyNodeId?`, `status`, `availability`

Hang **Марка** high in the tree so Scania is not duplicated per subtype.

## Admin
- Sidebar: `/admin/catalog` (`Admin.catalog`)
- Left: folder tree. Right: rename, child folder, inherited fields + «add dependent», own fields, options grouped by parent value.
- Actions: `utils/taxonomy-actions.ts`. Queries: `lib/catalog/taxonomy.ts`.

## Product create
- Folder picker reloads `?node=` then renders `ProductSpecFields` (cascade selects).
- Specs saved on create. `company` filled from first identity option if empty.
- Edit form still furniture-only.

## Seed
`seedCatalogTaxonomyIfEmpty`: Комерційна техніка → Вантажні авто / Причепи → Контейнеровози; make/model + year/mileage/power. Skips if any folder exists. Does not delete furniture.

## Not done
- Public facets / homepage finder from DB
- Taxonomy i18n (uk/en/de labels)
- Cart-per-folder
- Photo gallery
- Wipe furniture listings
