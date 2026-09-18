## Account cabinet (2026-09, settings polish)

## Layout
- Routes: `/account` → `/account/orders`. Tabs: orders, favorites, settings.
- Shell: `AccountShell` — framed Tabs, breadcrumbs + `UserCodeChip`, page.
- `account/layout.tsx` calls `ensureUserCode` once.

## Settings (premium compact)
- One `max-w-2xl` Card `rounded-sm`:
  - Identity: avatar + camera → Dialog avatar upload; name title + email once; outline «Змінити пароль» Dialog.
  - Form: name + phone only; Save default aligned end.
  - Session: border-t row inside same card (destructive sign-out).
- No duplicate email field, no instructional CardDescription, no second sign-out Card.

## User code chrome
- `UserCodeChip` on breadcrumbs, mobile sheet, desktop dropdown.
