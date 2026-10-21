"use client";

import { useActionState, useEffect, useRef } from "react";
import { notify } from "@/lib/ui/notify";
import {
  initialTaxonomyActionState,
  type TaxonomyAction,
} from "@/utils/taxonomy-action-state";

export default function CatalogForm({
  action,
  onSuccess,
  onPendingChange,
  className,
  id,
  children,
}: {
  action: TaxonomyAction;
  onSuccess?: () => void;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialTaxonomyActionState
  );
  const onSuccessRef = useRef(onSuccess);
  const onPendingChangeRef = useRef(onPendingChange);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onPendingChangeRef.current = onPendingChange;
  }, [onPendingChange]);

  useEffect(() => {
    onPendingChangeRef.current?.(isPending);
    return () => {
      onPendingChangeRef.current?.(false);
    };
  }, [isPending]);

  useEffect(() => {
    if (state === initialTaxonomyActionState) return;
    if (state.message) {
      notify.fromAction(state);
    }
    if (state.ok) onSuccessRef.current?.();
  }, [state]);

  return (
    <form
      id={id}
      action={formAction}
      className={className}
      aria-busy={isPending || undefined}
    >
      {children}
    </form>
  );
}
