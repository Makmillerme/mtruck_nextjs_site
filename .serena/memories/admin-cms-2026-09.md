# Admin CMS tips → info tip (2026-09)

- Removed visible ledes/titles on CMS folders/fields that admins ignore:
  - Card «Структура каталогу» + `foldersHint`
  - `foldersLede` next to root folder button
  - `inheritHint` in fields card header
- Replaced with `components/admin/catalog/admin-info-tip.tsx`: circular outline `i` button + shadcn Tooltip (hover).
  - Toolbars: action left (`outline` sm) + info tip right (`justify-between`)
  - Tip copy: `foldersHelp.p1–p3` / `fieldsHelp.p1–p3` (uk/en/de) — general CMS usage, no product-brand examples
  - `CatalogAdmin.helpLabel` for aria-label (uk/en/de)
- CMS tabs full width like cabinet: `cms-tabs.tsx` → `TabsList className="w-full sm:w-full"`, triggers `sm:flex-1` (overrides primitive `sm:w-auto` / `sm:flex-none`).
