## Fix: red notifications badge stuck after opening inquiries (2026-11-04)

### Cause
- Unread = `CallbackInquiry` with `readAt: null`.
- `AdminInquiriesView` already called `markCallbackInquiriesReadAction` on mount, but:
  1. only `revalidatePath('/admin/sales/inquiries')` — Navbar in root layout kept stale `unreadCount`
  2. `NotificationsButton` `liveCount` (Pusher bumps) stayed high with no client clear / `router.refresh()`

### Fix
- `markCallbackInquiriesReadAction` + `updateCallbackInquiryStatusAction`: also `revalidatePath('/', 'layout')`
- `AdminInquiriesView`: after successful mark-read → `router.refresh()`
- `NotificationsButton`: force `liveCount=0` on `/admin/sales/inquiries` pathname and on dropdown link click
