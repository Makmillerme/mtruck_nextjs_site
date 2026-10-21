# Session 2026-10-08 — Truck parking UI Lab game #2

## Shipped
- `components/games/truck-parking/` — canvas parking sim
  - Map: logistics hub (asphalt, warehouse with ramp **gap** colliders, building, parked row + parallel set-dressing)
  - Vehicles: `rigid` | `tractor_semi` | `b_double` (follow-the-leader hitch)
  - Win: all segments in scaled P + align ~20° + stop + hold 4s
  - Fail: health ≤ 0
  - Mobile: gas / reverse / steer / **brake** (Space)
- Lab: `ui-lab-truck-parking.tsx`, catalog `truck-parking`, `LabGate` in `ui-lab.tsx` under **Міні гра**
- Reference HTML left at repo root: `m_truck_parking.html`

## Play
`/ui-lab` → chip **Міні гра** → **Паркування**
