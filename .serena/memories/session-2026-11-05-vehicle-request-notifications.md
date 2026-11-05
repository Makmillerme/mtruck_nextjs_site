# Vehicle REQUEST → staff notifications

**Date:** 2026-11-05

- `createUserRequestOrderAction` publishes `order.request.created` via Pusher after create.
- `loadNavbarStaffNotifications` counts unread callback inquiries + USER REQUEST orders with `status: NEW`.
- Preview items merged (top 5 by date); kind `inquiry` | `vehicle-request`.
- NotificationsButton: label `notificationsVehicleRequest`, link `/admin/sales?edit={id}`.
- On inquiries page, badge keeps only vehicle-request unread (callbacks marked read there).

Files: `lib/realtime/channels.ts`, `pusher-server.ts`, `utils/actions.ts`, `NotificationsButton.tsx`, `Navbar.tsx`, messages uk/en/de.