# Qty stepper press-and-hold (2026-11-05)

`AccountOrderLine` `QtyHoldButton` (onQuantityChange path):
- pointerdown → immediate ±1
- after 420ms hold → repeat every 85ms until release / bound
- pointer capture; ignore context menu; keyboard Enter/Space steps once (OS key-repeat OK)
- Uses quantityRef so hold stays in sync with optimistic parent updates

Applies to account orders, order sheet, UI Lab account-orders demo.
