**Дата:** 2026-11-23

PDP buy-box:
- **VAT on:** одна картка `rounded-sm border bg-card p-4`. Зліва основна сума (+ короткий підпис) і фінансування `variant="under"` прямо під сумою (без bg-muted / без full-width border-t). Справа рядки ПДВ.
- **VAT off:** як раніше — `sm:grid-cols-2` ціна | фінансування `variant="panel"` з іконкою в рамці.
- Mobile (VAT): колонка суми+фінансування зверху, ПДВ знизу через `border-t`.
- Канон: UI Lab → PDP.
