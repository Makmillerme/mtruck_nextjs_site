# Products columns cleanup (2026-09-29)

Removed `featured` and `company` from toggleable system table columns — leftover furniture/e-com fields; not useful for truck listings table (featured stays as filter only; company filled via identity, not a table column).

System columns now: `status`, `availability`, `price`.

Columns sheet split into two sections with headings:
- `columnsSystemSection` / `columnsCatalogSection` (uk/en/de)

Stale localStorage keys for featured/company are dropped on load via SYSTEM_COLUMN_IDS filter.