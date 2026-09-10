"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Pair({
  primaryLabel,
  secondaryLabel,
  dark,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button size="lg">{primaryLabel}</Button>
      <Button size="lg" variant={dark ? "inverse" : "outline"}>
        {secondaryLabel}
      </Button>
    </div>
  );
}

export default function UiLabButtonSurfaces() {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <div
        data-header-surface="dark"
        className="relative min-h-[280px] overflow-hidden bg-[#061020]"
      >
        <img
          src="/images/hero.webp"
          alt=""
          className="absolute inset-0 size-full object-cover object-[70%_center] opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061020] via-[#061020]/75 to-transparent" />
        <div className="relative flex min-h-[280px] flex-col justify-center gap-5 px-6 py-10 sm:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">hero</p>
          <p className="max-w-md text-2xl font-black tracking-tight text-white">
            Надійний комерційний транспорт з Європи
          </p>
          <Pair dark primaryLabel="Замовити техніку" secondaryLabel="Зв'язатися з нами" />
        </div>
      </div>

      <div className="space-y-4 bg-background px-6 py-8 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          white
        </p>
        <Pair primaryLabel="Замовити техніку" secondaryLabel="Каталог" />
        <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
          <Input readOnly placeholder="+380 XX XXX XX XX" />
          <Button className="shrink-0">Зателефонувати</Button>
        </div>
      </div>

      <div className="space-y-4 bg-secondary px-6 py-8 sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          pastel
        </p>
        <Pair primaryLabel="Показати пропозиції" secondaryLabel="Весь каталог" />
        <div className="flex max-w-sm flex-col gap-3 rounded-sm border border-border bg-background p-5">
          <p className="text-xs text-muted-foreground">2018 · сідельний тягач</p>
          <p className="text-lg font-bold tracking-tight">MAN TGX 18.440</p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-xl font-extrabold tracking-tight">38 500 USD</p>
            <Button>Детальніше</Button>
          </div>
        </div>
      </div>

      <div
        data-header-surface="dark"
        className="space-y-4 bg-foreground px-6 py-8 sm:px-10"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/50">
          navy
        </p>
        <p className="max-w-md text-lg font-bold text-background">Техніка під замовлення</p>
        <Pair dark primaryLabel="Залишити заявку" secondaryLabel="Зв'язатися з нами" />
        <div className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            readOnly
            placeholder="+380 XX XXX XX XX"
            className="border-background/25 bg-transparent text-background placeholder:text-background/40"
          />
          <Button className="shrink-0">Зателефонувати</Button>
        </div>
      </div>
    </div>
  );
}
