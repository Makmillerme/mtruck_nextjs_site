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
  secondaryActionLabel,
  onSecondaryAction,
}: {
  icon: IconType;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
          {secondaryActionLabel && onSecondaryAction ? (
            <Button type="button" variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      </EmptyContent>
    </Empty>
  );
}
