---
name: fullstack-development-workflow
description: Next.js 16 fullstack workflow for MTruck using Serena, Prisma, shadcn, and next-devtools. Use for app features spanning UI and server actions.
---

# Fullstack Development Workflow (MTruck)

## Команди

| Фаза | Команда |
|------|--------|
| План | `/plan` + Plan mode + sequential-thinking |
| Код | `/serena` + `activate_project` `mtruck_nextjs_site` |
| Доки | `/docs` за версією `package.json` |
| Якість | `/audit` + next-devtools якщо є |
| UI | `/ui-add` — shadcn у `components/ui/` |

## Backend

Prisma + PostgressOps. Не Payload. Підтверджуй деструктивний `db push` / reset.

## Frontend

1. Layout Tree перед новим UI
2. Шукай існуючий shadcn у `components/ui/`
3. Інакше user-shadcn → CLI → кастом
4. Лише Flex/Grid. Іконки **react-icons**

## Завершення

`write_memory`. Не `npm run dev` без прохання. `tsc` / `eslint` — так.
