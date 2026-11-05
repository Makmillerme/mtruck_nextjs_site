/**
 * Report TaxonomyNode rows deeper than TAXONOMY_MAX_DEPTH (3 levels: 0/1/2).
 * Read-only — does not mutate data.
 *
 *   npx tsx --env-file=.env scripts/audit-taxonomy-depth.ts
 */
import { findTaxonomyNodesBeyondMaxDepth, TAXONOMY_MAX_DEPTH } from "../lib/catalog/taxonomy";

async function main() {
  const deep = await findTaxonomyNodesBeyondMaxDepth();
  if (deep.length === 0) {
    console.log(`OK: no folders deeper than ${TAXONOMY_MAX_DEPTH} levels.`);
    return;
  }
  console.log(
    `WARN: ${deep.length} folder(s) at depth >= ${TAXONOMY_MAX_DEPTH} (max index ${TAXONOMY_MAX_DEPTH - 1}):`
  );
  for (const row of deep) {
    console.log(`  depth=${row.depth}  ${row.slug}  (${row.name})  id=${row.id}`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
