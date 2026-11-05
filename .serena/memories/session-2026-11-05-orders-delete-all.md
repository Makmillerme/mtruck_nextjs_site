## Account orders / favorites — «Видалити усі»

**Layout:** лічильник і кнопка в одному рядку `flex items-center gap-x-1.5`, розділені `·` (не `justify-between`). Кнопка текстова: `h-auto px-0 py-0 text-sm font-normal … hover:bg-transparent`, іконка `size-3.5`.

**Orders:** `account-orders-view.tsx` — кнопка лише якщо є NEW (`deletableOrders`). Action: `deleteAllDeletableUserOrdersAction`.

**Favorites:** `AccountCabinetView.tsx` / `AccountFavoritesPanel` — те саме layout. Action: `clearAllUserFavoritesAction`.

i18n: AccountCabinet `removeAllOrders*` / `removeAllFavorites*`; Actions `ordersCleared` / `favoritesCleared`.