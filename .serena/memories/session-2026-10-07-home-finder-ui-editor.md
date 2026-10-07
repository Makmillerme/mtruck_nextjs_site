# Home finder UI editor (2026-10-07)

## Canon: two filters
- `/products` catalog filter: CMS `showInFilter` + `isFacet` (unchanged).
- Homepage `#catalog` CategoryFinderPanel: `HomeFinderSettings` singleton + taxonomy children/facets.
- `/admin/ui?tab=filter` configures **homepage only** (not catalog flags).

## Schema
- Prisma `HomeFinderSettings`: id=`default`, showRootsBlock, rootIds JSON, defaultRootId, defaultChildId.
- Cache tag `CATALOG_CACHE_TAGS.homeFinder`; `revalidatePublicCatalog` also busts `/` + homeFinder.

## Code
- `lib/home/home-finder-shared.ts` — client-safe types + href/defaults.
- `lib/home/home-finder.ts` — server fetch/ensure + listRootOptions.
- `utils/home-finder-actions.ts` + schema.
- FilterSettingsPanel rewritten; SoftNav no longer wraps mutations (only tab SoftNav in UiEditorTabs).
- CategoryFinderPanel: no icons; roots premium row; child cards; live facets/counts.

## Note
- After schema: stop `next` if `prisma generate` EPERM on query engine DLL, then generate + restart.
- Mock `lib/home/category-finder.ts` remains for UI Lab brands only.
