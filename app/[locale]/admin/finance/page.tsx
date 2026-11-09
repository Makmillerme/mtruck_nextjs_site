import FinanceCurrenciesPanel from "@/components/admin/finance/finance-currencies-panel";
import FinanceStubPanel from "@/components/admin/finance/finance-stub-panel";
import FinanceTabs from "@/components/admin/finance/finance-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { parseFinanceTab } from "@/lib/admin/finance-tab";
import { getTranslations } from "next-intl/server";
import { getAdminUser } from "@/utils/session";

export const dynamic = "force-dynamic";

async function AdminFinancePage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await getAdminUser();
  const searchParams = await props.searchParams;
  const tab = parseFinanceTab(searchParams.tab);
  const t = await getTranslations("FinanceAdmin");

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <Card className="shadow-sm">
        <CardContent className="grid gap-6 pt-6">
          <FinanceTabs
            tab={tab}
            currencies={<FinanceCurrenciesPanel />}
            pricing={
              <FinanceStubPanel
                heading={t("pricingHeading")}
                description={t("pricingDescription")}
              />
            }
            taxes={
              <FinanceStubPanel
                heading={t("taxesHeading")}
                description={t("taxesDescription")}
              />
            }
            financing={
              <FinanceStubPanel
                heading={t("financingHeading")}
                description={t("financingDescription")}
              />
            }
          />
        </CardContent>
      </Card>
    </section>
  );
}

export default AdminFinancePage;
