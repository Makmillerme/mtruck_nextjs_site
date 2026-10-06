# SheetDateField + sales filter sheet (2026-10-06)

## Backlog
`docs/backlog/ideas.md` — Міні-CRM «Продажі» (A+1): Order=Deal, Users=clients, Products=stock; Phase1 order card later. Status: Відкладено.

## Date canon
- `npx shadcn add calendar` → `components/ui/calendar.tsx` (chevrons → `react-icons/lu`)
- `components/form/sheet-date-field.tsx` — Button outline h-11 + LuCalendar + Popover `modal={false}` + Calendar; value YYYY-MM-DD; display via `formatDate`
- UI Lab: `ui-lab-sheet-fields.tsx` — single + period pair
- Sales filter: native `type=date` removed; uses SheetDateField
- Grep: no remaining `type="date"` in app code

## AdminFilterSheet canon
- `SheetContent className="overflow-hidden"` (keeps default gap-6 p-6 pt-8)
- SalesFilterFields: `grid gap-4` fields, footer `mt-auto` without border-t
- CatalogFilterFields footer aligned (gap-6, no border-t)

## Verify
- UI Lab: date select → `27.09.2026`
- `/admin/sales` Filter: combobox dates, sheet gap-6+p-6+pt-8, Apply badge works
- tsc OK
