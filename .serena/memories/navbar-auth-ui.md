## Avatar (2026-09-08)
- Dedicated square avatar asset: `public/avatar_mtruck.svg` (viewBox `2 2 85 85`, emblem from logo — ring + M centered)
- Admin default: `lib/admin.ts` → `DEFAULT_ADMIN_AVATAR = "/avatar_mtruck.svg"`
- `UserAvatar` in `AccountTrigger.tsx`: SVG uses `object-contain object-center bg-muted p-0.5`; photos use `object-cover`
- Seed migrates legacy `/favicon_mtruck.svg` admin image to new avatar on re-seed

## Theme (2026-09-08)
- Light-only: `app/layout.tsx` — `forcedTheme="light"`, `enableSystem={false}`, no theme flash script
- Removed theme picker from `UserProfileDropdown` and `UserAccountSheet`
- Deleted `ThemeMenuItems.tsx`, `DarkMode.tsx`
- Viewport: `colorScheme: "light"`, `themeColor: "#ffffff"`