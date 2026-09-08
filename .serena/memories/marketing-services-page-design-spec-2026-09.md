## Services page UI spec (/services) 2026-09-08

File: app/(marketing)/services/page.tsx
Shell: page-content (max 1280px, clamp padding X/Y)

### Header center max-w-3xl mb-16
- H1 text-4xl font-black mb-4 "Наші послуги"
- sub text-lg muted

### Services grid md:2 gap-8 mb-16
Cards h-full: icon 48px rounded-lg bg-primary/10; CardTitle text-xl; desc muted; features list with primary 6px dots
4 services: Митне, Техсервіс, Лізинг, Доставка

### Advantages band: bg-secondary rounded-2xl p-8/lg:p-12 mb-16
H2 text-2xl bold center mb-8; grid sm:2 lg:4; icon circle 48px; title semibold; desc sm muted

### CTA center: H2 + muted + 2 buttons lg (primary catalog + outline contact)