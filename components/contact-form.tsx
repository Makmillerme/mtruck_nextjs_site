"use client";

import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitCallbackInquiryAction } from "@/utils/actions";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { LuLoader } from "react-icons/lu";

function SubmitCallbackButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full shrink-0">
      {pending ? (
        <LuLoader className="size-4 animate-spin" aria-hidden />
      ) : null}
      {label}
    </Button>
  );
}

export default function ContactForm({
  inputId = "callback-phone",
  messageId = "callback-note",
  onSuccess,
  productId,
  productName,
  productCode,
  knownPhone = null,
}: {
  inputId?: string;
  messageId?: string;
  onSuccess?: () => void;
  productId?: string | null;
  productName?: string | null;
  productCode?: string | null;
  /** Logged-in primary phone — hide tel field and submit this value. */
  knownPhone?: string | null;
} = {}) {
  const t = useTranslations("ContactSection");
  const hasKnownPhone = Boolean(knownPhone?.trim());

  return (
    <FormContainer
      action={submitCallbackInquiryAction}
      onSuccess={() => onSuccess?.()}
      className="grid gap-3"
    >
      {productId ? (
        <input type="hidden" name="productId" value={productId} />
      ) : null}
      {productName ? (
        <input type="hidden" name="productName" value={productName} />
      ) : null}
      {productCode ? (
        <input type="hidden" name="productCode" value={productCode} />
      ) : null}
      {hasKnownPhone ? (
        <input type="hidden" name="phone" value={knownPhone!.trim()} />
      ) : (
        <Input
          id={inputId}
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("phonePlaceholder")}
          aria-label={t("phone.label")}
          className="font-mono"
        />
      )}
      <Textarea
        id={messageId}
        name="note"
        rows={4}
        maxLength={2000}
        placeholder={t("messagePlaceholder")}
        aria-label={t("messageLabel")}
        className="min-h-[6rem] resize-y"
      />
      <SubmitCallbackButton label={t("submit")} />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t.rich("privacy", {
          privacy: (chunks) => (
            <Link href="/privacy" className="text-primary hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </FormContainer>
  );
}
