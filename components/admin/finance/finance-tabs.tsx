"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { SoftNavPending } from "@/components/soft-nav/soft-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/navigation";
import {
  parseFinanceTab,
  type FinanceTab,
} from "@/lib/admin/finance-tab";

export type { FinanceTab };
export { parseFinanceTab };

export default function FinanceTabs({
  tab,
  currencies,
  pricing,
  financing,
}: {
  tab: FinanceTab;
  currencies: ReactNode;
  pricing: ReactNode;
  financing: ReactNode;
}) {
  const t = useTranslations("FinanceAdmin");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function openTab(value: string) {
    const next = parseFinanceTab(value);
    if (next === tab) return;
    startTransition(() => {
      router.replace(`/admin/finance?tab=${next}`);
    });
  }

  return (
    <Tabs value={tab} onValueChange={openTab}>
      <TabsList className="h-auto w-full max-w-full justify-start overflow-x-auto sm:w-full">
        <TabsTrigger value="currencies" className="shrink-0 sm:flex-1">
          {t("tabCurrencies")}
        </TabsTrigger>
        <TabsTrigger value="pricing" className="shrink-0 sm:flex-1">
          {t("tabPricing")}
        </TabsTrigger>
        <TabsTrigger value="financing" className="shrink-0 sm:flex-1">
          {t("tabFinancing")}
        </TabsTrigger>
      </TabsList>
      <SoftNavPending isPending={isPending}>
        <TabsContent value="currencies" className="mt-6">
          {currencies}
        </TabsContent>
        <TabsContent value="pricing" className="mt-6">
          {pricing}
        </TabsContent>
        <TabsContent value="financing" className="mt-6">
          {financing}
        </TabsContent>
      </SoftNavPending>
    </Tabs>
  );
}
