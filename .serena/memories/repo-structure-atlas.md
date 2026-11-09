# Repo structure atlas (prod vs non-prod)

Date: 2026-11-06. Human-readable copy: `docs/architecture/repo-map.md`.

## Layers

- **Prod runtime:** `app/`, `components/` (except Lab-only usage), `lib/`, `utils/`, `hooks/`, `public/` (static), `proxy.ts`, `i18n/`, `messages/`.
- **Prod build:** `prisma/schema.prisma` (+ generate), `package.json`, next/tailwind/ts/eslint configs.
- **Git / ops / agent (not site URLs):** `.cursor/` (rules, skills, commands, phone-dev scripts), `.serena/memories`, `docs/`, `scripts/` (seed/audit/migrate), `AGENTS.md`, `prisma/seed.ts`, `prisma/products.json`.
- **Local gitignored:** `.env`, `.next/`, `node_modules/`, `.cursor/tools/`, `.serena/cache/`, `project.local.yml`, `public/uploads/products/*` (keep `.gitkeep`).

## Routes notes

- `/ui-lab`: bundled but `notFound()` when `NODE_ENV === "production"`; admin required in dev. See `app/[locale]/ui-lab/layout.tsx`.
- `/contacts` → redirect `/contact`.
- `/reviews` + `components/reviews/`: furniture-template remnant — backlog, do not delete in hygiene pass.
- Games under `components/games/` only referenced from UI Lab.

## Hygiene done 2026-11-06

- Removed empty `components/cart`, `app/[locale]/cart`, empty `components/shadcn-space`.
- Removed untracked debug scripts: `scripts/debug-layout-reload.mjs`, `list-layouts.mjs`, `test-product-page-save.mjs`.

## Do not remove without explicit ask

UI Lab (`components/dev`, `/ui-lab`), games, `.cursor`, `.serena`.

Related: `mem:project-overview`, `mem:ui-lab-2026-09`, `mem:mtruck-stack` (rules).