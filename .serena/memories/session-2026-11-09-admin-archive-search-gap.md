# Admin archive mobile gap + search (2026-11-09)

## Gap
Admin layout stacked sidebar+content with `gap-8` → large space under nav on phone.
Fix: `gap-4 lg:gap-8` in `app/[locale]/admin/layout.tsx`.

## Search
Archive had tabs/table only, no toolbar. Added `AdminListToolbar` (search-only; create optional) + client filter per tab.
i18n: `Admin.searchArchivePlaceholder` (uk/en/de).

`AdminListToolbar` create props now optional for read-only lists.