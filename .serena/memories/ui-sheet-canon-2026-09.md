Sheet canon (updated 2026-11-06 mobile):

Primitive `components/ui/sheet.tsx`:
- Base: flex h-full flex-col gap-6 overflow-y-auto, safe-area pt/pb
- left/right: `w-[min(100%-4.5rem,28rem)]` + `sm:w-full sm:max-w-lg` (~4.5rem tappable peek on phone, not 100vw)
- top/bottom: max-h 90dvh
- Header text-left, title text-xl tracking-tight
- Do not override width/padding on callers except sidebar.tsx (p-0, hide close) and catalog filter (p-0)

Dialog/AlertDialog mobile (2026-11-06): inset `w-[calc(100%-2rem)]`, always rounded-sm, max-h 90dvh, safe-area. Lightbox keeps full-bleed overrides.

Floating layers: z-[100] pointer-events-auto; Sheet dismiss blocked on Radix popper/menu.
See also `mem:session-2026-11-06-mobile-dialog-sheet`.