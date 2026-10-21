"use client";

import { Button } from "@/components/ui/button";
import { ToastContent } from "@/components/ui/toast-content";
import { ToastClose, toastVariants } from "@/components/ui/toast";
import { notify } from "@/lib/ui/notify";
import { cn } from "@/lib/utils";

function StaticToast({
  variant,
  title,
  description,
}: {
  variant: "default" | "success" | "destructive";
  title?: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        toastVariants({ variant }),
        "pointer-events-none max-w-[420px] shadow-none"
      )}
      data-state="open"
    >
      <ToastContent variant={variant} title={title} description={description}>
        <ToastClose tabIndex={-1} />
      </ToastContent>
    </div>
  );
}

export default function UiLabToast() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Повний рядок <code className="text-xs">ToastContent</code> + close —
          той самий layout, що в продакшені через{" "}
          <code className="text-xs">notify.*</code>.
        </p>
        <div className="flex flex-col gap-3">
          <StaticToast variant="success" description="Товар збережено" />
          <StaticToast
            variant="destructive"
            description="Не вдалося зберегти зміни"
          />
          <StaticToast
            variant="default"
            title="Підказка"
            description="Нейтральне повідомлення без акценту"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => notify.success("Товар збережено")}
        >
          Success
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => notify.error("Не вдалося зберегти зміни")}
        >
          Error
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            notify.info("Нейтральне повідомлення", { title: "Підказка" })
          }
        >
          Info
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            notify.fromAction({ message: "Дію виконано", ok: true })
          }
        >
          fromAction OK
        </Button>
      </div>
    </div>
  );
}
