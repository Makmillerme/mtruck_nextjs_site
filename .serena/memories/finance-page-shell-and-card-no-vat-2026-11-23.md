## Finance page shell + card no VAT (2026-11-23)

1. **Product cards**: VAT lines (`net`/`gross`/`vat`) never shown — only main + STACKED extras. Filter in `product-to-card` + `CardPriceBlock`. VAT remains on PDP buy-box only.

2. **Admin Finance layout** aligned with Catalog / UI Editor canon:
   - Tabs at page level (outside Card), not wrapped in one big Card
   - Each tab content wrapped in `Card shadow-sm` + `CardContent pt-6`
   - `FinanceTabs` TabsList: `w-full sm:w-full` (same as CmsTabs / UiEditorTabs)

Related: `mem:admin-ui-normalize-2026-09`, `mem:ui-tabs-framed-2026-09`, `mem:product-card-currency-stack-2026-11-23`.