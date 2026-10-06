# Calendar / SheetDateField i18n (2026-10-06)

## Change
- `lib/ui/sheet-field.ts`: `getDayPickerLocale` (uk→uk, en→enGB, de→de) + `getIntlLocale` (uk-UA / en-GB / de-DE) from `react-day-picker/locale`.
- `components/ui/calendar.tsx`: `useLocale()` → default `locale` + `weekStartsOn={1}`; caller `locale` prop wins; `formatMonthDropdown` uses intl locale.
- `utils/format.ts`: `formatDate` respects locale (was hard-coded uk-UA).
- `SheetDateField`: `formatDate(selected, locale)`.
- UI Lab sheet-fields note: Calendar follows `useLocale`.

## Verify
- uk: nav «Панель навігації», «Перейти до попереднього місяця», week Mon-first.
- en: English labels, Monday-first (enGB).
- de: «Navigationsleiste», «Zum vorherigen Monat», Montag-first.
- next-devtools get_errors: empty (sidebar hydration overlay unrelated).
