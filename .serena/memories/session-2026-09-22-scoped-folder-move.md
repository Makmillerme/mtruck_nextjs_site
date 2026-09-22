# Scoped folder picker + move product (2026-09-22)

## Revalidate
`revalidateCatalog()` now also `revalidatePath("/admin")` and `/admin/products` so Sidebar roots refresh after folder delete/rename.

## Scoped picker
- Under `?root=`, create/edit folder picker uses `getRootChildren(tree, listRootId)` only (no root label, no other roots).
- Default folder: first child; if no children → keep `listRootId` as hidden value.
- Helpers: `findNodeInTree`, `getRootChildren`, `firstTreeNodeId`, `isNodeInSubtree`.

## Cascade tree chrome
- Nest rail `ml-3 border-l border-border pl-2` for open children.
- `initialExpanded` only ancestors of selected path (not all branches).

## Move (edit only)
- Outline icon `LuArrowRight` beside picker → Dialog `z-[110]` with full-tree CascadeSelect → confirm sets `folderNodeId` + meta reload; save on submit.
