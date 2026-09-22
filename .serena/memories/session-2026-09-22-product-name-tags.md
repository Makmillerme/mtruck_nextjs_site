## Product name tags + extra text (2026-09-22)

When `writesProductName` template exists on folder:
- Sheet name row shows `ProductNameTags` (Badge `tag`/`soft`) for each member — live value when spec filled, else attribute name.
- Separate `nameExtra` input appends after composed parts (same separator).
- Settings dialog preview also uses tags.
- Server: `resolveProductNameWithExtra(nodeId, specs, nameExtra)` on create/update.

Helpers: `resolveDisplayGroupParts`, `joinProductName` in `lib/catalog/display-group.ts`.
Component: `components/admin/products/product-name-tags.tsx`.
