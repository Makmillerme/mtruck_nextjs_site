# Google OAuth (2026-08-20)

User created Google Cloud client for project mtrucksite.

- Keys live in gitignored `.env` (not `.env.example`).
- `.env.local`: `NEXT_PUBLIC_GOOGLE_AUTH=true` so the Sign-in/Sign-up Google button actually calls `signIn.social`.
- Redirect: `http://localhost:3000/api/auth/callback/google`
- Origin: `http://localhost:3000` (no path).
- `lib/auth.ts` already adds Google provider when both env vars are non-empty.
- Need a **restart** of Next after env change. Do not start `npm run dev` unless asked.

Never put Client Secret in `.env.example` (it is committed).

`next.config.mjs` allows `*.googleusercontent.com` for Google profile photos in `next/image` (UserProfileDropdown). Config change may need a Next restart.
