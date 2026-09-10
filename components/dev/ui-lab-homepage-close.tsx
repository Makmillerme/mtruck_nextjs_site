"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FaTelegram } from "react-icons/fa";
import { LuClock, LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const MOCK_CASES = [
  {
    key: "lviv",
    object: "object-[32%_center]",
    model: "Scania R450 · 2019",
    route: "NL → UA",
    buyer: "Перевізник, Львів",
  },
  {
    key: "kyiv",
    object: "object-[58%_center]",
    model: "DAF XF 480 · 2021",
    route: "DE → UA",
    buyer: "Автопарк, Київ",
  },
  {
    key: "odesa",
    object: "object-[78%_center]",
    model: "MAN TGX 18.500 · 2020",
    route: "PL → UA",
    buyer: "Будівельна компанія, Одеса",
  },
] as const;

export default function UiLabHomepageClose() {
  return (
    <div className="space-y-0">
      <section
        data-header-surface="dark"
        className="full-bleed bg-foreground text-background"
      >
        <div className="page-container py-12">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-background/60">
            Індивідуальний підбір
          </p>
          <h2 className="text-2xl font-black tracking-tight text-background md:text-3xl">
            Техніка під замовлення
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/70">
            CTA на navy — біла пластина `default`, по центру. Не ghost і не ліва
            вирівняна смуга тексту.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg">Залишити заявку</Button>
          </div>
        </div>
      </section>

      <section className="full-bleed bg-background">
        <div className="page-container py-12">
          <header className="grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5 lg:col-start-8 lg:text-right">
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Продажі
              </p>
              <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                Останні відвантаження
              </h2>
            </div>
            <p className="text-sm text-muted-foreground lg:col-span-7 lg:col-start-1 lg:row-start-1">
              Триптих + маніфест: різна ширина кадрів, волосина між колонами. Заголовок справа на lg.
            </p>
          </header>
          <Separator className="my-8 bg-border" />
          <ol className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.3fr)_minmax(0,1.05fr)] lg:gap-px lg:bg-border">
            {MOCK_CASES.map((item, index) => (
              <li key={item.key} className="bg-background">
                <figure className="overflow-hidden bg-secondary">
                  <img
                    src="/images/hero.webp"
                    alt=""
                    className={cn(
                      "h-44 w-full object-cover lg:h-64",
                      item.object
                    )}
                  />
                </figure>
                <div className="flex flex-col gap-1 pt-4 lg:px-5 lg:pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} · {item.route}
                  </p>
                  <p className="font-black tracking-tight text-foreground">{item.model}</p>
                  <p className="text-sm text-muted-foreground">{item.buyer}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="full-bleed bg-secondary">
        <div className="page-container py-12">
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Звʼязатись з нами
            </p>
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Замовити дзвінок
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <Input
                type="tel"
                readOnly
                value="+380 XX XXX XX XX"
                className="min-w-0 flex-1 font-mono"
              />
              <Button type="button" className="shrink-0">
                Зателефонувати
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Компактна смуга: Input h-11 + Button default, без карток і карти.
            </p>
          </div>
        </div>
      </section>

      <section data-header-surface="dark" className="full-bleed bg-foreground text-background">
        <div className="page-container flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-background/65">Фрагмент футера · Logo + inverse Telegram</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-background/80">
            <span className="inline-flex items-center gap-2">
              <LuPhone className="size-5" aria-hidden />
              +380 44 123 45 67
            </span>
            <span className="inline-flex items-center gap-2">
              <LuMail className="size-5" aria-hidden />
              info@m-truck.ua
            </span>
            <span className="inline-flex items-center gap-2">
              <LuMapPin className="size-5" aria-hidden />
              Київ
            </span>
            <span className="inline-flex items-center gap-2">
              <LuClock className="size-5" aria-hidden />
              Пн–Пт
            </span>
            <Button type="button" variant="inverse" size="sm">
              <FaTelegram className="size-4" aria-hidden />
              Telegram
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
