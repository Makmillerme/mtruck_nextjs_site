"use client";

import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCallbackInquiryAction } from "@/utils/actions";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";
import { LuLoader } from "react-icons/lu";

function SubmitCallbackButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="shrink-0">
      {pending ? (
        <LuLoader className="size-4 animate-spin" aria-hidden />
      ) : null}
      {label}
    </Button>
  );
}

export default function ContactForm() {
  const t = useTranslations("ContactSection");

  return (
    <FormContainer action={submitCallbackInquiryAction}>
      <div className="flex items-center gap-3">
        <Input
          id="callback-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("phonePlaceholder")}
          aria-label={t("phone.label")}
          className="min-w-0 flex-1 font-mono"
        />
        <SubmitCallbackButton label={t("submit")} />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
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
