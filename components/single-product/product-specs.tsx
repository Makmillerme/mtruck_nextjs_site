import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductSpecGroup } from "@/lib/catalog/product-page";

function SpecPairCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 text-sm">
      <span className="min-w-0 text-muted-foreground">{label}</span>
      <span className="shrink-0 text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

/** One shared border per visual row so left/right separators stay aligned. */
function SpecRows({ rows }: { rows: ProductSpecGroup["rows"] }) {
  const pairs: Array<
    [ProductSpecGroup["rows"][number], ProductSpecGroup["rows"][number] | null]
  > = [];
  for (let i = 0; i < rows.length; i += 2) {
    pairs.push([rows[i], rows[i + 1] ?? null]);
  }

  return (
    <div className="grid gap-0">
      {pairs.map(([left, right]) => (
        <div
          key={left.id}
          className="grid gap-x-10 border-b border-border/60 py-2.5 last:border-b-0 md:grid-cols-2"
        >
          <SpecPairCell label={left.label} value={left.value} />
          {right ? (
            <SpecPairCell label={right.label} value={right.value} />
          ) : (
            <div className="hidden md:block" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProductSpecs({
  groups,
  title,
}: {
  groups: ProductSpecGroup[];
  title?: string;
}) {
  if (groups.length === 0) return null;

  const named = groups.filter((group) => group.title.trim().length > 0);
  const useAccordion = named.length >= 2;
  const heading = title?.trim() ?? "";
  const groupFallback = heading || "—";

  return (
    <section className="grid w-full scroll-mt-24 gap-4">
      {heading ? (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {heading}
        </h2>
      ) : null}

      {useAccordion ? (
        <Accordion
          type="multiple"
          defaultValue={named.slice(0, 2).map((group) => group.id)}
          className="rounded-sm border border-border"
        >
          {groups.map((group) => (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="border-border px-4"
            >
              <AccordionTrigger className="text-sm font-semibold">
                {group.title.trim() || groupFallback}
              </AccordionTrigger>
              <AccordionContent>
                <SpecRows rows={group.rows} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="grid gap-6 rounded-sm border border-border p-4">
          {groups.map((group) => (
            <div key={group.id} className="grid gap-3">
              {group.title.trim() ? (
                <h3 className="text-sm font-semibold text-foreground">
                  {group.title}
                </h3>
              ) : null}
              <SpecRows rows={group.rows} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
