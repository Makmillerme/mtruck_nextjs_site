export type ProductHowtoStep = {
  id: string;
  title: string;
  body: string;
};

/** Buyer journey steps on PDP. */
export default function ProductHowtoSection({
  title,
  steps,
}: {
  title: string;
  steps: ProductHowtoStep[];
}) {
  return (
    <section
      id="product-howto"
      className="grid scroll-mt-24 gap-4 border-t border-border pt-8"
      aria-labelledby="product-howto-heading"
    >
      <h2
        id="product-howto-heading"
        className="text-xl font-bold tracking-tight text-foreground"
      >
        {title}
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="grid gap-2 rounded-sm border border-border bg-card p-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
