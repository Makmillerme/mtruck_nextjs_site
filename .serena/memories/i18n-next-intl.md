# i18n (next-intl)

- Locales: `uk` (default, no prefix), `en` (`/en`), `de` (`/de`).
- Config: `i18n/routing.ts` — `localePrefix: 'as-needed'`, `localeDetection: false`.
- Messages: `messages/uk.json`, `messages/en.json`, `messages/de.json` — UI chrome translated.
- **Do not translate** product name / company / description / review comments — those come from DB.
- Navigation: `@/i18n/navigation` for `Link` / `useRouter` / `usePathname`.
- Locale switcher: `router.replace({ pathname, query: from window.location.search }, { locale, scroll: false })` — keeps catalog `layout` and other query, no full document reload.
- Server `redirect()` stays `next/navigation` when next-intl types require `{href, locale}`.
- Theme script lives in root `app/layout.tsx`, not locale layout.
