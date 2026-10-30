"use client";

import {
  PAGE_SHELLS,
  pageShellClassName,
  type PageShell,
} from "@/components/global/Container";
import { cn } from "@/lib/utils";

const SHELL_SAMPLES: {
  shell: PageShell;
  max: string;
  use: string;
}[] = [
  { shell: "home", max: "1360px", use: "Головна (full-bleed секції)" },
  { shell: "catalog", max: "1920px", use: "Каталог (.page-content)" },
  { shell: "product", max: "1520px", use: "PDP (layout .page-container)" },
  { shell: "reading", max: "1280px", use: "Вузькі текстові блоки PDP" },
  { shell: "admin", max: "none (shared gutters)", use: "Адмінка" },
];

const TYPE_SAMPLES = [
  {
    label: "Display / page title",
    className: "text-3xl font-extrabold tracking-tight md:text-4xl",
    ua: "Каталог вантажівок",
    en: "MTruck catalog",
    note: "Сторінкові H1. Вага 800 (у Manrope немає 900).",
  },
  {
    label: "Section title",
    className: "text-lg font-bold tracking-tight",
    ua: "Оберіть категорію техніки",
    en: "Choose a vehicle category",
    note: "H2 секцій; у Lab — заголовки блоків.",
  },
  {
    label: "Body",
    className: "text-base leading-relaxed",
    ua: "Преміальні тягачі та напівпричепи з Європи.",
    en: "Premium trucks and trailers from Europe.",
    note: "Основний текст сторінки.",
  },
  {
    label: "Muted / lede",
    className: "text-sm text-muted-foreground",
    ua: "Якість, надійність і прозорий пробіг.",
    en: "Quality, reliability, transparent mileage.",
    note: "Підзаголовки, підказки, вторинний текст.",
  },
  {
    label: "Caption",
    className:
      "font-mono text-xs font-medium uppercase tracking-[0.22em] text-primary",
    ua: "Європейські вантажівки",
    en: "European trucks",
    note: "Eyebrow: той самий Manrope, не окремий mono-файл.",
  },
] as const;

const WEIGHT_SAMPLES = [
  { className: "font-normal", label: "400 Regular" },
  { className: "font-medium", label: "500 Medium" },
  { className: "font-semibold", label: "600 Semibold" },
  { className: "font-bold", label: "700 Bold" },
  { className: "font-extrabold", label: "800 ExtraBold" },
] as const;

const SPACING_SAMPLES = [
  {
    label: ".section-spacing-tight",
    className: "section-spacing-tight",
    note: "clamp(2rem … 3rem) — компактні секції.",
  },
  {
    label: ".section-spacing",
    className: "section-spacing",
    note: "clamp(3rem … 5rem) — стандартні маркетингові секції.",
  },
] as const;

function RuleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-sm border border-border bg-card p-4">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function UiLabLayoutRules() {
  return (
    <div className="grid gap-6">
      <RuleCard title="Canvas vs surface">
        <p className="text-sm text-muted-foreground">
          Сторінка — дуже світлий холодний сірий canvas ({" "}
          <code className="text-xs">--background</code>
          ). Поверхні (картки, popover, sidebar, PDP details) — чистий білий{" "}
          <code className="text-xs">--card</code> /{" "}
          <code className="text-xs">bg-card</code>. Обидва виглядають «білими»,
          але біле на сірому дає легку ієрархію без важких тіней. Не теплий
          cream.
        </p>
        <div className="mt-3 overflow-hidden rounded-sm border border-border">
          <div className="grid gap-3 bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              live tokens — bg-background / bg-card
            </p>
            <div className="rounded-sm border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                Surface (білий)
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Картка / buy-box / details tabs —{" "}
                <code className="text-xs">bg-card</code> на canvas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-sm border border-dashed border-border/80 bg-background px-3 py-4 text-center text-[11px] text-muted-foreground">
                canvas
              </div>
              <div className="rounded-sm border border-border bg-card px-3 py-4 text-center text-[11px] text-foreground">
                card / white
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Токени: <code>--background: 210 18% 97%</code>,{" "}
          <code>--card / --popover: 0 0% 100%</code>.
        </p>
      </RuleCard>

      <RuleCard title="Шрифт">
        <p className="text-sm text-muted-foreground">
          Єдиний шрифт сайту: <code className="text-xs">Manrope</code> (
          <code className="text-xs">--font-manrope</code> →{" "}
          <code className="text-xs">font-sans</code> і{" "}
          <code className="text-xs">font-mono</code>). Subsets: latin, latin-ext,
          cyrillic, cyrillic-ext. Body:{" "}
          <code className="text-xs">antialiased</code>. Не підключати Plus Jakarta,
          Geist, Inter або другий файловий шрифт.
        </p>
        <div className="mt-3 grid gap-1 border-t border-border pt-3">
          {WEIGHT_SAMPLES.map((sample) => (
            <p key={sample.label} className={cn("text-base", sample.className)}>
              {sample.label} — Каталог вантажівок / MTruck
            </p>
          ))}
        </div>
        <div className="mt-2 grid gap-4">
          {TYPE_SAMPLES.map((sample) => (
            <div key={sample.label} className="grid gap-1 border-t border-border pt-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {sample.label} — {sample.note}
              </p>
              <p className={cn(sample.className)}>{sample.ua}</p>
              <p className={cn(sample.className)}>{sample.en}</p>
              <code className="text-[11px] text-muted-foreground">{sample.className}</code>
            </div>
          ))}
        </div>
      </RuleCard>

      <RuleCard title="Горизонтальні відступи (gutters)">
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>
            <code className="text-xs text-foreground">.page-container</code> і{" "}
            <code className="text-xs text-foreground">.page-content</code> —
            спільні gutters; стеля ширини — через shell (нижче).
          </li>
          <li>
            Mobile (&lt; 40rem):{" "}
            <code className="text-xs">padding-inline: 1.25rem</code> (~20px).
          </li>
          <li>
            Tablet+:{" "}
            <code className="text-xs">
              clamp(2rem, 1.75rem + 0.5vw, 2.25rem)
            </code>{" "}
            (~32–36px). Один канон для всіх маршрутів (включно з admin).
          </li>
          <li>
            Navbar і Footer — ті самі gutters, без per-route max-width (chrome не
            стрибає).
          </li>
        </ul>
        <div className="mt-3 overflow-hidden rounded-sm border border-dashed border-border bg-muted/40">
          <div className="page-container bg-background/80 py-3">
            <div className="rounded-sm bg-primary/10 px-3 py-2 text-xs text-foreground">
              Живий <code>.page-container</code> — контент всередині gutter.
            </div>
          </div>
        </div>
      </RuleCard>

      <RuleCard title="Shell widths">
        <p className="text-sm text-muted-foreground">
          Іменовані стелі:{" "}
          <code className="text-xs">.page-shell-*</code> + маркер{" "}
          <code className="text-xs">data-page-shell</code>. Токени:{" "}
          <code className="text-xs">--shell-home|catalog|product|reading</code>.
          API: <code className="text-xs">Container shell=&quot;…&quot;</code>.
        </p>
        <ul className="mt-3 grid gap-2">
          {SHELL_SAMPLES.map((sample) => (
            <li
              key={sample.shell}
              className="grid gap-1 rounded-sm border border-border bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <code className="font-medium text-foreground">
                  {pageShellClassName[sample.shell]}
                </code>
                <span className="text-muted-foreground">{sample.max}</span>
              </div>
              <p className="text-muted-foreground">{sample.use}</p>
              <div
                className={cn(
                  "mt-1 h-2 rounded-sm bg-primary/25",
                  pageShellClassName[sample.shell],
                  "w-full"
                )}
                title={sample.shell}
              />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Канон shells: {[...PAGE_SHELLS].join(", ")}.
        </p>
      </RuleCard>

      <RuleCard title="Вертикаль секцій">
        <ul className="mb-3 grid gap-2 text-sm text-muted-foreground">
          <li>
            Маркетинг: класи{" "}
            <code className="text-xs text-foreground">.section-spacing</code> /{" "}
            <code className="text-xs text-foreground">.section-spacing-tight</code>.
          </li>
          <li>
            Внутрішні сторінки без{" "}
            <code className="text-xs text-foreground">.full-bleed</code> /{" "}
            <code className="text-xs text-foreground">.page-content</code>: main
            додає <code className="text-xs">padding-top: clamp(2.5rem…3.5rem)</code>{" "}
            під sticky header.
          </li>
          <li>
            <code className="text-xs text-foreground">.page-content</code>: власний{" "}
            vertical pad <code className="text-xs">clamp(1.5rem…2.5rem)</code>.
          </li>
        </ul>
        <div className="grid gap-3">
          {SPACING_SAMPLES.map((sample) => (
            <div
              key={sample.label}
              className={cn(
                "rounded-sm border border-dashed border-border bg-muted/30",
                sample.className
              )}
            >
              <div className="rounded-sm bg-background/90 px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{sample.label}</span>
                <span className="text-muted-foreground"> — {sample.note}</span>
              </div>
            </div>
          ))}
        </div>
      </RuleCard>

      <RuleCard title="Вкладеність layout">
        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li>
            <code className="text-xs text-foreground">app/[locale]/layout.tsx</code>:{" "}
            main → <code className="text-xs">.page-container</code> з{" "}
            <code className="text-xs">has-[.full-bleed]:contents</code> /{" "}
            <code className="text-xs">has-[.page-content]:contents</code>.
          </li>
          <li>
            Hero / edge-to-edge: обгортка{" "}
            <code className="text-xs text-foreground">.full-bleed</code> (знімає
            подвійний gutter).
          </li>
          <li>
            Кабінет / адмінка: зазвичай{" "}
            <code className="text-xs text-foreground">.page-content</code> або власний
            контейнер всередині того ж gutter-контракту.
          </li>
          <li>
            Flex/Grid тільки; <code className="text-xs">position: absolute</code> —
            лише коли технічно необхідно.
          </li>
        </ul>
      </RuleCard>

      <RuleCard title="Картки в сітці (каталог)">
        <ul className="mb-3 grid gap-2 text-sm text-muted-foreground">
          <li>
            Канон:{" "}
            <code className="text-xs text-foreground">
              grid-cols-1 sm:grid-cols-2 min-[900px]:grid-cols-3 gap-4 md:gap-5
            </code>
            — без 4 колонок.
          </li>
          <li>
            Мін. ширина колонки ~280–300px: краще менше колонок, ніж дрібні картки.
          </li>
          <li>
            Заголовок завжди <code className="text-xs">line-clamp-2</code>; specs —{" "}
            <code className="text-xs">min-w-0</code> + truncate значення, іконка{" "}
            <code className="text-xs">shrink-0</code>.
          </li>
          <li>
            CTA: ціна зверху, <code className="text-xs">Button w-full</code>{" "}
            «Детальніше» знизу (<code className="text-xs">mt-auto</code>).
          </li>
          <li>
            Фото: спільний <code className="text-xs">PhotoCarousel</code>, не
            локальний Image.
          </li>
        </ul>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 min-[900px]:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-sm border border-dashed border-border bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground"
            >
              col {n}
            </div>
          ))}
        </div>
      </RuleCard>
    </div>
  );
}
