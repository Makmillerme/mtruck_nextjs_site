"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

type SoftNavApi = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

const SoftNavContext = createContext<SoftNavApi | null>(null);

/** Shared transition for soft-nav — keeps prior UI, no skeleton flash. */
export function SoftNavProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <SoftNavContext.Provider value={{ isPending, startTransition }}>
      {children}
    </SoftNavContext.Provider>
  );
}

export function useSoftNav(): SoftNavApi {
  const ctx = useContext(SoftNavContext);
  if (!ctx) {
    throw new Error("useSoftNav must be used inside SoftNavProvider");
  }
  return ctx;
}

/** Optional: callers may pass isPending or sit outside the provider. */
export function useSoftNavOptional(): SoftNavApi | null {
  return useContext(SoftNavContext);
}

/**
 * Dim content while soft-nav is pending — keep prior UI, block clicks.
 * Pass `isPending` for local useTransition, or nest under SoftNavProvider.
 */
export function SoftNavPending({
  children,
  className,
  isPending: isPendingProp,
}: {
  children: ReactNode;
  className?: string;
  isPending?: boolean;
}) {
  const ctx = useSoftNavOptional();
  const isPending = isPendingProp ?? ctx?.isPending ?? false;
  return (
    <div
      className={cn(
        "transition-opacity motion-reduce:transition-none",
        isPending && "pointer-events-none opacity-60",
        className
      )}
      aria-busy={isPending || undefined}
    >
      {children}
    </div>
  );
}
