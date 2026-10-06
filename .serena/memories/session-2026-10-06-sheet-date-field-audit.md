# Audit SheetDateField / sales filter (2026-10-06)

## Verdict: OK — план виконано, прогалин у фічі немає

### Plan checklist
1. **Backlog CRM A+1** — `docs/backlog/ideas.md` → «Міні-CRM «Продажі» (A+1)», Order=Deal, Phase1 status/kind/origin/note; статус Відкладено.
2. **SheetDateField** — `components/form/sheet-date-field.tsx`: outline h-11 + LuCalendar + Popover `modal={false}` + Calendar; value YYYY-MM-DD; local parse (no UTC shift); display `formatDate`.
3. **Calendar** — `components/ui/calendar.tsx`, chevrons `react-icons/lu` (не Lucide).
4. **UI Lab** — Оверлеї → Sheet fields: «Дата (одна)» + «Період (Від / До)» у `ui-lab-sheet-fields.tsx`.
5. **Sales filter** — `sales-filter-fields.tsx` на SheetDateField; grep: немає `type="date"` у tsx.
6. **Sheet canon** — `AdminFilterSheet` (`admin-list-toolbar.tsx`): `SheetContent className="overflow-hidden"` + body `gap-6`; SalesFilterFields root `flex … gap-6`.

### Runtime (/audit)
- next-devtools `get_errors` на :3000: раніше порожньо; пізніше hydration noise від `components/ui/toast.tsx` (відомий Next overlay false-positive, не з SheetDateField).
- Browser `/admin/sales`: Filter sheet — combobox «Період Від/До», Calendar popover відкривається (month nav + day cells).
- Browser `/ui-lab` → Оверлеї: SheetDateField demos + Calendar відкривається.

### Не чіпали
- Міні-CRM Phase1 UI (лише backlog).
- Toast hydration (поза scope цієї задачі).

### Related
`mem:session-2026-10-06-sheet-date-field-canon`, `mem:session-2026-10-01-admin-sales-filter`
