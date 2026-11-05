## Account favorites — «Видалити усі»

**UI:** `AccountFavoritesPanel` у `components/account/AccountCabinetView.tsx` — той самий рядок flex поруч із `favoritesTotal`; `ConfirmDeleteCallbackIcon` з label «Видалити усі» (завжди коли список не порожній).

**Action:** `clearAllUserFavoritesAction` у `utils/actions.ts` — `favorite.deleteMany({ userId })`; revalidate `/account`, `/account/favorites`; toast `Actions.favoritesCleared`.

i18n AccountCabinet: `removeAllFavorites`, `removeAllFavoritesTitle`, `removeAllFavoritesDescription` (uk/en/de).
Actions: `favoritesCleared`.

Після confirm: notify + `router.refresh()`.