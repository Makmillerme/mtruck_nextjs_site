"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaTelegram } from "react-icons/fa";
import { LuClock, LuMail, LuMapPin, LuPhone } from "react-icons/lu";

const MOCK_CASES = [
  {
    key: "lviv",
    object: "object-[22%_center]",
    frame: "lg:origin-bottom-left lg:-rotate-2",
    offset: "",
    model: "Scania R450 · 2019",
    route: "NL → UA",
    buyer: "Перевізник, Львів",
  },
  {
    key: "kyiv",
    object: "object-[58%_center]",
    frame: "lg:rotate-1",
    offset: "lg:ml-[16%] lg:-mt-8",
    model: "DAF XF 480 · 2021",
    route: "DE → UA",
    buyer: "Автопарк, Київ",
  },
  {
    key: "odesa",
    object: "object-[82%_center]",
    frame: "lg:origin-bottom-right lg:-rotate-1",
    offset: "lg:ml-[32%] lg:-mt-8",
    model: "MAN TGX 18.500 · 2020",
    route: "PL → UA",
    buyer: "Будівельна компанія, Одеса",
  },
] as const;

export default function UiLabHomepageClose() {
  return (
    <div className="space-y-0">
      <section className="full-bleed bg-background">
        <div className="page-container py-12">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Продажі
          </p>
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            Кому вже відвантажили
          </h2>
          <ol className="mt-10 flex flex-col gap-10 lg:gap-0">
            {MOCK_CASES.map((item) => (
              <li key={item.key} className={`max-w-md ${item.offset}`}>
                <figure className={`overflow-hidden rounded-sm bg-secondary ${item.frame}`}>
                  <img
                    src="/images/hero.webp"
                    alt=""
                    className={`aspect-[16/9] size-full object-cover ${item.object}`}
                  />
                </figure>
                <div className="mt-3 space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.route}
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
