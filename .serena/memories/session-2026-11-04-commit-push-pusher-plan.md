# Session 2026-11-04 — commit/push + Pusher plan

## Done
- Local commit `08fb1af`: CTA inquiries admin, cart-like account orders, favorites layouts/grid, notification badge, backlog smart-chat entry.
- Smart chat written to `docs/backlog/ideas.md` (Pusher transport + manager/AI later).

## Push
- `git push origin main` failed repeatedly with GitHub `remote: Internal Server Error` (Request IDs E198…, F597…, F5A3…). Local branch `main` ahead 1 of `origin/main`.
- Retry when GitHub recovers; do not force-push.

## Next (user plan)
1. ~~Commit current state~~ (local done; remote pending)
2. Connect Pusher — **waiting for user credentials** (app id, key, secret, cluster)
3. Live notifications over Pusher
4. Smart chat — backlog only (already recorded)

## Packages expected for Pusher
- `pusher` (server) + `pusher-js` (client)
- Env: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` (+ `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`)
