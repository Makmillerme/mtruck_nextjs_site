# PostgressOps full audit 2026-08-20

## Status
Services healthy: postgres, pgbouncer, pg_backup, exporter, prometheus.
Host: 1.9Gi RAM, no swap; after Odoo/portfolio/bot-dup cleanup ~1Gi available.
DBs tiny (~8–9MB each). Cache hit ~98%. ~21 idle backends.

## Over-tuned for shared VPS (live)
- shared_buffers=512MB, effective_cache_size=1536MB, max_connections=100, work_mem=8MB
- wal_keep_size=1GB, max_wal_size=2GB
- No Docker mem_limit on any stack service
- Comment in conf says "2GB dedicated" but host is shared with Next/bot/lending

## Gaps / bugs
1. `scripts/healthcheck.sh` uses `find -printf` inside alpine `pg_backup` → unsupported → false WARN/exit fail on backups (backups actually OK: daily full_*.sql.gz through 2026-08-20).
2. PgBouncer maps: mtruck_nextjs, vmd_parser, fitapp, postgres — **mtrucklending not mapped**.
3. Per-db `.dump` files present for fitapp/mtrucklending/vmd_parser; **no mtruck_nextjs_*.dump** seen (full dumpall should still cover it — verify).
4. WAL archive volume empty (archive_mode=on) — low churn or archive_command unused.

## Recommended apply (await user confirm)
PG: shared_buffers 128–256MB; effective_cache_size 512–768MB; max_connections 40–50; work_mem 4MB; maintenance_work_mem 64MB; wal_keep_size 256MB; max_wal_size 1GB.
Compose: mem_limit postgres~768M, pgbouncer~64M, prometheus~128M (or retention 7d / optional off).
Host: add 1–2G swap.
Fix healthcheck find; map mtrucklending if used via 6432.
