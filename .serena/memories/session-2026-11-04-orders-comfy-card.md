## Orders cart card COMFY canon (2026-11-04)

### AccountOrderLine
- Dual layout: `<lg` COMFY stack (photo+meta → price → actions); `lg+` horizontal row
- Photo always `aspect-[4/3] object-cover` — **never** self-stretch / items-stretch on photo row
- Phone: w-24/28/32; Desktop: w-36 / xl:w-40
- No edit; favorites + delete with visible labels
- Selection: click + primary ring

### Shell
- Summary sticky sidebar from md (16→18→20rem)

### Verified CDP
- 390: stack, photo 96×72 (1.33)
- 768: stack + sidebar, photo 128×96
- 1024: row, photo 144×108
- 1280: row, photo 160×120

### Files
- components/account/account-order-line.tsx
- components/dev/ui-lab-account-orders.tsx
