# Атлас структури репо (prod vs non-prod)

Оновлено: 2026-11-06. Канон для агентів: також `mem:repo-structure-atlas`.

## Як читати «прод»

- **Прод-рантайм** — код/ассети в `next build` + `next start` для користувачів.
- **Прод-збірка** — потрібно для білду (Prisma generate, messages, configs), не окремі URL.
- **Git / дев / ops** — у репо для людей і агентів; на сервер сайту не потрібні як runtime.
- **Локально / gitignore** — секрети, кеші, тули.

## Корінь

| Шлях | Роль | Прод? |
|------|------|-------|
| `app/` | App Router: pages, API | Так (рантайм) |
| `components/` | UI / фічі (+ `dev/` = UI Lab) | Так (рантайм) |
| `lib/`, `utils/`, `hooks/` | auth, DB actions, catalog | Так |
| `i18n/`, `messages/` | next-intl | Так |
| `prisma/` | schema = білд; seed/JSON = ops | Частково |
| `public/` | лого/hero; uploads products — gitignore | Так |
| `proxy.ts` | i18n + session gate | Так |
| `package.json`, next/tailwind/eslint/ts | конфіг білду | Білд |
| `.env` | секрети | Ні (gitignore) |
| `.env.example` | шаблон | Git only |
| `.next/`, `node_modules/` | кеш / deps | Ні |
| `.cursor/` | rules, skills, commands, phone-dev | Git (агент); `tools/` ignore |
| `.serena/` | memories | Git; cache/local ignore |
| `docs/`, `scripts/`, `AGENTS.md` | backlog / one-off ops / agent | Не URL сайту |

## Маршрути `app/[locale]`

**Прод:** `/`, `/products`, `/products/[id]`, marketing (`services`, `about`, `partnership`, `faq`, `contact`, `privacy`, `terms`), кабінет (`account/*`, `favorites`, `orders`, auth), admin (`/admin/*`), API `auth` + `pusher`.

**Спеціальні:**

- `/ui-lab` — у git/бандлі; у `production` → `notFound()` (+ admin у dev).
- `/contacts` — редірект на `/contact`.
- `/reviews` — legacy e-commerce (див. backlog).

## `components/` шари

- **Прод:** `ui`, `navbar`, `single-product`, `products`, `catalog`, `admin`, `account`, `auth`, `form`, `media`, `layout`, `home`, `cta`, `global`, секції в корені `components/`.
- **Dev:** `components/dev/` — UI Lab.
- **Ігри:** `components/games/` — лише з UI Lab, не з прод-сторінок.
- **Legacy:** `components/reviews/` + `/reviews` (backlog cleanup).

## Не прод-сайт, але в git — лишаємо

`.cursor` rules/skills/commands, `.serena/memories`, `docs/backlog`, `scripts/*` (seed/audit/migrate).

## Не чіпати без явного запиту

UI Lab, games, `.cursor`, `.serena` — канон розробки; prod URL для Lab уже gated.
