# Carousel Lab canon (2026-10-26)

## Проблеми
- UI Lab ламався: `ui-lab-pdp` (client) імпортував `FavoriteToggleButton` → `session.ts` / `next/headers`.
- Секція carousel не мала lightbox/zoom канону.
- Lightbox був самописний `setIndex` без Embla → різка зміна фото, конфлікт swipe/zoom/wheel.

## Фікс
1. **Lab unbreak:** `CardSignInButton appearance="outline"` замість FavoriteToggleButton.
2. **Lab carousel:** блок «PDP gallery + lightbox» через `ProductGallery`; demo images webp+png; catalog hint оновлено.
3. **ProductLightbox → Embla:** той самий Carousel; `watchDrag: () => zoom <= 1`; pan лише при zoom>1; wheel zoom лише Ctrl/Meta; без брехливого cursor-zoom-in; thumbs sync через `scrollTo`/`select`.

## Перевірка
- `/ui-lab?section=carousel` відкривається; lightbox з L-thumbs + zoom 100%→+ працює.
- Session-in-client error зник; лишився типовий hydration mismatch (не блокує).

## Файли
- `components/dev/ui-lab-pdp.tsx`, `ui-lab-blocks.tsx`, `ui-lab-catalog.ts`
- `components/single-product/product-lightbox.tsx`