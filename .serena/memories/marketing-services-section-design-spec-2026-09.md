## ServicesSection design spec (2026-09-07)

Component: `components/services-section.tsx`
id=#services, aria-labelledby=services-heading
classes: section-spacing bg-background

### Shell
- bg: #FFFFFF
- padding Y: clamp(3rem, 6vw, 5rem)
- page-container max 1280px

### Header (centered, max-w-2xl mx-auto, mb-12/lg:mb-16)
- eyebrow: text-sm uppercase tracking-wide font-semibold text-primary mb-2 — "Наші послуги"
- h2: text-3xl/lg:4xl font-black tracking-tight — "Повний цикл імпорту техніки"
- sub: mt-4 text-base/lg:text-lg text-muted-foreground

### Grid: sm:2 lg:4, gap-6/lg:gap-8
Cards (4):
1 FileCheck — Митне оформлення
2 Wrench — Технічне обслуговування
3 Coins — Лізинг та фінансування
4 Truck — Доставка

Card: text-center, hover:border-primary hover:shadow-lg transition-all group
(default Card: rounded-xl border shadow-sm bg-card)
Icon: 56×56 rounded-full bg-primary/10, icon 28px primary; group-hover: bg-primary + icon white
Title: text-lg font-bold mb-2
Desc: text-sm text-muted-foreground leading-relaxed