# MCP налаштування для MTruck (`mtruck_nextjs_site`)

## Проєкт

- **Next.js додаток:** корінь репозиторію
- **Шлях:** `d:\Project\mtruck\mtruck_nextjs_site`
- **БД:** PostgressOps PgBouncer `173.242.62.135:6432`, роль/бд `mtruck_nextjs` (секрети лише в `.env`)

## Serena (`user-serena`)

Перед правками:

```
activate_project {"project": "d:\\Project\\mtruck\\mtruck_nextjs_site"}
```

relative_path від кореня: `app/layout.tsx`, `lib/auth.ts`. Не `src/app/`.

## Інші MCP

| Сервер | Коли |
|--------|------|
| user-shadcn | `/ui-add`, нові примітиви |
| user-sequential-thinking | `/plan` |
| user-next-devtools | `/audit` |
| user-postgres-ops | БД / PgBouncer |
| user-github | лише якщо користувач просить GitHub |
| user-payloadcms-local | **не використовувати** у цьому репо |
| shadcnspace-mcp / user-shadcnspace-mcp | Блоки й сторінки Shadcn Space (не примітиви) |

Конфіг: `.cursor/mcp.json` + глобальний `~/.cursor/mcp.json`.
Після додавання: Cursor Settings → MCP → увімкнути сервер (зелена крапка). Може знадобитися Reload Window.

## Команди

`/plan` `/docs` `/serena` `/audit` `/ui-add` `/PostgresOps` `/uk-layout` `/phone-dev`

`/bot-init` — лише після явного запиту на Telegram.
