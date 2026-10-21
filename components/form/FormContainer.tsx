'use client';

import { useActionState, useEffect, useRef } from 'react';
import { notify } from '@/lib/ui/notify';
import type { ActionState, actionFunction } from '@/utils/types';

const initialState: ActionState = {
  message: '',
};

function FormContainer({
  action,
  children,
  id,
  className,
  onSuccess,
  onPendingChange,
}: {
  action: actionFunction;
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Soft-save handlers (e.g. patch admin list without redirect). */
  onSuccess?: (state: ActionState) => void;
  /** Lock parent sheet/dialog while the action runs. */
  onPendingChange?: (pending: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onPendingChangeRef = useRef(onPendingChange);
  onPendingChangeRef.current = onPendingChange;

  useEffect(() => {
    onPendingChangeRef.current?.(isPending);
    return () => {
      onPendingChangeRef.current?.(false);
    };
  }, [isPending]);

  useEffect(() => {
    if (state.message) {
      notify.fromAction(state);
    }
    if (state.ok) {
      onSuccessRef.current?.(state);
    }
  }, [state]);

  return (
    <form id={id} action={formAction} className={className} aria-busy={isPending || undefined}>
      {children}
    </form>
  );
}
export default FormContainer;
