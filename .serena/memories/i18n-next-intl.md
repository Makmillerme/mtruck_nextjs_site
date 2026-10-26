# i18n (next-intl)

- Locales: `uk` (default, no prefix), `en` (`/en`), `de` (`/de`).
- Config: `i18n/routing.ts` — `localePrefix: 'as-needed'`, `localeDetection: false`.
- Messages: `messages/uk.json`, `messages/en.json`, `messages/de.json` — UI chrome translated.
- **Do not translate** product name / company / description / review comments — those come from DB.
- Navigation: `@/i18n/navigation` for `Link` / `useRouter` / `usePathname`.
- Locale switcher: `router.replace({ pathname, query: from window.location.search }, { locale, scroll: false })` — keeps catalog query, no full document reload.
- Server `redirect()` stays `next/navigation` when next-intl types require `{href, locale}`.
- Theme script lives in root `app/layout.tsx`, not locale layout.

## Soft locale switch (2026-10-22)
- **Do not** wrap SiteChrome in SoftNavPending for locale — that caused gray `opacity-60` on the whole page.
- LocaleSwitcher: local `useTransition` only; pending spinner on the button; prefetch other locales on dropdown open.
- SoftNav stays catalog/admin only.
- No `products/loading.tsx` / PDP `loading.tsx` — skeletons flashed on locale change.
- PDP DB: `fetchSingleProduct` / `fetchRelatedProducts` via `unstable_cache` (locale-independent).
- See `mem:session-2026-10-22-locale-switch-perf`.