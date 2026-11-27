PDP `#financing` is one shared card. Left stack is tabs + sliders, full column width, tight `gap-6`. Right is the quote. Caption is only `financingMonthly`.

Slider levels are stored per mode. `selectMode` only changes the tab. Credit and lease each keep their own down payment and term, starting from that mode's preset defaults. Switching does not copy one mode onto the other and does not reset a mode the user already moved.

Tab looks: admin framed primary; client segment (`segmentTabs*` in `components/ui/tabs.tsx`); content underline (`contentTabs*` in `product-details-tabs.tsx`).
