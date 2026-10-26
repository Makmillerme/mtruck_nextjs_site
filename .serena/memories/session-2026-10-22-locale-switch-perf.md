# Locale switch perf (2026-10-22)

## Проблема
- Сірий екран = `SoftNavPending` `opacity-60` у SiteChrome, прив’язаний до LocaleSwitcher.
- Повільність = повний RSC remount `[locale]` + uncached PDP DB + `ensureUserCode` SELECT + `products/loading.tsx` skeleton.

## Фікс
1. **SiteChrome** — без SoftNavProvider/Pending (soft-nav лишається catalog/admin).
2. **LocaleSwitcher** — локальний `useTransition`; spinner лише на кнопці; `router.prefetch` інших locale при відкритті dropdown.
3. **Cache** — `fetchSingleProduct` / `fetchRelatedProducts` → `unstable_cache` (tags catalog root+products, TTL 60s); redirect поза кешем.
4. **ensureUserCode** — `React.cache` + `unstable_cache` read по userId (revalidate 300).
5. Видалено `app/[locale]/products/loading.tsx` (skeleton flash на locale).

## Файли
- `components/layout/site-chrome.tsx`
- `components/navbar/LocaleSwitcher.tsx`
- `utils/actions.ts`
- `lib/codes.ts`
- deleted `app/[locale]/products/loading.tsx`