import FinanceFinancingView from "@/components/admin/finance/finance-financing-view";
import {
  defaultRootPricingDraft,
  listCatalogRoots,
  listRootPricing,
} from "@/lib/finance/root-pricing";

export default async function FinanceFinancingPanel() {
  const [roots, pricingRows] = await Promise.all([
    listCatalogRoots(),
    listRootPricing(),
  ]);
  const pricingByRoot = Object.fromEntries(
    pricingRows.map((row) => [row.taxonomyNodeId, row])
  );
  const initialScope = roots[0]?.id ?? "ALL";
  if (initialScope !== "ALL" && !pricingByRoot[initialScope]) {
    pricingByRoot[initialScope] = await defaultRootPricingDraft(initialScope);
  }

  return (
    <FinanceFinancingView
      roots={roots.map((root) => ({ id: root.id, name: root.name }))}
      pricingByRoot={pricingByRoot}
      initialScope={initialScope}
    />
  );
}
