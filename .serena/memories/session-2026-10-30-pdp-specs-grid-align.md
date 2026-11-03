# PDP specs grid align — 2026-10-30

## Cause
`SpecRows` used `md:grid-cols-2` with `border-b` on each cell. Uneven cell heights made separators zigzag between columns (worse on dense groups / long labels).

## Fix (revised)
Column-major: `ceil(n/2)` left column top→bottom, rest right column top→bottom. Order = display group / attribute sortOrder. No fixed cell count, no zig-zag pairs.
