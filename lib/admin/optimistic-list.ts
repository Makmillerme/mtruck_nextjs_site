"use client";

import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useOptimistic, useTransition } from "react";

type ActionResult = { message: string; ok?: boolean };

/** Remove a row immediately, then run the server action; refresh on failure. */
export function useOptimisticListRemove<T extends { id: string }>(items: T[]) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (state, id: string) => state.filter((item) => item.id !== id)
  );

  function removeOptimistically(
    id: string,
    run: () => Promise<ActionResult>
  ) {
    startTransition(async () => {
      removeOptimistic(id);
      const result = await run();
      if (result.message) {
        toast({
          description: result.message,
          variant: result.ok === false ? "destructive" : undefined,
        });
      }
      if (result.ok === false) {
        router.refresh();
      }
    });
  }

  return { optimisticItems, removeOptimistically } as const;
}
