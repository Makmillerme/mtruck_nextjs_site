# Page shells (named max-widths) — 2026-10-26

## Canon

Named content width ceilings on top of existing gutters (`.page-container` / `.page-content`). Navbar/Footer stay fluid — no per-route max-width on chrome.

| Shell | Max | Marker / class | Where |
|-------|-----|----------------|-------|
| home | 1360px | `data-page-shell="home"` + CSS on inner `.page-container` | `app/[locale]/page.tsx` |
| catalog | 1920px | `.page-content.page-shell-catalog` + `data-page-shell="catalog"` | `ProductsContainer` |
| product | 1520px | `data-page-shell="product"` → `main:has(…) > .page-container` | PDP `app/[locale]/products/[id]/page.tsx` |
| reading | 1280px | `.page-shell-reading` | Nested text blocks on PDP (description) |
| admin | none + 32px gutter (≥40rem) | `data-page-shell="admin"` | `app/[locale]/admin/layout.tsx` |

## Tokens / CSS

- `:root`: `--shell-home|catalog|product|reading`
- Classes: `.page-shell-*` in `app/globals.css`
- Route `:has([data-page-shell])` rules for layout wrapper when outer is `contents` (catalog) or when marker is inside main (product/admin)

## API

`components/global/Container.tsx`:
- `PAGE_SHELLS`, `PageShell`, `pageShellClassName`
- optional prop `shell?: PageShell` adds the matching class

## UI Lab

`components/dev/ui-lab-layout.tsx` → RuleCard «Shell widths». Catalog hint/keywords updated.

## Related

- PDP checkpoint before shells: commit `35da84a`
- Gutters still: `mem:layout-page-container-gutters-2026-09`
- Earlier exploration: `mem:session-2026-10-26-layout-width-modes`
