# CatalogAdmin — Categories + toast canon (2026-11-05)

## UI copy
- Public/admin wording: **Категорії** (not «Папки»). Tab key remains `tabFolders` in code; value is Categories / Категорії / Kategorien.
- Internal domain still uses TaxonomyNode / folder* i18n **keys** (`folderName`, `folderCreated`, …) — do not rename keys without a migration; only Ukrainian/EN/DE **values** say category.

## Toast canon (action-based, same as fields)
| Action | Key | UK |
|--------|-----|----|
| create | `folderCreated` | Категорію створено |
| update (rename + settings) | `folderUpdated` | Категорію оновлено |
| delete | `folderDeleted` | Категорію видалено |

Parallel field toasts: `fieldCreated` / `fieldUpdated` / `fieldDeleted`.

- Removed dead key `folderRenamed` («Назву папки оновлено»).
- `renameTaxonomyNodeAction` returns `t("folderUpdated")` — covers name + flags (showInFilter, productsAreUnique, etc.).

## Files
- `messages/{uk,en,de}.json` → CatalogAdmin category wording + toasts
- `utils/taxonomy-actions.ts` → folderUpdated on rename/update
- Notify path: action message → `notify.fromAction` / `notify.success(result.message)` via form/tree handlers

## Lab
- Toast UI: `components/dev/ui-lab-toast.tsx` — ToastContent + notify.success/error/fromAction; no Sonner.
