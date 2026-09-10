"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function UiLabCta() {
  return (
    <div className="full-bleed bg-background">
      <div className="page-container space-y-8 py-16 md:py-24">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-primary">
          Dev only · CTA Lab
        </p>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
          01+03 прийнято
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Це вже основа сайту: navy fill на світлому, біла пластина на hero/navy.
          Живі примітиви — у UI Lab, не тут.
        </p>
        <Button asChild size="lg">
          <Link href="/ui-lab">Відкрити UI Lab</Link>
        </Button>
      </div>
    </div>
  );
}
