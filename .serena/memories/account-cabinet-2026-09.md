## Account cabinet (2026-09, settings polish)

## Layout
- Canonical: `/account?tab=orders|favorites|settings` (path aliases redirect).
- Heart navbar → `/account?tab=favorites` directly.
- Shell: `AccountShell` — breadcrumbs + `UserCodeChip`; tabs in `AccountCabinetView`.
- `account/layout.tsx` calls `ensureUserCode` once.
- Perf: see `mem:account-cabinet-perf-2026-09` (tab-scoped SSR, soft-nav, cards, optimistic).

## Settings (premium compact)
- One `max-w-2xl` Card `rounded-sm`:
  - Identity: avatar + camera → Dialog avatar upload; name title + email once; outline «Змінити пароль» Dialog.
  - Form: name + phone only; Save default aligned end.
  - Session: border-t row inside same card (destructive sign-out).
- No duplicate email field, no instructional CardDescription, no second sign-out Card.

## User code chrome
- `UserCodeChip` on breadcrumbs, mobile sheet, desktop dropdown.
