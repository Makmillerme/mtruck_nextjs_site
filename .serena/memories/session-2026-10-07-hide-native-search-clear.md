# Hide native search clear X (2026-10-07)

Chrome/Edge draw a default clear control on `input[type=search]` (`::-webkit-search-cancel-button`). Not our design.

## Fix
`components/ui/input.tsx`: always apply
`[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-ms-clear]:hidden`

Same idea as `numberInputClassName` for spinners. Custom clear (LuX) stays where we add it explicitly.
