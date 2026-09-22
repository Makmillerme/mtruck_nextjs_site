# Cascade select variants (2026-09-21)

## Problem
Rewriting CascadeSelect to Popover-tree for Sheets broke CMS TemplateFolderPicker (hover submenu UX / look).

## Fix
- Default `variant="menu"` — original DropdownMenu Sub (UI Lab / CMS fields picker).
- `variant="tree"` — Popover expandable tree only for Sheet contexts (`ProductFolderPicker`).
- `modal={false}` on both.

## Sheets parity
Sales / Users / Products / Account orders: local open + replaceState (no RSC on open/close).
