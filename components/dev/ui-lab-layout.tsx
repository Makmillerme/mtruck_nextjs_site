"use client";

import { cn } from "@/lib/utils";

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
            <code className="text-xs text-foreground">.page-content</code> — без{" "}
            <code className="text-xs">max-width: 80rem</code>.
          </li>
          <li>
            Mobile (&lt; 40rem): <code className="text-xs">padding-inline: 1rem</code>{" "}
            (~16px).
          </li>
          <li>
            Tablet+:{" "}
            <code className="text-xs">
              clamp(1.75rem, 1.5rem + 0.45vw, 1.875rem)
            </code>{" "}
            (~28–30px). Без жорстких <code className="text-xs">px</code> у
            викликах.
          </li>
          <li>
            Navbar і Footer використовують той самий токен.
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
