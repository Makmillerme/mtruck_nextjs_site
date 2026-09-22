import AccountBreadcrumbs from "@/components/account/AccountBreadcrumbs";
import AccountMobileTabs from "@/components/account/AccountMobileTabs";
import type { ReactNode } from "react";

export default function AccountShell({
  children,
  userCode,
  showTabs = true,
}: {
  children: ReactNode;
  userCode?: string | null;
  /** Cabinet page renders its own framed tabs — hide shell tabs there. */
  showTabs?: boolean;
}) {
  return (
    <div id="account-shell" className="w-full">
      {showTabs ? (
        <div className="mb-6">
          <AccountMobileTabs />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col gap-6 pb-6 md:pb-8">
        <AccountBreadcrumbs userCode={userCode} />
        {children}
      </div>
    </div>
  );
}
