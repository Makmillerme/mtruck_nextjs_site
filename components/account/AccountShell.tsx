import AccountBreadcrumbs from "@/components/account/AccountBreadcrumbs";
import AccountMobileTabs from "@/components/account/AccountMobileTabs";
import type { ReactNode } from "react";

export default function AccountShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div id="account-shell" className="w-full">
      <div className="mb-6">
        <AccountMobileTabs />
      </div>
      <div className="flex min-w-0 flex-col gap-6 pb-6 md:pb-8">
        <AccountBreadcrumbs />
        {children}
      </div>
    </div>
  );
}
