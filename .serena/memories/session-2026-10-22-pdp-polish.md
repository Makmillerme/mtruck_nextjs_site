# PDP polish pass (2026-10-22)

П’ять точкових правок premium PDP за планом `pdp_polish_pass`.

## Зміни

1. **Share** — `ShareButton.tsx`: лише `LuPaperclip` + `clipboard.writeText` + notify; без Popover / `navigator.share`.
2. **CTA** — `RequestCatalogOrder` / `ProductSignInButton` / buy-box: `size="lg"` primary + outline; `FormContainer` з `className="contents"` щоб кнопки в одному `flex` ряді на `sm+`. Lab `ui-lab-pdp` DemoCta теж `lg`.
3. **Breadcrumb folder** — `BreadCrumbs` через `buildCatalogHref({ folders: [slug] })`; у `catalog-filter-tree` `openTarget` синхронізується з `draft.folders` / URL (accordion відкривається на вибрану папку). Seed slug `furhony` навмисний — не перейменовували.
4. **Key facts** — `product-key-facts.tsx` без `Lu*` іконок (label + value). Backlog: `docs/backlog/ideas.md` → «SVG-іконка на атрибут (CMS)» з набору `ui-lab-icons` / react-icons Lu.
5. **Lightbox** — новий `product-lightbox.tsx`: desktop `md:grid-cols-[7.5rem_1fr]` вертикальні thumbs зліва, stage `object-contain`, zoom (wheel / pinch / +− / reset / pan при scale>1); mobile fullscreen без бічної колонки. `product-gallery.tsx` підключає lightbox; page thumbs знизу лишаються в PhotoCarousel. i18n: `galleryZoomIn|Out|Reset` (uk/en/de).

## Файли

- `components/single-product/ShareButton.tsx`
- `components/single-product/RequestCatalogOrder.tsx`, `product-buy-box.tsx`, `Buttons.tsx` (SignIn)
- `components/single-product/BreadCrumbs.tsx`, `components/products/catalog-filter-tree.tsx`
- `components/single-product/product-key-facts.tsx`
- `components/single-product/product-lightbox.tsx` (new), `product-gallery.tsx`
- `components/dev/ui-lab-pdp.tsx`
- `messages/uk|en|de.json`
- `docs/backlog/ideas.md`

## Поза скоупом

CMS icon picker реалізація; rename `furhony` → `furgony`.

## Commit

Локальний commit лише за запитом користувача; push не робити без явного «запуш».