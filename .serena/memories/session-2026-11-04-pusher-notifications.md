# Session 2026-11-04 — Pusher + live inquiry notifications

## Gallery (done before interrupt)
- PDP page gallery: `flex h-full flex-col gap-3`; stage `flex-1`; thumbs `shrink-0` + `p-0.5` (ring not clipped).
- Lightbox sidebar: `.app-scroll`.
- Height aligns with buybox again.

## Pusher (mtruck_site)
- Packages: `pusher` + `pusher-js`
- Env in `.env` (gitignored): `PUSHER_APP_ID/KEY/SECRET/CLUSTER` + `NEXT_PUBLIC_PUSHER_KEY/CLUSTER` (eu, app 2209374)
- `.env.example` placeholders added
- `lib/realtime/channels.ts` — `private-staff-notifications` / `inquiry.created`
- `lib/realtime/pusher-server.ts` — trigger helper (no-op if env missing)
- `lib/realtime/pusher-client.ts` — singleton + authEndpoint `/api/pusher/auth`
- `app/api/pusher/auth/route.ts` — staff-only authorize for that private channel
- `submitCallbackInquiryAction` publishes after create
- `NotificationsButton` subscribes when `isStaff`, bumps badge + prepends preview

## Ops note
Restart `next dev` so `NEXT_PUBLIC_*` loads. Do not commit `.env` / secret.
