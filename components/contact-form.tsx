"use client";

import FormContainer from "@/components/form/FormContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitCallbackInquiryAction } from "@/utils/actions";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormStatus } from "react-dom";

function SubmitCallbackButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="h-12 shrink-0 px-8 font-semibold"
    >
      {pending ? (
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
      ) : null}
      {label}
    </Button>
  );
}

export default function ContactForm() {
  const t = useTranslations("ContactSection");

  return (
    <FormContainer action={submitCallbackInquiryAction}>
      <div className="flex gap-3">
        <Input
          id="callback-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("phonePlaceholder")}
          aria-label={t("phone.label")}
          className="h-12 min-w-0 flex-1 bg-background font-mono"
        />
        <SubmitCallbackButton label={t("submit")} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
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
