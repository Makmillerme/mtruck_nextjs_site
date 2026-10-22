"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notify } from "@/lib/ui/notify";
import { useTranslations } from "next-intl";
import { LuCheck, LuCopy, LuShare2 } from "react-icons/lu";

function ShareButton({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const t = useTranslations("Product");
  const configuredUrl = process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
  const [origin, setOrigin] = useState(configuredUrl ?? "");
  const [copied, setCopied] = useState(false);

  const shareLink = useMemo(
    () => `${origin || configuredUrl || ""}/products/${productId}`,
    [origin, configuredUrl, productId]
  );

  async function copyLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      notify.success(t("linkCopied"));
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify.error(t("linkCopyFailed"));
    }
  }

  async function nativeShare() {
    if (!shareLink || typeof navigator.share !== "function") {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: name, url: shareLink });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && !origin && typeof window !== "undefined") {
          setOrigin(window.location.origin);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="p-2" aria-label={t("share")}>
          <LuShare2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        className="grid w-56 gap-2 p-3"
      >
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={copyLink}
        >
          {copied ? (
            <LuCheck className="size-4" />
          ) : (
            <LuCopy className="size-4" />
          )}
          {copied ? t("linkCopied") : t("copyLink")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full justify-start gap-2"
          onClick={nativeShare}
        >
          <LuShare2 className="size-4" />
          {t("shareNative")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default ShareButton;
