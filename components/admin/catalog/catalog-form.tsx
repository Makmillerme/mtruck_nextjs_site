"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  initialTaxonomyActionState,
  type TaxonomyAction,
} from "@/utils/taxonomy-action-state";

export default function CatalogForm({
  action,
  onSuccess,
  className,
  children,
}: {
  action: TaxonomyAction;
  onSuccess?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialTaxonomyActionState);
  const { toast } = useToast();
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (state === initialTaxonomyActionState) return;
    if (state.message) {
      toast({
        description: state.message,
        variant: state.ok ? undefined : "destructive",
      });
    }
    if (state.ok) onSuccessRef.current?.();
  }, [state, toast]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
