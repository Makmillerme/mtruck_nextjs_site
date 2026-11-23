import type { ReactNode } from "react";
import FinanceCurrenciesPanel from "@/components/admin/finance/finance-currencies-panel";
import FinanceFinancingPanel from "@/components/admin/finance/finance-financing-panel";
import FinancePricingPanel from "@/components/admin/finance/finance-pricing-panel";
import FinanceTabs from "@/components/admin/finance/finance-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { parseFinanceTab } from "@/lib/admin/finance-tab";
import { getAdminUser } from "@/utils/session";

export const dynamic = "force-dynamic";

function FinanceTabCard({ children }: { children: ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="grid gap-6 pt-6">{children}</CardContent>
    </Card>
  );
}

async function AdminFinancePage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const tab = parseFinanceTab(searchParams.tab);

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <FinanceTabs
        tab={tab}
        currencies={
          <FinanceTabCard>
            <FinanceCurrenciesPanel />
          </FinanceTabCard>
        }
        pricing={
          <FinanceTabCard>
            <FinancePricingPanel />
          </FinanceTabCard>
        }
        financing={
          <FinanceTabCard>
            <FinanceFinancingPanel />
          </FinanceTabCard>
        }
      />
    </section>
  );
}

export default AdminFinancePage;
