# Drop company / featured / isIdentity (2026-09-29)

## Done
- Prisma: removed `Product.company`, `Product.featured`, `AttributeDefinition.isIdentity`; `db push --accept-data-loss`
- CMS: Identity flag gone from FieldFlags / create/update attribute
- Specs: no `companyFromIdentity`
- productSchema: name required, no company/featured; description optional
- Catalog: no featuredOnly URL/filter; search by name only
- Admin products: no company/featured filters; Main name `required`
- Cards: categoryLabel from taxonomyNode / make spec
- Homepage `fetchFeaturedProducts` = latest published (no featured flag)
- Partnership form `company` kept
- Seeds/ensure-truck-fields cleaned

## Canon
Main tab = system (folder, status, availability, name, price required; photos+description optional). Specs = CMS isRequired.
