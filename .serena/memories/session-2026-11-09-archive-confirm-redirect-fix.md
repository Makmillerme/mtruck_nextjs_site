# Archive confirm + home redirect fix (2026-11-09)

## Bugs
1. Sheet «Архівувати» (`ConfirmDeleteFormButton`): confirm used `type=submit form=id` + `onClick=setOpen(false)` → dialog unmounted mid-submit; React form hit `javascript:throw … unexpectedly submitted` path → full navigation / broken UX (felt like no confirm + reload).
2. `requireAdminMutation()` called `redirectHome()` (`/`) when session/staff check failed inside server actions → after a broken form POST user landed on homepage.

## Fixes
- `ConfirmDeleteFormButton`: confirm is `type=button`, calls `form.requestSubmit()`, closes dialog in `queueMicrotask`.
- `requireAdminMutation`: always `throw new Error(forbiddenDelete)` (no redirect) — pages still use `getStaffUser` redirect.
- Sheet archive forms (sales/products/users): `onSuccess` removes row, clears sheet URL, stays on list.

## Verified
Archive from sales edit sheet → stays on `/admin/sales`, sheet closes, row gone (not `/`). Test order restored in DB after verify.
