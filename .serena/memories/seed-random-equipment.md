# Random equipment seed

**Date:** 2026-11-03

**Script:** `scripts/seed-random-equipment.mjs`

Fills MULTI_SELECT attribute `equipment` (Комплектація) for every non-archived product:
- upserts `ProductSpec` for equipment
- replaces `ProductSpecOption` rows with a random subset of 5–12 options from the pool (25 options)

**Last run:** 25 products updated, optionPool=25.

Run: `node scripts/seed-random-equipment.mjs`
