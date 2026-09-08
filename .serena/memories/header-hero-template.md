# Header + Hero + Trust Strip (2026-09-07)

## Hero photo
- Файл: `public/images/hero.jpg`
- `components/home/Hero.tsx`: Next/Image `fill` + `priority`, `object-cover`, `object-[58%_center] lg:object-[72%_center]` (тягач справа)
- Overlay лишається окремим шаром: `from-foreground/85 via-foreground/55 to-transparent md:from-foreground/75 md:via-foreground/35`
- Прибрано watermark і плейсхолдер `#1a1a2e`

## Trust Strip
- Файл: `components/trust-strip.tsx`, місце: головна одразу після Hero
- `--secondary: 214 32% 91%` (#E2E8F0), клас `.section-spacing-tight`
- 4 shadcn Card: `bg-background/50 border-0 shadow-sm`
- Іконки Lucide: Calendar, TruckIcon, Users, Award
- Числа Geist Mono font-black; бренди text wordmarks
- i18n: `TrustStrip` у uk/en/de

## Header
- Мова: dropdown `LocaleSwitcher` (кнопка UA/EN/DE + список), світлий popover навіть у dark theme
- Для залогінених: `FavoritesButton` (серце → `/favorites`) замість кошика; у мобільному Sheet — пункт «Вподобані»
- Гості: без кошика і без вподобаних у хедері
- Navbar RSC знову читає `getSession()` і передає `user` у `ShopNavbar`
