'use client';

import { useActionState } from 'react';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { actionFunction } from '@/utils/types';

const initialState = {
  message: '',
};

function FormContainer({
  action,
  children,
  id,
  className,
}: {
  action: actionFunction;
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const { toast } = useToast();
  useEffect(() => {
    if (state.message) {
      toast({ description: state.message });
    }
  }, [state, toast]);
  return (
    <form id={id} action={formAction} className={className}>
      {children}
    </form>
  );
}
export default FormContainer;
