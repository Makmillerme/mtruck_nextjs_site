# Callback inquiries → admin (2026-11-03)

## Data
- Model `CallbackInquiry` + enum `InquiryStatus` (NEW | IN_PROGRESS | CLOSED)
- Fields: phone, optional productId/name/code, readAt, archivedAt
- `submitCallbackInquiryAction` persists rows; optional product context from CTA modal
- DB: `prisma db push` done. If `prisma generate` EPERM — stop `next dev`, regenerate, bump `PRISMA_CLIENT_GEN` in `utils/db.ts` (now 5).

## Admin
- `/admin/sales/inquiries` — list, status select, mark-all-read on open
- Sidebar **Продажі** accordion: Заявки (`/admin/sales/inquiries`) + Замовлення (`/admin/sales`)

## Header
- Phone icon: `md:hidden` only
- `NotificationsButton` (bell) always: staff sees unread inquiry previews → link to Заявки; others empty state

## Files
- `prisma/schema.prisma`, `utils/actions.ts`, `utils/schemas.ts`
- `components/admin/sales/admin-inquiries-view.tsx`
- `app/[locale]/admin/sales/inquiries/page.tsx`
- `app/[locale]/admin/Sidebar.tsx`
- `components/navbar/{NotificationsButton,ShopNavbar,Navbar}.tsx`
- `components/cta/cta-inquiry.tsx`, `components/contact-form.tsx`
