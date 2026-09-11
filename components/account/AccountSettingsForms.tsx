"use client";

import { useState } from "react";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import ImageInput from "@/components/form/ImageInput";
import { SubmitButton } from "@/components/form/Buttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  changePasswordAction,
  updateAvatarAction,
  updateProfileNameAction,
} from "@/utils/actions";
import { getUserInitial } from "@/components/navbar/AccountTrigger";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LuLogOut } from "react-icons/lu";

export default function AccountSettingsForms({
  name,
  email,
  image,
  canChangePassword,
}: {
  name: string;
  email: string;
  image?: string | null;
  canChangePassword: boolean;
}) {
  const t = useTranslations("AccountCabinet");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initial = getUserInitial(name, email);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("profileTitle")}</CardTitle>
          <CardDescription>{t("profileDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-border">
              {image ? <AvatarImage src={image} alt={name} /> : null}
              <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{name}</p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0"
                onClick={() => setOpen((prev) => !prev)}
              >
                {open ? t("cancelAvatar") : t("changeAvatar")}
              </Button>
            </div>
          </div>
          {open ? (
            <FormContainer action={updateAvatarAction}>
              <ImageInput />
              <SubmitButton text={t("saveAvatar")} size="sm" className="mt-3" />
            </FormContainer>
          ) : null}
          <Separator />
          <FormContainer action={updateProfileNameAction}>
            <FormInput
              name="name"
              type="text"
              label={t("nameLabel")}
              defaultValue={name}
            />
            <SubmitButton text={t("saveName")} size="sm" className="mt-3" />
          </FormContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("passwordTitle")}</CardTitle>
          <CardDescription>
            {canChangePassword
              ? t("passwordDescription")
              : t("passwordUnavailable")}
          </CardDescription>
        </CardHeader>
        {canChangePassword ? (
          <CardContent>
            <FormContainer action={changePasswordAction}>
              <FormInput
                name="currentPassword"
                type="password"
                label={t("currentPassword")}
              />
              <FormInput
                name="newPassword"
                type="password"
                label={t("newPassword")}
              />
              <FormInput
                name="confirmPassword"
                type="password"
                label={t("confirmPassword")}
              />
              <SubmitButton text={t("savePassword")} size="sm" className="mt-3" />
            </FormContainer>
          </CardContent>
        ) : null}
      </Card>
    </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("signOut")}</CardTitle>
          <CardDescription>{t("signOutHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            <LuLogOut className="size-4" />
            {signingOut ? t("signOutPending") : t("signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
