import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/i18n/navigation";
import type { IconType } from "react-icons";

export default function AccountEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref = "/products",
}: {
  icon: IconType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
}) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
