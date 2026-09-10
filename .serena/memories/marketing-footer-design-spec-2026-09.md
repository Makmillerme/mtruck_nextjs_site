# Footer (2026-09-10, header canon)

- Component: `components/layout/footer.tsx` (RSC) in `app/[locale]/layout.tsx` after `</main>`.
- Compact dark bar: `py-8 md:py-10`, `bg-foreground`, `data-header-surface="dark"`. No `border-t`.
- Brand: reuse `components/navbar/Logo.tsx` (`h-8` … `lg:h-10`) + tagline.
- Nav: same `siteNav` as header. Classes like header: `rounded-md px-3 py-2 text-sm font-medium tracking-wide text-background/80 hover:bg-background/10 hover:text-background`. **Not** `hover:text-primary` (on dark surface primary is white — broken accent).
- Contacts: `Lu*` `size-5`, `text-background/80`.
- Telegram: `Button variant="inverse" size="sm"` + `FaTelegram` → `https://t.me/mtruck_sales`.
- Legal: `text-background/60` (not `/45`).
- Icons: react-icons only.
- i18n `Footer` uk/en/de.
