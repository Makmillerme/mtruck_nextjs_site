# Tabs UI (2026-09)

- Primitive: `components/ui/tabs.tsx`
- `TabsList`: shared navy frame (`border-2 border-primary rounded-sm h-11 p-1 bg-background`). Not a row of outline buttons.
- `TabsTrigger`: no individual border; `h-9` like sm button; idle transparent + primary text; hover/active = primary fill + primary-foreground.
- Cabinet uses the same primitive on all breakpoints (`AccountMobileTabs`).
- Also: CMS `cms-tabs.tsx`, UI Lab `#tabs`.
