# PDP tweaks (2026-10-22)

## 1. Locale soft-nav (без «перезавантаження»)
- Причина флешу на PDP: `app/[locale]/products/[id]/loading.tsx` міняв UI на скелетон при зміні locale.
- Видалено `[id]/loading.tsx`.
- `SiteChrome`: `SoftNavProvider` + `SoftNavPending` навколо `main` children.
- `LocaleSwitcher` бере `startTransition` / `isPending` з `useSoftNavOptional()` (fallback на локальний `useTransition`).
- Канон: `router.replace({ pathname, query }, { locale, scroll: false })` + soft-nav dim, без skeleton.

## 2. Lightbox zoom bar
- Прибрано `border-t border-border` між stage і zoom controls.
- Zoom bar: `bg-muted` як у stage.
- Прибрано `onDoubleClick` zoom (випадкове масштабування при швидких кліках по стрілках).

## 3. Favorite + Share канон
- Обидві: `Button size="icon" variant="outline"` (іконки по центру через button cva).
- Share: без зайвого `p-2`.
- Favorite: `appearance="outline"` на PDP (`FavoriteToggleButton` / Form / CardSubmit|SignIn); картки лишають `appearance="card"` (круг).
- `FavoriteToggleForm`: `FormContainer className="contents"`.

## Файли
- `components/layout/site-chrome.tsx`, `components/navbar/LocaleSwitcher.tsx`
- deleted `app/[locale]/products/[id]/loading.tsx`
- `components/single-product/product-lightbox.tsx`, `ShareButton.tsx`
- `components/form/Buttons.tsx`, `FavoriteToggleForm.tsx`, `FavoriteToggleButton.tsx`
- `app/[locale]/products/[id]/page.tsx`, `components/dev/ui-lab-pdp.tsx`