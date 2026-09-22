import AccountShell from "@/components/account/AccountShell";
import { ensureUserCode } from "@/lib/codes";
import { getAuthUser } from "@/utils/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const userCode = await ensureUserCode(user.id);

  return (
    <AccountShell userCode={userCode} showTabs={false}>
      {children}
    </AccountShell>
  );
}
