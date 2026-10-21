# Toast / Sonner audit (2026-10-20)

## Verdict
- **No Sonner.** Package not installed. Zero `sonner` / `toast.success` / `toast.promise` usage.
- Stack: **shadcn Radix Toast** (`@radix-ui/react-toast` ^1.2.24).

## Library files
- `components/ui/toast.tsx` — primitives, variants `default` | `destructive`, viewport position
- `components/ui/toaster.tsx` — `<Toaster />` maps store → UI
- `components/ui/use-toast.ts` — imperative `toast()` + `useToast()`, TOAST_LIMIT=1, TOAST_REMOVE_DELAY=1000000
- Mount: `app/providers.tsx` → `<Toaster />` inside `app/[locale]/layout.tsx`

## Direct call sites (12 `toast({...})`)
| File | Count | Pattern |
|------|-------|---------|
| SignInForm | 3 | destructive + **title** |
| SignUpForm | 3 | destructive + **title** |
| UserCodeChip | 2 | description; success default / error destructive |
| FormContainer | 1 | description; variant from `state.ok` |
| CatalogForm | 1 | same as FormContainer |
| optimistic-list | 1 | same |
| folder-tree | 1 | error-only description |

No: duration, action buttons, icons, promise/loading API.

## Indirect toasts
Many forms use FormContainer → messages from `utils/actions.ts` (`Actions.*` i18n keys).

## UI Lab
No toast/sonner section in `ui-lab-catalog.ts`.

## Inconsistencies
- Auth uses `title`; rest uses `description`
- Duplicate wrappers: FormContainer ≈ CatalogForm
- No per-toast duration; Provider has no `duration` prop (Radix default ~5s)
- Close icon: `@radix-ui/react-icons` Cross2Icon (not react-icons)
