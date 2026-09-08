# MTruck Next.js Site — Project Overview

## Status (2026-08-20)
- Workspace: `D:\\Project\\mtruck\\mtruck_nextjs_site`
- Serena project: `mtruck_nextjs_site` (TypeScript LS)
- Cloned into workspace root from `arnobt78/Ecommerce-Online-Shop-Platform-3--NextJS-Serverless-FullStack`
- Package name: `next-store` v1.0.1
- Next.js **16.3.1**, React **19.2.8**
- Auth: **Better-Auth** (Clerk uninstalled). See `mem:auth-better-auth`.

## Business goal
Car sales website, built on this e-commerce template.

## Current stack
- Next.js **16.3.1** App Router, React **19.2.8**, TypeScript
- Tailwind CSS **v3** + shadcn/ui (Radix)
- Prisma **5.22** + PostgreSQL via PostgressOps PgBouncer `:6432`
- Auth: Better-Auth 1.7.1 (email/password + optional Google). No GitHub. No Clerk.
- Payments: none. Stripe removed — cars are not sold via web checkout
- Media: local `public/uploads/products/` (not Vercel Blob)
- Forms: Zod + React `useActionState`

## Top-level layout
- `app/` App Router
- `components/` UI + features
- `lib/auth.ts`, `lib/auth-client.ts`
- `utils/` (server actions in `utils/actions.ts`, session in `utils/session.ts`)
- `prisma/` schema + seed
- `public/` static assets
- `proxy.ts` Better-Auth cookie gate (Next 16)

## Locked decisions
- Database: Prisma + Postgres (not Payload)
- Telegram: not in this repo
- Auth: Better-Auth, no GitHub

## Next steps
- Domain: adapt Product model to vehicles
- Google OAuth credentials when the user has a Cloud client
- Do not start `npm run dev` unless asked
