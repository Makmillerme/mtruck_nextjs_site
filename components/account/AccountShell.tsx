"use client";

import AccountBreadcrumbs from "@/components/account/AccountBreadcrumbs";
import AccountMobileTabs from "@/components/account/AccountMobileTabs";
import AccountNavCard from "@/components/account/AccountNavCard";
import type { ReactNode } from "react";

export default function AccountShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div id="account-shell" className="w-full">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <AccountNavCard />
        <div className="min-w-0">
          <div className="mb-4 lg:hidden">
            <AccountMobileTabs />
          </div>
          <div className="flex flex-col gap-6 pb-6 md:pb-8">
            <AccountBreadcrumbs />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
