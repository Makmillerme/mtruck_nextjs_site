**Дата:** 2026-11-23

У блоці «Вартість і ПДВ» додано `storefrontPriceMode` (INCL_VAT | EXCL_VAT) — яку суму показувати покупцю як основну (з ПДВ / без ПДВ), окремо від `entryMode` (спосіб введення в адмінці).

- Prisma `RootPricing.storefrontPriceMode`, default INCL_VAT; db push виконано.
- Фінанси: селект «Основна вартість для покупця».
- Storefront: `primaryAmount` = gross|net за `storefrontPriceMode`; підпис і пара комплементу теж від нього; triple коли валюти різняться.
