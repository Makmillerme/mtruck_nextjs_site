"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Dialog / AlertDialog footer canon:
 * - all actions size default (h-11 px-5)
 * - row, sm:justify-end
 * - primary | outline | destructive
 */
export function UiLabDialogFooterCanon() {
  const [primaryOpen, setPrimaryOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [saveDeleteOpen, setSaveDeleteOpen] = useState(false);

  return (
    <div className="grid gap-4">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Футер модалки: усі кнопки <code className="text-xs">size=&quot;default&quot;</code>{" "}
        (<code className="text-xs">h-11 px-5</code>), в ряд,{" "}
        <code className="text-xs">DialogFooter</code> /{" "}
        <code className="text-xs">AlertDialogFooter</code> —{" "}
        <code className="text-xs">sm:justify-end</code>. Variants: primary Save,{" "}
        outline Cancel, destructive Delete/Archive.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Dialog open={primaryOpen} onOpenChange={setPrimaryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Dialog · primary</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Нове значення</DialogTitle>
              <DialogDescription>
                Лише primary справа (закриття — X).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" className="w-fit" onClick={() => setPrimaryOpen(false)}>
                Додати
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Dialog · cancel + primary</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Перенести товар</DialogTitle>
              <DialogDescription>
                Outline Cancel + primary confirm, справа.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelOpen(false)}
              >
                Скасувати
              </Button>
              <Button type="button" onClick={() => setCancelOpen(false)}>
                Підтвердити
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={saveDeleteOpen} onOpenChange={setSaveDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Dialog · save + delete</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Редагувати значення</DialogTitle>
              <DialogDescription>
                Primary Save + destructive Delete, обидві h-11, справа.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                className="w-fit"
                onClick={() => setSaveDeleteOpen(false)}
              >
                Зберегти
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-fit"
                onClick={() => setSaveDeleteOpen(false)}
              >
                Видалити значення
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">AlertDialog · confirm</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Видалити?</AlertDialogTitle>
              <AlertDialogDescription>
                Outline Скасувати + destructive confirm (h-11).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Видалити
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
