# FarmKibitka

Dedicated **Rust** server configs, deploy scripts, and Carbon plugins.

| | |
|---|---|
| **Hostname (browser name)** | `FarmKibitka` |
| **Description** | Farm Kibitka — a house for farming |
| **Mod framework** | Carbon (vanilla first — no plugins yet) |
| **VPS** | Hosting Ukraine Shared CPU VPS 12G (`173.242.62.135`) — coexists with site + Telegram bot |
| **Install path (planned)** | `/opt/rustkibitka` |

> **Hostname** in Rust = the name shown in the server browser / friends list. Not the Linux machine hostname (`vps-60014`).

## Repo layout

```
deploy/          # install / update / Carbon helpers (run on the VPS)
systemd/         # unit templates
server/          # example cfg + placeholders (no game binaries)
plugins/         # Carbon C# plugins (later)
docs/            # ops notes
```

## Safety

This VPS already runs production site + bot + Postgres. Do **not** delete Docker containers, `/srv/mtruck/**`, or databases. Rust must live under `/opt/rustkibitka`.

See `.cursor/rules/vps-cohabitation-safety.mdc`.

## Local workflow

1. Edit configs / plugins here.
2. Commit to git.
3. Deploy to the VPS when ready (scripts under `deploy/` — not run until you approve).

Secrets: copy `.env.example` → `.env` on the server only.

## Status

Local scaffold. Game files **not** installed on the VPS yet.
