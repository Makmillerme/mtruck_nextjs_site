import AccountSettingsForms from "@/components/account/AccountSettingsForms";
import { userHasCredentialAccount } from "@/utils/actions";
import db from "@/utils/db";
import { getAuthUser } from "@/utils/session";

export default async function AccountSettingsPage() {
  const user = await getAuthUser();
  const canChangePassword = await userHasCredentialAccount();
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { phone: true },
  });

  return (
    <AccountSettingsForms
      name={user.name}
      email={user.email}
      image={user.image}
      phone={profile?.phone}
      canChangePassword={canChangePassword}
    />
  );
}
