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
        width={36}
        height={36}
        priority
        className={cn(
          "block size-8 shrink-0 rounded-full object-cover",
          className
        )}
        unoptimized={imageUrl.endsWith(".svg")}
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
          "size-9 shrink-0 overflow-hidden rounded-full p-0 text-inherit hover:bg-foreground/10 hover:text-inherit",
          className
        )}
      >
        {user ? (
          <UserAvatar user={user} className="size-full max-h-none max-w-none" />
        ) : (
          <LuUser className="size-5" />
        )}
      </Button>
    );
  }
);

AccountTrigger.displayName = "AccountTrigger";
