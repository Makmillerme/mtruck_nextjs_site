"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

type CatalogSoftNavApi = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

const CatalogSoftNavContext = createContext<CatalogSoftNavApi | null>(null);

/** Shared transition for catalog soft-nav — keeps prior UI, no skeleton flash. */
export function CatalogSoftNavProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <CatalogSoftNavContext.Provider value={{ isPending, startTransition }}>
      {children}
    </CatalogSoftNavContext.Provider>
  );
}

export function useCatalogSoftNav(): CatalogSoftNavApi {
  const ctx = useContext(CatalogSoftNavContext);
  if (!ctx) {
    throw new Error("useCatalogSoftNav must be used inside CatalogSoftNavProvider");
  }
  return ctx;
}

/** Optional: filters in UI Lab may sit outside the provider. */
export function useCatalogSoftNavOptional(): CatalogSoftNavApi | null {
  return useContext(CatalogSoftNavContext);
}

/** Dim results while URL soft-nav is pending — keep content, no skeleton. */
export function CatalogSoftNavResults({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isPending } = useCatalogSoftNav();
  return (
    <div
      className={cn(
        "transition-opacity",
        isPending && "pointer-events-none opacity-60",
        className
      )}
      aria-busy={isPending || undefined}
    >
      {children}
    </div>
  );
}
