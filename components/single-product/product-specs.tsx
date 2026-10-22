import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductSpecGroup } from "@/lib/catalog/product-page";

function SpecRows({ rows }: { rows: ProductSpecGroup["rows"] }) {
  return (
    <dl className="grid gap-0">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-baseline gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductSpecs({
  groups,
  title,
}: {
  groups: ProductSpecGroup[];
  title: string;
}) {
  if (groups.length === 0) return null;

  const named = groups.filter((group) => group.title.trim().length > 0);
  const useAccordion = named.length >= 2;

  return (
    <section className="grid max-w-3xl scroll-mt-24 gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>

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
                {group.title.trim() || title}
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
