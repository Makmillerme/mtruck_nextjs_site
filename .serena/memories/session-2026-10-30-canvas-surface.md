# Canvas vs surface — 2026-10-30

## Tokens (`app/globals.css` :root)

- `--background: 210 18% 97%` — cool near-white gray page canvas
- `--card` / `--popover`: `0 0% 100%` — pure white surfaces
- `--sidebar-background` stays white
- Dark theme unchanged
- Not warm cream

## Surface rule

Elevated UI uses `bg-card` (or `bg-popover`), not `bg-background`:
- VehicleCard, catalog teaser, PDP key facts / details tabs / sticky CTA
- dialog, sheet, alert-dialog, toast, input, textarea, select, tabs list fill
- switch/slider thumbs, calendar, photo-carousel chrome, lightbox

Page chrome / Lab sticky that should match the page keep `bg-background`.

## UI Lab

`components/dev/ui-lab-layout.tsx` → RuleCard «Canvas vs surface» (live `bg-background` / `bg-card`).
