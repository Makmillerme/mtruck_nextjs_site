"use client";

import Image from "next/image";
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import type { SessionUser } from "@/utils/session";
import { Button } from "@/components/ui/button";
import { LuUser } from "react-icons/lu";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function getUserInitial(
  name: string | undefined | null,
  email: string | undefined | null
) {
  const source = (name ?? "").trim() || (email ?? "").trim();
  const first = [...source][0];
  return first ? first.toUpperCase() : "?";
}

export function isClientAdmin(email: string | undefined) {
  const adminEmails = [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_TEST_EMAIL,
  ].filter(Boolean) as string[];
  return email ? adminEmails.includes(email) : false;
}

export function UserAvatar({
  user,
  className,
}: {
  user: SessionUser;
  className?: string;
}) {
  const [avatarError, setAvatarError] = useState(false);
  const name = user.name || "User";
  const imageUrl = !avatarError && user.image?.trim() ? user.image : null;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={32}
        height={32}
        className={cn(
          "h-8 w-8 max-h-8 max-w-8 shrink-0 rounded-full object-cover",
          className
        )}
        style={{ height: 32, width: 32 }}
        onError={() => setAvatarError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground",
        className
      )}
      aria-hidden
    >
      {getUserInitial(user.name, user.email)}
    </span>
  );
}

type AccountTriggerProps = ComponentPropsWithoutRef<typeof Button> & {
  user: SessionUser | null;
};

export const AccountTrigger = forwardRef<HTMLButtonElement, AccountTriggerProps>(
  function AccountTrigger({ user, className, ...props }, ref) {
    const t = useTranslations("Navbar");

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label={t("account")}
        {...props}
        className={cn(
          "size-9 shrink-0 overflow-hidden rounded-full p-0",
          className
        )}
      >
        {user ? (
          <UserAvatar user={user} />
        ) : (
          <LuUser className="size-5 text-foreground" />
        )}
      </Button>
    );
  }
);

AccountTrigger.displayName = "AccountTrigger";
