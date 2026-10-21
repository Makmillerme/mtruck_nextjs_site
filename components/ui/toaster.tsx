"use client"

import { ToastContent } from "@/components/ui/toast-content"
import {
  Toast,
  ToastClose,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <ToastContent
              variant={props.variant}
              title={title}
              description={description}
            >
              {action}
              <ToastClose />
            </ToastContent>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
