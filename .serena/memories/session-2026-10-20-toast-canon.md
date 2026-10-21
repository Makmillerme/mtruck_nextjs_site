# Toast canon — 2026-10-20

## Decision
Keep **shadcn Radix Toast** (no Sonner). One visual template + one imperative API for all call sites and UI Lab.

## Canon
- **Template:** `components/ui/toast-content.tsx` — `ToastContent` (icon + title/description). Variants: `default` | `success` | `destructive`.
- **Shell:** `components/ui/toast.tsx` — `success` accent border; close icon `LuX` (react-icons).
- **Renderer:** `components/ui/toaster.tsx` — always renders `ToastContent`; `ToastProvider duration={5000}`.
- **Store:** `components/ui/use-toast.ts` — `TOAST_LIMIT=1`, `TOAST_REMOVE_DELAY=1000`.
- **API:** `lib/ui/notify.ts` — `notify.success` / `error` / `info` / `fromAction` (`ok === false` → error, else success).
- **Lab:** UI Lab → Стани → **Toast** (`components/dev/ui-lab-toast.tsx`, catalog id `toast`). Static `ToastContent` + live `notify.*` buttons.

## Migrated call sites
- `FormContainer`, `catalog-form`, `optimistic-list` → `notify.fromAction`
- `UserCodeChip` → success/error
- `SignInForm`, `SignUpForm` → `notify.error` (description-first, no raw title-only)
- `folder-tree` → `notify.error` only (success still silent)

## Rule
Feature code must not call raw `toast({...})` — only `notify.*`. Low-level `toast` stays inside `notify` + `Toaster`.

## Mount
Single `<Toaster />` in `app/providers.tsx`.

## Follow-up: close alignment (v2)
Single flex row in `ToastContent` (`items-center gap-3`): icon + text (`leading-5`) + children (action/close). No `mt-0.5` / absolute. Toast shell `px-3 py-2.5`. Close `size-6 inline-flex items-center justify-center`. Lab static preview includes the same close.
