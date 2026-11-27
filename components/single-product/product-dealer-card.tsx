import { Button } from "@/components/ui/button";
import { SITE_TELEGRAM_URL } from "@/lib/site-contact";
import type { ReactNode } from "react";
import { FaTelegram } from "react-icons/fa";
import { LuClock, LuMapPin, LuPhone } from "react-icons/lu";

/** Yard / dealer contact block on PDP. */
export default function ProductDealerCard({
  title,
  address,
  hours,
  phoneValue,
  phoneHref,
  telegramLabel,
  visitHint,
  inquiryCta,
}: {
  title: string;
  address: string;
  hours: string;
  phoneValue: string;
  phoneHref: string;
  telegramLabel: string;
  visitHint: string;
  inquiryCta?: ReactNode;
}) {
  return (
    <section
      id="product-dealer"
      className="grid scroll-mt-24 gap-4 border-t border-border pt-8"
      aria-labelledby="product-dealer-heading"
    >
      <h2
        id="product-dealer-heading"
        className="text-xl font-bold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <div className="grid gap-4 rounded-sm border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6 sm:p-6">
        <div className="grid gap-3">
          <p className="inline-flex items-start gap-2 text-sm text-foreground">
            <LuMapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{address}</span>
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LuClock className="size-4 shrink-0" aria-hidden />
            {hours}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {visitHint}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild variant="outline" size="sm">
              <a href={phoneHref}>
                <LuPhone className="size-4" aria-hidden />
                {phoneValue}
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={SITE_TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegram className="size-4" aria-hidden />
                {telegramLabel}
              </a>
            </Button>
          </div>
        </div>
        {inquiryCta ? (
          <div className="min-w-0 sm:justify-self-end">{inquiryCta}</div>
        ) : null}
      </div>
    </section>
  );
}
