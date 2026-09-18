# Типографіка Manrope (2026-09)

Єдиний шрифт сайту: **Manrope** (`next/font/google`), subsets latin + latin-ext + cyrillic + cyrillic-ext.

- `app/layout.tsx`: `--font-manrope`
- `app/globals.css`: `--font-sans` і `--font-mono` → той самий Manrope (без Geist / Plus Jakarta)
- Tailwind `font-black` = 800
- Cursor rule: `.cursor/rules/typography-manrope.mdc` (alwaysApply)
- Живий канон: UI Lab → Розмітка → Шрифт (`components/dev/ui-lab-layout.tsx`) — зразки UA + EN і шкала ваг 400–800
