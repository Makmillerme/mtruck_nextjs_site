import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductSpecGroup } from "@/lib/catalog/product-page";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5 text-sm">
      <span className="min-w-0 text-muted-foreground">{label}</span>
      <span className="shrink-0 text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

/**
 * Column-major: left column = first half (top→bottom), right = rest (top→bottom).
 * Order stays as in the data model / display group; no fixed cell count.
 */
/**
 * Adaptive 2-col table: left = first half (top→bottom), right = continuation.
 * Odd count → empty slot only at the bottom of the right column.
 */
function SpecRows({ rows }: { rows: ProductSpecGroup["rows"] }) {
  if (rows.length === 0) return null;

  const mid = Math.ceil(rows.length / 2);
  const left = rows.slice(0, mid);
  const right = rows.slice(mid);
  const rightPad = left.length - right.length;

  return (
    <div className="grid gap-x-10 md:grid-cols-2">
      <div className="min-w-0 divide-y divide-border/60">
        {left.map((row) => (
          <SpecRow key={row.id} label={row.label} value={row.value} />
        ))}
      </div>
      <div className="min-w-0 divide-y divide-border/60">
        {right.map((row) => (
          <SpecRow key={row.id} label={row.label} value={row.value} />
        ))}
        {Array.from({ length: rightPad }, (_, index) => (
          <div
            key={`pad-${index}`}
            className="pointer-events-none select-none py-2.5 text-sm opacity-0"
            aria-hidden
          >
            —
          </div>
        ))}
      </div>
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
