# Staff notifications mark-as-read

**Date:** 2026-11-05

- `Order.readAt` added (db push) for USER REQUEST notification unread state.
- `loadNavbarStaffNotifications` uses `readAt: null` (not status NEW).
- `markOrderRequestReadAction(orderId)` + revalidate layout.
- NotificationsButton: on item click → remove from list, call mark (request or all inquiries).
- Sales page `?edit=` for REQUEST → marks read.
- `markCallbackInquiriesReadAction` also revalidates `/` layout.