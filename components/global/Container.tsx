import { cn } from "@/lib/utils";

export const PAGE_SHELLS = [
  "home",
  "catalog",
  "product",
  "reading",
  "admin",
] as const;

export type PageShell = (typeof PAGE_SHELLS)[number];

export const pageShellClassName: Record<PageShell, string> = {
  home: "page-shell-home",
  catalog: "page-shell-catalog",
  product: "page-shell-product",
  reading: "page-shell-reading",
  admin: "page-shell-admin",
};

function Container({
  children,
  className,
  shell,
}: {
  children: React.ReactNode;
  className?: string;
  shell?: PageShell;
}) {
  return (
    <div
      className={cn(
        "page-container",
        shell ? pageShellClassName[shell] : null,
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
