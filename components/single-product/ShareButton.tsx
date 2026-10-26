"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/ui/notify";
import { useTranslations } from "next-intl";
import { LuCheck, LuPaperclip } from "react-icons/lu";

function ShareButton({
  productId,
  name: _name,
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
    if (!origin && typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    const url =
      shareLink ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/products/${productId}`
        : "");
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify.success(t("linkCopied"));
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify.error(t("linkCopyFailed"));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={t("copyLink")}
      onClick={copyLink}
    >
      {copied ? (
        <LuCheck className="size-4" aria-hidden />
      ) : (
        <LuPaperclip className="size-4" aria-hidden />
      )}
    </Button>
  );
}

export default ShareButton;
