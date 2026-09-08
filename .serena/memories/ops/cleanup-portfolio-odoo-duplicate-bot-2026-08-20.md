# Cleanup 2026-08-20

## Duplicate bot root cause
Two enabled systemd units ran the **same** binary:
- `m_truck_bot.service` (kept, enabled) → `/root/apps/m_truck_bot/.venv/bin/python -m app.main`
- `truck-bot.service` (stopped+disabled) → same WorkingDirectory/ExecStart
Created Oct 6 and Oct 16 2025 respectively — accidental double-register, not two apps.

## Removed stacks (compose down, containers+networks removed)
- `/root/apps/portfolio` via `docker-compose.simple.yml` (`portfolio-app`, `portfolio-nginx`)
- `/root/apps/odoo` via `docker-compose.yml` (`odoo_app`, `odoo_db`)
App directories on disk kept; no systemd autostart units found for them.

## RAM after
~904 MiB used / ~1.0 GiB available (was ~1.1 GiB used / ~0.8 GiB available). Still no swap.
