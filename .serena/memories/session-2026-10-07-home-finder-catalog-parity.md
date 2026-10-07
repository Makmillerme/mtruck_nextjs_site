# Homepage finder data = catalog filter parity (2026-10-07)

## What changed
Home facets are built with the same pipeline as catalog:
- `toPublicFacet` + `numberBoundsForAttribute` + `sortPublicFacets` (from `lib/catalog/public-filter.ts`)
- Gate: `showInHomeFilter` (catalog still gates with `isFacet`)
- Includes `dependsOnKey` / `parentSlug` (no longer skip dependent fields)

## Live narrowing
`HomeFinderPayload.availability` = `fetchFilterAvailabilityIndex()`.
`CategoryFinderPanel` runs `narrowFacetsForFolder` on the active folder slug + draft chips/ranges — same as catalog client narrowing. Empty option lists are hidden.

## Availability index
Specs loaded for `isFacet OR showInHomeFilter` so homepage-only fields still narrow.

## Types
`HomeFinderFacet` mirrors public facet shape (`dependsOnKey`, `parentSlug`). UI Lab mock updated + `availability: { rows: [] }`.
