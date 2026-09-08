# init

Стек цього репо вже зафіксовано ([mtruck-stack.mdc](../rules/mtruck-stack.mdc)):

- Prisma + PostgressOps (не Payload)
- Better-Auth (не Clerk, не Auth.js, не GitHub OAuth)
- Без Telegram, поки користувач явно не попросить
- Без Stripe / онлайн-оплати. Google OAuth уже в стеку

Не перепитуй Prisma vs Payload / Auth.js vs Better-Auth / Telegram, якщо задача — розвиток **цього** сайту.

Якщо користувач просить **новий** окремий продукт — тоді аналіз архітектури + підтвердження відхилень від якоря.

Команда: **/init**
