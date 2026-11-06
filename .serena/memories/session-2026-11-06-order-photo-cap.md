# AccountOrderLine photo width cap

**Date:** 2026-11-06

Viewport `lg/xl` photo widths (w-56/w-64) made Full HD sheet cards worse than mid-width: photo ate the meta column.

Now photo stays `w-40 sm:w-44` everywhere; height still fills via CSS grid row + `md:min-h-full` + object-cover.

File: `components/account/account-order-line.tsx`.