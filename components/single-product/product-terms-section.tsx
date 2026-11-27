import {
  LuFileCheck,
  LuSparkles,
  LuTruck,
  LuWrench,
} from "react-icons/lu";

const ICONS = {
  delivery: LuTruck,
  service: LuWrench,
  prep: LuSparkles,
  documents: LuFileCheck,
} as const;

export type ProductTermItem = {
  id: keyof typeof ICONS;
  title: string;
  body: string;
};

/** Expanded trust / deal conditions under PDP tabs. */
export default function ProductTermsSection({
  title,
  items,
}: {
  title: string;
  items: ProductTermItem[];
}) {
  return (
    <section
      id="product-terms"
      className="grid scroll-mt-24 gap-4 border-t border-border pt-8"
      aria-labelledby="product-terms-heading"
    >
      <h2
        id="product-terms-heading"
        className="text-xl font-bold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <li
              key={item.id}
              className="grid gap-2 rounded-sm border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <Icon
                  className="size-4 shrink-0 text-foreground"
                  strokeWidth={2}
                  aria-hidden
                />
                <h3 className="text-sm font-semibold tracking-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
