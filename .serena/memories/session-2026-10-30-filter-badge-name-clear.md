# Filter badge + name template clear — 2026-10-30

## Filter count
`AdminFilterTrigger`: solid white Badge → subtle `rounded-full bg-primary-foreground/20` pill.

## Name template clear stuck
Clearing deleted own group → child fell back to parent writer → fields returned.
Fix: empty members upserts own `product_name` writer with 0 members (blocks inheritance). `nameFromDisplayGroup` false when members empty.
