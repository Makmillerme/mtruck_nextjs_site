"use client";

import { TrailerSnake } from "@/components/games/trailer-snake";

/** Snake-as-convoy: empty tractor collects trailers. UI Lab only. */
export default function UiLabSnake() {
  return (
    <div className="grid max-w-3xl gap-4">
      <p className="text-sm text-muted-foreground">
        Старт контейнеровозом у navy/white. Біла стрілка веде до причепа —
        під’їдьте, і він чіпляється ззаду. Круїз повільний, W прискорює. Рекорд
        у localStorage.
      </p>
      <div className="overflow-hidden rounded-sm border border-border bg-background p-3 sm:p-4">
        <TrailerSnake className="w-full" />
      </div>
    </div>
  );
}
