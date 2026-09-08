import AccountSettingsForms from "@/components/account/AccountSettingsForms";
import { userHasCredentialAccount } from "@/utils/actions";
import { getAuthUser } from "@/utils/session";

export default async function AccountSettingsPage() {
  const user = await getAuthUser();
  const canChangePassword = await userHasCredentialAccount();

  return (
    <AccountSettingsForms
      name={user.name}
      email={user.email}
      image={user.image}
      canChangePassword={canChangePassword}
    />
  );
}
