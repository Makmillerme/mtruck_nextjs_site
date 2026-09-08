# MTruck

Сайт продажу комерційного транспорту (імпорт з Європи).

**Репозиторій:** [Makmillerme/mtruck_nextjs_site](https://github.com/Makmillerme/mtruck_nextjs_site)

## Стек

| Технологія | Версія / примітка |
|---|---|
| Next.js | 16.3 (App Router, `proxy.ts`) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | v3 |
| UI | shadcn/ui, react-icons / lucide у маркетингових секціях |
| Auth | Better-Auth (email/password + Google) |
| ORM / DB | Prisma 5 + PostgreSQL (PostgressOps / PgBouncer) |
| i18n | next-intl (`uk` / `en` / `de`) |

Не використовуємо: Clerk, Stripe checkout, Vercel Blob, Payload CMS.

## Локальний запуск

```powershell
npm install
copy .env.example .env
# заповніть DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

Деталі змінних — у [`.env.example`](.env.example).

## Структура (коротко)

- `app/[locale]/` — сторінки з локаллю
- `components/` — UI та маркетингові секції
- `messages/` — переклади uk/en/de
- `prisma/` — схема та seed
- `lib/auth.ts` — Better-Auth
- `.cursor/rules/` — правила для агентів у Cursor

## Ліцензія

MIT — див. [LICENSE](LICENSE).
