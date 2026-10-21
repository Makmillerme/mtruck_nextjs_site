# Session 2026-10-08 — CatalogMenuSelect role reset

## Bug
Admin user role change appeared broken after the DRAFT-status fix on `CatalogMenuSelect`.

## Cause
`useEffect` synced `value` from `defaultValue` with deps `[defaultValue, options]`.
Role (and many other) call sites pass an **inline** `options={[...]}` every render → effect re-ran → `setValue(defaultValue)` wiped the user's new selection before submit.

## Fix
`components/admin/catalog/catalog-fields.tsx` — sync only on `[defaultValue]` change (hydrate / new entity). Do not depend on `options` identity.

## Related
Same component used for product status — the earlier no-fallback-to-options[0] fix stays; only the effect deps were wrong.
