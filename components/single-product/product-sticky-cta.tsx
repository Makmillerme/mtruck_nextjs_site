"use client";

import type { ReactNode } from "react";

/**
 * Mobile inquiry bar. z-40 — below site-header (z-50), above page content.
 * Pair with `pb-24 lg:pb-0` on the page shell so content is not covered.
 */
export default function ProductStickyCta({
  priceLabel,
  cta,
}: {
  priceLabel: string;
  cta: ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="page-container flex items-center justify-between gap-3 !px-0">
        <p className="min-w-0 truncate text-lg font-extrabold tracking-tight">
          {priceLabel}
        </p>
        <div className="shrink-0">{cta}</div>
      </div>
    </div>
  );
}
