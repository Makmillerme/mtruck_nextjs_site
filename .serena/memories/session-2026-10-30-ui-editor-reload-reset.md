# UI Editor: settings appeared to reset after reload (2026-10-30)

## Cause (not DB wipe)
Layouts **persist** in Postgres. Example leaf `ebf02453-a976-4021-afc4-43244db4f945` (Контейнеровози):
- `CardPreviewLayout` present (GRID, specsGridCount 6)
- `ProductPageLayout` present (keyFactsMax 6, 1 TEXT tab «Тест»)

What looked like «reset»:
1. **Default node** after reload without `?node=` was `firstLeafTreeNodeId`, not a leaf that already has a layout → empty/default editor UI for a different folder.
2. Client editors synced `initial*` props only when `selectedNodeId` changed → could ignore fresh server props.
3. `loadLayoutRowForNode` used to **swallow** Prisma errors → empty payload (same look as reset). Now rethrows after log.

## Fixes
- `resolveDefaultCardPreviewNodeId` / `resolveDefaultProductPageNodeId`: prefer leaf with existing layout, else first leaf.
- `export const dynamic = "force-dynamic"` on `app/[locale]/admin/ui/page.tsx`.
- Remount keys on `CardPreviewEditor` / `ProductPageEditor`.
- useEffect sync all initial props (not only node id).
- Leaf-only save + cascade; non-leaf layouts cleaned earlier.

## Ops note
`PRISMA_CLIENT_GEN` in `utils/db.ts` (currently 4) — bump after schema/client regen if HMR keeps stale Prisma singleton.
