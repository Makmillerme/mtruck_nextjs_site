import { LuHeart, LuPhone } from "react-icons/lu";

function MockBar() {
  return (
    <div className="page-container grid h-14 grid-cols-[1fr_auto] items-center gap-2 lg:h-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3">
      <img
        src="/logo_mtruck.svg?v=flatsteel7"
        alt="M-TRUCK"
        className="h-8 w-auto lg:h-10"
      />
      <nav className="hidden items-center gap-1 lg:flex">
        <span className="rounded-md bg-foreground/10 px-3 py-2 text-sm font-medium tracking-wide">
          Головна
        </span>
        <span className="px-3 py-2 text-sm font-medium tracking-wide text-foreground/80">
          Каталог
        </span>
        <span className="px-3 py-2 text-sm font-medium tracking-wide text-foreground/80">
          Послуги
        </span>
      </nav>
      <div className="flex items-center justify-end gap-1">
        <LuPhone className="size-5" aria-hidden />
        <LuHeart className="size-5" aria-hidden />
        <span className="px-1.5 text-sm font-medium">UA</span>
        <span className="flex size-8 items-center justify-center rounded-full border border-foreground/30 text-xs font-bold">
          M
        </span>
      </div>
    </div>
  );
}

const SURFACES = [
  {
    key: "photo",
    label: "hero / photo",
    surface: "dark" as const,
    shell: (
      <img
        src="/images/hero.webp"
        alt=""
        className="absolute inset-0 size-full object-cover object-[70%_center]"
      />
    ),
  },
  {
    key: "navy",
    label: "navy band",
    surface: "dark" as const,
    shell: <div className="absolute inset-0 bg-foreground" />,
  },
  {
    key: "white",
    label: "white",
    surface: "light" as const,
    shell: <div className="absolute inset-0 bg-background" />,
  },
  {
    key: "pastel",
    label: "pastel",
    surface: "light" as const,
    shell: <div className="absolute inset-0 bg-secondary" />,
  },
] as const;

export default function UiLabHeader() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ті самі класи, що на сайті: порожній `.site-header-glass` (blur + saturate) і
        прозорий `.site-header` (хамелеон light/dark, без нижньої риски). Blur на
        header з кнопками Chrome скидає — це не канон.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {SURFACES.map((item) => (
          <figure key={item.key} className="space-y-2">
            <div className="relative min-h-[168px]">
              {item.shell}
              <div
                aria-hidden
                data-surface={item.surface}
                className="site-header-glass pointer-events-none absolute inset-x-0 top-0 h-14 backdrop-blur-2xl lg:h-16"
              />
              <header
                data-surface={item.surface}
                className="site-header relative z-10"
              >
                <MockBar />
              </header>
            </div>
            <figcaption className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {item.label} · data-surface={item.surface}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
