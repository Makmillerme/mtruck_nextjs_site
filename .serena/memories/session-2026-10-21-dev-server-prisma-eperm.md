# Dev server + Prisma EPERM (2026-10-21)

## Чому «вибиває» `npm run dev`

Після `prisma db push` generate часто падає з `EPERM` на `query_engine-windows.dll.node`, бо файл тримає запущений Next (`node`).

Агент інколи робив `Stop-Process node`, щоб розблокувати DLL — це **вбиває** `next dev`.

## Правило надалі

- Не вбивати всі `node`, якщо користувач тримає `npm run dev`.
- Сказати користувачу коротко зупинити/перезапустити dev, або generate після зупинки.
- `MISSING_MESSAGE` для нового ключа i18n: ключ уже в `messages/*.json`; якщо бачили помилку — hard refresh після того, як файл записався (HMR messages іноді лагає).
