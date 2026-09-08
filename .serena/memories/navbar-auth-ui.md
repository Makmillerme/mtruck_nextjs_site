Account UI: `LinksDropdown` splits mobile Sheet vs desktop dropdown.
- Mobile (`<lg`): header trigger is `LuMenu` (3 horizontal lines), `aria-label` = `Navbar.menu`. Avatar is inside `UserAccountSheet` header (`UserAvatar`: photo or first letter of name).
- Desktop logged-in: slim `UserProfileDropdown` with `AccountTrigger` — real `user.image` or first letter of name. No Robohash fallback. Theme Light/Dark/System lives here (`ThemeMenuItems`), not in the header.
- Desktop guest: `LuUser` + login/register dropdown, no theme.
- Mobile logged-in sheet: theme + manage account + logout. Guest sheet: no theme.
`AccountTrigger` must forwardRef and `{...props}` so DropdownMenuTrigger asChild works.
Admin check on client: `isClientAdmin` via NEXT_PUBLIC_ADMIN_EMAIL and NEXT_PUBLIC_ADMIN_TEST_EMAIL.
