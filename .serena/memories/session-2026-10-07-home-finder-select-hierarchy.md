# Homepage finder SELECT hierarchy (2026-10-07)

Chip/list facets (not number ranges) respect CMS `dependsOnKey` / `parentSlug` like catalog:

- Dependent SELECT row appears only after parent chip is chosen
- Options filtered to `parentSlug === parentChipValue`
- Changing/clearing parent runs `pruneDependentFacetValues` + clears orphans
- Chip order follows `sortPublicFacets` (dependency order), not ad-hoc make-first resort

`CategoryFinderPanel`: `selectOptionsForHierarchy`, `setChipWithHierarchy`, `parentChipValue` on `FacetField`.
