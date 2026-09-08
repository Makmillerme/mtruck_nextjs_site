Live header: RSC `Navbar` → `getSession()` → `ShopNavbar`.
Logo: `components/navbar/Logo.tsx` uses `/logo_mtruck.svg` (header height h-8/h-9/h-10). Favicon: `/favicon_mtruck.svg` via `generateMetadata.icons` in `app/[locale]/layout.tsx`; Next convention copy at `app/icon.svg`. Default `app/favicon.ico` removed.

Breakpoints: `lg` (1024px).
Header bar: `grid-cols-[1fr_auto]` on mobile (nav is `display:none`, so 2 items / 2 columns). `lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` when nav is visible. Do not use 3 columns on mobile — empty third track + `gap` inset the actions by 8px vs catalog toolbar.

Desktop (`lg+`) right cluster, left → right:
1. Phone `tel:` icon
2. `FavoritesButton`
3. `LocaleSwitcher` (chevron visible)
4. Account dropdown (`UserProfileDropdown`): avatar = `user.image` or first letter of name; name+email, Admin if `NEXT_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_TEST_EMAIL`, theme (Light/Dark/System via `ThemeMenuItems`), «Керувати акаунтом» `/user-profile`, «Вийти». No site nav in dropdown. Guest: `LuUser` + login/register only (no theme).
Theme is **not** in the header — only in account UI. Default theme is `system` (`app/layout.tsx`).

Mobile (`<lg`):
- Header trigger is hamburger (`LuMenu`), not avatar. Site nav lives in `UserAccountSheet`.
- Right cluster: phone, locale (no chevron), menu. Favorites hidden (link is in Sheet).
- Sheet header shows `UserAvatar` (photo or initial) + name/email, then `siteNav`, `accountNav` (admin if admin). Logged-in: theme, manage account, logout. Guest: nav + login/register, **no** theme.

Nav data: `utils/links.ts` — `siteNav` (contacts href `/contact`), `accountNav`.
