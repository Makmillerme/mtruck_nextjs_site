# Admin Filter button fix (2026-09-29)

## Bug
Кнопка «Фільтр» на `/admin/products` не відкривала Sheet при кліку.

## Root cause
`AdminFilterTrigger` використовувався як `SheetTrigger asChild`, але **не** був `React.forwardRef` і не прокидав props від Radix (`aria-haspopup`, `aria-expanded`, `onClick`, `data-state`, ref). Без цього `asChild` (Slot) не може підключити тригер — клік нічого не робить.

## Fix
Файл: `components/admin/admin-list-toolbar.tsx`
- `AdminFilterTrigger` → `React.forwardRef` + `ComponentPropsWithoutRef<typeof Button>` + `{...props}` + `cn` для className
- `AdminFilterSheet` — контрольований `open` / `onOpenChange` (як `CatalogFilterSheet`)

## Browser verify
Tab `b3d6c5` `/admin/products`: після reload кнопка має `collapsed`, клік → `expanded`, sheet з заголовком «Фільтр», статуси, «Фільтрувати».

## Audit note
При відкритті sheet Next overlay показав hydration warning (stack → `button.tsx`). Окремо від dead-click; не блокує відкриття фільтра. Перевірити при наступному UI-pass, якщо повториться.