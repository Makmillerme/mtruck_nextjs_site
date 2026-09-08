## TrustStrip section design spec (2026-09-07)

Component: `components/trust-strip.tsx`
Section: aria-label "Чому нам довіряють", classes `bg-secondary section-spacing-tight`

### Layout
- bg: secondary #E2E8F0
- padding Y: clamp(2rem, 4vw, 3rem)
- inner: page-container (max 1280px, clamp padding X)
- h2: sr-only "Чому нам довіряють"

### Stats grid
- grid-cols-2 → md:grid-cols-4, gap-6, mb-12 / lg:mb-16
- Card: bg-background/50, border-0
- CardContent: p-6 text-center
- Icon circle: 48×48 rounded-full bg-primary/10, icon 24×24 text-primary
- Value: text-3xl/lg:4xl font-black font-mono text-foreground
- Label: text-sm text-muted-foreground mt-1
- Stats: 15+ Calendar, 3500+ Truck, 1200+ Users, 100% Award

### Brands row
- flex-wrap justify-center gap 6/8/12
- text-2xl font-black text-muted-foreground/50 hover:text-foreground
- MAN DAF Volvo Renault Scania Mercedes (text logos, no images)