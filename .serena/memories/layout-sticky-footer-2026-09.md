# Sticky footer + admin hide + cabinet name — 2026-09-11

## Footer
- `components/layout/site-chrome.tsx`: колонка `min-h-dvh` (header / `main flex-1` / footer `mt-auto`).
- На `/admin` і `/admin/*` футер **не рендериться**.
- `html`/`body`: `min-h-dvh` + `flex flex-col`, щоб не було білої смуги під футером при короткому контенті.

## Кабінет
- Navbar `account` / `manageAccount` і `AccountCabinet.title` / `navLabel` / `Account.title`:
  - uk: **Мій кабінет**
  - en: **My cabinet**
  - de: **Mein Bereich**
