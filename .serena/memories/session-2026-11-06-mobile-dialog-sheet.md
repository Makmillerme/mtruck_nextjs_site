# Mobile Dialog / Sheet canon (inset, not full-bleed)

**Date:** 2026-11-06

## Dialog / AlertDialog (`components/ui/dialog.tsx`, `alert-dialog.tsx`)
- Width: `w-[calc(100%-2rem)] max-w-lg` (visible overlay margins on phone)
- Always `rounded-sm` (not only sm+)
- `max-h-[min(90dvh,100%)] overflow-y-auto`
- Safe-area: `pt/pb` with `env(safe-area-inset-*)`

## Sheet (`components/ui/sheet.tsx`)
- left/right: `w-[min(100%-4.5rem,28rem)]` + `sm:w-full sm:max-w-lg` (~4.5rem tappable peek on phone)
- Base padding uses safe-area top/bottom
- top/bottom: `max-h-[90dvh]`

## Exceptions
- PDP lightbox keeps full-bleed overrides (`w-screen`, `h-[100dvh]`, `rounded-none`)
- Sidebar mobile uses own `w-[--sidebar-width]`

## Callers
- Removed `w-full` from order-added `SheetContent` (was fighting peek canon)

## UI Lab
- overlays + dialog-footer hints updated