# Client code chip and product code alignment (2026-11-23)

`UserCodeChip`: outline button with a quiet border (`border-border`) and light hover (`hover:bg-foreground/10`), not the outline primary fill. Non-compact (account cabinet and account sheet) shows `clientCodeLabel` above the code, then the copy icon. Compact dropdown is only the code plus icon.

Product edit sheet: `CopyProductCodeButton` is `h-7` and the title is `leading-7`, so the code button shares the title line box.
