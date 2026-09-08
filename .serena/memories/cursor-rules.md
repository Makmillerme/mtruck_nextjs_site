# Cursor rules for MTruck (2026-08-20)

`.cursor/rules` adapted from the previous product clone to **this** repo.

## Always-apply
- `mtruck-stack.mdc` — Next 16.3, Tailwind v3, shadcn `components/ui`, react-icons, Zod+useActionState, Better-Auth, Prisma/PostgressOps, no Payload/Telegram/Clerk/GitHub OAuth
- `senior-agent-workflow.mdc`, `serena-editing.mdc` — activate `d:\\Project\\mtruck\\mtruck_nextjs_site`, paths `app/` not `src/app/`
- PostgressOps operator + phone-dev + UK layout decode from **this** repo

## File-scoped
- `auth-better-auth.mdc`, `prisma-postgres.mdc`, visual assets for `public/uploads/products` + Embla

## Removed
- `kanban-dnd-constraints.mdc` (wrong product)

## Also retargeted
Commands: `serena`, `uk-layout`, `init`, `bot-init`, PostgresOps example.
Skills: backend/fullstack Prisma-only; Telegram skills gated.
Backlog file: `docs/backlog/ideas.md`.

User-level Cursor rules may still mention Payload/Telegram/Auth.js; **project rules override** for this workspace.
