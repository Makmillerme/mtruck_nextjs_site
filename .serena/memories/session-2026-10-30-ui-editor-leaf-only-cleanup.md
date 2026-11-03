# UI Editor leaf-only enforcement (2026-10-30)

- Removed subtitle label «Поля підзаголовка» + categoryAlwaysProductFolder hint.
- Defaults: `firstLeafTreeNodeId`; non-leaf `?node=` redirected to first leaf via `resolveLeafEditorNodeId` + UrlSync.
- Deleted CardPreviewLayout / ProductPageLayout on non-leaf taxonomy nodes (`scripts/cleanup-non-leaf-layouts.mjs`).
- CascadeSelect leafOnly already on both editors.
