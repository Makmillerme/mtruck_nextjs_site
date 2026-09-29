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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  changePasswordAction,
  updateAccountProfileAction,
  updateAvatarAction,
} from "@/utils/actions";
import { getUserInitial } from "@/components/navbar/AccountTrigger";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LuCamera, LuLogOut } from "react-icons/lu";

export default function AccountSettingsForms({
  name,
  email,
  image,
  phone,
  canChangePassword,
}: {
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  canChangePassword: boolean;
}) {
  const t = useTranslations("AccountCabinet");
  const router = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
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
    <div className="grid w-full min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
      <Card className="rounded-sm shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("profileTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative shrink-0">
              <Avatar className="size-16 border border-border sm:size-20">
                {image ? <AvatarImage src={image} alt={name} /> : null}
                <AvatarFallback className="bg-primary text-base font-medium text-primary-foreground sm:text-lg">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-1 -right-1 size-8 rounded-full border border-border shadow-sm"
                    aria-label={t("changeAvatar")}
                  >
                    <LuCamera className="size-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("changeAvatar")}</DialogTitle>
                    <DialogDescription>
                      {t("avatarDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <FormContainer action={updateAvatarAction}>
                    <ImageInput />
                    <SubmitButton text={t("saveAvatar")} className="mt-3" />
                  </FormContainer>
                </DialogContent>
              </Dialog>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold tracking-tight">
                {name}
              </p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {canChangePassword ? (
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  {t("savePassword")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("savePassword")}</DialogTitle>
                  <DialogDescription>
                    {t("passwordDescription")}
                  </DialogDescription>
                </DialogHeader>
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
                  <SubmitButton text={t("savePassword")} className="mt-3" />
                </FormContainer>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("passwordUnavailable")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-sm shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{t("settings")}</CardTitle>
          <CardDescription>{t("settingsPageHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormContainer action={updateAccountProfileAction}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                name="name"
                type="text"
                label={t("nameLabel")}
                defaultValue={name}
              />
              <FormInput
                name="phone"
                type="tel"
                label={t("phoneLabel")}
                defaultValue={phone ?? ""}
                required={false}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <SubmitButton text={t("save")} />
            </div>
          </FormContainer>
        </CardContent>
      </Card>

      <Card className="rounded-sm shadow-sm lg:col-span-2">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-6">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("signOut")}</p>
            <p className="text-xs text-muted-foreground">{t("signOutHint")}</p>
          </div>
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
