# VPS overload diagnosis (2026-08-20)

Server: `91.239.232.91` / `server2102.server-vps.com`
RAM: **1.9 GiB**, **swap = 0**. Disk ~36% used (not the bottleneck).

## What caused hang / CPU 100%

Primary cause: **RAM exhaustion (OOM)**, not Postgres data size.
- Kernel repeatedly OOM-killed processes on previous boots (Aug 10–17): mainly `next-server` (~390–450 MB RSS), also `unicorn` (Odoo).
- Once `postgres` itself invoked oom-killer (Aug 10).
- No swap → when RAM ends, kernel thrash + SSH freeze + panel shows CPU ~100%.
- Hosting panel bandwidth skew (mostly IN) is secondary; disk OK.

## After reboot (~13:46 UTC+3)
- Load low again; CPU idle-ish.
- Still tight: ~1.1 GiB used / ~0.8 GiB available with apps just started.
- Postgres: `shared_buffers=512MB`, `max_connections=100`, ~28 sessions; DBs tiny (fitapp/mtruck_* ~8–9 MB each).

## Co-located consumers (same 2 GB box)
Docker: postgres, pgbouncer, pg_backup, prometheus, postgres_exporter, komerciya_mtruck_next, mtrucklending, portfolio-*, odoo_app, odoo_db.
Host: **two** `m_truck_bot` Python processes (~147 MB each), next-server(s), dockerd.

## Recommended fixes (not applied yet — wait for user confirm)
1. Soften PG for shared 2 GB: lower `shared_buffers` (e.g. 128–256MB), `effective_cache_size`, `max_connections`, `work_mem`.
2. Docker mem limits on postgres/pgbouncer/monitoring.
3. Add swap (1–2 GB).
4. Reduce co-location (move Odoo / second bot / portfolio) or upgrade RAM.

Stack path: `/root/apps/PostgressOps`.
