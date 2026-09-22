# Admin products roots nav (2026-09-22)

## UX
- Sidebar «Товари» expands when taxonomy has ≥1 roots; children = root names → `/admin/products?root=<id>`.
- Submenu chrome: `ml-3 border-l border-border pl-2` (same as CMS `folder-tree.tsx`).
- Parent toggles expand; open by default on products routes.

## Scope / rename
- `?root=<uuid>` stable when renaming name (rename does not change slug either).
- Public `?folder=<slug>` also stays valid on rename — slug is not regenerated.
- `collectSubtreeNodeIds` + page filter; create defaults folder to list root, picker unlocked.
