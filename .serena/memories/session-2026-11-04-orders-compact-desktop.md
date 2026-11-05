## Orders cards compact desktop (2026-11-04 follow-up)

User feedback after COMFY canon: meta to right corner, normal 4:3 photo, cards not so long (sidebar crushed).

### AccountOrderLine
- Desktop (`lg+`): `lg:w-fit` card; photo `w-48 xl:w-56` aspect 4:3 `self-start` (never items-stretch)
- Right cluster: meta+price+actions `text-end` / `justify-items-end`, `min-w-[14rem] max-w-xs` (no flex-1 void)
- Phone/tablet: slightly larger photo `w-28/32/36`, stack unchanged

### Shell
- Sidebar wider: md 18rem / lg 20rem / xl 22rem
- List: `justify-items-start` (cards size themselves)

### Verified
- 1280: photo 224×168 (1.33), card ~482px, summary 352, breathing gap
- 1024: photo 192×144 (1.33), card ~440px

### Files
- components/account/account-order-line.tsx
- components/account/account-orders-view.tsx
- components/dev/ui-lab-account-orders.tsx
