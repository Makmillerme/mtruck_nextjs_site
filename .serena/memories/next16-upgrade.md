# Next.js 16 upgrade (2026-08-20)

## Result
- next **16.3.1** (from 14.2.35)
- react / react-dom **19.2.8**
- @types/react 19.2.18, @types/react-dom 19.2.4
- eslint-config-next 16.3.1, eslint **9.39.5** (codemod briefly installed eslint 10 which broke eslint-plugin-react; pinned back to 9)
- Typecheck: `npx tsc --noEmit` passes
- Dev server was NOT started

## Required companion upgrades
- `@clerk/nextjs` 5.1 → **7.7.9** (Next 16 needs Clerk v7 + `proxy.ts`)
- `next-themes` 0.3 → **0.4.6** (React 19 peer)
- Stripe React client left on v2 to avoid rewriting Embedded Checkout; install with `--legacy-peer-deps`

## Code changes
- `middleware.ts` → `proxy.ts`; `await auth.protect()`
- `params` / `searchParams` are `Promise<...>` (products list/detail, admin edit, sign-in)
- `await auth()` in actions, cart, product page, FavoriteToggleButton
- Clerk Core 3: `SignedIn`/`SignedOut` → `<Show when="signed-in|signed-out">`; `ClerkProvider` inside `<html>/<body>`
- Sign-in uses `useSignIn` from `@clerk/nextjs/legacy`; OAuth types from `@clerk/nextjs/types`
- SignUp `afterSignUpUrl` → `forceRedirectUrl`
- `useFormState` → `useActionState` from `react`
- ThemeProvider types from `next-themes` (no `dist/types`)
- lint script: `eslint .`; new `eslint.config.mjs`; removed `.eslintrc.json`
- tsconfig: target ES2017, jsx react-jsx, include `.next/dev/types`
- `npx next typegen` generated `next-env.d.ts`

## Not done in this pass
- Tailwind v4
- Prisma 7
- Stripe Embedded Checkout v6 API rewrite
- Domain adaptation to cars
- `npm run dev` / env files / DB provision
