import AccountShell from "@/components/account/AccountShell";
import { getAuthUser } from "@/utils/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getAuthUser();

  return <AccountShell>{children}</AccountShell>;
}
