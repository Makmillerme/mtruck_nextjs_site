"use client";

import { toast } from "@/components/ui/use-toast";

type NotifyOptions = {
  title?: string;
};

type ActionLike = {
  message: string;
  ok?: boolean;
};

/** Canonical imperative toast API — use instead of raw `toast({...})`. */
export const notify = {
  success(message: string, opts?: NotifyOptions) {
    return toast({
      variant: "success",
      title: opts?.title,
      description: message,
    });
  },

  error(message: string, opts?: NotifyOptions) {
    return toast({
      variant: "destructive",
      title: opts?.title,
      description: message,
    });
  },

  info(message: string, opts?: NotifyOptions) {
    return toast({
      variant: "default",
      title: opts?.title,
      description: message,
    });
  },

  /** Form / server-action result → success unless `ok === false`. */
  fromAction(state: ActionLike) {
    if (!state.message) return;
    if (state.ok === false) {
      return notify.error(state.message);
    }
    return notify.success(state.message);
  },
};
