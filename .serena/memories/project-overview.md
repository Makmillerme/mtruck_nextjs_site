# rustkibitka

Game-server repo for a Facepunch Rust dedicated server. Workspace was empty on 2026-11-27. The dedicated process runs on the user's VPS; this repo is for configs, deploy scripts, and custom plugins.

## Intent
- Host a public Rust server on the user's VPS.
- Develop mods and optimize the server together in this repo.

## Confirmed decisions (2026-11-27)
- Mod framework: Carbon. Oxide is out. Carbon is installed from day one so later plugins do not require a migration. Gameplay stays vanilla until we add plugins.
- First server mode: vanilla. No kits, economy, teleport, or custom plugins in the first deploy.
- Process: systemd on Linux. SteamCMD app 258550. Docker is not the plan.
- Ports: game/query UDP 28015, RCON TCP 28016 bound to localhost or a firewall allowlist.
- Plugins later: C# `.cs` in this repo, synced to `carbon/plugins` on the VPS.

## VPS (confirmed)
Provider: [Хостинг Україна](https://www.ukraine.com.ua/vps/) (`www.ukraine.com.ua`). User already owns this machine (not a plan to buy later).
Plan: **Shared CPU VPS 12G** — 6 vCPU AMD EPYC, 12 GB RAM, 100 GB NVMe, 10 Gbit/s, 20 TB. Price on site ~37.67 €/mo (~1929 UAH in panel). Location: Ukraine, Kyiv.

Shared CPU policy (from provider FAQ): short spikes to 100% OK; average >80% for 6+ hours or >50% per day may trigger CPU limit or upsell to Dedicated CPU. Resource stats are in the VPS panel (CPU last 24h, RAM 7d).

Assessment for Rust (vanilla + Carbon, no plugins yet): RAM and disk are adequate. Main risk is sustained CPU on Shared; start with worldsize 3500, maxplayers ~40, nothing else on the same VPS. If the panel shows long high CPU after wipes, upgrade in-place to NVMe VPS 12G (Dedicated) without changing RAM.

Panel extras: WebSSH, firewall rules, backups every 4 days — use manual backup before first Rust install.

## GitHub
- Public repo: https://github.com/Makmillerme/rustkibitka
- Local `origin` → HTTPS; `main` pushed and tracking.
- SSH push failed (local ed25519 not authorized on GitHub). Prefer HTTPS + PAT from Cursor GitHub MCP, or add the SSH pubkey / `gh auth login`.

## Still open
- Seed / wipe schedule.
- Approve first install on VPS under `/opt/rustkibitka` (do not touch site/bot).

## Hardware note
Practical floor is about 4 vCPU and 8 GB RAM for a small vanilla population. A modded server with a busy map wants about 6–8 vCPU and 16 GB RAM, and 40 GB SSD.

## Naming
- Rust browser hostname: **FarmKibitka**
- Description: **Farm Kibitka — a house for farming**

## Status
Local git initialized (`main`, commit `feat: scaffold FarmKibitka Rust server repo`). Scaffold: deploy scripts, systemd, .env.example, docs. VPS not installed yet. GitHub remote pending (gh not logged in).
