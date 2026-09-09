# Header / ShopNavbar

- Sticky glass header (`backdrop-blur-xl`): dark `bg-black/25 border-white/10`, light `bg-white/80`.
- Home navy slot: empty `h-14 lg:h-16` sibling + header `-mt-14 lg:-mt-16` so hero photo goes under glass.
- Surface via `data-header-surface="dark"` + `useHeaderSurface` (scroll/resize).
- Session: server-only from `Navbar` → `ShopNavbar` → `LinksDropdown`. No `authClient.useSession()` in navbar (avoids guest flash).
- Admin link: `isAdmin` prop from server (`user.role === "ADMIN"`), not `NEXT_PUBLIC_ADMIN_*`.
- Avatar: `priority` on next/image; shared `signOutAndRefresh` in `lib/sign-out.ts`.
- Site nav includes Home (`siteNav` key `home`).
